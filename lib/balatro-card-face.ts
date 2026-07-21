/** Balatro joker card faces from local assets. */

export const JOKER_IMAGES = [
  "/jokers/joker-01.png",
  "/jokers/joker-02.png",
  "/jokers/joker-03.png",
  "/jokers/joker-04.png",
  "/jokers/joker-05.png",
] as const;

/** Pick a joker art path by seed (challenge id, index, etc.). */
export function balatroCardFace(seed: number): string {
  const i = Math.abs(Math.trunc(seed)) % JOKER_IMAGES.length;
  return JOKER_IMAGES[i];
}

/** Stable pick for a challenge id + list index. */
export function jokerForChallenge(id: number, index = 0): string {
  return balatroCardFace(id * 3 + index);
}
