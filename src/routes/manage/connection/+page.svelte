<script lang="ts">
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Loader from "$lib/components/Loader.svelte";

	import PocketBase from "pocketbase";

	import { onMount } from "svelte";

	import init__loadServer, { server, setServer } from "$lib/actions/loadServer";
	let _server = ""; // <- needed to trigger state update

	onMount(() => {
		// run action inits
		init__loadServer();
		_server = server;
	});

	// functions
	let isLoading = false;
	let errorMessage = "";

	async function loadServer(e: any) {
		isLoading = true;

		// verify server is valid
		try {
			await fetch(e.target.url.value + "/api");
			setServer(e.target.url.value);
			window.location.href = "/";
		} catch {
			isLoading = false;
			errorMessage = "Server is invalid!";
		}
	}
</script>

<svelte:head>
	<title>Manage Connection - Keybin</title>
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

	<main>
		<card class="mb-2"
			><span style="color: var(--primary);">Connected To:</span>
			{_server === "" ? "None" : _server}</card
		>

		{#if _server !== ""}
			<card class="mb-2 flex" style="gap: var(--u-2);"
				><button
					on:click={() => {
						setServer("");
						window.location.reload();
					}}>Clear Server</button
				></card
			>
		{/if}

		<card>
			<h2>Manage Connection</h2>
			<p>Your server connection tells us where we should find bins and load files.</p>

			<div style="width: var(--u-100); margin: var(--u-8) auto;">
				<form
					class="flex justify-center"
					style="flex-direction: column;"
					on:submit|preventDefault={loadServer}
				>
					<p class="form-label">Server URL</p>
					<input type="url" placeholder="Server URL" name="url" autocomplete="off" required />

					<button class="mt-4" style="width: 100%;"
						>{#if !isLoading} Change Server {:else} <Loader /> {/if}</button
					>

					<p class="mt-2" style="color: var(--primary-low);">{errorMessage}</p>
				</form>
			</div>
		</card>

		<Footer />
	</main>
</component>
