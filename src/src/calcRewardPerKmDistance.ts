import { EconomySystem } from "./economySystem";
import { GameState } from "./gameState";

export default function calcRwewardPerKmDistance(distance: number) {
    const minCost = calcMinCostFuelPerDistanceKm(distance)
    return Math.round(minCost * EconomySystem.rewardMultiplier)
}
export function calcFuelConsumptionPerKmDistance(distance: number) {
    return Math.round(distance * GameState.stats.consumptionPerKm)
}
export function calcMinCostFuelPerDistanceKm(distance: number) {
    const totalFuel = calcFuelConsumptionPerKmDistance(distance)
    return Math.round(totalFuel * EconomySystem.fuelPricePerLiter)
}