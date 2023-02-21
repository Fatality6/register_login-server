import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

//Register user
export const register = async (req, res) => {
    try {
        // получаем данные от пользователя
        const { username, password, email, birthdate, gender } = req.body

        //ищем совпадения по username, email в БД
        const isUsed = await User.findOne({ username })
        const isEmail = await User.findOne({ email })

        //если находим возвращаем сообщение
        if (isUsed) {
            return res.json({
                message: 'Данный username уже занят'
            })
        }
        if (isEmail) {
            return res.json({
                message: 'Данный email уже используется'
            })
        }

        //если не находим, то хешируем пароль где salt это сложность хэша
        const salt = bcrypt.genSaltSync(10)

        //создаём хэш из пароля
        const hash = bcrypt.hashSync(password, salt)

        //создаём токен используя jsonwebtoken шифруя id из БД и используя ключ из .env
        //expiresIn:'30d' это время жизненного цикла токена
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )

        //если в запросе есть фото
        if (req.files) {
            //формируем имя файла из даты и имени
            let fileName = Date.now().toString() + username

            //получаем путь к данному файлу
            const __dirname = dirname(fileURLToPath(import.meta.url))

            //перемещаем фаил в папку uploads
            req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))

            //создаём экземпляр схемы User
            const newUser = new User({
                username,
                email,
                password: hash,
                birthdate,
                gender,
                userPhoto: fileName
            })

            //сохраняем экземпляр в БД
            await newUser.save()

            //возвращаем пользователю ответ
            res.json({
                token,
                newUser,
                message: 'Регистрация прошла успешно'
            })

        }

        // если фото нет
        // создаём новый инстанс схемы User, где вместо пароля используем хэш 
        const newUser = new User({
            username,
            email,
            password: hash,
            birthdate,
            gender,
            userPhoto: ''
        })

        //сохраняем нового пользователя в БД
        await newUser.save()
        //возвращаем пользователю ответ
        res.json({
            token,
            newUser,
            message: 'Регистрация прошла успешно'
        })

    } catch (error) {
        res.json({ message: 'Ошибка при создании пользователя' })
    }
}

