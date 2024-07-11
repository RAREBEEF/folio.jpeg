import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const data = await req.json();
  const {
    title,
    body,
    profileImage,
    targetImage,
    icon,
    click_action,
    fcmTokens,
    tokenPath,
    myToken,
    myUid,
    uids,
  }: {
    title: string;
    body: string;
    profileImage: string;
    targetImage: string | null;
    icon: string;
    click_action: string;
    fcmTokens: Array<string> | undefined | null;
    tokenPath: string | undefined | null;
    uids: Array<string> | undefined | null;
    myToken: string | null;
    myUid: string | null;
  } = data;

  // title은 푸시의 메인 내용에 해당하는 부분.
  if (!title) {
    return NextResponse.json({ data: "Missing content", status: 400 });
    // 토큰과 uid가 없으면 알림을 보낼 수 없다.
  } else if (!fcmTokens && !tokenPath && !uids) {
    return NextResponse.json({ data: "Missing token and uid", status: 400 });
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

    //
    // 인앱 notification 보내기
    //
    const createdAt = Date.now();
    const inappNotificationData = {
      title,
      body,
      createdAt,
      profileImage,
      targetImage,
      URL: click_action,
    };

    const uidList = uids ? uids.filter((uid) => uid !== myUid) : [];

    const sendInappNotifications = uidList.map(async (uid) => {
      return await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("notification")
        .doc("data")
        .update({
          list: admin.firestore.FieldValue.arrayUnion(inappNotificationData),
        });
    });

    //
    // fcm 보내기
    //
    // 토큰 로드
    let tokenList: Array<string> = [];

    // 토큰 자체를 전달받은 경우 해당 토큰에 푸시 전송
    if (fcmTokens) {
      tokenList = fcmTokens.filter((token: string) => token !== myToken);
      // 토큰 경로를 전달받은 경우 해당 경로에서 토큰을 불러온다.
    } else if (tokenPath) {
      let docRef: admin.firestore.DocumentReference<
        admin.firestore.DocumentData,
        admin.firestore.DocumentData
      > | null = null;

      // 전달받은 string 경로를 /로 끊어서 배열로 저장
      const pathSplit = tokenPath.split("/");

      // 경로 배열이 2인 경우의 docRef(이미지와 유저 데이터 등에 해당)
      if (pathSplit.length === 2) {
        docRef = admin.firestore().collection(pathSplit[0]).doc(pathSplit[1]);
        // 경로 배열이 4인 경우의 docRef(이미지의 댓글 데이터 등에 해당)
      } else if (pathSplit.length === 4) {
        docRef = admin
          .firestore()
          .collection(pathSplit[0])
          .doc(pathSplit[1])
          .collection(pathSplit[2])
          .doc(pathSplit[3]);
      }

      if (!docRef) {
        return NextResponse.json({
          data: null,
          error: "Invalid token path",
          status: 500,
        });
      } else {
        const docSnap = await docRef.get();
        const data = docSnap.data();

        // 불러온 토큰 데이터는 배열일 수도, 문자열일 수도 있다.
        const fcmTokens: Array<string> | undefined = data?.fcmTokens.filter(
          (token: string) => token !== myToken, // 내 토큰 제외
        );
        const fcmToken: string | undefined =
          data?.fcmToken === myToken ? undefined : data?.fcmToken;

        if (fcmTokens) {
          tokenList = fcmTokens;
        } else if (fcmToken) {
          tokenList = [fcmToken];
        } else {
          // 데이터에 토큰이 없는 경우
          return NextResponse.json({
            data: null,
            error: "Invalid token path",
            status: 500,
          });
        }
      }
    }
    const notificationData = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        click_action: click_action,
        image: profileImage,
        icon,
      },
      tokens: tokenList,
    };

    const res = await Promise.all([
      admin.messaging().sendEachForMulticast(notificationData),
      ...sendInappNotifications,
    ]).catch((error) => {
      return NextResponse.json({
        data: "Faild to send fcm.",
        error,
        status: 500,
      });
    });

    return NextResponse.json({
      data: { notificationData, res },
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      data: "Faild to send fcm.",
      status: 500,
    });
  }
}
