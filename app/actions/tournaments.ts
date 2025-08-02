"use server"

import { db } from "@/lib/firebase/server"
import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { storage } from "@/lib/firebase/server"

export async function getAllTournaments() {
  try {
    const snapshot = await db.collection("tournaments").orderBy("registration_start", "desc").get()
    return snapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>
      
      // Helper function to safely convert Firestore Timestamp to ISO string
      const toISOString = (timestamp: any) => {
        if (!timestamp) return null
        if (timestamp.toDate) return timestamp.toDate().toISOString()
        if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
        if (typeof timestamp === 'string') return timestamp
        return null
      }

      // Convert all date fields to ISO strings
      const serializedData: Record<string, any> = {
        id: doc.id,
        ...data,
        registration_start: toISOString(data.registration_start),
        registration_end: toISOString(data.registration_end),
        submission_deadline: toISOString(data.submission_deadline),
        result_date: toISOString(data.result_date),
        start_date: toISOString(data.start_date),
        end_date: toISOString(data.end_date),
        created_at: toISOString(data.created_at),
        updated_at: toISOString(data.updated_at),
        rank_generated: data.rank_generated || false,
        rank_generated_at: toISOString(data.rank_generated_at),
        certificates_generated: data.certificates_generated || false,
        certificates_generated_at: toISOString(data.certificates_generated_at),
        status: (() => {
          const now = new Date();
          const registrationStart = data.registration_start?.toDate?.() || new Date(data.registration_start);
          const registrationEnd = data.registration_end?.toDate?.() || new Date(data.registration_end);
          const submissionEnd = data.submission_deadline?.toDate?.() || new Date(data.submission_deadline);

          if (now < registrationStart) {
            return "coming_soon";
          } else if (now >= registrationStart && now <= registrationEnd) {
            return "open";
          } else if (now > registrationEnd && now <= submissionEnd) {
            return "submission_period";
          } else {
            return "closed";
          }
        })(),
      }

      // Remove any null values to keep the data clean
      Object.keys(serializedData).forEach(key => {
        if (serializedData[key] === null) {
          delete serializedData[key]
        }
      })

      return serializedData
    })
  } catch (error) {
    console.error("Error in getAllTournaments:", error)
    return []
  }
}

export const getTournaments = getAllTournaments

export async function getTournamentById(id: string) {
  try {
    const doc = await db.collection("tournaments").doc(id).get()
    if (!doc.exists) return null
    
    const data = doc.data() as Record<string, any>
    
    // Helper function to safely convert Firestore Timestamp to ISO string
    const toISOString = (timestamp: any) => {
      if (!timestamp) return null
      if (timestamp.toDate) return timestamp.toDate().toISOString()
      if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
      if (typeof timestamp === 'string') return timestamp
      return null
    }
    
    // Convert all date fields to ISO strings
    const serializedData: Record<string, any> = {
      id: doc.id,
      ...data,
      registration_start: toISOString(data.registration_start),
      registration_end: toISOString(data.registration_end),
      submission_deadline: toISOString(data.submission_deadline),
      result_date: toISOString(data.result_date),
      start_date: toISOString(data.start_date),
      end_date: toISOString(data.end_date),
      created_at: toISOString(data.created_at),
      updated_at: toISOString(data.updated_at),
      rank_generated: data?.rank_generated || false,
      rank_generated_at: toISOString(data?.rank_generated_at),
      certificates_generated: data?.certificates_generated || false,
      certificates_generated_at: toISOString(data?.certificates_generated_at),
      first_prize: data?.first_prize,
      second_prize: data?.second_prize,
      third_prize: data?.third_prize,
      mention_prize: data?.mention_prize,
      status: (() => {
        const now = new Date();
        const registrationStart = data.registration_start?.toDate?.() || new Date(data.registration_start);
        const registrationEnd = data.registration_end?.toDate?.() || new Date(data.registration_end);
        const submissionEnd = data.submission_deadline?.toDate?.() || new Date(data.submission_deadline);

        if (now < registrationStart) {
          return "coming_soon";
        } else if (now >= registrationStart && now <= registrationEnd) {
          return "open";
        } else if (now > registrationEnd && now <= submissionEnd) {
          return "submission_period";
        } else {
          return "closed";
        }
      })(),
    }

    // Remove any null values to keep the data clean
    Object.keys(serializedData).forEach(key => {
      if (serializedData[key] === null) {
        delete serializedData[key]
      }
    })

    return serializedData
  } catch (error) {
    console.error("Error in getTournamentById:", error)
    return null
  }
}

