"use client";

import { useState } from "react";
import s from "./beheer.module.css";

/** Verkleint grote foto's (bijv. van een telefoon) in de browser tot max. 2400 px. */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const type of ["image/webp", "image/jpeg"]) {
      const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, type, 0.85));
      if (blob?.type === type) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? ".webp" : ".jpg"), { type });
      }
    }
  } catch {
    // Verkleinen lukt niet: dan het origineel sturen.
  }
  return file;
}

/** FormData van een formulier, met de gekozen foto alvast verkleind. */
export async function formWithImage(form: HTMLFormElement): Promise<FormData> {
  const data = new FormData(form);
  const image = data.get("image");
  if (image instanceof File && image.size > 0) data.set("image", await shrink(image));
  else data.delete("image");
  return data;
}

export async function errorFrom(response: Response, fallback: string): Promise<string> {
  try {
    return ((await response.json()) as { error?: string }).error || fallback;
  } catch {
    return fallback;
  }
}

export function ImagePicker({
  id,
  label,
  required,
  current,
  wide,
}: {
  id: string;
  label: string;
  required?: boolean;
  current?: string;
  wide?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? current;
  return (
    <label className={`${s.picker} ${wide ? s.pickerWide : ""}`} htmlFor={id}>
      {shown ? <img src={shown} alt="" /> : <span className={s.pickerEmpty}>{label}</span>}
      <input
        id={id}
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return f ? URL.createObjectURL(f) : null;
          });
        }}
      />
      <span className={s.pickerNote}>{shown ? "Klik om een andere foto te kiezen" : "JPG, PNG of WebP, max. 12 MB"}</span>
    </label>
  );
}
