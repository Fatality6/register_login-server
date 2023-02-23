import jwt from "jsonwebtoken"

export const checkAuth = (req, res, next) => {
    //после запроса клиента на адрес '/me' мы достаём из req.headers свойство authorization и при помощи
    //метода replace и регулярного выражения получаем закодированный токен в случае если пользователь
    //авторизован, и пустую строку если нет
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
    //если закодированный токен получен, то при помощи свойства verify раскодируем токен и помещаем в константу
    //decoded
    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //затем к req добавляем новое свойство userId содержащее реальный id пользователя
            req.userId = decoded.id
            //метод next завершает работу данного middleware и запускает следующий контроллер в очереди endpoint`a
            next()
        } catch (error) {
            return res.json({message: 'Нет доступа'})
        }
    } else {
        //если токен не получен, то возвращаем сообщение 'Нет доступа'
        return res.json({message: 'Нет доступа'})
    }
}