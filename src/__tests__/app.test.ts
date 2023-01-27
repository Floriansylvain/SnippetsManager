import { initServer } from '../app.js'
import request from 'supertest'
import { User } from '.prisma/client'

const app = initServer()
let jwtCookie: string | undefined

describe('GET /v1', () => {
    it('returns status code 200 and api version message', async () => {
        const res = await request(app)
            .get('/v1')

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/session/login', () => {
    it('returns status code 200 and set httpOnly jwt token cookie', async () => {
        const res = await request(app)
            .post('/v1/session/login')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
                email: "a@a.com",
                password: "aaaaaaaaaa"
            }))

        const jwtRegEx = /^jwt=.*Path=\/.*HttpOnly.*Secure.*SameSite=Strict.*$/
        jwtCookie = res.get('Set-Cookie')
            ?.filter(cookie => cookie.match(jwtRegEx))[0]

        // jwtToken = jwtCookie.match('(^|;)\\s*jwt\\s*=\\s*([^;]+)')?.pop() || ''

        expect(res.statusCode).toEqual(200)
        expect(jwtCookie).not.toBe(undefined)
    })
})


describe('PUT /v1/user', () => {
    it('returns status code 200', async () => {
        const res = await request(app)
            .put('/v1/user')
            .set('Content-Type', 'application/json')
            .set('Cookie', jwtCookie as string)
            .send(JSON.stringify({
                name: 'didier'
            }))

        expect(res.statusCode).toEqual(200)
    })

    it('returns status code 400 and an error message', async () => {
        const res = await request(app)
            .put('/v1/user')
            .set('Content-Type', 'application/json')
            .set('Cookie', 'jwt=23897yr0287yf.12423fv.23f4325')
            .send(JSON.stringify({
                name: 'didier'
            }))

        expect(res.statusCode).toEqual(400)
    })
})