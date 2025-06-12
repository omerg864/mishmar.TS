import React, { useEffect, useState } from 'react';
import './App.css';
import './Calendar.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Manager from './pages/Manager';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Schedules from './pages/Schedules';
import ScheduleUpdate from './pages/ScheduleUpdate';
import ScheduleNew from './pages/ScheduleNew';
import Structures from './pages/Structures';
import Shift from './pages/Shift';
import ScheduleShift from './pages/ScheduleShift';
import ScheduleShiftUser from './pages/ScheduleShiftUser';
import Events from './pages/Events';
import Posts from './pages/Posts';
import PostEdit from './pages/PostEdit';
import PostNew from './pages/PostNew';
import Users from './pages/Users';
import Quality from './pages/Quality';
import EmailPassword from './pages/EmailPassword';
import Profile from './pages/Profile';
import ScheduleView from './pages/ScheduleView';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import ScheduleTable from './pages/ScheduleTable';
import Page404 from './pages/Page404';
import Salary from './pages/Salary';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerProtected from './components/ManagerProtected';
import UserRestrictedRoute from './components/UserRestrictedRoute';
import Cookies from 'universal-cookie';
import SettingsSalary from './pages/SettingsSalary';
import Forms from './pages/Forms';
import UsersShifts from './pages/UsersShifts';
import Spinner from './components/Spinner';
import { Footer } from './components/Footer';

function App() {
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [manager, setManager] = useState<boolean>(false);
	const [settingsChange, setSettingsChange] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [title, setTitle] = useState<string>('');
	const cookies = new Cookies();

	if (cookies.get('userToken') && !authenticated) {
		setAuthenticated(true);
		const user = cookies.get('user');
		if (user) {
			if (user.role) {
				let found = false;
				user.role.forEach((role: string) => {
					if (role === 'SITE_MANAGER' || role === 'ADMIN') {
						found = true;
					}
				});
				if (found) {
					setManager(true);
				}
			}
		}
	}

	const getSettings = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/settings/general`
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: 'settings/general',
						component: 'Header',
					}),
				});
			} else {
				setTitle(data.title);
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: 'settings/general',
					component: 'Header',
				}),
			});
		}
		setIsLoading(false);
	};

	useEffect(() => {
		getSettings();
	}, [settingsChange]);

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<>
			<Header
				title={title}
				authenticated={authenticated}
				setAuthenticated={setAuthenticated}
				manager={manager}
				setManager={setManager}
			/>
			<ToastContainer rtl={true} theme="colored" />
			<GoogleOAuthProvider
				clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}
			>
				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<Home authenticated={authenticated} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/login"
						element={
							<UserRestrictedRoute
								isAuthenticated={authenticated}
							>
								<Login
									setAuthenticated={setAuthenticated}
									setManager={setManager}
								/>
							</UserRestrictedRoute>
						}
					/>
					<Route
						path="/register"
						element={
							<UserRestrictedRoute
								isAuthenticated={authenticated}
							>
								<Register />
							</UserRestrictedRoute>
						}
					/>
					<Route
						path="/management"
						element={
							<ManagerProtected manager={manager}>
								<Manager />
							</ManagerProtected>
						}
					/>
					<Route
						path="/schedules"
						element={
							<ManagerProtected manager={manager}>
								<Schedules />
							</ManagerProtected>
						}
					/>
					<Route
						path="/schedule/new"
						element={
							<ManagerProtected manager={manager}>
								<ScheduleNew />
							</ManagerProtected>
						}
					/>
					<Route
						path="/schedule/:id/update"
						element={
							<ManagerProtected manager={manager}>
								<ScheduleUpdate />
							</ManagerProtected>
						}
					/>
					<Route
						path="/structure"
						element={
							<ManagerProtected manager={manager}>
								<Structures />
							</ManagerProtected>
						}
					/>
					<Route
						path="/shift"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<Shift />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/schedule/:id/shifts"
						element={
							<ManagerProtected manager={manager}>
								<ScheduleShift />
							</ManagerProtected>
						}
					/>
					<Route
						path="/schedule/:id/table"
						element={
							<ManagerProtected manager={manager}>
								<ScheduleTable />
							</ManagerProtected>
						}
					/>
					<Route
						path="/schedule/:id/view"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<ScheduleView />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/shift/schedule/:scheduleId/user/:userId"
						element={
							<ManagerProtected manager={manager}>
								<ScheduleShiftUser />
							</ManagerProtected>
						}
					/>
					<Route
						path="/events"
						element={
							<ManagerProtected manager={manager}>
								<Events />
							</ManagerProtected>
						}
					/>
					<Route
						path="/posts"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<Posts />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/post/:id"
						element={
							<ManagerProtected manager={manager}>
								<PostEdit />
							</ManagerProtected>
						}
					/>
					<Route
						path="/post/new"
						element={
							<ManagerProtected manager={manager}>
								<PostNew />
							</ManagerProtected>
						}
					/>
					<Route
						path="/users"
						element={
							<ManagerProtected manager={manager}>
								<Users />
							</ManagerProtected>
						}
					/>
					<Route
						path="/users/quality"
						element={
							<ManagerProtected manager={manager}>
								<Quality />
							</ManagerProtected>
						}
					/>
					<Route
						path="/users/shifts"
						element={
							<ManagerProtected manager={manager}>
								<UsersShifts />
							</ManagerProtected>
						}
					/>
					<Route
						path="/password/reset/email"
						element={
							<UserRestrictedRoute
								isAuthenticated={authenticated}
							>
								<EmailPassword />
							</UserRestrictedRoute>
						}
					/>
					<Route
						path="/password/reset/:reset_token"
						element={
							<UserRestrictedRoute
								isAuthenticated={authenticated}
							>
								<ResetPassword />
							</UserRestrictedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/schedule"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<ScheduleView />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/salary"
						element={
							<ProtectedRoute isAuthenticated={authenticated}>
								<Salary />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/settings"
						element={
							<ManagerProtected manager={manager}>
								<Settings
									settingsChange={settingsChange}
									setSettingsChange={setSettingsChange}
								/>
							</ManagerProtected>
						}
					/>
					<Route
						path="/settings/salary"
						element={
							<ManagerProtected manager={manager}>
								<SettingsSalary
									settingsChange={settingsChange}
									setSettingsChange={setSettingsChange}
								/>
							</ManagerProtected>
						}
					/>
					<Route
						path="/forms"
						element={
							<ManagerProtected manager={manager}>
								<Forms />
							</ManagerProtected>
						}
					/>
					<Route path="*" element={<Page404 />} />
				</Routes>
			</GoogleOAuthProvider>
			<Footer />
		</>
	);
}

export default App;
