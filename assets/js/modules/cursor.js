export function initCustomCursor(imagePath) {
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
    source.src = imagePath;
}
