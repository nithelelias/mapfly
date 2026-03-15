interface CloudLayerOptions {
    direction?: number;
    speed?: number;
    count?: number;
    opacity?: number;
}

interface Puff {
    x: number;
    y: number;
    r: number;
}

interface Cloud {
    puffs: Puff[];
    w: number;
    h: number;
    ox: number;
    oy: number;
    x: number;
    y: number;
    scale: number;
    baseOpacity: number;
    speed: number;
}

interface Bounds {
    x: number;
    y: number;
    w: number;
    h: number;
}

export default class CloudLayer {
    private container: HTMLElement;
    private direction: number;
    private speed: number;
    private count: number;
    private opacity: number;
    private clouds: Cloud[] = [];
    private running: boolean = false;
    private lastTime: number = 0;
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private w: number = 0;
    private h: number = 0;
    private raf: number = 0;
    private resizeObserver!: ResizeObserver;

    constructor(
        container: string | HTMLElement,
        { direction = 90, speed = 30, count = 6, opacity = 0.85 }: CloudLayerOptions = {}
    ) {
        this.container =
            typeof container === 'string'
                ? (document.querySelector(container) as HTMLElement)
                : container;
        this.direction = direction;
        this.speed = speed;
        this.count = count;
        this.opacity = opacity;

        this._setup();
        this._spawn();
        this.start();
    }

    // ── API pública ──────────────────────────────────────────

