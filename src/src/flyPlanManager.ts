import type { TCity } from "./requestCountries";

export default class FlyPlanManager {
    position: number[];
    cities: TCity[];
    index = 0
    __onReachCity = () => { }
    constructor(cities: TCity[], position: number[]) {
        this.cities = cities
        this.position = position
    }
    getLastCity() {
        return this.cities[this.index - 1]
    }
    getCurrentCity() {
        return this.cities[this.index]
    }
    getCurrentNextCityDistance() {
        const nextCity = this.getCurrentCity()
        const distance = Math.sqrt(Math.pow(nextCity.latlng[0] - this.position[0], 2) + Math.pow(nextCity.latlng[1] - this.position[1], 2))
        return distance
    }
    goNextCity() {
        this.index++
    }
    validateNextCity() {
        if (this.getCurrentNextCityDistance() <= 0.005) {

            this.dispatchReachEvent()
        }
    }
    private dispatchReachEvent() {
        this.__onReachCity()
    }
    onReachCity(callback: () => void) {
        this.__onReachCity = callback
    }
    update(position: number[]) {
        this.position = position
        this.validateNextCity()
    }

}