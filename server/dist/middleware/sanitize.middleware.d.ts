import { Request, Response, NextFunction } from 'express';
declare const sanitizeMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default sanitizeMiddleware;
