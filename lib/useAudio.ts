"use client";
import { useEffect, useRef, useState } from "react";

//controls one audio element so any button on the page can play, pause, or replay it
export function useAudio(src: string | undefined) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  //keeps our state in sync with what the audio is actually doing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 30);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    //stops listening when the page closes
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);
  //new song so the bar starts back at zero
  useEffect(() => {
    setCurrentTime(0);
  }, [src]);
  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    //play can fail if the browser blocks it, so we just ignore that
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }
  function replay() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
  //jumps to a spot in the song, percent is between 0 and 1
  function seek(percent: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = percent * duration;
  }
  return { audioRef, playing, currentTime, duration, toggle, replay, seek };
}