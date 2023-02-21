import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoute from './routes/auth.js'
import fileUpload from 'express-fileupload'


//создаём приложение express
const app = express()
//настройки mongoose
mongoose.set('strictQuery', false)
//подключаем пакет dotenv
dotenv.config()

// Constants
//с помощью dotenv данные берутся из файла .env
const PORT = process.env.PORT
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME 

// MiddleWare

//cors разрешает браузеру делать запросы с других портов
app.use(cors())
// встроенный посредник, разбирающий входящие запросы в объект в формате JSON.
app.use(express.json())
//middleware для обработки файлов
app.use(fileUpload())
//указываем папку для статических файлов
app.use(express.static('uploads'))


// Routes
app.use('/api/auth', authRoute)

//объявляем асинхронную функцию start, которая будет запускать приложение express
async function start() {
    try {
        //с помощью метода mongoose.connect подключаемся к БД и ожидаем ответ
        await mongoose.connect(
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.xmqljvd.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
        )

        //затем запускаем приложение на заданном порту
        app.listen(`${PORT}`, ()=>console.log(`Server has been started on port:${PORT}`))

    } catch (error) {
        console.log(error)
    }
}

//запускаем функцию start
start()