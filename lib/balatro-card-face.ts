/** Balatro joker card faces from local assets — 5 unique arts. */

export const JOKER_IMAGES = [
  "/jokers/joker-01.png",
  "/jokers/joker-02.png",
  "/jokers/joker-03.png",
  "/jokers/joker-04.png",
  "/jokers/joker-05.png",
] as const;

/**
 * Unique joker per list index (0 → joker-01, 1 → joker-02, …).
 * For 5 CTFs you get all 5 arts; extras cycle.
 */
export function jokerForChallenge(_id: number, index = 0): string {
  return JOKER_IMAGES[index % JOKER_IMAGES.length];
}

/** All joker paths (e.g. loading fan). */
export function allJokers(): readonly string[] {
  return JOKER_IMAGES;
}
