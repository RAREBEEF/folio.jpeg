"use client";

import { FormEvent, MouseEvent, useEffect, useState } from "react";
import Button from "../Button";
import useInput from "@/hooks/useInput";
import { ImageData, ImageItem } from "@/types";
import useSetImageData from "@/hooks/useSetImageItem";
import useSetImageFile from "@/hooks/useSetImageFile";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { alertState, authStatusState, imageItemState } from "@/recoil/states";
import useGetImageItem from "@/hooks/useGetImageItem";
import Loading from "../Loading";
import _ from "lodash";
import XSvg from "@/icons/xmark-solid.svg";
import useResetGrid from "@/hooks/useResetGrid";

const UploadForm = () => {
  const { replace, push } = useRouter();
  const { id: paramId } = useParams();
  const isEdit = !!paramId;
  const { getImageItem } = useGetImageItem();
  const { setImageData } = useSetImageData();
  const [init, setInit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(paramId as string),
  );
  const resetHomeGrid = useResetGrid("home");
  const resetUserGrid = useResetGrid("user-" + authStatus.data?.uid);
  const {
    setImageFile,
    onFileSelect,
    file,
    previewUrl,
    id,
    fileName,
    originalName,
    byte,
    size,
    error,
    reset,
    gradient,
    isInputUploading,
  } = useSetImageFile();
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
  const {
    value: addTag,
    setValue: setAddTag,
    onChange: onAddTagChange,
  } = useInput("");
  const [tags, setTags] = useState<Array<string>>([]);
  const [alert, setAlert] = useRecoilState(alertState);

  // 유저 데이터 체크
  useEffect(() => {
    // 로그인이 안되었거나 초기 설정이 안되었으면 나가기
    if (authStatus.status !== "pending" && authStatus.status !== "signedIn") {
      replace("/");
    } else if (authStatus.status === "signedIn") {
      setInit(true);
    }
  }, [replace, authStatus]);

  // 수정모드 초기화
  useEffect(() => {
    if (!isEdit || !imageItem) {
      return;
    } else if (authStatus.data?.uid !== imageItem.uid) {
      replace("/image/" + paramId);
      return;
    }

    setTitle(imageItem.title || "");
    setDesc(imageItem.description || "");
    setTags(imageItem.tags);
    setInit(true);
  }, [imageItem, isEdit, paramId, replace, setDesc, setTitle, authStatus]);

  // 수정모드 데이터 체크
  useEffect(() => {
    if (init) return;

    // 수정 모드인데 이전 데이터 없으면
    if (isEdit) {
      // 기존 데이터 불러오기
      if (!imageItem) {
        (async () => {
          await getImageItem(JSON.stringify(paramId).replaceAll('"', ""))
            .then((item) => {
              if (!item) {
                replace("/");
              } else {
                setImageItem(item);
              }
            })
            .catch((error) => {
              replace("/image/" + paramId);
            });
        })();
      }
    }
  }, [getImageItem, imageItem, init, isEdit, paramId, replace, setImageItem]);

  // 업로드/수정
  const onUploadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 예외처리
    if (error !== null) {
      switch (error) {
        case "fileType":
          setAlert({
            text: "유효하지 않은 파일 형식입니다.",
            createdAt: Date.now(),
            type: "warning",
            show: true,
          });
          return;
        default:
          setAlert({
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "이미지 업로드 중 문제가 발생하였습니다.",
          });
          return;
      }
    } else if (authStatus.status !== "signedIn" || !authStatus.data) {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: "로그인 후 다시 시도해 주세요.",
      });
      return;
    } else if (!isEdit && !file) {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: "이미지를 첨부해 주세요.",
      });
      return;
    } else if (tags.length <= 0) {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: "1개 이상의 태그를 추가해 주세요.",
      });
      return;
    } else if (isEdit) {
      if (!imageItem) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "수정할 이미지가 존재하지 않습니다.",
        });
        return;
      } else if (authStatus.data?.uid !== imageItem.uid) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지를 수정할 권한이 없습니다.",
        });
        return;
      } else if (
        title.trim() === imageItem.title &&
        desc.trim() === imageItem.description &&
        tags.length === imageItem.tags.length &&
        tags.filter((tag) => !imageItem.tags.includes(tag)).length === 0
      ) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "변경 사항이 존재하지 않습니다.",
        });
        return;
      }
    } else {
      if (!id || !size || !byte || !fileName || !originalName) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지 데이터를 불러오는 중 문제가 발생하였습니다.",
        });
        return;
      }
    }

    setIsLoading(true);

    const imageId = isEdit ? imageItem!.id : (id as string);
    const downloadURL = isEdit
      ? (imageItem!.url as string)
      : await setImageFile(
          authStatus.data.uid,
          fileName as string,
          file as File,
        );

    let data: ImageData;

    if (!downloadURL) {
      return;
    } else if (isEdit && imageItem) {
      data = {
        id: imageId,
        createdAt: Date.now(),
        uid: imageItem.uid,
        fileName: imageItem.fileName,
        originalName: imageItem.originalName,
        title: title.trim(),
        description: desc.trim(),
        byte: imageItem.byte,
        size: imageItem.size,
        url: downloadURL,
        tags: tags,
        likes: imageItem.likes,
        themeColor: imageItem.themeColor,
      };
    } else {
      data = {
        id: imageId,
        createdAt: Date.now(),
        uid: authStatus.data.uid,
        fileName: fileName as string,
        originalName: originalName as string,
        title: title.trim(),
        description: desc.trim(),
        byte: byte as number,
        size: size as { width: number; height: number },
        url: downloadURL,
        themeColor: gradient,
        tags,
        likes: [],
      };
    }

    // 업데이트 전 상태 백업
    let prevImageItem: ImageItem | null;

    if (isEdit) {
      // 이미지 아이템 상태 업데이트
      setImageItem((prev) => {
        prevImageItem = prev;

        if (!prev) {
          return prev;
        } else {
          return {
            ...prev,
            ...data,
          };
        }
      });
    }

    await setImageData(imageId, data, isEdit)
      .then(() => {
        if (isEdit) {
          push(`/image/${imageId}`);
        } else {
          reset();
          setTitle("");
          setDesc("");
          setTags([]);
          setAlert({
            createdAt: Date.now(),
            type: "success",
            show: true,
            text: "업로드가 완료되었습니다.",
          });
          resetHomeGrid();
          resetUserGrid();
        }
      })
      .catch((error) => {
        // 에러 시 롤백
        if (isEdit) setImageItem(prevImageItem);
      });

    setIsLoading(false);
  };

  // 태그 추가
  const onAddTagSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!addTag) return;
    setTags((prev) => {
      const uniqTags = new Set([...prev, addTag.trim()]);
      const newTags = Array.from(uniqTags);
      return newTags;
    });
    setAddTag("");
  };
  // 태그 제거
  const onRemoveTag = (e: MouseEvent<HTMLButtonElement>, target: string) => {
    e.preventDefault();
    setTags((prev) => {
      const newTags = prev.filter((tag) => tag !== target);
      return newTags;
    });
  };

  console.log(file, size);

  return (
    <div className="h-full w-full bg-shark-50 px-12 py-24">
      {init ? (
        <div className="flex h-full items-center justify-center gap-12 gap-x-24 sm:flex-col md:gap-x-12">
          <label
            className={`relative max-w-[500px] grow overflow-hidden rounded-xl bg-gradient-to-br from-shark-100 to-shark-300 sm:w-full ${isEdit ? " cursor-default" : "cursor-pointer"}`}
          >
            {(previewUrl || (isEdit && imageItem && imageItem.url)) &&
            !isInputUploading ? (
              <div
                style={{
                  aspectRatio: `${isEdit ? imageItem?.size.width : size?.width || 0}/${isEdit ? imageItem?.size.height : size?.height || 0}`,
                }}
                className={`group relative rounded-xl p-4`}
              >
                <NextImage
                  layout="fill"
                  src={
                    (isEdit && imageItem ? imageItem.url : previewUrl) as string
                  }
                  alt={fileName || ""}
                />
                {!isEdit && (
                  <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-shark-100 px-2 py-1 opacity-0 group-hover:opacity-80">
                    이미지 변경
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center text-balance break-keep p-6 text-center font-bold text-shark-50">
                {isInputUploading ? (
                  <div>
                    <Loading color="shark-50" />
                    <br />
                    <div>이미지 압축 중</div>
                  </div>
                ) : (
                  <div>
                    업로드 할 이미지를 선택하세요. <br /> (jpg, gif, webp, png)
                  </div>
                )}
              </div>
            )}
            {!isEdit && (
              <input
                onChange={onFileSelect}
                id="image_input"
                type="file"
                disabled={isLoading || isInputUploading}
                accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
                className="hidden"
              ></input>
            )}
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
            <form onSubmit={onAddTagSubmit}>
              <label className="flex flex-col">
                <h3 className="pb-1 pl-2 text-shark-700">태그</h3>
                <p className="text-balance break-keep pb-1 pl-2 text-xs text-shark-500">
                  1개 이상의 태그를 추가해 주세요.
                  <br />
                  태그는 다른 이용자에게 보여지지 않습니다.
                </p>
                <div className="flex w-full gap-2">
                  <input
                    value={addTag}
                    onChange={onAddTagChange}
                    type="text"
                    className="grow rounded-lg border border-shark-200 py-1 pl-2 outline-none"
                    placeholder="태그 추가"
                    maxLength={20}
                  />
                  <Button type="submit">+</Button>
                </div>
              </label>
            </form>
            <div className="mb-8 rounded-lg bg-shark-100 p-2">
              <h4 className="mb-2 text-sm text-shark-500">추가한 태그</h4>
              <ul className="flex min-h-10 flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-shark-50 px-2 py-1 text-shark-500"
                  >
                    #{tag}
                    <button
                      className="aspect-square w-3"
                      onClick={(e) => {
                        onRemoveTag(e, tag);
                      }}
                    >
                      <XSvg className="fill-shark-300" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={onUploadClick} disabled={isLoading}>
              {isLoading ? (
                <div className="flex h-full">
                  <Loading height="24px" />
                </div>
              ) : (
                <div>{isEdit ? "수정하기" : "이미지 업로드"}</div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center">
          <Loading height="24px" />
        </div>
      )}
    </div>
  );
};

export default UploadForm;
