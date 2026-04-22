import { Event, FilterList } from "@mui/icons-material";
import { Box, ListItemText, MenuList, MenuItem, Paper, Typography } from "@mui/material";
import 'react-calendar/dist/Calendar.css'
import Calendar from "react-calendar";

export default function ActivityFilters() {
  return (
    <Box sx={{display:"flex", flexDirection:"column", gap: 3, borderRadius: 3}}>
        <Paper sx={{width: '100%', p: 3, borderRadius: 3}}>
            <Typography variant="h6" sx={{display: 'flex', alignItems:"center", mb: 3, color: "primary.main"}}>
                <FilterList sx={{mr: 3}}/>
                Filters
            </Typography>
            <MenuList>
                <MenuItem>
                    <ListItemText primary='All events'/>
                </MenuItem>
                <MenuItem>
                    <ListItemText primary="I'm going"/>
                </MenuItem>
                <MenuItem>
                    <ListItemText primary="I'm hosting"/>
                </MenuItem>
            </MenuList>
        </Paper>
        <Box component={Paper} sx={{width: "100%", p: 3, borderRadius: 3}}>
            <Typography variant="h6" sx={{display: 'flex', alignItems: "center", mb: 1, color: "primary.main"}}>
                <Event sx={{mr: 1}}/>
                Select date
            </Typography>
            <Calendar/>
        </Box>
    </Box>
  )
}