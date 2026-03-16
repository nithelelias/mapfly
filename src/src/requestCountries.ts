const storeKey = 'world-data'
export type TCity = {
    name: string,
    latlng: number[]
    countryCode: string
}
export type TCountry = {
    "name": string,
    "latlng": number[],
    region: string,
    code: string,
    cities: TCity[]
}
const holder: {
    loaded: boolean,
    countries: TCountry[]
} = {
    loaded: false,
    countries: [],
}
async function requestCitiesJson() {
    const response = await fetch('./cities.json');
    const data = await response.json();
    return data
}
export default async function RequestCountries() {
    if (holder.loaded) return holder.countries
    const response = await fetch('./countries.json');
    const data = await response.json();
    holder.countries = data.map((d: any) => ({ ...d, cities: [] }))
    const cities = await requestCitiesJson()
    holder.countries = holder.countries.map((country) => {
        return { ...country, cities: cities[country.code] }
    })
    holder.loaded = true
    storeHolder()
    return holder.countries
}

export function getCountries() {
    return holder.countries
}
function getCountryByCode(code: string) {
    return holder.countries.find((country) => country.code === code)
}

export async function requestCities(countryCode: string) {
    const country = getCountryByCode(countryCode)
    if (!country) return []
    if (country.cities.length > 0) {
        return country.cities
    }
    return []
}

function storeHolder() {
    localStorage.setItem(storeKey, JSON.stringify({ countries: holder.countries }))
}
function restoreHolder() {
    const data = localStorage.getItem(storeKey)
    if (!data) return
    const restored: any = JSON.parse(data)
    holder.countries = restored.countries
    holder.loaded = true
}
restoreHolder()