<script lang="ts">
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Loader from "$lib/components/Loader.svelte";

	import { onMount } from "svelte";

	import init__loadServer, { server } from "$lib/actions/loadServer";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	let isLoading = false;

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
	});

	// functions
	let binType: "normal" | "html" | "slides" = "normal";
	let errorMessage = "";

	async function create(e: any) {
		isLoading = true;
		if (!pb.authStore.model) return;

		try {
			if (binType === "normal") {
				const record = await pb.collection("bins").create({
					creator: pb.authStore.model.id,
					title: e.target.title.value,
					nodes: [],
					type: "notebook"
				});

				window.location.href = `/bin/${record.id}`;
			} else if (binType === "html") {
				// create html bin
				const record = await pb.collection("bins").create({
					creator: pb.authStore.model.id,
					title: e.target.title.value,
					nodes: [{ id: 0, type: "html", content: "<h1>Hello, world!</h1>" }],
					type: "html"
				});

				window.location.href = `/bin/html/${record.id}/edit`;
			} else {
				// create slides bin
				const record = await pb.collection("bins").create({
					creator: pb.authStore.model.id,
					title: e.target.title.value,
					nodes: [{ id: 0, type: "slide", content: "" }],
					type: "slides"
				});

				window.location.href = `/bin/slides/${record.id}/edit`;
			}
		} catch {
			errorMessage = "Failed to create bin, make sure the name is unique!";
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Bin - Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<a href="/">
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
						class="feather feather-home"
						><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
							points="9 22 9 12 15 12 15 22"
						/></svg
					>
				</button>
			</a>

			<h1 class="ml-4"><a href="/">Keybin</a></h1>
		</div>

		<div>
			<LoadKeyForm />
		</div>
	</nav>

	{#if pb.authStore.model}
		<main>
			<card>
				<h2>Create Bin</h2>
				<a href="/bin/my">My Bins</a>/<a href="/bin/create">Create Bin</a>

				<card class="mt-8 mb-4 flex" style="gap: var(--u-2);">
					<button
						disabled={isLoading}
						class="{binType !== 'normal' ? 'secondary' : ''} round"
						on:click={() => {
							binType = "normal";
						}}>Normal Bin</button
					>

					<button
						disabled={isLoading}
						class="{binType !== 'html' ? 'secondary' : ''} round"
						on:click={() => {
							binType = "html";
						}}>HTML Bin</button
					>

					<button
						disabled={isLoading}
						class="{binType !== 'slides' ? 'secondary' : ''} round"
						on:click={() => {
							binType = "slides";
						}}>Slides</button
					>
				</card>

				<card class="flex justify-center mt-8">
					<form
						class="flex justify-center"
						style="flex-direction: column; width: var(--u-100);"
						on:submit|preventDefault={create}
					>
						<p class="form-label">Title</p>
						<input
							type="text"
							placeholder="Title"
							name="title"
							minlength="4"
							maxlength="32"
							autocomplete="off"
						/>

						<button class="mt-4" style="width: 100%;"
							>{#if !isLoading} Create {:else} <Loader /> {/if}</button
						>

						<p class="mt-2" style="color: var(--primary-low);">{errorMessage}</p>
					</form>
				</card>
			</card>

			<Footer />
		</main>
	{/if}
</component>
