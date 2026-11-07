type ActionButtonProps = {
    label: string;
    variant: "small" | "skip" | "like";
    onClick?: () => void;
    href?: string;
    children: React.ReactNode;
  };
  //the look for each kind of round button, colors change on hover but nothing moves
  const styles = {
    small: "size-9 border-[1.5px] border-line text-muted hover:border-cream hover:text-cream sm:size-[clamp(36px,5vh,44px)]",
    skip: "size-[50px] border-[1.5px] border-line bg-surface/80 text-cream hover:border-cream sm:size-[clamp(46px,6.8vh,62px)]",
    like: "size-[62px] bg-accent text-accent-ink hover:bg-accent-hover sm:size-[clamp(56px,8.5vh,78px)]",
  };
  //a round button with a little label under it
  export default function ActionButton({ label, variant, onClick, href, children }: ActionButtonProps) {
    const circle = `grid place-items-center rounded-full transition-colors ${styles[variant]}`;
    return (
      <div className="flex flex-col items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
        {/*if there's a link it opens in a new tab, otherwise it's a normal button*/}
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={circle}>
            {children}
          </a>
        ) : (
          <button onClick={onClick} aria-label={label} className={circle}>
            {children}
          </button>
        )}
        <span>{label}</span>
      </div>
    );
  }