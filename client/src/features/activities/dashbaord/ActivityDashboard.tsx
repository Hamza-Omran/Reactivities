import { Grid } from '@mui/material';
import ActivityList from './ActivityList';
import ActivityDetail from '../details/ActivityDetail';
import ActivityForm from '../form/ActivityForm';

type Props = {
  activities: Activity[],
  selectActivity : (id : string) => void,
  cancelSelectActivity : (id : string) => void,
  selectedActivity? : Activity, // we used the ? rather than writing | undefined
  editMode : boolean,
  openForm : (id:string) => void, // now it is optional originally but we want to ensure taking it so not writing ?
  closeForm : () => void,
  handleSubmitForm : (activity:Activity) => void,
  handleDelete : (id : string) => void
}

// usually we destruct the params of the function from props: Props to the current

export default function ActivityDashboard({activities, selectActivity, cancelSelectActivity, selectedActivity, 
    editMode,
    openForm, 
    closeForm,
    handleSubmitForm,
    handleDelete
  } : Props) {
  return (
    <>
        <Grid container spacing={3}>
          {/* the available space on the page is 12 so 9 is 75% of the space */}
          <Grid size={7}>
            <ActivityList activities={activities} selectActivity={selectActivity} handleDelete={handleDelete}/>
          </Grid>
          <Grid size={5} style={{display: "flex", flexDirection: "column", gap: 20}}>
            {/* here the activities if it does exist then the component will render, so that is why we used &&*/}
            {selectedActivity && !editMode 
            && <ActivityDetail activity={selectedActivity} cancelSelectActivity={cancelSelectActivity} openForm={openForm}/>}
            {editMode &&
            <ActivityForm closeForm={closeForm} activity={selectedActivity} handleSubmitForm={handleSubmitForm}/>}
          </Grid>
        </Grid>
    </>
  )
}
