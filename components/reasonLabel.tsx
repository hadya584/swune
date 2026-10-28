import { Reason } from "@/lib/types";

//turns the reason into the little line above the album
export default function ReasonLabel({ reason }: { reason: Reason }) {
  const label = "max-w-full truncate font-mono text-[10px] uppercase tracking-[0.3em] text-muted";
  if (reason.kind === "liked") {
    return (
      <p className={label}>
        Because you liked <span className="text-accent">{reason.title}</span> by{" "}
        <span className="text-accent">{reason.artist}</span>
      </p>
    );
  }
  if (reason.kind === "radio") {
    return (
      <p className={label}>
        <span className="text-accent">{reason.artist}</span> radio
      </p>
    );
  }
  return (
    <p className={label}>
      Because you like <span className="text-accent">{reason.artist}</span>
    </p>
  );
}