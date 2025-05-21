// In your file upload service/action
import { getStorage } from 'firebase-admin/storage';

export async function uploadSubmissionFiles(
  files: File[], 
  tournamentId: string, 
  submissionId: string
) {
  const bucket = getStorage().bucket();
  const fileUrls: string[] = [];
  
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

      // Get download URL
      const [downloadUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future date
      });

      fileUrls.push(downloadUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  return fileUrls; // Return array of download URLs
}