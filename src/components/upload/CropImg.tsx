import { ImageMetadata } from "@/types";
import {
  ChangeEvent,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import _ from "lodash";
import loadImage from "@/tools/loadImage";
import CloseSvg from "@/icons/xmark-solid.svg";

const CropImg = ({
  imgData,
  onToggleCropImgMode,
  onSelectImage,
  close,
  cropDataSetter,
  prevCropData = {
    metadataOverlay: false,
    filmStyleOverlay1: false,
    filmStyleOverlay2: false,
    resizerCoords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    cropPos: [0, 0],
    cropSize: [0, 0],
  },
}: {
  imgData: {
    originFile: File | null;
    file: File | null;
    previewURL: string;
    originPreviewURL: string;
    id: string;
    fileName: string;
    originalName: string;
    originByte: number;
    originSize: {
      width: number;
      height: number;
    };
    byte: number;
    size: {
      width: number;
      height: number;
    };
    imgMetaData: ImageMetadata;
  };
  onToggleCropImgMode: MouseEventHandler<HTMLButtonElement>;
  onSelectImage: (file: File) => Promise<void>;
  close: Function;
  cropDataSetter: Dispatch<
    SetStateAction<{
      metadataOverlay: boolean;
      filmStyleOverlay1: boolean;
      filmStyleOverlay2: boolean;
      resizerCoords: { x1: number; y1: number; x2: number; y2: number };
      cropPos: [number, number];
      cropSize: [number, number];
    }>
  >;
  prevCropData?: {
    metadataOverlay: boolean;
    filmStyleOverlay1: boolean;
    filmStyleOverlay2: boolean;
    resizerCoords: { x1: number; y1: number; x2: number; y2: number };
    cropPos: [number, number];
    cropSize: [number, number];
  };
}) => {
  const [metadataOverlay, setMetadataOverlay] = useState<boolean>(
    prevCropData.metadataOverlay,
  );
  const [filmStyleOverlay1, setFilmStyleOverlay1] = useState<boolean>(
    prevCropData.filmStyleOverlay1,
  );
  const [filmStyleOverlay2, setFilmStyleOverlay2] = useState<boolean>(
    prevCropData.filmStyleOverlay2,
  );
  // 캔버스 및 콘텍스트
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const [cvs, setCvs] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [cvsSize, setCvsSize] = useState<[number, number]>([0, 0]);
  // 리사이즈 관련
  const resizerRef = useRef<HTMLSpanElement>(null);
  const [resizerMaxSize, setResizerMaxSize] = useState<[number, number]>([
    imgData.originSize.width,
    imgData.originSize.height,
  ]);
  const [frontCvsSize, setFrontCvsSize] = useState<[number, number]>([
    imgData.originSize.width,
    imgData.originSize.height,
  ]);
  // 이미지 상에서 리사이저의 좌상단과 우하단의 좌표.
  // 캔버스 크기가 변경되어도 같은 크롭 위치를 유지하기 위해 리사이즈의 크기와 위치를 이미지상의 좌표로 계산한다.
  const [resizerCoords, setResizerCoords] = useState(
    prevCropData.resizerCoords,
  );

  const [cropPos, setCropPos] = useState<[number, number]>(
    prevCropData.cropPos,
  );
  const [cropSize, setCropSize] = useState<[number, number]>(
    prevCropData.cropSize,
  );
  console.log(imgData);
  // 캔버스와 콘텍스트 초기화
  useEffect(() => {
    if (!cvsRef.current) {
      return;
    }

    const cvs = cvsRef.current;
    const ctx = cvs.getContext("2d");

    setCvs(cvs);
    setCtx(ctx);
  }, [cvsRef]);

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

      const dpr = window.devicePixelRatio || 1;

      // 실제 캔버스의 크기
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

  //
  // 리사이저 이동
  //
  const onResizerMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    // 리사이징을 시작한 마우스의 좌표
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    // 리사이저의 좌표로 계산한 리사이저의 실제 시작 위치(px)
    const startResizerX = resizerCoords.x1 * frontCvsSize[0];
    const startResizerY = resizerCoords.y1 * frontCvsSize[1];
    const resizerWidth =
      (resizerCoords.x2 - resizerCoords.x1) * frontCvsSize[0];
    const resizerHeight =
      (resizerCoords.y2 - resizerCoords.y1) * frontCvsSize[1];

    const windowMouseMoveHandler = (e: MouseEvent) => {
      // 마우스의 이동 거리(px)
      const movementX = e.clientX - startMouseX;
      const movementY = e.clientY - startMouseY;

      // // 리사이저의 도착 지점(px)
      const newX = Math.min(
        Math.max(startResizerX + movementX, 0),
        frontCvsSize[0] - resizerWidth,
      );
      const newY = Math.min(
        Math.max(startResizerY + movementY, 0),
        frontCvsSize[1] - resizerHeight,
      );

      setResizerCoords((prev) => {
        // 리사이저의 이동거리(좌표)
        const moveCoordinateX = newX / frontCvsSize[0] - prev.x1;
        const moveCoordinateY = newY / frontCvsSize[1] - prev.y1;

        // 새로운 좌표로 업데이트
        return {
          x1: newX / frontCvsSize[0],
          y1: newY / frontCvsSize[1],

          x2: prev.x2 + moveCoordinateX,
          y2: prev.y2 + moveCoordinateY,
        };
      });
    };
    window.addEventListener("mousemove", windowMouseMoveHandler);
    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", windowMouseMoveHandler);
      },
      { once: true },
    );
  };

  //
  // 리사이즈 옵저버
  //
  useEffect(() => {
    if (!resizerRef.current) {
      return;
    }

    const resizer = resizerRef.current;
    const resizeObserver = new ResizeObserver(
      _.debounce((entries: ResizeObserverEntry[]) => {
        for (let entry of entries) {
          console.log("리사이즈");

          // 리사이저의 너비와 높이(px)
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;

          // 새로운 너비와 높이를 기반으로 리사이저의 좌표 업데이트
          setResizerCoords((prev) => {
            // 리사이저 좌상단의 위치(px)
            const x1Pos = prev.x1 * frontCvsSize[0];
            const y1Pos = prev.y1 * frontCvsSize[1];
            // 리사이저 우하단의 기존 위치(px)에 새로 변경된 너비와 높이를 더함.
            const x2Pos = x1Pos + width;
            const y2Pos = y1Pos + height;

            // 새로운 좌표로 업데이트
            return {
              x1: prev.x1,
              y1: prev.y1,
              x2: x2Pos / frontCvsSize[0],
              y2: y2Pos / frontCvsSize[1],
            };
          });

          // 리사이즈로 이벤트로 인라인 속성이 최대값을 넘어 업데이트되는 것을 방지
          // resizer.style.width = `${width}px`;
          // resizer.style.height = `${height}px`;
        }
      }, 200),
    );

    resizeObserver.observe(resizer);

    return () => {
      resizeObserver.unobserve(resizer);
    };
  }, [frontCvsSize, resizerRef]);

  // 캔버스의 사이즈가 변경될 때 리사이저의 좌표를 활용해 위치와 크기를 같은 비율로 유지
  useEffect(() => {
    if (!resizerRef.current) {
      return;
    }

    const resizer = resizerRef.current;
    resizer.style.width = `${(resizerCoords.x2 - resizerCoords.x1) * frontCvsSize[0]}px`;
    resizer.style.height = `${(resizerCoords.y2 - resizerCoords.y1) * frontCvsSize[1]}px`;

    setResizerMaxSize([
      frontCvsSize[0] - resizerCoords.x1 * frontCvsSize[0],
      frontCvsSize[1] - resizerCoords.y1 * frontCvsSize[1],
    ]);
  }, [
    frontCvsSize,
    resizerCoords.x1,
    resizerCoords.x2,
    resizerCoords.y1,
    resizerCoords.y2,
  ]);

  //
  // 그리기
  //
  useEffect(() => {
    if (!cvs || !ctx) {
      return;
    }

    // 이미지의 실제 사이즈
    const originImgWidth = imgData.originSize.width;
    const originImgHeight = imgData.originSize.height;
    // 보여지는 캔버스의 사이즈
    const [frontCvsWidth, frontCvsHeight] = frontCvsSize;

    // 보여지는 캔버스에서의 리사이저의 너비와 높이 (px)
    const resizerWidth = (resizerCoords.x2 - resizerCoords.x1) * frontCvsWidth;
    const resizerHeight =
      (resizerCoords.y2 - resizerCoords.y1) * frontCvsHeight;

    // 실제 이미지와 조절한 이미지의 크기 비율 계산
    const widthRatio = originImgWidth / frontCvsWidth;
    const heightRatio = originImgHeight / frontCvsHeight;

    // 리사이저의 실제 비율 오프셋 (px)
    const resizerOffsetX = resizerCoords.x1 * originImgWidth;
    const resizerOffsetY = resizerCoords.y1 * originImgHeight;
    setCropPos([resizerOffsetX, resizerOffsetY]);

    // 실제 이미지 사이즈에 맞게 배율 조절한 리사이저의 사이즈
    const realResizerWidth = resizerWidth * widthRatio;
    const realResizerHeight = resizerHeight * heightRatio;
    setCropSize([realResizerWidth, realResizerHeight]);

    // // // // // // // // // // //
    //    계산 끝, 이제 그릴 시간      //
    // // // // // // // // // // //

    (async () => {
      // 사용할 폰트
      const digitalFont = new FontFace("digital", "url(/fonts/digital-7.ttf)");
      const LAB디지털Font = new FontFace(
        "LAB디지털",
        "url(/fonts/LAB디지털.ttf)",
      );
      // 이미지와 폰트 모두 불러오기
      const [
        img,
        ISOIcon,
        shutterSpeedIcon,
        filmStyle1,
        filmStyle2,
        font1,
        font2,
      ] = await Promise.all([
        loadImage(imgData.originPreviewURL),
        loadImage("/images/ISO.svg"),
        loadImage("/images/shutter_speed.svg"),
        loadImage("/images/film-grain-overlay.png"),
        loadImage("/images/film-color-overlay.jpg"),
        digitalFont.load().then((font) => {
          document.fonts.add(font);
          return font;
        }),
        LAB디지털Font.load().then((font) => {
          document.fonts.add(font);
          return font;
        }),
      ]);

      //
      // 콘텍스트 초기화
      //
      // 이전 그린 내용 지우기
      ctx.clearRect(0, 0, originImgWidth, originImgHeight);
      // 쉐도우 비활성
      ctx.shadowBlur = 0;
      // 투명도 비활성
      ctx.globalAlpha = 1;

      // 이미지 그리기.
      ctx.drawImage(img, 0, 0, originImgWidth, originImgHeight);

      // 메타데이터 그리기
      if (metadataOverlay) {
        // 메타데이터 영역을 리사이저의 크기에 맞추기
        const metadataWidth = metadataOverlay ? realResizerWidth : 0;
        const metadataHeight = metadataOverlay
          ? (realResizerWidth + realResizerHeight) / 8
          : 0;

        // 텍스트 스타일
        const fontSize = metadataHeight / 7;
        const textPadding = fontSize;
        ctx.font = `${fontSize}px digital, LAB디지털, monospace`;

        // 텍스트에 적용할 효과들
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "orange";
        ctx.shadowColor = "#4f3300";
        ctx.shadowBlur = 10;

        // 각 줄 텍스트의 높이 (캔버스 기준 맨 아래가 3번 줄)
        const firstLineY =
          realResizerHeight - fontSize * 2 - textPadding + resizerOffsetY;
        const secondLineY =
          realResizerHeight - fontSize - textPadding + resizerOffsetY;
        const thirdLineY = realResizerHeight - textPadding + resizerOffsetY;

        // 각 줄의 자리가 이미 차지되었는지 체크용 배열
        const leftSideLinesOccupied: Array<boolean> = [];
        const rightSideLinesOccupied: Array<boolean> = [];
        // // //
        // 좌측 //
        // // //

        // 렌즈
        if (imgData.imgMetaData.lensModel) {
          ctx.fillText(
            imgData.imgMetaData.lensModel,
            textPadding + resizerOffsetX,
            thirdLineY,
          );
          leftSideLinesOccupied.push(true);
        }

        // 바디
        if (imgData.imgMetaData.model) {
          ctx.fillText(
            imgData.imgMetaData.model,
            textPadding + resizerOffsetX,
            // 렌즈 데이터가 없으면 아래줄로
            leftSideLinesOccupied[0] ? secondLineY : thirdLineY,
          );
        }
        // // //
        // 우측 //
        // // //

        // // 우측에 작성할 텍스트들과 그 너비
        const focalLengthText = imgData.imgMetaData.focalLength || "";
        const focalLengthWidth = ctx.measureText(focalLengthText).width;

        const fNumberText = imgData.imgMetaData.fNumber || "";
        const fNumberWidth = ctx.measureText(fNumberText).width;

        const shutterSpeedText = imgData.imgMetaData.shutterSpeed
          ? imgData.imgMetaData.shutterSpeed.replaceAll(/s/gi, "")
          : "";
        const shutterSpeedWidth = ctx.measureText(shutterSpeedText).width;

        const ISOText = imgData.imgMetaData.ISO
          ? imgData.imgMetaData.ISO.toString()
          : "";
        const ISOWidth = ctx.measureText(ISOText).width;

        const createDateText = imgData.imgMetaData.createDate || "";
        const createDateWidth = ctx.measureText(createDateText).width;

        // // // // //
        // 우측 셋째 줄 //
        // // // // //
        // ISO
        if (ISOText) {
          ctx.fillText(
            ISOText,
            metadataWidth - ISOWidth - textPadding + resizerOffsetX,
            thirdLineY,
          );

          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 10;
          ctx.drawImage(
            ISOIcon,
            metadataWidth -
              ISOWidth -
              textPadding * 2 +
              resizerOffsetX -
              fontSize * 0.3,
            thirdLineY - fontSize * 0.825,
            fontSize,
            fontSize,
          );

          rightSideLinesOccupied.push(true);
        }

        // // // // //
        // 우측 둘째 줄 //
        // // // // //
        // 셔터스피드
        if (shutterSpeedText) {
          ctx.fillText(
            shutterSpeedText,
            metadataWidth - shutterSpeedWidth - textPadding + resizerOffsetX,
            rightSideLinesOccupied[0] ? secondLineY : thirdLineY,
          );

          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 10;
          ctx.drawImage(
            shutterSpeedIcon,
            metadataWidth -
              shutterSpeedWidth -
              textPadding +
              resizerOffsetX -
              fontSize * 0.75,
            (rightSideLinesOccupied[0] ? secondLineY : thirdLineY) -
              fontSize * 0.7,
            fontSize * 0.75,
            fontSize * 0.75,
          );

          rightSideLinesOccupied.push(true);
        }

        // // // // //
        // 우측 첫 줄 //
        // // // // //

        // 초점거리
        if (focalLengthText) {
          ctx.fillText(
            focalLengthText,
            metadataWidth -
              focalLengthWidth -
              fNumberWidth -
              textPadding * 1.5 +
              resizerOffsetX,
            rightSideLinesOccupied[1]
              ? firstLineY
              : rightSideLinesOccupied[0]
                ? secondLineY
                : thirdLineY,
          );
        }

        // 조리개값
        if (fNumberText) {
          ctx.fillText(
            fNumberText,
            metadataWidth - fNumberWidth - textPadding + resizerOffsetX,
            rightSideLinesOccupied[1]
              ? firstLineY
              : rightSideLinesOccupied[0]
                ? secondLineY
                : thirdLineY,
          );
        }

        // // // // //
        // 우측 상단 //
        // // // // //
        // 날짜
        createDateText &&
          ctx.fillText(
            createDateText,
            metadataWidth - createDateWidth - textPadding + resizerOffsetX,
            fontSize + resizerOffsetY + textPadding / 2,
          );
      }

      // // // // //
      // 필름 그레인 //
      // // // // //
      if (filmStyleOverlay1) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.2;
        ctx.drawImage(
          filmStyle1,
          resizerOffsetX,
          resizerOffsetY,
          realResizerWidth,
          realResizerHeight,
        );
      }

      // // // // //
      // 필름 색감 //
      // // // // //
      if (filmStyleOverlay2) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.2;
        ctx.drawImage(
          filmStyle2,
          resizerOffsetX,
          resizerOffsetY,
          realResizerWidth,
          realResizerHeight,
        );
      }
    })();
  }, [
    ctx,
    cvs,
    frontCvsSize,
    imgData.imgMetaData.ISO,
    imgData.imgMetaData.createDate,
    imgData.imgMetaData.fNumber,
    imgData.imgMetaData.focalLength,
    imgData.imgMetaData.lensModel,
    imgData.imgMetaData.model,
    imgData.imgMetaData.shutterSpeed,
    imgData.originPreviewURL,
    imgData.originSize.height,
    imgData.originSize.width,
    metadataOverlay,
    resizerCoords.x1,
    resizerCoords.x2,
    resizerCoords.y1,
    resizerCoords.y2,
    filmStyleOverlay2,
    filmStyleOverlay1,
  ]);

  // 메타데이터 오버레이 토글
  const onMetadataOverlayChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMetadataOverlay(e.target.checked);
  };
  // 필름 그레인 토글
  const onFilmStyle1Change = (e: ChangeEvent<HTMLInputElement>) => {
    setFilmStyleOverlay1(e.target.checked);
  };
  // 필름 컬러 토글
  const onFilmStyle2Change = (e: ChangeEvent<HTMLInputElement>) => {
    setFilmStyleOverlay2(e.target.checked);
  };

  //
  //
  //
  //
  //
  //
  //
  //

  const capture = () => {
    if (!cvs) {
      return;
    }

    const sourceCvs = cvs;

    const captureCvs = document.createElement("canvas");
    const captureCtx = captureCvs.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    captureCvs.width = cropSize[0];
    captureCvs.height = cropSize[1];

    // captureCvs.width = cropSize[0] * dpr;
    // captureCvs.height = cropSize[1] * dpr;
    // captureCtx?.scale(dpr, dpr);

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

    cropDataSetter({
      metadataOverlay,
      filmStyleOverlay1,
      filmStyleOverlay2,
      resizerCoords,
      cropPos,
      cropSize,
    });

    close();
  };

  return (
    <div className="space-between fixed left-0 top-0 z-40 flex h-full h-screen w-full w-screen flex-col bg-astronaut-950">
      <button
        onClick={onToggleCropImgMode}
        className="group fixed right-3 top-3 h-8 w-8"
      >
        <CloseSvg className="fill-astronaut-500 group-hover:fill-astronaut-800" />
      </button>
      <div className="relative m-auto scale-[0.95]">
        <canvas
          ref={cvsRef}
          style={{
            backgroundImage: `url(${imgData.originPreviewURL})`,
            backgroundSize: "contain",
          }}
          className="bottom-0 left-0 right-0 top-0 m-auto bg-astronaut-500 brightness-50"
        ></canvas>
        <span
          ref={resizerRef}
          style={{
            maxWidth: `${resizerMaxSize[0]}px`,
            maxHeight: `${resizerMaxSize[1]}px`,
            minWidth: "50px",
            minHeight: "50px",
            left: `${resizerCoords.x1 * frontCvsSize[0]}px`,
            top: `${resizerCoords.y1 * frontCvsSize[1]}px`,
          }}
          className="group absolute m-auto box-content resize overflow-auto border backdrop-brightness-200"
        >
          <div onMouseDown={onResizerMouseDown} className="h-full w-full"></div>
          <div className="absolute bottom-0 right-0 h-5 w-5 rounded-tl bg-astronaut-50 opacity-10 group-hover:opacity-100"></div>
        </span>
      </div>

      <div
        id="crop-img-toolbar"
        className="flex h-[96px] shrink-0 items-center justify-between gap-4 overflow-x-scroll break-keep bg-white p-4"
      >
        <div className="flex w-fit shrink-0 flex-col">
          <label className="flex h-fit gap-1">
            <div className="text-sm font-semibold">메타데이터</div>
            <input
              type="checkbox"
              onChange={onMetadataOverlayChange}
              checked={metadataOverlay}
            />
          </label>
          <label className="flex h-fit gap-1">
            <div className="text-sm font-semibold">필름 스타일 1</div>
            <input
              type="checkbox"
              onChange={onFilmStyle1Change}
              checked={filmStyleOverlay1}
            />
          </label>
          <label className="flex h-fit gap-1">
            <div className="text-sm font-semibold">필름 스타일 2</div>
            <input
              type="checkbox"
              onChange={onFilmStyle2Change}
              checked={filmStyleOverlay2}
            />
          </label>
        </div>
        <div className="flex h-fit gap-4">
          <Button onClick={onDoneClick}>
            <div className="text-xs">편집 완료</div>
          </Button>
          <Button onClick={downloadImg}>
            <div className="text-xs">이미지 다운로드</div>
          </Button>
          {/* <Button onClick={onToggleCropImgMode}>
            <div className="text-xs">닫기</div>
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default CropImg;

{
  /*
   <div
   style={{
     top: resizerPos[0],
     left: resizerPos[1],
     width: `${resizerSize[0]}px`,
     height: `${resizerSize[1]}px`,
   }}
   className="pointer-events-none absolute border border-dashed border-[red]"
 >
   <div
     onMouseDown={(e) => onResizeStart(e, "move", "mouse")}
     onTouchStart={(e) => onResizeStart(e, "move", "touch")}
     className="pointer-events-auto absolute bottom-0 left-0 right-0 top-0 m-auto h-full w-full cursor-move p-1"
   ></div>
   <div
     onMouseDown={(e) => onResizeStart(e, "left", "mouse")}
     onTouchStart={(e) => onResizeStart(e, "left", "touch")}
     className="pointer-events-auto absolute left-[-4px] h-full w-2 cursor-ew-resize"
   ></div>
   <div
     onMouseDown={(e) => onResizeStart(e, "right", "mouse")}
     onTouchStart={(e) => onResizeStart(e, "right", "touch")}
     className="pointer-events-auto absolute right-[-4px] h-full w-2 cursor-ew-resize"
   ></div>
   <div
     onMouseDown={(e) => onResizeStart(e, "top", "mouse")}
     onTouchStart={(e) => onResizeStart(e, "top", "touch")}
     className="pointer-events-auto absolute top-[-4px] h-2 w-full cursor-ns-resize"
   ></div>
   <div
     onMouseDown={(e) => onResizeStart(e, "bottom", "mouse")}
     onTouchStart={(e) => onResizeStart(e, "bottom", "touch")}
     className="pointer-events-auto absolute bottom-[-4px] h-2 w-full cursor-ns-resize"
   ></div>
 </div>
  */
}
