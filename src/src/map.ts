import * as L from 'leaflet'

import onEnterFrame from './onEnterFrame';
import ListeningToKeyMoves from './listeningKeyMoves';
import Airplane from './airplane';
import clamp from './clamp';
import Velocimeter from './velocimeter';
import type { TCity } from './requestCountries';
import FlyPlanManager from './flyPlanManager';
import PointerDirection from './pointerDirection';
import CitiesRouteView from './citiesRouteView';
import NotificationsManager from './notificationsManager';
import { listenAccelerator } from './listenKeyAcceleration';
import ZoomControls from './zoomControls';
const minZoom = 5
const maxZoom = 20

export function MapController(element: HTMLElement, citiesPath: TCity[]) {
  const maxMoveSpeed = 0.0005
  const acceleration = .0000001
  const accelerationFriction = .9998
  const angularVelocityFriction = 0.998
  const angularSpeed = .10
  const direction = { angle: 0 }
  let currentSpeed = 0
  let paused = false

  let angularVelocity = 0
  let completes = 0
  let waiting = false

  const center: number[] = citiesPath[0].latlng
  var map = L.map(element, { keyboard: false, zoomControl: false }).setView(center as L.LatLngExpression, 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom,
    minZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const nextCityMarker = L.circle(citiesPath[0].latlng as L.LatLngExpression, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(map);
  const zoomControls = new ZoomControls(element, map, minZoom, maxZoom)
  const flyPlan = new FlyPlanManager(citiesPath.slice(0, citiesPath.length), center)
  const airplane = new Airplane(center as L.LatLngExpression, map)
  const velocimeter = new Velocimeter(element, maxMoveSpeed)
  const locator = new PointerDirection(element, flyPlan.getCurrentCity().latlng, center)
  const panelCities = new CitiesRouteView(element, flyPlan.cities[0], flyPlan.cities[1])
  const accelerator = listenAccelerator()

  const moveCursor = ListeningToKeyMoves((cursor) => onCursorMove(cursor))

  flyPlan.onReachCity(() => {
    if (waiting) return
    if (currentSpeed > 3) {
      notifiyUserMaxSpeed()
      return
    }
    map.removeLayer(nextCityMarker)
    completes++
    paused = true
    waiting = true
    if (completes > 1) {
      NotificationsManager.notify("Atención", "Hemos llegado a la ciudad de " + flyPlan.getCurrentCity().name)
    }
    setTimeout(() => {
      currentSpeed = 0
    }, 1000)
    setTimeout(() => {
      goForNextCity()
    }, 3000)
  })
  const goForNextCity = () => {
    flyPlan.goNextCity()
    const removeNotifyFn = NotificationsManager.notify("Atención", "Iniciando  vuelo a " + flyPlan.getCurrentCity().name + " en 3 segundos")
    setTimeout(() => {
      waiting = false
      paused = false
      nextCityMarker.setLatLng(flyPlan.getCurrentCity().latlng as L.LatLngExpression)
      nextCityMarker.addTo(map)
      panelCities.update(flyPlan.getLastCity(), flyPlan.getCurrentCity())
      removeNotifyFn()
    }, 3000)
  }
  const updateMap = () => {
    map.setView(center as L.LatLngExpression, map.getZoom(), { animate: false });
  }


  const onCursorMove = (cursor: { x: number, y: number }) => {

    if (cursor.x > 0) {
      angularVelocity = angularSpeed
    } else if (cursor.x < 0) {
      angularVelocity = -angularSpeed
    }
    if (cursor.y !== 0) {
      angularVelocity = 0
    }


  }
  const validateAcceleration = () => {
    if (accelerator.pressed) {
      currentSpeed = clamp(currentSpeed + acceleration, 0, maxMoveSpeed)
    } else if (currentSpeed > 0) {
      currentSpeed = clamp(currentSpeed * accelerationFriction - (moveCursor.cursor.y > 0 ? acceleration : 0), 0, maxMoveSpeed)
    } else {
      currentSpeed = 0
    }
  }

  onEnterFrame(() => {
    if (paused) return


    validateAcceleration()

    angularVelocity *= angularVelocityFriction
    direction.angle = direction.angle + angularVelocity

    const angle = direction.angle * Math.PI / 180

    center[1] += Math.cos(angle) * currentSpeed
    center[0] -= Math.sin(angle) * currentSpeed

    airplane.update(center as L.LatLngExpression, direction.angle)
    updateMap()
    velocimeter.update(currentSpeed)
    flyPlan.update(center)
    locator.update(flyPlan.getCurrentCity().latlng, center)
  })


}




function notifiyUserMaxSpeed() {

  NotificationsManager.notify("Max Speed", "You are going too fast")

}