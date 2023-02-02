<script lang="ts">
	import Loader from "$lib/components/Loader.svelte";
	import Editor from "$lib/components/Editor.svelte";

	import type { PageData } from "./$types";
	import { onMount } from "svelte";

	export let data: PageData;
	// @ts-ignore
	export const { id } = data;

	import init__loadServer, { server } from "$lib/actions/loadServer";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";
	import slideController from "$lib/components/slides/slideController";
	import SlideController from "$lib/components/slides/SlideController.svelte";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = true;

	let bin: Record = new Record();
	let isBinOwner = false;

	let canvas: HTMLElement;
	let controller: slideController;

	onMount(async () => {
		// run action inits
		init__loadServer();
		_server = server;
		if (server === "") window.location.href = "/manage/connection";

		let _pb = init__PocketBase(server);
		if (!_pb) return;
		pb = _pb;
		if (!pb.authStore.model) window.location.href = "/account";
		if (!pb.authStore.model) return; // for TypeScript checking

		// load bin
		try {
			bin = await pb.collection("bins").getOne(id, {
				filter: 'type = "slides"'
			});

			isBinOwner = pb.authStore.model !== null && bin.creator === pb.authStore.model.id;
			isLoading = false;

			// init canvas
			setTimeout(() => {
				controller = new slideController(canvas, bin.nodes, true);
			}, 100);
		} catch {
			alert("Failed to load bin!");
		}
	});

	// cursor tracker
	let cursor = { x: 0, y: 0, ox: 0, oy: 0 };

	function mouseMoveOnCanvas(e: MouseEvent): void {
		cursor.x = e.x;
		cursor.y = e.y;

		cursor.ox = e.offsetY;
		cursor.oy = e.offsetX;
	}
</script>

<svelte:head>
	<title>{bin.title || "Editing Bin"} - Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<a href="/bin/slides/{id}" aria-label="View Slide">
				<button aria-label="View Slide">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="feather feather-arrow-left-circle"
						><circle cx="12" cy="12" r="10" /><polyline points="12 8 8 12 12 16" /><line
							x1="16"
							y1="12"
							x2="8"
							y2="12"
						/></svg
					>
				</button>
			</a>

			<h1 class="ml-4"><a href="/">Keybin</a></h1>
		</div>

		<div class="flex">
			{#if isLoading}
				<Loader />
			{:else}
				<button
					style="height: max-content; width: max-content;"
					on:click={async () => {
						if (!pb || !pb.authStore.model || !isBinOwner) return;

						try {
							await pb.collection("bins").update(bin.id, {
								nodes: controller.buildSlides()
							});
						} catch {
							alert("Failed to save bin!");
						}
					}}>Save Changes</button
				>

				<a href="/bin/slides/{id}">
					<button class="secondary" style="height: max-content; width: max-content;"
						>View Bin</button
					>
				</a>

				<a href="/bin/slides/{id}?nokbstyle">
					<button class="secondary" style="height: max-content; width: max-content;"
						>View Bin (No Default Style)</button
					></a
				>

				<a href="/manage/{id}">
					<button class="secondary" style="height: max-content; width: max-content;"
						>Manage</button
					></a
				>
			{/if}
		</div>
	</nav>

	{#if isLoading}
		<main>
			<card>
				<Loader />
			</card>
		</main>
	{:else}
		<div class="flex justify-center align-center">
			<Editor
				lang="html"
				width="50%"
				height="calc(100vh - 65px);"
				value={bin.nodes[(controller || { currentSlide: 0 }).currentSlide].content}
				readonly={!isBinOwner}
				blur={(v) => {
					bin.nodes[controller.currentSlide].content = v;
					controller.slides = bin.nodes;
					bin = bin;

					// rerender slide
					controller.rerenderSlide(controller.currentSlide.toString());
				}}
			/>

			<SlideController controllerModule={controller} slideId={id} />
			<slide-canvas
				bind:this={canvas}
				style="width: 50%; box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);"
				on:mousemove={mouseMoveOnCanvas}
			/>

			<div
				class="cursor-tracker"
				style="top: {cursor.y + 20}px; left: {cursor.x + 15}px; display: {cursor.x !== 0
					? 'block'
					: 'none'}"
				on:mousemove={mouseMoveOnCanvas}
			>
				<!-- cursor tracker displays offset position so elements are where you expect them to be in view mode -->
				X: <un>{cursor.ox}px</un>, Y: <un>{cursor.oy}px</un>
			</div>
		</div>
	{/if}
</component>

<style>
	slide-canvas {
		display: block;
		width: 100vw;
		height: calc(100vh - 65px);
		position: relative;
	}

	.cursor-tracker {
		position: absolute;
		padding: 0.4rem;
		background: rgb(50, 50, 50);
		border: solid 2px rgb(100, 100, 100);
		border-radius: 0.2rem;
		z-index: 9999;
		transition: all 0.05s;
	}
</style>
