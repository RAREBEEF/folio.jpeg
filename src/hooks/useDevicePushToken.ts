import { db } from "@/fb";
import { authStatusState } from "@/recoil/states";
import {
  deleteDoc,
  deleteField,
  doc,
  FirestoreError,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useRecoilValue } from "recoil";
import useFetchWithRetry from "./useFetchWithRetry";
import { useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";

const useDevicePushToken = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchWithRetry } = useFetchWithRetry();
  const authStatus = useRecoilValue(authStatusState);

  const postDeviceDataAsync = async (deviceData: {
    fcmToken: string;
    createdAt: number;
  }) => {
    console.log("useDevicePushToken");
    if (authStatus.status !== "signedIn") {
      return;
    }

    const docRef = doc(db, "devices", authStatus.data.uid);

    try {
      await updateDoc(docRef, { [deviceData.fcmToken]: deviceData });
    } catch (error) {
      if ((error as FirestoreError).code === "not-found") {
        await setDoc(docRef, { [deviceData.fcmToken]: deviceData });
      }
    }
  };

  const postDeviceData = async (deviceData: {
    fcmToken: string;
    createdAt: number;
  }) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await fetchWithRetry({ asyncFn: postDeviceDataAsync, args: deviceData });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeviceDataAsync = async (all: boolean) => {
    console.log("useDevicePushToken");
    if (authStatus.status !== "signedIn") {
      return;
    }

    const messaging = getMessaging();
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    const docRef = doc(db, "devices", authStatus.data.uid);

    try {
      if (all) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { [currentToken]: deleteField() });
      }
    } catch (error) {}
  };

  const deleteDeviceData = async ({ all = true }: { all?: boolean }) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await fetchWithRetry({ asyncFn: deleteDeviceDataAsync, args: all });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { postDeviceData, deleteDeviceData, isLoading };
};

export default useDevicePushToken;
