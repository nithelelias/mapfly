import { GameState } from './gameState';
import { EconomySystem } from './economySystem';
import type { TCity } from './requestCountries';
import NotificationsManager from './notificationsManager';
import { getDistanceKm } from './getDistances';
import formatMoney from './formatMoney';
import { calcFuelConsumptionPerKmDistance } from './calcRewardPerKmDistance';

export default class CityArrivalModal {
    private container: HTMLDivElement;
    private onDepartCallback: (() => void) | null = null;
    private nextCityFuelRequired: number = 0;

    constructor(parentElement: HTMLElement) {
        this.container = document.createElement('div');
        this.container.classList.add('ui-city-modal-backdrop');
        this.container.style.display = 'none';

        this.container.innerHTML = `
            <div class="ui-city-modal">
                <div id="modal-main-view">
                    <h1 class="ui-city-modal-title" id="modal-city-name">Ciudad</h1>
                    <h2 class="ui-city-modal-subtitle" id="modal-next-city"> next-city </h2>
                    
                    
                    <div class="ui-city-modal-shop">
                        <h3>Pista de Aterrizaje</h3>
                        <div class="shop-item" id="modal-fuel-amount-container">
                            <span>Combustible requerido para el siguiente vuelo: <strong id="modal-fuel-amount"></strong>L</span>
                            <br>
                            <button id="btn-open-fuel-shop" class="ui-btn ui-btn-primary" style="margin-top: 10px;">Comprar Combustible ⛽</button>
                        </div>
                        <div class="shop-item" style="margin-top: 15px;">
                            <span>Mejoras (Próximamente)</span>
                            <br>
                            <button class="ui-btn" disabled>Taller 🛠️</button>
                        </div>
                    </div>

                    <div class="ui-city-modal-actions">
                        <button id="btn-depart" class="ui-btn ui-btn-success">Despegar ✈️</button>
                    </div>
                </div>

                <div id="modal-fuel-shop-view" style="display: none;">
                    <h1 class="ui-city-modal-title">Surtidor de Combustible</h1>
                    <div style="background: var(--ui-bg-secondary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0;">Fondos disponibles: <strong class="text-success" id="shop-money-available"></strong></p>
                        <p style="margin: 0 0 10px 0;">Combustible actual: <strong class="text-info" id="shop-current-fuel"></strong>L</p>
                        <p style="margin: 0; font-size: 0.9em; color: var(--ui-text-muted);">Precio: $${EconomySystem.fuelPricePerLiter} / Litro</p>
                    </div>
                    
                    <div class="ui-fuel-purchase-controls" style="flex-direction: column; gap: 10px;">
                         <div class='ui-fuel-range-container'><input
                                type="range"
                                id="fuelrange"
                                name="fuelrange"
                                min="0"
                                max="100"
                                value="0"
                                step="10" />
                        <label for="fuelrange">Fuel ⛽</label></div>
                        <button class="ui-btn ui-btn-primary " id='btn-buy-fuel' style="width: 100%; margin: 0;">Poner 0L ($0 )</button>
                    </div>
                    
                    <div class="ui-city-modal-actions" style="margin-top: 20px;">
                        <button id="btn-back-to-main" class="ui-btn ui-btn-success" style="width: 100%;">Volver a la Pista</button>
                    </div>
                </div>
            </div>
        `;
        parentElement.appendChild(this.container);

        this.bindEvents();
    }

