import express, { RequestHandler } from 'express'
import userRouter from './routers/user.js'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { getJwtSecret } from './utils/jwt.js'

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

initEnvVariables()

const app = express()
const appRouter = express.Router()
const port = process.env.API_PORT

app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const authMiddleware: RequestHandler = function (req, res, next) {
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

appRouter.get('/', authMiddleware, async (req, res, next) => {
    res.send({ code: 200, message: "SnippetsManager v1.0" })
})

appRouter.use(userRouter)
app.use('/v1/', appRouter)

app.listen(port, () => console.log(`Listening on port ${port}`))