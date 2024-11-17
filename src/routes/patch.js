import { processUserRequest } from '../controllers/user-controller.js'

export default function patch(app) {
    app.patch('/users/:login', processUserRequest)
}
