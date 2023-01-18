<script lang="ts">
	import Loader from "$lib/components/Loader.svelte";

	import type { PageData } from "./$types";
	import { onMount } from "svelte";

	export let data: PageData;
	// @ts-ignore
	export const { id } = data;

	import init__loadServer, { server, tempSetServer } from "$lib/actions/loadServer";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = true;
	let bin: Record = new Record();

	onMount(async () => {
		// run action inits
		init__loadServer();

		// respect ?server param
		if (new URLSearchParams(window.location.search).get("server")) {
			tempSetServer(new URLSearchParams(window.location.search).get("server") as string);
		}

		_server = server;
		// if (server === "") window.location.href = "/manage/connection";

		let _pb = init__PocketBase(server);
		if (!_pb) return;
		pb = _pb;

		// load bin
		try {
			bin = await pb.collection("htmlbins").getOne(id);
			isLoading = false;
		} catch {
			alert("Failed to load bin!");
		}
	});

	// functions
</script>

<svelte:head>
	<title>{bin.title || "Viewing Bin"} - Keybin</title>
</svelte:head>

<component>
	{#if !isLoading}
		{@html bin.html || ""}

		<a href="/bin/html/{id}/view-source">
			<button
				aria-label="View Bin Source"
				style="
				position: absolute; 
				right: 0.8rem; 
				bottom: 0.8rem; 
				width: var(--u-14); 
				height: var(--u-14);"
				class="round"
			>
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
					class="feather feather-code"
					><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg
				>
			</button></a
		>
	{:else}
		<noscript>LOOKING FOR BIN SOURCE? Visit: --! /bin/html/{id}/view-source !-- </noscript>
		<main>
			<card class="flex justify-center align-center"><Loader /></card>
		</main>
	{/if}
</component>
