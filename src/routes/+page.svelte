<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";

	import { onMount } from "svelte";
	import init__loadServer, { server } from "$lib/actions/loadServer";
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase from "pocketbase";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	onMount(() => {
		// run action inits
		init__loadServer();
		_server = server;
		if (server === "") window.location.href = "/manage/connection";

		let _pb = init__PocketBase(server);
		if (!_pb) return;
		pb = _pb;
	});
</script>

<svelte:head>
	<title>Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<a href="/manage/connection">
				<button title={_server !== "" ? `Connected To: ${_server}` : "No server set!"}>
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
						class="feather feather-server"
						><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect
							x="2"
							y="14"
							width="20"
							height="8"
							rx="2"
							ry="2"
						/><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg
					>
				</button>
			</a>

			<h1 class="ml-4"><a href="/">Keybin</a></h1>
		</div>

		<div class="flex" style="gap: var(--u-4);">
			{#if _server !== ""}
				{#if pb.authStore.model}
					<a href="/bin/my">My Bins</a>
					<a href="/bin/create">Create Bin</a>
				{/if}

				<a href="/account">Account</a>
			{:else}
				<a href="/manage/connection">Manage Connection</a>
			{/if}
		</div>
	</nav>

	<main>
		<h1 style="text-align: center; font-size: 3.5rem;">Keybin</h1>

		<LoadKeyForm />
		<Footer />
	</main>

	{#if pb.authStore.model}
		<a href="/bin/create">
			<button
				aria-label="New Bin"
				style="
				position: absolute; 
				right: 0.8rem; 
				bottom: 0.8rem; 
				width: var(--u-18); 
				height: var(--u-18);"
				class="round"
			>
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
					class="feather feather-file-plus"
					><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline
						points="14 2 14 8 20 8"
					/><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg
				>
			</button></a
		>
	{/if}
</component>
