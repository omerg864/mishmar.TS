import { Card, CardContent, Typography } from '@mui/material';
import React, {useState, useEffect} from 'react'
import Cookies from 'universal-cookie'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import { PostType, User } from '../types/types';
import { dateToString } from '../functions/functions';

interface IProps {
  authenticated: boolean;
}

const Home = (props: IProps) => {

  const cookies = new Cookies();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);


  const getPosts = async () =>{
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/all`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
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
    setIsLoading(false);
  }

  useEffect(() => {
    if (props.authenticated) {
      getPosts();
    }
  }, [props.authenticated]);


  if (!props.authenticated) {
    return <h1>Please Login to view Site</h1>
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main>
      <h1>Home</h1>
      <div style={{width: '70%', padding: '15px', display: 'flex', justifyContent: 'flex-start', gap: '10px', boxSizing: 'border-box', flexWrap: 'wrap'}}>
      <Card className='user-data'>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <Typography variant="h4" component="div">
            {cookies.get('user').username}
            </Typography>
            <Typography variant="h4" component="div">
            Weekend Night: {cookies.get('user').weekend_night}
            </Typography>
            <Typography variant="h4" component="div">
            Weekend Day: {cookies.get('user').weekend_day}
            </Typography>
            <Typography variant="h4" component="div">
            Night: {cookies.get('user').night}
            </Typography>
            <Typography variant="h4" component="div">
            Friday Noon: {cookies.get('user').friday_noon}
            </Typography>
          </CardContent>
      </Card>
      {posts.map((post) => (
        <Card className='posts-home'>
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
      </Card>
      ))}
      </div>
    </main>
  )
}

export default Home