
"use client";

import React, { useEffect, useRef, useState } from "react";
import WebContainerIDE from "@/components/WebContainerIDE";
import AIChatPanel from "@/components/AIChatPanel";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(33.33);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // pointer drag refs
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && (e as unknown as PointerEvent).button !== 0) return;
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const stopDragging = () => {
    draggingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    const handlePointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ev.clientX;
        const pct = ((x - rect.left) / rect.width) * 100;
        const clamped = Math.max(20, Math.min(80, pct));
        setLeftWidth(clamped);
      });
    };

    const handlePointerUp = () => {
      if (draggingRef.current) stopDragging();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      stopDragging();
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden select-none"
    >
      {/* Left: Chat Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="border-r border-[#2a2a2a] overflow-hidden flex flex-col"
      >
        <AIChatPanel />
      </div>

      {/* Resizer - wider hit area but visually slim */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-center -mx-2 w-6 cursor-col-resize select-none"
        title="Drag to resize"
        aria-label="Resize panels"
      >
        <div className="w-[1px] h-full bg-[#2a2a2a] pointer-events-none" />
      </div>

      {/* Right: IDE */}
      <div
        style={{ width: `${100 - leftWidth}%` }}
        className="overflow-hidden flex flex-col"
      >
        <WebContainerIDE />
      </div>
    </main>
  );
}
