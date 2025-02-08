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
    // Enable the grid on mount
    editor.updateInstanceState({ isGridMode: true });
    // Default tool is 'select'
    editor.setCurrentTool('select');
  };

  useEffect(() => {
    if (!latestMessage || !isEditorReady || !editorRef.current) return;
   
    const visualizeContent = async () => {
      const editor = editorRef.current;
      if (!editor) return;
     
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
      if (validSteps.length === 0) return;
     
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
          // Switch to laser tool after message appears
          editor.setCurrentTool('laser');
        }
      }, 100);
    };
   
    const timeoutId = setTimeout(visualizeContent, 300);
    return () => clearTimeout(timeoutId);
  }, [latestMessage, isEditorReady]);

  return (
    <div className="h-full flex flex-col bg-[#101011]">
      <div className="px-3 sm:px-6 py-2 border-b border-zinc-800/50 flex justify-between items-center bg-[#1c1c1d] sticky top-0 z-10 rounded-t-xl">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[#FFFFFF]">
            Canvas
          </h2>
        </div>
        <button
          onClick={() => canvasRef.current?.requestFullscreen()}
          className="p-1.5 hover:bg-zinc-800/50 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Go Fullscreen"
        >
          <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200" />
        </button>
      </div>
      <div ref={canvasRef} className="flex-1 tldraw__editor border border-zinc-700 rounded-lg shadow-md">
        <Tldraw onMount={handleMount} inferDarkMode />
      </div>
    </div>
  );
}
