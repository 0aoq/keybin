<script lang="ts">
	import type slideController from "./slideController";

	export let controllerModule: slideController;
	export let slideId: string;
</script>

{#if controllerModule}
	<component>
		<div
			class="select-button"
			aria-label="Previous Slide"
			on:mousedown={() => {
				controllerModule.Slide("<");
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-arrow-left"
				><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg
			>
		</div>

		<div
			class="select-button"
			aria-label="Next Slide"
			on:mousedown={() => {
				controllerModule.Slide(">");
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-arrow-right"
				><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg
			>
		</div>

		{#if controllerModule.isEditor}
			<div
				class="select-button"
				aria-label="Add Slide"
				on:mousedown={() => {
					controllerModule.slides.push({
						content: "<slide-node>New Slide</slide-node>",
						id: controllerModule.slides.length.toString()
					});
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-plus-square"
					><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line
						x1="12"
						y1="8"
						x2="12"
						y2="16"
					/><line x1="8" y1="12" x2="16" y2="12" /></svg
				>
			</div>

			<a href="/bin/slides/{slideId}/edit/mode:json" class="doNotAddHover!" style="color: currentColor;">
				<div
					class="select-button"
					aria-label="Edit Slideshow Source"
					on:mousedown={() => {
						controllerModule.slides.push({
							content: "<slide-node>New Slide</slide-node>",
							id: controllerModule.slides.length.toString()
						});
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="feather feather-edit"
						><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path
							d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
						/></svg
					>
				</div>
			</a>
		{/if}
	</component>
{/if}

<style>
	component {
		display: flex;
		gap: var(--u-2);
		background: var(--bg-surface-lower);
		border-radius: 0.4rem;
		padding: 0.2rem;

		position: fixed;
		bottom: 0.4rem;
		left: 0.6rem;
		z-index: 9999;
	}

	component .select-button {
		padding: 0.4rem 0.8rem;
		border-radius: 0.4rem;
		background: var(--bg-surface-lower);
		transition: all 0.15s;
		display: grid;
		place-items: center;
		cursor: pointer;
	}

	component .select-button:hover {
		box-shadow: 0 0 2px var(--bg-surface-lowest);
	}
</style>
