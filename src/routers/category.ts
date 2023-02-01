import { Category, Prisma, PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { userIdMiddleware } from "./user.js"

const categoryRouter = express.Router()
const prisma = new PrismaClient()

const categoryPostParser = z.object({
    name: z.string().max(50)
}).required()

const categoryDeleteParser = z.object({
    id: z.number()
}).required()

const categoryUpdateParser = z.object({
    id: z.number(),
    name: z.string().max(50)
}).required()

// TODO Ajouter pagination et queries de recherche
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
        const newCategory = categoryPostParser.parse(req.body)
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

const categoryUpdate: RequestHandler = async (req, res) => {
    let updated: Prisma.BatchPayload

    try {
        const categoryToUpdate = categoryUpdateParser.parse(req.body)
        updated = await prisma.category.updateMany({
            where: {
                id: categoryToUpdate.id,
                user_id: req.body.userId
            },
            data: {
                name: categoryToUpdate.name
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: `${updated.count} category / categories successfully updated.` })
}

const categoryDelete: RequestHandler = async (req, res) => {
    let deleted: Prisma.BatchPayload

    try {
        const categoryToDel = categoryDeleteParser.parse(req.body)
        deleted = await prisma.category.deleteMany({
            where: {
                id: categoryToDel.id,
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
categoryRouter.put('/', userIdMiddleware, categoryUpdate)
categoryRouter.delete('/', userIdMiddleware, categoryDelete)

export default categoryRouter
