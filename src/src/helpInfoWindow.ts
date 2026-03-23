export default class HelpInfoWindow {
    container: HTMLElement
    constructor(element: HTMLElement) {

        this.container = document.createElement("div")
        this.container.className = "ui-help-info-window"
        element.appendChild(this.container)

        this.updateHelpByDevice()
        window.addEventListener("resize", () => {
            this.updateHelpByDevice()
        })
    }
    updateHelpByDevice() {
        if (window.innerWidth < 1024) {
            this.mobileHelp()
        } else {
            this.desktopHelp()
        }
    }
    mobileHelp() {
        this.container.innerHTML = `  
        `
    }
    desktopHelp() {
        this.container.innerHTML = `
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
    }
}