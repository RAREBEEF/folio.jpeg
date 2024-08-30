import { model } from "@/fb";
import { GenerateContentRequest, Part } from "firebase/vertexai-preview";

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const useGemini = () => {
  const gemini = async ({
    text,
    image,
  }: {
    text: string;
    image?: File | null | Array<File>;
  }): Promise<string> => {
    const request: Array<
      | string
      | {
          inlineData: {
            data: unknown;
            mimeType: string;
          };
        }
    > = [text];

    if (image) {
      const imagePart = await Promise.all(
        Array.isArray(image)
          ? image.map((img) => fileToGenerativePart(img))
          : [fileToGenerativePart(image)],
      );

      request.push(...imagePart);
    }

    // @ts-ignore
    const response = (await model.generateContent(request)).response;
    const result = response.text();

    return result;
  };

  return { gemini };
};

export default useGemini;
