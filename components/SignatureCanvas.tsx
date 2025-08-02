import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onSignatureChange?: (isEmpty: boolean) => void;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ width = 400, height = 150, className = '', onSignatureChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsEmpty(true);
            onSignatureChange?.(true);
          }
        }
      },
      isEmpty: () => isEmpty,
      toDataURL: () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : '';
      }
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set up canvas for drawing
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Add a border and background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
      
      // Reset drawing style
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

    }, [width, height]);

    const startDrawing = (e: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsDrawing(true);
      
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();

      if (isEmpty) {
        setIsEmpty(false);
        onSignatureChange?.(false);
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    // Prevent scrolling when drawing on touch devices
    const handleTouchStart = (e: any) => {
      e.preventDefault();
      startDrawing(e);
    };

    const handleTouchMove = (e: any) => {
      e.preventDefault();
      draw(e);
    };

    const handleTouchEnd = (e: any) => {
      e.preventDefault();
      stopDrawing();
    };

    return (
      <canvas
        ref={canvasRef}
        className={`border border-slate-300 bg-white cursor-crosshair ${className}`}
        style={{ width, height }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;