import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const data = await req.json();
  const { imageId, uid, fileName } = data;

  if (!imageId || !uid || !fileName) {
    return NextResponse.json({ data: "Missing image ID", status: 400 });
  }

  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      privateKey: process.env.PRIVATE_KEY,
      clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // firestore
    const firestoreRef = admin.firestore().collection("images").doc(imageId);
    // storage
    const storageRef = admin
      .storage()
      .bucket()
      .file(`images/${uid}/${fileName}`);

    // 삭제
    await Promise.all([
      admin.firestore().recursiveDelete(firestoreRef),
      storageRef.delete(),
    ]);

    return NextResponse.json({
      data: "Suscces",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: err,
      status: 500,
    });
  }
}
