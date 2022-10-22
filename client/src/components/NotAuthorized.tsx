import React from 'react'
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const NotAuthorized = () => {
  return (
    <main>
        <Typography>
          לא ניתן להציג עמוד זה נא <Link to="/login" >התחבר</Link> או <Link to="/register">הירשם</Link>
        </Typography>
    </main>
  )
}

export default NotAuthorized