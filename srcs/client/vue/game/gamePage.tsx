import { useEffect, useRef } from "react";
import { pong } from "./Meshes";
import Footer from "../ts/Footer";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.tabIndex = 0;
    canvasRef.current.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const keysToBlock = [
        "ArrowUp",
        "ArrowDown",
      ];

      if (keysToBlock.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    let cleanup: (() => void) | undefined;

    pong(canvasRef.current).then(fn => {
      cleanup = fn;
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cleanup?.();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col margin-bot">
      <main className="flex items-center justify-center">

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-xl border-3 border-[#f7de00]"
        />
      </main>

    </div>
  );
}
