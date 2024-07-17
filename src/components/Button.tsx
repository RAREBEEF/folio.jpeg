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
      className={`bg-astronaut-700 text-astronaut-50 hover:bg-astronaut-800 active:bg-astronaut-900 relative block w-fit rounded-lg px-3 py-2 font-semibold ${tailwindStyle} ${disabled && "pointer-events-none cursor-default"}`}
    >
      {children}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-astronaut-700 text-astronaut-50 hover:bg-astronaut-800 active:bg-astronaut-900 relative block rounded-lg px-3 py-2 font-semibold ${tailwindStyle} ${disabled && "cursor-default"}`}
    >
      {children}
    </button>
  );
};

export default Button;
