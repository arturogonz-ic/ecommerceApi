import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './shared/error/errorHandler.js';
import catalogRouter from './catalog/router/index.js';
import userAuthRouter from './user-auth/router/index.js';
import adminAuthRouter from './admin-auth/router/index.js';
import ordersRouter from './orders/router/index.js';
import categoriesRouter from './categories/router/index.js';
import dashboardRouter from './dashboard/router/index.js';
import suggestionsRouter from './suggestions/router/index.js';

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://arturogonz-ic.github.io']
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use('/catalog', catalogRouter);
app.use('/user-auth', userAuthRouter);
app.use('/admin-auth', adminAuthRouter);
app.use('/orders', ordersRouter);
app.use('/categories', categoriesRouter);
app.use('/admin/dashboard', dashboardRouter);
app.use('/suggestions', suggestionsRouter);

app.use(errorHandler);

export default app;
