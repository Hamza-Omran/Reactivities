import { Box } from "@mui/material";
import ActivityCard from "./ActivityCard";

type Props = {
    activities: Activity[],
    selectActivity: (id : string) => void,
    handleDelete: (id: string) => void
}

export default function ActivityList({activities, selectActivity, handleDelete}: Props) {
  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
        {/* if we are using () then we are returning one thing, but if we are using {} then 
        we are explicitly should write return  and {} is for more than one line*/}
        {/* // we added the key to be able to track them latter and update */}
        {activities.map(activity => <ActivityCard activity={activity} key={activity.id} selectActivity={selectActivity} handleDelete={handleDelete}/>)}
    </Box>
  )
}