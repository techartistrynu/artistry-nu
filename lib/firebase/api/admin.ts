import { db } from "@/lib/firebase/server";
import { hash, compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export interface AdminCredential {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "super-admin";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<AdminCredential | null> {
  try {
    console.log("verifyAdminCredentials called with email:", email)
    const adminEmail = email.trim().toLowerCase();
    console.log("Normalized email:", adminEmail)
    
    const adminsRef = db.collection("admin_credentials");
    console.log("Querying admin_credentials collection...")
    const querySnapshot = await adminsRef.where("email", "==", adminEmail).get();

    console.log("Query result - empty:", querySnapshot.empty, "size:", querySnapshot.size)

    if (querySnapshot.empty) {
      console.log("No admin found with email:", adminEmail)
      return null;
    }

    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data() as AdminCredential;
    console.log("Admin data found:", { id: adminData.id, email: adminData.email, role: adminData.role })

    console.log("Comparing passwords...")
    const isPasswordValid = await compare(password, adminData.passwordHash);
    console.log("Password valid:", isPasswordValid)
    
    if (!isPasswordValid) {
      console.log("Password validation failed")
      return null;
    }

    console.log("Password valid, updating last login time...")
    // Update last login time
    await adminDoc.ref.update({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Admin verification successful")
    return {
      ...adminData,
      lastLoginAt: new Date()
    };
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return null;
  }
}

export async function createAdminAccount(
  email: string, 
  password: string, 
  name: string, 
  role: "admin" | "super-admin" = "admin"
): Promise<AdminCredential> {
  try {
    const adminEmail = email.trim().toLowerCase();
    
    // Check if admin already exists
    const adminsRef = db.collection("admin_credentials");
    const querySnapshot = await adminsRef.where("email", "==", adminEmail).get();

    if (!querySnapshot.empty) {
      throw new Error("Admin account already exists with this email");
    }

    // Hash password
    const passwordHash = await hash(password, 12);
    
    const adminId = uuidv4();
    const now = new Date();
    
    const adminData: AdminCredential = {
      id: adminId,
      email: adminEmail,
      passwordHash,
      name,
      role,
      createdAt: now,
      updatedAt: now
    };

    await adminsRef.doc(adminId).set(adminData);

    return adminData;
  } catch (error) {
    console.error("Error creating admin account:", error);
    throw error;
  }
}

export async function updateAdminPassword(adminId: string, newPassword: string): Promise<void> {
  try {
    const adminsRef = db.collection("admin_credentials");
    const adminDoc = await adminsRef.doc(adminId).get();

    if (!adminDoc.exists) {
      throw new Error("Admin account not found");
    }

    const passwordHash = await hash(newPassword, 12);
    
    await adminDoc.ref.update({
      passwordHash,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
}

export async function updateAdminPasswordByEmail(email: string, currentPassword: string, newPassword: string): Promise<void> {
  try {
    const adminEmail = email.trim().toLowerCase();
    
    // First verify the current password
    const admin = await verifyAdminCredentials(adminEmail, currentPassword);
    
    if (!admin) {
      throw new Error("Current password is incorrect");
    }

    // Update the password
    await updateAdminPassword(admin.id, newPassword);
  } catch (error) {
    console.error("Error updating admin password by email:", error);
    throw error;
  }
}

export async function getAdminById(adminId: string): Promise<AdminCredential | null> {
  try {
    const adminsRef = db.collection("admin_credentials");
    const adminDoc = await adminsRef.doc(adminId).get();

    if (!adminDoc.exists) {
      return null;
    }

    return adminDoc.data() as AdminCredential;
  } catch (error) {
    console.error("Error getting admin by ID:", error);
    return null;
  }
}

export async function getAllAdmins(): Promise<AdminCredential[]> {
  try {
    const adminsRef = db.collection("admin_credentials");
    const querySnapshot = await adminsRef.get();

    return querySnapshot.docs.map(doc => doc.data() as AdminCredential);
  } catch (error) {
    console.error("Error getting all admins:", error);
    return [];
  }
}

export async function deleteAdminAccount(adminId: string): Promise<void> {
  try {
    const adminsRef = db.collection("admin_credentials");
    const adminDoc = await adminsRef.doc(adminId).get();

    if (!adminDoc.exists) {
      throw new Error("Admin account not found");
    }

    await adminDoc.ref.delete();
  } catch (error) {
    console.error("Error deleting admin account:", error);
    throw error;
  }
} 