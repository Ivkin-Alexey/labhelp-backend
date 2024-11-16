import { bot } from '../../index'
import { updateReagentApplicationPost, updateUserDataPost } from '../controllers/appPostsProcessing'
import { authenticateToken } from '../controllers/jwt'

export default function patch(app) {
  app.patch(
    '/reagents',
    authenticateToken,
    async (req, res) => await updateReagentApplicationPost(req, res, bot),
    )
    
    app.patch('/users/:login', async (req, res) => await updateUserDataPost(req, res, bot))
}
