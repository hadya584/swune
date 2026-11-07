"use client";
import { useEffect, useRef, useState } from "react";

//shows the song title and slowly scrolls it sideways if it's too long to fit
export default function MarqueeTitle({ text }: { text: string }) {
  const boxRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [tooLong, setTooLong] = useState(false);
  //checks if the title is wider than its space, and again any time that space changes size
  useEffect(() => {
    function check() {
      if (!boxRef.current || !textRef.current) return;
      setTooLong(textRef.current.scrollWidth > boxRef.current.clientWidth);
    }
    check();
    //fonts can load a moment later and change the width, so check again then
    document.fonts.ready.then(check);
    //rechecks whenever the title's box changes size, like the phone layout settling or rotating
    const observer = new ResizeObserver(check);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [text]);
  //smaller on phones, with extra line height so the tops and bottoms of letters don't get clipped
  const textClass =
    "shrink-0 whitespace-nowrap py-0.5 font-display text-[clamp(26px,5vh,50px)] uppercase leading-[1.15] tracking-wide";
  return (
    //shrink-0 stops the page from squishing the title when space is tight
    <h1
      ref={boxRef}
      className={`w-full max-w-xl shrink-0 overflow-hidden ${tooLong ? "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" : ""}`}
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