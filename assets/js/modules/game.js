import { getGameConfig, INSECT_IMAGE_PATH, INSECT_LIFETIME_MS, POINTS_PER_INSECT } from "./config.js";
import { formatTime } from "./utils.js";

export function createGameController({ dom, audio, getDifficulty, onGameEnd }) {
    let gameScore = 0;
    let timeRemaining = 0;
    let spawnedInsects = 0;
    let targetInsects = 0;
    let countdownIntervalId = null;
    let spawnIntervalId = null;
    const insectTimeouts = new Set();
    let totalClicks = 0;
    let missedClicks = 0;
    let insectsKilled = 0;
    let configuredTimeLimit = 0;
    let currentDifficulty = "normal";

    function updateHud() {
        if (dom.scoreValue) dom.scoreValue.textContent = String(gameScore);
        if (dom.timerValue) dom.timerValue.textContent = formatTime(timeRemaining);
    }

    function calculatePrecision() {
        if (targetInsects <= 0) return 0;
        return Math.round((targetInsects / (targetInsects + missedClicks)) * 100);
    }

    function clearActiveInsects() {
        if (!dom.gameBoard) return;
        dom.gameBoard.querySelectorAll(".insect-target").forEach((el) => el.remove());
        insectTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        insectTimeouts.clear();
    }

    function stopGameLoops() {
        if (spawnIntervalId) {
            clearInterval(spawnIntervalId);
            spawnIntervalId = null;
        }
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        clearActiveInsects();
    }

    function spawnInsect() {
        if (!dom.gameBoard) return;
        const rect = dom.gameBoard.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const insectButton = document.createElement("button");
        insectButton.type = "button";
        insectButton.className = "insect-target";
        insectButton.setAttribute("aria-label", "Insecto");

        const size = Math.floor(130 + Math.random() * 70);
        const maxLeft = Math.max(0, rect.width - size);
        const maxTop = Math.max(0, rect.height - size - 28);
        insectButton.style.width = `${size}px`;
        insectButton.style.height = `${size}px`;
        insectButton.style.left = `${Math.random() * maxLeft}px`;
        insectButton.style.top = `${Math.random() * maxTop}px`;

        const insectImage = document.createElement("img");
        insectImage.src = INSECT_IMAGE_PATH;
        insectImage.alt = "Insecto";
        insectButton.appendChild(insectImage);

        let removedByClick = false;
        const removeInsect = () => insectButton.remove();
        insectButton.addEventListener("click", () => {
            totalClicks += 1;
            insectsKilled += 1;
            removedByClick = true;
            audio.playCrushSound();
            gameScore += POINTS_PER_INSECT;
            updateHud();
            removeInsect();
        });

        dom.gameBoard.appendChild(insectButton);
        const timeoutId = setTimeout(() => {
            insectTimeouts.delete(timeoutId);
            if (!removedByClick) missedClicks += 1;
            removeInsect();
        }, INSECT_LIFETIME_MS);
        insectTimeouts.add(timeoutId);
    }

    function endGame() {
        stopGameLoops();
        const elapsedTime = Math.max(0, configuredTimeLimit - timeRemaining);
        const precision = calculatePrecision();
        onGameEnd({
            insectsKilled,
            missedClicks,
            precision,
            elapsedTime,
            score: gameScore,
            difficulty: currentDifficulty,
            timestamp: Date.now(),
        });
    }

    function startGame() {
        const difficulty = getDifficulty();
        const { insectAmount, timeLimit } = getGameConfig(difficulty);
        currentDifficulty = difficulty;
        gameScore = 0;
        timeRemaining = timeLimit;
        configuredTimeLimit = timeLimit;
        spawnedInsects = 0;
        targetInsects = insectAmount;
        totalClicks = 0;
        missedClicks = 0;
        insectsKilled = 0;
        updateHud();

        stopGameLoops();
        spawnInsect();
        spawnedInsects += 1;

        const spawnEveryMs = Math.max(250, Math.floor((timeLimit * 1000) / targetInsects));
        spawnIntervalId = setInterval(() => {
            if (spawnedInsects >= targetInsects) {
                clearInterval(spawnIntervalId);
                spawnIntervalId = null;
                return;
            }
            spawnInsect();
            spawnedInsects += 1;
        }, spawnEveryMs);

        countdownIntervalId = setInterval(() => {
            timeRemaining -= 1;
            updateHud();
            if (timeRemaining <= 0) endGame();
        }, 1000);
    }

    function bindBoardMissClicks() {
        if (!dom.gameBoard) return;
        dom.gameBoard.addEventListener("click", (event) => {
            const clickedInsect = event.target.closest(".insect-target");
            if (clickedInsect) return;
            totalClicks += 1;
            missedClicks += 1;
        });
    }

    return {
        startGame,
        endGame,
        bindBoardMissClicks,
    };
}
