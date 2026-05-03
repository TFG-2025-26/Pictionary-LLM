// import { useRef, useEffect, useState, useCallback } from "react";
// import "./DrawingCanvas.css";

// interface DrawingCanvasProps {
//   width?: number;
//   height?: number;
//   color?: string;
//   lineWidth?: number;
//   readOnly?: boolean;
// }

// export default function DrawingCanvas({
//   width = 800,
//   height = 500,
//   color = "#000000",
//   lineWidth = 3,
//   readOnly = false,
// }: DrawingCanvasProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

//   // SEÑALIZACIÓN: Configuración inicial del contexto
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.lineCap = "round";
//         ctx.lineJoin = "round";
//       }
//     }
//   }, []);

//   const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };

//     const rect = canvas.getBoundingClientRect();
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

//     return {
//       x: clientX - rect.left,
//       y: clientY - rect.top,
//     };
//   };

//   const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
//     if (readOnly) return;
//     const { x, y } = getCoordinates(e);
//     setLastPos({ x, y });
//     setIsDrawing(true);
//   };

//   const draw = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!isDrawing || readOnly) return;

//     const { x, y } = getCoordinates(e);
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (ctx) {
//       ctx.beginPath();
//       ctx.strokeStyle = color;
//       ctx.lineWidth = lineWidth;
//       ctx.moveTo(lastPos.x, lastPos.y); // Punto anterior
//       ctx.lineTo(x, y);                // Punto nuevo
//       ctx.stroke();
//       setLastPos({ x, y });            // Actualizamos el "punto anterior"
//     }
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//   };

//   return (
//     <canvas
//       ref={canvasRef}
//       width={width}
//       height={height}
//       className="drawing-canvas"
//       onMouseDown={startDrawing}
//       onMouseMove={draw}
//       onMouseUp={stopDrawing}
//       onMouseLeave={stopDrawing}
//       onTouchStart={startDrawing}
//       onTouchMove={draw}
//       onTouchEnd={stopDrawing}
//     />
//   );
// }






import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import "./DrawingCanvas.css";

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
  isEraser?: boolean; // NUEVO: Prop para activar borrador
}

// SEÑALIZACIÓN: Usamos forwardRef para exponer funciones al padre
const DrawingCanvas = forwardRef((props: DrawingCanvasProps, ref) => {
  const { width = 800, height = 500, color = "#000000", lineWidth = 3, isEraser = false } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // SEÑALIZACIÓN: Exponemos la función 'clear' al componente padre
  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }));

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    setLastPos({ x, y });
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.beginPath();
      // SEÑALIZACIÓN: Si es borrador, usamos el color de fondo (blanco)
      ctx.strokeStyle = isEraser ? "#ffffff" : color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setLastPos({ x, y });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="drawing-canvas"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={() => setIsDrawing(false)}
    //   onMouseLeave={() => setIsDrawing(false)} // SEÑALIZACIÓN: Corta el trazo si sales del canvas
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={() => setIsDrawing(false)}
    />
  );
});

export default DrawingCanvas;