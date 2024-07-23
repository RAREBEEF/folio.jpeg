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
  const tags = searchParams
    .getAll("tag")
    .map((value) => decodeURIComponent(value));

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

    const imgDocRef = admin.firestore().collection("images").doc(imageId);
    const existTagsDocRef = admin.firestore().collection("tags").doc("data");

    // 태그 목록에서 개수 차감
    const decrementTags: { [key in string]: admin.firestore.FieldValue } = {};
    tags.forEach((tag) => {
      decrementTags["list." + tag] = admin.firestore.FieldValue.increment(-1);
    });

    const storageRef = admin
      .storage()
      .bucket()
      .file(`images/${uid}/${fileName}`);

    // 삭제
    await Promise.all([
      existTagsDocRef.update(decrementTags),
      admin.firestore().recursiveDelete(imgDocRef),
      storageRef.delete(),
    ]);

    return NextResponse.json({
      data: "Success",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: err,
      status: 500,
    });
  }
}
