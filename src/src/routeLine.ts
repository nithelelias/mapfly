import * as L from 'leaflet';
import { getDistanceKm } from './getDistances';

export default class RouteLine {
    private polyline: L.Polyline;
    private map: L.Map;
    private recordedPoints: number[][] = [];
    private distanceThresholdKm = 1; // Guardar punto cada 2 km
    onMilestoneCallback: (distance: number) => void = () => { };

    constructor(map: L.Map) {
        this.map = map;
        this.polyline = L.polyline([], {
            color: '#de4a88ff', // success color
            dashArray: '100, 20', // Dashed line
            weight: 20,
            opacity: .8
        }).addTo(this.map);
    }


    onMilestone(callback: (distance: number) => void) {
        this.onMilestoneCallback = callback
    }
    update(currentPos: number[]) {
        // Clonamos la posición actual para no guardar referencias rotas
        const currentCoord = [...currentPos];

        if (this.recordedPoints.length === 0) {
            this.recordedPoints.push(currentCoord);
        } else {
            const lastPoint = this.recordedPoints[this.recordedPoints.length - 1];
            const dist = getDistanceKm(lastPoint, currentCoord)
            if (dist >= this.distanceThresholdKm) {
                this.onMilestoneCallback(dist)
                this.recordedPoints.push(currentCoord);
            }
        }

        // Pintamos todos los puntos guardados más la posición actual suelta en vivo
        const latLngs = [...this.recordedPoints, currentCoord].map(p => p as L.LatLngExpression);
        this.polyline.setLatLngs(latLngs);
    }
    getMyDistance() {
        let distance = 0;
        for (let i = 0; i < this.recordedPoints.length - 1; i++) {
            distance += getDistanceKm(this.recordedPoints[i], this.recordedPoints[i + 1]);
        }
        return distance;
    }
    fitMap() {
        this.map.fitBounds(this.polyline.getBounds(), { padding: [50, 50] });
    }
    // Para limpiar la ruta por si se necesita (ej. al cambiar de ciudad principal o inicio)
    clear() {
        this.recordedPoints = [];
        this.polyline.setLatLngs([]);
    }
}
