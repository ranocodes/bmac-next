"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, X, Link2, Check } from "lucide-react";

const RECOMMENDED = [
  "/images/literary-arts.jpg",
  "/images/public-speaking.jpg",
  "/images/digital-literacy.jpg",
  "/images/mentorship.jpg",
  "/images/competitions.jpg",
  "/images/maryam1.jpg",
  "/images/jagabs.jpg",
  "/images/peace.jpg",
  "/images/sun.jpg",
];

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  previewShape?: "round" | "rounded";
}

export default function ImagePicker({ value, onChange, previewShape = "rounded" }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState(value);
  const [pasteUrl, setPasteUrl] = useState("");
  const [tab, setTab] = useState<"library" | "url">("library");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(value);
    setPasteUrl("");
    setTab("library");
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  function handleSelect() {
    if (selected) {
      onChange(selected);
      setIsOpen(false);
    }
  }

  function handlePasteUse() {
    const trimmed = pasteUrl.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setPasteUrl("");
    setIsOpen(false);
  }

  const filename = value ? value.split("/").pop() || value : "";
  const allButRecommended = images.filter((img) => !RECOMMENDED.includes(img));

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm transition-colors hover:border-primary/50 ${
          value ? "text-secondary" : "text-muted-foreground/40"
        }`}
      >
        {value ? (
          <div className={`w-8 h-8 shrink-0 overflow-hidden bg-muted border border-border/30 ${previewShape === "round" ? "rounded-full" : "rounded-md"}`}>
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-muted rounded-md">
            <ImagePlus size={14} className="text-muted-foreground" />
          </div>
        )}
        <span className="flex-1 text-left truncate">{filename || "Select image..."}</span>
        <ImagePlus size={14} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6"
          onMouseDown={(e) => { if (e.target === overlayRef.current) setIsOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative w-full max-w-3xl max-h-[90vh] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-secondary">Media Library</h2>
                <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg border border-border/30">
                  <button
                    type="button"
                    onClick={() => setTab("library")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      tab === "library"
                        ? "bg-background shadow-sm text-secondary"
                        : "text-muted-foreground hover:text-secondary"
                    }`}
                  >
                    Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("url")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      tab === "url"
                        ? "bg-background shadow-sm text-secondary"
                        : "text-muted-foreground hover:text-secondary"
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {tab === "library" && (
              <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                {/* Grid side */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                  {/* Recommended */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Recommended
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {RECOMMENDED.filter((r) => images.includes(r)).map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setSelected(img)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-muted border-2 transition-all hover:border-primary/50 ${
                            selected === img ? "border-primary ring-1 ring-primary/30" : "border-transparent"
                          }`}
                          title={img.split("/").pop()}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {selected === img && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check size={12} className="text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All Images */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      All Images ({images.length})
                    </p>
                    {images.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-8 text-center">Loading...</p>
                    ) : allButRecommended.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-8 text-center">
                        All images shown in Recommended
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                        {allButRecommended.map((img) => (
                          <button
                            key={img}
                            type="button"
                            onClick={() => setSelected(img)}
                            className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-all hover:border-primary/50 ${
                              selected === img ? "border-primary ring-1 ring-primary/30" : "border-transparent"
                            }`}
                            title={img.split("/").pop()}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            {selected === img && (
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check size={12} className="text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview side */}
                <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border/50 p-4 sm:p-5 flex flex-col gap-4">
                  <div className={`flex-1 flex items-center justify-center bg-muted/30 rounded-xl border border-border/20 min-h-[180px] lg:min-h-0 p-3`}>
                    {selected ? (
                      <img
                        src={selected}
                        alt=""
                        className={`max-h-44 max-w-full object-contain ${previewShape === "round" ? "rounded-full w-32 h-32" : "rounded-lg"}`}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus size={28} className="opacity-40" />
                        <p className="text-xs">No image selected</p>
                      </div>
                    )}
                  </div>

                  {selected && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Filename
                      </p>
                      <p className="text-xs text-secondary truncate">{selected.split("/").pop()}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSelect}
                    disabled={!selected}
                    className="w-full min-h-[40px] rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    Select Image
                  </button>
                </div>
              </div>
            )}

            {tab === "url" && (
              <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-10 gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Link2 size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Paste an image URL from the web to use it directly.
                </p>
                <div className="w-full max-w-md flex gap-2">
                  <input
                    type="text"
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePasteUse(); }}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 h-11 px-4 rounded-xl bg-background border border-input text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={handlePasteUse}
                    disabled={!pasteUrl.trim()}
                    className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
                  >
                    Use URL
                  </button>
                </div>
                {pasteUrl.trim() && (
                  <div className="w-full max-w-md mt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                    <div className="flex items-center justify-center bg-muted/30 rounded-xl border border-border/20 p-3 min-h-[120px]">
                      <img
                        src={pasteUrl.trim()}
                        alt=""
                        className="max-h-32 max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).classList.add("hidden");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
