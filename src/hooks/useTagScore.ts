import { db } from "@/fb";
import { authStatusState } from "@/recoil/states";
import { AuthStatus, ImageData } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import _ from "lodash";
import { useState } from "react";
import { useRecoilState } from "recoil";

const amountDict = { view: 1, save: 1, like: 2, comment: 3 };

const useTagScore = ({ imageData }: { imageData: ImageData | null }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const currentSeenTags = imageData?.tags;
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);

  const adjustTagScore = async ({
    action,
  }: {
    action: "view" | "like" | "save" | "comment";
  }) => {
    console.log("useTagScore");
    if (!authStatus.data || isLoading || !currentSeenTags) return;
    setIsLoading(true);

    const amount = amountDict[action];

    let tagScore = _.cloneDeep(authStatus.data.tagScore) || {};

    for (let tag of Object.keys(tagScore)) {
      if (currentSeenTags.includes(tag)) {
        tagScore[tag] += amount;
      } else if (tagScore[tag] <= 2) {
        delete tagScore[tag];
      } else {
        tagScore[tag] -= 2;
      }
    }

    const newTags = currentSeenTags.filter(
      (tag) => !Object.keys(tagScore).includes(tag),
    );

    newTags.forEach((tag) => {
      tagScore[tag] = amount;
    });

    try {
      const docRef = doc(db, "users", authStatus.data.uid);
      await updateDoc(docRef, { tagScore });
    } catch (error) {
      console.log(error);
    } finally {
      setAuthStatus((prev) => {
        return { ...prev, data: { ...prev.data, tagScore } } as AuthStatus;
      });
      setUpdated(true);
      setIsLoading(false);
    }
  };

  return { isLoading, adjustTagScore, updated };
};

export default useTagScore;
// const tagScore: { [key in string]: number } = {
//   apple: 15,
//   orange: 3,
//   peach: 42,
//   watermelon: 1,
// };
