export const POINTS_PER_INSECT = 10;
export const INSECT_LIFETIME_MS = 4000;
export const CRUSH_SOUND_MAX_SECONDS = 1;
export const LOOP_END_SECONDS = 30;
export const SOUNDTRACK_PATH = "resources/bensound-refract.mp3";
export const INSECT_IMAGE_PATH = "resources/insectoimagen.webp";
export const CRUSH_SOUND_PATH = "resources/bugsmashcrush.wav";
export const CURSOR_IMAGE_PATH = "resources/test.png";

export function getGameConfig(difficulty) {
    if (difficulty === "facil") return { insectAmount: 10, timeLimit: 60 };
    if (difficulty === "dificil") return { insectAmount: 35, timeLimit: 25 };
    return { insectAmount: 20, timeLimit: 40 };
}
