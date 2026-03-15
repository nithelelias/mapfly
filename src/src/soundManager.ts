interface SoundOptions {
    loop?: boolean;
    volume?: number;  // 0-1, relativo al master
    rate?: number;    // 0.5 lento/grave, 1 normal, 2 rápido/agudo
    fadeIn?: number;  // segundos
}

interface SoundEntry {
    buffer: AudioBuffer;
    source: AudioBufferSourceNode | null;
    gainNode: GainNode;
    volume: number;
    rate: number;
    loop: boolean;
    playing: boolean;
}

export default class SoundManager {
    static current: SoundManager;
    private ctx: AudioContext;
    private masterGain: GainNode;
    private sounds: Map<string, SoundEntry> = new Map();
    private _master: number = 1;

    constructor(masterVolume: number = 1) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.master = masterVolume;
        SoundManager.current = this;
    }
    static getCurrent() {
        if (!SoundManager.current) {
            SoundManager.current = new SoundManager();
        }
        return SoundManager.current;
    }
    // ── Master ───────────────────────────────────────────────

    get master(): number { return this._master; }

    set master(value: number) {
        this._master = Math.max(0, Math.min(1, value));
        this.masterGain.gain.setValueAtTime(this._master, this.ctx.currentTime);
    }

    // ── Carga ────────────────────────────────────────────────

    async load(id: string, url: string): Promise<void> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

        const gainNode = this.ctx.createGain();
        gainNode.connect(this.masterGain);
        gainNode.gain.setValueAtTime(1, this.ctx.currentTime);

        this.sounds.set(id, {
            buffer: audioBuffer,
            source: null,
            gainNode,
            volume: 1,
            rate: 1,
            loop: false,
            playing: false,
        });
    }

    // ── Reproducción ─────────────────────────────────────────

    play(id: string, options: SoundOptions = {}): void {
        const entry = this._get(id);

        // Reanudar contexto si el browser lo suspendió
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // Detener source anterior si existe
        this._stopSource(entry);

        entry.loop = options.loop ?? entry.loop;
        entry.volume = options.volume ?? entry.volume;
        entry.rate = options.rate ?? entry.rate;

        const source = this.ctx.createBufferSource();
        source.buffer = entry.buffer;
        source.loop = entry.loop;
        source.playbackRate.value = entry.rate;
        source.connect(entry.gainNode);

        if (options.fadeIn && options.fadeIn > 0) {
            entry.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            entry.gainNode.gain.linearRampToValueAtTime(
                entry.volume,
                this.ctx.currentTime + options.fadeIn
            );
        } else {
            entry.gainNode.gain.setValueAtTime(entry.volume, this.ctx.currentTime);
        }

        source.onended = () => {
            if (!entry.loop) entry.playing = false;
        };

        source.start(0);
        entry.source = source;
        entry.playing = true;
    }

    pause(id: string): void {
        const entry = this._get(id);
        if (!entry.playing) return;
        this.ctx.suspend();
        entry.playing = false;
    }

    resume(): void {
        this.ctx.resume();
        this.sounds.forEach(e => { if (e.source) e.playing = true; });
    }

    stop(id: string): void {
        const entry = this._get(id);
        this._stopSource(entry);
        entry.playing = false;
    }

    stopAll(): void {
        this.sounds.forEach((_, id) => this.stop(id));
    }

    // ── Volumen individual ───────────────────────────────────

    setVolume(id: string, volume: number): void {
        const entry = this._get(id);
        entry.volume = Math.max(0, Math.min(1, volume));
        entry.gainNode.gain.setValueAtTime(entry.volume, this.ctx.currentTime);
    }

    // ── Pitch / Rate ─────────────────────────────────────────

    setRate(id: string, rate: number): void {
        const entry = this._get(id);
        entry.rate = Math.max(0.1, Math.min(4, rate));
        if (entry.source) {
            entry.source.playbackRate.setValueAtTime(entry.rate, this.ctx.currentTime);
        }
    }

    // ── Fades ────────────────────────────────────────────────

    fadeIn(id: string, duration: number, targetVolume?: number): void {
        const entry = this._get(id);
        const target = targetVolume ?? entry.volume;
        entry.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        entry.gainNode.gain.linearRampToValueAtTime(
            target,
            this.ctx.currentTime + duration
        );
        entry.volume = target;
    }

    fadeOut(id: string, duration: number, stopAfter: boolean = true): void {
        const entry = this._get(id);
        entry.gainNode.gain.setValueAtTime(entry.gainNode.gain.value, this.ctx.currentTime);
        entry.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        if (stopAfter) {
            setTimeout(() => this.stop(id), duration * 1000);
        }
    }

    // ── Estado ───────────────────────────────────────────────

    isPlaying(id: string): boolean {
        return this._get(id).playing;
    }

    isLoaded(id: string): boolean {
        return this.sounds.has(id);
    }

    // ── Internals ────────────────────────────────────────────

    private _get(id: string): SoundEntry {
        const entry = this.sounds.get(id);
        if (!entry) throw new Error(`Sound "${id}" not loaded`);
        return entry;
    }

    private _stopSource(entry: SoundEntry): void {
        if (entry.source) {
            try { entry.source.stop(); } catch { }
            entry.source = null;
        }
    }
}