import { cva } from 'class-variance-authority';

export const colors = {
  white: 'var(--white)', 
  gray: {
    50: 'var(--gray-50)',
    100: 'var(--gray-100)',
    200: 'var(--gray-200)',
    300: 'var(--gray-300)',
    400: 'var(--gray-400)',
    500: 'var(--gray-500)',
    600: 'var(--gray-600)',
    700: 'var(--gray-700)',
    800: 'var(--gray-800)',
    900: 'var(--gray-900)',
  },
  magenta: {
    50: 'var(--magen-50)',
    100: 'var(--magen-100)',
    300: 'var(--magen-300)',
    900: 'var(--magen-900)',
  },
  red: {
    50: 'var(--red-50)',
    100: 'var(--red-100)',
    300: 'var(--red-300)',
  },
  blue: {
    50: 'var(--blue-50)',
    100: 'var(--blue-100)',
    200: 'var(--blue-200)',
    300: 'var(--blue-300)',
    400: 'var(--blue-400)',
    500: 'var(--blue-500)',
    900: 'var(--blue-900)',
  },
};

export const colorVariants = cva('', {
  variants: {
    color: {
      'white': 'text-[var(--white)]',
      'gray-50': 'text-[var(--gray-50)]',
      'gray-100': 'text-[var(--gray-100)]',
      'gray-200': 'text-[var(--gray-200)]',
      'gray-300': 'text-[var(--gray-300)]',
      'gray-400': 'text-[var(--gray-400)]',
      'gray-500': 'text-[var(--gray-500)]',
      'gray-600': 'text-[var(--gray-600)]',
      'gray-700': 'text-[var(--gray-700)]',
      'gray-800': 'text-[var(--gray-800)]',
      'gray-900': 'text-[var(--gray-900)]',
      'magen-50': 'text-[var(--magen-50)]',
      'magen-100': 'text-[var(--magen-100)]',
      'magen-300': 'text-[var(--magen-300)]',
      'magen-900': 'text-[var(--magen-900)]',
      'red-50': 'text-[var(--red-50)]',
      'red-100': 'text-[var(--red-100)]',
      'red-300': 'text-[var(--red-300)]',
      'blue-50': 'text-[var(--blue-50)]',
      'blue-100': 'text-[var(--blue-100)]',
      'blue-200': 'text-[var(--blue-200)]',
      'blue-300': 'text-[var(--blue-300)]',
      'blue-400': 'text-[var(--blue-400)]',
      'blue-500': 'text-[var(--blue-500)]',
      'blue-900': 'text-[var(--blue-900)]',

    },
    bg: {
        'white': 'bg-[var(--white)]',
        'gray-50': 'bg-[var(--gray-50)]',
        'gray-100': 'bg-[var(--gray-100)]',
        'gray-200': 'bg-[var(--gray-200)]',
        'gray-300': 'bg-[var(--gray-300)]',
        'gray-400': 'bg-[var(--gray-400)]',
        'gray-500': 'bg-[var(--gray-500)]',
        'gray-600': 'bg-[var(--gray-600)]',
        'gray-700': 'bg-[var(--gray-700)]',
        'gray-800': 'bg-[var(--gray-800)]',
        'gray-900': 'bg-[var(--gray-900)]',
        'magen-50': 'bg-[var(--magen-50)]',
        'magen-100': 'bg-[var(--magen-100)]',
        'magen-300': 'bg-[var(--magen-300)]',
        'magen-900': 'bg-[var(--magen-900)]',
        'red-50': 'bg-[var(--red-50)]',
        'red-100': 'bg-[var(--red-100)]',
        'red-300': 'bg-[var(--red-300)]',
        'blue-50': 'bg-[var(--blue-50)]',
        'blue-100': 'bg-[var(--blue-100)]',
        'blue-200': 'bg-[var(--blue-200)]',
        'blue-300': 'bg-[var(--blue-300)]',
        'blue-400': 'bg-[var(--blue-400)]',
        'blue-500': 'bg-[var(--blue-500)]',
        'blue-900': 'bg-[var(--blue-900)]',
  
    }
  },
  defaultVariants: {
    color: 'gray-900',
    bg: 'white'
  }
});