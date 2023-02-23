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
											items: {
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
											},
										},
										pagination: {
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
										},
										links: {
											type: "object",
										},
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
			},
		},
		"/v1/category/{id}": {
			get: {
				summary: "Get a category",
				description: "Get a category available for the user by its id.",
				parameters: [
					{
						in: "path",
						name: "id",
						description: "The category id.",
						required: true,
						schema: {
							type: "integer",
						},
					},
				],
				responses: {
					"200": {
						description: "The category.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										category: {
											type: "object",
											properties: {
												id: {
													type: "integer",
												},
												name: {
													type: "string",
												},
												user_id: {
													type: "integer",
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
}
