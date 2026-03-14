import clamp from "./clamp"

const keyBinds = [{
    keys: ["w", "ArrowUp"],
    value: {
        x: 0, y: -1
    }
}, {
    keys: ["s", "ArrowDown"],
    value: {
        x: 0, y: 1
    }
}, {
    keys: ["a", "ArrowLeft"],
    value: {
        x: -1, y: 0
    }
}, {
    keys: ["d", "ArrowRight"],
    value: {
        x: 1, y: 0
    }
}]

export default function ListeningToKeyMoves(callback: (cursor: { x: number, y: number }) => void = () => { }) {
    const cursor = {
        x: 0, y: 0
    }

    const update = (vx: number, vy: number) => {
        cursor.x = clamp(cursor.x + vx, -1, 1)
        cursor.y = clamp(cursor.y + vy, -1, 1)
    }
    document.addEventListener("keydown", (e) => {

        keyBinds.forEach((bind) => {
            if (bind.keys.includes(e.key)) {
                update(bind.value.x, bind.value.y)
            }
        })
        callback(cursor)
    })
    document.addEventListener("keyup", (e) => {
        keyBinds.forEach((bind) => {
            if (bind.keys.includes(e.key)) {
                update(-bind.value.x, -bind.value.y)
            }
        })
        callback(cursor)
    })


    return {
        cursor
    }

}