export async function fetchTournamentById(tournamentId: string) {
  try {
    const docRef = db.collection("tournaments").doc(tournamentId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) return null
    const data = docSnap.data()
    
    // Helper function to safely convert Firestore Timestamp to ISO string
    const toISOString = (timestamp: any) => {
      if (!timestamp) return null
      if (timestamp.toDate) return timestamp.toDate().toISOString()
      if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
      if (typeof timestamp === 'string') return timestamp
      return null
    }
    
    // Convert all date fields to ISO strings
    const serializedData = {
      id: docSnap.id,
      ...data,
      registration_start: toISOString(data?.registration_start),
      registration_end: toISOString(data?.registration_end),
      submission_deadline: toISOString(data?.submission_deadline),
      result_date: toISOString(data?.result_date),
      created_at: toISOString(data?.created_at),
      updated_at: toISOString(data?.updated_at),
      rank_generated: data?.rank_generated || false,
      rank_generated_at: toISOString(data?.rank_generated_at),
      certificates_generated: data?.certificates_generated || false,
      certificates_generated_at: toISOString(data?.certificates_generated_at),
      status: (() => {
          const now = new Date();
          const registrationStart = data?.registration_start?.toDate?.() || new Date(data?.registration_start);
          const registrationEnd = data?.registration_end?.toDate?.() || new Date(data?.registration_end);
          const submissionEnd = data?.submission_deadline?.toDate?.() || new Date(data?.submission_deadline);
          if (now < registrationStart) {
            return "coming_soon";
          } else if (now >= registrationStart && now <= registrationEnd) {
            return "open";
          } else if (now > registrationEnd && now <= submissionEnd) {
            return "submission_period";
          } else {
            return "closed";
          }
        })()
    }

    return serializedData
  } catch (error) {
    console.error("Failed to fetch tournament:", error)
    return null
  }
}

export async function getAllTournamentForUser() {
  try {
    const snapshot = await db.collection("tournaments").where("status", "==", "open").orderBy("registration_start", "desc").get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error in getTournamentById:", error)
    return null
  }
}

export async function getUserSubmissionForTournament(userId: string, tournamentId: string) {
  try {
    const snapshot = await db
      .collection("submissions")
      .where("user_id", "==", userId)
      .where("tournament_id", "==", tournamentId)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data()
    
    // Convert Firestore Timestamp to ISO string
    const serializedData = {
      id: doc.id,
      ...data,
      reviewed_at: data.reviewed_at?.toDate?.()?.toISOString() || null,
      created_at: data.created_at?.toDate?.()?.toISOString() || null,
      updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
      certificate_generated_at: data.certificate_generated_at?.toDate?.()?.toISOString() || null,
      rank_generated_at: data.rank_generated_at?.toDate?.()?.toISOString() || null,
    }

    return serializedData
  } catch (error) {
    console.error("Error in getUserSubmissionForTournament:", error)
    return null
  }
}

export async function getUserTournaments(userId: string) {
  try {
    const submissionsSnap = await db
      .collection("submissions")
      .where("user_id", "==", userId)
      .get()

    const tournamentIds = Array.from(new Set(submissionsSnap.docs.map(doc => doc.data().tournament_id)))

    if (tournamentIds.length === 0) return []

    const tournaments : any[] = await Promise.all(
      tournamentIds.map(async id => {
        const doc = await db.collection("tournaments").doc(id).get()
        return doc.exists ? { id: doc.id, ...doc.data() } : null
      })
    )

    return tournaments.filter(Boolean).sort((a, b) => {
      return (b?.registration_start?.toMillis?.() || 0) - (a?.registration_start?.toMillis?.() || 0)
    })
  } catch (error) {
    console.error("Error in getUserTournaments:", error)
    return []
  }
}