    private bindEvents() {
        const btnOpenFuelShop = this.container.querySelector('#btn-open-fuel-shop') as HTMLButtonElement;
        const btnDepart = this.container.querySelector('#btn-depart') as HTMLButtonElement;

        const mainView = this.container.querySelector('#modal-main-view') as HTMLDivElement;
        const shopView = this.container.querySelector('#modal-fuel-shop-view') as HTMLDivElement;
        const btnBack = this.container.querySelector('#btn-back-to-main') as HTMLButtonElement;

        const btnBuyFuel = this.container.querySelector('#btn-buy-fuel') as HTMLButtonElement;
        const fuelrange = this.container.querySelector('#fuelrange') as HTMLInputElement;

        // Navigation
        btnOpenFuelShop.addEventListener('click', () => {
            mainView.style.display = 'none';
            shopView.style.display = 'block';
            this.updateShopUI();
        });

        btnBack.addEventListener('click', () => {
            shopView.style.display = 'none';
            mainView.style.display = 'block';
            this.updateMainUI();
        });

        // Depart
        btnDepart.addEventListener('click', () => {
            if (this.onDepartCallback) {
                this.onDepartCallback();
            }
            this.hide();
        });

        // Shop Interactions
        fuelrange.addEventListener('input', () => {
            btnBuyFuel.innerText = `Poner ${fuelrange.value}L ($${Number(fuelrange.value) * EconomySystem.fuelPricePerLiter})`;
        });
        btnBuyFuel.addEventListener('click', () => {

            const amount = Number(fuelrange.value);

            const cost = amount * EconomySystem.fuelPricePerLiter;
            if (GameState.money >= cost) {
                GameState.money -= cost;
                GameState.fuel += amount;
                const unbind = NotificationsManager.notify("Compra exitosa", `Compraste ${amount}L`);
                this.updateShopUI();
                setTimeout(() => {
                    unbind();
                }, 2000);
            } else {
                const unbind = NotificationsManager.notify("Fondos insuficientes", `Necesitas $${cost} para comprar ${amount}L`);
                setTimeout(() => {
                    unbind();
                }, 2000);
            }
        });

    }

    private updateMainUI() {
        const fuelAmountSpan = this.container.querySelector('#modal-fuel-amount') as HTMLElement;
        const fuelAmountContainer = this.container.querySelector('#modal-fuel-amount-container') as HTMLElement;

        fuelAmountSpan.innerText = Math.floor(this.nextCityFuelRequired).toLocaleString();
        const currentFuel = GameState.fuel
        if (currentFuel < this.nextCityFuelRequired) {
            NotificationsManager.notify("Combustible insuficiente", `Necesitas ${this.nextCityFuelRequired}L para llegar a la próxima ciudad`, "error")

            fuelAmountContainer.classList.add('text-danger')
        } else {
            fuelAmountContainer.classList.remove('text-danger')
        }
    }

    private updateShopUI() {
        const moneyAvailable = this.container.querySelector('#shop-money-available') as HTMLElement;
        const currentFuel = this.container.querySelector('#shop-current-fuel') as HTMLElement;
        const fuelrange = this.container.querySelector('#fuelrange') as HTMLInputElement;
        const maxPosibleFuel = GameState.money / EconomySystem.fuelPricePerLiter;
        fuelrange.max = maxPosibleFuel.toString();
        moneyAvailable.innerText = formatMoney(GameState.money)
        currentFuel.innerText = Math.floor(GameState.fuel).toLocaleString();
    }

    public show(starting: boolean, city: TCity, nextCity: TCity | null, onDepart: () => void) {
        this.onDepartCallback = onDepart;
        this.nextCityFuelRequired = 100
        if (nextCity) {
            const distance = getDistanceKm(city.latlng, nextCity.latlng)
            this.nextCityFuelRequired = calcFuelConsumptionPerKmDistance(distance)

        }


        // Reset views
        const mainView = this.container.querySelector('#modal-main-view') as HTMLDivElement;
        const shopView = this.container.querySelector('#modal-fuel-shop-view') as HTMLDivElement;
        mainView.style.display = 'block';
        shopView.style.display = 'none';

        // Actualizar textos
        const cityNameEl = this.container.querySelector('#modal-city-name') as HTMLHeadingElement;
        const nextCityNameEl = this.container.querySelector('#modal-next-city') as HTMLHeadingElement;

        cityNameEl.innerText = starting ? `Bienvenido a ${city.name}` : `Llegaste a ${city.name}`;
        if (nextCity) {
            nextCityNameEl.innerText = nextCity ? `Próxima ciudad: ${nextCity.name}` : `Fin del vuelo`;
        } else {
            nextCityNameEl.innerHTML = "plan de vuelo completado"
        }


        this.updateMainUI();
        this.container.style.display = 'flex';
    }

    public hide() {
        this.container.style.display = 'none';
        this.onDepartCallback = null;
    }
}
