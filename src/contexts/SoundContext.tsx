import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playNotification: () => void;
  playHover: () => void;
}

const SoundContext = createContext<SoundContextType>({} as SoundContextType);

/** Simple oscillator-based sound effects using Web Audio API */
function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem("zappoll_sound");
    return stored !== "off";
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08) => {
      if (!soundEnabled) return;
      const ctx = getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [soundEnabled, getCtx]
  );

  const playClick = useCallback(() => {
    playTone(800, 0.06, "square", 0.04);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    // Two-tone ascending chime
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  }, [soundEnabled, getCtx]);

  const playNotification = useCallback(() => {
    playTone(440, 0.15, "triangle", 0.06);
  }, [playTone]);

  const playHover = useCallback(() => {
    playTone(1200, 0.03, "sine", 0.02);
  }, [playTone]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("zappoll_sound", next ? "on" : "off");
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider
      value={{ soundEnabled, toggleSound, playClick, playSuccess, playNotification, playHover }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
