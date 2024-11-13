# **FOLIO.JPEG**

<img alt="홈화면" src="https://github.com/user-attachments/assets/e7c5a497-e2f4-4d8b-91a3-907ac2b039cf" />
<br />
<br />

# 프로젝트 소개

**FOLIO.JPEG**는 핀터레스트를 벤치마킹한 이미지 공유형 소셜미디어입니다.

이미지 업로드, 팔로우와 좋아요, 댓글 등 소셜미디어의 기본 기능과 이를 위한 웹 푸시 알림 기능을 구현하였고 Google의 Gemini AI를 접목해 업로드한 이미지를 분석하고 키워드와 대표 색상 등을 추출하거나 이미지에 대한 피드백, 부적절성 검사 등의 기능을 구현하였습니다.

<br />
<br />

# 주요 기능

- 이미지 편집 및 업로드.
- AI 이미지 분석
  - 키워드 추출: 검색 및 관련 이미지 제공에 활용.
  - 대표색상 추출: 이미지 로드 중 자리표시자에 활용.
  - 이미지 피드백: 사진의 좋은 점과 아쉬운 점을 분석해 유저에게 피드백.
  - 부적절한 콘텐츠 필터링.
- 태그를 활용한 이미지 검색 및 관련 이미지 제공.
- 유저 프로필
  - 닉네임, 프로필 사진, 배너 사진 등 커스텀 기능.
- 좋아요, 댓글, 답글, 팔로우 등 유저간 커뮤니케이션 기능.
- 백그라운드 푸시 알림 및 앱 내 알림 담벼락.
- 이미지 스크랩.
- Masonry Grid(핀터레스트식 세로 방향 정렬 그리드)의 무한스크롤 구현.

<br />

# 사용된 기술 스택

- Next 14
- TypeScript
- TailwindCss
- Recoil
- Firebase

<br />
<br />

# 상세 설명 목차

_설명에 포함된 코드는 실제 코드에서 발췌해 설명에 용이하도록 일부 수정된 부분이 있을 수 있으며 앞뒤로 생략된 코드가 존재할 수 있습니다._

