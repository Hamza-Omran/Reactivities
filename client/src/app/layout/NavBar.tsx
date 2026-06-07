import {
  AppBar,
  Box,
  CircularProgress,
  Container,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
} from "@mui/material";
import { Group } from "@mui/icons-material";
import { NavLink } from "react-router";
import MenuItemLink from "../shared/components/MenuItemLink";
import { useStore } from "../../lib/hooks/useStore";
import { Observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hooks/useAccount";
import UserMenu from "./UserMenu";

// rfc shortcut is for reactFunctionalComponent

// type Props = {
//     openForm: () => void
// }

export default function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();

  return (
    // the sx property is like a system style as it gives us access to ui styling or the material UI theme engine as well
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <MenuList>
                <MenuItem
                  component={NavLink}
                  to="/"
                  sx={{ display: "flex", gap: 2 }}
                >
                  <Group fontSize="large" />{" "}
                  {/* this is going to be an icon we get from ui material */}
                  <Typography variant="h4" style={{ fontWeight: "bold", position: 'relative'}}>
                    Reactivities
                  </Typography>
                  <Observer>
                    {() =>
                      uiStore.isLoading ? (
                        <CircularProgress
                          size={20}
                          thickness={7}
                          sx={{
                            color: 'white',
                            position: "absolute",
                            top: '30%',
                            left: '105%',
                          }}
                        />
                      ) : null
                    }
                  </Observer>
                </MenuItem>
              </MenuList>
            </Box>
            <Box>
              <MenuList sx={{ display: "flex" }}>
                {/* the NavLink component shows active class for the selected link */}
                <MenuItemLink to="/activities">Activities</MenuItemLink>
                <MenuItemLink to="/counter">Counter</MenuItemLink>
                <MenuItemLink to="/errors">Errors</MenuItemLink>
              </MenuList>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {currentUser ? (
                <UserMenu />
              ) : (
                <MenuList sx={{ display: "flex" }}>
                  <MenuItemLink to="/login">Login</MenuItemLink>
                  <MenuItemLink to="/register">Register</MenuItemLink>
                </MenuList>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
