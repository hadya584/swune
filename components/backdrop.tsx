//a huge blurry copy of the album art that fills the screen behind everything
export default function Backdrop({ imageUrl }: { imageUrl: string }) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/*key makes it fade in fresh every time the song changes*/}
        <img
          key={imageUrl}
          src={imageUrl}
          alt=""
          className="h-full w-full scale-125 animate-fade-in object-cover opacity-40 blur-3xl"
        />
        {/*darkens it toward the bottom so the text stays readable*/}
        <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/70 to-background" />
      </div>
    );
  }