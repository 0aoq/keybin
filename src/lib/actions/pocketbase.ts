import PocketBase from "pocketbase";

/**
 * @function __init
 *
 * @export
 * @param {string} server_address
 * @return {PocketBase | undefined}
 */
export default function __init(server_address: string) {
	if (server_address === "") return;
	return new PocketBase(server_address);
}
