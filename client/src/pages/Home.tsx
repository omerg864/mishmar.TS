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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostType[]>([]);

  const user = cookies.get('user');


  const getPosts = async () =>{
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/auth/all?page=1`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts/auth/all?page=1`, component: "Home" })})
        toast.error(data.message);
      } else {
        setPosts(data.posts)
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts/auth/all?page=1`, component: "Home" })})
      toast.error("Internal Server Error")
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (props.authenticated) {
      getPosts();
    }
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main>
      <h1>דף הבית</h1>
      <div style={{width: '80%', padding: '15px', display: 'flex', justifyContent: 'flex-start', gap: '10px', boxSizing: 'border-box', flexWrap: 'wrap'}}>
      <Card className='user-data'>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <Typography variant="h4" component="div">
            {user?.username}
            </Typography>
            <Typography variant="h4" component="div">
            שישי לילה/מוצ"ש: {user?.weekend_night}
            </Typography>
            <Typography variant="h4" component="div">
            שבת בוקר/צהריים: {user?.weekend_day}
            </Typography>
            <Typography variant="h4" component="div">
            לילה: {user?.night}
            </Typography>
            <Typography variant="h4" component="div">
            שישי צהריים: {user?.friday_noon}
            </Typography>
          </CardContent>
      </Card>
      <div className='posts-home'>
      {posts.map((post) => (
        <Card sx={{width: '100%'}} key={post._id}>
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
      </div>
    </main>
  )
}

export default Home