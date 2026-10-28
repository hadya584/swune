"use client";
import { AnimatePresence, motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { Song } from "@/lib/types";

export type SwipeDirection = "left" | "right";
//how far they have to drag before it counts as a swipe
const SWIPE_DISTANCE = 120;

//fades in when it shows up and flies off to whichever side it was swiped
const cardVariants = {
  enter: { opacity: 0, scale: 0.92 },
  center: { opacity: 1, scale: 1 },
  exit: (direction: SwipeDirection) => ({
    x: direction === "right" ? 420 : -420,
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

type SwipeCardProps = {
  song: Song;
  direction: SwipeDirection;
  onSwipe: (direction: SwipeDirection) => void;
};
//the album cover, it can be dragged left or right like a card
function SwipeCard({ song, direction, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  //tilts the card a little the further it moves sideways
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  function handleDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE) onSwipe("right");
    else if (info.offset.x < -SWIPE_DISTANCE) onSwipe("left");
  }
  return (
    <motion.img
      src={song.coverUrl}
      alt={song.album}
      draggable={false}
      style={{ x, rotate }}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      //springs back to the middle if they let go before the swipe distance
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      className="absolute inset-0 m-auto size-[var(--cover)] cursor-grab rounded-card object-cover shadow-[6px_6px_0_0_var(--color-accent)] active:cursor-grabbing"
    />
  );
}

type AlbumStageProps = SwipeCardProps;
//the framed area with a blurry copy of the album art behind the swipeable cover
export default function AlbumStage({ song, direction, onSwipe }: AlbumStageProps) {
  return (
    <div className="relative h-[calc(var(--cover)+48px)] w-[calc(var(--cover)+150px)] max-w-full shrink-0 overflow-hidden rounded-[10px] border border-line">
      {/*blurry background, the key makes it fade in again for each new song*/}
      <motion.img
        key={song.coverUrl}
        src={song.coverUrl}
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.5 }}
        className="absolute -left-4 -top-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] max-w-none object-cover blur-md"
      />
      {/*light navy tint so the background doesn't fight with the cover*/}
      <div className="absolute inset-0 bg-background/25" />
      {/*lets the old card finish flying away before it's removed*/}
      <AnimatePresence initial={false} custom={direction}>
        <SwipeCard key={song.id} song={song} direction={direction} onSwipe={onSwipe} />
      </AnimatePresence>
    </div>
  );
}