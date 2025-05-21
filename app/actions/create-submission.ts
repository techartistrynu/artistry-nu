// app/actions/submitArtwork.ts
'use server';

import { db, storage } from '@/lib/firebase/server';
import { format } from 'date-fns';

type UpdatePaymentParams = {
  submissionId: string
  paymentData: {
    paid_amount: number
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  },
  tournamentId: string
  userId: string
}

export async function updatePaymentDetails({ submissionId, paymentData, tournamentId, userId }: UpdatePaymentParams) {
  try {
    const ref = db.collection("submissions").doc(submissionId)
    await ref.update({
      payment_status: "paid",
      paid_amount: paymentData.paid_amount,
      razorpay_payment_id: paymentData.razorpay_payment_id,
    })

    await db.collection('payments').add({
      submission_id: submissionId,
      tournament_id: tournamentId,
      user_id: userId,
      payment_date: new Date(),
      payment_method: 'razorpay',
      payment_status: 'paid',
      paid_amount: paymentData.paid_amount,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature,
    })

    return { success: true }
  } catch (error) {
    console.error("Payment update error:", error)
    return { success: false, error: "Failed to update payment details" }
  }
}

export async function submitArtwork(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const applicantName = formData.get('applicantName') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const tournamentId = formData.get('tournamentId') as string;
  const userId = formData.get('userId') as string;
  const files = formData.getAll('files') as File[];

  // Validate required fields
  if (!title || !description || !applicantName || !dateOfBirth || !tournamentId || files.length === 0 || !userId) {
    throw new Error('Missing required fields');
  }

  // Create a new submission document
  const submissionRef = await db.collection('submissions').add({
    title,
    description,
    applicant_name: applicantName,
    date_of_birth: format(new Date(dateOfBirth), 'yyyy-MM-dd'),
    phone_number: phoneNumber,
    tournament_id: tournamentId,
    status: 'pending',
    payment_status: 'unpaid',
    user_id: userId,
    created_at: new Date(),
  });

  const submissionId = submissionRef.id;
  const fileUrls: string[] = [];

  // Upload files to Firebase Storage
  const bucket = storage.bucket();
  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = `submissions/${tournamentId}/${submissionId}/${file.name}`;
      const fileRef = bucket.file(filePath);

      // Upload the file
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Make file publicly accessible (optional)
      await fileRef.makePublic();

      // Get download URL
      const [downloadUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future date
      });

      fileUrls.push(downloadUrl);

      // Add file metadata to Firestore
      await db.collection('submission_files').add({
        submission_id: submissionId,
        file_name: file.name,
        file_path: filePath,
        file_url: downloadUrl, // Store the download URL
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date(),
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload artwork files');
    }
  }

  // Update submission with primary image URL (first file)
  if (fileUrls.length > 0) {
    await submissionRef.update({
      imageUrl: fileUrls[0]
    });
  }

  return { submissionId, fileUrls };
}