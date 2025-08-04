// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const admin = require("firebase-admin");
const { hash } = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Check if required environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these variables in your .env.local file or export them in your terminal.');
  process.exit(1);
}

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

async function initializeAdmin() {
  try {
    console.log("🔄 Initializing admin database...");

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
      console.log("ℹ️  Admin account already exists!");
      console.log("Email:", defaultAdmin.email);
      console.log("Password:", defaultAdmin.password);
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
    console.log("📧 Email:", defaultAdmin.email);
    console.log("🔑 Password:", defaultAdmin.password);
    console.log("👤 Role:", defaultAdmin.role);
    console.log("\n🚀 You can now log in at /admin/login");

  } catch (error) {
    console.error("❌ Error initializing admin:", error.message);
    if (error.code === 'permission-denied') {
      console.error("💡 Make sure your Firebase service account has the necessary permissions.");
    }
  } finally {
    process.exit(0);
  }
}

initializeAdmin(); 