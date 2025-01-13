
//import "server-only";
import * as admin from "firebase-admin"
import { format } from "path";

let app: admin.app.App;

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface updateUserData {
  email: string;
  password: string;
}

// Helper function to format the private key
function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

// Function to create the Firebase Admin app
export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  // Check if Firebase Admin app is already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Format the private key
  const privateKey = formatPrivateKey(params.privateKey);

  // Create a new Firebase Admin app
  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
  });
}

// Function to initialize Firebase Admin
export async function initAdmin() {
  if (!admin.apps.length) {
    const params = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") as string,
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(params),
    });
  } else {
    app = admin.app();
  }
  return app;
}

// Function to get documents from Firestore
export const getDocument = async () => {
  try {
    if (!admin.apps.length) {
      await initAdmin();
    }

    const firestore = admin.firestore();
    const usersRef = firestore.collection("vouchers");
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log("No documents found in the 'vouchers' collection.");
      return { message: "No documents found" };
    }

    const documents = snapshot.docs.map((doc) => ({
        Description: doc.data().Description,
        ExpiryDate: doc.data().ExpiryDate,
        VoucherID: doc.data().VoucherID,
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching documents from Firestore:", error);
    throw new Error("Failed to fetch documents");
  }
};

// Function to update a user based on provided parameters
export const updateUser = async (uid: string, updateData: updateUserData) => {
  try {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      await initAdmin();
    }

    const auth = admin.auth();
    const userRecord = await auth.updateUser(uid, updateData);
    console.log("Successfully updated user:", userRecord.toJSON());

    return { message: "User successfully updated", userRecord: userRecord.toJSON() };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};
