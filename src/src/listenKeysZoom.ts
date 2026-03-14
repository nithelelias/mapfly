import clamp from "./clamp";

export function listenZoomInOut(callback: (value: number) => void) {
    let value = 0;

    const update = (v: number) => {
        value = clamp(value + v, -1, 1);
    };

    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        if (key === "q") {
            update(1);
            callback(value);
        } else if (key === "e") {
            update(-1);
            callback(value);
        }
    });


}
