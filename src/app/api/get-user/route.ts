import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const data = await req.json();
  const { uid } = data;

  if (!uid) {
    return NextResponse.json({ data: "Missing UID", status: 400 });
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

    const user = await admin.auth().getUser(data.uid);

    return NextResponse.json({
      data: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: "Faild to get user data",
      status: 500,
    });
  }
}
