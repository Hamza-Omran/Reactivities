import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState, type SyntheticEvent } from "react"
import ProfilePhotos from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";
import ProfileFollowings from "./ProfileFollowings";
import ProfileActivities from "./ProfileActivities";

export default function ProfileContent() {
  const [value, setValue] = useState(0);

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const tabContent = [
    {Label: 'About', content: <ProfileAbout/>},
    {Label: 'Photos', content: <ProfilePhotos/>},
    {Label: 'Events', content: <ProfileActivities/>},
    {Label: 'Followers', content: <ProfileFollowings activeTab={value}/>},
    {Label: 'Following', content: <ProfileFollowings activeTab={value}/>}
  ];

  return (
    <Box
      component={Paper}
      sx={{mt: 2, p: 3, height: 500, display: 'flex', alignItems: 'flex-start', borderRadius: 3}}
      elevation={3}
    >
      <Tabs orientation="vertical" value={value} onChange={handleChange} sx={{borderRight: 1, height: 450, minWidth: 200}}>
        {tabContent.map((tab, index) => (
          <Tab key={index} label={tab.Label} sx={{mr: 3}}/>
        ))}
      </Tabs>
      <Box sx={{flexGrow: 1, p: 3, pt: 0}}>
        {tabContent[value].content}
      </Box>
    </Box>
  )
}