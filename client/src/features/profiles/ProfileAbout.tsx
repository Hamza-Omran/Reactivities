import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { Box, Typography, Button, Divider } from "@mui/material";

export default function ProfileAbout() {
  const { id } = useParams();
  const { profile } = useProfile(id);

  return (
    <Box>
      <Box sx={{display:"flex", justifyContent:"space-between"}}>
        <Typography variant="h5">About {profile?.displayName}</Typography>
        <Button>Edit profile</Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* the overflow auto is to have the scroll bar */}
      <Box sx={{ overflow: "auto", maxHeight: 350 }}>
        {/* the white space pre wrap is to preserve the line breaks */}
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {profile?.bio || "No description added yet"}
        </Typography>
      </Box>
    </Box>
  );
}
