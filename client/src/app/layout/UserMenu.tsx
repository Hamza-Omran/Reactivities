import {useId, useState, type MouseEvent} from 'react';
import { useAccount } from '../../lib/hooks/useAccount';
import { Avatar, Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Button  } from '@mui/material';
import { Link } from 'react-router';
import { Add, Logout, Person } from '@mui/icons-material';

export default function UserMenu() {
  const {currentUser, logoutUser} = useAccount();
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color='inherit'
        size='large'
        sx={{fontSize: '1.1rem'}}
        onClick={handleClick}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <Avatar src={currentUser?.imageUrl} alt='current user image'/>
            {currentUser?.displayName}
        </Box>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': buttonId,
          },
        }}
      >
            <MenuItem component={Link} to='/createActivity' onClick={handleClose}>
                <ListItemIcon>
                    <Add/>
                </ListItemIcon>
                <ListItemText>Create Activity</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to={`/profile/${currentUser?.id}`} onClick={handleClose}>
                <ListItemIcon>
                    <Person/>
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <Divider/>
            <MenuItem onClick={()=>{
                logoutUser.mutate();
                handleClose();
            }}>
                <ListItemIcon>
                    <Logout/>
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
            </MenuItem>
      </Menu>
    </>
  );
}
