import type { TCity } from "./requestCountries";

export default class CitiesRouteView {
    fromCity: TCity;
    toCity: TCity;
    parentElement: HTMLElement;
    container: HTMLDivElement;

    constructor(parentElement: HTMLElement, fromCity: TCity, toCity: TCity) {
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.parentElement = parentElement;

        // Crear la tarjetita que se mostrará arriba en el centro
        this.container = document.createElement('div');
        this.container.classList.add('ui-cities-route');

        this.parentElement.appendChild(this.container);

        this.updateRender();
    }
    private cityToName(city: TCity) {
        if (!city) return "--"
        return city.name + `(${city.countryCode})`
    }
    private updateRender() {
        // Un ícono de avión ✈️ o una flecha para separar las ciudades
        this.container.innerHTML = `
            <span class="ui-city-name-from">${this.cityToName(this.fromCity)}</span>
            <span class="ui-city-divider">✈️</span>
            <span class="ui-city-name-to">${this.cityToName(this.toCity)}</span>
        `;
    }

    update(fromCity: TCity, toCity: TCity) {
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.updateRender();
    }
}