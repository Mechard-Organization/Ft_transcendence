import { useEffect, useRef } from "react";
import { pong } from "./Meshes";

export default function GamePage() {
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
      pong();
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center p-8">
      <div className="mb-6 flex justify-between w-full max-w-4xl">
        <h1 className="text-4xl text-[#8B5A3C]">PongpongPurin</h1>
      </div>

      <div
        ref={gameContainer}
        className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-4xl"
      >
        {}
      </div>
    </div>
  );
}
