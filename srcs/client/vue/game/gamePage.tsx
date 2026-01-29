import { useEffect, useRef } from "react";
import { pong } from "./Meshes";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.addEventListener("keydown", function (e) {
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
    });
    canvasRef.current.style.border = "3px solid #f7de00ff";
    canvasRef.current.style.background = "#ffffffff";
    canvasRef.current.style.outline = "none";
    canvasRef.current.tabIndex = 0;
    canvasRef.current.focus();

    let cleanup: (() => void) | undefined;
    // const ws = new WebSocket("/ws/");

    pong(canvasRef.current).then(fn => {
      cleanup = fn;
    });


    return () => {
      // ws.close();
      cleanup?.()
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center p-8">
      <div className="mb-6 flex justify-between w-full max-w-4xl">
        <h1 className="text-4xl text-[#8B5A3C]">PongpongPurin</h1>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="mx-auto block rounded-xl"
      />
    </div>
  );
}
