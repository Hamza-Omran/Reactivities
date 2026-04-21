import { Grid } from '@mui/material';
import ActivityList from './ActivityList';

// type Props = {
//   activities: Activity[],
//   selectActivity : (id : string) => void,
//   cancelSelectActivity : () => void,
//   selectedActivity? : Activity, // we used the ? rather than writing | undefined
//   editMode : boolean,
//   openForm : (id:string) => void, // now it is optional originally but we want to ensure taking it so not writing ?
//   closeForm : () => void,
// }

// usually we destruct the params of the function from props: Props to the current


  // here it will call data as activities,  and here we destruct the things we get
  
  
export default function ActivityDashboard() {
  
  return (
    <>
        <Grid container spacing={3}>
          {/* the available space on the page is 12 so 9 is 75% of the space */}
          <Grid size={7}>
            <ActivityList/>
          </Grid>
          <Grid size={5} style={{display: "flex", flexDirection: "column", gap: 20}}>
            {/* here the activities if it does exist then the component will render, so that is why we used &&
            {selectedActivity && !editMode 
            && <ActivityDetail selectedActivity={selectedActivity} cancelSelectActivity={cancelSelectActivity} openForm={openForm}/>}
            {editMode &&
            <ActivityForm closeForm={closeForm} activity={selectedActivity}/>} */}

            here go the activity filters
          </Grid>
        </Grid>
    </>
  )
}
