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

/**
 * @export
 * @class slideController
 * @description Control slide related functions
 */
export default class slideController {
	private domParser: DOMParser;
	private isEditor: boolean;
	private canvas: ShadowRoot;
	
	public currentSlide: number;

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
		this.currentSlide = 0;
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

		// load elements
		for (let element of doc.querySelectorAll("slide-node")) {
			// load node loads elements from this.doc to this.canvas
			this.loadNode(element, slideElement);
		}
	}

	/**
	 * @function loadNode
	 * @description Load an element from this.doc to this.canvas
	 *
	 * @private
	 * @param {Element} node
	 * @param {Element} slideElement
	 * @return {void}
	 * @memberof slideController
	 */
	private loadNode(node: Element, slideElement: Element): void {
		// no script elements
		if (node.innerHTML.includes("<script>")) return;

		// no "on..." events
		node.innerHTML = node.innerHTML.replaceAll(/(on)(.*)\=/gm, `r-${crypto.randomUUID()}=`);

		// append child
		slideElement.appendChild(node);
	}

	/**
	 * @function buildSlides
	 *
	 * @return {Array<Slide>}
	 * @memberof slideController
	 */
	public buildSlides(): Array<Slide> {
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
		return slides as any;
	}

	/**
	 * @function Slide
	 * @description Change the current slide
	 *
	 * @param {Array<Slide>} slides
	 * @param {("<" | ">")} [direction=">"]
	 * @returns {void}
	 * @memberof slideController
	 */
	public Slide(slides: Array<Slide>, direction: "<" | ">" = ">"): void {
		direction === "<" ? this.currentSlide-- : this.currentSlide++;
		this.registerSlide(slides[this.currentSlide]);
	}
}
