import { initServer } from '../app.js'
import request from 'supertest'

const app = initServer()

describe('GET /v1', () => {
    it('returns status code 200 and api version message', async () => {
        const res = await request(app)
            .get('/v1')

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message')
    })
})

describe('POST /v1/login', () => {
    it('returns status code 200 and set httpOnly jwt token cookie', async () => {
        const res = await request(app)
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
                email: "a@a.com",
                password: "aaaaaaaaaa"
            }))

        const jwtRegEx = /^jwt=.*Path=\/.*HttpOnly.*Secure.*SameSite=Strict.*$/
        const jwtToken = res.get('Set-Cookie')
            .filter(cookie => cookie.match(jwtRegEx))

        expect(res.statusCode).toEqual(200)
        expect(jwtToken).not.toBe(undefined)
    })
})
