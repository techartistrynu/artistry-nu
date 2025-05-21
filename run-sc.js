const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const admin = require("firebase-admin");

// Replace with the path to your Firebase service account key
const serviceAccount = require("./service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Change this to your desired collection name
const COLLECTION_NAME = "submissions";

const filePath = path.join(__dirname, "submissions_rows.csv");

const rows = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", async () => {
    console.log(`Parsed ${rows.length} rows`);

    for (const row of rows) {
      try {
        // Optional: Transform fields if needed (like parsing dates/numbers)
        await db.collection(COLLECTION_NAME).doc(row.id).set(row);
        console.log("Inserted:", row.title || JSON.stringify(row));
      } catch (err) {
        console.error("Error inserting row:", err);
      }
    }

    console.log("Import complete");
  });
