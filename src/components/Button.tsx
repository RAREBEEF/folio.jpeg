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
      className={`relative block w-fit rounded-lg px-3 py-2 font-semibold text-astronaut-50 ${tailwindStyle} ${disabled ? "pointer-events-none cursor-default bg-astronaut-300" : " bg-astronaut-700 hover:bg-astronaut-800 active:bg-astronaut-900"}`}
    >
      {children}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative block rounded-lg px-3 py-2 font-semibold text-astronaut-50 ${tailwindStyle} ${disabled ? "cursor-default bg-astronaut-300" : " bg-astronaut-700 hover:bg-astronaut-800 active:bg-astronaut-900"}`}
    >
      {children}
    </button>
  );
};

export default Button;
