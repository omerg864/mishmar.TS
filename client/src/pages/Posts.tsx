import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { CardActionArea, Pagination, Typography, CardContent, Card } from '@mui/material';
import { PostType, User } from '../types/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dateToString } from '../functions/functions';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
  authenticated: boolean;
}

const Posts = (props: IProps) => {

  const [posts, setPosts] = useState<PostType[]>([]);
  const [pages, setPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  let [searchParams, setSearchParams] = useSearchParams();
  const cookies = new Cookies();
  const navigate = useNavigate();


  const getPosts = async () => {
    setLoading(true);
    let page = searchParams.get('page') ? searchParams.get('page') : 1;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/auth/all?page=${page}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `posts/auth/all?page=${page}`, component: "Posts" })})
        toast.error(data.message);
      } else {
        setPosts(data.posts);
        setPages(data.pages);
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `posts/auth/all?page=${page}`, component: "Posts" })})
      toast.error("Internal Server Error")
    }
    setLoading(false);
  }

  const goToPost = (id: string) => {
    navigate(`/post/${id}`)
  }

  const paginationClick = (e: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams(`?page=${value}`);
  }

  useEffect(() => {
    if (props.authenticated) {
      getPosts();
    }
  }, [props.authenticated, searchParams]);
  
  if (loading) {
    return <Spinner />
  }

  if (!props.authenticated) {
    return <NotAuthorized />;
  }


  return (
    <main>
      <h1>פוסטים</h1>
      <div className='box-container' style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
      {posts.map((post) => (
        <Card key={post._id} sx={{ width: '100%' }}>
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
      </div>
      <Pagination sx={{marginTop: '15px'}} page={searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1} onChange={paginationClick} count={pages} variant="outlined" color="primary" />
    </main>
  )
}

export default Posts