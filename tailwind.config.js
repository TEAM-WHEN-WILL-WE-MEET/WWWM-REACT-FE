/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: true,
  },
content: ["./src/**/*.{js,jsx,ts,tsx}"],
safelist: [
  // 색상 관련 동적 클래스 보호
  {
    pattern: /^(bg|text)-\[var\(--(white|gray-(?:50|100|200|300|400|500|600|700|800|900)|magen-(?:50|100|300|900)|red-(?:50|100|300)|blue-(?:50|100|200|300|400|500|900))\)\]$/,
  },
  // typographyVariants에서 사용하는 동적 클래스 보호
  {
    pattern: /^(?:!font-pretendard|text-\[var\(--font-size-(?:20|16|14|12)\)\]|font-\[var\(--font-(?:sb|md|rg)\)\]|leading-\[var\(--line-height-(?:24|16|12)\)\]|tracking-\[var\(--spacing)\)\]$/,
  },
],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      }, 
     },
  },
  plugins: [],
}

