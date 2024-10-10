import express, { RequestHandler } from "express"

const frontRouter = express.Router()

const getAll: RequestHandler = async (req, res) => {
	try {
		res.sendFile("snippets-manager-front/dist/index.html")
	} catch (error) {
		res.status(500).send("Internal Server Error")
	}
}

frontRouter.use(express.static("snippets-manager-front/dist"))
frontRouter.get("/", getAll)

export default frontRouter
