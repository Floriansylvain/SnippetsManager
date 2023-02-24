const category = {
	type: "object",
	properties: {
		id: {
			type: "number",
		},
		name: {
			type: "string",
		},
		user_id: {
			type: "number",
		},
	},
}

const snippet = {
	type: "object",
	properties: {
		id: {
			type: "number",
		},
		title: {
			type: "string",
		},
		code: {
			type: "string",
		},
		created_at: {
			type: "string",
			format: "date-time",
		},
		updated_at: {
			type: "string",
			format: "date-time",
		},
		user_id: {
			type: "number",
		},
		category_id: {
			type: "number",
		},
		language_id: {
			type: "number",
		},
	},
}

const credentials = {
	type: "object",
	properties: {
		email: {
			type: "string",
			required: true,
			description: "The user email.",
		},
		password: {
			type: "string",
			required: true,
			description: "The user password.",
		},
	},
}

const pagination = {
	type: "object",
	properties: {
		take: {
			type: "integer",
			minimum: 0,
		},
		skip: {
			type: "integer",
			minimum: 0,
		},
	},
}

const paginationLinks = {
	type: "object",
	properties: {
		next: {
			type: "string",
		},
		prev: {
			type: "string",
		},
	},
}

const idParam = {
	in: "path",
	name: "id",
	description: "The targeted element id.",
	required: true,
	schema: {
		type: "integer",
	},
}

export default {
	openapi: "3.0.0",
	info: {
		title: "Snippets Manager",
		version: "1.0.0",
		description: "API de gestion de Snippets.",
	},
	paths: {
		"/v1/category": {
			get: {
				summary: "Get all categories",
				description: "Get all the categories available for the user, with pagination.",
				responses: {
					"200": {
						description: "The list of categories with pagination and links.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										categories: {
											type: "array",
											items: category,
										},
										pagination,
										links: paginationLinks,
										total: {
											type: "integer",
											minimum: 0,
										},
									},
								},
							},
						},
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Category"],
			},
			post: {
				summary: "Create a category",
				description: "Create a category for the user.",
				requestBody: {
					description: "The category to create.",
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: {
										type: "string",
										required: true,
										description: "The category name.",
										example: "My category",
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "The category has been successfully created.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Category"],
			},
		},
		"/v1/category/{id}": {
			get: {
				summary: "Get a category",
				description: "Get a category available for the user by its id.",
				parameters: [idParam],
				responses: {
					"200": {
						description: "The category.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: { category },
								},
							},
						},
					},
				},
				tags: ["Category"],
			},
			put: {
				summary: "Update a category",
				description: "Update a category name avalaible for the user.",
				requestBody: {
					description: "The new category name.",
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: {
										type: "string",
										required: true,
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "The category has been successfully updated.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Category"],
			},
			delete: {
				summary: "Delete a category",
				description: "Delete a category available for the user.",
				parameters: [idParam],
				responses: {
					"200": {
						description: "The category has been successfully deleted.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Category"],
			},
		},
		"/v1/session/login": {
			post: {
				summary: "Create a session",
				description: "Create a session for an existing user.",
				requestBody: {
					description: "The user credentials.",
					required: true,
					content: {
						"application/json": {
							schema: credentials,
						},
					},
				},
				responses: {
					"200": {
						description: "Session created, httpOnly cookie has been set.",
					},
					"400": {
						description:
							"List of issues that led to the bad request or credentials related problem(s).",
					},
				},
				tags: ["Session"],
			},
		},
		"/v1/session/register": {
			post: {
				summary: "Create new user",
				description: "Create a new user with the given credentials.",
				requestBody: {
					description: "The user credentials.",
					required: true,
					content: {
						"application/json": {
							schema: credentials,
						},
					},
				},
				responses: {
					"200": {
						description: "User successfully created.",
					},
					"400": {
						description:
							"List of issues that led to the bad request or credentials related problem(s).",
					},
				},
				tags: ["Session"],
			},
		},
		"/v1/snippet/": {
			get: {
				summary: "Get all snippets",
				description: "Get all the snippets available for the user, with pagination.",
				responses: {
					"200": {
						description: "The list of snippets with pagination and links.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										categories: {
											type: "array",
											items: snippet,
										},
										pagination,
										links: paginationLinks,
										total: {
											type: "integer",
											minimum: 0,
										},
									},
								},
							},
						},
					},
				},
				tags: ["Snippet"],
			},
			post: {
				summary: "Create a snippet",
				description: "Create a snippet for the user.",
				requestBody: {
					description: "The snippet to create.",
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									title: {
										type: "string",
										required: true,
										description: "The snippet name.",
									},
									code: {
										type: "string",
										required: true,
										description: "The snippet content.",
									},
									language: {
										type: "string",
										required: true,
										description: "The snippet language.",
									},
									tags: {
										type: "array",
										required: true,
										description: "The snippet tags.",
										items: {
											type: "string",
										},
									},
									category_id: {
										type: "integer",
										required: false,
										description: "The snippet category id.",
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "The snippet has been successfully created.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Snippet"],
			},
		},
		"/v1/snippet/{id}": {
			get: {
				summary: "Get a snippet",
				description: "Get a snippet available for the user by its id.",
				parameters: [
					{
						in: "path",
						name: "id",
						description: "The snippet id.",
						required: true,
						schema: {
							type: "integer",
						},
					},
				],
				responses: {
					"200": {
						description: "The snippet.",
						content: {
							"application/json": {
								schema: snippet,
							},
						},
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Snippet"],
			},
			put: {
				summary: "Update a snippet",
				description: "Update a snippet available for the user by its id.",
				parameters: [idParam],
				requestBody: {
					description: "The snippet to update.",
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									title: {
										type: "string",
										required: true,
										description: "The snippet name.",
									},
									code: {
										type: "string",
										required: true,
										description: "The snippet content.",
									},
									language: {
										type: "string",
										required: true,
										description: "The snippet language.",
									},
									tags: {
										type: "array",
										required: true,
										description: "The snippet tags.",
										items: {
											type: "string",
										},
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "The snippet has been successfully updated.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Snippet"],
			},
			delete: {
				summary: "Delete a snippet",
				description: "Delete a snippet available for the user by its id.",
				parameters: [idParam],
				responses: {
					"200": {
						description: "The snippet has been successfully deleted.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["Snippet"],
			},
		},
		"/v1/user/": {
			put: {
				summary: "Update user",
				description: "Update the user informations.",
				requestBody: {
					description: "The user informations to update.",
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: {
										type: "string",
										required: false,
										description: "The user name.",
									},
									picture_path: {
										type: "string",
										required: false,
										description: "The user picture path.",
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "The user has been successfully updated.",
					},
					"400": {
						description: "List of issues that led to the bad request.",
					},
				},
				tags: ["User"],
			},
		},
	},
}
