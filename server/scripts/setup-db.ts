import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { UserScheme } from '../src/user/user.model';
import { SettingsScheme } from '../src/settings/settings.model';

dotenv.config({ path: path.resolve(__dirname, '../.env.production') });

async function setup() {
	const uri = process.env.MONGODB;
	if (!uri) {
		console.error('MONGODB URI not found in .env.production');
		process.exit(1);
	}

	try {
		await mongoose.connect(uri);
		console.log('Connected to MongoDB');

		const UserModel = mongoose.model('User', UserScheme);
		const SettingsModel = mongoose.model('Settings', SettingsScheme);

		// Create Admin User
		const adminExists = await UserModel.findOne({ username: 'admin' });
		if (!adminExists) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash('admin', salt);
			await UserModel.create({
				name: 'Admin',
				username: 'admin',
				email: 'admin@mishmar.com',
				password: hashedPassword,
				role: ['ADMIN'],
			});
			console.log('Admin user created');
		} else {
			console.log('Admin user already exists');
		}

		// Create Settings
		const settingsExists = await SettingsModel.findOne();
		if (!settingsExists) {
			await SettingsModel.create({});
			console.log('Settings document created with default values');
		} else {
			console.log('Settings document already exists');
		}

		await mongoose.disconnect();
		console.log('Disconnected from MongoDB');
	} catch (error) {
		console.error('Error during setup:', error);
		process.exit(1);
	}
}

setup();
