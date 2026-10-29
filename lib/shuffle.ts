//returns a shuffled copy of a list without changing the original (fisher yates shuffle)
export function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      //picks a random spot from the start up to i and swaps them
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}