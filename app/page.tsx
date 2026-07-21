import { CtfList } from "@/components/ctf-list";
import Balatro from "@/components/react-bits/balatro";

export default function Home() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      {/* React Bits Balatro background — all devices */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <Balatro
          className="h-full w-full"
          color1="#DE443B"
          color2="#006BB4"
          color3="#0a1213"
          contrast={3.8}
          lighting={0.45}
          spinSpeed={5.5}
          spinAmount={0.28}
          isRotate={false}
          mouseInteraction
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,10,0.55)_70%,rgba(5,8,10,0.88)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <CtfList />
      </div>
    </main>
  );
}
