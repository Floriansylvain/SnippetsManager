import { z } from "zod"

export interface Pagination {
	skip: number
	take: number
}

export const queryPaginationParser = z.object({
	skip: z.coerce.number().optional().default(0),
	take: z.coerce.number().optional().default(10),
})

export function getPaginationLinks(query: Pagination, routeName: string): object {
	const nextStart = query.skip + query.take
	const prevStart = Math.max(0, query.skip - query.take)

	return {
		next: `/v1/${routeName}?start=${nextStart}&per_page=${query.take}`,
		prev: `/v1/${routeName}?start=${prevStart}&per_page=${query.take}`,
	}
}
