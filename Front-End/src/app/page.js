"use client"

import WhiteboardCanvas from "./components/WhiteBoardCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="flex text-4l font-bold mb-8">Whiteboard Assistant</h1>
      <WhiteboardCanvas />
    </main>
  );
}
