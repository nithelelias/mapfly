export default class Velocimeter {
    private container: HTMLElement;
    private maxVelocity: number;
    private needleElement: HTMLElement;
    private textElement: HTMLElement;

    constructor(parent: HTMLElement, maxVelocity: number) {
        this.maxVelocity = maxVelocity;

        // Contenedor principal
        this.container = document.createElement('div');
        this.container.classList.add('ui-velocimeter');

        // Punto central
        const dot = document.createElement('div');
        dot.classList.add('ui-velocimeter-dot');

        // Aguja (needle)
        this.needleElement = document.createElement('div');
        this.needleElement.classList.add('ui-velocimeter-needle');
        this.needleElement.style.transform = 'rotate(-90deg)'; // Empieza en el borde izquierdo (-90°)
        this.needleElement.style.transition = 'transform 0.1s linear'; // Cambia rápido si lo actualizas constantemente

        // Texto de velocidad
        this.textElement = document.createElement('div');
        this.textElement.classList.add('ui-velocimeter-text');
        this.textElement.innerText = '0km';

        // Anillo / Dial exterior (Arco de 270 grados usando bordes)
        const ticksContainer = document.createElement('div');
        ticksContainer.classList.add('ui-velocimeter-ticks');

        // Armar la jerarquía visual
        this.container.appendChild(ticksContainer);
        this.container.appendChild(this.needleElement);
        this.container.appendChild(dot);
        this.container.appendChild(this.textElement);

        // Añadirlo al padre (como body o el element del juego)
        parent.appendChild(this.container);
    }

    update(velocity: number) {
        // Prevenir números negativos / fuera de los límites
        const v = Math.max(0, Math.min(this.maxVelocity, velocity));

        // El arco total es de 270 grados (empieza en -135 y termina en +135 guiado por CSS transform top)
        const range = 270;
        const percentage = v / this.maxVelocity;
        const angle = -90 + (percentage * range);

        this.needleElement.style.transform = `rotate(${angle}deg)`;

        // Mostrar valor relativo a porcentaje (o bien podrías mostrar el valor absoluto interpolado)
        this.textElement.innerText = Math.round(percentage * 100).toString();
    }
}