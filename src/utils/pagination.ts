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
	return {
		next: `/v1/${routeName}?start=${query.skip + query.take}&per_page=${query.take}`,
		prev: `/v1/${routeName}?start=${Math.max(0, query.skip - query.take)}&per_page=${
			query.take
		}`,
	}
}
