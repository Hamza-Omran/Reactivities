import { AppBar, Box, Container, MenuItem, MenuList, Toolbar, Typography } from '@mui/material';
import { Group } from '@mui/icons-material';
import { NavLink } from 'react-router';
import MenuItemLink from '../shared/components/MenuItemLink';

// rfc shortcut is for reactFunctionalComponent

// type Props = {
//     openForm: () => void
// }

export default function NavBar() { 
  return (
    // the sx property is like a system style as it gives us access to ui styling or the material UI theme engine as well
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{backgroundImage: 'linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)'}}>
            <Container maxWidth='xl'>
                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                    <Box>
                        <MenuList>
                            <MenuItem component={NavLink} to="/" sx={{display: 'flex', gap: 2}}>
                                <Group fontSize='large'/> {/* this is going to be an icon we get from ui material */}
                                <Typography variant='h4' style={{fontWeight: "bold"}}>Reactivities</Typography>
                            </MenuItem>
                        </MenuList>
                    </Box>
                    <Box>
                        <MenuList sx={{display: "flex"}}>
                            {/* the NavLink component shows active class for the selected link */}
                            <MenuItemLink to="/activities">
                            Activities
                            </MenuItemLink>
                        <MenuItemLink to="/createActivity">
                                Create Activity
                            </MenuItemLink>
                        </MenuList>
                    </Box>
                    <MenuList>
                        <MenuItem>User menu</MenuItem>
                    </MenuList>
                </Toolbar>
            </Container>
        </AppBar>
        </Box>
  )
}

