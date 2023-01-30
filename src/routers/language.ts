import { Language, PrismaClient } from ".prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"

const langRouter = express.Router()
const prisma = new PrismaClient()

const newLang = z.object({
    name: z.string()
})

const langRouterGet: RequestHandler = (res, req, next) => {

}

const langRouterPost: RequestHandler = (res, req, next) => {

}

langRouter.get('/', langRouterGet)
langRouter.post('/', langRouterPost)

export default langRouter