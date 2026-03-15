export default function awaitTime(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}