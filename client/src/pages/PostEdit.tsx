import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { PostType, User } from '../types/types';
import { useNavigate, useParams } from 'react-router-dom';
import { dateToString } from '../functions/functions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';


const PostEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false)
  const [post, setPost] = useState<PostType>({title: "", content: "", date: (new Date()).toString(), userId: {nickname: ""}} as PostType);
  const cookies = new Cookies();
  const { id } = useParams();

  const getPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }});
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts/${id}`, component: "PostEdit" })})
        toast.error(data.message);
      } else {
        setPost(data);
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts/${id}`, component: "PostEdit" })})
      toast.error('Internal server error');
    }
    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setPost({...post, [e.target.name]: e.target.value});
  }

  const updatePost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/`, { headers: { "Content-type": "application/json", authorization: 'Bearer ' + cookies.get('userToken') },
      method: 'PATCH', body: JSON.stringify({...post, date: new Date() })});
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts`, component: "PostEdit" })})
        toast.error(data.message);
      } else {
        toast.success("פוסט עודכן");
        navigate('/posts');
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts`, component: "PostEdit" })})
      toast.error('Internal Server Error');
    }
    setLoading(false);
  }

  const deletePost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
      method: 'DELETE'});
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts/${id}`, component: "PostEdit" })})
        toast.error(data.message);
      } else {
        toast.success("פוסט נמחק");
        navigate('/posts');
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts/${id}`, component: "PostEdit" })})
      toast.error('Internal Server Error');
    }
    setLoading(false);
  }


  useEffect(() => {
    getPost();
  },[]);


  if (loading) {
    return <Spinner />
  }

  return (
    <main>
      <h1>פוסט</h1>
      <Box className="box-container">
      <Card sx={{ width: '100%' }}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <TextField sx={{marginTop: '10px'}} required value={post.title} name="title" label="Title" onChange={handleChange}/>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', right: '10px'}}>
              {dateToString(new Date())}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', left: '10px'}}>
              {(post.userId as User).nickname}
            </Typography>
            <div>
            <TextareaAutosize style={{width: '100%', marginTop: '10px'}} minRows={5} value={post.content} onChange={handleChange} name="content"/>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: "10px", marginTop: '10px'}}>
              <Button variant="contained" color="primary" onClick={updatePost} >שמור</Button>
              <Button variant="contained" color="error" onClick={deletePost} >מחק</Button>
            </div>
          </CardContent>
      </Card>
      </Box>
    </main>
  )
}

export default PostEdit