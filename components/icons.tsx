//small svg icons so we don't need an icon library
export function HeartIcon() {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.2 4.5 6 4.5c2.2 0 3.6 1.2 4.4 2.4h3.2C14.4 5.7 15.8 4.5 18 4.5c3.8 0 5.7 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
      </svg>
    );
  }
  export function XIcon({ size = 22 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  export function ReplayIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    );
  }
  export function OpenIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M7 17L17 7M9 7h8v8" />
      </svg>
    );
  }
  export function SearchIcon() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
    );
  }
  export function PlayIcon() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4l13 8-13 8z" />
      </svg>
    );
  }
  export function PauseIcon() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
      </svg>
    );
  }