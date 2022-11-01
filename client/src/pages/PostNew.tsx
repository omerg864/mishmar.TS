import React, { useState } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { Box, Typography, CardContent, Card, TextField, Button, TextareaAutosize } from '@mui/material';
import { PostType } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { dateToString } from '../functions/functions';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
  manager: boolean;
}

const PostNew = (props: IProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false)
  const [post, setPost] = useState<PostType>({title: "", content: "", date: (new Date()).toString(), userId: {nickname: ""}} as PostType);
  const cookies = new Cookies();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setPost({...post, [e.target.name]: e.target.value});
  }


  const savePost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/`, { headers: { authorization: 'Bearer ' + cookies.get('userToken'), "Content-type": "application/json" },
      method: 'POST', body: JSON.stringify({...post, date: new Date() })});
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts`, component: "PostNew" })})
        toast.error(data.message);
      } else {
        toast.success("פוסט נשמר");
        navigate('/posts');
      }
    } catch (err) {
      fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts`, component: "PostNew" })})
      toast.error('Internal Server Error');
    }
    setLoading(false);
  }


  if (loading) {
    return <Spinner />
  }

  if (!props.manager) {
    return <NotAuthorized />;
  }


  return (
    <main>
      <h1>פוסט חדש</h1>
      <Box className="box-container">
      <Card sx={{ width: '100%' }}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <TextField sx={{marginTop: '10px'}} required value={post.title} name="title" label="Title" onChange={handleChange}/>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', right: '10px'}}>
              {dateToString(new Date())}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', left: '10px'}}>
              {cookies.get('user').nickname}
            </Typography>
            <div>
            <TextareaAutosize style={{width: '100%', marginTop: '10px'}} minRows={5} value={post.content} onChange={handleChange} name="content"/>
            </div>
            <div style={{display: 'flex', gap: "10px", marginTop: '10px'}}>
              <Button variant="contained" color="primary" onClick={savePost} >שמור</Button>
            </div>
          </CardContent>
      </Card>
      </Box>
    </main>
  )
}

export default PostNew