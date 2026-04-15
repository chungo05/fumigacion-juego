const DIFFICULTY_KEY = "dificultad";
const LAST_RUN_KEY = "lastRunStats";
const HISTORY_KEY = "killerHistory";
const SOUNDTRACK_KEY = "soundtrackEnabled";

export function getDifficulty() {
    return localStorage.getItem(DIFFICULTY_KEY) || "normal";
}

export function setDifficulty(value) {
    localStorage.setItem(DIFFICULTY_KEY, value);
}

export function ensureDifficulty() {
    if (!localStorage.getItem(DIFFICULTY_KEY)) {
        setDifficulty("normal");
    }
}

export function getSoundtrackEnabled() {
    return (localStorage.getItem(SOUNDTRACK_KEY) ?? "true") === "true";
}

export function setSoundtrackEnabled(enabled) {
    localStorage.setItem(SOUNDTRACK_KEY, enabled ? "true" : "false");
}

export function getLastRunStats() {
    const raw = localStorage.getItem(LAST_RUN_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
}

export function setLastRunStats(stats) {
    localStorage.setItem(LAST_RUN_KEY, JSON.stringify(stats));
}

export function getHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveHistory(historyItems, maxItems = 25) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyItems.slice(0, maxItems)));
}
