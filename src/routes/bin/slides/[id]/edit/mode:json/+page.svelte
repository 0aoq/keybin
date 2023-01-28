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
				filter: 'type = "slides"'
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
			<a href="/bin/slides/{id}/edit">
				<button>
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
								nodes: bin.nodes
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
		<main>
			<h1 class="mb-2">Edit Source</h1>

			<div class="mb-8 flex">
				<details>
					<summary
						><svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-book"
							><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
							/></svg
						>

						What is this?</summary
					>

                    <span>
                        Your slideshow is saved in a JSON format. 
                        Slides are loaded into your slideshow <un>based on their order in this array.</un>
                        This means uif you move slides in this editor, 
                        their position in your slideshow will change. <br /><br />

                        Each slide contains three fields: an <code>id</code>, their <code>content</code>, and their <code>type</code>.
                        Changing the <code>type</code> field of a slide will make it not display in your slideshow. Slides <un>must</un>
                        be of type <code>slide</code>.<br /><br />

                        The <code>content</code> field of a slide is an HTML string that details what is shown on the slide.
                        Whenever you edit slide content in the default editor, this is what changes.<br /><br />

                        The <code>id</code> field details the position of the slide when changing slides in the slideshow view.
                        Changing this to a number less than 0 will cause the slide to not be accessible.
                    </span>
				</details>
			</div>

			<div
				class="flex justify-center align-center"
				style="border: solid 2px var(--primary); border-style: dashed;"
			>
				<Editor
					lang="json"
					width="100%"
					height="calc(var(--u-100) * 2)"
					value={JSON.stringify(bin.nodes)}
					readonly={!isBinOwner}
					blur={(v) => {
						bin.nodes = JSON.parse(v);
					}}
				/>
			</div>
		</main>
	{/if}
</component>
