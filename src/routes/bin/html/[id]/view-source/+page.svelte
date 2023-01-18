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
	import Editor from "$lib/components/Editor.svelte";

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
	<main>
		{#if !isLoading}
			<h1 class="mb-4">{bin.title}</h1>

			<card class="mb-8 flex" style="gap: var(--u-2);">
				<a href="/bin/html/{id}">
					<button>&larr; Back</button>
				</a>

				{#if pb.authStore.model && pb.authStore.model.id === bin.creator}
					<a href="/bin/html/{id}/edit"><button class="secondary">Edit Bin</button></a>
				{/if}
			</card>

			<pre>{bin.html || ""}</pre>
		{:else}
			<card class="flex justify-center align-center"><Loader /></card>
		{/if}
	</main>
</component>
