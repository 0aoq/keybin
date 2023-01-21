/**
 * @file Handle the slideController class
 * @name slideController.ts
 * @license MIT
 */

/** @type Slide */
export type Slide = {
	content: string;
	id: string;
};

/** @type Handles */
export type Handles = {
	top: HTMLElement;
	left: HTMLElement;
	bottom: HTMLElement;
	right: HTMLElement;
};

/**
 * @export
 * @class slideController
 * @description Control slide related functions
 */
export default class slideController {
	domParser: DOMParser;
	isEditor: boolean;
	canvas: ShadowRoot;

	/**
	 * Creates an instance of slideController.
	 * @param {HTMLElement} canvas
	 * @param {Slide[]} slides
	 * @param {boolean} isEditor
	 * @memberof slideController
	 */
	constructor(canvas: HTMLElement, slides: Slide[], isEditor: boolean = false) {
		this.domParser = new DOMParser();
		this.isEditor = isEditor;

		// create shadowRoot
		canvas.attachShadow({ mode: "open" });
		this.canvas = canvas.shadowRoot as ShadowRoot;

		// add default styles
		this.canvas.innerHTML += `<style>@import url("/styles/slides.css");</style>`;

		// register first slide
		this.registerSlide(slides[0]);
	}

	/**
	 * @function registerSlide
	 *
	 * @private
	 * @param {Slide} slide
	 * @memberof slideController
	 */
	private registerSlide(slide: Slide) {
		const doc = this.domParser.parseFromString(slide.content, "text/html");

		// create slide element
		const slideElement = doc.createElement("slide");
		slideElement.id = slide.id;
		this.canvas.appendChild(slideElement);

		// create handles element
		const handles = doc.createElement("handles");
		slideElement.appendChild(handles);

		const handleTop = doc.createElement("handle");
		handleTop.style.cursor = "n-resize";
		handleTop.classList.add("top");
		handles.appendChild(handleTop);

		const handleLeft = doc.createElement("handle");
		handleLeft.style.cursor = "w-resize";
		handleLeft.classList.add("left");
		handles.appendChild(handleLeft);

		const handleBottom = doc.createElement("handle");
		handleBottom.style.cursor = "s-resize";
		handleBottom.classList.add("bottom");
		handles.appendChild(handleBottom);

		const handleRight = doc.createElement("handle");
		handleRight.style.cursor = "e-resize";
		handleRight.classList.add("right");
		handles.appendChild(handleRight);

		slideElement.addEventListener("mousedown", (e) => {
			if ((e.target as HTMLElement).nodeName === "HANDLE") return; // don't remove when using handles
			handles.classList.remove("active");
		});

		// load elements
		for (let element of doc.querySelectorAll("slide-node")) {
			// load node loads elements from this.doc to this.canvas
			this.loadNode(element, slideElement, handles, {
				top: handleTop,
				left: handleLeft,
				bottom: handleBottom,
				right: handleRight
			});
		}
	}

	/**
	 * @function loadNode
	 * @description Load an element from this.doc to this.canvas
	 *
	 * @private
	 * @param {Element} node
	 * @param {Element} slideElement
	 * @param {HTMLElement} handlesElement
	 * @param {Handles} handles
	 * @return {void}
	 * @memberof slideController
	 */
	private loadNode(
		node: Element,
		slideElement: Element,
		handlesElement: HTMLElement,
		handles: Handles
	): void {
		// no script elements
		if (node.innerHTML.includes("<script>")) return;

		// no "on..." events
		node.innerHTML = node.innerHTML.replaceAll(/(on)(.*)\=/gm, `r-${crypto.randomUUID()}=`);

		// handle editor
		if (this.isEditor) {
			node.classList.add("isEditor");

			let isMouseDown = false;
			let editorYOffset = 65; // height of the editor topbar

			// handle dragging
			node.addEventListener("mousedown", () => {
				isMouseDown = true;
			});

			this.canvas.addEventListener("mouseup", () => {
				isMouseDown = false;
			});

			this.canvas.addEventListener("mousemove", (e: any) => {
				if (!isMouseDown) return;

				handlesElement.classList.add("active");

				// position handlesElement
				handlesElement.style.top = `${e.pageY - editorYOffset - 3}px`;
				handlesElement.style.left = `${e.pageX - 3}px`;

				// size handlesElement
				const nodeComputed = window.getComputedStyle(node);
				handlesElement.style.width = parseFloat(nodeComputed.width.split("px")[0]) - 2 + "px";
				handlesElement.style.height = parseFloat(nodeComputed.height.split("px")[0]) - 2 + "px";

				// set top and left values
				(node as HTMLElement).style.top = `${e.pageY - editorYOffset}px`;
				(node as HTMLElement).style.left = `${e.pageX}px`;
			});

			// handle resizing (handles)
			const handle = (
				$handle: HTMLElement,
				property: "height" | "width",
				increment: number,
				direction: 1 | 2
			): void => {
				let isMouseDownOnHandle = false;

				$handle.addEventListener("mousedown", () => {
					isMouseDownOnHandle = true;
				});

				this.canvas.addEventListener("mouseup", () => {
					isMouseDownOnHandle = false;
				});

				this.canvas.addEventListener("mousemove", (e: any) => {
					if (!isMouseDownOnHandle) return;
					const nodeComputed = window.getComputedStyle(node);

					// increment - 3 repositions the handles

					if (property === "width") {
						const currentWidth = parseFloat(nodeComputed.width.split("px")[0]);
						const currentLeft = parseFloat(nodeComputed.left.split("px")[0]);

						(node as HTMLElement).style.width = currentWidth + increment + "px";
						handlesElement.style.width = (node as HTMLElement).style.width;

						// keep current position

						// if direction === 1, do nothing!
						if (direction === 2) {
							// if direction === 2, decrease left
							handlesElement.style.left = currentLeft - increment - 3 + "px";
							(node as HTMLElement).style.left = currentLeft - increment + "px";
						}
					} else {
						const currentHeight = parseFloat(nodeComputed.height.split("px")[0]);
						const currentTop = parseFloat(nodeComputed.top.split("px")[0]);

						(node as HTMLElement).style.height = currentHeight + increment + "px";
						handlesElement.style.height = (node as HTMLElement).style.height;

						// keep current position

						// if direction === 1, do nothing!
						if (direction === 2) {
							// if direction === 2, decrease left
							handlesElement.style.top = currentTop - increment - 3 + "px";
							(node as HTMLElement).style.top = currentTop - increment + "px";
						}
					}
				});
			};

			handle(handles.top, "height", 2, 2);
			handle(handles.left, "width", 2, 2);
			handle(handles.bottom, "height", 2, 1);
			handle(handles.right, "width", 2, 1);
		}

		// append child
		slideElement.appendChild(node);
	}

	public buildSlides() {
		let slides = [];

		// build
		for (let slide of this.canvas.querySelectorAll("slide")) {
            // filling content manually because this will make sure we do not save handles
			let content = "";

			for (let childElement of slide.querySelectorAll("slide-node"))
				content += childElement.outerHTML;

            // update slides
			slides[parseFloat(slide.id)] = {
				id: parseFloat(slide.id),
				content,
				type: "slide"
			};
		}

		// return
		return slides;
	}
}
