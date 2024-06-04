const ImageGridColsItemSkeleton = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-shark-100 to-shark-300"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default ImageGridColsItemSkeleton;
