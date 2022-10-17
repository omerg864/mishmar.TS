import React from 'react'
import { Typography } from '@mui/material';


const PasswordRules = () => {
    return (
        <>
        <Typography variant="body2" color="text.secondary">
            Password must contain:
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • must contain one lower case letter
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • must contain one upper case letter
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • must contain one number
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • must be between 8 and 24 characters
            </Typography>
        </>
    )
}

export default PasswordRules;