<script lang="ts">
	import Loader from "$lib/components/Loader.svelte";

	import type { PageData } from "./$types";
	import { onMount } from "svelte";

	export let data: PageData;
	// @ts-ignore
	export const { id } = data;

	import init__loadServer, { server } from "$lib/actions/loadServer";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";
	import Editor from "$lib/components/Editor.svelte";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = true;

	let bin: Record = new Record();
	let isBinOwner = false;

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
				filter: 'type = "html"'
			});
			
			isBinOwner = pb.authStore.model !== null && bin.creator === pb.authStore.model.id;
			isLoading = false;
		} catch {
			alert("Failed to load bin!");
		}
	});
</script>

<svelte:head>
	<title>{bin.title || "Editing Bin"} - Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<a href="/bin/html/{id}" aria-label="View Bin">
				<button  aria-label="View Bin">
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
							await pb.collection("bins").update(bin.id, bin);
						} catch {
							alert("Failed to save bin!");
						}
					}}>Save Changes</button
				>

				<a href="/bin/html/{id}">
					<button class="secondary" style="height: max-content; width: max-content;"
						>View Bin</button
					>
				</a>

				<a href="/bin/html/{id}?nokbstyle">
					<button class="secondary" style="height: max-content; width: max-content;"
						>View Bin (No Default Style)</button
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
		<div class="flex">
			<Editor
				lang="html"
				width="49%"
				height="calc(100vh - 65px);"
				value={bin.nodes[0].content}
				readonly={!isBinOwner}
				blur={(v) => {
					bin.nodes[0].content = v;
					bin = bin;
				}}
			/>

			<preview-pane>
				{@html bin.nodes[0].content}
			</preview-pane>
		</div>
	{/if}
</component>

<style>
	preview-pane {
		border-left: solid 1px var(--bg-surface-lowest);
	}
</style>
