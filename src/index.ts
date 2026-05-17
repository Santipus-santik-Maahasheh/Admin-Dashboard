import exp from 'express'
import cors from 'cors'
import { createEmployee } from './controller/EmployeeController'
import {connectDB,disconnectDB} from './config/dbconfig'

const app=exp()
app.use(cors())
app.use(exp.json())
app.post('/Register',createEmployee)


let server:any;
const PORT=process.env.port!


const startServer = async () => {
  try {
    await connectDB();  
    server = app.listen(PORT, () => {
      console.log(`⚡ Server listening on port ${PORT}`);
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