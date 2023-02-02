<script lang="ts">
	type Node = {
		display: {
			left: string;
			right: string;
		};
		link: string;
	};

	export let nodes: Node[];
</script>

<component>
	{#each nodes as node}
		<div class="tree-option">
			<a href={node.link}>{node.display.left}</a>
            <span>{node.display.right}</span>
		</div>
	{/each}
</component>

<style>
	component {
		display: flex;
		flex-direction: column;
		width: 100%;
		border: solid 1px var(--bg-surface-lower);
	}

	component .tree-option {
		padding: var(--u-2);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	component .tree-option {
		border-top: solid 1px var(--bg-surface-lower);
	}

	component .tree-option:nth-child(1) {
		border: none;
	}

	component .tree-option:hover {
		background: var(--bg-surface-low);
	}
</style>
