import { Router } from "express"
import { register, login, getMe } from "../controllers/auth.js"
import { checkAuth } from "../utils/chechAuth.js"

//создаём endpointы и при выполнении на них запроса вызываем нужный котроллер или midlware
const router = new Router()

//Register
//http://localhost:8080/api/register
router.post('/register', register)

//Login
router.post('/login', login)

//Get me
router.get('/me',checkAuth, getMe)

export default router