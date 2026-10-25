type ActionButtonProps = {
    label: string;
    variant: "small" | "skip" | "like";
    onClick?: () => void;
    href?: string;
    children: React.ReactNode;
  };
  //the look for each kind of round button, colors change on hover but nothing moves
  const styles = {
    small: "size-11 border-[1.5px] border-line text-muted hover:border-cream hover:text-cream",
    skip: "size-[62px] border-[1.5px] border-line bg-surface/80 text-cream hover:border-cream",
    like: "size-[78px] bg-accent text-accent-ink hover:bg-accent-hover",
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