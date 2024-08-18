import { User } from './user.model';
import {
	Injectable,
	NotFoundException,
	ConflictException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { Settings } from '../settings/settings.model';
import { sendMail } from '../functions/functions';
import * as crypto from 'crypto';
import { email_regex } from '../types/regularExpressions';
import { googleAuthClient } from '../functions/functions';
import axios from 'axios';
import { PdfReader } from 'pdfreader';

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('Settings') private readonly settingsModel: Model<Settings>
	) {}

	generateToken(id: string): string {
		return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
	}

	async login(
		username: string,
		password: string
	): Promise<{ user: User; token: string }> {
		const user = await this.userModel
			.findOne({ username })
			.select('-reset_token');
		if (!user) {
			throw new NotFoundException('משתמש לא נמצא');
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new UnauthorizedException('סיסמא לא נכונה');
		}
		const token = this.generateToken(user.id);
		delete user['_doc'].password;
		return { user: { ...user['_doc'] }, token };
	}

	async google(code: string): Promise<{ user: User; token: string }> {
		if (!code) {
			throw new UnauthorizedException('Invalid code');
		}
		const googleRes = await googleAuthClient.getToken(code);

		googleAuthClient.setCredentials(googleRes.tokens);

		const userRes = await axios.get(
			`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
		);
		if (!userRes.data.email) {
			throw new UnauthorizedException('Invalid email');
		}
		const user = await this.userModel.findOne({
			email: { $regex: new RegExp(`^${userRes.data.email}$`, 'i') },
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const token = this.generateToken(user.id);
		delete user['_doc'].password;
		return { user: { ...user['_doc'] }, token };
	}

	async register(user: User, pin_code: string): Promise<{ message: string }> {
		if (user.username.includes('$')) {
			throw new ConflictException('שם משתמש לא יכול להכיל $');
		}
		let userFound = await this.userModel.findOne({
			username: { $regex: new RegExp(user.username, 'i') },
		});
		if (userFound) {
			throw new ConflictException('שם משתמש בשימוש');
		}
		if (!user.email || !email_regex.test(user.email)) {
			throw new ConflictException('אימייל לא תקין');
		}
		userFound = await this.userModel.findOne({
			email: { $regex: new RegExp(user.email, 'i') },
		});
		if (userFound) {
			throw new ConflictException('אימייל בשימוש');
		}
		let settings = await this.settingsModel.findOne();
		if (!settings) {
			settings = new this.settingsModel();
			await settings.save();
		}
		if (settings.pin_code !== pin_code) {
			throw new UnauthorizedException('קוד הרשמה לא תקין');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(user.password, salt);
		const newUser = await this.userModel.create({
			...user,
			password: hashedPassword,
		});
		return {
			message: 'Success',
		};
	}

	async updateManyUsers(users: User[]): Promise<User[]> {
		const users_temp: User[] = [];
		for (let i = 0; i < users.length; i++) {
			const userObj = { ...users[i] };
			if (userObj.password) {
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(
					userObj.password,
					salt
				);
				userObj.password = hashedPassword;
			}
			const updatedUser = await this.userModel
				.findByIdAndUpdate(userObj._id, userObj, { new: true })
				.select(['-password', '-reset_token']);
			users_temp.push(updatedUser);
		}
		return users_temp;
	}

	async forgotPasswordEmail(
		email: string
	): Promise<{ error?: Error; response?: string }> {
		if (!email || !email_regex.test(email)) {
			throw new ConflictException('אימייל לא תקין');
		}
		const userFound = await this.userModel.findOne({
			email: { $regex: new RegExp(email, 'i') },
		});
		if (!userFound) {
			throw new NotFoundException(`משתמש עם אימייל ${email} לא נמצא`);
		}
		let generatedToken = crypto.randomBytes(26).toString('hex');
		while (await this.userModel.findOne({ reset_token: generatedToken })) {
			generatedToken = crypto.randomBytes(26).toString('hex');
		}
		userFound.reset_token = generatedToken;
		await userFound.save();
		return sendMail(
			email,
			'איפוס סיסמה למשתמש',
			`כדי לאפס סיסמה נא ללכת לכתובת:\n ${process.env.SITE_ADDRESS}/password/reset/${generatedToken}`
		);
	}

	async resetTokenPassword(
		reset_token: string,
		password: string
	): Promise<{ success: boolean }> {
		const userFound = await this.userModel.findOne({ reset_token });
		if (!userFound) {
			throw new NotFoundException(`טוקן איפוס לא תקין`);
		}
		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			userFound.password = hashedPassword;
			let generatedToken = crypto.randomBytes(26).toString('hex');
			while (
				await this.userModel.findOne({ reset_token: generatedToken })
			) {
				generatedToken = crypto.randomBytes(26).toString('hex');
			}
			userFound.reset_token = generatedToken;
			await userFound.save();
			return {
				success: true,
			};
		} else {
			throw new ConflictException('לא הוזנה סיסמה');
		}
	}

	async resetTokenCheck(reset_token: string): Promise<{ success: boolean }> {
		const userFound = await this.userModel.findOne({ reset_token });
		if (!userFound) {
			throw new NotFoundException(`טוקן איפוס לא תקין`);
		}
		return {
			success: true,
		};
	}

	async updateUser(user: User, userId: string): Promise<User> {
		const userObj = { ...user };
		if (userObj.role) {
			delete userObj.role;
		}
		if (userObj._id) {
			delete userObj._id;
		}
		if (user.password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(user.password, salt);
			userObj['password'] = hashedPassword;
		}
		const updatedUser = await this.userModel
			.findByIdAndUpdate(userId, userObj, { new: true })
			.select(['-password', '-reset_token']);
		return updatedUser;
	}

	async deleteUser(userId: string): Promise<{ id: string }> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new NotFoundException('משתמש לא נמצא');
		}
		await user.delete();
		return { id: user.id.toString() };
	}

	async getAll(): Promise<User[]> {
		const users = await this.userModel
			.find({ username: { $ne: 'admin' } })
			.select(['-password', '-reset_token']);
		return users;
	}

	async getUser(id: string): Promise<User> {
		const user = await this.userModel
			.findById(id)
			.select(['-password', '-reset_token']);
		if (!user) {
			throw new NotFoundException('משתמש לא נמצא');
		}
		return user;
	}

	async getPayData(userId: string) {
		const settings = await this.settingsModel.findOne();
		const user = await this.userModel.findById(userId);
		const payData: {
			travel: number;
			extra_travel: number;
			small_eco: number;
			big_eco: number;
			extra_eco: number;
			pay: number;
			s_travel: number;
			recuperation: number;
			max_travel: number;
		} = {
			pay: settings.base_pay,
			travel: settings.travel,
			extra_travel: settings.extra_travel,
			small_eco: settings.small_eco,
			big_eco: settings.big_eco,
			extra_eco: settings.extra_eco,
			s_travel: settings.s_travel,
			recuperation: settings.recuperation,
			max_travel: settings.max_travel
		};
		if (settings.officer === user.nickname) {
			payData.pay = settings.base_pay3;
		} else {
			if (user.role.includes('SHIFT_MANAGER')) {
				payData.pay = settings.base_pay2;
			}
		}
		return { data: payData };
	}

	readPdf = (buffer: Buffer): Promise<string[]> => {
		const lines = [];
		return new Promise((resolve, reject) => {
			new PdfReader().parseBuffer(buffer, (err, item: {text: string, y: number}) => {
				if (err) {
				  console.error("error:", err);
				  reject(err);
				} else if (!item) {
				  console.warn("end of buffer");
				  // Convert object with y-coordinates to an array and sort by y-coordinate
				  const sortedLines = Object.keys(lines)
					.sort((a, b) => parseFloat(a) - parseFloat(b))
					.map((y) => lines[y].join(''));
				  resolve(sortedLines); // Resolve with the complete lines
				} else if (item.text !== undefined) {
				  // Use the y-coordinate to group text items
				  const y = item.y;
				  if (!lines[y]) {
					lines[y] = [];
				  }
				  lines[y].push(item.text);
				}
			  });
		});
	};

	isValidNumber(str: string) {
		const regex = /^-?\d+(\.\d+)?$/;
		return regex.test(str);
	}

	async ReportData(files: Express.Multer.File[]) {
		// pass
		const fullRows = await this.readPdf(files[0].buffer);
		const indexAfter = fullRows.findIndex((row) => row.includes("ימוכיס"));
		const lineFound = fullRows[indexAfter - 1];
		const linesSplit = lineFound.split(" ")
		let data = [];
		let dataMissing = 0;
		for(let i = 0; i < linesSplit.length; i++) {
			if (linesSplit[i].length === 0) {
				dataMissing++;
			}
			if (dataMissing === 6) {
				dataMissing = 0;
				data.push("0");
				continue;
			}
			if (linesSplit[i].length === 0) {
				continue;
			}
			data.push(linesSplit[i]);
			dataMissing = 0;
		}
		let valid = true;
		for (let i = 0; i < data.length; i++) {
			if (!this.isValidNumber(data[i])) {
				valid = false;
				break;
			}
		}
		if (!valid) {
			data = new Array(18).fill("0");
		}
		if (data[data.length - 1]) {
			// remove index data.length - 2
			data.splice(data.length - 3, 2);
		}
		if (data.length < 17) {
			for (let i = 0; i < 18 - data.length; i++) {
				data.unshift("0");
			}
		}
		const floatData = data.map((item) => parseFloat(item));
		const payData = {
			s_travel: floatData[0],
			extra_eco: floatData[1],
			extra_travel: floatData[1],
			travel: floatData[2],
			small_eco: floatData[3],
			big_eco: floatData[4],
			extra_20: floatData[5],
			extra_225: floatData[6],
			extra_1875: floatData[7],
			shift_150: floatData[8],
			special_200: floatData[9],
			special_150: floatData[10],
			extra_150: floatData[11],
			extra_125: floatData[12],
			shift_100: floatData[13],
			extra_100: floatData[14],
			absence: floatData[15],
		};
		return { data: payData };
	}

	async authUser(
		id: string
	): Promise<{ user: boolean; manager: boolean; userCookie: User }> {
		const user = await this.userModel
			.findById(id)
			.select(['-password', '-reset_token']);
		let manager = false;
		if (user.role.includes('ADMIN') || user.role.includes('SITE_MANAGER')) {
			manager = true;
		}
		return {
			user: true,
			manager,
			userCookie: user,
		};
	}
}
