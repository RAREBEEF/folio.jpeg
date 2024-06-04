import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const data = await req.json();
  const { imageId } = data;

  if (!imageId) {
    return NextResponse.json({ data: "Missing image ID", status: 400 });
  }

  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
      clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const ref = admin.firestore().collection("images").doc(imageId);
    await admin.firestore().recursiveDelete(ref);

    return NextResponse.json({
      data: "Suscces",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: "Faild",
      status: 500,
    });
  }
}
