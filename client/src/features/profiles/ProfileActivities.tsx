import { type SyntheticEvent, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link, useParams } from "react-router";
import { format } from "date-fns";

import { useProfile } from "../../lib/hooks/useProfile";
import type { Activity } from "../../lib/types";

export default function ProfileActivities() {
  const [activeTab, setActiveTab] = useState(0);

  const { id } = useParams();

  const {
    userActivities,
    setFilter,
    loadingUserActivities,
  } = useProfile(id);

  useEffect(() => {
    setFilter("future");
  }, [setFilter]);

  const tabs = [
    { menuItem: "Future Events", key: "future" },
    { menuItem: "Past Events", key: "past" },
    { menuItem: "Hosting", key: "hosting" },
  ];

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilter(tabs[newValue].key);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.menuItem} />
            ))}
          </Tabs>
        </Grid>
      </Grid>

      {!loadingUserActivities &&
        (!userActivities || userActivities.length === 0) && (
          <Typography sx={{mt: 2}}>No activities to show</Typography>
        )}

      <Grid
        container
        spacing={2}
        sx={{ mt: 2, height: 400, overflow: "auto" }}
      >
        {userActivities?.map((activity: Activity) => (
          <Grid size={2} key={activity.id}>
            <Link
              to={`/activities/${activity.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card elevation={4}>
                <CardMedia
                  component="img"
                  height="100"
                  image={`/images/categoryImages/${activity.category}.jpg`}
                  alt={activity.title}
                  sx={{ objectFit: "cover" }}
                />

                <CardContent>
                  <Typography variant="h6" sx={{textAlign: "center", mb: 1}}>
                    {activity.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column"
                    }}
                  >
                    <span>
                      {format(activity.date, "do LLL yyyy")}
                    </span>
                    <span>
                      {format(activity.date, "h:mm a")}
                    </span>
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}