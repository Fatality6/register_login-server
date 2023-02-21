import mongoose, { Schema } from "mongoose";

//Схема для создания нового пользователя
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        birthdate: { type: Date, required: true }, 
        gender: { type: String, required: true },
        userPhoto: { type: String, default: '' }
    }
)

export default mongoose.model('User', UserSchema)