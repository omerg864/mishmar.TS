import { User } from './user.model';
import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { Settings } from 'src/settings/settings.model';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<User>, @InjectModel('Settings') private readonly settingsModel: Model<Settings>) {}

    generateToken(id: string) : string {
        return jwt.sign({ id }, "ABC", { expiresIn: '30d' });
    }


    async login(username: string, password: string) {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Incorrect password');
        }
        const token = this.generateToken(user.id);
        delete user["_doc"].password;
        return { user: {...user["_doc"]}, token };
    }

    async register(user: User, pin_code: string) {
        let userFound = await this.userModel.findOne( { email: { $regex : new RegExp(user.username, "i") }});
        if (userFound) {
            throw new ConflictException('username already in use');
        }
        userFound = await this.userModel.findOne({ email: { $regex : new RegExp(user.email, "i") } })
        if (userFound) {
            throw new ConflictException('email already in use');
        }
        let settings = await this.settingsModel.findOne();
        if (!settings) {
            settings = new this.settingsModel();
            await settings.save();
        }
        if (settings.pin_code !== pin_code) {
            throw new UnauthorizedException('Pin code incorrect');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        const newUser = await this.userModel.create({ ...user, password: hashedPassword });
        return {
            message: "Success"
        }
    }

    // TODO: Add security to role update request
    async updateUser(user: User, userId: string) {
        let userObj = {...user}
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            userObj["password"] = hashedPassword;
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, userObj, { new: true });
        return updatedUser
    }

    async deleteUser(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await user.delete();
        return user.id.toString();
    }

    async getAll(){
        const users = await this.userModel.find();
        return users;
    }

    async getUser(id: string): Promise<User> {
        const user = await this.userModel.findById(id).select('-password');
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async authUser(id: string): Promise<{user: boolean, manager: boolean}> {
        const user = await this.userModel.findById(id);
        let manager = false;
        if (user.role.includes('ADMIN') || user.role.includes('SITE_MANAGER')) {
            manager = true;
        }
        return {
            user: true,
            manager
        };
    }

}
