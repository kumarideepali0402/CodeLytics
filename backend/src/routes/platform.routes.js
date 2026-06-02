import express from 'express';
import { createPlatform, getAllPlatforms } from '../controllers/platform.controller.js';
import { authDynamic, authCollege } from '../middlewares/auth.middleware.js';

const platformRouter = express.Router();

platformRouter.post('/create', authDynamic, authCollege, createPlatform);
platformRouter.get('/all', authDynamic, getAllPlatforms);


export default platformRouter;
