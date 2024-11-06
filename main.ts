import { Plugin } from 'obsidian';

export default class WindowDragPlugin extends Plugin {
	private dragEl: HTMLElement | null = null;

	async onload() {
		// On crée un élément avec UNIQUEMENT webkit-app-region: drag
		this.dragEl = document.createElement('div');
		this.dragEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 30px;
            -webkit-app-region: drag;
            z-index: 999999;
            pointer-events: none;
        `;

		// On l'ajoute au DOM
		document.body.appendChild(this.dragEl);

		// Si on est sur la zone, on active les événements
		this.registerDomEvent(window, 'mousedown', (e: MouseEvent) => {
			if (e.clientY <= 30 && this.dragEl) {
				this.dragEl.style.pointerEvents = 'all';
			}
		});

		// Dès qu'on relâche, on désactive
		this.registerDomEvent(window, 'mouseup', () => {
			if (this.dragEl) {
				this.dragEl.style.pointerEvents = 'none';
			}
		});
	}

	onunload() {
		this.dragEl?.remove();
		this.dragEl = null;
	}
}
