"use client";

import { MouseEvent, useEffect, useState } from "react";
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
import useResetGrid from "@/hooks/useResetGrid";
import { model } from "@/fb";
import UploadLoading from "../UploadLoading";

const UploadForm = () => {
  const { replace, push } = useRouter();
  const { id: paramId } = useParams();
  const isEdit = !!paramId;
  const { getImageItem } = useGetImageItem();
  const { setImageData } = useSetImageData();
  const [init, setInit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentWork, setCurrentWork] = useState<"analyzing" | "uploading">(
    "analyzing",
  );
  const authStatus = useRecoilValue(authStatusState);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(paramId as string),
  );
  const resetHomeGrid = useResetGrid("home");
  const resetFollowingGrid = useResetGrid("following");
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
        desc.trim() === imageItem.description
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

    let analysisResult;

    if (!isEdit) {
      setCurrentWork("analyzing");

      analysisResult = await analyzingImage(file as File).then(
        (analysisResultString) => {
          if (analysisResultString.includes("inappreciate")) {
            return "inappreciate";
          } else {
            const jsonStringMatch = analysisResultString.match(/\{[\s\S]*\}/);
            const jsonString = jsonStringMatch?.[0] || "";
            return JSON.parse(jsonString);
          }
        },
      );
    } else {
      analysisResult = {
        tags: imageItem?.tags,
        themeColor: imageItem?.themeColor,
      };
    }

    console.log(analysisResult);

    if (analysisResult === "inappreciate") {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: `부적절한 이미지를 감지하였습니다.\n업로드를 중단합니다.`,
      });
      setIsLoading(false);
      return;
    }

    setCurrentWork("uploading");

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
        tags: analysisResult.tags,
        themeColor: analysisResult.themeColor,
        likes: imageItem.likes,
        likeCount: imageItem.likeCount,
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
        themeColor: analysisResult.themeColor,
        tags: analysisResult.tags || [],
        likes: [],
        likeCount: 0,
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
          // setTags([]);
          setAlert({
            createdAt: Date.now(),
            type: "success",
            show: true,
            text: "업로드가 완료되었습니다.\n(분석 결과가 궁금하실 경우 개발자 도구를 확인해 주세요.)",
          });
          resetHomeGrid();
          resetFollowingGrid();
          resetUserGrid();
        }
      })
      .catch((error) => {
        // 에러 시 롤백
        if (isEdit) setImageItem(prevImageItem);
      });

    setIsLoading(false);
  };

  async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const analyzingImage = async (targetImage: File) => {
    const imagePart = await fileToGenerativePart(targetImage);
    // 프롬프트 내용
    // 과도한 선정성 혹은 폭력성을 포함한 이미지가 검출되면 "inappreciate" 반환
    // 이미지에 이상이 없으면 아래 지침과 양식에 따라 이미지 분석 결과를 반환할 것
    // 반환 양식은 다음과 같다.
    // { "tags": ["tag1", "tag2", "tag3", ..., "tag10"], "themeColor": "#RRGGBB" }
    // 0. 태그는 이미지 분류, 테마색상은 자리표시자에 사용할 것을 염두에 두고 분석할 것
    // 1. 부적절한 이미지를 검출한 경우와 구분하기 위해  "inappreciate" 단어를 포함하지 말 것
    // 2. 태그 배열의 길이는 10이어야 한다.
    // 3. 가장 많이 나타나는 혹은 눈에 띄는 색상의 hex 값을 themeColor로 뽑을 것.
    // 4. 모든 태그는 소문자로만 이루어져야 한다.
    // 5. 모든 태그는 가능한 일반적이어야 한다.
    // 6. 아래 moodTags 중 이미지의 전반적인 분위기에 맞는 하나 이상 골라 태그에 포함할 것
    // 7. 아래 colorTags 중 이미지에서 눈에 띄는 색상이나 대표 색상을 하나 이상 골라 태그에 포함할 것
    // 8. 만약 이미지에 주요 피사체가 있다면, 피사체에 대한 태그를 하나 이상 포함할 것.
    // 9. 이미지의 배경에 해당하는 태그를 하나 이상 포함하세요. (예: "산", "하늘", "숲", "도시" 등)
    // 10. 태그에 복수형을 사용하지 말 것.

    const prompt = `
    Return "inappreciate" if the image is inappropriate for under 18 years of age, including sensationalism or violence.
    Otherwise follow the instructions below.
    
    Analyze the image and return the results in the following format:
    { "tags": ["tag1", "tag2", "tag3", ..., "tag10"], "themeColor": "#RRGGBB" }
        
    Follow the instructions below to create a tag:

    0. Returns results that are appropriate for the following purposes: 
      - tags: image classification
      - themeColor: placeholder

    1. Do not include the word "inappreciate" in your return to distinguish the image from inappropriate cases.

    2. The length of the tags array shall be 10.

    3. Pick the one hex value of the most visible or most noticeable color in the image as the themeColor.

    4. Each tag should be all lowercase.

    5. Each tag should be as general as possible.

    6. Include one or more tags from the moodTags below that match the overall atmosphere of the image.
      moodTags: [
        'calm', 'energetic', 'romantic', 'happy', 'sad', 'mysterious', 'dramatic', 'peaceful', 'nostalgic', 'vibrant',
        'serene', 'majestic', 'cozy', 'gloomy', 'bright', 'dark', 'rustic', 'lush',
        'urban', 'modern', 'historic', 'industrial', 'vintage', 'futuristic', 'quaint',
        'warm', 'cool', 'monochromatic', 'colorful', 'pastel', 'neutral'
      ]

    7. Include one or more tags from the colorTags below that The main color of the image.
      colorTags = [
        'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'gray', 'black', 'white',
        'light red', 'dark red', 'light orange', 'dark orange', 'light yellow', 'dark yellow',
        'light green', 'dark green', 'light blue', 'dark blue', 'light purple', 'dark purple',
        'light pink', 'dark pink', 'light brown', 'dark brown', 'light gray', 'dark gray'
      ]

    8. If there is a main subject in the image, include at least one tag for that subject.

    9. Include at least one tag that corresponds to the background of the image (e.g., "mountain", "sky", "forest", "city", etc.).

    10. All tags must be written in singular form (do not use plural) (e.g., flowers -> flower, buildings -> building).
    `;
    // @ts-ignore
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    return text;
  };

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
            {/* <form onSubmit={onAddTagSubmit}>
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
            </form> */}
            {/* <div className="mb-8 rounded-lg bg-shark-100 p-2">
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
            </div> */}
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
          {isLoading && (
            <div className="fixed left-0 top-0 z-50 h-screen w-screen">
              <div className="h-full w-full bg-shark-950 opacity-30" />
              <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-[50%] min-w-[300px] rounded-lg bg-shark-50">
                <UploadLoading />
                <div className="text-balance break-keep px-8 pb-8 text-center leading-tight text-shark-700">
                  {currentWork === "analyzing"
                    ? "이미지를 분석해 태그를 생성하고 있습니다."
                    : "이미지 업로드 중입니다."}
                  <br />
                  창을 닫지 마세요.
                </div>
              </div>
            </div>
          )}
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
