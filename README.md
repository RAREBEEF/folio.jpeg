# **FOLIO.JPEG**

<br />
<br />

# 프로젝트 소개

<img alt="홈화면" src="https://github.com/user-attachments/assets/e7c5a497-e2f4-4d8b-91a3-907ac2b039cf" />

**FOLIO.JPEG**는 핀터레스트를 벤치마킹한 이미지 공유형 소셜미디어입니다.

이미지 업로드, 팔로우와 좋아요, 댓글 등 소셜미디어의 기본 기능과 이를 위한 웹 푸시 알림 기능을 구현하였고 Google의 Gemini AI를 접목해 업로드한 이미지를 분석하고 키워드와 대표 색상 등을 추출하거나 이미지에 대한 피드백, 부적절성 검사 등의 기능을 구현하였습니다.

<br />

## 주요 기능

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

## 사용된 기술 스택

- Next 14
- TypeScript
- TailwindCss
- Recoil
- Firebase

<br />
<br />

# 상세 설명

_설명에 포함된 코드는 실제 코드에서 발췌해 설명에 용이하도록 일부 수정된 부분이 있을 수 있으며 앞뒤로 생략된 코드가 존재할 수 있습니다._

<br />

## 1. Masonry Grid (세로 방향 정렬 그리드)

<img alt="이미지 그리드 (Masonry Grid, 핀터레스트식 그리드)" src="https://github.com/user-attachments/assets/c279a740-6051-4a85-bc68-aaaca942659e">

높이가 통일되지 않은 이미지들을 무한스크롤로 불러올 때, 각 열의 높이를 균등하게 유지하며 이미지를 추가할 수 있도록 Masonry Grid를 구현했습니다.

css grid에 masonry 속성이 존재하지만 아직 실험적 기능이고 지원하는 브라우저가 극히 일부이기 때문에 자바스크립트로 구현하였습니다.

구현 방식을 간단하게 설명하면 아래와 같습니다.

1. 뷰포트의 너비가 주어지면 그에 맞춰 그리드를 초기화한다. (열의 개수와 너비 등)
2. 새로운 이미지가 로드되면 길이가 가장 짧은 열을 찾는다.
3. left:0;top:0;으로 이미지의 위치를 초기화한다.
4. transform으로 이미지의 위치를 지정한다. (추가할 열의 index와 누적 높이, 이미지의 높이와 각 열의 너비 등을 토대로 계산)
5. 이미지의 높이만큼 열의 길이를 업데이트한다.
6. 새로운 이미지가 로드되면 2번부터 반복

### 컨테이너 너비에 따라 그리드 초기화

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

### 그리드의 각 열에 이미지 추가하기

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
    // 모든 이미지의 너비를 통일하기 위해 종횡비를 유지하며 계산한 높이.
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

## 2. 이미지 첨부 / 분석 / 업로드

### 2-1. 이미지 첨부

<img alt="이미지 업로드 1" src="https://github.com/user-attachments/assets/175a2687-bdd4-426d-bb66-95fdabf790c9">

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

### 2-2. 이미지 업로드

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

#### - 이미지 압축

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

#### - 이미지 분석

이미지 분석은 Google의 Gemini api를 활용했습니다. 백엔드로 Firebase를 사용했기 때문에 간단하게 연동할 수 있었습니다.

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

#### - 이미지 업로드 상태창

<img alt="업로드창 2" src="https://github.com/user-attachments/assets/2ec44354-4c6d-4e14-a62e-dd22357831e4">

이미지 업로드 자체는 그다지 긴 시간이 필요하지 않지만 이미지를 분석하는데에는 꽤 오랜 시간이 소요됩니다.

따라서 이미지 업로드/분석 중 사용자에게 로딩창을 보여주는 대신, 모든 필드를 초기화하여 필요에 따라 이미지를 추가로 업로드할 수 있음을 알리고 현재 업로드 중인 이미지의 상태는 우측 하단에 별도로 띄워 확인할 수 있도록 하였습니다.

업로드 상태를 관리하는 커스텀 훅을 만들고 업로드 과정 중간중간에 호출해 상태창의 ui를 업데이트할 수 있도록 하였습니다.

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

#### - 업로드 중 이탈 방지

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

## 3. 이미지 편집

<img alt="이미지 수정 2" src="https://github.com/user-attachments/assets/cbefea41-f961-4640-8ac1-cac933206c14">

이미지를 업로드하기 전에 이미지를 자르거나, 메타데이터를 추가하거나 또는 필름 효과를 넣을 수 있도록 하였습니다.

// 코드 추가하기
// 뷰포트 크기가 변해도 이미지 자른 위치를 유지하기 위해 상대좌표를 사용했음을 작성

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
<br />
<br />
<br />
<br />
<br />
<br />
<br />
````
