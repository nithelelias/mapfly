const storeKey = 'world-data'
export type TCity = {
    name: string,
    latlng: number[]
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
export default async function RequestCountries() {
    if (holder.loaded) return holder.countries
    const response = await fetch('./countries.json');
    const data = await response.json();
    holder.countries = data.map((d: any) => ({ ...d, cities: [] }))
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
    const response = await fetch(`http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&maxRows=20&username=nithelDev`);

    const data = await response.json();
    country.cities = data.geonames.map((city: any) => {
        return { name: city.name, latlng: [Number(city.lat), Number(city.lng)] }
    })
    storeHolder()
    return country.cities
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