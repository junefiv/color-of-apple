import { useId, type Ref } from "react";

type EyePosition = { x: number; y: number };

export const DEFAULT_APPLE_LOOK = {
  left: { x: 3.5, y: -2.5 },
  right: { x: 3.5, y: -2.5 },
};

export function AppleArtwork({
  look = DEFAULT_APPLE_LOOK,
  leftEyeRef,
  rightEyeRef,
}: {
  look?: { left: EyePosition; right: EyePosition };
  leftEyeRef?: Ref<SVGEllipseElement>;
  rightEyeRef?: Ref<SVGEllipseElement>;
}) {
  const textureId = useId();

  return (
    <svg viewBox="20 15 126 140" className="apple-svg" aria-hidden>
      <defs>
        <filter id={textureId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" result="grain" />
          <feColorMatrix in="grain" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
          <feBlend in2="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <path
        d="M 81 53 C 81 44 78 38 74 36 C 71 34 74 31 77 31 C 82 31 85 42 86 52 Z"
        fill="#79513A"
      />
      <path
        d="M 87 49 C 84 40 89 29 98 26 C 105 22 114 24 121 25 C 117 38 110 49 96 50 C 92 51 89 50 87 49 Z"
        fill="#BECB60"
      />
      <path d="M 89 48 C 93 40 99 35 106 32" fill="none" stroke="#F6F5DB" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M 83 51 C 74 48 68 46 59 48 C 40 49 30 64 30 82 C 28 101 37 125 50 138 C 60 148 69 144 79 142 C 86 140 92 145 101 144 C 116 143 125 124 132 105 C 138 87 139 71 131 60 C 124 49 115 47 105 49 C 96 50 91 53 83 51 Z"
        fill="var(--apple)"
        filter={`url(#${textureId})`}
      />
      <g transform="translate(66.5 92)">
        <ellipse ref={leftEyeRef} rx="14.5" ry="19.5" fill="#FFFEF8" transform="rotate(-3)" />
        <ellipse rx="8.2" ry="10.7" fill="#302623" transform={`translate(${look.left.x} ${look.left.y}) rotate(-8)`} />
      </g>
      <g transform="translate(100.5 92)">
        <ellipse ref={rightEyeRef} rx="14.5" ry="19.5" fill="#FFFEF8" transform="rotate(2)" />
        <ellipse rx="8.2" ry="10.7" fill="#302623" transform={`translate(${look.right.x} ${look.right.y}) rotate(-5)`} />
      </g>
    </svg>
  );
}
