export default class HelpInfoWindow {
    constructor(element: HTMLElement) {

        const container = document.createElement("div")
        container.className = "ui-help-info-window"
        container.innerHTML = `
        <div class="ui-help-info-window-content">
             <span>Q = zoomIn</span> |
             <span>E = zoomOut</span> |
             <span>SPACEBAR = accelerate</span> |
             <span>W = front</span> |
             <span>S = brake/slowdown</span> |
             <span>A = left</span> |
             <span>D = right</span> 
        </div>
        `
        element.appendChild(container)
    }
}