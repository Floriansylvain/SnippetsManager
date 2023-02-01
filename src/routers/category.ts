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
    let category: Category | null = null

    try {
        const categoryGet = categoryData.parse(req.body)
        category = await prisma.category.findFirst({ where: { name: categoryGet.name } })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ category })
}

const categoryPost: RequestHandler = async (req, res) => {
    const userId = parseJwtUserId(req.cookies.jwt)
    if (userId === undefined) {
        res.status(400).json({ message: 'Incorrect JWT payload.' })
        return;
    }

    try {
        const newCategory = categoryData.parse(req.body)
        prisma.category.create({
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
