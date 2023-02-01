import { Prisma, PrismaClient, Snippet } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { userIdMiddleware } from "./user.js"

const snippetRouter = express.Router()
const prisma = new PrismaClient()

const snippetPostParser = z.object({
    code: z.string(),
    title: z.string().max(50),
    language: z.string().max(32)
}).required()

const snippetDeleteParser = z.object({
    id: z.number(),
}).required()


// TODO Ajouter paramètres sur la requête pour rechercher des snippets
// TODO Ajouter pagination
const snippetGet: RequestHandler = async (req, res) => {
    let snippets: Snippet[] | null = null

    try {
        snippets = await prisma.snippet.findMany({ where: { user_id: req.body.userId } })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ snippets })
}

const snippetPost: RequestHandler = async (req, res) => {
    try {
        const newSnippet = snippetPostParser.parse(req.body)
        await prisma.snippet.create({
            data: {
                title: newSnippet.title,
                code: newSnippet.code,
                user: {
                    connect: { id: req.body.userId }
                },
                language: {
                    connectOrCreate: {
                        where: { name: newSnippet.language },
                        create: { name: newSnippet.language }
                    }
                }
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: 'Snippet successfully added.' })
}

const snippetDelete: RequestHandler = async (req, res) => {
    let deleted: Prisma.BatchPayload

    try {
        const snippetToDel = snippetDeleteParser.parse(req.body)
        deleted = await prisma.category.deleteMany({
            where: {
                id: snippetToDel.id,
                user_id: req.body.userId
            }
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: `${deleted.count} snippet(s) successfully deleted.` })
}

// TODO update snippet

snippetRouter.get('/', userIdMiddleware, snippetGet)
snippetRouter.post('/', userIdMiddleware, snippetPost)
snippetRouter.delete('/', userIdMiddleware, snippetDelete)

export default snippetRouter
