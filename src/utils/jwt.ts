export function getJwtSecret(): string {
	if (process.env["JWT_SECRET"] == undefined) {
		console.error("WARNING! JWT secret is not set.")
		process.exit()
	}
	return process.env["JWT_SECRET"]
}
