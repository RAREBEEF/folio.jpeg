import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function DELETE(
  req: Request,
  { params }: { params: { uid: string } },
) {
  const { searchParams } = new URL(req.url);
  const uid = params.uid;
  const tokens = searchParams.getAll("token");

  console.log(uid, tokens);

  if (!uid || !tokens || tokens.length <= 0) {
    return NextResponse.json({ data: "Missing target data", status: 400 });
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

    console.log(uid, tokens);
    // const userDeviceDocRef = admin
    //   .firestore()
    //   .collection("device")
    //   .doc(uid);

    // const updateData = tokens.reduce(
    //   (acc, cur) => {
    //     acc[cur] = admin.firestore.FieldValue.delete();
    //     return acc;
    //   },
    //   {} as { [token in string]: admin.firestore.FieldValue },
    // );

    // return userDeviceDocRef.update(updateData);

    return NextResponse.json({
      data: "success",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: err,
      status: 500,
    });
  }
}
