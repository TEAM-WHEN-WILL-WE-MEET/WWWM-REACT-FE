import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { colorVariants } from "../../../../../styles/color.ts";
import { typographyVariants } from "../../../../../styles/typography.ts";

export const getInputClasses = () => {
  return twMerge(
    clsx(
      // default
      "flex",
      "w-full",
      "h-[40px]",
      "flex-col",
      "justify-end",
      "items-start",
      "gap-[4px]",
      "flex-shrink-0",
      "mb-[12px]",
      "peer",
      typographyVariants({
        variant: "h1-sb",
      }),
      colorVariants({
        color: "gray-500",
      }),
      "text-[20px]",
      // focus styles
      "focus:outline-none",
      "focus:border-b-2",
      "focus:ring-[var(--gray-800)]",
      "focus:text-[var(--gray-800)]",
      // valid styles
      "valid:text-[var(--gray-800)]"
    )
  );
};