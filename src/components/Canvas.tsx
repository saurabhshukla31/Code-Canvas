import { Tldraw, createShapeId } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useEffect, useRef, useState } from 'react';
import { Maximize } from 'lucide-react';
import type { Editor } from '@tldraw/tldraw';

interface CanvasProps {
  latestMessage?: string;
}

export function Canvas({ latestMessage }: CanvasProps) {
  const editorRef = useRef<Editor | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  const handleFullscreen = () => {
    if (!canvasRef.current) return;

    if (!document.fullscreenElement) {
      if (canvasRef.current.requestFullscreen) {
        canvasRef.current.requestFullscreen();
      } else if (canvasRef.current.mozRequestFullScreen) {
        canvasRef.current.mozRequestFullScreen();
      } else if (canvasRef.current.webkitRequestFullscreen) {
        canvasRef.current.webkitRequestFullscreen();
      } else if (canvasRef.current.msRequestFullscreen) {
        canvasRef.current.msRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!latestMessage || !isEditorReady || !editorRef.current) return;

    const visualizeContent = async () => {
      const editor = editorRef.current;
      if (!editor) return;

      try {
        editor.selectAll();
        editor.deleteShapes(editor.getSelectedShapeIds());

        const lines = latestMessage.split('\n');
        const steps: string[] = [];
        let isPseudocodeSection = false;

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.toLowerCase().includes('pseudocode') || 
              trimmedLine.toLowerCase().includes('algorithm steps')) {
            isPseudocodeSection = true;
            continue;
          }
          
          if (isPseudocodeSection && /^\d+[.)\s]/.test(trimmedLine)) {
            const step = trimmedLine.replace(/^\d+[.)\s]+/, '').trim();
            if (step) steps.push(step);
          }
        }

        const validSteps = steps.slice(0, 5);
        if (validSteps.length === 0) {
          console.warn('No valid steps found in the message');
          return;
        }

        editor.createShape({
          id: createShapeId(),
          type: 'text',
          x: 10,
          y: 50,
          props: {
            text: '🔍 Algorithm Steps',
            size: 'm',
            font: 'draw',
            textAlign: 'start',
            color: 'blue',
          },
        });

        validSteps.forEach((step, index) => {
          editor.createShape({
            id: createShapeId(),
            type: 'text',
            x: 20,
            y: 90 + (index * 40),
            props: {
              text: `${index + 1}. ${step}`,
              size: 's',
              font: 'draw',
              textAlign: 'start',
              color: 'black',
            },
          });
        });

        setTimeout(() => {
          if (editor) {
            editor.zoomToFit();
            editor.setCamera({ x: 0, y: 0, z: 1 });
          }
        }, 100);

      } catch (error) {
        console.error('Error creating text:', error);
      }
    };

    const timeoutId = setTimeout(visualizeContent, 300);
    return () => clearTimeout(timeoutId);
  }, [latestMessage, isEditorReady]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#171718]/80 backdrop-blur-sm border-b border-zinc-800/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Canvas</h2>
          <p className="text-sm text-zinc-400 mt-1"></p>
        </div>
        <button
          onClick={handleFullscreen}
          className="p-2 text-sm text-white hover:bg-[#4A5568] transition-all focus:outline-none"
          title="Go Fullscreen"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
      <div ref={canvasRef} className="flex-1 tldraw__editor">
        <Tldraw 
          onMount={handleMount} 
          inferDarkMode
        />
      </div>
    </div>
  );
}
