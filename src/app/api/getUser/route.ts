// src/app/api/getUser/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../firebase/firebaseAdmin'; // Adjust path if necessary

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid');

  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'Invalid UID parameter' }, { status: 400 });
  }

  try {
    const user = await admin.auth().getUser(uid);
    return NextResponse.json(user.toJSON());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
