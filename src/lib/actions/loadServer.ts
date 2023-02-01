/**
 * @file Update client on what the current server is from their localStorage
 * @name loadServer.ts
 * @license MIT
 */

export let server = ""; // will be filled after mount

/**
 * @function setServer
 *
 * @export
 * @param {string} _server
 */
export function setServer(_server: string) {
	server = _server;
	window.localStorage.setItem("keybin-server", server);
}

/**
 * @function tempSetServer
 * @description Set the current server without changing the server in localStorage
 *
 * @export
 * @param {string} _server
 */
export function tempSetServer(_server: string) {
	server = _server;
}

/**
 * @function __init
 *
 * @export
 */
export default function __init() {
	server = window.localStorage.getItem("keybin-server") || "";

	// respect ?server param
	if (new URLSearchParams(window.location.search).get("server")) {
		tempSetServer(new URLSearchParams(window.location.search).get("server") as string);
	}
}
