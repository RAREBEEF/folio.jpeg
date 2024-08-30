import { ChangeEvent, useState } from "react";

const useInput = (initValue: string) => {
  const [value, setValue] = useState<string>(initValue);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setValue(value);
  };

  return { value, setValue, onChange };
};

export default useInput;
