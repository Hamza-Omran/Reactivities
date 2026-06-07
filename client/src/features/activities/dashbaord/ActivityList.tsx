import { Box, Typography } from "@mui/material";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";

// type Props = {
//     activities: Activity[],
//     selectActivity: (id : string) => void
// }


const ActivityList = observer(function ActivityList() {
  const {activitiesGroup, isLoading, hasNextPage, fetchNextPage} = useActivities();
  const {ref, inView} = useInView({
    threshold: 0.5 // so when i am in the half of the page list then it will get the next page
  });
  
  useEffect(() => {
    if(inView && hasNextPage) 
      fetchNextPage();
  }, [inView, fetchNextPage, hasNextPage])

  if(isLoading) return <Typography>Loading...</Typography>

  if(!activitiesGroup) return <Typography>No Data Was Found</Typography>


  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
        {/* if we are using () then we are returning one thing, but if we are using {} then 
        we are explicitly should write return  and {} is for more than one line*/}
        {/* // we added the key to be able to track them latter and update */}
        {activitiesGroup.pages.map((activities, index) => (
          <Box key={index}
            ref={index === activitiesGroup.pages.length - 1 ? ref : null} // this way not every activity will have the ref only the last one
            sx={{display: 'flex', flexDirection: 'column', gap: 3}}
          > {/* // we will change fragment to box since a ref can't be added to it since it doesn't exist in our dom */}
            {activities!.items.map(activity => <ActivityCard activity={activity} key={activity.id}/>)}
          </Box>
        ))}
    </Box>
  )
})


export default ActivityList;