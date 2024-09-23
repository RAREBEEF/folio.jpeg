import {
  ExtraUserData,
  Feedback,
  ImageDocData,
  ImageMetadata,
  UserData,
} from "@/types";

const useTypeGuards = () => {
  const isArrayOfStrings = (target: any): target is Array<string> => {
    return (
      Array.isArray(target) &&
      target.every((value) => typeof value === "string")
    );
  };

  const isFeedback = (target: any): target is Feedback => {
    const isSummary = (
      target: any,
    ): target is { good: string; improve: string } => {
      return (
        typeof target === "object" &&
        "good" in target &&
        typeof target.good === "string" &&
        "improve" in target &&
        typeof target.improve === "string"
      );
    };

    return (
      typeof target === "object" &&
      "detail" in target &&
      typeof target.detail === "string" &&
      "summary" in target &&
      isSummary(target.summary)
    );
  };

  const isImageMetaData = (target: any): target is ImageMetadata => {
    return (
      ("make" in target && typeof target.make === null) ||
      (typeof target.make === "string" &&
        "model" in target &&
        typeof target.model === null) ||
      (typeof target.model === "string" &&
        "lensMake" in target &&
        typeof target.lensMake === null) ||
      (typeof target.lensMake === "string" &&
        "lensModel" in target &&
        typeof target.lensModel === null) ||
      (typeof target.lensModel === "string" &&
        "shutterSpeed" in target &&
        typeof target.shutterSpeed === null) ||
      ((typeof target.shutterSpeed === "string" ||
        typeof target.shutterSpeed === "number") &&
        "fNumber" in target &&
        typeof target.fNumber === null) ||
      ((typeof target.fNumber === "number" ||
        typeof target.fNumber === "string") &&
        "ISO" in target &&
        typeof target.ISO === null) ||
      ((typeof target.ISO === "number" || typeof target.ISO === "string") &&
        "focalLength" in target &&
        typeof target.focalLength === null) ||
      typeof target.focalLength === "number" ||
      typeof target.focalLength === "string"
    );
  };

  const objectContainValidItem = (
    object: { [key in string]: any },
    key: string,
    type:
      | "bigint"
      | "boolean"
      | "function"
      | "number"
      | "object"
      | "string"
      | "symbol"
      | "undefined"
      | null
      | Array<
          | "bigint"
          | "boolean"
          | "function"
          | "number"
          | "object"
          | "string"
          | "symbol"
          | "undefined"
          | null
        >
      | Function,
  ): boolean => {
    return (
      key in object &&
      (typeof type === "function"
        ? type(object[key])
        : Array.isArray(type)
          ? type.includes(typeof object[key])
          : typeof object[key] === type)
    );
  };

  const isImageDocData = (target: any): target is ImageDocData => {
    return (
      typeof target === "object" &&
      objectContainValidItem(target, "createdAt", "number") &&
      objectContainValidItem(target, "uid", "string") &&
      objectContainValidItem(target, "fileName", "string") &&
      objectContainValidItem(target, "originalName", "string") &&
      objectContainValidItem(target, "title", "string") &&
      objectContainValidItem(target, "description", "string") &&
      objectContainValidItem(target, "byte", "number") &&
      objectContainValidItem(target, "URL", "string") &&
      objectContainValidItem(target, "size", "object") &&
      objectContainValidItem(target.size, "width", "number") &&
      objectContainValidItem(target.size, "height", "number") &&
      objectContainValidItem(target, "imgTags", isArrayOfStrings) &&
      objectContainValidItem(target, "contentTags", isArrayOfStrings) &&
      objectContainValidItem(target, "tags", isArrayOfStrings) &&
      objectContainValidItem(target, "feedback", isFeedback) &&
      objectContainValidItem(target, "likes", isArrayOfStrings) &&
      objectContainValidItem(target, "themeColor", "string") &&
      objectContainValidItem(target, "popularity", "number") &&
      objectContainValidItem(target, "metadata", isImageMetaData)
    );
  };

  const isExtraUserData = (target: any): target is ExtraUserData => {
    return (
      typeof target === "object" &&
      objectContainValidItem(target, "displayId", [
        "string",
        "undefined",
        null,
      ]) &&
      objectContainValidItem(target, "following", isArrayOfStrings) &&
      objectContainValidItem(target, "follower", isArrayOfStrings) &&
      objectContainValidItem(target, "fcmToken", ["string", null])
    );
  };

  return {
    isArrayOfStrings,
    isImageDocData,
    isFeedback,
    isImageMetaData,
    isExtraUserData,
  };
};

export default useTypeGuards;
