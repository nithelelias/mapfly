import { getCountries, type TCountry } from "./requestCountries"

export default function selectStartCountryView(callback: (country: TCountry) => void) {
    const container = document.createElement('div')
    const countries = getCountries();//.sort(() => Math.random() - 0.5).slice(0, 3).sort((a, b) => a.name.localeCompare(b.name))

    container.classList.add('ui-select-start-country')
    container.innerHTML = `
        <h2>Selecciona tu pais de inicio</h2>
        <div  class='ui-select-start-country-buttons'  >
            ${countries.map((country, idx) => `<button class="ui-btn  btn-country" value="${idx}">${country.name}</button>`).join('')}    
        </div>
     
        `
    document.body.appendChild(container)
    container.querySelectorAll('.btn-country').forEach((btn) => {
        btn.addEventListener('click', () => {
            const selectedCountry = countries[Number((btn as HTMLButtonElement).value)]
            callback(selectedCountry)
            container.remove()
        })
    })

}

