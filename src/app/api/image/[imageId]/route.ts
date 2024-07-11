import { NextResponse } from "next/server";
import admin from "firebase-admin";

// 이미지를 삭제할 때
// 이미지 doc 하위에 있는 comments 컬렉션도 함께 삭제하려면
// admin sdk의 recursiveDelete를 사용해야함
export async function DELETE(
  req: Request,
  { params }: { params: { imageId: string } },
) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const fileName = searchParams.get("fileName");
  const imageId = params.imageId;

  if (!imageId || !uid || !fileName) {
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
