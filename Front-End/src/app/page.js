"use client"

import WhiteboardCanvas from "./components/WhiteBoardCanvas";

export default function Home() {
   const manageButtonClick = async () => {
     console.log("Calling Backend");
     fetch("http://127.0.0.1:5000/process_image")
     .then((response) => response.json())
     .then((data) => console.log(data))
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {/* <button className="border p-4 bg-blue-400 text-white rounded-lg" onClick={manageButtonClick}>Call for the back</button> */}
      <h1 className="text-4l font-bold mb-8">Whiteboard Drawing</h1>
      <WhiteboardCanvas />
    </main>
  );
}