1. [Masonry Grid (세로 방향 정렬 그리드)](#1-masonry-grid-세로-방향-정렬-그리드)  
   1-1. [컨테이너 너비에 따라 그리드 초기화](#1-1-컨테이너-너비에-따라-그리드-초기화)  
   1-2. [그리드의 각 열에 이미지 추가하기](#1-2-그리드의-각-열에-이미지-추가하기)

2. [이미지 첨부 / 분석 / 업로드](#2-이미지-첨부--분석--업로드)  
   2-1. [이미지 첨부](#2-1-이미지-첨부)  
   2-2. [이미지 업로드](#2-2-이미지-업로드)

3. [이미지 편집](#3-이미지-편집)  
   3-1. [뷰포트에 맞게 캔버스 사이즈 조절](#3-1-뷰포트에-맞게-캔버스-사이즈-조절)  
   3-2. [리사이저 좌표 구하기](#3-2-리사이저-좌표-구하기)  
   3-3. [편집 완료된 이미지 캡쳐](#3-3-편집-완료된-이미지-캡쳐)

4. [검색](#4-검색)  
   4-1. [검색어 제안](#4-1-검색어-제안)  
   4-2. [최근 검색 기록](#4-2-최근-검색-기록)

5. [알림](#5-알림)  
   5-1. [인 앱 알림](#5-1-인-앱-알림)  
   5-2. [웹 푸시 알림](#5-2-웹-푸시-알림)

6. [댓글](#6-댓글)

<br />
<br />

# 1. Masonry Grid (세로 방향 정렬 그리드)

<p align="center">
  <img alt="홈화면" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWgxZXprOGJqdG9xNWZ3M2M5MGQyYmk1cG01MmphMnhvZHZ2bmhzOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dkjB34qVdzoMq6YnMN/giphy.gif" />
</p>

높이가 통일되지 않은 이미지들을 무한스크롤로 불러올 때, 각 열의 높이를 균등하게 유지하며 이미지를 추가할 수 있도록 Masonry Grid를 구현했습니다.

css grid에 masonry 속성이 존재하지만 아직 실험적 기능이고 지원하는 브라우저가 극히 일부이기 때문에 자바스크립트로 구현하였습니다.

구현 방식을 간단하게 설명하면 아래와 같습니다.

1. 뷰포트의 너비가 주어지면 그에 맞춰 그리드를 초기화한다. (열의 개수와 너비 등)
2. 새로운 이미지가 로드되면 길이가 가장 짧은 열을 찾는다.
3. left:0;top:0;으로 이미지의 위치를 초기화한다.
4. transform으로 이미지의 위치를 지정한다. (추가할 열의 index와 누적 높이, 이미지의 높이와 각 열의 너비 등을 토대로 계산)
5. 이미지의 높이만큼 열의 길이를 업데이트한다.
6. 새로운 이미지가 로드되면 2번부터 반복

<br />

## 1-1. 컨테이너 너비에 따라 그리드 초기화

```ts
// 그리드 객체의 구조
let grid = {
  gap: 15, // 열 간격
  colCount: 3, // 열의 개수
  colWidth: 250, // 열의 너비
  height: 0, // 그리드의 높이 (가장 긴 열의 높이)
  page: 0, // 무한스크롤로 불러온 페이지의 수
  cols: [], // 각 열의 정보를 담을 배열
};

// 컨테이너 너비와 열의 너비, 간격 등을 고려해 열의 개수 구하기
grid.colCount = Math.max(
  Math.min(Math.floor(containerWidth / (grid.colWidth + grid.gap * 2)), 5),
  2,
);

// 열의 개수가 2인 경우에만 열의 너비를 컨테이너 너비에 맞춰 조절. 그 외에는 250으로 고정.
if (grid.colCount === 2) {
  grid.colWidth = containerWidth / 2 - grid.gap * 2;
}

// 각 열의 정보를 담을 객체를 grid.cols 배열에 추가
grid.cols = Array.from({ length: grid.colCount }, () => ({
  items: [], // 열에 추가할 이미지 배열
  height: 0, // 열의 높이
}));
```

<br />

## 1-2. 그리드의 각 열에 이미지 추가하기

```ts
// 새롭게 추가할 이미지들을 반복문으로 순회
for (let i = 0; i < currentPage.length; i++) {
  // 추가할 이미지
  const image = currentPage[i];

  // 현재 그리드에서 가장 길이가 짧은 열 찾기
  const colIndex = grid.cols.reduce((acc, cur, index) => {
    if (cur.height < grid.cols[acc].height) {
      return index;
    } else {
      return acc;
    }
  }, 0);
  const shortestCol = grid.cols[colIndex];

  // 열에 추가할 이미지 아이템
  const curItem: GridItem = {
    id: image.id,
    // 전체 페이지에서 이미지를 바로 찾을 수 있도록 자신이 속한 페이지를 이미지 데이터에 저장.
    page: i,
    // 모든 이미지의 너비를 통일하기 위해 종횡비를 유지하며 이미지의 높이 계산.
    height: (grid.colWidth * image.size.height) / image.size.width,
    // 그리드에서 이미지가 위치할 좌표
    x: colIndex * grid.colWidth + grid.gap * (1 + colIndex),
    y: shortestCol.height + grid.gap,
  };

  // 열에 아이템 추가
  shortestCol.items.push(curItem);

  // 추가한 이미지의 높이만큼 열의 높이 업데이트
  shortestCol.height += curItem.height + grid.gap;

  // cols 업데이트
  grid.cols[colIndex] = shortestCol;
}
```

위 과정을 통해 계산한 수치들을 기반으로 각 이미지의 위치를 transform해 그리드와 열을 구성합니다.

<br />
<br />

# 2. 이미지 첨부 / 분석 / 업로드

<img alt="이미지 업로드 1" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3k3NGI3bzQ3Mnhna2QwY2lzN2Jrbnk4N3dxYTloNWE1cnlna2NseiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vr7VmD5Djj38dNy08Q/giphy.gif">

## 2-1. 이미지 첨부

이미지 첨부 과정은 다음과 같습니다.

1. 사용자가 input에 이미지 첨부함.
2. 이미지의 metadata를 로드하고 데이터가 존재하면 해당하는 필드를 채운다.
3. 미리보기 이미지를 로드해서 출력한다.

- 이 과정에서 사용자가 이미지를 편집할 수 있지만 해당 내용은 후술

메타데이터는 exifr 라이브러리를 통해 불러왔습니다.

```ts
import exifr from "exifr";

const exifData = await exifr.parse(fileList[0]);
if (exifData) {
  setImgMetaData({
    make: exifData.Make || null,
    model: exifData.Model || null,
    lensMake: exifData.LensMake || null,
    lensModel: exifData.LensModel || null,
    shutterSpeed: exifData.ShutterSpeedValue
      ? `${calcShutterSpeed(exifData?.ShutterSpeedValue)}s`
      : null,
    fNumber: exifData.FNumber ? `f/${exifData.FNumber}` : null,
    ISO: exifData.ISO || null,
    focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : null,
    createDate: exifData.CreateDate
      ? `${new Date(exifData.CreateDate).toLocaleString("en-US")}`
      : null,
  });
}
```

미리보기 이미지는 다음 과정을 통해 출력하였습니다.

```ts
const previewImg = new Image();
const _URL = window.URL || window.webkitURL;
const objectURL = _URL.createObjectURL(fileList[0]);

previewImg.onload = () => {
  if (previewImg.width < 50 || previewImg.height < 50) {
    onResetAllField();
    setError("fileSize");
    setAlert((prev) => [
      ...prev,
      {
        id: uniqueId(),
        type: "warning",
        text: "이미지의 최소 사이즈는 50*50 입니다.",
        show: true,
        createdAt: Date.now(),
      },
    ]);
  } else {
    setOriginSize({ width: previewImg.width, height: previewImg.height });
    setOriginPreviewURL(objectURL);
  }
};

previewImg.src = objectURL;
```

<br />

## 2-2. 이미지 업로드

이미지 업로드를 포함해 인증과 웹 푸시 등 백엔드 기능은 Firebase를 사용했습니다.  
Firebase와 관련된 내용은 다른 프로젝트에서 너무 많이 다뤘기 때문에 생략하고 그 외 코드를 위주로 설명하도록 하겠습니다.

이미지 업로드 과정은 다음과 같습니다.

1. 사용자가 업로드 버튼을 클릭.
2. 유효성 체크.
3. 이미지 압축 및 webp 변환.
4. 이미지 분석.
5. 이미지 파일을 storage에 업로드하고 url 불러오기.
6. 이미지의 url과 제목, 내용, 메타데이터 등의 데이터를 db에 업로드.

<br />

### - 이미지 압축

이미지 압축 및 webp 변환은 browser-image-compression 라이브러리를 사용했습니다.

```ts
import imageCompression from "browser-image-compression";

const compressor = async ({ targetImage }: { targetImage: File }) => {
  const compressedImage = await imageCompression(targetImage, {
    maxSizeMB: 10,
    useWebWorker: false,
    fileType: "image/webp",
  });

  return compressedImage;
};
```

<br />

### - 이미지 분석

이미지 분석은 Google의 Gemini api를 활용했습니다. 프로젝트가 Firebase를 사용 중이라면 간단하게 연동할 수 있습니다.

연동과 관련된 자세한 코드는 "src/fb.ts"와 "src/hooks/useGemini.ts" 파일을 참고해 주세요.

ai에게 분석 요청한 내용은 검색 및 연관 이미지 제공에 활용할 **키워드 추출**, 자리표시자에 활용할 **대표 색상**, **부적절한 이미지 필터링**, 이미지에 대한 **피드백** 등이며 이와 관련된 프롬프트는 "src/hooks/useAnalyzingImage.ts" 파일을 참고해 주세요.

분석 관련 코드는 다음과 같습니다.

```ts
// 이미지를 Base64로 인코딩하는 비동기 함수
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

// gemini에 텍스트와 이미지 파일 등을 전달하고 결과를 받아오는 비동기 함수
const gemini = async ({
  text,
  image,
}: {
  text: string;
  image?: File | null | Array<File>;
}): Promise<string> => {
  const request: Array<
    | string
    | {
        inlineData: {
          data: unknown;
          mimeType: string;
        };
      }
  > = [text];

  // 이미지가 있으면 인코딩 후 request 배열에 추가.
  if (image) {
    const imagePart = await Promise.all(
      Array.isArray(image)
        ? image.map((img) => fileToGenerativePart(img))
        : [fileToGenerativePart(image)],
    );

    request.push(...imagePart);
  }

  const response = (await model.generateContent(request)).response;
  const result = response.text();

  return result;
};
```

<br />

### - 이미지 업로드 상태창

<p align="center">
  <img alt="이미지 업로드 1" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3k3NGI3bzQ3Mnhna2QwY2lzN2Jrbnk4N3dxYTloNWE1cnlna2NseiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vr7VmD5Djj38dNy08Q/giphy.gif">  
<p>

이미지 업로드 자체는 그다지 긴 시간이 필요하지 않지만 이미지를 분석하는데에는 꽤 오랜 시간이 소요됩니다.

따라서 이미지 업로드/분석 중 사용자에게 로딩창을 보여주는 대신, 모든 필드를 초기화하여 필요에 따라 이미지를 추가로 업로드할 수 있음을 알리고 현재 업로드 중인 이미지의 상태는 우측 하단에 별도로 띄워 확인할 수 있도록 하였습니다.

```ts
// 업로드 상태창에 내용을 추가/업데이트하는 커스텀 훅

import { uploadStatusState } from "@/recoil/states";
import { UploadStatuses, ImageData } from "@/types";
import _ from "lodash";
import { useSetRecoilState } from "recoil";

const useUpdateUploadStatus = () => {
  const setUploadStatus = useSetRecoilState(uploadStatusState);

  const updateUploadStatus = ({
    id,
    status,
    previewURL = "",
    failMessage = "",
    imageData = null,
  }: {
    id: string;
    status: UploadStatuses;
    previewURL?: string;
    failMessage?: string;
    imageData?: ImageData | null | undefined;
  }) => {
    setUploadStatus((prev) => {
      const newUploadStatus = _.cloneDeep(prev);

      // 업로드가 새롭게 추가되는 경우
      if (status === "start") {
        newUploadStatus.push({
          id,
          previewURL,
          createdAt: Date.now(),
          status,
          failMessage,
        });
      } else {
        // 기존 업로드 상태를 업데이트하는 경우
        const targetIndex = prev.findIndex((upload) => upload.id === id);
        newUploadStatus.splice(targetIndex, 1, {
          ...prev[targetIndex],
          status,
          failMessage,
          imageData,
        });
      }

      return newUploadStatus;
    });
  };

  return { updateUploadStatus };
};

export default useUpdateUploadStatus;
```

상태창의 관리는 업로드 상태를 관리하는 커스텀 훅을 만들고 업로드 과정 중간중간에 호출해 상태창의 ui를 업데이트할 수 있도록 하였습니다.

```ts
// 업로드 과정 중간중간에 아래와 같이 훅을 호출해 상태창을 업데이트합니다.

const { updateUploadStatus } = useUpdateUploadStatus();

updateUploadStatus({
  id: imageId,
  status: "start",
  previewURL: previewURL,
});
updateUploadStatus({
  id: imageId,
  status: "compressing",
});
updateUploadStatus({
  id: imageId,
  status: "analyzing",
});
updateUploadStatus({
  id: imageId,
  status: "uploadFile",
});
updateUploadStatus({
  id: imageId,
  status: "uploadData",
});
updateUploadStatus({
  id: imageId,
  status: "done",
  imageData: data,
});
updateUploadStatus({ id: imageId, status: "fail", failMessage: message });
```

<br />

### - 업로드 중 이탈 방지

또한 이미지 업로드 과정 중 페이지를 이탈해 과정이 중단되는 경우를 방지하기 위해 업로드 시작 시 이벤트 핸들러를 추가하고 업로드가 완료되면 핸들러를 제거하도록 하였습니다.

```ts
const handleBeforeUnload = (event: any) => {
  event.preventDefault();
  event.returnValue = "";
  return "";
};

window.addEventListener("beforeunload", handleBeforeUnload);
```

<br />
<br />

# 3. 이미지 편집

<p align="center">
  <img alt="이미지 수정 2" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmYzOThtbnZyMWlwbnVoa3luc2ZtNzV2Z2sxbzdoNmluYnZucXZ1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NOtU36KpDTbnN8xv4C/giphy.gif">
</p>

업로드할 이미지를 자르거나, 메타데이터 정보를 추가, 필름 효과를 넣고 필요한 경우 이미지를 로컬에 저장할 수 있는 기능을 JavaScript Canvas를 활용해 구현하였습니다.

이미지를 자르는 영역을 표시할 리사이저는 css resize 속성을 적용한 html 태그를 canvas 위에 겹쳐서 구현하였습니다.

리사이저의 사이즈 변화는 ResizeObserver로, 리사이저의 위치 이동은 mousedown과 mousemove 이벤트로 감지하였습니다.

<br />

## 3-1. 뷰포트에 맞게 캔버스 사이즈 조절

이미지의 사이즈를 그대로 캔버스 사이즈에 사용할 경우, 이미지 사이즈가 뷰포트보다 크면 캔버스가 잘리게 됩니다.

따라서 이미지의 종횡비를 유지하며 뷰포트에 맞는 새로운 사이즈를 계산하고 그 값을 캔버스의 **cvs.style.width**와 **cvs.style.height**에 할당합니다.

단, **cvs.width**와 **cvs.height**는 실제 이미지 사이즈 값을 할당해야 합니다.

  <br />

> **cvs.style.width와 cvs.width의 차이**
>
> cvs.style.width(혹은 height)는 캔버스가 화면에 보여질 크기를 조절하는데 사용됩니다.  
> 반면에 cvs.width(혹은 height)는 캔버스의 실제 픽셀 해상도를 조절하는데 사용됩니다.
>
> 캔버스에 실제 그릴 수 있는 영역의 크기는 cvs.width이지만 화면에 출력될 때는 cvs.style.width의 사이즈로 비율에 맞게 축소되어 그려지게 됩니다.
>
> 따라서 cvs.style.width를 축소된 이미지 사이즈로 할당했다 하더라도 cvs.width는 실제 이미지 크기로 할당하고 이미지를 그릴 때도 실제 이미지 크기로 그려야 이미지를 출력하거나 다운받을 때 화질 저하가 발생하지 않습니다.

```ts
// 사이즈 계산, 윈도우 리사이즈 핸들러
useEffect(() => {
  const windowResizeHandler = _.throttle(() => {
    if (!cvs || !ctx) return;

    // 캔버스의 사이즈
    const cvsWidth = window.innerWidth;
    const cvsHeight = window.innerHeight;
    setCvsSize([cvsWidth, cvsHeight]);

    // 이미지의 실제 사이즈
    const originImgWidth = imgData.originSize.width;
    const originImgHeight = imgData.originSize.height;

    // 종횡비
    const cvsAspectRatio = cvsWidth / cvsHeight;
    const imgAspectRatio = originImgWidth / originImgHeight;

    // 장치의 픽셀 밀도에 맞춰 캔버스의 크기와 해상도를 조절
    const dpr = window.devicePixelRatio || 1;
    cvs.width = originImgWidth * dpr;
    cvs.height = originImgHeight * dpr;
    ctx.scale(dpr, dpr);

    // // // // // // // // // // //
    // 화면에 보여질 캔버스의 크기 조절 //
    // // // // // // // // // // //

    // 화면에 보여질 캔버스의 크기
    let frontCvsWidth = cvsWidth;
    let frontCvsHeight = cvsHeight;

    // 캔버스의 크기를 이미지 종횡비에 맞게 조절하기
    // 캔버스의 가로 비율이 이미지 가로비율보다 더 넓은 경우
    if (cvsAspectRatio > imgAspectRatio) {
      // 보여질 캔버스 높이를 캔버스 높이에 맞추고 너비는 비례하게 크기 조절
      frontCvsHeight = cvsHeight;
      frontCvsWidth = frontCvsHeight * imgAspectRatio;
      // 캔버스 세로 비율이 이미지 세로비율보다 더 긴 경우
    } else if (cvsHeight < originImgHeight) {
      // 보여질 캔버스 너비를 캔버스 너비에 맞추고 높이는 비례하게 크기 조절
      frontCvsWidth = cvsWidth;
      frontCvsHeight = frontCvsWidth * (originImgHeight / originImgWidth);
    }
    // 보여질 캔버스에서 하단 툴바 높이만큼 빼기 (너비도 비울에 맞게 빼줌)
    // 96 = 하단 툴바 높이
    frontCvsWidth = frontCvsWidth - 96 * (frontCvsWidth / frontCvsHeight);
    frontCvsHeight = frontCvsHeight - 96;

    // 계산한 사이즈 지정
    cvs.style.width = frontCvsWidth + "px";
    cvs.style.height = frontCvsHeight + "px";
    setFrontCvsSize([frontCvsWidth, frontCvsHeight]);
  }, 100);

  windowResizeHandler();

  window.addEventListener("resize", windowResizeHandler);

  return () => {
    window.removeEventListener("resize", windowResizeHandler);
  };
}, [ctx, cvs, imgData.originSize.height, imgData.originSize.width]);
```

<br />

## 3-2. 리사이저 좌표 구하기

사용자가 뷰포트 크기를 변경하는 등의 이유로 **이미지의 크기가 변해 리사이저의 크기와 위치가 의도치않게 변경되는 현상을 방지**하고자 리사이저의 크기와 위치는 이미지에 대한 상대좌표로 구하였습니다.

- **절대 좌표로 리사이저의 좌표값을 구하는 경우 (X)**

  <img alt="이미지 자르기 절대좌표 설명" src="https://github.com/user-attachments/assets/e303eb73-a667-4abf-b216-04652610818c" />

  사용자가 뷰포트의 크기를 조절하면 이미지의 크기가 변하지만 리사이저의 사이즈와 좌표는 그대로기 때문에 자르는 위치가 바뀝니다.

<br/>

- **이미지의 상대 좌표(백분율)로 리사이저의 좌표값을 구하는 경우 (O)**

  <img alt="이미지 자르기 상대좌표 설명" src="https://github.com/user-attachments/assets/8b18f74e-1941-49f8-bec0-bd5a027fe330" />

  이미지 사이즈에 대한 백분율로 리사이저의 좌표를 저장하면 이미지의 크기가 아무리 변해도 이미지의 바뀐 사이즈만 알면 동일한 위치에 리사이저를 그릴 수 있습니다.

<br />

## 3-3. 편집 완료된 이미지 캡쳐

편집을 완료한 이미지를 캡쳐할 캔버스를 생성합니다.  
기존 캔버스는 원본 이미지를 모두 그렸지만 캡쳐할 캔버스에는 이미지를 자른 부분만 그립니다.

캡쳐 캔버스는 로컬로 다운로드하거나 기존의 첨부파일을 대체하는데 사용할 수 있습니다.

```ts
// 캡쳐용 캔버스 생성 및 그리기
const capture = () => {
  if (!cvs) {
    return;
  }

  const sourceCvs = cvs;

  const captureCvs = document.createElement("canvas");
  const captureCtx = captureCvs.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  // 편집을 완료하거나 이미지를 다운받을 때는 이미지를 자른 부분만 그린다.
  captureCvs.width = cropSize[0];
  captureCvs.height = cropSize[1];

  captureCtx?.drawImage(
    sourceCvs,
    cropPos[0] * dpr,
    cropPos[1] * dpr,
    cropSize[0] * dpr,
    cropSize[1] * dpr,
    0,
    0,
    cropSize[0],
    cropSize[1],
  );

  return captureCvs;
};

// 로컬로 다운로드
const downloadImg = () => {
  const captureCvs = capture();

  if (!captureCvs) {
    return;
  }

  const capturedImgURL = captureCvs.toDataURL("image/webp");
  const downloadLink = document.createElement("a");
  downloadLink.href = capturedImgURL;
  downloadLink.download = `${imgData.originalName}.webp`;
  downloadLink.click();
};

// 기존 첨부 이미지 대체
const onDoneClick = () => {
  const captureCvs = capture();

  if (!captureCvs) {
    return;
  }

  captureCvs.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const file = new File([blob], imgData.fileName, { type: "image/webp" });
    onSelectImage(file);
  });
};
```

<br />
<br />

# 4. 검색

<img alt="검색" src="https://github.com/user-attachments/assets/c951f499-e642-4e6c-a67b-77d457645410">

이미지 업로드 과정에서 ai를 통해 추출한 키워드로 이미지를 검색할 수 있게 하였습니다.

<br />

## 4-1. 검색어 제안

사용자가 검색어를 입력하는 과정에서 검색어를 제안해주는 기능은 "es-hangul" 라이브러리를 활용하였습니다.

```ts
// 존재하는 모든 키워드 불러오기
const newSuggestions = _.cloneDeep(existTagList);

// 키워드들을 반복문으로 순회하며 현재 입력값과 일치하는 부분만 남기고 나머지는 삭제
for (const [tag, count] of Object.entries(newSuggestions)) {
  const notIncludes = !(
    hangulIncludes(tag, value) || choseongIncludes(tag, value)
  );

  if (notIncludes) {
    delete newSuggestions[tag];
  }
}

setSuggestions(newSuggestions);
```

<br />

## 4-2. 최근 검색 기록

로컬스토리지를 활용해 유저별로 최근 검색 기록을 저장할 수 있도록 하였습니다.

```ts
// 검색
const onSubmit = (e: FormEvent) => {
  e.preventDefault();
  setShowDropdown(false);
  setSearchHistory((prev) => {
    const newHistory = Array.from(new Set([value, ...prev]));
    localStorage.setItem(
      "sh-" + authStatus.data?.uid || "",
      JSON.stringify(newHistory),
    );
    return newHistory;
  });
  inputRef.current?.blur();
  push("/search?query=" + value.split(" ").join("&query="));
};
```

<br />
<br />

# 5. 알림

다음과 같은 상황에서 알림을 수신합니다.

1. 다른 유저가 나를 팔로우함.
2. 다른 유저가 내 사진에 좋아요를 누름.
3. 다른 유저가 내 사진에 댓글을 남김.
4. 다른 유저가 내 댓글에 답글을 남김.

<br />

## 5-1. 인 앱 알림

<img width="1837" alt="알림창" src="https://github.com/user-attachments/assets/b14a70e8-2986-4b67-84e1-98d842b4170b">

인 앱 알림의 발신은 db의 각 유저 데이터에 notification 문서를 생성하고, 해당 유저의 콘텐츠에 상호작용이 발생할 경우 notification 문서에 내용을 업데이트하는 방식을 사용하였습니다.

알림의 수신은 firestore의 실시간 업데이트 수신 대기를 통해 notification 문서에 추가된 내용을 즉각적으로 받아와 알림 담벼락에 업데이트할 수 있도록 하였습니다.

<br />

### 같은 유형 알림 합치기

<img alt="알림 합치기" src="https://github.com/user-attachments/assets/6cfa72b6-cfad-4d10-ad27-26b4c14caf5e">

같은 콘텐츠에서 발생한 동일한 유형의 알림은 합쳐서 출력하도록 하였습니다.

```ts
// 동일한 타입의 알림들을 전달받아 묶을 수 있는 애들끼리 묶는 함수
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
    // 팔로우 타입의 알림들 합치기
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

// 새 알림을 수신할 때마다 실행
useEffect(() => {
  if (authStatus.status !== "signedIn" || !newNotificationReception) return;

  // 알림을 타입별로 분류
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

  // _.sortBy로 새롭게 가공한 알림들을 다시 수신순으로 정렬
  const newNotification = _.sortBy(
    // 타입별로 분류된 알림들을 mergeNotification에 전달해 합칠 수 있는 알림들은 합친다.
    Object.entries(categorizedNotification).reduce(
      (acc, [type, subjects], i) => {
        const mergedNotification = mergeNotification({ type, subjects });
        acc.push(...mergedNotification);
        return acc;
      },
      [] as Array<InAppNotification>,
    ),
    "createdAt",
  );

  // 가공한 알림 목록으로 업데이트
  const docRef = doc(db, "users", authStatus.data.uid, "notification", "data");
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
```

<br />
<br />

## 5-2. 웹 푸시 알림

<img alt="웹 푸시(pc)" src="https://github.com/user-attachments/assets/8088a7d3-b259-4f9e-a384-b92d313dfacb">
<img alt="웹 푸시(ios)" src="https://github.com/user-attachments/assets/70a97c59-6e93-4a2a-bd31-95af3d54ecaf">

사용자가 앱을 종료한 상태에서도 백그라운드 푸시 알림을 전송할 수 있습니다.

콘텐츠의 소유자가 푸시 알림을 허용한 경우 해당 사용자의 유저 데이터에 푸시 토큰이 저장됩니다. 다른 사용자가 콘텐츠에 상호작용하면 콘텐츠 소유자의 푸시 토큰이 존재하는지 확인하고, 존재한다면 해당 토큰에 웹 푸시 알림을 전송하게 됩니다.

아래 코드는 인 앱 알림과 웹 푸시를 전송하는 서버 api의 전문입니다.  
해당 코드에서는 다음 내용을 처리하게 됩니다.

1. 알림의 내용과 전송 대상들의 uid를 전달받음.
2. 전송 대상들의 notification 문서를 업데이트해 인 앱 알림을 발신할 준비.
3. 전송 대상들의 푸시 토큰을 불러오고 푸시 알림을 발신할 준비.
4. notification 문서 업데이트와 푸시 알림 전송 실행.
5. 푸시 발신에 실패한 토큰은 만료시킴.

```ts
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
    // id 배열을 길이 30으로 제한하여 나누기 (firebase 쿼리 제한 걸림)
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
```

<br />
<br />

# 6. 댓글

<img alt="댓글과 답글" src="https://github.com/user-attachments/assets/7f9bf63e-929f-44cf-a627-d465bd13d599">

이미지에 댓글을 남길 수 있으며 댓글에 대한 답글도 작성할 수 있습니다.

댓글창의 UI는 css의 sticky 속성을 활용해 댓글 목록을 스크롤하는 동안 이미지와 댓글 작성란이 화면에 지속적으로 노출되도록 하였습니다. [예시 페이지 링크](https://folio-jpeg.com/image/e1504520-4545-4d31-8a9c-e841a0c9981f)

<p align="center">
  <img alt="댓글 스크롤" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDV0b2F6eXdxMXNtbjdnNWgxM2xjcmFwazJxYWluYm5nMWxwNWE2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MTKCIMGKOoMJw0OLjD/giphy.gif">
</p>
<p align="center">
  <img alt="댓글 스크롤 세로" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzI3ZzBvcjhqZDg1OTBlc3BzYWszYXN6ZjRvenE4dm84bGI2ZWFnYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kGoOJIcEkXL6XupFet/giphy.gif">
</p>

<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />

<br />
