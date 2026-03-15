import formatMoney from './formatMoney';
import { GameState } from './gameState';

export default class PlayerStatsUI {
    static instance: PlayerStatsUI | null = null;
    private container: HTMLDivElement;
    private moneyElement: HTMLSpanElement;
    private fuelElement: HTMLSpanElement;

    constructor(parentElement: HTMLElement) {
        PlayerStatsUI.instance = this
        this.container = document.createElement('div');
        this.container.classList.add('ui-player-stats');

        // Money section
        const moneyContainer = document.createElement('div');
        moneyContainer.classList.add('ui-stat-item');

        const moneyIcon = document.createElement('span');
        moneyIcon.innerText = '💰';
        this.moneyElement = document.createElement('span');
        this.moneyElement.classList.add('ui-stat-value', 'ui-money-value');

        moneyContainer.appendChild(moneyIcon);
        moneyContainer.appendChild(this.moneyElement);

        // Fuel section
        const fuelContainer = document.createElement('div');
        fuelContainer.classList.add('ui-stat-item');

        const fuelIcon = document.createElement('span');
        fuelIcon.innerText = '⛽';
        this.fuelElement = document.createElement('span');
        this.fuelElement.classList.add('ui-stat-value');

        fuelContainer.appendChild(fuelIcon);
        fuelContainer.appendChild(this.fuelElement);

        this.container.appendChild(moneyContainer);
        this.container.appendChild(fuelContainer);

        parentElement.appendChild(this.container);

        this.update();
    }
    static current() {
        if (!this.instance) {
            return new PlayerStatsUI(document.body)
        }
        return this.instance
    }
    update() {
        // Update texts
        this.moneyElement.innerText = formatMoney(GameState.money);
        this.fuelElement.innerText = `${Math.floor(GameState.fuel).toLocaleString()}L`;

        // Change text color based on fuel level
        if (GameState.fuel < 20) {
            this.fuelElement.style.color = 'var(--ui-accent-danger)';
        } else if (GameState.fuel < 100) {
            this.fuelElement.style.color = '#f59e0b'; // orange warning
        } else {
            this.fuelElement.style.color = 'var(--ui-text-primary)';
        }
    }
}
