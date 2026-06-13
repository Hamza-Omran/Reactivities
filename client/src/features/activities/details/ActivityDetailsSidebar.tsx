import {
  Paper,
  Typography,
  List,
  ListItem,
  Chip,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Grid,
} from "@mui/material";
import type { Activity } from "../../../lib/types";
import { Link } from "react-router";

type Props = {
  activity: Activity;
};

export default function ActivityDetailsSidebar({ activity }: Props) {
  
  return (
    <>
      <Paper
        sx={{
          textAlign: "center",
          border: "none",
          backgroundColor: "primary.main",
          color: "white",
          p: 2,
        }}
      >
        <Typography variant="h6">
          {activity.attendees.length} people going
        </Typography>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        {activity.attendees.map((att) => (
          <Grid key={att.id} container sx={{ alignItems: "center" }}>
            <Grid size={8}>
              <List sx={{ display: "flex", flexDirection: "column" }}>
                <ListItem component={Link} to={`/profile/${att.id}`}>
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      alt={att.displayName + "image"}
                      src={att.imageUrl}
                      sx={{ width: 75, height: 75, mr: 3 }}
                    />
                  </ListItemAvatar>
                  <ListItemText>
                    <Typography variant="h6">{att.displayName}</Typography>
                    
                    {att.following && (
                      <Typography variant="body2" sx={{ color: "orange" }}>
                        Following
                      </Typography>
                    )}
                  </ListItemText>
                </ListItem>
              </List>
            </Grid>
            <Grid
              size={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              gap: 1,
              }}
            >
                {activity.hostId === att.id && (
                      <Chip
                        label="Host"
                        color="warning"
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
            </Grid>
          </Grid>
        ))}
      </Paper>
    </>
  );
}
