import { Plugin } from 'obsidian';

export default class WindowDragPlugin extends Plugin {
	dragArea: HTMLElement | null = null;
	mouseDownTime: number = 0;
	isDragging: boolean = false;

	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.injectDragArea();
		});
	}

	private injectDragArea() {
		if (this.dragArea) {
			return;
		}

		this.dragArea = document.createElement('div');
		this.dragArea.classList.add('window-drag-area');

		// Ajouter les écouteurs d'événements
		this.dragArea.addEventListener('mousedown', (e) => {
			this.mouseDownTime = Date.now();
			this.isDragging = false;
		});

		this.dragArea.addEventListener('mousemove', (e) => {
			if (e.buttons === 1 && Date.now() - this.mouseDownTime > 150) { // 150ms seuil pour considérer comme drag
				this.isDragging = true;
				this.dragArea?.classList.add('dragging');
			}
		});

		this.dragArea.addEventListener('mouseup', (e) => {
			const wasDragAttempt = this.isDragging;
			this.isDragging = false;
			this.dragArea?.classList.remove('dragging');

			if (!wasDragAttempt) {
				// Simuler le clic sur l'élément en dessous
				this.dragArea?.style.setProperty('pointer-events', 'none');
				const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
				elementBelow?.dispatchEvent(new MouseEvent('click', {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: e.clientX,
					clientY: e.clientY
				}));
				this.dragArea?.style.removeProperty('pointer-events');
			}
		});

		const styleEl = document.createElement('style');
		styleEl.textContent = `
            .window-drag-area {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: var(--titlebar-height);
                z-index: 9999;
                cursor: default;
            }

            .window-drag-area.dragging {
                -webkit-app-region: drag;
            }
        `;

		document.head.appendChild(styleEl);
		const appContainer = this.app.workspace.containerEl;
		if (appContainer) {
			appContainer.appendChild(this.dragArea);
			console.log('Drag area added to DOM');
		}
	}

	onunload() {
		this.dragArea?.remove();
		this.dragArea = null;
	}
}
