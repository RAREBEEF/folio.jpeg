import Link from "next/link";
import { MouseEventHandler, ReactNode } from "react";

const Button = ({
  children,
  onClick = undefined,
  href,
  tailwindStyle,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  tailwindStyle?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return href ? (
    <Link
      href={href}
      className={`relative block w-fit rounded-lg bg-shark-950 px-3 py-2 text-shark-50 hover:bg-shark-900 ${tailwindStyle} ${disabled && "pointer-events-none cursor-default"}`}
    >
      {children}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative block rounded-lg bg-shark-950 px-3 py-2 text-shark-50 hover:bg-shark-900 ${tailwindStyle} ${disabled && "cursor-default"}`}
    >
      {children}
    </button>
  );
};

export default Button;
