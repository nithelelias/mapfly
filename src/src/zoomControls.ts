import clamp from "./clamp"
import { listenZoomInOut } from "./listenKeysZoom"

export default class ZoomControls {
    constructor(parentElement: HTMLElement, map: L.Map, min: number, max: number) {
        const container = document.createElement("div")
        container.className = "ui-zoom-controls"
        parentElement.appendChild(container)

        const zoomIn = document.createElement("button")
        zoomIn.className = "ui-zoom-in"
        zoomIn.innerHTML = "+"
        container.appendChild(zoomIn)

        const zoomOut = document.createElement("button")
        zoomOut.className = "ui-zoom-out"
        zoomOut.innerHTML = "-"
        container.appendChild(zoomOut)
        parentElement.appendChild(container)

        const updateZoom = (value: number) => {
            map.setZoom(clamp(map.getZoom() + value, min, max));
        }
        zoomIn.addEventListener("click", () => {
            updateZoom(1)
        })

        zoomOut.addEventListener("click", () => {
            updateZoom(-1)
        })

        listenZoomInOut((value) => {
            updateZoom(value)
        })
    }
}