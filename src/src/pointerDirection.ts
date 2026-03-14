export default class PointerDirection {

    targetLocation: number[]
    currentPosition: number[]
    parent: HTMLElement
    container: HTMLDivElement
    distanceElement: HTMLDivElement
    arrowElement: HTMLDivElement
    arrowCenterElement: HTMLDivElement

    constructor(parent: HTMLElement, targetLocation: number[], currentPosition: number[]) {
        this.parent = parent
        this.targetLocation = targetLocation
        this.currentPosition = currentPosition

        // Crear contenedor principal
        this.container = document.createElement('div')
        this.container.classList.add('ui-pointer-direction')

        // Elemento para la distancia
        this.distanceElement = document.createElement('div')

        // Elemento para la flecha
        this.arrowElement = document.createElement('div')
        this.arrowElement.innerHTML = '➤'
        this.arrowElement.classList.add('ui-pointer-arrow')

        // Elemento  flecha centro
        this.arrowCenterElement = document.createElement('div')
        this.arrowCenterElement.innerHTML = '<div class="ui-arrow-compass">➤</div>'
        this.arrowCenterElement.style.position = 'fixed'
        this.arrowCenterElement.style.top = '50%'
        this.arrowCenterElement.style.left = '50%'
        this.arrowCenterElement.style.transition = 'transform 0.1s ease-out'
        this.arrowCenterElement.style.display = 'inline-block'
        this.arrowCenterElement.style.zIndex = '1000'
        this.parent.appendChild(this.arrowCenterElement)



        // El caracter ➤ por defecto apunta a la derecha (0 grados)

        this.container.appendChild(this.distanceElement)
        this.container.appendChild(this.arrowElement)
        this.parent.appendChild(this.container)


        this.updateRender()
    }

    private updateRender() {
        // [lat, lng]
        const dLat = this.targetLocation[0] - this.currentPosition[0] // Y
        const dLng = this.targetLocation[1] - this.currentPosition[1] // X

        // Distancia euclidiana básica (1 grado aprox 111 km)
        const distance = Math.sqrt(dLat * dLat + dLng * dLng)
        const distanceKm = (distance * 111).toFixed(1)

        this.distanceElement.innerText = `${distanceKm} km`

        // Calcular ángulo para la brújula/flecha
        // dLat es positivo si el objetivo está al norte (arriba).
        // En CSS, los grados positivos giran hacia la derecha (abajo), 
        // así que invertimos dLat para que un objetivo al norte apunte hacia arriba.
        const angle = Math.atan2(-dLat, dLng) * (180 / Math.PI)

        this.arrowElement.style.transform = `rotate(${angle}deg)`
        this.arrowCenterElement.style.transform = `rotate(${angle}deg)`
    }

    update(targetLocation: number[], currentPosition: number[]) {
        this.targetLocation = targetLocation
        this.currentPosition = currentPosition
        this.updateRender()
    }
}