export async function registerForTournament(formData: FormData) {
  try {
    const tournamentId = formData.get("tournamentId") as string
    const userId = formData.get("userId") as string

    if (!tournamentId || !userId) {
      return { success: false, message: "Missing required fields" }
    }

    const existingSnap = await db
      .collection("submissions")
      .where("user_id", "==", userId)
      .where("tournament_id", "==", tournamentId)
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return {
        success: false,
        message: "You are already registered for this tournament",
      }
    }

    await db.collection("submissions").add({
      user_id: userId,
      tournament_id: tournamentId,
      status: "draft",
      title: "Draft Submission",
      description: "",
      created_at: Timestamp.now(),
    })

    revalidatePath("/dashboard/tournaments")

    return {
      success: true,
      message: "Successfully registered for tournament",
    }
  } catch (error) {
    console.error("Error in registerForTournament:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

export async function createTournament(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const categories = formData.getAll('categories[]') as string[];
  const ageCategory = formData.get('ageCategory') as string;
  const registrationStartDate = formData.get('registrationStartDate') as string;
  const registrationEndDate = formData.get('registrationEndDate') as string;
  const submissionEndDate = formData.get('submissionEndDate') as string;
  const resultDate = formData.get('resultDate') as string || null;
  const entryFee = parseFloat(formData.get('entryFee') as string);
  const firstPrize = formData.get('firstPrize') ? formData.get('firstPrize') as string : null;
  const secondPrize = formData.get('secondPrize') ? formData.get('secondPrize') as string : null;
  const thirdPrize = formData.get('thirdPrize') ? formData.get('thirdPrize') as string : null;
  const mentionPrize = formData.get('mentionPrize') ? formData.get('mentionPrize') as string : null;
  const files = formData.getAll('files') as File[];
  const status = registrationStartDate > new Date().toISOString() ? "coming_soon" : "open";

  if (!title || !description || !categories.length || !registrationStartDate || !registrationEndDate || !submissionEndDate || !entryFee || files.length === 0 || !ageCategory) {
    throw new Error('Missing required fields');
  }

  // Create Firestore document for tournament
  const tournamentRef = await db.collection('tournaments').add({
    title,
    description,
    categories,
    ageCategory,
    registration_start: Timestamp.fromDate(new Date(registrationStartDate)),
    registration_end: Timestamp.fromDate(new Date(registrationEndDate)),
    submission_deadline: Timestamp.fromDate(new Date(submissionEndDate)),
    result_date: resultDate ? Timestamp.fromDate(new Date(resultDate)) : null,
    entry_fee: entryFee,
    first_prize: firstPrize,
    second_prize: secondPrize,
    third_prize: thirdPrize,
    mention_prize: mentionPrize,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    status: status,
  });

  const tournamentId = tournamentRef.id;
  const bucket = storage.bucket();
  const bannerUrls: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `tournaments/${tournamentId}/${file.name}`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    await fileRef.makePublic();

    const [downloadUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    bannerUrls.push(downloadUrl);
  }

  await tournamentRef.update({
    banner_images: bannerUrls,
    image_url: bannerUrls[0],
  });

  return { tournamentId, bannerUrls };
}

export async function editTournament(tournamentId: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categories = formData.getAll('categories[]') as string[];
    const ageCategory = formData.get('ageCategory') as string;
    const registrationStartDate = formData.get('registrationStartDate') as string;
    const registrationEndDate = formData.get('registrationEndDate') as string;
    const submissionEndDate = formData.get('submissionEndDate') as string;
    const resultDate = formData.get('resultDate') as string || null;
    const entryFee = parseFloat(formData.get('entryFee') as string);
    const firstPrize = formData.get('firstPrize') ? formData.get('firstPrize') as string : null;
    const secondPrize = formData.get('secondPrize') ? formData.get('secondPrize') as string : null;
    const thirdPrize = formData.get('thirdPrize') ? formData.get('thirdPrize') as string : null;
    const mentionPrize = formData.get('mentionPrize') ? formData.get('mentionPrize') as string : null;
    const files = formData.getAll('files') as File[];

    if (!tournamentId || !title || !description || !categories.length || !registrationStartDate || !registrationEndDate || !submissionEndDate || !entryFee || !ageCategory) {
      throw new Error('Missing required fields');
    }

    const tournamentRef = db.collection('tournaments').doc(tournamentId);

    const updatedData: any = {
      title,
      description,
      categories,
      ageCategory,
      registration_start: Timestamp.fromDate(new Date(registrationStartDate)),
      registration_end: Timestamp.fromDate(new Date(registrationEndDate)),
      submission_deadline: Timestamp.fromDate(new Date(submissionEndDate)),
      result_date: resultDate ? Timestamp.fromDate(new Date(resultDate)) : null,
      entry_fee: entryFee,
      first_prize: firstPrize,
      second_prize: secondPrize,
      third_prize: thirdPrize,
      mention_prize: mentionPrize,
      updated_at: Timestamp.now(),
    };

    const bucket = storage.bucket();
    const bannerUrls: string[] = [];

    // Handle banner images if new files are uploaded
    if (files && files.length > 0 && files[0].name !== '') {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `tournaments/${tournamentId}/${file.name}`;
        const fileRef = bucket.file(filePath);

        await fileRef.save(buffer, {
          metadata: { contentType: file.type },
        });

        await fileRef.makePublic();

        const [downloadUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        });

        bannerUrls.push(downloadUrl);
      }

      updatedData.banner_images = bannerUrls;
      updatedData.image_url = bannerUrls[0];
    }

    await tournamentRef.update(updatedData);

    revalidatePath('/dashboard/tournaments');
    return { success: true, message: "Tournament updated successfully." };
  } catch (error) {
    console.error('Error editing tournament:', error);
    return { success: false, message: 'Failed to update tournament.' };
  }
}

