
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
    const jsonCities = await requestCitiesJson()
    holder.countries = holder.countries.map((country) => {
        const cities = jsonCities[country.code]

        return { ...country, cities }
    })
    holder.loaded = true
    return holder.countries
}

export function getCountries() {
    return holder.countries
}


