import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const Footer = () => {
	return (
		<footer
			style={{
				backgroundColor: '#f8f9fa',
				padding: '1rem',
				width: '100%',
				display: 'flex',
				boxSizing: 'border-box',
				justifyContent: 'end',
			}}
		>
			<Typography variant="body2" color="textSecondary">
				{'Copyright © '}
				<Link color="inherit" to="https://github.com/omerg864">
					Omer Gaizinger
				</Link>{' '}
				{new Date().getFullYear()}
			</Typography>
		</footer>
	);
};
