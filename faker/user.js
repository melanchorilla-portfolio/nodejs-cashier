import User from '../models/User.js';
import { faker } from '@faker-js/faker';

const run = async (limit) => {
    try {
        var data = []
        for (var i = 0; i < limit; i++) {
            data.push({
                fullname: faker.person.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            })
        }

        const fakerData = await User.insertMany(data)
        console.log(fakerData)
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit()
    }


}

export { run }