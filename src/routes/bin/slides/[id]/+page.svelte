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
				controller = new slideController(canvas, bin.nodes, false);
			}, 100);
		} catch {
			alert("Failed to load bin!");
		}
	});
</script>

<svelte:head>
	<title>{bin.title || "Viewing Bin"} - Keybin</title>
</svelte:head>

<component>
	{#if isLoading}
		<main>
			<card>
				<Loader />
			</card>
		</main>
	{:else}
		<div class="flex justify-center align-center">
			<SlideController controllerModule={controller} slideId={id} />
			<slide-canvas bind:this={canvas} style="box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);" />
		</div>
	{/if}
</component>

<style>
	slide-canvas {
		display: block;
		width: 100vw;
		height: 100vh;
	}
</style>
