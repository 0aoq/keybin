<script lang="ts">
	import LoadKeyForm from "$lib/components/LoadKeyForm.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Loader from "$lib/components/Loader.svelte";

	import { onMount } from "svelte";

	import init__loadServer, { server } from "$lib/actions/loadServer";

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

	// functions
	let isLoading = false;
	let errorMessage = "";
	let currentForm: "login" | "signup" = "login";

	async function auth(e: any) {
		isLoading = true;

		try {
			if (currentForm === "login") {
				const uRecord = await pb
					.collection("users")
					.authWithPassword(e.target.email.value, e.target.password.value);

				window.location.href = "/";
			} else if (currentForm === "signup") {
				const uRecord = await pb.collection("users").create({
					email: e.target.email.value,
					username: e.target.username.value,
					password: e.target.password.value,
					passwordConfirm: e.target.password.value
				});

				// login to new account
				await pb
					.collection("users")
					.authWithPassword(e.target.email.value, e.target.password.value);

				// redirect
				window.location.href = "/";
			}
		} catch {
			errorMessage = "Failed to authenticate";
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Manage Account - Keybin</title>
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
		<card>
			<h2>Account</h2>

			{#if !pb.authStore.model}
				<!-- account form -->
				<div class="flex mt-2 mb-4" style="gap: var(--u-2);">
					<button
						disabled={isLoading}
						class="{currentForm !== 'login' ? 'secondary' : ''} round"
						on:click={() => {
							currentForm = "login";
						}}>Login</button
					>

					<button
						disabled={isLoading}
						class="{currentForm !== 'signup' ? 'secondary' : ''} round"
						on:click={() => {
							currentForm = "signup";
						}}>Sign up</button
					>
				</div>

				<card class="flex justify-center mt-8">
					<form
						class="flex justify-center"
						style="flex-direction: column; width: var(--u-100);"
						on:submit|preventDefault={auth}
					>
						{#if currentForm === "signup"}
							<p class="form-label">Username</p>
							<input
								type="text"
								placeholder="Username"
								name="username"
								autocomplete="off"
								minlength="4"
								maxlength="32"
								required
							/>
						{/if}

						<p class="form-label mt-4">Email</p>
						<input
							type="email"
							placeholder="example@example.com"
							name="email"
							minlength="1"
							required
						/>

						<p class="form-label mt-4">Password</p>
						<input type="password" placeholder="Password" name="password" minlength="8" required />

						<button class="mt-8" style="width: 100%;"
							>{#if !isLoading}
								{currentForm === "login" ? "Login" : "Create Account"}
							{:else}
								<Loader />
							{/if}</button
						>

						<p class="mt-2" style="color: var(--primary-low);">{errorMessage}</p>
					</form>
				</card>
			{:else}
				<card class="mt-2 mb-4 flex" style="gap: var(--u-2);">
					<button
						on:click={() => {
							pb.authStore.clear();
							window.location.reload();
						}}>Sign Out</button
					>

					<button
						class="secondary"
						on:click={async () => {
							if (!pb.authStore.model) return;
							const confirmation = confirm("Are you sure you want to do this?");
							if (!confirmation) return;

							try {
								await pb.collection("users").delete(pb.authStore.model.id);
								window.location.reload();
							} catch {
								alert("Failed to delete account!");
							}
						}}>Delete Account</button
					>
				</card>

				<p><span class="form-label">Username:</span> {pb.authStore.model.username}</p>
				<p><span class="form-label">ID:</span> {pb.authStore.model.id}</p>
				<p>
					<span class="form-label">Created Account:</span>
					{new Date(pb.authStore.model.created).toLocaleString()}
				</p>
				<p>
					<span class="form-label">Last Edit:</span>
					{new Date(pb.authStore.model.updated).toLocaleString()}
				</p>
				<p><span class="form-label">Server:</span> {_server}</p>

				<p class="mt-8">
					This account is valid <un>only</un> in the server listed above! Your active server can be
					changed by going to <a href="/manage/connection">manage connection</a>. If you change your
					server, your account will <un>not</un> move to this new server!<br /><br />

					<un>You can</un> still view bins from other servers through a link. If the address
					contains a temporary server assignment &lpar;<code
						>?server=&lbrace;Server URL&rbrace;</code
					>&rpar; in the address, the bin can be viewed <un>without</un> changing your server.
				</p>
			{/if}
		</card>

		<Footer />
	</main>
</component>
