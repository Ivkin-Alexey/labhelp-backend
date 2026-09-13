import { processUserRequest } from '../controllers/user-controller.js'
import { requireAdmin } from '../middlewaries/requireAdmin.js'

export default function patch(app) {
    // Тело PATCH уходит в prisma.User.update как есть, поэтому без проверки
    // прав любой вошедший пользователь мог дописать себе role: 'admin'.
    // Редактирование пользователей доступно только администраторам
    app.patch('/users/:login', requireAdmin, processUserRequest)
}
