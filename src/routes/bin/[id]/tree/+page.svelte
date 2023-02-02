<script lang="ts">
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
	import StandardNav from "$lib/components/StandardNav.svelte";
	import FileTree from "$lib/components/FileTree.svelte";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = true;
	let isBinOwner = false;

	let bin: Record = new Record();
	let binNodesAsTreeNodes: any[] = [];

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

			// build binNodesAsTreeNodes
			for (let node of bin.nodes) {
				binNodesAsTreeNodes.push({
					display: {
						left: `Node ${node.id}`,
						right: "type of: " + node.type
					},
					link: `/bin/${id}/tree/${node.id}`
				});
			}
		} catch {
			alert("Failed to load bin!");
		}
	});

	// functions
</script>

<svelte:head>
	<title>{bin.title || "Bin"} - KB Versions</title>
</svelte:head>

<component>
	<StandardNav />

	{#if !isLoading}
		<card class="pt-12 pl-12 pb-12 pr-12" style="border-top: none;">
			<h1>{bin.title}</h1>
		</card>

		<main>
			<card>
				{#if isBinOwner}
					<FileTree nodes={binNodesAsTreeNodes} />
				{/if}
			</card>

			<card class="flex mt-4">
				<details>
					<summary>
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
							class="feather feather-info"
							><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line
								x1="12"
								y1="8"
								x2="12.01"
								y2="8"
							/></svg
						>

						Bin Information
					</summary>

					<p><span class="form-label">Title: </span> {bin.title}</p>
					<p><span class="form-label">Creator ID: </span> {bin.creator}</p>
					<p><span class="form-label">Bin ID: </span> {bin.id}</p>
					<p><span class="form-label">Node Count: </span> {bin.nodes.length}</p>
					<p><span class="form-label">Permanent Link: </span> 
                        <code>
                            {window.location.origin}/bin/{id}/tree?server={_server}
                        </code>
                    </p>
				</details>

				<details class="mt-2">
					<summary>
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
							class="feather feather-info"
							><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line
								x1="12"
								y1="8"
								x2="12.01"
								y2="8"
							/></svg
						>

						Timestamps
					</summary>

					<p><span class="form-label">Created: </span> {new Date(bin.created).toLocaleString()}</p>
					<p>
						<span class="form-label">Last Updated: </span>
						{new Date(bin.updated).toLocaleString()}
					</p>
				</details>
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
