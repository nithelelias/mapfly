export default function mapSpeedToKmH(speed: number) {
    const kmPerDegree = 111;
    const kmPerSecond = speed * kmPerDegree;
    const kmPerHour = kmPerSecond * 3600;
    return kmPerHour;
}
