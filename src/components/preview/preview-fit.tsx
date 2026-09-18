"use client";

import { useEffect, useRef, useState } from "react";

export function PreviewFit({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function measure() {
      if (!node) return;
      const box = node.getBoundingClientRect();
      setScale(Math.min(1, box.width / width, box.height / height));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, width]);

  return (
    <div ref={ref} className="grid h-full w-full place-items-center overflow-hidden">
      <div style={{ width: width * scale, height: height * scale }}>
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
