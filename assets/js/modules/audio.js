import {
    CRUSH_SOUND_MAX_SECONDS,
    CRUSH_SOUND_PATH,
    LOOP_END_SECONDS,
    SOUNDTRACK_PATH,
} from "./config.js";
import { getSoundtrackEnabled, setSoundtrackEnabled } from "./storage.js";

export function createAudioController(soundtrackBtn, soundtrackIcon) {
    const soundtrack = new Audio(SOUNDTRACK_PATH);
    soundtrack.preload = "auto";
    soundtrack.volume = 0.55;

    const crushAudio = new Audio(CRUSH_SOUND_PATH);
    crushAudio.preload = "auto";
    crushAudio.volume = 0.65;

    let crushTimeoutId = null;
    let soundtrackEnabled = getSoundtrackEnabled();

    function renderSoundtrackState() {
        if (!soundtrackIcon) return;
        soundtrackIcon.textContent = soundtrackEnabled ? "volume_up" : "volume_off";
        soundtrackIcon.classList.toggle("text-white/60", soundtrackEnabled);
        soundtrackIcon.classList.toggle("text-white/30", !soundtrackEnabled);
    }

    function stopSoundtrack() {
        soundtrack.pause();
        soundtrack.currentTime = 0;
    }

    async function tryPlaySoundtrack() {
        if (!soundtrackEnabled) return;
        try {
            if (soundtrack.currentTime >= LOOP_END_SECONDS) soundtrack.currentTime = 0;
            await soundtrack.play();
        } catch {
            // Autoplay may require user gesture.
        }
    }

    function playCrushSound() {
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
    }

    function bind() {
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
                setSoundtrackEnabled(soundtrackEnabled);
                renderSoundtrackState();
                if (soundtrackEnabled) void tryPlaySoundtrack();
                else stopSoundtrack();
            });
        }
    }

    return {
        bind,
        playCrushSound,
    };
}
