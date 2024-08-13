import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Dispatch, SetStateAction } from "react";
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';



const pages = [{name: 'הגשת משמרות', id: "shift"},{name: 'סידור עבודה', id: "work"}, {name: 'חיושב שכר', id: "salary"}];
const pages_manager = [{name: 'הגשת משמרות', id: "shift"},{name: 'סידור עבודה', id: "work"}, {name: 'חיושב שכר', id: "salary"}, {name: 'לוח מנהל', id: "manager"}];
const settings_auth = [{name: 'פרופיל', id: "profile"}, {name: 'התנתק', id:"logout"}];
const settings = [{name: 'התחבר', id: "login"}, {name: 'הירשם', id: "register"}];

interface IProps {
  authenticated: boolean;
  setAuthenticated: Dispatch<SetStateAction<boolean>>;
  manager: boolean;
  setManager: Dispatch<SetStateAction<boolean>>;
  settingsChange: boolean;
}


const Header = (props: IProps) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const [title, setTitle] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (e: React.MouseEvent<Element>) => {
    switch((e.target as HTMLButtonElement).id){
      case 'manager':
        navigate('/management');
        break;
      case 'shift':
        navigate('/shift');
        break;
      case 'salary':
        navigate('/salary');
        break;
      case 'work':
        navigate('/schedule');
        break;
      default:
        break;
    }
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    switch((e.target as HTMLLIElement).parentElement?.id){
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'logout': 
        logout();
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
    setAnchorElUser(null);
  };

  const logout = () => {
    cookies.remove('user');
    cookies.remove('userToken');
    props.setAuthenticated(false);
    props.setManager(false);
    navigate('/');
  }

  const getSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/general`);
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: 'settings/general', component: "Header" })})
        toast.error(data.message);
      } else {
        setTitle(data.title);
      }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: 'settings/general', component: "Header" })})
      toast.error("Internal Server Error");
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    getSettings();
  }, [props.settingsChange]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <ShieldRoundedIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {title}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {!props.manager ? pages.map((page) => (
                <MenuItem key={page.id} id={page.id} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center" id={page.id}>{page.name}</Typography>
                </MenuItem>
              )) : pages_manager.map((page) => (
                <MenuItem key={page.id} id={page.id} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center" id={page.id}>{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <ShieldRoundedIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {!props.manager ? pages.map((page) => (
              <Button
                key={page.id}
                onClick={handleCloseNavMenu}
                id={page.id}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            )) : pages_manager.map((page) => (
              <Button
                key={page.id}
                id={page.id}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <SettingsRoundedIcon style={{ color: 'black'}} fontSize="large" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {props.authenticated ? settings_auth.map((setting) => (
                <MenuItem key={setting.id} id={setting.id} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              )) : settings.map((setting) => (
                <MenuItem key={setting.id} id={setting.id} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;