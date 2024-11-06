import { Plugin } from 'obsidian';

export default class WindowDragPlugin extends Plugin {
	private dragEl: HTMLElement | null = null;
	private mouseDownTime = 0;
	private longPressTimer: NodeJS.Timeout | null = null;

	async onload() {
		this.dragEl = document.createElement('div');
		this.dragEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 20px;
            -webkit-app-region: drag;
            z-index: 999999;
            pointer-events: none;
        `;

		document.body.appendChild(this.dragEl);

		// Au mousedown, on démarre le timer
		this.registerDomEvent(window, 'mousedown', (e: MouseEvent) => {
			if (e.clientY <= 30) {
				this.mouseDownTime = Date.now();

				// On démarre le timer pour le drag
				this.longPressTimer = setTimeout(() => {
					if (this.dragEl) {
						this.dragEl.style.pointerEvents = 'all';
					}
				}, 150);
			}
		});

		// Si on bouge avant la fin du timer, on l'annule
		this.registerDomEvent(window, 'mousemove', (e: MouseEvent) => {
			if (this.mouseDownTime && e.buttons === 1) {
				const pressDuration = Date.now() - this.mouseDownTime;
				if (pressDuration < 150 && this.longPressTimer) {
					clearTimeout(this.longPressTimer);
					this.longPressTimer = null;
				}
			}
		});

		// Au relâchement, on nettoie tout
		this.registerDomEvent(window, 'mouseup', () => {
			if (this.longPressTimer) {
				clearTimeout(this.longPressTimer);
				this.longPressTimer = null;
			}
			if (this.dragEl) {
				this.dragEl.style.pointerEvents = 'none';
			}
			this.mouseDownTime = 0;
		});
	}

	onunload() {
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer);
		}
		this.dragEl?.remove();
		this.dragEl = null;
	}
}
