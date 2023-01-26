import { PrismaClient, User } from '@prisma/client'
import express from 'express'

import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../utils/jwt.js'

interface LoginData {
    email: string,
    password: string
}

const userRouter = express.Router()
const prisma = new PrismaClient()

const LoginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(20)
})

async function isUserValid(user: User | null, loginData: any): Promise<boolean> {
    if (user == undefined) return false
    return await bcrypt.compare(loginData.password, user.password)
}

async function isUserEmailAlreadyUsed(email: string): Promise<boolean> {
    const user = await prisma.user.findFirst({ where: { email } })
    return user != undefined
}

function parseLoginData(data: any): LoginData | undefined {
    try {
        const loginData: LoginData = LoginValidator.parse(data)
        return loginData
    } catch {
        return undefined
    }
}

userRouter.post("/login", async (req, res) => {
    const loginData = parseLoginData(req.body)
    if (loginData === undefined) {
        res.status(400).json({ message: 'Incorrect credentials format.' })
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            email: loginData.email
        }
    })

    if (await isUserValid(user, loginData) === false) {
        res.status(400).json({ message: 'Incorrect credentials.' })
        return;
    }

    const jwtToken = jwt.sign({}, getJwtSecret(), { expiresIn: "1h" })

    res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    }).json({ message: "Logged in! httpOnly cookie set." })
})

userRouter.post("/register", async (req, res) => {
    const loginData = parseLoginData(req.body)
    if (loginData == undefined) {
        res.status(400).json({ message: 'Incorrect credentials format.' })
        return;
    }

    if (await isUserEmailAlreadyUsed(loginData.email)) {
        res.status(400).json({ message: 'Email already linked to an account.' })
        return;
    }

    const hashedPassword = await bcrypt.hash(loginData.password, 10)

    await prisma.user.create({
        data: {
            email: loginData.email,
            password: hashedPassword,
            name: '',
            picture_path: '',
            created_at: new Date(),
            updated_at: new Date()
        },
    })

    res.json({ message: 'User successfully created!' })
})

export default userRouter
