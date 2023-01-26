import express, { RequestHandler } from 'express'
import userRouter from './routers/user.js'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { getJwtSecret } from './utils/jwt.js'

const app = express()
const appRouter = express.Router()

const authMiddleware: RequestHandler = (req, res, next) => {
    const token = req.cookies.jwt
    if (token == undefined) {
        res.status(400).send({ message: 'Cannot find jwt auth cookie.' })
        return;
    }

    try {
        jwt.verify(token, getJwtSecret())
    } catch (error) {
        res.status(400).send({ message: 'Incorrect JWT.', error })
        return;
    }

    next()
}

const appRouterGet: RequestHandler = (req, res) => {
    res.send({ code: 200, message: "SnippetsManager v1.0" })
}

function initEnvVariables() {
    dotenv.config()
    const varsToCheck = ['API_PORT', 'FRONT_ORIGIN']

    varsToCheck.forEach(varName => {
        const variable = process.env[varName]

        if (variable == undefined || variable === '') {
            console.error(`Missing '${varName}' in .env`)
            process.exit()
        }
    })
}

function startServer(): void {
    initEnvVariables()

    app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }))
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    appRouter.get('/', authMiddleware, appRouterGet)

    appRouter.use(userRouter)
    app.use('/v1/', appRouter)

    app.listen(process.env.API_PORT, () => console.log(`Listening on port ${process.env.API_PORT}`))
}

startServer()