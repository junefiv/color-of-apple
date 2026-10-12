// Move the entire flat outline inward near the press, including both rounded ends.
export function cushionContour(xPercent: number, yPercent: number, pressed: boolean, width = 180, height = 52, maxDepth = 3.5, cornerRadius = height / 2 - 1) {
  const pressX = Math.max(0, Math.min(100, xPercent)) / 100 * width;
  const pressY = Math.max(0, Math.min(100, yPercent)) / 100 * height;
  const radius = Math.min(cornerRadius, height / 2 - 1, width / 2 - 1);
  const left = radius + 1, right = width - left, top = radius + 1, bottom = height - top;
  const horizontal = right - left, vertical = bottom - top, quarter = Math.PI * radius / 2;
  const arcPoint = (x: number, y: number, angle: number) => ({ x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle), nx: -Math.cos(angle), ny: -Math.sin(angle) });
  const segments = [
    { length: horizontal, at: (d: number) => ({ x: left + d, y: 1, nx: 0, ny: 1 }) },
    { length: quarter, at: (d: number) => arcPoint(right, top, -Math.PI / 2 + d / radius) },
    { length: vertical, at: (d: number) => ({ x: width - 1, y: top + d, nx: -1, ny: 0 }) },
    { length: quarter, at: (d: number) => arcPoint(right, bottom, d / radius) },
    { length: horizontal, at: (d: number) => ({ x: right - d, y: height - 1, nx: 0, ny: -1 }) },
    { length: quarter, at: (d: number) => arcPoint(left, bottom, Math.PI / 2 + d / radius) },
    { length: vertical, at: (d: number) => ({ x: 1, y: bottom - d, nx: 1, ny: 0 }) },
    { length: quarter, at: (d: number) => arcPoint(left, top, Math.PI + d / radius) },
  ];
  const perimeter = segments.reduce((total, segment) => total + segment.length, 0);
  const count = vertical > 0 ? 96 : 48;
  const points = Array.from({ length: count }, (_, index) => {
    let distance = index / count * perimeter;
    let segment = segments[segments.length - 1];
    for (const candidate of segments) {
      if (distance < candidate.length) { segment = candidate; break; }
      distance -= candidate.length;
    }
    const { x, y, nx, ny } = segment.at(distance);
    const depth = pressed ? maxDepth * Math.exp(-(((x - pressX) / 24) ** 2 + ((y - pressY) / (height * .58)) ** 2)) : 0;
    return { x: x + nx * depth, y: y + ny * depth };
  });
  const point = (index: number) => points[(index + points.length) % points.length];
  const curves = points.map((current, index) => {
    const previous = point(index - 1), next = point(index + 1), following = point(index + 2);
    return `C ${current.x + (next.x - previous.x) / 6} ${current.y + (next.y - previous.y) / 6} ${next.x - (following.x - current.x) / 6} ${next.y - (following.y - current.y) / 6} ${next.x} ${next.y}`;
  }).join(" ");
  return `M ${points[0].x} ${points[0].y} ${curves} Z`;
}

