export default function ConfirmMessage(title: string, message: string, options: string[]) {
    return new Promise<string>((resolve) => {
        const onOptionSelected = (option: string) => {
            resolve(option)
        }
        const container = document.createElement('div')
        container.innerHTML = ` <dialog id="confirm-dialog">
        <div class="ui-confirm-message">
            <div class="ui-confirm-message-content">
                <div class="ui-confirm-message-content-title">
                    <h1>${title}</h1>
                </div>
                <div class="ui-confirm-message-content-body">
                    <p>${message}</p>
                </div>
                <div class="confirm-message-content-footer">
                    ${options.map((option) => `<button class="ui-btn">${option}</button>`).join('')}
                </div>
            </div>
        </div>
        </dialog>
        `
        const dialog = container.querySelector("#confirm-dialog")! as HTMLDialogElement;
        const buttons = container.querySelectorAll('.confirm-message-content-footer button')
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                dialog.close()
                container.remove()
                onOptionSelected(button.textContent || '')
            })
        })
        document.body.appendChild(container)
        setTimeout(() => {
            dialog?.showModal()
        }, 100)
    });
}