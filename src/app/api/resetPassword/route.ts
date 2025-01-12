// import { NextRequest, NextResponse } from 'next/server';
// import * as admin from 'firebase-admin';

// // Initialize Firebase Admin SDK
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//   });
// }

// // POST request to reset a user's password
// export async function POST(request: NextRequest) {
//   try {
//     const { targetUid, newPassword } = await request.json();

//     if (!targetUid || !newPassword) {
//       return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//     }

//     // Update the user's password
//     await admin.auth().updateUser(targetUid, {
//       password: newPassword,
//     });

//     return NextResponse.json({ message: 'Password reset successfully' });
//   } catch (error) {
//     return NextResponse.json({ error: error}, { status: 500 });
//   }
// }
