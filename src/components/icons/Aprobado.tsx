import type { iIconProps } from "@/interfaces/icons.type";

export const AprobadoIcon = ({
  width = 24,
  height = 24,
  styles = "",
}: iIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={styles}
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          d="M7 21a2 2 0 0 1-2-2V3h9l5 5v11a2 2 0 0 1-2 2z"
        />
        <path d="M13 3v6h6" />
        <path strokeLinecap="round" d="m15 13l-4 4l-2-2" />
      </g>
    </svg>
  );
};
