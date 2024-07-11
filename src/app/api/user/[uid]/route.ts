import { NextResponse } from "next/server";
import admin from "firebase-admin";

// 다른 유저의 auth data를 불러오는 것은
// admin sdk로만 가능
export async function GET(
  req: Request,
  { params }: { params: { uid: string } },
) {
  const { uid } = params;

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
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const user = await admin.auth().getUser(uid);

    return NextResponse.json({
      data: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: null,
      error: err,
      status: 500,
    });
  }
}
