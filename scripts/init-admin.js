require('dotenv').config({ path: '.env' });

const admin = require("firebase-admin");
const { hash } = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

async function initializeAdmin() {
  try {
    console.log("Initializing admin database...");

    // Default admin credentials
    const defaultAdmin = {
      email: "admin@artistrynu.com",
      password: "admin123",
      name: "System Administrator",
      role: "super-admin"
    };

    // Check if admin already exists
    const adminsRef = db.collection("admin_credentials");
    const querySnapshot = await adminsRef.where("email", "==", defaultAdmin.email).get();

    if (!querySnapshot.empty) {
      console.log("Admin account already exists!");
      return;
    }

    // Hash password
    const passwordHash = await hash(defaultAdmin.password, 12);
    
    const adminId = uuidv4();
    const now = new Date();
    
    const adminData = {
      id: adminId,
      email: defaultAdmin.email,
      passwordHash,
      name: defaultAdmin.name,
      role: defaultAdmin.role,
      createdAt: now,
      updatedAt: now
    };

    await adminsRef.doc(adminId).set(adminData);

    console.log("✅ Admin account created successfully!");
    console.log("Email:", defaultAdmin.email);
    console.log("Password:", defaultAdmin.password);
    console.log("Role:", defaultAdmin.role);

  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  } finally {
    process.exit(0);
  }
}

initializeAdmin(); 