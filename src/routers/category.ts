import { Category, Prisma, PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { userIdMiddleware } from "./user.js"

const categoryRouter = express.Router()
const prisma = new PrismaClient()

const categoryData = z.object({
    name: z.string().max(50)
}).required()

const categoryGet: RequestHandler = async (req, res) => {
    let categories: Category[] | null = null

    try {
        categories = await prisma.category.findMany({ where: { user_id: req.body.userId } })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ categories })
}

const categoryPost: RequestHandler = async (req, res) => {
    try {
        const newCategory = categoryData.parse(req.body)
        await prisma.category.create({
            data: {
                name: newCategory.name,
                user_id: req.body.userId
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: 'Category successfully added.' })
}

const categoryDelete: RequestHandler = async (req, res) => {
    let deleted: Prisma.BatchPayload

    try {
        const categoryToDel = categoryData.parse(req.body)
        deleted = await prisma.category.deleteMany({
            where: {
                name: categoryToDel.name,
                user_id: req.body.userId
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: `${deleted.count} category / categories successfully deleted.` })
}

categoryRouter.get('/', userIdMiddleware, categoryGet)
categoryRouter.post('/', userIdMiddleware, categoryPost)
categoryRouter.delete('/', userIdMiddleware, categoryDelete)

export default categoryRouter
