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
          "items-center",
          "justify-center",
          "gap-[0.4rem]",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-[#e9eef9]",
          "text-[#2463ec]",
          "font-pretendard",
          "font-semibold",
          "text-[1.4rem]",
          "leading-[1.6rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
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
        // 시간 선택하기
        choiceTime: [
          "flex",
          "w-[32.8rem]",
          "h-[4.8rem]",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "justify-center",
          "items-center",
          "gap-[1rem]",
          "flex-shrink-0",
          "rounded-[1.2rem]",
          "bg-white",
          "border",
          "border-[var(--NB-300)]",
          "text-[var(--NB-300)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.6rem]",
          "leading-[2rem]",
          "tracking-[-0.04rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
          "disabled:!text-[var(--gray-400)]",
          "disabled:border",
          "disabled:bg-white",
          "disabled:cursor-not-allowed",
          "disabled:border-[var(--gray-400)]",
        ],
        save: [
          "flex",
          "items-center",
          "justify-center",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-[var(--NB-300)]",
          "text-white",
          "font-pretendard",
          "font-semibold",
          "text-[1.6rem]",
          "leading-[2rem]",
          "tracking-[-0.04rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
          "disabled:bg-[var(--gray-400)]",
          "disabled:text-white",
          "disabled:cursor-not-allowed",
        ],
        inputMyTime: [
          "flex",
          "items-center",
          "justify-center",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-white",
          "border",
          "border-[var(--NB-200)]",
          "text-[var(--NB-300)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.4rem]",
          "leading-[2rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
        ],
        kakaoShare: [
          "flex",
          "items-center",
          "justify-center",
          "gap-[0.4rem]",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-[var(--kakao-yellow)]",
          "text-[var(--gray-900)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.4rem]",
          "leading-[1.6rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
        ],
        dateSelect: [
          "flex",
          "items-center",
          "justify-center",
          "gap-[0.4rem]",
          "px-[1.4rem]",
          "py-0",
          "rounded-[2.3rem]",
          "bg-[var(--NB-50)]",
          "border",
          "border-[var(--NB-100)]",
          "text-[var(--NB-300)]",
          "font-pretendard",
          "font-medium",
          "text-[1.4rem]",
          "leading-[2rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
          "disabled:bg-white",
          "disabled:border-[var(--gray-300)]",
          "disabled:text-[var(--gray-600)]",
          "disabled:cursor-not-allowed",
        ],
        member: [
          "flex",
          "items-center",
          "justify-start",
          "gap-[1.2rem]",
          "h-[2.8rem]",
          "px-[1.6rem]",
          "py-[0.8rem]",
          "rounded-[0.6rem]",
          "bg-[var(--NB-50)]",
          "text-[var(--NB-900)]",
          "font-pretendard",
          "font-medium",
          "text-[1.4rem]",
          "leading-[1.6rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
        ],
        myTimeInput: [
          "flex",
          "items-center",
          "justify-center",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-white",
          "border",
          "border-[var(--NB-200)]",
          "text-[var(--NB-300)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.4rem]",
          "leading-[2rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
        ],
        "link-share": [
          "flex",
          "items-center",
          "justify-center",
          "gap-[0.4rem]",
          "px-[1.6rem]",
          "py-[1.2rem]",
          "rounded-[1.2rem]",
          "bg-[var(--gray-100)]",
          "text-[var(--gray-800)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.4rem]",
          "leading-[1.6rem]",
          "tracking-[-0.035rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
        ],
        "random-create": [
          "flex",
          "items-center",
          "justify-center",
          "gap-[1rem]",
          "px-[0.8rem]",
          "py-[0.4rem]",
          "rounded-[0.8rem]",
          "bg-[var(--NB-50)]",
          "text-[var(--NB-300)]",
          "font-pretendard",
          "font-semibold",
          "text-[1.3rem]",
          "leading-[1.3rem]",
          "tracking-[-0.0325rem]",
          "whitespace-nowrap",
          "!transform-none",
          "!hover:transform-none",
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
    | "choiceTime"
    | "save"
    | "inputMyTime"
    | "kakaoShare"
    | "dateSelect"
    | "member"
    | "myTimeInput"
    | "link-share"
    | "random-create"
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
