"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { readImageFile } from "@/lib/image-data";

// Upload control for an image slot; the same slot also accepts files dropped on the artboard.
export function ImagePicker({ label, value, max, onChange, field }: { label: string; value: string; max: number; onChange: (src: string) => void; field?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  async function pick(file: File | undefined) {
    if (!file) return;
    try { onChange(await readImageFile(file, max)); setError(""); } catch { setError("이미지를 읽지 못했어요. 다른 파일을 골라 주세요."); }
  }
  return <div className="lb-field lb-image-picker">{label}
    <div>{/* eslint-disable-next-line @next/next/no-img-element -- inline data URL preview */}
      {value ? <img src={value} alt="" /> : <span className="lb-image-empty"><ImagePlus size={14} /></span>}
      <button type="button" data-field={field} onClick={() => input.current?.click()}>{value ? "바꾸기" : "이미지 올리기"}</button>
      {value && <button type="button" aria-label={`${label} 삭제`} onClick={() => onChange("")}><Trash2 size={12} /></button>}
      <input ref={input} type="file" accept="image/*" hidden onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} /></div>
    {error ? <small className="lb-image-error">{error}</small> : <small>미리보기에 파일을 끌어다 놓아도 돼요.</small>}
  </div>;
}
