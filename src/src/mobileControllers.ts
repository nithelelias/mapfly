import clamp from "./clamp";
export default class mobileController {

    thumb: SVGCircleElement;
    dragging: boolean;
    container: HTMLDivElement;
    radius = 50
    svgSize = 180
    radiusThreshold = this.radius * 1.2
    thumbLimits = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
    }
    thumbPos = {
        x: 0,
        y: 0
    }
    center = {
        x: (this.svgSize / 2),
        y: (this.svgSize / 2)
    }
    onMoveCallback: (x: number, y: number) => void = () => { };
    onTouchingCallback: (dragging: boolean) => void = () => { };
    constructor() {

        const container = document.createElement('div')
        container.classList.add('ui-mobile-controller')
        document.body.appendChild(container)
        this.thumbLimits = {
            minX: this.svgSize / 2 - this.radius,
            maxX: this.svgSize / 2 + this.radius,
            minY: this.svgSize / 2 - this.radius,
            maxY: this.svgSize / 2 + this.radius
        }
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue('--ui-accent-danger');
        console.log(color)
        // DIBUJAR ARO EXTERIO
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", this.svgSize.toString());
        svg.setAttribute("height", this.svgSize.toString());
        container.appendChild(svg);
        this.container = container
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", (this.svgSize / 2).toString());
        circle.setAttribute("cy", (this.svgSize / 2).toString());
        circle.setAttribute("r", this.radius.toString());
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-width", "2");
        svg.appendChild(circle);



        const thumb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        thumb.setAttribute("cx", (this.svgSize / 2).toString());
        thumb.setAttribute("cy", (this.svgSize / 2).toString());
        thumb.setAttribute("r", (this.radius / 2).toString());
        thumb.setAttribute("fill", color);
        svg.appendChild(thumb);

        this.thumb = thumb
        this.dragging = false

        container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.dragging = true
        });
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.dragging = true
        });
        container.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.dragging = false

            this.move(this.center.x, this.center.y)
        });
        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.dragging = false
            this.move(this.center.x, this.center.y)
        });
        container.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!this.dragging) return
            const { x, y } = this.calcXY(e.clientX, e.clientY)
            this.move(x, y)
        });
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.dragging) return
            const touch = e.touches[0];
            const { x, y } = this.calcXY(touch.clientX, touch.clientY)
            this.move(x, y)
        });

        this.move(this.center.x, this.center.y)

    }

    private calcXY(clientX: number, clientY: number) {
        const x = clientX - this.container.getBoundingClientRect().left;
        const y = clientY - this.container.getBoundingClientRect().top;

        return { x: Math.max(this.thumbLimits.minX, Math.min(this.thumbLimits.maxX, x)), y: Math.max(this.thumbLimits.minY, Math.min(this.thumbLimits.maxY, y)) }
    }
    private move(x: number, y: number) {

        this.thumb.setAttribute("cx", x.toString());
        this.thumb.setAttribute("cy", y.toString());
        this.thumbPos.x = x
        this.thumbPos.y = y

        // CLAMP -1,1
        const relX = (x - this.center.x)
        const relY = (y - this.center.y)
        const clampX = clamp(Math.round(relX / (this.radiusThreshold)), -1, 1)
        const clampY = clamp(Math.round(relY / this.radiusThreshold), -1, 1)

        this.onMoveCallback(clampX, clampY)



        const loop = () => {

            this.onTouchingCallback(this.dragging)

            requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
    }
    onMove(callback: (x: number, y: number) => void) {
        this.onMoveCallback = callback
    }
    onTouching(callback: (dragging: boolean) => void) {
        this.onTouchingCallback = callback
    }
    show() {
        this.container.style.display = 'flex'
    }
    hide() {
        this.container.style.display = 'none'
    }

    setAirplaneImage(airplaneImg: string) {
        const div = document.createElement("div")
        div.classList.add("ui-mobile-controller-airplane")
        div.style.backgroundImage = `url(${airplaneImg})`
        this.container.appendChild(div)
    }

}