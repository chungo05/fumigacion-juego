document.addEventListener("DOMContentLoaded", () => {
    const btnConfiguracion = document.getElementById("btn-configuracion");
    const btnRegresar = document.getElementById("btn-regresar");
    const btnComenzar = document.getElementById("btn-comenzar");
    const btnComenzarCaza = document.getElementById("btn-comenzar-caza");
    const btnSalir = document.getElementById("btn-salir");
    const btnHistorial = document.getElementById("btn-historial");
    const btnTerminarPartida = document.getElementById("btn-terminar-partida");

    const menuPrincipal = document.getElementById("menu-principal");
    const menuDificultad = document.getElementById("menu-dificultad");
    const juegoPrincipal = document.getElementById("juego-principal");
    const menuVictoria = document.getElementById("menu-victoria");
    const menuHistorial = document.getElementById("menu-historial");
    const gameBoard = document.getElementById("game-board");
    const scoreValue = document.getElementById("score-value");
    const timerValue = document.getElementById("timer-value");
    const victoryKilled = document.getElementById("victory-killed");
    const victoryPrecision = document.getElementById("victory-precision");
    const victoryMissed = document.getElementById("victory-missed");
    const btnReiniciarNivel = document.getElementById("btn-reiniciar-nivel");
    const btnCambiarDificultad = document.getElementById("btn-cambiar-dificultad");
    const btnHistorialRegresar = document.getElementById("btn-historial-regresar");
    const historialBody = document.getElementById("historial-body");
    const historialFiltroDificultad = document.getElementById("historial-filtro-dificultad");
    const historialRanking = document.getElementById("historial-ranking");
    const resumenPartida = document.getElementById("resumen-partida");
    const resumenKilled = document.getElementById("resumen-killed");
    const resumenPrecision = document.getElementById("resumen-precision");
    const resumenMissed = document.getElementById("resumen-missed");
    const resumenTime = document.getElementById("resumen-time");

    const diffBtns = document.querySelectorAll(".diff-btn");
    const POINTS_PER_INSECT = 10;
    const INSECT_LIFETIME_MS = 4000;
    const CRUSH_SOUND_MAX_SECONDS = 1;
    const LOOP_END_SECONDS = 30;
    const SOUNDTRACK_PATH = "resources/bensound-refract.mp3";
    const INSECT_IMAGE_PATH = "resources/insectoimagen.webp";
    const CRUSH_SOUND_PATH = "resources/bugsmashcrush.wav";

    let gameScore = 0;
    let timeRemaining = 0;
    let spawnedInsects = 0;
    let targetInsects = 0;
    let countdownIntervalId = null;
    let spawnIntervalId = null;
    const insectTimeouts = new Set();
    let crushTimeoutId = null;
    let totalClicks = 0;
    let missedClicks = 0;
    let insectsKilled = 0;
    let configuredTimeLimit = 0;
    let currentDifficulty = "normal";

    const soundtrackBtn = document.getElementById("btn-soundtrack-toggle");
    const soundtrackIcon = document.getElementById("soundtrack-icon");
    const soundtrack = new Audio(SOUNDTRACK_PATH);
    soundtrack.preload = "auto";
    soundtrack.volume = 0.55;

    const crushAudio = new Audio(CRUSH_SOUND_PATH);
    crushAudio.preload = "auto";
    crushAudio.volume = 0.65;

    const getEnabled = () => (localStorage.getItem("soundtrackEnabled") ?? "true") === "true";
    const setEnabled = (enabled) => localStorage.setItem("soundtrackEnabled", enabled ? "true" : "false");
    let soundtrackEnabled = getEnabled();

    const getGameConfig = (dificultadSeleccionada) => {
        if (dificultadSeleccionada === "facil") return { insectAmount: 10, timeLimit: 60 };
        if (dificultadSeleccionada === "dificil") return { insectAmount: 35, timeLimit: 25 };
        return { insectAmount: 20, timeLimit: 40 };
    };

    const initCustomCursor = () => {
        const source = new Image();
        source.onload = () => {
            try {
                const cursorSize = 48;
                const canvas = document.createElement("canvas");
                canvas.width = cursorSize;
                canvas.height = cursorSize;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.clearRect(0, 0, cursorSize, cursorSize);
                ctx.drawImage(source, 0, 0, cursorSize, cursorSize);
                const dataUrl = canvas.toDataURL("image/png");
                document.documentElement.style.setProperty("--swatter-cursor", `url("${dataUrl}") 10 10, auto`);
            } catch {
                // Keep default cursor if browser blocks canvas encoding.
            }
        };
        source.onerror = () => {
            // Keep default cursor if asset is missing/unreadable.
        };
        source.src = "resources/test.png";
    };

    const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const updateHud = () => {
        if (scoreValue) scoreValue.textContent = String(gameScore);
        if (timerValue) timerValue.textContent = formatTime(timeRemaining);
    };

    const calculatePrecision = () => {
        if (targetInsects <= 0) return 0;
        return Math.round((targetInsects / (targetInsects + missedClicks)) * 100);
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getHistory = () => {
        const rawHistory = localStorage.getItem("killerHistory");
        if (!rawHistory) return [];
        try {
            const parsed = JSON.parse(rawHistory);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const saveHistory = (historyItems) => {
        localStorage.setItem("killerHistory", JSON.stringify(historyItems.slice(0, 25)));
    };

    const renderHistoryTable = () => {
        if (!historialBody) return;
        const historyItems = getHistory();
        const selectedDifficulty = historialFiltroDificultad ? historialFiltroDificultad.value : "all";
        const filteredItems = selectedDifficulty === "all"
            ? historyItems
            : historyItems.filter((item) => item.difficulty === selectedDifficulty);

        if (historialRanking) {
            const topItems = [...filteredItems]
                .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
                .slice(0, 5);
            if (topItems.length === 0) {
                historialRanking.innerHTML = "<li>Sin datos.</li>";
            } else {
                historialRanking.innerHTML = topItems
                    .map((item, index) => {
                        const score = Number(item.score ?? 0);
                        const difficulty = String(item.difficulty ?? "normal");
                        return `<li>${index + 1}. ${score} pts — ${difficulty.toUpperCase()}</li>`;
                    })
                    .join("");
            }
        }
        if (filteredItems.length === 0) {
            historialBody.innerHTML = `<tr><td colspan="5">Sin partidas registradas.</td></tr>`;
            return;
        }

        historialBody.innerHTML = filteredItems
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
    };

    const updateRunSummary = (stats) => {
        if (!resumenPartida) return;
        resumenPartida.classList.remove("hidden");
        if (resumenKilled) resumenKilled.textContent = String(stats.insectsKilled);
        if (resumenPrecision) resumenPrecision.textContent = `${stats.precision}%`;
        if (resumenMissed) resumenMissed.textContent = String(stats.missedClicks);
        if (resumenTime) resumenTime.textContent = formatTime(stats.elapsedTime);
    };

    const renderSoundtrackState = () => {
        if (!soundtrackIcon) return;
        soundtrackIcon.textContent = soundtrackEnabled ? "volume_up" : "volume_off";
        soundtrackIcon.classList.toggle("text-white/60", soundtrackEnabled);
        soundtrackIcon.classList.toggle("text-white/30", !soundtrackEnabled);
    };

    const stopSoundtrack = () => {
        soundtrack.pause();
        soundtrack.currentTime = 0;
    };

    const tryPlaySoundtrack = async () => {
        if (!soundtrackEnabled) return;
        try {
            if (soundtrack.currentTime >= LOOP_END_SECONDS) soundtrack.currentTime = 0;
            await soundtrack.play();
        } catch {
            // Autoplay may require user gesture.
        }
    };

    const playCrushSound = () => {
        clearTimeout(crushTimeoutId);
        try {
            crushAudio.currentTime = 0;
            void crushAudio.play();
            crushTimeoutId = setTimeout(() => {
                crushAudio.pause();
                crushAudio.currentTime = 0;
            }, CRUSH_SOUND_MAX_SECONDS * 1000);
        } catch {
            // Ignore audio playback errors.
        }
    };

    const clearActiveInsects = () => {
        if (!gameBoard) return;
        gameBoard.querySelectorAll(".insect-target").forEach((el) => el.remove());
        insectTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        insectTimeouts.clear();
    };

    const stopGameLoops = () => {
        if (spawnIntervalId) {
            clearInterval(spawnIntervalId);
            spawnIntervalId = null;
        }
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        clearActiveInsects();
    };

    const spawnInsect = () => {
        if (!gameBoard) return;
        const rect = gameBoard.getBoundingClientRect();
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
            playCrushSound();
            gameScore += POINTS_PER_INSECT;
            updateHud();
            removeInsect();
        });

        gameBoard.appendChild(insectButton);
        const timeoutId = setTimeout(() => {
            insectTimeouts.delete(timeoutId);
            if (!removedByClick) {
                missedClicks += 1;
            }
            removeInsect();
        }, INSECT_LIFETIME_MS);
        insectTimeouts.add(timeoutId);
    };

    const endGame = () => {
        stopGameLoops();
        if (juegoPrincipal) juegoPrincipal.classList.add("hidden");
        if (menuVictoria) menuVictoria.classList.remove("hidden");

        const elapsedTime = Math.max(0, configuredTimeLimit - timeRemaining);
        const precision = calculatePrecision();
        const runStats = {
            insectsKilled,
            missedClicks,
            precision,
            elapsedTime,
            score: gameScore,
            difficulty: currentDifficulty,
            timestamp: Date.now(),
        };

        localStorage.setItem("lastRunStats", JSON.stringify(runStats));
        const previousHistory = getHistory();
        previousHistory.unshift(runStats);
        saveHistory(previousHistory);
        renderHistoryTable();
        updateRunSummary(runStats);

        if (victoryKilled) victoryKilled.textContent = String(insectsKilled);
        if (victoryPrecision) victoryPrecision.textContent = `${precision}%`;
        if (victoryMissed) victoryMissed.textContent = String(missedClicks);
    };

    const iniciarJuego = () => {
        const dificultadSeleccionada = localStorage.getItem("dificultad") || "normal";
        const { insectAmount, timeLimit } = getGameConfig(dificultadSeleccionada);
        currentDifficulty = dificultadSeleccionada;

        gameScore = 0;
        timeRemaining = timeLimit;
        configuredTimeLimit = timeLimit;
        spawnedInsects = 0;
        targetInsects = insectAmount;
        totalClicks = 0;
        missedClicks = 0;
        insectsKilled = 0;
        updateHud();

        menuPrincipal.classList.add("hidden");
        menuDificultad.classList.add("hidden");
        if (menuVictoria) menuVictoria.classList.add("hidden");
        if (juegoPrincipal) juegoPrincipal.classList.remove("hidden");

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
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    };

    diffBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            diffBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            const nivel = btn.getAttribute("data-dificultad");
            localStorage.setItem("dificultad", nivel);
        });
    });

    btnConfiguracion.addEventListener("click", () => {
        if (menuHistorial) menuHistorial.classList.add("hidden");
        if (menuVictoria) menuVictoria.classList.add("hidden");
        menuPrincipal.classList.add("hidden");
        menuDificultad.classList.remove("hidden");
    });

    btnRegresar.addEventListener("click", () => {
        if (menuHistorial) menuHistorial.classList.add("hidden");
        if (menuVictoria) menuVictoria.classList.add("hidden");
        menuDificultad.classList.add("hidden");
        menuPrincipal.classList.remove("hidden");
    });

    btnComenzar.addEventListener("click", iniciarJuego);
    btnComenzarCaza.addEventListener("click", iniciarJuego);

    if (gameBoard) {
        gameBoard.addEventListener("click", (event) => {
            const clickedInsect = event.target.closest(".insect-target");
            if (clickedInsect) return;
            totalClicks += 1;
            missedClicks += 1;
        });
    }

    if (btnReiniciarNivel) {
        btnReiniciarNivel.addEventListener("click", () => {
            iniciarJuego();
        });
    }

    if (btnCambiarDificultad) {
        btnCambiarDificultad.addEventListener("click", () => {
            if (menuHistorial) menuHistorial.classList.add("hidden");
            if (menuVictoria) menuVictoria.classList.add("hidden");
            if (juegoPrincipal) juegoPrincipal.classList.add("hidden");
            menuPrincipal.classList.add("hidden");
            menuDificultad.classList.remove("hidden");
        });
    }

    if (btnHistorial) {
        btnHistorial.addEventListener("click", () => {
            renderHistoryTable();
            if (menuVictoria) menuVictoria.classList.add("hidden");
            menuPrincipal.classList.add("hidden");
            menuDificultad.classList.add("hidden");
            if (juegoPrincipal) juegoPrincipal.classList.add("hidden");
            if (menuHistorial) menuHistorial.classList.remove("hidden");
        });
    }

    if (btnHistorialRegresar) {
        btnHistorialRegresar.addEventListener("click", () => {
            if (menuHistorial) menuHistorial.classList.add("hidden");
            menuPrincipal.classList.remove("hidden");
        });
    }

    if (btnTerminarPartida) {
        btnTerminarPartida.addEventListener("click", () => {
            endGame();
        });
    }

    if (historialFiltroDificultad) {
        historialFiltroDificultad.addEventListener("change", () => {
            renderHistoryTable();
        });
    }

    if (btnSalir) {
        btnSalir.addEventListener("click", () => {
            try {
                window.close();
            } finally {
                setTimeout(() => {
                    if (!window.closed) {
                        window.open("about:blank", "_self");
                        window.close();
                    }
                }, 50);
            }
        });
    }

    if (!localStorage.getItem("dificultad")) {
        localStorage.setItem("dificultad", "normal");
    }

    initCustomCursor();

    const savedLastRun = localStorage.getItem("lastRunStats");
    if (savedLastRun) {
        try {
            const parsedStats = JSON.parse(savedLastRun);
            if (parsedStats && typeof parsedStats === "object") {
                updateRunSummary(parsedStats);
            }
        } catch {
            // Ignore invalid previous stats.
        }
    }

    renderHistoryTable();

    renderSoundtrackState();
    soundtrack.addEventListener("timeupdate", () => {
        if (soundtrack.currentTime >= LOOP_END_SECONDS) {
            soundtrack.currentTime = 0;
            void soundtrack.play();
        }
    });

    soundtrack.addEventListener("ended", () => {
        if (!soundtrackEnabled) return;
        soundtrack.currentTime = 0;
        void soundtrack.play();
    });

    const onFirstGesture = () => {
        window.removeEventListener("pointerdown", onFirstGesture);
        window.removeEventListener("keydown", onFirstGesture);
        void tryPlaySoundtrack();
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });

    if (soundtrackBtn) {
        soundtrackBtn.addEventListener("click", () => {
            soundtrackEnabled = !soundtrackEnabled;
            setEnabled(soundtrackEnabled);
            renderSoundtrackState();
            if (soundtrackEnabled) void tryPlaySoundtrack();
            else stopSoundtrack();
        });
    }
});
