import User from '../models/User.js'

const isEmailExist = async (email) => {
    const user = await User.findOne({ email })
    if (!user) { return false }
    return true
}

const isEmailExistWithUserId = async (id, email) => {
    const user = await User.findOne({ email, _id: {$ne: id} })
    if (!user) { return false }
    return true
}

export {isEmailExist, isEmailExistWithUserId}