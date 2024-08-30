import { NextResponse } from "next/server";
import admin from "firebase-admin";
import _ from "lodash";

export async function POST(req: Request) {
  const data = await req.json();
  const {
    title,
    body,
    profileImage,
    targetImage,
    icon,
    click_action,
    uids,
    sender,
    type,
    subject,
  }: {
    title: string;
    body: string;
    profileImage: string;
    targetImage: string | null;
    icon: string;
    click_action: string;
    uids: Array<string> | undefined | null;
    sender: {
      uid: string | null;
      displayName: string | null;
      displayId: string | null;
    } | null;
    type: "comment" | "reply" | "like" | "follow" | "other";
    subject: string;
  } = data;

  // title은 푸시의 메인 내용에 해당하는 부분.
  if (!title) {
    return NextResponse.json({ data: "Missing content", status: 400 });
    // 토큰과 uid가 없으면 알림을 보낼 수 없다.
  } else if (!uids || data.uids.length <= 0) {
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
      sender,
      type,
      subject,
    };

    const uidList = uids;

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
    // uids에 속해있는 유저들의 기기 토큰 모두 불러오기
    const tokenList: Array<any> = [];
    // 토큰을 각 uid별로 정리해 저장.(토큰 삭제 시 쿼리에 활용).
    const uidTokenMap: { [uid in string]: Array<string> } = {};
    // id 배열을 길이 30으로 제한하여 나누기
    const uidListChunk = _.chunk(uidList, 30);

    const getDeviceDataListChunk = uidListChunk.map((uids) =>
      admin
        .firestore()
        .collection("devices")
        .where(admin.firestore.FieldPath.documentId(), "in", uids)
        .get(),
    );

    const deviceDataList = await Promise.all(getDeviceDataListChunk);

    deviceDataList.forEach((deviceData) => {
      deviceData.forEach((device) => {
        const uid = device.id;
        const data = device.data();
        const tokens = [...Object.keys(data)];
        tokenList.push(...tokens);
        uidTokenMap[uid] = tokens;
      });
    });

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
      tokens: [...tokenList],
    };

    const res = await Promise.all([
      admin.messaging().sendEachForMulticast(notificationData),
      ...sendInappNotifications,
    ]);

    // 토큰 삭제
    // 전송 실패한 토큰이 존재하는 경우. 단, 성공한 토큰이 하나라도 있는 경우에만 해당 (전체 실패가 아닌 경우에만 해당).
    if (res[0].failureCount > 0 && res[0].successCount > 0) {
      try {
        // 실패한 토큰 찾는다.
        const failureTokens: Array<string> = res[0].responses.reduce(
          (acc, cur, i) => {
            if (!cur.success) {
              acc.push(tokenList[i]);
            }
            return acc;
          },
          [] as Array<string>,
        );

        // 실패한 토큰들을 소유한 uid를 찾는다.
        const failureUidTokenMap = Object.entries(uidTokenMap).reduce(
          (acc, [uid, tokens]) => {
            const foundedTokens = tokens.filter((token) =>
              failureTokens.includes(token),
            );

            if (foundedTokens.length > 0) {
              acc[uid] = foundedTokens;
            }

            return acc;
          },
          {} as { [uid in string]: Array<string> },
        );

        // uid 쿼리 후 토큰 삭제
        const deleteFailureTokens = Object.entries(failureUidTokenMap).map(
          ([uid, tokens]) => {
            const userDeviceDocRef = admin
              .firestore()
              .collection("devices")
              .doc(uid);

            const updateData = tokens.reduce(
              (acc, cur) => {
                acc[cur] = admin.firestore.FieldValue.delete();
                return acc;
              },
              {} as { [token in string]: admin.firestore.FieldValue },
            );

            return userDeviceDocRef.update(updateData);
          },
        );

        await Promise.all(deleteFailureTokens);
      } catch (error) {
        return NextResponse.json({
          data: "failed to delete invalid tokens.",
          error,
          status: 500,
        });
      }
    }

    return NextResponse.json({
      data: { notificationData, res },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      data: "failed to send fcm.",
      error,
      status: 500,
    });
  }
}
