"use client";

const TYPES = [
  { value: "all", label: "All" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "carousel", label: "Carousel" },
  { value: "text", label: "Text" },
];

export default function Filters({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-md px-3 py-1.5 text-sm border ${
            value === t.value
              ? "bg-accent border-accent text-white"
              : "bg-surface border-border text-zinc-300 hover:border-zinc-500"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
