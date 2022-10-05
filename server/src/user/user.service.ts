import { User } from './user.model';
import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

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
        return { ...user["_doc"], token };
    }

    async register(user: User) {
        let userFound = await this.userModel.findOne( { email: { $regex : new RegExp(user.username, "i") }});
        if (userFound) {
            throw new ConflictException('username already in use');
        }
        userFound = await this.userModel.findOne({ email: { $regex : new RegExp(user.email, "i") } })
        if (userFound) {
            throw new ConflictException('email already in use');
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

}
