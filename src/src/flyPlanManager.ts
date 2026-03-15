import getDistances from "./getDistances";
import type { TCity } from "./requestCountries";

export default class FlyPlanManager {
    position: number[];
    cities: TCity[] = [];
    index = 0
    __onReachCity = () => { }
    constructor(position: number[]) {
        this.position = position
    }
    setCities(cities: TCity[]) {
        this.cities = cities
        this.index = 0
    }
    getLastCity() {
        return this.cities[this.index - 1]
    }
    getCurrentCity() {
        return this.cities[this.index]
    }
    getNextCity() {
        return this.index < this.cities.length - 1 ? this.cities[this.index + 1] : null
    }
    getCurrentNextCityDistance() {
        const nextCity = this.getCurrentCity()
        const distance = getDistances(nextCity.latlng, this.position)  //Math.sqrt(Math.pow(nextCity.latlng[0] - this.position[0], 2) + Math.pow(nextCity.latlng[1] - this.position[1], 2))
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