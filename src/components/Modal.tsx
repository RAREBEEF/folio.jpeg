import { MouseEvent, ReactElement, useEffect } from "react";
import XSvg from "@/icons/xmark-solid.svg";

const Modal = ({
  children,
  title,
  close = () => {},
}: {
  children: ReactElement;
  title: string;
  close: Function;
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 모달 외부 클릭시 창이 닫히도록
  const onModalOutsideClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.nativeEvent.target as HTMLElement;
    if (!target) return;

    if (target.id === "modal-bg") {
      close();
    }
  };

  const closeModal = (e: MouseEvent<HTMLButtonElement>) => {
    close();
  };

  return (
    <div
      id="modal-bg"
      onClick={onModalOutsideClick}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className={`pointer-events-all fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex min-w-[350px] items-center justify-center opacity-100`}
    >
      <div className="relative rounded-xl border-2 bg-shark-50 xs:aspect-auto xs:min-w-[340px] xs:max-w-[95vw]">
        <button className="absolute right-4 top-4 h-5 w-5" onClick={closeModal}>
          <XSvg />
        </button>
        <div className="max-h-[90vh] w-[400px] min-w-[350px] overflow-scroll xs:aspect-auto xs:w-auto xs:overflow-scroll">
          <h2 className="mb-4 ml-8 mt-8 text-2xl font-bold text-shark-950">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
