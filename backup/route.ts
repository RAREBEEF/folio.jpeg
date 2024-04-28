import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const data = await req.json();
  const { uid, file, fileName } = data;
  if (!uid) return;

  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
      clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        data: "Faild to cert." + error,
      },
      { status: 500 },
    );
  }

  try {
    const bucket = getStorage().bucket("folio-jpeg.appspot.com");
    const filePath = bucket.file(`images/${uid}/${fileName}`);
    await filePath.save(file);

    return NextResponse.json(
      {
        data: "upload complte.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: "Faild to upload." + error,
      },
      { status: 500 },
    );
  }
};
