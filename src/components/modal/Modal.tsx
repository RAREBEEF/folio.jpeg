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
      <div className="relative h-fit max-h-[80vh] w-[400px] overflow-scroll rounded-xl bg-white xs:min-w-[250px] xs:max-w-[80vw]">
        <div className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-white p-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="justify-items group flex h-5 w-5 items-center"
            onClick={closeModal}
          >
            <XSvg className="fill-astronaut-400 group-hover:fill-astronaut-500" />
          </button>
        </div>

        <div className="z-40">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
