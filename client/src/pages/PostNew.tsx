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
import DatePicker from '../components/DatePicker'
import TextareaAutosize from '@mui/material/TextareaAutosize';


interface IProps {
  manager: boolean;
}

const PostNew = (props: IProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [post, setPost] = useState<PostType>({title: "", content: "", date: (new Date()).toString(), userId: {nickname: ""}} as PostType);
  const cookies = new Cookies();

  const handleChange = (e: any) => {
    setPost({...post, [e.target.name]: e.target.value});
  }


  const savePost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/`, { headers: { authorization: 'Bearer ' + cookies.get('userToken'), "Content-type": "application/json" },
      method: 'POST', body: JSON.stringify({...post, date: new Date() })});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("post saved");
        navigate('/posts');
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setLoading(false);
  }


  if (loading) {
    return <Spinner />
  }

  if (!props.manager) {
    return <></>
  }


  return (
    <main>
      <h1>New Post</h1>
      <Card sx={{ width: '60%' }}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <TextField required value={post.title} name="title" label="Title" onChange={handleChange}/>
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
              <Button variant="contained" color="primary" onClick={savePost} >Save</Button>
            </div>
          </CardContent>
      </Card>
    </main>
  )
}

export default PostNew