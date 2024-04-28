const PageHeader = ({ header }: { header: string }) => {
  return (
    // 페이지 헤더의 높이만큼 global.css에서 main의 padding-top 조절하기 (twailwind value * 4 = px)
    <h2 className="fixed top-16 z-40 flex h-20 w-full items-center border-b border-shark-950 bg-shark-50 px-10 text-xl font-semibold text-shark-700">
      {header}
    </h2>
  );
};

export default PageHeader;
