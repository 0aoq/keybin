<script lang="ts">
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";
	import Footer from "$lib/components/Footer.svelte";
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
	let isBinOwner = false;
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
			bin = await pb.collection("bins").getOne(id);
			isBinOwner = pb.authStore.model !== null && bin.creator === pb.authStore.model.id;
			isLoading = false;
		} catch {
			alert("Failed to load bin!");
		}
	});

	// functions
	function setTitle(e: any): void {
		bin.title = e.target.value;
	}
</script>

<svelte:head>
	<title>{bin.title || "Bin"} - Keybin</title>
</svelte:head>

<component>
	<main>
		{#if !isLoading}
			{#if isBinOwner}
				<h1 class="mb-4">
					{bin.title}
				</h1>
			{/if}
		{:else}
			<card class="flex justify-center align-center">
				<Loader />
			</card>
		{/if}
	</main>
</component>
