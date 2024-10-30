import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  if (process.env.NODE_ENV === "development") {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY || "",
    ),
    isTokenAutoRefreshEnabled: true,
  });

  const userAgent = navigator?.userAgent?.toLowerCase();
  const isIos =
    userAgent?.indexOf("iphone") !== -1 || userAgent?.indexOf("ipad") !== -1;
  const isStandalone = window?.matchMedia("(display-mode: standalone)").matches;
  const canPush = !isIos || (isIos && isStandalone);

  // ios이면서 스탠드얼론이 아니면 푸시를 보낼 수 없다.
  if (canPush) {
    try {
      const messaging = getMessaging(app);
      if (localStorage.getItem("pushRequest") === "unsupport")
        localStorage.removeItem("pushRequest");
    } catch (error) {
      console.log(error);
      localStorage.setItem("pushRequest", "unsupport");
    }
  }
}

const vertexAI = getVertexAI(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const model = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-flash-preview-0514",
});
