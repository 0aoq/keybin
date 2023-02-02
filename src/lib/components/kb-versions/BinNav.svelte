<script lang="ts">
    export let bin: any;
    export let page: string = "tree";
</script>

<component>
    <card class="pt-12 pl-12 pb-12 pr-12" style="border-top: none;">
        <h1>{bin.title || "------"}</h1>
    </card>

    <card class="flex justify-center align-center" style="border-top: none; gap: var(--u-2);">
        <a href="/bin/{bin.id}/tree" class="doNotAddHover!">
            <button class="round {page !== "tree" ? "secondary" : ""}">Tree</button>
        </a>

        <a href="/bin/{bin.id}/tree/settings" class="doNotAddHover! secondary">
            <button class="round {page !== "settings" ? "secondary" : ""}">Settings</button>
        </a>
    </card>
</component>