import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUser } from '@/firebase/firebaseAdmin'; // Ensure this points to the correct location of your updateUser function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { uid, updateData } = req.body;

  if (!uid || !updateData) {
    return res.status(400).json({ message: 'Both uid and updateData are required' });
  }

  try {
    const result = await updateUser(uid, updateData);
    return res.status(200).json({
      message: 'User successfully updated',
      userRecord: result,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}
