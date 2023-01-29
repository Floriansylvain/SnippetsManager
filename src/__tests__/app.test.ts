import { initServer } from '../app.js'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = initServer()
let jwtCookie: string | undefined

const testUserCredentials = {
    email: "a@a.com",
    password: "aaaaaaaaaa"
}

afterAll(async () => {
    await prisma.user.delete({
        where: { email: "a@a.com" }
    })
})

describe('GET /v1', () => {
    it('returns status code 200 and api version message', async () => {
        const res = await request(app)
            .get('/v1')

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/session/register', () => {
    it('returns status code 200 and a success message', async () => {
        const res = await request(app)
            .post('/v1/session/register')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(testUserCredentials))

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/session/login', () => {
    it('returns status code 200 and set httpOnly jwt token cookie', async () => {
        const res = await request(app)
            .post('/v1/session/login')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(testUserCredentials))

        const jwtRegEx = /^jwt=.*Path=\/.*HttpOnly.*Secure.*SameSite=Strict.*$/
        jwtCookie = res.get('Set-Cookie')
            ?.filter(cookie => cookie.match(jwtRegEx))[0]

        expect(res.statusCode).toEqual(200)
        expect(jwtCookie).not.toBe(undefined)
    })
})

describe('PUT /v1/user', () => {
    it('returns status code 200 and success message', async () => {
        const res = await request(app)
            .put('/v1/user')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                id: 1234,
                name: 'didier',
                pouet: 'alo'
            }))

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })

    it('returns status code 400 and error message', async () => {
        const res = await request(app)
            .put('/v1/user')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                picture_path: 424242
            }))

        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message')
    })
})
