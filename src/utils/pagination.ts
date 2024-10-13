import { z } from "zod"

export interface Pagination {
	skip: number
	take: number
	orderBy?: string
	direction: string
}

export const queryPaginationParser = z.object({
	skip: z.coerce.number().optional().default(0),
	take: z.coerce.number().optional().default(10),
	orderBy: z.string().optional(),
	direction: z.string().optional().default("asc"),
})

export function getPaginationLinks(query: Pagination, routeName: string): object {
	const nextSkip = query.skip + query.take
	const prevSkip = Math.max(0, query.skip - query.take)

	const sorting = query.orderBy ? `&orderBy=${query.orderBy}&direction=${query.direction}` : ""

	return {
		next: `/v1/${routeName}?skip=${nextSkip}&take=${query.take}${sorting}`,
		prev: `/v1/${routeName}?skip=${prevSkip}&take=${query.take}${sorting}`,
	}
}
