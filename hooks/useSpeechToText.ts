"use client";

import * as React from "react";

type SpeechRecognitionInstance = any;

export function useSpeechToText({
  lang,
  onPartial,
  onFinal,
  onStart,
  onEnd,
  enabled,
}: {
  lang: string;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  enabled: boolean;
}) {
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
  const onPartialRef = React.useRef(onPartial);
  const onFinalRef = React.useRef(onFinal);
  const onStartRef = React.useRef(onStart);
  const onEndRef = React.useRef(onEnd);
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);

  React.useEffect(() => {
    onPartialRef.current = onPartial;
    onFinalRef.current = onFinal;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
  }, [onPartial, onFinal, onStart, onEnd]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = lang;

    recognitionRef.current.onstart = () => {
      setListening(true);
      onStartRef.current?.();
    };
    recognitionRef.current.onend = () => {
      setListening(false);
      onEndRef.current?.();
    };
    recognitionRef.current.onerror = () => {
      setListening(false);
    };
    recognitionRef.current.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim.trim()) {
        onPartialRef.current?.(interim.trim());
      }
      if (finalText.trim()) {
        onFinalRef.current?.(finalText.trim());
      }
    };

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = React.useCallback(() => {
    if (!enabled || !supported) return;
    recognitionRef.current?.start();
  }, [enabled, supported]);

  React.useEffect(() => {
    if (!enabled && listening) {
      recognitionRef.current?.stop();
    }
  }, [enabled, listening]);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = React.useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  return {
    supported,
    listening,
    start,
    stop,
    toggle,
  };
}
