<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Loader from "$lib/components/Loader.svelte";
	import Editor from "$lib/components/Editor.svelte";

	import type { PageData } from "./view/$types";
	import { onMount } from "svelte";

	export let data: PageData;
	// @ts-ignore
	export const { id, nodeid } = data;

	import init__loadServer, { server, tempSetServer } from "$lib/actions/loadServer";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";
	import StandardNav from "$lib/components/StandardNav.svelte";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = true;
	let isBinOwner = false;

	let bin: Record = new Record();
	let node: Record;

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

			// get node
			node = bin.nodes.find(
				(v: any) => v.id === nodeid || (!isNaN(parseFloat(nodeid)) && v.id === parseFloat(nodeid))
			);
		} catch {
			alert("Failed to load bin!");
		}
	});

	// functions
</script>

<svelte:head>
	<title>{nodeid} - KB Versions</title>
</svelte:head>

<component>
	<StandardNav />

	{#if !isLoading}
		<card class="pt-12 pl-12 pb-12 pr-12" style="border-top: none;">
			<h1>{bin.title}</h1>
			<p><span class="form-label">Node: </span> {nodeid}</p>
		</card>

		<main>
			<card class="mb-4 flex justify-space-between">
				<a href="/bin/{id}/tree">
					<button>&larr; Back</button>
				</a>

				<button
					class="secondary"
					on:click={async () => {
						if (!pb || !pb.authStore.model || !isBinOwner) return;

						try {
							await pb.collection("bins").update(bin.id, bin);
						} catch {
							alert("Failed to save bin!");
						}
					}}>Save Changes</button
				>
			</card>

			<card>
				<div
					class="flex justify-center align-center"
					style="border: solid 2px var(--primary); border-style: dashed;"
				>
					<Editor
						lang="json"
						width="100%"
						height="calc(var(--u-100) * 2)"
						value={JSON.stringify(node)}
						readonly={!isBinOwner}
						blur={(v) => {
							bin.nodes[bin.nodes.indexOf(node)] = JSON.parse(v);
							node = JSON.parse(v);
							bin = bin;
						}}
					/>
				</div>
			</card>

			<Footer />
		</main>
	{:else}
		<main>
			<card class="flex justify-center align-center">
				<Loader />
			</card>
		</main>
	{/if}
</component>
