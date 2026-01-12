"use client"

import WhiteboardCanvas from "./components/WhiteBoardCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <WhiteboardCanvas />
    </main>
  );
}
