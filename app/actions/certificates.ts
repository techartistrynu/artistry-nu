// app/actions/certificates.ts
"use server"

import { db, storage } from "@/lib/firebase/server"
import { ref, getDownloadURL, FirebaseStorage } from "firebase/storage"
import { CertificateTemplate } from "@/components/certificate-template"
import { pdf, Document, } from '@react-pdf/renderer'
import { FieldValue } from "firebase-admin/firestore";
import React from 'react'
import { getStorage } from "firebase-admin/storage"

interface Submission {
  id: string;
  score?: number;
  date_of_birth?: string;
  applicant_name?: string;
}

// Helper to fetch related documents
async function enrichCertificate(cert: any) {
  const [tournamentSnap, submissionSnap, userSnap] = await Promise.all([
    cert.tournament_id ? db.collection("tournaments").doc(cert.tournament_id).get() : null,
    cert.submission_id ? db.collection("submissions").doc(cert.submission_id).get() : null,
    cert.user_id ? db.collection("users").doc(cert.user_id).get() : null,
  ])

  // Convert timestamps to ISO strings
  const toISOString = (timestamp: any) => {
    if (!timestamp) return null
    if (timestamp.toDate) return timestamp.toDate().toISOString()
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
    if (typeof timestamp === 'string') return timestamp
    return null
  }

  return {
    ...cert,
    issue_date: toISOString(cert.issue_date),
    tournaments: {...tournamentSnap?.data(), created_at: toISOString(tournamentSnap?.data()?.created_at)},
    submissions: {...submissionSnap?.data(), created_at: toISOString(submissionSnap?.data()?.created_at)},
    user: {...userSnap?.data(), created_at: toISOString(userSnap?.data()?.created_at)},
  }
}

export async function getUserCertificates(userId: string) {
  try {
    const snapshot = await db
      .collection("certificates")
      .where("user_id", "==", userId)
      .orderBy("issue_date", "desc")
      .get()

    const rawCerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), issue_date: doc.data()?.issue_date?.toDate?.().toISOString() }))
    const certsWithDetails = await Promise.all(rawCerts.map(enrichCertificate))

    return certsWithDetails
  } catch (error) {
    console.error("Error in getUserCertificates:", error)
    return []
  }
}

export const getCertificatesByUserId = getUserCertificates

export async function getCertificateById(id: string) {
  try {
    const certSnap = await db.collection("certificates").doc(id).get()

    if (!certSnap.exists) {
      return null
    }

    const cert = { id: certSnap.id, ...certSnap.data() }
    return await enrichCertificate(cert)
  } catch (error) {
    console.error("Error in getCertificateById:", error)
    return null
  }
}

