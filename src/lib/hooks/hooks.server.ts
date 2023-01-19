// @ts-ignore
export const handle = async ({ event, resolve }) => {
	let response;

	const normalResponse = async () => {
		const res = await resolve(event);
		return res;
	};

	if (
		event.url.pathname.startsWith("/bin/html") &&
		!event.url.pathname.endsWith("/view-source") &&
		!event.url.pathname.endsWith("/edit") &&
		event.url.search.includes("nokbstyle")
	) {
		// remove CSS line
		const _res = await resolve(event);
		let resText = await _res.text();

		// modify resText
		resText = resText.replaceAll("/kb-style.css", "/units.css");

		// create new response object
		const res = new Response(resText, {
			status: 200,
			headers: _res.headers
		});

		return res;
	}

	return normalResponse();
};