    setDirection(deg: number): void { this.direction = deg; }
    setSpeed(px: number): void { this.speed = px; }
    setOpacity(v: number) { this.opacity = v; }
    setCount(count: number) { this.count = count; this._spawn(); }
    getContainer() {
        return this.container
    }
    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.raf = requestAnimationFrame(t => this._loop(t));
    }

    stop(): void {
        this.running = false;
        cancelAnimationFrame(this.raf);
    }

    destroy(): void {
        this.stop();
        this.resizeObserver.disconnect();
        this.canvas.remove();
    }

    // ── Setup ────────────────────────────────────────────────

    private _setup(): void {
        const pos = getComputedStyle(this.container).position;
        if (pos === 'static') this.container.style.position = 'relative';

        this.canvas = document.createElement('canvas');
        Object.assign(this.canvas.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '10',
        });
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d')!;
        this._resize();

        this.resizeObserver = new ResizeObserver(() => this._resize());
        this.resizeObserver.observe(this.container);
    }

    private _resize(): void {
        this.w = this.canvas.width = this.container.offsetWidth;
        this.h = this.canvas.height = this.container.offsetHeight;
        this.clouds.forEach(c => this._resetCloud(c));
    }

    // ── Nubes ────────────────────────────────────────────────

    private _spawn(): void {
        for (let i = 0; i < this.count; i++) {
            const c = this._createCloud();
            c.x = Math.random() * (this.w + c.w) - c.w / 2;
            c.y = Math.random() * this.h * 0.65;
            this.clouds.push(c);
        }
    }

    private _createCloud(): Cloud {
        const scale = 0.4 + Math.random() * 1.0;
        const puffs = this._generatePuffs(scale);
        const bounds = this._bounds(puffs);
        return {
            puffs,
            w: bounds.w,
            h: bounds.h,
            ox: bounds.x,
            oy: bounds.y,
            x: 0,
            y: 0,
            scale,
            baseOpacity: 0.55 + Math.random() * 0.35,
            speed: 0.7 + Math.random() * 0.6,
        };
    }

    private _generatePuffs(scale: number): Puff[] {
        const base = 60 * scale;
        const count = 5 + Math.floor(Math.random() * 5);
        const puffs: Puff[] = [];

        puffs.push({ x: 0, y: 0, r: base });

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 1.4 - Math.PI * 0.2;
            const dist = base * (0.4 + Math.random() * 0.7);
            const r = base * (0.35 + Math.random() * 0.55);
            puffs.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist * 0.5 - base * 0.1,
                r,
            });
        }

        for (let i = 0; i < 3; i++) {
            puffs.push({
                x: (Math.random() - 0.5) * base * 1.4,
                y: -base * (0.3 + Math.random() * 0.4),
                r: base * (0.25 + Math.random() * 0.35),
            });
        }

        return puffs;
    }

    private _bounds(puffs: Puff[]): Bounds {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        puffs.forEach(p => {
            minX = Math.min(minX, p.x - p.r);
            minY = Math.min(minY, p.y - p.r);
            maxX = Math.max(maxX, p.x + p.r);
            maxY = Math.max(maxY, p.y + p.r);
        });
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    private _resetCloud(c: Cloud): void {
        const rad = this.direction * Math.PI / 180;
        const vx = Math.sin(rad);
        const vy = -Math.cos(rad);
        const mx = c.w / 2 + 20; // margen horizontal: mitad del ancho de la nube + buffer
        const my = c.h / 2 + 20; // margen vertical:   mitad del alto  de la nube + buffer

        if (Math.abs(vx) >= Math.abs(vy)) {
            // flujo horizontal → entra por izquierda o derecha
            c.x = vx > 0 ? -mx : this.w + mx;
            c.y = Math.random() * this.h * 0.75;
        } else {
            // flujo vertical → entra por arriba o abajo
            c.y = vy > 0 ? -my : this.h + my;
            c.x = Math.random() * this.w;
        }
    }

    // ── Render ───────────────────────────────────────────────

    private _drawCloud(ctx: CanvasRenderingContext2D, c: Cloud): void {
        ctx.save();
        ctx.translate(c.x, c.y);

        const sorted = [...c.puffs].sort((a, b) => a.y - b.y);

        sorted.forEach(p => {
            const isTop = p.y < -10;
            const grad = ctx.createRadialGradient(
                p.x, p.y - p.r * 0.25, p.r * 0.05,
                p.x, p.y, p.r
            );

            if (isTop) {
                grad.addColorStop(0, 'rgba(255,255,255,0.98)');
                grad.addColorStop(0.4, 'rgba(245,248,255,0.90)');
                grad.addColorStop(0.8, 'rgba(220,228,245,0.65)');
                grad.addColorStop(1, 'rgba(200,215,235,0)');
            } else {
                grad.addColorStop(0, 'rgba(255,255,255,0.95)');
                grad.addColorStop(0.5, 'rgba(235,241,252,0.80)');
                grad.addColorStop(0.85, 'rgba(210,222,240,0.50)');
                grad.addColorStop(1, 'rgba(190,205,225,0)');
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.globalAlpha = c.baseOpacity * this.opacity;
            ctx.fill();
        });

        const shadowGrad = ctx.createRadialGradient(
            0, c.oy + c.h * 0.6, 0,
            0, c.oy + c.h * 0.6, c.w * 0.55
        );
        shadowGrad.addColorStop(0, 'rgba(160,180,210,0.18)');
        shadowGrad.addColorStop(0.6, 'rgba(160,180,210,0.07)');
        shadowGrad.addColorStop(1, 'rgba(160,180,210,0)');

        ctx.beginPath();
        ctx.ellipse(0, c.oy + c.h * 0.62, c.w * 0.48, c.h * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = shadowGrad;
        ctx.globalAlpha = c.baseOpacity * this.opacity * 0.6;
        ctx.fill();

        ctx.restore();
    }

    // ── Loop ─────────────────────────────────────────────────

    private _loop(timestamp: number): void {
        if (!this.running) return;

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        const rad = this.direction * Math.PI / 180;
        const vx = Math.sin(rad) * this.speed;
        const vy = -Math.cos(rad) * this.speed;

        this.ctx.clearRect(0, 0, this.w, this.h);

        this.clouds.forEach(c => {
            c.x += vx * dt * c.speed;
            c.y += vy * dt * c.speed;

            const margin = c.w + 80;
            if (
                c.x - c.w / 2 > this.w + margin ||
                c.x + c.w / 2 < -margin ||
                c.y - c.h / 2 > this.h + margin ||
                c.y + c.h / 2 < -margin
            ) {
                this._resetCloud(c);
            }

            this._drawCloud(this.ctx, c);
        });

        this.raf = requestAnimationFrame(t => this._loop(t));
    }
}