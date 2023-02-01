import { Prisma, PrismaClient, Snippet } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { userIdMiddleware } from "./user.js"

const snippetRouter = express.Router()
const prisma = new PrismaClient()

const snippetData = z.object({
    code: z.string(),
    title: z.string().max(50)
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

    res.json({ categories: snippets })
}

// const snippetPost: RequestHandler = async (req, res) => {
//     try {
//         const newSnippet = snippetData.parse(req.body)
//         await prisma.snippet.create({
//             data: {
//                 code: newSnippet.code,
//                 title: newSnippet.code,
//                 user_id: req.body.userId
//             }
//         })
//     } catch (error: any) {
//         res.status(400).json({ message: (error.issues ?? error) })
//         return;
//     }

//     res.json({ message: 'Snippet successfully added.' })
// }

// const snippetDelete: RequestHandler = async (req, res) => {
//     let deleted: Prisma.BatchPayload

//     try {
//         const snippetToDel = snippetData.parse(req.body)
//         deleted = await prisma.snippet.deleteMany({
//             where: {

//                 user_id: req.body.userId
//             }
//         })
//     } catch (error: any) {
//         res.status(400).json({ message: (error.issues ?? error) })
//         return;
//     }

//     res.json({ message: `${deleted.count} category / categories successfully deleted.` })
// }

// TODO update snippet

snippetRouter.get('/', userIdMiddleware, snippetGet)
// snippetRouter.post('/', userIdMiddleware, snippetPost)
// snippetRouter.delete('/', userIdMiddleware, snippetDelete)

export default snippetRouter
