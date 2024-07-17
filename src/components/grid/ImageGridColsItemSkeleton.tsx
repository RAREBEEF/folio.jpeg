const ImageGridColsItemSkeleton = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div
      className="from-astronaut-100 to-astronaut-300 rounded-xl bg-gradient-to-br"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default ImageGridColsItemSkeleton;
