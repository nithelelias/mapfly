import './style.css'
import { createMap, MapController } from './src/map.ts'
import RequestCountries, { getCountries, type TCity, type TCountry } from './src/requestCountries.ts'

import PlayerStatsUI from './src/playerStatsUI.ts'
import selectStartCountryView from './src/selectStartCountry.ts'
import drawFlyPlants from './src/drawFlyPlants.ts'

import CloudLayer from './src/cloudLayer.ts'
import SoundManager from './src/soundManager.ts'
import random from './src/random.ts'
const appElement = document.querySelector<HTMLDivElement>('#app')!
appElement.innerHTML = `
<div id="map"></div>
<div id="clouds"></div>
`
const mapElement = appElement.querySelector("#map")! as HTMLElement
new PlayerStatsUI(appElement)
const map = createMap(mapElement, [0, random(-100, 100)])
const mapController = MapController(mapElement, map)
const clouds = new CloudLayer('#clouds', {
  direction: random(0, 360),   // grados: 0=norte, 90=este, 180=sur, 270=oeste
  speed: random(10, 200),       // px/segundo
  count: random(1, 100),        // cantidad de nubes
  opacity: 1,   // opacidad global 0-1
});
const sfx = new SoundManager(0.8); // master en 0.8



clouds.start();
setInterval(() => {
  clouds.getContainer().style.opacity = (random(1, 10) / 10).toString()
}, 5000)


function rndItem<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5).slice(0, 1)[0] };

const getRandomCity = async (country: TCountry) => {
  return rndItem(country.cities);
}
async function getFlyPlan(startCity: TCity, countries: TCountry[], totalCitiesToVisit: number) {

  /* return MOCK_FLYPLAN */

  const citiesToVisit: TCity[] = [startCity];
  // Encontrar un país que sí tenga ciudades en la API
  const memoryCities: {
    [key: string]: TCity[]
  } = {}
  let remainCitiesToVisit = totalCitiesToVisit + 0
  while (remainCitiesToVisit > 0) {
    const country = rndItem(countries);
    if (!memoryCities[country.code]) {
      memoryCities[country.code] = country.cities
    }
    const rndIdx = random(0, memoryCities[country.code].length - 1)
    const city = memoryCities[country.code].splice(rndIdx, 1)[0]
    // validate city is not in citiesToVisit
    if (citiesToVisit.some((c) => c.name === city.name)) {
      continue
    }
    citiesToVisit.push(city)
    remainCitiesToVisit--

  }


  return citiesToVisit
}

async function getSureFlyPlan(startCity: TCity, countries: TCountry[], totalCitiesToVisit: number) {
  while (true) {
    const plan = await getFlyPlan(startCity, countries, totalCitiesToVisit)
    if (plan.length > 1) {
      return plan
    }
  }


}

async function showFlyPlansAvaible(startCountry: TCountry, startCity: TCity) {

  map.setView(startCity.latlng as L.LatLngExpression, 9);
  const countryPlans = [
    [startCountry], [startCountry, rndItem(getCountries())], [startCountry, rndItem(getCountries()), rndItem(getCountries())],
  ]
  const plan1 = await getSureFlyPlan(startCity, countryPlans[0], 1)
  const plan2 = await getSureFlyPlan(startCity, countryPlans[1], 2)
  const plan3 = await getSureFlyPlan(startCity, countryPlans[2], 3)

  return new Promise<[TCity[], TCountry[]]>((resolve) => {
    drawFlyPlants(map, [plan1, plan2, plan3], (plan: TCity[], idx: number) => {
      resolve([plan, countryPlans[idx]])
    })

  })

}
async function selectStarCountry() {
  return new Promise<TCountry>((resolve) => {
    selectStartCountryView((country: TCountry) => {

      return resolve(country)
    })
  })
}

function obtainCityOfCountry(countryCode: string) {
  return getCountries().find((country) => country.code === countryCode)
}
async function runFlyPlanSelection(country: TCountry, startCity: TCity) {

  const [plan, countries] = await showFlyPlansAvaible(country, startCity)

  const { completed, lastCity } = await mapController.startPlan(plan)
  if (completed) {
    runFlyPlanSelection(obtainCityOfCountry(lastCity.countryCode) || countries.pop()!, lastCity)
  }

}

async function start() {
  const country = await selectStarCountry()
  const startCity = await getRandomCity(country)
  mapController.setCenter(startCity.latlng)
  runFlyPlanSelection(country, startCity)

}
async function preloadSounds() {
  await sfx.load('sfx-chime', '/sfx-airplane-chime.mp3');
  await sfx.load('sfx-airplane', '/sfx-airplane-sound.mp3');
  await sfx.load('sfx-airplane2', '/sfx-airplane-sound2.mp3');


}

RequestCountries().then(() => {
  return preloadSounds()

}).then(() => {
  start()
}) 