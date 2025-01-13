import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocument } from '@/firebase/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const documents = await getDocument();
    return res.status(200).json(documents);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
}


