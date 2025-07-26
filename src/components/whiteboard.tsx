'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Brush, Eraser, Trash2, Undo2, Redo2, Mic, MicOff, Play, Pause, Download } from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/context/locale-context';

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const t = useTranslations();

  const saveState = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const scale = window.devicePixelRatio;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      canvas.width = Math.floor(parent.clientWidth * scale);
      canvas.height = Math.floor(parent.clientHeight * scale);

      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(scale, scale);
      contextRef.current = context;
      
      context.fillStyle = 'white';
      context.fillRect(0,0, canvas.width, canvas.height);

      if(historyIndex >= 0 && history[historyIndex]){
        context.putImageData(history[historyIndex], 0, 0);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (contextRef.current && historyIndex === -1) {
        saveState();
    }
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [history, historyIndex, saveState]);

  useEffect(() => {
    const context = contextRef.current;
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize, isErasing]);

  const getCoords = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e instanceof MouseEvent) {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoords(e.nativeEvent);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    const context = contextRef.current;
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
    saveState();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoords(e.nativeEvent);
    context.lineTo(x, y);
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      const lastState = history[historyIndex];
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
      // Restore the cleared state to prevent re-clearing on redo
      setHistory(prev => [...prev.slice(0, historyIndex), lastState, ...prev.slice(historyIndex + 1)]);
    }
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      contextRef.current?.putImageData(history[newIndex], 0, 0);
    }
  };

  const redo = () => {
     if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      contextRef.current?.putImageData(history[newIndex], 0, 0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: t('recordingStarted') });
    } catch (err) {
      toast({ variant: 'destructive', title: t('micError'), description: t('micErrorDesc') });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: t('recordingStopped') });
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background rounded-lg overflow-hidden">
      <div className="p-2 flex items-center justify-center gap-1 sm:gap-2 flex-wrap border-b bg-card">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={!isErasing ? 'secondary': 'ghost'} size="sm" onClick={() => setIsErasing(false)} tooltip={t('brush')}>
              <Brush className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label>{t('color')}</Label>
                  <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setIsErasing(false); }} className="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
               </div>
               <div className="space-y-2">
                  <Label>{t('brushSize').replace('{size}', brushSize.toString())}</Label>
                  <Slider defaultValue={[brushSize]} max={50} step={1} onValueChange={(value) => { setBrushSize(value[0]); setIsErasing(false); }} />
               </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant={isErasing ? 'secondary': 'ghost'} size="sm" onClick={() => setIsErasing(true)} tooltip={t('eraser')}>
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-6 bg-border mx-1 sm:mx-2" />
        <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} tooltip={t('undo')}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} tooltip={t('redo')}>
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={clearCanvas} tooltip={t('clearAll')}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-6 bg-border mx-1 sm:mx-2" />
        <Button variant={isRecording ? 'destructive' : 'ghost'} size="sm" onClick={isRecording ? stopRecording : startRecording} tooltip={isRecording ? t('stopRecording') : t('startRecording')}>
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        {audioUrl && (
          <>
            <Button variant="ghost" size="sm" onClick={togglePlay} tooltip={isPlaying ? t('pause') : t('play')}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" asChild tooltip={t('downloadAudio')}>
              <a href={audioUrl} download="whiteboard-audio.webm">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
          </>
        )}
      </div>
      <div className="flex-grow h-full w-full cursor-crosshair bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchMove={draw}
          className="bg-transparent"
        />
      </div>
    </div>
  );
};

export { Whiteboard };
