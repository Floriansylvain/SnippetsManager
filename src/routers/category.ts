import { Category, Prisma, PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { userIdMiddleware } from "./user.js"

const categoryRouter = express.Router()
const prisma = new PrismaClient()

const categoryPostParser = z.object({
    name: z.string().max(50)
}).required()

const categoryUpdateParser = z.object({
    name: z.string().max(50)
}).required()

const paramsIdParser = z.object({
    id: z.coerce.number(),
}).required()

// TODO Ajouter pagination et queries de recherche
const categoryGet: RequestHandler = async (req, res) => {
    let categories: Category[] | null = null
    const whereClause: any = { user_id: req.body.userId }

    if (req.params.id != undefined) {
        whereClause.id = paramsIdParser.parse(req.params).id
    }

    try {
        categories = await prisma.category.findMany({ where: whereClause })
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
                id: paramsIdParser.parse(req.params).id,
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
        deleted = await prisma.category.deleteMany({
            where: {
                id: paramsIdParser.parse(req.params).id,
                user_id: req.body.userId
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: `${deleted.count} category / categories successfully deleted.` })
}

categoryRouter.get('/:id?', userIdMiddleware, categoryGet)
categoryRouter.post('/', userIdMiddleware, categoryPost)
categoryRouter.put('/:id', userIdMiddleware, categoryUpdate)
categoryRouter.delete('/:id', userIdMiddleware, categoryDelete)

export default categoryRouter
