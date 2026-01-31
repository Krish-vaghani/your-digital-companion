export const LovableLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20 36C20 36 35 26 35 16C35 11 31 6 25 6C22 6 20 8 20 8C20 8 18 6 15 6C9 6 5 11 5 16C5 26 20 36 20 36Z"
      fill="url(#heart-gradient)"
    />
    <defs>
      <linearGradient
        id="heart-gradient"
        x1="5"
        y1="6"
        x2="35"
        y2="36"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FF8A65" />
        <stop offset="50%" stopColor="#F06292" />
        <stop offset="100%" stopColor="#7E57C2" />
      </linearGradient>
    </defs>
  </svg>
);