export async function deleteTournament(tournamentId: string) {
  try {
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();

    if (!tournamentSnap.exists) {
      return { success: false, message: "Tournament not found." };
    }

    const data = tournamentSnap.data();
    const bannerImages: string[] = data?.banner_images || [];

    // Delete associated banner files from Firebase Storage
    const bucket = storage.bucket();
    for (const url of bannerImages) {
      const filePathMatch = url.match(/tournaments%2F(.+?)\?alt=media/);
      const pathFromUrl = filePathMatch ? decodeURIComponent(filePathMatch[1]) : null;
      if (pathFromUrl) {
        const file = bucket.file(`tournaments/${pathFromUrl}`);
        await file.delete().catch(err => {
          console.warn(`Failed to delete file ${pathFromUrl}:`, err.message);
        });
      }
    }

    // Delete Firestore document
    await tournamentRef.delete();

    revalidatePath("/dashboard/tournaments");
    return { success: true, message: "Tournament deleted successfully." };
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return { success: false, message: "Failed to delete tournament." };
  }
}


export async function closeTournament(tournamentId: string) {
  try {
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();

    if (!tournamentSnap.exists) {
      return { success: false, message: "Tournament not found." };
    }

    // Delete Firestore document
    await tournamentRef.update({
      registration_end: Timestamp.now(),
      submission_deadline: Timestamp.now(),
      status: "closed",
    });

    revalidatePath("/dashboard/tournaments");
    return { success: true, message: "Tournament closed successfully." };
  } catch (error) {
    console.error("Error closing tournament:", error);
    return { success: false, message: "Failed to close tournament." };
  }
}

