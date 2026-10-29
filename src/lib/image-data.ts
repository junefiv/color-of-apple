// Images dropped into builder frames are stored inline in the layout document (localStorage and
// the exported JSON), so they are downscaled first and capped in size.
export const maxImageDataLength = 3_000_000;

export function validImageData(value: unknown): boolean {
  return value === "" || (typeof value === "string" && value.length <= maxImageDataLength && /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,/.test(value));
}

// Re-encodes to WebP (keeps transparency for logos) no wider or taller than `max` px.
export async function readImageFile(file: File, max: number): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not an image");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((img.naturalWidth || max) * ratio));
    canvas.height = Math.max(1, Math.round((img.naturalHeight || max) * ratio));
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [.84, .7, .55]) {
      const data = canvas.toDataURL("image/webp", quality);
      if (data.length <= maxImageDataLength && data.startsWith("data:image/webp")) return data;
      // Browsers without a WebP encoder fall back to PNG; JPEG keeps photos small enough.
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      if (jpeg.length <= maxImageDataLength) return jpeg;
    }
    throw new Error("image too large");
  } finally {
    URL.revokeObjectURL(url);
  }
}
