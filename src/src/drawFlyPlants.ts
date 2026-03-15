import * as L from 'leaflet'
import type { TCity } from "./requestCountries";
import { getDistanceKm } from './getDistances';
import calcRwewardPerKmDistance, { calcMinCostFuelPerDistanceKm } from './calcRewardPerKmDistance';
import formatMoney from './formatMoney';
const colors = ['#de4a88ff', '#4ade80ff', '#60a5faff', '#e74c3cff', '#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#2ecc71', '#95a5a6']
export default function drawFlyPlants(map: L.Map, plans: TCity[][], callback: (plan: TCity[], idx: number) => void) {
    const containerCards = document.createElement('div')
    containerCards.classList.add('ui-fly-plans-parent')
    document.body.appendChild(containerCards)
    let current = -1
    const cards = plans.map((plan) => {
        const cardsContainer = createInfoCard(plan)
        cardsContainer.style.display = "none"
        containerCards.appendChild(cardsContainer)
        return cardsContainer
    })
    const btn = document.createElement('button')
    btn.classList.add("ui-btn", "ui-btn-primary")
    btn.innerText = "Elegir"
    btn.id = "ui-choose-fly-plan-btn"
    btn.onclick = () => {
        if (current === -1) return
        const plan = plans[current]
        callback(plan, current)
        containerCards.remove()
        routes.forEach((route) => {
            route.remove()
        })
    }
    btn.style.display = "none"
    containerCards.appendChild(btn)

    const infoText = document.createElement("div")
    infoText.classList.add("ui-fly-plans-info")
    infoText.innerText = "Selecciona un plan"
    containerCards.appendChild(infoText)

    const routes = plans.map((plan, idx) => {
        const latlngs = plan.map((city) => {
            const pos = city.latlng as L.LatLngExpression
            return pos
        });

        const polyline = L.polyline(latlngs, {
            color: colors[idx], // success color
            /*  dashArray: '100, 20', // Dashed line */
            weight: 20,
            opacity: .4,
            lineCap: 'round'
        }).addTo(map);

        return polyline
    })
    routes.forEach((route, idx) => {
        route.on("mousedown", () => {
            btn.style.display = "block"
            infoText.style.display = "none"
            current = idx
            cards.forEach((card) => {
                card.style.display = "none"

            })
            cards[idx].style.display = "block"
        })
        route.on("mouseover", () => {

            routes.forEach(r => {
                r.setStyle({ opacity: 0.4 })   // apagar otras
            });

            route.setStyle({
                opacity: 1,
                weight: 20,
            });

        });

        route.on("mouseout", () => {

            routes.forEach(r => {
                r.setStyle({
                    opacity: 0.5,
                    weight: 10
                });
            });

        });

    });



}

function createInfoCard(cities: TCity[]) {
    const container = document.createElement('div')
    container.classList.add('ui-fly-plans')
    const maxIdx = cities.length - 1
    const card = document.createElement('div')
    card.classList.add('ui-fly-plan')
    card.innerHTML = `
           <div class="route-card">  
</div>
        `;

    const cardRoutes = card.querySelector(".route-card")!

    container.appendChild(card)
    const fullDistance = cities.reduce((acc, city, idx) => {
        const distance = idx > 0 ? getDistanceKm(city.latlng, cities[idx - 1].latlng) : 0
        return acc + distance
    }, 0)
    const fullReward = calcRwewardPerKmDistance(fullDistance)
    const initialInversion = calcMinCostFuelPerDistanceKm(fullDistance)
    cities.forEach((city, idx) => {
        if (idx >= maxIdx) return

        const nextCity = cities[idx + 1]

        cardRoutes.innerHTML += `
           
  <div class="  route-title">
    ✈ <span class="city" title="${city.name}">${city.name}</span>
    <span class="arrow">→</span>
    <span class="city" title="${nextCity.name}">${nextCity.name}</span>
  </div>
  <hr/> 
 
        `
    })

    cardRoutes.innerHTML += `
    <div class="route-resume">
        <b>Distancia Total:</b><span>🧭 ${fullDistance.toFixed(0)} km</span>
    </div>
    <div class="route-resume">
        <b>Inversion Combustible minima:</b><span>⛽ ${formatMoney(initialInversion)}</span>
    </div>
    <div class="route-resume">
        <b>Pago por adelantado:</b><span>💰 ${formatMoney(fullReward)}</span>
    </div> 
        `
    return container
}