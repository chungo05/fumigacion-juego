import { CURSOR_IMAGE_PATH } from "./modules/config.js";
import { createAudioController } from "./modules/audio.js";
import { initCustomCursor } from "./modules/cursor.js";
import { createGameController } from "./modules/game.js";
import { createHistoryController } from "./modules/history.js";
import { ensureDifficulty, getDifficulty, setDifficulty } from "./modules/storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const dom = {
        btnConfiguracion: document.getElementById("btn-configuracion"),
        btnRegresar: document.getElementById("btn-regresar"),
        btnComenzar: document.getElementById("btn-comenzar"),
        btnComenzarCaza: document.getElementById("btn-comenzar-caza"),
        btnSalir: document.getElementById("btn-salir"),
        btnHistorial: document.getElementById("btn-historial"),
        btnTerminarPartida: document.getElementById("btn-terminar-partida"),
        btnReiniciarNivel: document.getElementById("btn-reiniciar-nivel"),
        btnCambiarDificultad: document.getElementById("btn-cambiar-dificultad"),
        btnHistorialRegresar: document.getElementById("btn-historial-regresar"),
        soundtrackBtn: document.getElementById("btn-soundtrack-toggle"),
        soundtrackIcon: document.getElementById("soundtrack-icon"),
        menuPrincipal: document.getElementById("menu-principal"),
        menuDificultad: document.getElementById("menu-dificultad"),
        juegoPrincipal: document.getElementById("juego-principal"),
        menuVictoria: document.getElementById("menu-victoria"),
        menuHistorial: document.getElementById("menu-historial"),
        gameBoard: document.getElementById("game-board"),
        scoreValue: document.getElementById("score-value"),
        timerValue: document.getElementById("timer-value"),
        victoryKilled: document.getElementById("victory-killed"),
        victoryPrecision: document.getElementById("victory-precision"),
        victoryMissed: document.getElementById("victory-missed"),
        historialBody: document.getElementById("historial-body"),
        historialFiltroDificultad: document.getElementById("historial-filtro-dificultad"),
        historialRanking: document.getElementById("historial-ranking"),
        resumenPartida: document.getElementById("resumen-partida"),
        resumenKilled: document.getElementById("resumen-killed"),
        resumenPrecision: document.getElementById("resumen-precision"),
        resumenMissed: document.getElementById("resumen-missed"),
        resumenTime: document.getElementById("resumen-time"),
        diffBtns: document.querySelectorAll(".diff-btn"),
    };

    const audio = createAudioController(dom.soundtrackBtn, dom.soundtrackIcon);
    const history = createHistoryController(dom);
    const game = createGameController({
        dom,
        audio,
        getDifficulty,
        onGameEnd: (runStats) => {
            hideAllScreens();
            if (dom.menuVictoria) dom.menuVictoria.classList.remove("hidden");

            history.persistRunStats(runStats);
            if (dom.victoryKilled) dom.victoryKilled.textContent = String(runStats.insectsKilled);
            if (dom.victoryPrecision) dom.victoryPrecision.textContent = `${runStats.precision}%`;
            if (dom.victoryMissed) dom.victoryMissed.textContent = String(runStats.missedClicks);
        },
    });

    function hideAllScreens() {
        if (dom.menuPrincipal) dom.menuPrincipal.classList.add("hidden");
        if (dom.menuDificultad) dom.menuDificultad.classList.add("hidden");
        if (dom.juegoPrincipal) dom.juegoPrincipal.classList.add("hidden");
        if (dom.menuVictoria) dom.menuVictoria.classList.add("hidden");
        if (dom.menuHistorial) dom.menuHistorial.classList.add("hidden");
    }

    function showMainMenu() {
        hideAllScreens();
        if (dom.menuPrincipal) dom.menuPrincipal.classList.remove("hidden");
    }

    function showDifficultyMenu() {
        hideAllScreens();
        if (dom.menuDificultad) dom.menuDificultad.classList.remove("hidden");
    }

    function showGameScreen() {
        hideAllScreens();
        if (dom.juegoPrincipal) dom.juegoPrincipal.classList.remove("hidden");
    }

    function showHistoryScreen() {
        hideAllScreens();
        history.renderHistoryTable();
        if (dom.menuHistorial) dom.menuHistorial.classList.remove("hidden");
    }

    function startGameFlow() {
        showGameScreen();
        game.startGame();
    }

    dom.diffBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            dom.diffBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            const level = btn.getAttribute("data-dificultad");
            setDifficulty(level);
        });
    });

    dom.btnConfiguracion?.addEventListener("click", showDifficultyMenu);
    dom.btnRegresar?.addEventListener("click", showMainMenu);
    dom.btnComenzar?.addEventListener("click", startGameFlow);
    dom.btnComenzarCaza?.addEventListener("click", startGameFlow);
    dom.btnReiniciarNivel?.addEventListener("click", startGameFlow);
    dom.btnCambiarDificultad?.addEventListener("click", showDifficultyMenu);
    dom.btnHistorial?.addEventListener("click", showHistoryScreen);
    dom.btnHistorialRegresar?.addEventListener("click", showMainMenu);
    dom.btnTerminarPartida?.addEventListener("click", () => game.endGame());
    dom.historialFiltroDificultad?.addEventListener("change", () => history.renderHistoryTable());

    dom.btnSalir?.addEventListener("click", () => {
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

    ensureDifficulty();
    initCustomCursor(CURSOR_IMAGE_PATH);
    game.bindBoardMissClicks();
    history.hydrateFromLastRun();
    history.renderHistoryTable();
    audio.bind();
});
