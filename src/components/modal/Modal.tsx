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
      className={`pointer-events-all fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex min-w-[300px] items-center justify-center opacity-100`}
    >
      <div className="relative max-h-[80vh] w-[400px] overflow-scroll rounded-xl border-2 bg-astronaut-50 xs:min-w-[250px] xs:max-w-[80vw]">
        <button
          className="group absolute right-4 top-4 h-5 w-5"
          onClick={closeModal}
        >
          <XSvg className="fill-astronaut-400 group-hover:fill-astronaut-500" />
        </button>
        {/* max-h-[90vh] w-[400px] min-w-[250px] overflow-scroll xs:aspect-auto xs:w-auto xs:overflow-scroll */}
        <div className="">
          <h2 className="mb-4 ml-8 mt-8 text-2xl font-bold ">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
