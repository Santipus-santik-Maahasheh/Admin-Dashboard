import exp from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import {connectDB,disconnectDB} from './config/dbconfig'
import { authRouter } from './routes/Auth'
import { adminRouter } from './routes/Admin'
import { empRouter } from './routes/Employee'
import { swaggerSpec } from './config/swagger'
import morgan from 'morgan'

const app=exp()
app.use(morgan('dev'))
app.use(cors({ origin: true, credentials: true }))
app.use(exp.json())
app.use(cookieParser())

// API documentation (Swagger UI at /api-docs, raw spec at /api-docs.json)
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/auth',authRouter)
app.use('/admin',adminRouter)
app.use('/employee',empRouter)

let server:any;
const PORT=process.env.port!


const startServer = async () => {
  try {
    await connectDB();  
    server = app.listen(PORT, () => {
      console.log(`⚡ Server listening on port ${PORT} : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Stopping server...`);

  if (server) {
    server.close(async () => {
      console.log('📴 HTTP server stopped.');
      await disconnectDB();
      console.log('👋 Goodbye!');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Execute
startServer();