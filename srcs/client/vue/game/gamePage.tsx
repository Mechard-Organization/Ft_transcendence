import { useEffect } from "react";
import { pong } from "./Meshes";

export default function GamePage() {
  useEffect(() => {
    pong(); // s'exécute une fois après que le composant soit monté
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center p-8">
      <div className="mb-6 flex justify-between w-full max-w-4xl">
        <h1 className="items-center text-4xl text-[#8B5A3C]">PongpongPurin</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-4xl">
        {/* Le canvas de pong sera injecté par la fonction pong() */}
      </div>
    </div>
  );
}
