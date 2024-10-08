import * as dotenv from "dotenv"
import express, { RequestHandler } from "express"
import jwt from "jsonwebtoken"
import cors from "cors"
import cookieParser from "cookie-parser"

import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./assets/swaggerSpec.js"

import { getJwtSecret } from "./utils/jwt.js"

import frontRouter from "./routers/front.js"
import userRouter from "./routers/user.js"
import sessionRouter from "./routers/session.js"
import categoryRouter from "./routers/category.js"
import snippetRouter from "./routers/snippet.js"

const authMiddleware: RequestHandler = (req, res, next) => {
	const token = req.cookies.jwt
	if (token == undefined) {
		res.status(400).send({ message: "Cannot find jwt auth cookie." })
		return
	}

	try {
		jwt.verify(token, getJwtSecret())
	} catch (error) {
		res.status(400).send({ message: "Incorrect JWT.", error })
		return
	}

	next()
}

const appRouterGet: RequestHandler = (req, res) => {
	res.send({ code: 200, message: "SnippetsManager v1.0" })
}

function initEnvVariables(): void {
	dotenv.config()
	const varsToCheck = ["API_PORT", "FRONT_ORIGIN"]

	varsToCheck.forEach((varName) => {
		const variable = process.env[varName]

		if (variable == undefined || variable === "") {
			console.error(`Missing '${varName}' in .env`)
			process.exit()
		}
	})
}

export function initServer(): express.Express {
	initEnvVariables()

	const api = express()
	const apiRouter = express.Router()

	api.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }))
	api.use(cookieParser())
	api.use(express.json())
	api.use(express.urlencoded({ extended: false }))

	apiRouter.get("/", appRouterGet)

	apiRouter.use("/session/", sessionRouter)
	apiRouter.use("/user/", authMiddleware, userRouter)
	apiRouter.use("/category/", authMiddleware, categoryRouter)
	apiRouter.use("/snippet/", authMiddleware, snippetRouter)

	api.use("/", frontRouter)
	api.use("/v1/", apiRouter)
	api.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

	return api
}

export function startServer(app: express.Express): void {
	app.listen(process.env.API_PORT, () => console.log(`Listening on port ${process.env.API_PORT}`))
}
