import { authStatusState, inAppNotificationState } from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import { db } from "@/fb";
import { InAppNotification } from "@/types";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import _ from "lodash";

const mergeNotification = ({
  type,
  subjects,
}: {
  type: string;
  subjects: { [subject in string]: Array<InAppNotification> };
}) => {
  // 댓글과 other 타입의 알림들은 합치지 않는다.
  if (["comment", "reply", "other"].includes(type)) {
    const commentTypeNotifications = Object.values(subjects).reduce(
      (acc, cur) => {
        acc.push(...cur);
        return acc;
      },
      [] as Array<InAppNotification>,
    );
    return commentTypeNotifications;
    // 좋아요 타입의 알림들 합치기
  } else if (type === "like") {
    const likeTypeNotifications = Object.entries(subjects).reduce(
      (acc, cur) => {
        const [imageId, notifications] = cur;
        const mergedNotification = {
          ...notifications[0],
        };

        const senders = _.uniqBy(
          notifications.reduce(
            (acc, cur) => {
              const sender = cur.sender;

              if (!sender) {
                return acc;
              } else if (Array.isArray(sender)) {
                acc.push(...sender);
              } else {
                acc.push(sender);
              }

              return acc;
            },
            [] as Array<{
              displayName: string | null;
              displayId: string | null;
              uid: string | null;
            }>,
          ),
          "uid",
        );

        if (senders.length > 1) {
          mergedNotification.sender = senders;
          mergedNotification.title = "새로운 좋아요";
          mergedNotification.body =
            senders.length === 2
              ? `${senders[0].displayName}님, ${senders[1].displayName}님이 회원님의 사진에 좋아요를 눌렀습니다.`
              : `${senders[0].displayName}님, ${senders[1].displayName}님 외 ${(senders.length - 2).toLocaleString("ko-KR")}명이 좋아요를 눌렀습니다.`;
        }

        acc.push(mergedNotification);

        return acc;
      },
      [] as Array<InAppNotification>,
    );

    return likeTypeNotifications;
  } else if (type === "follow") {
    const followTypeNotifications = Object.entries(subjects).reduce(
      (acc, cur) => {
        const [imageId, notifications] = cur;
        const mergedNotification = {
          ...notifications[0],
        };

        const senders = _.uniqBy(
          notifications.reduce(
            (acc, cur) => {
              const sender = cur.sender;

              if (!sender) {
                return acc;
              } else if (Array.isArray(sender)) {
                acc.push(...sender);
              } else {
                acc.push(sender);
              }

              return acc;
            },
            [] as Array<{
              displayName: string | null;
              displayId: string | null;
              uid: string | null;
            }>,
          ),
          "uid",
        );

        if (senders.length > 1) {
          mergedNotification.sender = senders;
          mergedNotification.title = "새로운 팔로워";
          mergedNotification.body =
            senders.length === 2
              ? `${senders[0].displayName}님, ${senders[1].displayName}님이 회원님을 팔로우하기 시작했습니다.`
              : `${senders[0].displayName}님, ${senders[1].displayName}님 외 ${(senders.length - 2).toLocaleString("ko-KR")}명이 회원님을 팔로우하기 시작했습니다.`;
        }

        acc.push(mergedNotification);

        return acc;
      },
      [] as Array<InAppNotification>,
    );

    return followTypeNotifications;
  }
};

const InAppNotificationListener = () => {
  const authStatus = useRecoilValue(authStatusState);
  const [inAppNotification, setInAppNotification] = useRecoilState(
    inAppNotificationState,
  );
  const [newNotificationReception, setNewNotificationReception] =
    useState<boolean>(false);

  useEffect(() => {
    if (!authStatus.data?.uid) return;

    const docRef = doc(
      db,
      "users",
      authStatus.data.uid,
      "notification",
      "data",
    );

    const unsub = onSnapshot(docRef, (doc) => {
      const list: Array<InAppNotification> =
        (doc.data()?.list as Array<InAppNotification>) || [];
      const lastCheck: number = (doc.data()?.lastCheck as number) || 0;

      setInAppNotification((prev) => {
        if (prev.list.length !== list.length) {
          setNewNotificationReception(true);
        }
        return {
          ...prev,
          list: list.reverse(),
          lastCheck,
        };
      });
    });

    return () => {
      unsub();
    };
  }, [authStatus.data?.uid, setInAppNotification]);

  // 동일한 알림 합치기
  useEffect(() => {
    if (authStatus.status !== "signedIn" || !newNotificationReception) return;

    const categorizedNotification = inAppNotification.list.reduce(
      (acc, cur, i) => {
        const type = cur.type;
        const subject = cur.subject;
        acc[type] = acc[type] || {};
        acc[type][subject] = acc[type][subject] || [];
        acc[type][subject].push(cur);
        return acc;
      },
      {} as {
        [type in string]: { [subject in string]: Array<InAppNotification> };
      },
    );

    const newNotification = _.sortBy(
      Object.entries(categorizedNotification).reduce(
        (acc, [type, subjects], i) => {
          const mergedNotification = mergeNotification({ type, subjects });
          //@ts-ignore
          acc.push(...mergedNotification);
          return acc;
        },
        [] as Array<InAppNotification>,
      ),
      "createdAt",
    );

    const docRef = doc(
      db,
      "users",
      authStatus.data.uid,
      "notification",
      "data",
    );

    (async () => {
      setNewNotificationReception(false);
      await updateDoc(docRef, {
        list: newNotification,
      });
    })();
  }, [
    authStatus.data,
    authStatus.status,
    inAppNotification,
    newNotificationReception,
  ]);

  // 오래된 알림 삭제
  useEffect(() => {
    if (authStatus.data?.uid && inAppNotification.list.length > 100) {
      const newList = _.cloneDeep(inAppNotification.list)
        .splice(0, 50)
        .reverse();
      const docRef = doc(
        db,
        "users",
        authStatus.data.uid,
        "notification",
        "data",
      );
      updateDoc(docRef, {
        list: newList,
      });
    }
  }, [
    authStatus.data?.uid,
    inAppNotification.list,
    inAppNotification.list.length,
  ]);

  return null;
};

export default InAppNotificationListener;
