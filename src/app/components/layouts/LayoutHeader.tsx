"use client";

const LayoutHeader = () => {
  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <header className="fixed top-0 z-10 flex h-16 w-full items-center bg-shark-950 text-shark-50">
      <h1 className="w-[200px] text-center text-2xl font-bold">FOLIO.jpeg</h1>
    </header>
  );
};

export default LayoutHeader;
