export default function getDistances(p1: number[], p2: number[]) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
}

export function getDistanceKm(p1: number[], p2: number[]) {
    const dLat = p1[0] - p2[0];
    const dLng = p1[1] - p2[1];
    return Math.sqrt(dLat * dLat + dLng * dLng) * 111;
}