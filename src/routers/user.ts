import { PrismaClient, User } from '@prisma/client'
import express, { RequestHandler } from 'express'

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

async function createUser(email: string, password: string) {
    await prisma.user.create({
        data: {
            email: email,
            password: password,
            name: '',
            picture_path: '',
            created_at: new Date(),
            updated_at: new Date()
        },
    })
}

async function getUser(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
        where: {
            email: email
        }
    })
}

function parseLoginData(data: any): LoginData | undefined {
    try {
        const loginData: LoginData = LoginValidator.parse(data)
        return loginData
    } catch {
        return undefined
    }
}

const userRouterPostLogin: RequestHandler = async (req, res) => {
    const loginData = parseLoginData(req.body)
    if (loginData === undefined) {
        res.status(400).json({ message: 'Incorrect credentials format.' })
        return;
    }

    const user = await getUser(loginData.email)
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
}

const userRouterPostRegister: RequestHandler = async (req, res) => {
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

    createUser(loginData.email, hashedPassword)

    res.json({ message: 'User successfully created!' })
}

userRouter.post("/login", userRouterPostLogin)
userRouter.post("/register", userRouterPostRegister)

export default userRouter
