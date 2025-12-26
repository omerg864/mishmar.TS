import { Typography } from '@mui/material';

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
				<a
					href="https://github.com/omerg864"
					color="inherit"
					target="_blank"
					rel="noopener noreferrer"
				>
					Omer Gaizinger
				</a>{' '}
				{new Date().getFullYear()}
			</Typography>
		</footer>
	);
};
