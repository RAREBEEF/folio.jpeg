"use client";

const PageHeader = ({ header }: { header: string }) => {
  return (
    // 페이지 헤더의 높이만큼 global.css에서 main의 padding-top 조절하기 (twailwind value * 4 = px)
    <h2
      id="page-header"
      className="z-30 flex h-20 w-full items-center border-b border-astronaut-200 bg-white px-10 text-2xl font-semibold text-astronaut-700"
    >
      {header}
    </h2>
  );
};

export default PageHeader;
