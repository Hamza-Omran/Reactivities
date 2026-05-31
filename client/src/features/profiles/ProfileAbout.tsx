import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { Box, Typography, Button, Divider } from "@mui/material";
import { useState } from "react";
import ProfileEditForm from "./ProfileEditForm";

export default function ProfileAbout() {
  const { id } = useParams();
  const { profile, isCurrentUser } = useProfile(id);
  const [editMode, setEditMode] = useState(false);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">About {profile?.displayName}</Typography>
        {isCurrentUser && (
          <Button onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit profile'}</Button>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* the overflow auto is to have the scroll bar */}
      <Box sx={{ overflow: "auto", maxHeight: 350 }}>
        {/* the white space pre wrap is to preserve the line breaks */}
        {!editMode && (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {profile?.bio || "No description added yet"}
          </Typography>
        )}
        {editMode && <ProfileEditForm setEditMode={setEditMode} />}
      </Box>
    </Box>
  );
}

