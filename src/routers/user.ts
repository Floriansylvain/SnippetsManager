import { PrismaClient, User } from '@prisma/client'
import express, { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

const userRouter = express.Router()
const prisma = new PrismaClient()

function parseJwtUserId(jwtoken: string): number | undefined {
    const payload = jwt.decode(jwtoken)
    if (payload == undefined) {
        return undefined
    } else if (typeof payload == 'string') {
        return undefined
    }
    return payload.userId
}

async function updateUser(userId: number): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: {
        }
    })
}

const userRouterPut: RequestHandler = async (req, res) => {
    const userId = parseJwtUserId(req.cookies.jwt)
    if (userId === undefined) {
        res.status(400).json({
            message: 'Incorrect JWT payload.'
        })
        return;
    }

    await updateUser(userId)

    res.json({
        message: 'User successfully updated.'
    })
}

userRouter.put("/", userRouterPut)

export default userRouter
