"use client";

const PageHeader = ({ header }: { header: string }) => {
  return (
    // 페이지 헤더의 높이만큼 global.css에서 main의 padding-top 조절하기 (twailwind value * 4 = px)
    <h2 className="border-ebony-clay-950 bg-ebony-clay-50 text-ebony-clay-700 fixed top-16 z-30 flex h-20 w-full items-center border-b px-10 text-2xl font-semibold">
      {header}
    </h2>
  );
};

export default PageHeader;
