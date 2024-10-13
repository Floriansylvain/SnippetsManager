import { Category, Prisma, PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { getPaginationLinks, Pagination, queryPaginationParser } from "../utils/pagination.js"
import { parseJwtUserId, userIdMiddleware } from "./user.js"

const categoryRouter = express.Router()
const prisma = new PrismaClient()

const categoryPostParser = z
	.object({
		name: z.string().max(50),
	})
	.required()

const categoryUpdateParser = z
	.object({
		name: z.string().max(50),
	})
	.required()

const paramsIdParser = z
	.object({
		id: z.coerce.number(),
	})
	.required()

async function findCategories(userId: number, pagination: Pagination): Promise<Category[]> {
	const query: any = {
		where: { user_id: userId },
		skip: pagination.skip,
		take: pagination.take,
	}

	if (pagination.orderBy) {
		query.orderBy = [{ [pagination.orderBy]: pagination.direction }]
	}

	return prisma.category.findMany(query)
}

const categoryGet: RequestHandler = async (req, res) => {
	let categories: Category[] | null = null
	let categoriesTotal: number = 0
	let pagination = {} as Pagination

	try {
		pagination = queryPaginationParser.parse(req.query)
		const userId = parseJwtUserId(req.cookies.jwt)
		categories = await findCategories(userId ?? -1, pagination)
		categoriesTotal = await prisma.category.count({ where: { user_id: userId } })
	} catch (error: any) {
		res.status(400).json({ message: error.issues ?? error })
		return
	}

	res.json({
		categories,
		pagination,
		links: getPaginationLinks(pagination, "category"),
		total: categoriesTotal,
	})
}

const categoryGetUnique: RequestHandler = async (req, res) => {
	let category: Category | null = null

	try {
		const userId = parseJwtUserId(req.cookies.jwt)
		category = await prisma.category.findFirst({
			where: {
				id: paramsIdParser.parse(req.params).id,
				user_id: userId,
			},
		})
	} catch (error: any) {
		res.status(400).json({ message: error.issues ?? error })
		return
	}

	res.json({ category })
}

const categoryPost: RequestHandler = async (req, res) => {
	try {
		const userId = parseJwtUserId(req.cookies.jwt)
		const parsedCategory = categoryPostParser.parse(req.body)
		const newCategorey = await prisma.category.create({
			data: {
				name: parsedCategory.name,
				user_id: userId ?? -1,
			},
		})
		res.json({ message: "Category successfully added.", id: newCategorey.id })
	} catch (error: any) {
		res.status(400).json({ message: error.issues ?? error })
		return
	}
}

const categoryUpdate: RequestHandler = async (req, res) => {
	let updated: Prisma.BatchPayload

	try {
		const categoryToUpdate = categoryUpdateParser.parse(req.body)
		const userId = parseJwtUserId(req.cookies.jwt)
		updated = await prisma.category.updateMany({
			where: {
				id: paramsIdParser.parse(req.params).id,
				user_id: userId,
			},
			data: {
				name: categoryToUpdate.name,
			},
		})
	} catch (error: any) {
		res.status(400).json({ message: error.issues ?? error })
		return
	}

	res.json({ message: `${updated.count} category / categories successfully updated.` })
}

const categoryDelete: RequestHandler = async (req, res) => {
	try {
		const userId = parseJwtUserId(req.cookies.jwt)
		const deleted = await prisma.category.delete({
			where: {
				id: paramsIdParser.parse(req.params).id,
				user_id: userId,
			},
		})
		res.json({ message: `Category successfully deleted.`, id: deleted.id })
	} catch (error: any) {
		res.status(400).json({ message: error.issues ?? error })
		return
	}
}

categoryRouter.get("/", userIdMiddleware, categoryGet)
categoryRouter.get("/:id", userIdMiddleware, categoryGetUnique)
categoryRouter.post("/", userIdMiddleware, categoryPost)
categoryRouter.put("/:id", userIdMiddleware, categoryUpdate)
categoryRouter.delete("/:id", userIdMiddleware, categoryDelete)

export default categoryRouter
