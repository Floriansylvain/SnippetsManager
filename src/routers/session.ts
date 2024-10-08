import { PrismaClient, User } from "@prisma/client"
import express from "express"
import { RequestHandler } from "express-serve-static-core"
import { z } from "zod"
import { getJwtSecret } from "../utils/jwt.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

interface LoginData {
	email: string
	password: string
}

const sessionRouter = express.Router()
const prisma = new PrismaClient()

const LoginValidator = z.object({
	email: z.string().email(),
	password: z.string().min(4).max(20),
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
			name: "",
			picture_path: "",
			created_at: new Date(),
			updated_at: new Date(),
		},
	})
}

async function getUserByEmail(email: string): Promise<User | null> {
	return await prisma.user.findFirst({ where: { email } })
}

function parseLoginData(data: any): LoginData | undefined {
	try {
		return LoginValidator.parse(data)
	} catch {
		return undefined
	}
}

export const userRouterPostLogin: RequestHandler = async (req, res) => {
	const loginData = parseLoginData(req.body)
	if (loginData === undefined) {
		res.status(400).json({ message: "Incorrect credentials format." })
		return
	}

	const user = await getUserByEmail(loginData.email)
	if (!(await isUserValid(user, loginData))) {
		res.status(400).json({ message: "Incorrect credentials." })
		return
	}

	const jwtToken = jwt.sign({ userId: user?.id }, getJwtSecret(), { expiresIn: "2h" })
	res.cookie("jwt", jwtToken, {
		httpOnly: true,
		secure: true,
		expires: new Date(new Date().getTime() + 7200000),
		sameSite: "strict",
	}).json({ message: "Logged in! httpOnly cookie set." })
}

export const userRouterPostLogout: RequestHandler = async (req, res) => {
	res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "strict" }).json({
		message: "httpOnly cookie removed.",
	})
}

export const userRouterPostRegister: RequestHandler = async (req, res) => {
	const loginData = parseLoginData(req.body)
	if (loginData == undefined) {
		res.status(400).json({ message: "Incorrect credentials format." })
		return
	}

	if (await isUserEmailAlreadyUsed(loginData.email)) {
		res.status(400).json({ message: "Email already linked to an account." })
		return
	}

	const hashedPassword = await bcrypt.hash(loginData.password, 10)

	await createUser(loginData.email, hashedPassword)

	res.json({ message: "User successfully created!" })
}

sessionRouter.post("/login", userRouterPostLogin)
sessionRouter.post("/logout", userRouterPostLogout)
sessionRouter.post("/register", userRouterPostRegister)

export default sessionRouter
