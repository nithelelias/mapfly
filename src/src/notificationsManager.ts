export default class NotificationsManager {

    static container: HTMLDivElement | null = null;

    private static getContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.classList.add('ui-notifications-container');
            document.body.appendChild(this.container);
        }
        return this.container;
    }

    static notify(title: string, message: string, type: 'info' | 'error' | 'success' = 'info') {
        const container = this.getContainer();

        const notif = document.createElement('div');
        notif.classList.add('ui-notification');
        notif.classList.add(`ui-notification-${type}`);

        const titleEl = document.createElement('div');
        titleEl.innerText = title;
        titleEl.classList.add('ui-notification-title');

        const msgEl = document.createElement('div');
        msgEl.innerText = message;
        msgEl.classList.add('ui-notification-message');

        notif.appendChild(titleEl);
        notif.appendChild(msgEl);

        // Al usar flex-direction: column y estar anclado abajo (bottom: 20px),
        // anexar los elementos al final (appendChild) significa que el nuevo aparece abajo
        // y empuja a los anteriores hacia arriba automáticamente.
        container.appendChild(notif);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notif.style.opacity = '1';
                notif.style.transform = 'translateY(0)';
            });
        });

        // Quitar la notificación únicamente al darle click
        const removeFn = () => {
            // Prevenir doble ejecución si ya se está eliminando
            if (notif.style.pointerEvents === 'none') return;

            notif.style.opacity = '0';
            notif.style.transform = 'translateY(20px)'; // Animamos su salida hacia abajo
            notif.style.pointerEvents = 'none'; // Evitar doble click mientras se anima
            notif.addEventListener('transitionend', () => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            });
        };

        notif.addEventListener('click', removeFn);

        // Retornar la función para que quien la lanza pueda limpiarla también
        return removeFn;
    }
}