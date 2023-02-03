import { Prisma, PrismaClient, Snippet } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { Pagination, getPaginationLinks, queryPaginationParser } from "../utils/pagination.js"
import { userIdMiddleware } from "./user.js"

const snippetRouter = express.Router()
const prisma = new PrismaClient()

const snippetPostParser = z.object({
    code: z.string(),
    title: z.string().max(50),
    language: z.string().max(32),
    tags: z.array(z.string()),
    category_id: z.number()
}).required()

const snippetUpdateParser = z.object({
    code: z.string().optional(),
    title: z.string().max(50).optional(),
    language: z.string().max(32).optional(),
    tags: z.array(z.string()).optional()
})

const paramsIdParser = z.object({
    id: z.coerce.number(),
}).required()

function shortenSnippetsTagDepth(snippets: Snippet[]) {
    snippets.forEach((snippet: any) => {
        snippet.tags = snippet.Snippet_tag.map((x: any) => ({ ...x.tag }))
        snippet.Snippet_tag = undefined
    })
}

async function findSnippets(userId: number, pagination: Pagination): Promise<Snippet[]> {
    return await prisma.snippet.findMany({
        where: { user_id: userId },
        include: {
            Snippet_tag: {
                select: { tag: { select: { id: true, name: true } } },
            }
        },
        ...pagination
    })
}

const snippetGet: RequestHandler = async (req, res) => {
    let snippets: Snippet[] | null = null
    const pagination = queryPaginationParser.parse(req.query)

    try {
        snippets = await findSnippets(req.body.userId, pagination)
        shortenSnippetsTagDepth(snippets)
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({
        snippets,
        pagination,
        links: getPaginationLinks(pagination, 'snippet'),
        total: snippets.length
    })
}

const snippetGetUnique: RequestHandler = async (req, res) => {
    let snippet: Snippet | null = null

    try {
        snippet = await prisma.snippet.findFirst({
            where: {
                id: paramsIdParser.parse(req.params).id,
                user_id: req.body.userId
            },
            include: {
                Snippet_tag: {
                    select: { tag: { select: { id: true, name: true } } },
                }
            }
        })
        if (snippet != undefined) {
            shortenSnippetsTagDepth([snippet])
        }
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ snippet })
}

async function deleteSnippetTags(userId: number, snippetId: number): Promise<void> {
    await prisma.snippet_tag.deleteMany({
        where: {
            tag: { user_id: userId },
            snippet_id: snippetId
        }
    })
}

async function createSnippetTag(snippetId: number, userId: number, tagName: string): Promise<void> {
    await prisma.snippet_tag.create({
        data: {
            snippet: {
                connect: { id: snippetId }
            },
            tag: {
                create: {
                    name: tagName,
                    user_id: userId
                }
            }
        }
    })
}

async function updateSnippet(snippetId: number, userId: number, languageId: number | undefined, snippetData: any): Promise<Prisma.BatchPayload> {
    return await prisma.snippet.updateMany({
        where: {
            id: snippetId,
            user_id: userId
        },
        data: {
            title: snippetData.title,
            code: snippetData.code,
            user_id: userId,
            language_id: languageId,
        }
    })
}

async function updateTagsFromSnippet(snippetId: number, userId: number, snippetData: any): Promise<void> {
    if (snippetData.tags == undefined) return;

    await deleteSnippetTags(userId, snippetId)

    for (const tag of snippetData.tags) {
        await createSnippetTag(snippetId, userId, tag)
    }
}

const snippetPost: RequestHandler = async (req, res) => {
    try {
        const newSnippet = snippetPostParser.parse(req.body)
        const snippet = await prisma.snippet.create({
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
                },
                category: {
                    connect: { id: newSnippet.category_id }
                }
            }
        })
        for (const tag of newSnippet.tags) {
            await createSnippetTag(snippet.id, req.body.userId, tag)
        }
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: 'Snippet successfully added.' })
}

const snippetUpdate: RequestHandler = async (req, res) => {
    let updated: Prisma.BatchPayload

    try {
        const snippetData = snippetUpdateParser.parse(req.body)
        const languageId = await prisma.language.findFirst({
            where: { name: snippetData.language }
        })
        const snippetId = paramsIdParser.parse(req.params).id
        updated = await updateSnippet(snippetId, req.body.userId, languageId?.id, snippetData)
        await updateTagsFromSnippet(snippetId, req.body.userId, snippetData)
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: `${updated.count} snippet / categories successfully updated.` })
}

const snippetDelete: RequestHandler = async (req, res) => {
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

    res.json({ message: `${deleted.count} snippet(s) successfully deleted.` })
}

snippetRouter.get('/', userIdMiddleware, snippetGet)
snippetRouter.get('/:id', userIdMiddleware, snippetGetUnique)
snippetRouter.post('/', userIdMiddleware, snippetPost)
snippetRouter.put('/:id', userIdMiddleware, snippetUpdate)
snippetRouter.delete('/:id', userIdMiddleware, snippetDelete)

export default snippetRouter
