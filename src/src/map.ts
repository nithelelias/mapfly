import * as L from 'leaflet'

import onEnterFrame from './onEnterFrame';
import ListeningToKeyMoves from './listeningKeyMoves';
import Airplane from './airplane';
import Velocimeter from './velocimeter';
import type { TCity } from './requestCountries';
import FlyPlanManager from './flyPlanManager';
import PointerDirection from './pointerDirection';
import CitiesRouteView from './citiesRouteView';
import NotificationsManager from './notificationsManager';
import { listenAccelerator } from './listenKeyAcceleration';
import ZoomControls from './zoomControls';
import RouteLine from './routeLine';
import PlayerStatsUI from './playerStatsUI';
import CityArrivalModal from './cityArrivalModal';

// Refactored systems
import AirplaneController from './airplaneController';
import { GameState } from './gameState';
import { getDistanceKm } from './getDistances';
import calcRwewardPerKmDistance from './calcRewardPerKmDistance';
import awaitTime from './awaitTime';
import ConfirmMessage from './confirmMessage';

const minZoom = 2
const maxZoom = 20

export function MapController(element: HTMLElement, map: L.Map) {
  let paused = true
  let waiting = true
  let completes = 0

  let onFlyPlanComplete: (props: { completed: boolean, lastCity: TCity }) => void = () => { }
  const center: number[] = [map.getCenter().lat, map.getCenter().lng]

  const nextCityMarker = L.circle(center as L.LatLngExpression, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(map);

  new ZoomControls(element, map, minZoom, maxZoom)
  const flyPlan = new FlyPlanManager(center)
  const airplane = new Airplane(center as L.LatLngExpression, map)
  const velocimeter = new Velocimeter(element, GameState.stats.maxSpeed)
  const locator = new PointerDirection(element, center, center)
  const panelCities = new CitiesRouteView(element, flyPlan.cities[0], flyPlan.cities[1])

  // Phase 1 integrations
  const routeLine = new RouteLine(map)
  const playerStatsUI = PlayerStatsUI.current()
  const cityModal = new CityArrivalModal(element)

  const airplaneCtrl = new AirplaneController()
  const accelerator = listenAccelerator()

  const moveCursor = ListeningToKeyMoves(() => { })

  routeLine.onMilestone(() => {
    GameState.fuel -= GameState.stats.consumptionPerKm;
    if (GameState.fuel < 0) GameState.fuel = 0;
  })

  flyPlan.onReachCity(() => {

    if (waiting) return
    if (airplaneCtrl.currentSpeed > 3) {
      notifiyUserMaxSpeed()
      return
    }
    map.removeLayer(nextCityMarker)
    completes++
    paused = true
    waiting = true

    // Disable map interaction
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();

    // Stop the airplane immediately
    airplaneCtrl.currentSpeed = 0;

    const starting = completes === 1
    // Show the new interaction modal instead of automatic timeout
    const nextCity = flyPlan.getNextCity()
    if (!nextCity) {
      onPlanCompleteEvent()
      return
    }
    PlanRewards.pay()
    cityModal.show(starting, flyPlan.getCurrentCity(), nextCity, () => {
      goForNextCity();
    });


  })

  const onPlanCompleteEvent = async () => {
    NotificationsManager.notify("Fin del vuelo", "Has completado el vuelo")
    routeLine.fitMap();
    await awaitTime(1000)
    await ConfirmMessage("Fin del vuelo", "Has completado el vuelo", ["Continuar"])
    routeLine.clear()
    onFlyPlanComplete({ completed: true, lastCity: flyPlan.getCurrentCity() })
  }

  const goForNextCity = () => {
    routeLine.clear()
    flyPlan.goNextCity()
    NotificationsManager.notify("Atención", "Ya puedes iniciar  vuelo a " + flyPlan.getCurrentCity().name)

    waiting = false
    paused = false

    // Re-enable map interaction
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();

    nextCityMarker.setLatLng(flyPlan.getCurrentCity().latlng as L.LatLngExpression)
    nextCityMarker.addTo(map)
    panelCities.update(flyPlan.getLastCity(), flyPlan.getCurrentCity())

  }

  const updateMap = () => {
    map.setView(center as L.LatLngExpression, map.getZoom(), { animate: false });
  }
  const validateIfCrash = () => {
    if (!waiting && airplaneCtrl.currentSpeed === 0 && GameState.fuel === 0) {
      paused = true
      waiting = true
      NotificationsManager.notify("Fin del vuelo", "Has chocado por falta de combustible")
      onFlyPlanComplete({ completed: false, lastCity: flyPlan.getCurrentCity() })
    }
  }
  onEnterFrame(() => {
    playerStatsUI.update()
    if (paused) return

    // Utilizamos la física extraída
    // @ts-ignore Si moveCursor tipado requiere cursor
    const cursorY = moveCursor.cursor ? moveCursor.cursor.y : 0;
    // @ts-ignore
    const cursorX = moveCursor.cursor ? moveCursor.cursor.x : 0;

    airplaneCtrl.updateInputs(accelerator.pressed, cursorX, cursorY)
    airplaneCtrl.updatePosition(center)

    airplane.update(center as L.LatLngExpression, airplaneCtrl.angle)
    updateMap()
    velocimeter.update(airplaneCtrl.currentSpeed)
    flyPlan.update(center)
    locator.update(flyPlan.getCurrentCity().latlng, center)
    routeLine.update(center)
    validateIfCrash()

  })

  return {
    pause: () => { paused = true },
    resume: () => { paused = false },
    setCenter: (_center: number[]) => {
      center[0] = _center[0]; center[1] = _center[1]; updateMap(); airplaneCtrl.updatePosition(center); airplane.update(center as L.LatLngExpression, airplaneCtrl.angle)
    },
    startPlan: (cities: TCity[]) => {
      PlanRewards.setPlanReward(cities)
      return new Promise<{ completed: boolean, lastCity: TCity }>((resolve) => {
        flyPlan.setCities(cities)
        paused = false
        setTimeout(() => {
          waiting = false
          map.setZoom(13)
        }, 1000)
        onFlyPlanComplete = (props: { completed: boolean, lastCity: TCity }) => {
          resolve(props);
        }
      })
    }

  }
}
export function createMap(element: HTMLElement, center: number[]) {
  var map = L.map(element, { keyboard: false, zoomControl: false }).setView(center as L.LatLngExpression, 0);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom,
    minZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map
}
function notifiyUserMaxSpeed() {
  NotificationsManager.notify("Max Speed", "You are going too fast")
}

class PlanRewards {
  static fullReward = 0
  static payments: number[] = []

  static setPlanReward(plan: TCity[]) {
    const fullDistance = plan.reduce((acc, city, idx) => {
      const distance = idx > 0 ? getDistanceKm(city.latlng, plan[idx - 1].latlng) : 0
      return acc + distance
    }, 0)
    const totalPayments = plan.length
    this.fullReward = calcRwewardPerKmDistance(fullDistance)
    this.payments = new Array(totalPayments).fill(0).map(() => this.fullReward / totalPayments)
  }
  static pay() {
    const payment = this.payments.shift()
    if (!payment) return
    GameState.money += payment
    NotificationsManager.notify("Pago por el vuelo", `Has recibido el pago de $${payment} para realizar el vuelo`)
  }
}