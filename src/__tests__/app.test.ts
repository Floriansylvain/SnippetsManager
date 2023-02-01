import { initServer } from '../app.js'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const app = initServer()
let jwtCookie: string | undefined

const testUserCredentials = {
    email: "a@a.com",
    password: "aaaaaaaaaa"
}

let category_id: number
let snippet_id: number

// Mettre a jour les routes Category en stockant les IDs sur GET pour reutiliser sur DELETE

beforeAll(async () => {
    await prisma.user.create({
        data: {
            email: testUserCredentials.email,
            password: await bcrypt.hash(testUserCredentials.password, 10),
            name: '',
            picture_path: ''
        }
    })
})

afterAll(async () => {
    await prisma.user.delete({
        where: { email: testUserCredentials.email }
    })
    await prisma.user.delete({
        where: { email: 'b@b.com' }
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
            .send(JSON.stringify({
                email: 'b@b.com',
                password: 'bbbbbbbbbbb'
            }))

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })

    it('returns status code 400 and an error message', async () => {
        const res = await request(app)
            .post('/v1/session/register')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(testUserCredentials))

        expect(res.statusCode).toEqual(400)
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

    it('returns status code 400 and credentials error message', async () => {
        const res = await request(app)
            .post('/v1/session/login')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
                email: 'rip bozo',
                password: 'rip bozo'
            }))

        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/category', () => {
    it('returns status code 200 and success message', async () => {
        const res = await request(app)
            .post('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                name: 'VueJS Composition API'
            }))

        expect(res.status).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })

    it('returns status code 400 and error message', async () => {
        const res = await request(app)
            .post('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                pouet: 'VueJS Composition API'
            }))

        expect(res.status).toEqual(400)
        expect(res.body).toHaveProperty('message')
    })
})

describe('GET /v1/category', () => {
    it('returns status code 200 and the categories', async () => {
        const res = await request(app)
            .get('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)

        category_id = res.body.categories[0].id

        expect(res.status).toEqual(200)
        expect(res.body.categories[0].name).toEqual('VueJS Composition API')
    })
})

describe('PUT /v1/category', () => {
    it('returns status code 200 and a success message', async () => {
        const res = await request(app)
            .put('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                id: category_id,
                name: 'VueJS v3 Composition API'
            }))

        expect(res.status).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })

    it('returns status code 400 and an error message', async () => {
        const res = await request(app)
            .put('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                id: 2,
                pouet: 'salut'
            }))

        expect(res.status).toEqual(400)
        expect(res.body).toHaveProperty('message')
    })
})

describe('DELETE /v1/category', () => {
    it('returns status code 200 and a success message', async () => {
        const res = await request(app)
            .delete('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                id: category_id
            }))

        expect(res.status).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })

    it('returns status code 400 and an error message', async () => {
        const res = await request(app)
            .delete('/v1/category')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                blablabla: 'pouet'
            }))

        expect(res.status).toEqual(400)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/snippet', () => {
    it('returns status code 200 and the snippets', async () => {
        const res = await request(app)
            .post('/v1/snippet')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                title: 'Vue3 CompAPI TS script-template-style',
                code: `<script setup lang="ts">
                    </script>

                    <template>
                    </template>

                    <style scoped>
                    </style>`,
                language: 'vue'
            }))

        expect(res.status).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })
})

describe('GET /v1/snippet', () => {
    it('returns status code 200 and success message', async () => {
        const res = await request(app)
            .get('/v1/snippet')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)

        snippet_id = res.body.snippets[0].id

        expect(res.status).toEqual(200)
        expect(res.body.snippets[0].title).toEqual('Vue3 CompAPI TS script-template-style')
    })
})

describe('DELETE /v1/snippet', () => {
    it('returns status code 200 and success message', async () => {
        const res = await request(app)
            .delete('/v1/snippet')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                id: snippet_id
            }))

        expect(res.status).toEqual(200)
        expect(res.body).toHaveProperty('message')
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
