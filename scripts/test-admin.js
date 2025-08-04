require('dotenv').config({ path: '.env' });

const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function testAdmin() {
  try {
    console.log("🔍 Testing admin account...");

    const adminEmail = "admin@artistrynu.com";
    const adminsRef = db.collection("admin_credentials");
    const querySnapshot = await adminsRef.where("email", "==", adminEmail).get();

    console.log("Query result - empty:", querySnapshot.empty, "size:", querySnapshot.size);

    if (querySnapshot.empty) {
      console.log("❌ No admin account found with email:", adminEmail);
      console.log("💡 Run 'npm run init-admin-simple' to create the admin account");
    } else {
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();
      console.log("✅ Admin account found:");
      console.log("   ID:", adminData.id);
      console.log("   Email:", adminData.email);
      console.log("   Name:", adminData.name);
      console.log("   Role:", adminData.role);
      console.log("   Created:", adminData.createdAt);
      console.log("   Updated:", adminData.updatedAt);
      console.log("   Last Login:", adminData.lastLoginAt || "Never");
    }

  } catch (error) {
    console.error("❌ Error testing admin:", error.message);
  } finally {
    process.exit(0);
  }
}

testAdmin(); 