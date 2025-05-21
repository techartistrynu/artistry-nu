// pages/api/findOrCreateUser.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase/server'; // Your Firebase Admin config
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Validate request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, image } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 2. Use Admin SDK to bypass security rules
    const userEmail = email.trim().toLowerCase();
    const usersRef = db.collection('users');
    
    // Query with Admin privileges
    const snapshot = await usersRef.where('email', '==', userEmail).get();

    if (!snapshot.empty) {
      const existingUser = snapshot.docs[0];
      return res.json({
        id: existingUser.id,
        ...existingUser.data()
      });
    }

    // Create new user
    const newUserId = uuidv4();
    await usersRef.doc(newUserId).set({
      id: newUserId,
      email: userEmail,
      name: name || '',
      image: image || '',
      createdAt: FieldValue.serverTimestamp()
    });

    res.json({
      id: newUserId,
      email: userEmail,
      name,
      image,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin SDK error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}