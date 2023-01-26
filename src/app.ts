import { PrismaClient } from '@prisma/client'
import express from 'express'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const port = process.env.API_PORT

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/v1/', async (req, res, next) => {
    res.send({ code: 200, message: "SnippetsManager v1.0" })
})

app.listen(port, () => console.log(`Listening on port ${port}`))