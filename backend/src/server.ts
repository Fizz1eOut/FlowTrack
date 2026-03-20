import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { createBot } from './bot';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'FlowTrack API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

const bot = createBot();
bot.start();
console.log('🤖 FlowTrack bot started');
