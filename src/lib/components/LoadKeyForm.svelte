<script lang="ts">
	import Loader from "./Loader.svelte";

	let isLoading = false;
	let isErrored = false;

	// load server
	import init__loadServer, { server } from "$lib/actions/loadServer";
	import { onMount } from "svelte";

	onMount(() => {
		init__loadServer();
		if (server === "") isErrored = true; // prevent use of form with no server
		else isErrored = false;
	});

	// functions
	let searchErrored = false;

	async function search() {
		if (isErrored) return;
		isLoading = true;

		// time out search
		setTimeout(() => {
			isLoading = false;
			searchErrored = true;
		}, 5000);
	}
</script>

<div class="flex justify-center" style="position: relative;">
	{#if isErrored}
		<div
			style="position: absolute; width: 100%; height: 100%;"
			class="flex justify-center align-center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="var(--primary)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-alert-circle"
				><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
					x1="12"
					y1="16"
					x2="12.01"
					y2="16"
				/></svg
			>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="var(--primary)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-cloud-off"
				><path
					d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"
				/><line x1="1" y1="1" x2="23" y2="23" /></svg
			>
		</div>
	{/if}

	<form
		class="flex justify-center"
		on:submit|preventDefault={search}
		style="opacity: {isErrored === true ? '25%' : '100%'};"
	>
		<input
			type="text"
			placeholder="🔍  Key"
			style="width: var(--u-100);"
			required
			disabled={isErrored}
			minlength="4"
			class={searchErrored === true ? "errored" : ""}
		/>

		<button style="width: var(--u-28);"
			>{#if !isLoading}
				Search ➜
			{:else}
				<Loader />
			{/if}</button
		>
	</form>
</div>

<style>
	@media (max-width: 800px) {
		form {
			display: block;
		}

		form button {
			width: 100% !important;
			height: max-content;
		}
	}
</style>
