import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`App running on port ${PORT}`))

