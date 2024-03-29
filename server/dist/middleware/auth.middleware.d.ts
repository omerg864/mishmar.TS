import { NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { User } from '../user/user.model';
export declare class AuthMiddleware implements NestMiddleware {
    private readonly userModel;
    constructor(userModel: Model<User>);
    use(req: any, res: Response, next: NextFunction): Promise<void>;
}
export declare class SiteManagerMiddleware implements NestMiddleware {
    private readonly userModel;
    constructor(userModel: Model<User>);
    use(req: any, res: Response, next: NextFunction): Promise<void>;
}
export declare class ShiftManagerMiddleware implements NestMiddleware {
    private readonly userModel;
    constructor(userModel: Model<User>);
    use(req: any, res: Response, next: NextFunction): Promise<void>;
}
export declare class AdminManagerMiddleware implements NestMiddleware {
    private readonly userModel;
    constructor(userModel: Model<User>);
    use(req: any, res: Response, next: NextFunction): Promise<void>;
}
export declare const UserID: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
