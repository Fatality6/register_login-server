import User from "../models/User.js"

//Найти всех users
export const getAllUsers = async( req, res ) => {
  try {
      //ищем все users и сортируем их по дате создания
      const users = await User.find()
      //если users нет возвращаем сообщение
      if(!users) return res.json({message: 'users нет'})
      //если users есть возвращаем users
      res.json(users)
  } catch (error) {
      res.json({message: 'Что-то пошло не так'})
  }
}