"use client"

import { useRef, useEffect, useState } from "react"

export default function WhiteboardCanvas() {
  const canvasRef = useRef(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#1e293b")
  const [lineWidth, setLineWidth] = useState(3)

  const [drawingActions, setDrawingActions] = useState([])
  const [currentPath, setCurrentPath] = useState([])

  const [canvasImage, setCanvasImage] = useState(null)
  const [serverResponse, setServerResponse] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [showAbout, setShowAbout] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    reDrawPreviousData(ctx)
  }, [drawingActions])

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setIsDrawing(true)
    setCurrentPath([{ x: offsetX, y: offsetY }])
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || canvasImage) return

    const { offsetX, offsetY } = nativeEvent
    const newPath = [...currentPath, { x: offsetX, y: offsetY }]
    setCurrentPath(newPath)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = currentColor
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y)
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }

  const endDrawing = () => {
    if (canvasImage) return

    setIsDrawing(false)
    if (currentPath.length > 1) {
      setDrawingActions((prev) => [...prev, { path: currentPath, color: currentColor, lineWidth }])
    }
    setCurrentPath([])
  }

  const undoDrawing = () => {
    if (canvasImage) return
    setDrawingActions((prev) => prev.slice(0, -1))
  }

  const clearDrawing = () => {
    setDrawingActions([])
    setCanvasImage(null)
    setServerResponse("")
    setShowHint(false)
  }

  const reDrawPreviousData = (ctx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawingActions.forEach(({ path, color, lineWidth }) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.stroke()
    })
  }

  const handleTakeScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL("image/png")
    setCanvasImage(imageData)
  }

  const handleRetakeScreenshot = () => {
    setCanvasImage(null)
    setServerResponse("")
    setShowHint(false)
  }

  const getHint = async () => {
    if (!canvasRef.current) return

    setIsAnalyzing(true)
    setServerResponse("")

    setTimeout(() => {
      setServerResponse(
        "Based on your drawing, here are some suggestions:\n\n" +
          "1. Consider the time complexity of your algorithm\n" +
          "2. Look for opportunities to optimize with dynamic programming\n" +
          "3. Try to visualize the problem with a different data structure\n\n" +
          "Keep practicing! Your approach shows good understanding of the fundamentals.",
      )
      setIsAnalyzing(false)
      setShowHint(true)
    }, 2000)
  }

  return (
      <div className="whiteboard-wrapper">
        <div className="whiteboard-tab">
          Whiteboard Assistant
          <button onClick={() => setShowAbout(true)} className="about-btn" title="About this project">
            About
          </button>
        </div>

        <div className="whiteboard-container">
          {!canvasImage ? (
            <canvas
              ref={canvasRef}
              width={900}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseOut={endDrawing}
              className="whiteboard-canvas"
            />
          ) : (
            <div className="screenshot-display">
              <img src={canvasImage} alt="Captured Whiteboard" className="captured-image" />
            </div>
          )}

          <div className="controls">
            {!canvasImage && (
              <>
                <div className="control-group">
                  <label className="control-label">Color:</label>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="color-picker"
                  />
                </div>

                <div className="control-group width-control">
                  <label className="control-label">Width:</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="width-slider"
                  />
                  <span className="width-display">{lineWidth}px</span>
                </div>
              </>
            )}

            <div className="button-group">
              {!canvasImage && (
                <>
                  <button onClick={undoDrawing} className="btn">
                    Undo
                  </button>

                  <button onClick={clearDrawing} className="btn">
                    Clear
                  </button>
                </>
              )}

              {!canvasImage ? (
                <button onClick={handleTakeScreenshot} className="btn">
                  Take Screenshot
                </button>
              ) : (
                <>
                  <button className="btn" onClick={handleRetakeScreenshot}>
                    Retake Screenshot
                  </button>

                  <button className="btn" onClick={getHint} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Get Hint"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {showAbout && (
          <div className="modal-overlay" onClick={() => setShowAbout(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowAbout(false)}>
                ×
              </button>
              <h2 className="modal-title">Whiteboard Assistant</h2>
              <p className="modal-text">
                Developed for <strong>DragonHacks 2024</strong> at Drexel University
              </p>
              <div className="modal-links">
                <a
                  href="https://github.com/VicenteVigueras/whiteboard-assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://devpost.com/software/whiteboardapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link"
                >
                  Devpost Project
                </a>
                                <a
                  href="https://dragonhacks-2024.devpost.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link"
                >
                  More
                </a>
              </div>
            </div>
          </div>
        )}

        {showHint && serverResponse && (
          <div className="modal-overlay" onClick={() => setShowHint(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowHint(false)}>
                ×
              </button>
              <h2 className="modal-title">AI Hint</h2>
              <p className="modal-text">{serverResponse}</p>
              <p className="modal-disclaimer">
                Note: OpenAI API is currently disabled. This is a sample response demonstrating the functionality.
              </p>
            </div>
          </div>
        )}
      </div>
  )
}