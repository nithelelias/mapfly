import * as L from 'leaflet'
import imgAirplane1 from '../assets/airplane1.png'

export default class Airplane {
    marker: L.Marker<any>;
    dirty = false
    defaultAngle: number = 90
    currentAngle: number = -1
    markerElement: HTMLElement;

    constructor(center: L.LatLngExpression, map: L.Map) {
        const airplaneIcon = L.icon({
            iconUrl: imgAirplane1,

        })
        this.marker = L.marker(center, { icon: airplaneIcon });
        this.marker.addTo(map);

        this.markerElement = this.marker.getElement()!
        this.markerElement.classList.add('ui-airplane')
    }
    private updateAngle(angle: number) {
        if (angle === this.currentAngle) return
        this.currentAngle = angle
        this.dirty = true

    }
    private updateSprite() {
        if (!this.dirty) return
        this.markerElement.style.transform += ` rotate(${this.currentAngle + this.defaultAngle}deg)`;
    }
    update(center: L.LatLngExpression, angle: number) {
        this.marker.setLatLng(center);
        this.updateAngle(angle)
        this.updateSprite()
    }
}