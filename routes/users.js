import { Router } from "express"
import { getAllUsers } from "../controllers/users.js"
// import { checkAuth } from "../utils/chechAuth.js"

//создаём endpointы и при выполнении на них запроса вызываем нужный котроллер или midlware
const router = new Router()

//Найти все посты
//http://localhost:8080/api/users
router.get('/', getAllUsers)

export default router