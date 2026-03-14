const keyBind = "space"
export function listenAccelerator() {
    const holder = {
        pressed: false
    }


    document.addEventListener("keydown", (e) => {
        const key = e.code.toLowerCase();
        if (key === keyBind) {
            holder.pressed = true;
            e.preventDefault()

        }
    });
    document.addEventListener("keyup", (e) => {
        const key = e.code.toLowerCase();
        if (key === keyBind) {
            holder.pressed = false
            e.preventDefault()
        }
    });

    return holder

}
