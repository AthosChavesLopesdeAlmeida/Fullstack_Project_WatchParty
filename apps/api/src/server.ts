import "dotenv/config";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import friendshipRoutes from './routes/friendship.routes'
import videoRoutes from './routes/video.routes'

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

// Rotas de autenticação
app.use('/api', authRoutes)

// Rotas relacionadas às amizades
app.use('/api', friendshipRoutes)

// Rotas relacionadas aos vídeos
app.use('/api', videoRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`App running on port ${PORT}`))

