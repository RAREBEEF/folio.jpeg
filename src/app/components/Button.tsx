import Link from "next/link";
import { MouseEventHandler, ReactNode } from "react";

const buttonTailwindStyle = "bg-shark-950 text-shark-50 rounded-lg px-3 py-2";

const Button = ({
  children,
  onClick = () => {},
  href,
  tailwindStyle = "",
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  tailwindStyle?: string;
}) => {
  return href ? (
    <Link href={href} className={buttonTailwindStyle + " " + tailwindStyle}>
      {children}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={buttonTailwindStyle + " " + tailwindStyle}
    >
      {children}
    </button>
  );
};

export default Button;
