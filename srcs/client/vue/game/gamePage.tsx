import { useEffect, useRef } from "react";
import { pong } from "./Meshes";
import Footer from "../ts/Footer";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.tabIndex = 0;
    canvasRef.current.focus();

    let cleanup: (() => void) | undefined;

    pong(canvasRef.current).then(fn => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-8">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-xl border-3 border-[#f7de00]"
        />
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
