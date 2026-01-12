import axios from 'axios';
import React, { useRef, useEffect, useState } from 'react';

export default function WhiteboardCanvas() {
    const canvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#1e293b');
    const [lineWidth, setLineWidth] = useState(3);

    const [drawingActions, setDrawingActions] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);

    const [canvasImage, setCanvasImage] = useState(null);
    const [serverResponse, setServerResponse] = useState("");

    /* ------------------ Redraw canvas ------------------ */
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        reDrawPreviousData(ctx);
    }, [drawingActions]);

    /* ------------------ Drawing logic ------------------ */
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        setCurrentPath([{ x: offsetX, y: offsetY }]);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = nativeEvent;
        const newPath = [...currentPath, { x: offsetX, y: offsetY }];
        setCurrentPath(newPath);

        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(
            currentPath[currentPath.length - 1].x,
            currentPath[currentPath.length - 1].y
        );
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
        if (currentPath.length > 1) {
            setDrawingActions(prev => [
                ...prev,
                { path: currentPath, color: currentColor, lineWidth }
            ]);
        }
        setCurrentPath([]);
    };

    const undoDrawing = () => {
        setDrawingActions(prev => prev.slice(0, -1));
    };

    const clearDrawing = () => {
        setDrawingActions([]);
        setCanvasImage(null);
        setServerResponse("");
    };

    const reDrawPreviousData = (ctx) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        drawingActions.forEach(({ path, color, lineWidth }) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            path.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        });
    };

    /* ------------------ Capture canvas ------------------ */
    const handleGetHint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL('image/png');
        setCanvasImage(imageData);
    };

    /* ------------------ Upload canvas image ------------------ */
    const uploadCanvasImage = () => {
        if (!canvasRef.current) return;

        canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, 'whiteboard.png');

            try {
                const res = await axios.post(
                    'http://localhost:5000/process_image',
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setServerResponse(JSON.stringify(res.data));
            } catch (error) {
                console.error(error);
                setServerResponse("Failed to process image");
            }
        });
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="whiteboard-wrapper">
            <div className="whiteboard-tab">Whiteboard Assistant</div>

            <div className="whiteboard-container">
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

                <div className="controls">
                    <div className="control-group">
                        <label className="control-label">Color:</label>
                        <input
                            type="color"
                            value={currentColor}
                            onChange={e => setCurrentColor(e.target.value)}
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
                            onChange={e => setLineWidth(e.target.value)}
                            className="width-slider"
                        />
                        <span className="width-display">{lineWidth}px</span>
                    </div>

                    <div className="button-group">
                        <button onClick={undoDrawing} className="btn btn-primary">
                            Undo
                        </button>
                        <button onClick={clearDrawing} className="btn btn-danger">
                            Clear
                        </button>
                        <button onClick={handleGetHint} className="btn btn-success">
                            Get Hint
                        </button>
                    </div>
                </div>

                {canvasImage && (
                    <div className="preview-section">
                        <p>Captured Whiteboard:</p>
                        <img
                            src={canvasImage}
                            alt="Whiteboard preview"
                            className="canvas-preview"
                        />
                        <button
                            className="btn btn-upload"
                            onClick={uploadCanvasImage}
                        >
                            Upload & Analyze
                        </button>
                    </div>
                )}

                {serverResponse && (
                    <div className="response-message">
                        {serverResponse}
                    </div>
                )}
            </div>
        </div>
    );
}
