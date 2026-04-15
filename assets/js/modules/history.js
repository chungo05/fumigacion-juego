import { formatDateTime, formatTime } from "./utils.js";
import { getHistory, getLastRunStats, saveHistory, setLastRunStats } from "./storage.js";

export function createHistoryController(dom) {
    function updateRunSummary(stats) {
        if (!dom.resumenPartida || !stats) return;
        dom.resumenPartida.classList.remove("hidden");
        if (dom.resumenKilled) dom.resumenKilled.textContent = String(stats.insectsKilled ?? 0);
        if (dom.resumenPrecision) dom.resumenPrecision.textContent = `${stats.precision ?? 0}%`;
        if (dom.resumenMissed) dom.resumenMissed.textContent = String(stats.missedClicks ?? 0);
        if (dom.resumenTime) dom.resumenTime.textContent = formatTime(stats.elapsedTime ?? 0);
    }

    function renderHistoryTable() {
        if (!dom.historialBody) return;
        const historyItems = getHistory();
        const selectedDifficulty = dom.historialFiltroDificultad ? dom.historialFiltroDificultad.value : "all";
        const filteredItems = selectedDifficulty === "all"
            ? historyItems
            : historyItems.filter((item) => item.difficulty === selectedDifficulty);

        if (dom.historialRanking) {
            const topItems = [...filteredItems]
                .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
                .slice(0, 5);
            if (topItems.length === 0) {
                dom.historialRanking.innerHTML = "<li>Sin datos.</li>";
            } else {
                dom.historialRanking.innerHTML = topItems
                    .map((item, index) => {
                        const score = Number(item.score ?? 0);
                        const difficulty = String(item.difficulty ?? "normal");
                        return `<li>${index + 1}. ${score} pts — ${difficulty.toUpperCase()}</li>`;
                    })
                    .join("");
            }
        }

        if (filteredItems.length === 0) {
            dom.historialBody.innerHTML = '<tr><td colspan="5">Sin partidas registradas.</td></tr>';
            return;
        }

        dom.historialBody.innerHTML = filteredItems
            .map((item) => {
                const score = Number(item.score ?? 0);
                const missed = Number(item.missedClicks ?? 0);
                const precision = Number(item.precision ?? 0);
                const timestamp = Number(item.timestamp ?? Date.now());
                const difficulty = String(item.difficulty ?? "normal");
                return `<tr>
                    <td>${formatDateTime(timestamp)}</td>
                    <td>${difficulty.toUpperCase()}</td>
                    <td>${score}</td>
                    <td>${missed}</td>
                    <td>${precision}%</td>
                </tr>`;
            })
            .join("");
    }

    function persistRunStats(runStats) {
        setLastRunStats(runStats);
        const previousHistory = getHistory();
        previousHistory.unshift(runStats);
        saveHistory(previousHistory);
        renderHistoryTable();
        updateRunSummary(runStats);
    }

    function hydrateFromLastRun() {
        const stats = getLastRunStats();
        if (stats) updateRunSummary(stats);
    }

    return {
        renderHistoryTable,
        persistRunStats,
        hydrateFromLastRun,
    };
}
