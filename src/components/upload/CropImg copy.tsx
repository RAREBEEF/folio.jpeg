import { ImageMetadata } from "@/types";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import Button from "../Button";
import _ from "lodash";
import sampleImg from "@/images/sample.jpg";

// const imgData = {
//   file: null,
//   previewURL: sampleImg.src,
//   id: "abc",
//   fileName: "abc.jpeg",
//   originalName: "abc.jpeg",
//   byte: 12,
//   size: {
//     width: 2104,
//     height: 1403,
//   },
//   imgMetaData: {
//     make: "NIKON CORPORATION",
//     model: "NIKON Z f",
//     lensMake: "NIKON CORPORATION",
//     lensModel: "NIKKOR Z 40mm f/2 se",
//     shutterSpeed: "1/1000s",
//     fNumber: "f/2",
//     ISO: 100,
//     focalLength: "40mm",
//     createDate: "2024/01/08",
//   },
// };

// TODO: 리사이저를 우측 하단에 놓고 크기를 키우면 리사이저 이동 시 크기가 변경됨.
// 깜빡임 완화

const CropImg = ({
  // imgData: productImgData,
  imgData,
  onToggleCropImgMode,
}: {
  imgData: {
    file: File | null;
    previewURL: string;
    id: string;
    fileName: string;
    originalName: string;
    byte: number;
    size: {
      width: number;
      height: number;
    };
    imgMetaData: ImageMetadata;
  };
  onToggleCropImgMode: MouseEventHandler<HTMLButtonElement>;
}) => {
  const [metadataOverlay, setMetadataOverlay] = useState<boolean>(false);
  const [metadataLayout, setMetadataLayout] = useState<boolean>(false);
  // 캔버스 및 콘텍스트
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const [cvs, setCvs] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [cvsSize, setCvsSize] = useState<[number, number]>([0, 0]);
  // 리사이즈 관련
  const resizerRef = useRef<HTMLSpanElement>(null);
  const [resizerSize, setResizerSize] = useState<[number, number]>([
    imgData.size.width,
    imgData.size.height,
  ]);
  const [resizerMaxSize, setResizerMaxSize] = useState<[number, number]>([
    imgData.size.width,
    imgData.size.height,
  ]);
  const [frontCvsSize, setFrontCvsSize] = useState<[number, number]>([
    imgData.size.width,
    imgData.size.height,
  ]);
  const [resizerPos, setResizerPos] = useState<[number, number]>([0, 0]);

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
    const windowResizeHandler = _.debounce(() => {
      if (!cvs || !ctx) return;

      // 캔버스의 사이즈
      const cvsWidth = window.innerWidth;
      const cvsHeight = window.innerHeight;
      setCvsSize([cvsWidth, cvsHeight]);

      // 이미지의 실제 사이즈
      const originImgWidth = imgData.size.width;
      const originImgHeight = imgData.size.height;

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
      if (cvsWidth < originImgWidth && cvsAspectRatio > imgAspectRatio) {
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

      // if (resizerPos[0] === 0 && resizerPos[1] === 0) {
      setResizerPos([0, 0]);
      setResizerMaxSize([frontCvsWidth, frontCvsHeight]);
      // }
    }, 100);

    windowResizeHandler();

    window.addEventListener("resize", windowResizeHandler);

    return () => {
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, [ctx, cvs, imgData.size.height, imgData.size.width]);

  // 리사이저 이동
  const onResizerMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startResizerX = resizerPos[0];
    const startResizerY = resizerPos[1];

    const windowMouseMoveHandler = (e: MouseEvent) => {
      const movementX = e.clientX - startMouseX;
      const movementY = e.clientY - startMouseY;
      const newX = Math.min(
        Math.max(startResizerX + movementX, 0),
        frontCvsSize[0] - resizerSize[0],
      );
      const newY = Math.min(
        Math.max(startResizerY + movementY, 0),
        frontCvsSize[1] - resizerSize[1],
      );

      setResizerPos([newX, newY]);
      setResizerSize((prev) => [prev[0], prev[1]]);
      setResizerMaxSize([frontCvsSize[0] - newX, frontCvsSize[1] - newY]);
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

  // 리사이즈 옵저버
  useEffect(() => {
    if (!resizerRef.current) {
      return;
    }

    const resizer = resizerRef.current;
    const resizeObserver = new ResizeObserver(
      _.throttle((entries: ResizeObserverEntry[]) => {
        for (let entry of entries) {
          console.log("리사이즈");
          const width = Math.min(entry.contentRect.width, resizerMaxSize[0]);
          const height = Math.min(entry.contentRect.height, resizerMaxSize[1]);
          // 사이즈 상태 업데이트
          setResizerSize([width, height]);
          // 리사이즈로 이벤트로 인라인 속성이 최대값을 넘어 업데이트되는 것을 방지
          resizer.style.width = `${width}px`;
          resizer.style.height = `${height}px`;
        }
      }, 200),
    );

    resizeObserver.observe(resizer);

    return () => {
      resizeObserver.unobserve(resizer);
    };
  }, [resizerMaxSize, resizerRef]);

  // FIXME:
  // 메타데이터 레이아웃은 이미지 높이에 비례하게 설정

  // 그리기
  useEffect(() => {
    if (!cvs || !ctx) {
      return;
    }

    // 대상 이미지
    const img = new Image();
    img.src = imgData.previewURL;

    // 이미지의 실제 사이즈
    const originImgWidth = imgData.size.width;
    const originImgHeight = imgData.size.height;
    // 보여지는 캔버스의 사이즈
    const [frontCvsWidth, frontCvsHeight] = frontCvsSize;

    const resizerWidth = resizerSize[0];
    const resizerHeight = resizerSize[1];

    // 실제 이미지와 조절한 이미지의 크기 비율 계산
    // 메타데이터 표시 영역의 사이즈
    const widthRatio = originImgWidth / frontCvsWidth;
    const heightRatio = originImgHeight / frontCvsHeight;

    // 실제 이미지 사이즈에 맞게 배율 조절한 리사이저의 사이즈
    const realResizerWidth = resizerWidth * widthRatio;
    const realResizerHeight = resizerHeight * heightRatio;

    // 메타데이터 영역을 리사이저의 크기에 맞춤
    const metadataWidth = metadataOverlay ? realResizerWidth : 0;
    const metadataHeight = metadataOverlay ? realResizerHeight / 5 : 0;
    const metadataY = realResizerHeight;

    // // // // // // // // // // //
    //    계산 끝, 이제 그릴 시간      //
    // // // // // // // // // // //

    ctx.clearRect(0, 0, originImgWidth, originImgHeight);

    // 이미지 로드
    img.onload = () => {
      ctx.drawImage(img, 0, 0, originImgWidth, originImgHeight);

      // 메타데이터 관련
      if (metadataOverlay) {
        const font1 = new FontFace("digital", "url(/fonts/digital-7.ttf)");
        const font2 = new FontFace("LAB디지털", "url(/fonts/LAB디지털.ttf)");
        const fontSize = metadataHeight / 8;
        const textPadding = fontSize / 2;

        font1.load().then(function (font1) {
          font2.load().then(function (font2) {
            document.fonts.add(font1);
            document.fonts.add(font2);

            ctx.globalAlpha = 0.9;

            // 텍스트 스타일 지정
            ctx.font = `${fontSize}px digital, LAB디지털, monospace`;
            // ctx.font = `${fontSize}px LAB디지털, monospace`;
            ctx.fillStyle = "orange";
            // // 지금부터 ctx에 그릴 요소에 쉐도우 활성
            ctx.shadowColor = "#4f3300";
            ctx.shadowBlur = 10;
            // 각 줄 텍스트의 높이 (캔버스 기준 맨 아래가 3번 줄)
            const firstLineY = metadataY - fontSize * 2 - textPadding;
            const secondLineY = metadataY - fontSize - textPadding;
            const thirdLineY = metadataY - textPadding;

            // // //
            // 좌측 //
            // // //

            // 바디
            imgData.imgMetaData.model &&
              ctx.fillText(imgData.imgMetaData.model, textPadding, secondLineY);
            // 렌즈

            imgData.imgMetaData.lensModel &&
              ctx.fillText(
                imgData.imgMetaData.lensModel,
                textPadding,
                thirdLineY,
              );

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
            // 우측 첫 줄 //
            // // // // //

            // 초점거리
            focalLengthText &&
              ctx.fillText(
                focalLengthText,
                metadataWidth -
                  focalLengthWidth -
                  fNumberWidth -
                  textPadding * 2,
                firstLineY,
              );
            // 조리개값
            fNumberText &&
              ctx.fillText(
                fNumberText,
                metadataWidth - fNumberWidth - textPadding,
                firstLineY,
              );

            // // // // //
            // 우측 둘째 줄 //
            // // // // //
            // 셔터스피드
            shutterSpeedText &&
              ctx.fillText(
                shutterSpeedText,
                metadataWidth - shutterSpeedWidth - textPadding,
                secondLineY,
              );

            // // // // //
            // 우측 셋째 줄 //
            // // // // //
            // ISO
            ISOText &&
              ctx.fillText(
                ISOText,
                metadataWidth - ISOWidth - textPadding,
                thirdLineY,
              );

            // // // // //
            // 우측 상단 //
            // // // // //
            // 날짜
            createDateText &&
              ctx.fillText(
                createDateText,
                metadataWidth - createDateWidth - textPadding,
                fontSize,
              );

            // 쉐도우 비활성
            ctx.shadowBlur = 0;
          });
        });
      }
    };
  }, [
    cvs,
    ctx,
    cvsSize,
    metadataOverlay,
    imgData.previewURL,
    imgData.size,
    imgData.imgMetaData,
    resizerSize,
    resizerPos,
    frontCvsSize,
  ]);

  // 메타데이터 오버레이 토글
  const onMetadataOverlayToggle = () => {
    setMetadataOverlay((prev) => !prev);
  };

  //
  //
  //
  //
  //
  //
  //
  //

  console.log(resizerRef.current?.style.width);

  return (
    <div className="space-between fixed left-0 top-0 z-40 flex h-full h-screen w-full w-screen flex-col bg-astronaut-950">
      <div className="relative m-auto scale-[0.95]">
        <canvas
          ref={cvsRef}
          style={{
            backgroundImage: `url(${imgData.previewURL})`,
            backgroundSize: "contain",
          }}
          className="bottom-0 left-0 right-0 top-0 m-auto bg-astronaut-500 brightness-50"
        ></canvas>
        <span
          ref={resizerRef}
          style={{
            width: `${resizerSize[0]}px`,
            height: `${resizerSize[1]}px`,
            maxWidth: `${resizerMaxSize[0]}px`,
            maxHeight: `${resizerMaxSize[1]}px`,
            minWidth: "50px",
            minHeight: "50px",
            top: `${resizerPos[1]}px`,
            left: `${resizerPos[0]}px`,
          }}
          className="group absolute m-auto box-content resize overflow-auto border backdrop-brightness-200"
        >
          <div onMouseDown={onResizerMouseDown} className="h-full w-full"></div>
          <div className="absolute bottom-0 right-0 h-5 w-5 rounded-tl bg-astronaut-50 opacity-10 group-hover:opacity-100"></div>
        </span>
      </div>

      <div className="flex h-[96px] shrink-0 items-center justify-between gap-4 break-keep bg-white p-4">
        <label className="flex h-fit items-center gap-1 rounded-lg bg-astronaut-700 p-2 hover:cursor-pointer hover:bg-astronaut-800">
          <div className="text-xs font-semibold text-astronaut-50">
            메타데이터 추가
          </div>
          <input
            type="checkbox"
            onChange={onMetadataOverlayToggle}
            checked={metadataOverlay}
          />
        </label>
        <div className="flex h-fit gap-4">
          <Button onClick={() => {}}>
            <div className="text-xs">편집 완료</div>
          </Button>
          <Button onClick={() => {}}>
            <div className="text-xs">이미지 다운로드</div>
          </Button>
          <Button onClick={onToggleCropImgMode}>
            <div className="text-xs">닫기</div>
          </Button>
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
