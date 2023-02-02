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
	<title>{bin.title || "Managing Bin"} - Keybin</title>
</svelte:head>

<component>
	<main>
		{#if !isLoading}
			{#if isBinOwner}
				<h1 class="mb-4">
					Manage <span style="color: var(--text-primary);">{bin.title}</span>
				</h1>

				<card class="flex justify-center align-center mb-8" style="gap: var(--u-2);">
					<button
						on:click={async () => {
							if (!pb || !pb.authStore.model || !isBinOwner) return;

							try {
								await pb.collection("bins").update(bin.id, bin);
							} catch {
								alert("Failed to save bin!");
							}
						}}>Save Changes</button
					>

					<button
						class="secondary"
						on:click={async () => {
							if (!pb.authStore.model || !isBinOwner) return;
							const confirmation = confirm("Are you sure you want to do this?");
							if (!confirmation) return;
							await pb.collection("bins").delete(bin.id);
							window.location.href = "/";
						}}>Delete Bin</button
					>
				</card>

				<card class="flex align-center" style="gap: var(--u-2);">
					<h3 class="mr-4">Title</h3>
					<input type="text" placeholder="Title" value={bin.title || ""} on:blur={setTitle} />
				</card>
			{/if}
		{:else}
			<card class="flex justify-center align-center">
				<Loader />
			</card>
		{/if}
	</main>
</component>
