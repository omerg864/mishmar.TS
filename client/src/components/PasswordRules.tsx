import React from 'react'
import { Typography } from '@mui/material';


const PasswordRules = () => {
    return (
        <>
        <Typography variant="body2" color="text.secondary">
            סיסמה חייבת להיות:
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • באנגלית
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • אות קטנה אחת לפחות
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • אות גדולה אחת לפחות
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • מספר אחד לפחות
            </Typography>
            <Typography variant="body2" color="text.secondary">
            • בין 8 ל24 אותיות
            </Typography>
        </>
    )
}

export default PasswordRules;