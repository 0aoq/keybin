<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";

	import { onMount } from "svelte";
	import init__loadServer, { server } from "$lib/actions/loadServer";
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";

	let _server = "";
	onMount(() => {
		// run action inits
		init__loadServer();
		_server = server;
	});
</script>

<svelte:head>
	<title>Keybin</title>
</svelte:head>

<component>
	<nav>
		<div>
			<button
				title={_server !== "" ? `Connected To: ${_server}` : "No server set!"}
				on:click={() => {
					window.location.href = "/manage/connection";
				}}
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

			<h1 class="ml-4"><a href="/">Keybin</a></h1>
		</div>

		<div>
			{#if _server !== ""}
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
</component>
