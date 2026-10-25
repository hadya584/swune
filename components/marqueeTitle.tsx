"use client";
import { useEffect, useRef, useState } from "react";

//shows the song title and slowly scrolls it sideways if it's too long to fit
export default function MarqueeTitle({ text }: { text: string }) {
  const boxRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [tooLong, setTooLong] = useState(false);
  //checks if the title is wider than its space, and again if the window resizes
  useEffect(() => {
    function check() {
      if (!boxRef.current || !textRef.current) return;
      setTooLong(textRef.current.scrollWidth > boxRef.current.clientWidth);
    }
    check();
    //fonts can load a moment later and change the width, so check again then
    document.fonts.ready.then(check);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);
  const textClass = "shrink-0 whitespace-nowrap font-display text-[clamp(30px,5.6vh,54px)] uppercase leading-none tracking-wide";
  return (
    <h1
      ref={boxRef}
      className={`w-full max-w-xl overflow-hidden ${tooLong ? "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" : ""}`}
    >
      {/*when it's too long we show the title twice in a row so the loop looks seamless*/}
      <div className={tooLong ? "flex w-max animate-marquee" : "flex justify-center"}>
        <span ref={textRef} className={`${textClass} ${tooLong ? "pr-16" : ""}`}>
          {text}
        </span>
        {tooLong && (
          <span aria-hidden="true" className={`${textClass} pr-16`}>
            {text}
          </span>
        )}
      </div>
    </h1>
  );
}