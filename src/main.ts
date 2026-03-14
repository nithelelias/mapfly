import './style.css'
import { MapController } from './src/map.ts'
import RequestCountries, { requestCities, getCountries, type TCity, type TCountry } from './src/requestCountries.ts'
import { MOCK_FLYPLAN } from './src/mocks.ts'
const appElement = document.querySelector<HTMLDivElement>('#app')!
appElement.innerHTML = `
<div id="map"></div>
`
const mapElement = appElement.querySelector("#map")!


function startFlyPlan(cities: TCity[]) {
  MapController(mapElement as HTMLElement, cities)
}


function getRandomCountries(total: number) {
  const countries = getCountries()
  if (countries.length === 0) return [];
  return [...countries].sort(() => Math.random() - 0.5).slice(0, total);
}
function random(min: number, max: number) {
  return Math.floor(Math.random() * max) + min
}
async function getFlyPlan() {

  return MOCK_FLYPLAN
  const totalCountries = random(1, 3);
  const totalCitiesToVisit = random(2, 4);
  const countries = getRandomCountries(totalCountries)
  const citiesToVisit: TCity[] = [];
  if (countries.length === 0) return { countries: [], citiesToVisit: [] };

  const memoryCities: {
    [key: string]: TCity[]
  } = {}
  const getRandomCity = async (country: TCountry) => {
    if (memoryCities[country.code]) {
      return rndItem(memoryCities[country.code])
    }
    const cities = await requestCities(country.code);
    memoryCities[country.code] = cities
    return rndItem(memoryCities[country.code]);
  }
  const rndItem = <T>(t: T[]) => t.sort(() => Math.random() - 0.5).slice(0, 1)[0];
  // Encontrar un país que sí tenga ciudades en la API
  let remainCitiesToVisit = totalCitiesToVisit + 0
  while (remainCitiesToVisit > 0) {
    const country = rndItem(countries);
    const city = await getRandomCity(country)
    remainCitiesToVisit--
    citiesToVisit.push(city)
  }


  return { countries, citiesToVisit }
}

async function start() {
  const plan = await getFlyPlan()
  console.log("Plan de vuelo:", plan);
  startFlyPlan(plan.citiesToVisit)
}
RequestCountries().then(() => {
  start()
}) 