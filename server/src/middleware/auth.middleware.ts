import { UnauthorizedException } from '@nestjs/common';
import {
	createParamDecorator,
	ExecutionContext,
	NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.model';

const checkUser = async (
	headers: { authorization: string },
	userModel: Model<User>
): Promise<User> => {
	if (!headers.authorization) {
		throw new UnauthorizedException('לא נמצא טוקן הזדהות');
	}
	const token = headers.authorization.split(' ')[1];
	if (!token) {
		throw new UnauthorizedException('לא נמצא טוקן הזדהות');
	}
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const userId = payload['id'];
		if (!userId) {
			throw new UnauthorizedException('טוקן הזדהות לא תקין');
		}
		const userFound = await userModel.findById(userId);
		if (!userFound) {
			throw new NotFoundException('משתמש לא נמצא');
		}
		return userFound;
	} catch (err) {
		throw new UnauthorizedException('טוקן הזדהות לא תקין');
	}
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

	async use(req: any, res: Response, next: NextFunction) {
		const user: User = await checkUser(
			req.headers,
			this.userModel
		);
		req.userId = user._id.toString();
		next();
	}
}

@Injectable()
export class SiteManagerMiddleware implements NestMiddleware {
	constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

	async use(req: any, res: Response, next: NextFunction) {
		const userFound: User = await checkUser(
			req.headers,
			this.userModel
		);
		if (
			!userFound.role.includes('SITE_MANAGER') &&
			!userFound.role.includes('ADMIN')
		) {
			throw new UnauthorizedException('רק מנהל האתר יכול לעשות בקשה זאת');
		}
		req.userId = userFound._id.toString();
		next();
	}
}

@Injectable()
export class ShiftManagerMiddleware implements NestMiddleware {
	constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

	async use(req: any, res: Response, next: NextFunction) {
		const userFound: User = await checkUser(
			req.headers,
			this.userModel
		);
		if (
			!userFound.role.includes('SHIFT_MANAGER') &&
			!userFound.role.includes('ADMIN')
		) {
			throw new UnauthorizedException('רק אחמ"ש יכול לעשות בקשה זאת');
		}
		req.userId = userFound._id.toString();
		next();
	}
}

@Injectable()
export class AdminManagerMiddleware implements NestMiddleware {
	constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

	async use(req: any, res: Response, next: NextFunction) {
		const userFound: User = await checkUser(
			req.headers,
			this.userModel
		);
		if (!userFound.role.includes('ADMIN')) {
			throw new UnauthorizedException('רק אדמין יכול לעשות בקשה זאת');
		}
		req.userId = userFound._id.toString();
		next();
	}
}

export const UserID = createParamDecorator<string>(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.userId; // extract token from request
	}
);
