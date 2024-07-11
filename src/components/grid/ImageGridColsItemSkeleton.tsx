const ImageGridColsItemSkeleton = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div
      className="from-ebony-clay-100 to-ebony-clay-300 rounded-xl bg-gradient-to-br"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default ImageGridColsItemSkeleton;
