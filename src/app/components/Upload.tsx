"use client";

import { auth, db, storage } from "@/fb";
import { User, onAuthStateChanged } from "firebase/auth";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import Button from "./Button";
import useInput from "@/hooks/useInput";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import { ImageDocData } from "@/types";
import { useRecoilState } from "recoil";
import { imageItemState } from "@/recoil/states";

const Upload = () => {
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState("fa8e9d61-bcd0-41f8-a82f-94a6d1f9c5ce"),
  );
  console.log(imageItem);
  const [userData, setUserData] = useState<User | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [byte, setByte] = useState<number | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const {
    value: title,
    setValue: setTitle,
    onChange: onTitleChange,
  } = useInput("");
  const {
    value: desc,
    setValue: setDesc,
    onChange: onDescChange,
  } = useInput("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData(user);
      } else {
        setUserData(null);
      }
    });
  }, [setUserData]);

  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!!fileList && fileList?.length !== 0) {
      const file = fileList[0];

      setFile(file);

      // file.arrayBuffer().then((buff: ArrayBuffer) => {
      //   let x = new Uint8Array(buff); // x is your uInt8Array
      //   // perform all required operations with x here.
      //   setFile(x);
      // });

      // const blob = new Blob([file], { type: file.type });
      // setFile(blob);

      // const buffer = await file.arrayBuffer();
      // setFile(buffer);

      // const reader = new FileReader();
      // reader.onloadend = (e: ProgressEvent<FileReader>) => {
      //   const target = e.currentTarget as FileReader;
      //   if (!target) return;
      //   const { result } = target;
      //   setFile(result);
      // };
      // reader.readAsDataURL(file);

      const previewImg = new Image();
      const _URL = window.URL || window.webkitURL;
      const objectUrl = _URL.createObjectURL(fileList[0]);
      previewImg.onload = function () {
        // @ts-ignore
        setSize({ width: this.width, height: this.height });
        setPreviewUrl(objectUrl);
        // _URL.revokeObjectURL(objectUrl);
      };
      previewImg.src = objectUrl;

      const fileType = file.type.replace("image/", "");

      const id = uuidv4();
      setId(id);
      setOriginalName(file.name);
      setFileName(id + "." + fileType);
      setByte(file.size);
    }
  };

  const onUploadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      !userData ||
      !id ||
      !file ||
      !size ||
      !byte ||
      !fileName ||
      !originalName
    )
      return;

    // TODO:로딩 ui 출력

    // const uploadImage = async () => {
    // const result = await fetch("/api/upload-image", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     uid: userData.uid,
    //     fileName,
    //     file,
    //   }),
    // });
    // return result;

    const storage = getStorage();
    const storageRef = ref(storage, `images/${userData.uid}/${fileName}`);
    const downloadURL = await uploadBytes(storageRef, file).then(async () => {
      return await getDownloadURL(storageRef);
    });

    const data: ImageDocData = {
      createdAt: Date.now(),
      uid: userData.uid,
      fileName,
      originalName,
      title,
      description: desc,
      byte,
      size,
      url: downloadURL,
      tags: [],
      comments: [],
      likes: [],
    };
    const imageDocRef = doc(db, "users", userData.uid, "images", id);
    setDoc(imageDocRef, data);

    // const userImageDocRef = doc(db, "users", userData.uid, "images", id);
    // setDoc(userImageDocRef, imageDocRef);

    // const storageRef = ref(storage, `images/${userData.uid}/${fileName}`);
    // storageRef.put;
    // await uploadString(storageRef, file, "data_url");
    // };

    // const uploadData = async () => {
    //   // const result = await fetch("/api/upload-image-data", {
    //   //   method: "POST",
    //   //   headers: { "Content-Type": "application/json" },
    //   //   body: JSON.stringify({
    //   //     uid: userData.uid,
    //   //     id,
    //   //     title,
    //   //     description: desc,
    //   //     fileName,
    //   //     originalName,
    //   //     size,
    //   //     byte,
    //   //     tags: [],
    //   //   }),
    //   // });
    //   // return result;
    // };

    // const result = await Promise.all([uploadImage(), uploadData()])
    //   .then(() => {})
    //   .catch(() => {
    //     // TODO:예외처리
    //   })
    //   .finally(() => {
    //     // TODO:로딩 ui 제거
    //   });
  };

  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-12 gap-x-24 bg-shark-50 px-12 py-24">
      {/* <img src={previewUrl}></img> */}
      <label className="relative flex aspect-[3/4] w-72 cursor-pointer flex-col items-center justify-center rounded-xl bg-shark-400 p-6">
        <p className="text-balance break-keep text-center font-bold text-shark-50">
          업로드할 이미지를 선택하세요.
        </p>
        <input
          onChange={onFileSelect}
          id="image_input"
          type="file"
          accept="image/*"
          className="hidden"
        ></input>
      </label>
      <div className="flex w-72 flex-col gap-y-6">
        <label className="flex flex-col">
          <h3 className="pb-1 pl-2 text-shark-700">제목 (선택)</h3>
          <input
            value={title}
            onChange={onTitleChange}
            type="text"
            className="rounded-lg border border-shark-200 py-1 pl-2 outline-none"
            placeholder="이미지의 제목을 적어주세요."
            maxLength={50}
          />
        </label>
        <label className="flex flex-col">
          <h3 className="pb-1 pl-2 text-shark-700">내용 (선택)</h3>
          <textarea
            value={desc}
            onChange={onDescChange}
            className="aspect-[5/2] resize-none rounded-lg border border-shark-200 py-1 pl-2 outline-none"
            placeholder="이미지에 대한 설명을 적어주세요."
            maxLength={1000}
          />
        </label>
        <Button onClick={onUploadClick}>
          <div>이미지 업로드</div>
        </Button>
      </div>
    </div>
  );
};

export default Upload;
