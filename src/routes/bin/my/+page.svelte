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

	let isLoading = true;

	let bins: Record[] = [];
	let htmlBins: Record[] = [];

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

		// load bins
		try {
			bins = (
				await pb.collection("bins").getList(1, 50, {
					filter: `creator.id = "${pb.authStore.model.id}"`
				})
			).items;

			htmlBins = (
				await pb.collection("htmlbins").getList(1, 50, {
					filter: `creator.id = "${pb.authStore.model.id}"`
				})
			).items;

			isLoading = false;
		} catch {
			alert("Failed to load bins!");
		}
	});

	// functions
</script>

<svelte:head>
	<title>My Bins - Keybin</title>
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
				<h2>My Bins</h2>

				<card class="mt-2 mb-4 flex" style="gap: var(--u-2);">
					<a href="/bin/create"><button>Create Bin</button></a>
				</card>

				<card class="flex justify-center" style="gap: var(--u-2); flex-wrap: wrap;">
					{#if isLoading}
						<Loader />
					{:else}
						{#each bins as bin}
							<a href="/bin/{bin.id}" class="doNotAddHover!"
								><button class="secondary round">{bin.title}</button></a
							>
						{:else}
							<p>No bins found! <a href="/bin/create">Create one</a></p>
						{/each}
					{/if}
				</card>

				<card class="flex justify-center mt-2" style="gap: var(--u-2); flex-wrap: wrap;">
					{#if isLoading}
						<Loader />
					{:else}
						{#each htmlBins as bin}
							<a href="/bin/html/{bin.id}" class="doNotAddHover!"
								><button class="secondary round">{bin.title}</button></a
							>
						{:else}
							<p>No HTML bins found! <a href="/bin/create">Create one</a></p>
						{/each}
					{/if}
				</card>
			</card>

			<Footer />
		</main>
	{/if}
</component>
