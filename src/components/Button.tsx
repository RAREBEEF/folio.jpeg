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
      className={`bg-ebony-clay-950 text-ebony-clay-50 hover:bg-ebony-clay-900 relative block w-fit rounded-lg px-3 py-2 ${tailwindStyle} ${disabled && "pointer-events-none cursor-default"}`}
    >
      {children}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-ebony-clay-950 text-ebony-clay-50 hover:bg-ebony-clay-900 relative block rounded-lg px-3 py-2 ${tailwindStyle} ${disabled && "cursor-default"}`}
    >
      {children}
    </button>
  );
};

export default Button;
