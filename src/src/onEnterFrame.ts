
export default function onEnterFrame(callback: () => void) {
    let active = true
    const loop = () => {
        if (!active) return
        callback()
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)

    return () => {
        active = false
    }
}
