import { Navigate, useLocation, Outlet } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount"
import { Typography } from "@mui/material";

export default function RequireAuth() {
  const {currentUser, loadingUserInfo} = useAccount();
  const location = useLocation();

  if(loadingUserInfo) return <Typography>Loading...</Typography>

  // the location is for the is used so after he logs in we redirect him to the place he wished for
  if(!currentUser) return <Navigate to='/login' state={{from: location}}/>
  return ( 
    <Outlet/>
  )
}