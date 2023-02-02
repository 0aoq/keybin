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
	let isBinOwner = false;

	onMount(async () => {
		// run action inits
		init__loadServer();

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
	function createNode(type: "text" | "code") {
		bin.nodes.push({
			type,
			content: "Hello, world!",
			id: window.crypto.randomUUID()
		});

		bin = bin; // trigger ui state update
	}

	function shiftNode(direction: "up" | "down", node: Record) {
		const index = bin.nodes.indexOf(node);

		if (direction === "up" ? !bin.nodes[index - 1] : index === bin.nodes.length - 1) return; // we can't shift into -1 or the end of the array

		let u = JSON.parse(
			JSON.stringify(
				bin.nodes[direction === "up" ? index - 1 : index + 1] // if up === shift up || shift down
			)
		);

		bin.nodes[direction === "up" ? index - 1 : index + 1] = node;
		bin.nodes[index] = u;

		bin = bin;
	}
</script>

<svelte:head>
	<title>{bin.title || "Viewing Bin"} - Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<a href="/" aria-label="Home Button">
				<button aria-label="Home Button">
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
						class="feather feather-home"
						><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
							points="9 22 9 12 15 12 15 22"
						/></svg
					>
				</button>
			</a>

			<h1 class="ml-4">
				<a href="/">Keybin</a>
				<span style="color: var(--text-primary); font-weight: 400;">- {bin.title || "Bin"}</span>
			</h1>
		</div>

		<div>
			<LoadKeyForm />
		</div>
	</nav>

	<main>
		{#if !isLoading}
			{#if pb.authStore.model && isBinOwner}
				<!-- owner options -->
				<card class="mb-4 flex" style="gap: var(--u-2);">
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
										
					<a href="/manage/{id}">
						<button class="secondary" style="height: max-content; width: max-content;"
							>Manage</button
						></a
					>
				</card>
			{/if}

			<h1
				contenteditable={isBinOwner}
				on:blur={(e) => {
					if (!isBinOwner || !e.target) return;
					// @ts-ignore
					bin.title = e.target.innerText;
				}}
			>
				{bin.title || ""}
			</h1>

			<div class="flex mt-4 mb-4" style="flex-direction: column; gap: var(--u-2);">
				{#each bin.nodes || [] as node}
					<card>
						<card class="flex justify-space-between align-center" style="flex-wrap: wrap;">
							{node.id}

							{#if isBinOwner}
								<div class="flex" style="gap: var(--u-2);">
									<button
										class="round secondary"
										on:click={() => {
											bin.nodes.splice(bin.nodes.indexOf(node), 1);
											bin = bin;
										}}>Delete</button
									>

									<button
										class="round secondary"
										on:click={() => {
											shiftNode("up", node);
										}}>Shift Up</button
									>

									<button
										class="round secondary"
										on:click={() => {
											shiftNode("down", node);
										}}>Shift Down</button
									>
								</div>
							{/if}
						</card>

						{#if node.type === "text"}
							<p
								contenteditable={isBinOwner}
								class="mt-2"
								on:blur={(e) => {
									// @ts-ignore
									node.content = e.target.innerText;
									bin = bin;
								}}
							>
								{node.content}
							</p>
						{:else}
							<Editor
								width="100%"
								value={node.content}
								readonly={!isBinOwner}
								blur={(v) => {
									node.content = v;
									bin = bin;
								}}
							/>
						{/if}
					</card>
				{/each}
			</div>

			{#if isBinOwner}
				<card class="flex justify-center align-center" style="gap: var(--u-2);">
					<button
						on:click={() => {
							createNode("text");
						}}>New Text Node</button
					>
					<button
						class="secondary"
						on:click={() => {
							createNode("code");
						}}>New Code Node</button
					>
				</card>
			{/if}
		{:else}
			<card class="flex justify-center align-center"><Loader /></card>
		{/if}

		<Footer />
	</main>
</component>
