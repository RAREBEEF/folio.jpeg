import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../fb";
import { atomFamily, useSetRecoilState } from "recoil";
import { photosState } from "@/app/components/ImageGrid";
import { Photo, PhotoDoc, PhotosState } from "../../type";
import { useState } from "react";

//TODO: 다른 페이지 다녀와도 불러온 포토가 유지되는지 체크
//TODO: lastVisible이 없으면 기존 photos에서 lastvisible 설정할지 고민해보기
//TODO: 위 방안을 채택할 경우 필터나 정렬이 바뀌면 기존 photos를 초기화먼저 해야 이전 필터의 lastvisible이 설정되는 것을 방지할 수 있음

const useGetPhotos = () => {
  const setPhotos = useSetRecoilState(photosState);
  const [lastVisible, setLastVisible] = useState<any>(null);
  console.log(lastVisible);
  const getPhotos = async () => {
    const newPhotos: PhotosState = [];
    const queries: Array<any> = [orderBy("createdAt", "desc"), limit(1)];
    if (!!lastVisible) {
      queries.push(startAfter(lastVisible));
    }

    const photosRef = collection(db, "photos");
    const q = query(photosRef, ...queries);
    const documentSnapshots = await getDocs(q);

    documentSnapshots.forEach((doc) => {
      newPhotos.push({ ...(doc.data() as PhotoDoc), id: doc.id });
    });
    setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  return getPhotos;
};

export default useGetPhotos;
