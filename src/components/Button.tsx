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
        //토스트 버튼
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
        // 비활성화: 회색 테두리 / 활성화: 파란 테두리
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
        // 참여 시간 입력하기, 저장하기, 약속 캘린더 만들기
        // 비활성화: 회색 배경 / 활성화: 파란 배경
        enter: [
          "flex",
          "w-[27.6rem]",
          "h-[4.4rem]",
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
        // 내 시간 입력하기
        inputMyTime: [
          "flex",
          "w-[27.6rem]",
          "h-[4.4rem]",
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
        // 링크 복사하기 버튼
         linkShare: [
          "flex",
          "w-[27.6rem]",
          "h-[4.4rem]",
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
        // 카카오톡 공유 버튼
        kakaoShare: [
          "flex",
          "w-[27.6rem]",
          "h-[4.4rem]",
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
        //날짜 선택, 기간 선택
        dateSelect: [
          "flex",
          "w-[8.8rem]",
          "h-[3.2rem]",
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
        // 멤버 이름 block
        memberNameBlock: [
          "flex",
          "w-[6.8rem]",
          "h-[2.8rem]",
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
        //pw 랜덤 생성 버튼
        randomCreate: [
          "flex",
          "w-[6.4em]",
          "h-[2.8rem]",
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
    | "choiceTime"
    | "enter"
    | "inputMyTime"
    | "linkShare"
    | "kakaoShare"
    | "dateSelect"
    | "memberNameBlock"
    | "randomCreate"
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
