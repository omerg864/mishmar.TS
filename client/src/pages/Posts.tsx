import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { PostType, User } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { dateToString } from '../functions/functions';


interface IProps {
  authenticated: boolean;
}

const Posts = (props: IProps) => {

  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(false)
  const cookies = new Cookies();
  const navigate = useNavigate();


  const getPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/all`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        setPosts(data)
      }
    } catch (err) {
      console.log(err);
      toast.error("Internal server error")
    }
    setLoading(false);
  }

  const goToPost = (id: string) => {
    navigate(`/post/${id}`)
  }

  useEffect(() => {
    if (props.authenticated) {
      getPosts();
    }
  }, [props.authenticated]);
  
  if (loading) {
    return <Spinner />
  }

  if (!props.authenticated) {
    return <></>
  }


  return (
    <main>
      <h1>Posts</h1>
      {posts.map((post) => (
        <Card sx={{ width: '60%' }}>
        <CardActionArea onClick={() => goToPost(post._id as string)}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <Typography gutterBottom variant="h5" component="div">
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', right: '10px'}}>
              {dateToString(new Date(post.date))}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{position: 'absolute', top: '3px', left: '10px'}}>
              {(post.userId as User).nickname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.content}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      ))}
    </main>
  )
}

export default Posts