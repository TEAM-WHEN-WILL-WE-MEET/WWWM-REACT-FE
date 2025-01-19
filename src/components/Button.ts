import { cn } from '../utils/cn';
import { cva, VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC } from 'react';
import { colors, colorVariants } from '../styles/color';
import { typographyVariants } from '../styles/typography';

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
  text-slate-100 transition-all shadow-md
  hover:scale-105 duration-200 hover:translate-x-10
  `,
  {
    //variant , size에 따라 다른 디자인을 보여줄수 있다
    variants: {
      variant: {
        default: [
          'active:scale-100',
          typographyVariants({ variant: 'h1-sb' }),
          `text-[${colors.gray[100]}]`
        ],
      },
      size: {
        default: '',
        XXS: //ex 내 참여 가능 시간 선택
        [
          'w-[46px]',
          'h-[32px]',
          'flex-shrink-0',
          'border',
          'border-[var(--gray-300)]',
          'bg-[var(--white)]',
          //선택됐을때는 
          'selected:border-[var(--blue-200)]',
          'selected:bg-[var(--blue-50)]',
        ],
        XS: // ex 캘린더 timeslot
        [
          'w-[44px]',
          'h-[28px]',
          'flex-shrink-0',
          'border',
          'border-[var(--gray-300)]',
          'bg-[var(--white)]',
          //그 이후 userCount 백분율에 따라 색상 적용되는건, js 코드 내에 있음.
        ],
        S:  //ex 삭제, 취소 버튼
        [
          'flex',
          'w-[152px]',
          'h-[40px]',
          'px-[51px]',
          'py-[12px]',
          'justify-center',
          'items-center',
          'flex-shrink-0',
          'rounded-[8px]',
          'border',
          'border-[var(--red-100)]',
          'bg-[var(--red-50)]',
          //취소하기 버튼은... state가 뭔지 감이 안옴, 백엔드 v2 개발 들어갈 때 고민 ㄱㄱ
          // 'border-[var(--gray-200)]',
          // 'bg-[var(--white)]',
        ],
        M: //ex 내 참여시간 수정 
        [ 
          'flex',
          'w-[312px]',
          'h-[40px]',
          'px-[119px]',
          'py-[14px]',
          'justify-center',
          'items-center',
          'gap-[10px]',
          'flex-shrink-0',
          'rounded-[8px]',
          'border',
          'border-[var(--gray-400)]',
          'bg-[var(--white)]',
          'shadow-[1px_1px_0px_0px_var(--gray-400)]',
          //비활성화시
          'pressed:border',
          'pressed:border-[var(--gray-400)]',
          'pressed:bg-[var(--gray-50)]',

        ],
        L: //ex 내 참여 시간 저장 
        [
          'flex',
          'w-[320px]',
          'h-[44px]',
          'px-[122px]',
          'py-[16px]',
          'justify-center',
          'items-center',
          'gap-[10px]',
          'flex-shrink-0',
          'rounded-[8px]',
          'border',
          'border-[var(--gray-900)]',
          'bg-[var(--white)]',
          'shadow-[1px_1px_0px_0px_var(--gray-900)]',
          //press됐을 때
          'pressed:border',
          'pressed:border-[var(--gray-900)]',
          'pressed:bg-[var(--gray-50)]',

        ],
        XL: //ex 캘린더 만들기 
        [
          //disabled
          'disabled:border',
          'disabled:border-[var(--gray-500)]',
          'disabled:bg-[var(--gray-50)]',

          //able
          'flex',
          'w-[320px]',
          'h-[48px]',
          'px-[122px]',
          'py-[16px]',
          'justify-center',
          'items-center',
          'gap-[10px]',
          'flex-shrink-0',
          'rounded-[8px]',
          'border-r-[1px]',
          'border-r-[var(--gray-600)]',
          'border-b-[1px]',
          'border-b-[var(--gray-600)]',
          'bg-[var(--gray-900)]',
          'shadow-[1px_2px_0px_0px_var(--gray-800)]',

          //press
          'pressed:border',
          'pressed:border-[var(--gray-900)]',
          'pressed:bg-[var(--gray-800)]',


        ],
        participate: //참여하기 버튼
        [
        'w-[112px]',
        'h-[40px]',
        'flex-shrink-0',
        'rounded-[6px]',
        'bg-[var(--gray-900)]',
        ]
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,
    //Button의 속성을 타입지정을 통해 손쉽게 사용
    VariantProps<typeof ButtonVariants> {
  label?: string;
  //라벨은 단지 string을 넣을때 사용
  children?: React.ReactElement;
  //icon component 같은 리엑트 컴포넌트에 사용
  additionalClass?: string;
  size: 'XL' | 'L' | 'M' | 'S' | 'XS' | 'XXS';

}

/**
 * @variant 색상 지정 ex) gray, blue, red
 * @size 사이즈 지정 md, lg, wlg
 * @children ReactElement 아이콘같은걸 넣어준다
 * @label String을 넣어 버튼 라벨을 지정해준다
 * @additionalClass 추가할 클래스 속성을 넣어준다
 * @props 추가할 버튼 속성을 넣어준다
 */
const Button: FC<ButtonProps> = ({ variant, size, children, label, additionalClass, ...props }) => {
  return (
    <button className={cn(ButtonVariants({ variant, size }), additionalClass)} {...props}>
      {children && children}
      {label && label}
    </button>
  );
};

export default Button;