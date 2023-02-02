<script lang="ts">
	import init__loadServer, { server } from "$lib/actions/loadServer";
	import { onMount } from "svelte";

	import init__PocketBase from "$lib/actions/pocketbase";
	import PocketBase, { Record } from "pocketbase";

	let _server = ""; // <- needed to trigger state update
	let pb: PocketBase = new PocketBase();

	onMount(async () => {
		// run action inits
		init__loadServer();

		_server = server;
		// if (server === "") window.location.href = "/manage/connection";

		let _pb = init__PocketBase(server);
		if (!_pb) return;
		pb = _pb;
	});
</script>

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

		<h1 class="ml-4"><a href="/">Keybin</a></h1>
	</div>

	<div class="flex align-center" style="gap: var(--u-4);">
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
