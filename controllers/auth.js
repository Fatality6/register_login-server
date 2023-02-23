import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import sharp from 'sharp'

//Register user
export const register = async (req, res) => {
  try {
    // получаем данные от пользователя
    const { username, password, email, birthdate, gender, image } = req.body
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

    //если в запросе есть фото
    if (req.files) {
      // формируем имя файла из даты и имени
      let fileName = Date.now().toString() + req.files.image.name;
      //получение абсолютного пути
      const __dirname = dirname(fileURLToPath(import.meta.url));
      // получаем путь к данному файлу
      const inputFile = path.join(__dirname, '..', 'uploads', fileName);
      const outputFile = path.join(__dirname, '..', 'uploads', 'resized_' + fileName);

      // перемещаем файл в папку uploads
      req.files.image.mv(inputFile, (err) => {
        if (err) {
          console.error(err);
        } else {
          // изменяем размер изображения до 200x200 и сохраняем его в новый файл
          sharp(inputFile)
            .resize(200, 200)
            .toFile(outputFile, (err, info) => {
              if (err) {
                console.error(err);
              } else {

                //удаляем исходный файл
                fs.unlink(inputFile, (err) => {
                  if (err) {
                    console.error(err);
                  }
                })

                //переносим обработанное изображение в нужную директорию и удаляем временный файл
                fs.rename(outputFile, path.join(__dirname, '..', 'uploads', 'resized_' + fileName), (err) => {
                  if (err) {
                    console.error(err)
                  }
                })

                // создаём экземпляр схемы User
                const newUser = new User({
                  username,
                  email,
                  password: hash,
                  birthdate,
                  gender,
                  userPhoto: 'resized_' + fileName,
                });

                //создаём токен используя jsonwebtoken шифруя id из БД и используя ключ из .env
                //expiresIn:'30d' это время жизненного цикла токена
                const token = jwt.sign(
                  { id: newUser._id },
                  process.env.JWT_SECRET,
                  { expiresIn: '30d' }
                )

                //сохраняем экземпляр в БД
                newUser.save()



                //возвращаем пользователю ответ
                return res.json({
                  token,
                  newUser,
                  message: 'Регистрация прошла успешно'
                })

              }
            })
        }
      })
    } else {

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

      //создаём токен используя jsonwebtoken шифруя id из БД и используя ключ из .env
      //expiresIn:'30d' это время жизненного цикла токена
      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      )

      //сохраняем нового пользователя в БД
      await newUser.save()

      //возвращаем пользователю ответ
      res.json({
        token,
        newUser,
        message: 'Регистрация прошла успешно'
      })
    }

  } catch (error) {
    console.log(error)
    res.json({ message: 'Ошибка при создании пользователя' })
  }
}

//Login user
export const login = async (req, res) => {
  try {
    // получаем username и password от пользователя
    const { email, password } = req.body

    //ищем совпадения по username в БД
    const user = await User.findOne({ email })

    //если совпадений нет, то возвращаем ответ 'Такого пользователя не существует'
    if (!user) {
      return res.json({ message: 'Такого пользователя не существует' })
    }

    //если пользователь найден, то сравниваем пароль и хэш из БД
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    //если совпадения по паролю нет, то возвращаем ответ 'Неверный пароль'
    if (!isPasswordCorrect) {
      res.json({ message: 'Неверный пароль' })
    }

    //если пароль верный, то создаём токен используя jsonwebtoken шифруя id из БД и используя ключ из .env
    //expiresIn:'30d' это время жизненного цикла токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    //возвращаем ответ пользователю, в котором есть токен, объект user и сообщение
    res.json({
      token, user, message: 'Вы вошли в систему'
    })

  } catch (error) {
    res.json({ message: 'Ошибка авторизации' })
  }
}

//Get me
export const getMe = async (req, res) => {
  try {
    //находим пользователя в БД по id
    const user = await User.findById(req.userId)

    //если совпадений нет, то возвращаем ответ 'Такого пользователя не существует'
    if (!user) {
      res.json({ message: 'Такого пользователя не существует' })
    }

    //если пользователь найден, то создаём токен используя jsonwebtoken шифруя id из БД и используя ключ из .env
    //expiresIn:'30d' это время жизненного цикла токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )
    //возвращаем клиенту объект user и вновь закодированный token
    res.json({
      user,
      token
    })
  } catch (error) {
    res.json({ message: 'Нет доступа.' })
  }
}