import { Router } from "express"
import { register } from "../controllers/auth.js"

//создаём endpointы и при выполнении на них запроса вызываем нужный котроллер или midlware
const router = new Router()

//Register
//http://localhost:8080/api/register
router.post('/register', register)

export default router