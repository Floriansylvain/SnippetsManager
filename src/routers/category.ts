import { Category, PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { parseJwtUserId } from "./user.js"

const categoryRouter = express.Router()
const prisma = new PrismaClient()

const categoryData = z.object({
    name: z.string().max(50)
}).required()

const categoryGet: RequestHandler = async (req, res) => {
    const userId = parseJwtUserId(req.cookies.jwt)
    if (userId === undefined) {
        res.status(400).json({ message: 'Incorrect JWT payload.' })
        return;
    }

    let categories: Category[] | null = null

    try {
        categories = await prisma.category.findMany({ where: { user_id: userId } })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ categories })
}

const categoryPost: RequestHandler = async (req, res) => {
    const userId = parseJwtUserId(req.cookies.jwt)
    if (userId === undefined) {
        res.status(400).json({ message: 'Incorrect JWT payload.' })
        return;
    }

    try {
        const newCategory = categoryData.parse(req.body)
        await prisma.category.create({
            data: {
                name: newCategory.name,
                user_id: userId
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: 'Category successfully added.' })
}

categoryRouter.get('/', categoryGet)
categoryRouter.post('/', categoryPost)

export default categoryRouter