export async function downloadCertificate(id: string) {
  try {
    const cert = await getCertificateById(id)
    if (!cert || !cert.file_path) {
      return {
        success: false,
        message: "Certificate not found"
      }
    }

    const downloadUrl = await getDownloadUrl(cert.file_path)
    return {
      success: true,
      url: downloadUrl,
      fileName: `certificate_${cert.tournament?.title || 'competition'}_${cert.user?.name || 'user'}.pdf`
    }
  } catch (error) {
    console.error("Error in downloadCertificate:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

export async function generateCertificateForSubmission(submissionId: string) {
  try {
    // Get submission data
    const submissionSnap = await db.collection("submissions").doc(submissionId).get()
    if (!submissionSnap.exists) {
      return { success: false, message: "Submission not found" }
    }

    const submission = submissionSnap.data()
    if (!submission?.score || !submission?.rank) {
      return { success: false, message: "Submission not scored or ranked" }
    }

    // Get tournament data
    const tournamentSnap = await db.collection("tournaments").doc(submission?.tournament_id).get()
    if (!tournamentSnap.exists) {
      return { success: false, message: "Tournament not found" }
    }

    const tournament = tournamentSnap.data()

    // Check if certificate already exists
    const existingCertSnap = await db.collection("certificates")
      .where("submission_id", "==", submissionId)
      .limit(1)
      .get()

    if (!existingCertSnap.empty) {
      const existingCert = existingCertSnap.docs[0].data()
      return {
        success: true,
        message: "Certificate already exists",
        certificateId: existingCertSnap.docs[0].id,
        downloadUrl: existingCert.file_url
      }
    }

    // Generate PDF
    const certificateData = {
      name: submission?.applicant_name || "Participant",
      score: submission?.score?.toFixed(2) || "0.00",
      rank: submission?.rank?.toString() || "0",
      tournamentTitle: tournament?.title || "Tournament"
    }

    const pdfDoc = await pdf(
      React.createElement(Document, {},
        React.createElement(CertificateTemplate, certificateData)
      )
    );
    const pdfBlob = await pdfDoc.toBlob();
    const buffer = await pdfBlob.arrayBuffer();

    // Upload to storage
    const filePath = `certificates/${submission?.tournament_id}/${submissionId}.pdf`
    const adminStorage = getStorage()
    const bucket = adminStorage.bucket()
    const file = bucket.file(filePath)
    await file.save(Buffer.from(buffer), { contentType: 'application/pdf' })
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' })
    const downloadUrl = url

    // Create certificate record
    const certData = {
      user_id: submission?.user_id,
      tournament_id: submission?.tournament_id,
      submission_id: submissionId,
      file_path: filePath,
      file_url: downloadUrl,
      issue_date: new Date().toISOString(),
      score: submission?.score,
      rank: submission?.rank,
      status: "active"
    }

    const certRef = await db.collection("certificates").add(certData)

    return {
      success: true,
      certificateId: certRef.id,
      downloadUrl,
      message: "Certificate generated successfully"
    }
  } catch (error) {
    console.error("Error in generateCertificateForSubmission:", error)
    return {
      success: false,
      message: "Failed to generate certificate"
    }
  }
}

export async function generateCertificatesForTournament(tournamentId: string) {
  try {
    const submissionsSnap = await db
      .collection("submissions")
      .where("tournament_id", "==", tournamentId)
      .where("score", "!=", null)
      .orderBy("score", "desc")
      .get();

    if (submissionsSnap.empty) {
      return { success: false, message: "No ranked submissions found for this tournament" };
    }

    const tournamentSnap = await db.collection("tournaments").doc(tournamentId).get();
    if (!tournamentSnap.exists) {
      return { success: false, message: "Tournament not found" };
    }

    const tournament = tournamentSnap.data();
    const batch = db.batch();
    const results = [];

    let generatedCount = 0;
    let existingCount = 0;
    let failedCount = 0;

    for (const doc of submissionsSnap.docs) {
      const submission = doc.data();
      const submissionRef = db.collection("submissions").doc(doc.id);

      if (submission.certificate_url) {
        existingCount++;
        results.push({
          submissionId: doc.id,
          status: "exists",
          certificateUrl: submission.certificate_url,
        });
        continue;
      }

      try {
        const certificateData = {
          name: submission.applicant_name || "Participant",
          score: submission.score?.toFixed(2) || "0.00",
          rank: submission.rank?.toString() || "0",
          tournamentTitle: tournament?.title || "Tournament",
        };

        // Generate PDF as buffer
        const document = CertificateTemplate(certificateData);
        const buffer = await pdf(document).toBuffer();
        // const buffer = await pdf(<CertificateTemplate {...certificateData} />).toBuffer();

        // Upload to Firebase Storage (Admin SDK)
        const filePath = `certificates/${tournamentId}/${doc.id}.pdf`;
        const storage = getStorage();
        const bucket = storage.bucket();
        const file = bucket.file(filePath);

        await file.save(buffer, { contentType: "application/pdf" });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });

        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
        const day = new Date().getDate().toString().padStart(2, "0");
        const rankNumber = submission?.rank?.toString().padStart(4, "0");

        const certData = {
          certificate_number: `ANUCERT${year}${month}${day}-${tournamentId.slice(-6).toUpperCase()}${rankNumber}`,
          user_id: submission.user_id,
          tournament_id: tournamentId,
          submission_id: doc.id,
          file_path: filePath,
          file_url: url,
          issue_date: FieldValue.serverTimestamp(),
          score: submission.score,
          rank: submission.rank,
          status: "active",
        };

        const certRef = db.collection("certificates").doc();
        batch.set(certRef, certData);

        batch.update(submissionRef, {
          certificate_url: url,
          certificate_generated: true,
          certificate_generated_at: FieldValue.serverTimestamp(),
        });

        generatedCount++;
        results.push({
          submissionId: doc.id,
          status: "created",
          certificateUrl: url,
          certificateId: certRef.id,
        });
      } catch (error) {
        console.error(`Error generating certificate for submission ${doc.id}:`, error);
        failedCount++;
        results.push({
          submissionId: doc.id,
          status: "failed",
          message: "Failed to generate certificate",
        });
      }
    }

    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    batch.update(tournamentRef, { 
      certificates_generated: true,
      certificates_generated_at: FieldValue.serverTimestamp() 
    });
    
    if (generatedCount > 0) {
      await batch.commit();
    }

    return {
      success: true,
      generatedCount,
      existingCount,
      failedCount,
      results,
      message: `Successfully generated ${generatedCount} certificates. ${existingCount} already existed.`,
    };
  } catch (error) {
    console.error("Error in generateCertificatesForTournament:", error);
    return {
      success: false,
      message: "Failed to generate certificates for tournament",
    };
  }
}

export async function getDownloadUrl(filePath: string) {
  try {
    const storageRef = ref(storage as unknown as FirebaseStorage, filePath)
    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error("Error getting download URL:", error)
    return null
  }
}

export async function revokeCertificate(certificateId: string) {
  try {
    await db.collection("certificates").doc(certificateId).update({
      status: "revoked",
      revoked_at: new Date().toISOString()
    })
    return { success: true, message: "Certificate revoked successfully" }
  } catch (error) {
    console.error("Error revoking certificate:", error)
    return { success: false, message: "Failed to revoke certificate" }
  }
}

export async function generateRanksForTournament(tournamentId: string) {
  try {
    const submissionsSnap = await db.collection("submissions")
      .where("tournament_id", "==", tournamentId)
      .where("score", "!=", null)
      .get();

    if (submissionsSnap.empty) {
      return { success: false, message: "No scored submissions found for this tournament" };
    }

    const submissions = submissionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const sortedSubmissions = [...submissions].sort((a, b) => {
      if (a?.score !== b?.score) return b.score - a.score;

      const dateA = new Date(a?.date_of_birth);
      const dateB = new Date(b?.date_of_birth);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime(); // earlier DOB gets higher rank
      }

      return (a?.applicant_name || '').localeCompare(b?.applicant_name || '');
    });

    const batch = db.batch();

    sortedSubmissions.forEach((sub, index) => {
      const submissionRef = db.collection("submissions").doc(sub.id);
      const rank = index + 1; // Unique rank always
      batch.update(submissionRef, { rank });
    });

    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    batch.update(tournamentRef, { 
      rank_generated: true,
      rank_generated_at: FieldValue.serverTimestamp() 
    });

    await batch.commit();

    return { 
      success: true, 
      message: "Ranks generated successfully",
      totalRanked: sortedSubmissions.length
    };
  } catch (error) {
    console.error("Error generating ranks:", error);
    return {
      success: false,
      message: "Failed to generate ranks"
    };
  }
}
