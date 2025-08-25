import { cn } from "../utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, FC } from "react";
import { colors } from "../styles/color";
import { typographyVariants } from "../styles/typography";
import React from "react";
/**
VariantProps: class-variance-authority 라이브러리에서 제공하는 클래스 변이 관련 기능을 사용하기 위한 타입입니다.
이 타입은 cva 함수를 사용할 때 클래스의 변이를 지정하기 위해 필요한 속성들을 정의하고 있습니다.

ButtonHTMLAttributes: HTML 버튼 엘리먼트에 적용되는 속성들을 정의한 타입입니다.
이는 React에서 HTML 요소의 속성을 타입으로 지정해 놓은 것으로,
버튼 컴포넌트에 HTML 버튼 엘리먼트의 속성들을 적용하기 위해 사용됩니다.

FC: React에서 함수형 컴포넌트를 정의할 때 사용하는 타입으로,
FC는 "Functional Component"의 약자입니다.
이를 사용하면 React 함수형 컴포넌트를 정의할 때 props의 타입이나 기타 컴포넌트 속성들을 명시적으로 지정할 수 있습니다.
**/

export const ButtonVariants = cva(
  //모든 경우에 공통으로 들어갈 CSS
  `
  flex justify-center items-center active:scale-95 rounded-xl
  text-slate-100 transition-all
  hover:scale-105 duration-200 
  `,
  {
    variants: {
      variant: {
        default: [
          "active:scale-100",
          typographyVariants({ variant: "h1-sb" }),
          `text-[${colors.gray[100]}]`,
        ],
      },
      size: {
        default: "",
        XXS: [
          "w-[4.6rem]",
          "h-[3.2rem]",
          "flex-shrink-0",
          "border",
          "border-[var(--gray-300)]",
          "bg-[var(--white)]",
          "whitespace-nowrap",
          "rounded-none",
          "selected:border-[var(--blue-200)]",
          "selected:bg-[var(--blue-50)]",
        ],
        XS: [
          "w-[4.4rem]",
          "!h-[2.8rem]",
          "flex-shrink-0",
          "border",
          "border-[var(--gray-300)]",
          "bg-[var(--white)]",
          "whitespace-nowrap",
          "rounded-none",
        ],
        S: [
          "flex",
          "w-[15.2rem]",
          "h-[4rem]",
          "px-[5.1rem]",
          "py-[1.2rem]",
          "justify-center",
          "items-center",
          "flex-shrink-0",
          "rounded-[0.8rem]",
          "border",
          "border-[var(--red-100)]",
          "bg-[var(--red-50)]",
          "whitespace-nowrap",
        ],
        M: [
          "flex",
          "w-[31.2rem]",
          "h-[4rem]",
          "px-[11.9rem]",
          "py-[1.4rem]",
          "justify-center",
          "items-center",
          "gap-[1rem]",
          "flex-shrink-0",
          "rounded-[0.8rem]",
          "border",
          "border-[var(--gray-400)]",
          "bg-[var(--white)]",
          "shadow-[0.1rem_0.1rem_0px_0px_var(--gray-400)]",
          "whitespace-nowrap",
          typographyVariants({ variant: "b2-md" }),
          "text-[var(--gray-800)]",
          "pressed:border",
          "pressed:border-[var(--gray-400)]",
          "pressed:bg-[var(--gray-50)]",
          "pressed:text-[var(--gray-800)]",
        ],
        L: [
          "flex",
          "w-[32rem]",
          "h-[4.4rem]",
          "px-[12.2rem]",
          "py-[1.6rem]",
          "justify-center",
          "items-center",
          "gap-[1rem]",
          "flex-shrink-0",
          "rounded-[0.8rem]",
          "border",
          "border-[var(--gray-900)]",
          "bg-[var(--white)]",
          // "shadow-[0.1rem_0.1rem_0px_0px_var(--gray-900)]",
          "whitespace-nowrap",
          typographyVariants({ variant: "b1-sb" }),
          "text-[1.4rem]",
          "text-[var(--gray-900)]",
          "pressed:border",
          "pressed:border-[var(--gray-900)]",
          "pressed:bg-[var(--gray-50)]",
        ],
        XL: [
          "flex",
          "w-[32rem]",
          "h-[4.8rem]",
          "px-[12.2rem]",
          "py-[1.6rem]",
          "justify-center",
          "items-center",
          "gap-[1rem]",
          "flex-shrink-0",
          "rounded-[0.8rem]",
          "bg-[var(--gray-900)]",
          "tracking-normal",
          "font-pretendard",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
          !typographyVariants({ variant: "b1-sb" }),
          "disabled:!text-[var(--gray-600)]",
          "disabled:border",
          "disabled:bg-[var(--gray-50)]",
          "disabled:cursor-not-allowed",
          "disabled:border-[var(--gray-500)]",
          "pressed:border",
          "pressed:!text-[var(--gray-100)]",
          "pressed:border-[var(--gray-900)]",
          "pressed:bg-[var(--gray-800)]",
        ],
        participate: [
          "w-[11.2rem]",
          "h-[4rem]",
          "flex-shrink-0",
          "rounded-[0.6rem]",
          "bg-[var(--gray-900)]",
          "whitespace-nowrap",
          typographyVariants({ variant: "b1-sb" }),
          `text-[var(--white)]`,
          "hover:transform-none",
          "hover:none",
        ],
        share: [
          "flex",
          "pl-[1.6rem]",
          "w-[31.2rem]",
          "h-[4.4rem]",
          "py-[1.4rem]",
          "!justify-start",
          "items-center",
          "!whitespace-nowrap",
          "!text-center",
          "gap-[0.4rem]",
          "rounded-[0.8rem]",
          "border",
          "bg-[var(--gray-900)]",
          "whitespace-normal",
          typographyVariants({ variant: "b2-md" }),
          "text-[var(--white)]",
        ],
        toast: [
          "inline-flex",
          "h-[4rem]",
          "px-[2rem]",
          "justify-center",
          "items-center",
          "gap-[1rem]",
          "rounded-[0.8rem]",
          "!bg-[var(--gray-900)]",
          "!text-[var(--white)]",
          "!font-pretendard",
          "text-[var(--font-size-14)]",
          "font-[var(--font-md)]",
          "leading-[var(--line-height-16)]",
          "tracking-[var(--spacing)]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    //Button의 속성을 타입지정을 통해 손쉽게 사용
    VariantProps<typeof ButtonVariants> {
  label?: string;
  //라벨은 단지 string을 넣을때 사용
  children?: React.ReactElement;
  //icon component 같은 리엑트 컴포넌트에 사용
  additionalClass?: string;
  handleMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size:
    | "toast"
    | "share"
    | "participate"
    | "XL"
    | "L"
    | "M"
    | "S"
    | "XS"
    | "XXS";
}

/**
 * @variant 색상 지정 ex) gray, blue, red
 * @size 사이즈 지정 md, lg, wlg
 * @children ReactElement 아이콘같은걸 넣어준다
 * @label String을 넣어 버튼 라벨을 지정해준다
 * @additionalClass 추가할 클래스 속성을 넣어준다
 * @props 추가할 버튼 속성을 넣어준다
 */
export const Button: FC<ButtonProps> = ({
  variant,
  size,
  children,
  label,
  additionalClass,
  handleMouseEnter,
  onMouseLeave,
  ...props
}) => {
  // console.log('Button props:', { variant, size, disabled: props.disabled });
  // console.log('Applied classes:', ButtonVariants({ variant, size }));
  return (
    <button
      className={cn(ButtonVariants({ variant, size }), additionalClass)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children && children}
      {label && label}
    </button>
  );
};

export default Button;
