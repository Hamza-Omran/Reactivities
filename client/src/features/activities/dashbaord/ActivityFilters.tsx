import { Event, FilterList } from "@mui/icons-material";
import { Box, ListItemText, MenuList, MenuItem, Paper, Typography } from "@mui/material";
import 'react-calendar/dist/Calendar.css'
import Calendar from "react-calendar";
import { useStore } from "../../../lib/hooks/useStore";
import { observer } from "mobx-react-lite";

const ActivityFilters = observer(function ActivityFilters() {
    // now the filters are allowed to observe the filter and startDate from useStore however the use activities is not here
    // and it is in the ActivityList Component 
    const {activityStore: {setFilter, setStartDate, filter, startDate}} = useStore();
    
  return (
    <Box sx={{display:"flex", flexDirection:"column", gap: 3, borderRadius: 3}}>
        <Paper sx={{width: '100%', p: 3, borderRadius: 3}}>
            <Typography variant="h6" sx={{display: 'flex', alignItems:"center", mb: 3, color: "primary.main"}}>
                <FilterList sx={{mr: 3}}/>
                Filters
            </Typography>
            <MenuList>
                <MenuItem
                    selected={filter === 'all'}
                    onClick={() => setFilter('all')}
                >
                    <ListItemText primary='All events'/>
                </MenuItem>
                <MenuItem
                    selected={filter === 'isGoing'}
                    onClick={() => setFilter('isGoing')}
                >
                    <ListItemText primary="I'm going"/>
                </MenuItem>
                <MenuItem
                    selected={filter === 'isHost'}
                    onClick={() => setFilter('isHost')}
                >
                    <ListItemText primary="I'm hosting"/>
                </MenuItem>
            </MenuList>
        </Paper>
        <Box component={Paper} sx={{width: "100%", p: 3, borderRadius: 3}}>
            <Typography variant="h6" sx={{display: 'flex', alignItems: "center", mb: 1, color: "primary.main"}}>
                <Event sx={{mr: 1}}/>
                Select date
            </Typography>
            <Calendar
                value={startDate}
                onChange={date => setStartDate(date as Date)}
            />
        </Box>
    </Box>
  )
})

export default ActivityFilters;