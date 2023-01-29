import { PrismaClient } from '@prisma/client'
import express, { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const userRouter = express.Router()
const prisma = new PrismaClient()

const editableUserData = z.object({
    name: z.string().optional(),
    picture_path: z.string().optional()
})

function parseJwtUserId(jwtoken: string): number | undefined {
    const payload = jwt.decode(jwtoken)
    if (payload == undefined) {
        return undefined
    } else if (typeof payload == 'string') {
        return undefined
    }
    return payload.userId
}

const userRouterPut: RequestHandler = async (req, res) => {
    const userId = parseJwtUserId(req.cookies.jwt)
    if (userId === undefined) {
        res.status(400).json({ message: 'Incorrect JWT payload.' })
        return;
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: editableUserData.parse(req.body)
        })
    } catch (error: any) {
        res.status(400).json({ message: (error.issues ?? error) })
        return;
    }

    res.json({ message: 'User successfully updated.' })
}

userRouter.put("/", userRouterPut)

export default userRouter
