import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { useState } from "react"
import NavBar from "./NavBar";
import {useActivities} from "../../lib/hooks/useActivities.ts"
import ActivityDashboard from "../../features/activities/dashbaord/ActivityDashboard";

function App() {


  // now javascript don't remember or store things so in order to do that we need to use hooks 
  // => so we gonna use useState


  //  now for getting the activities we will make it here as this is the page where the user is going to update and add activities
  //  so we want a place to be able to update the list
  // const [activities, setActivities] = useState<Activity[]>([]); // the [] are for initialization and it will be executed once we load
  
  // as there might not be an activity selected yet so it can be undefined
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);

  const [editMode, setEditMode] = useState(false); // we don't need to specify the state as typescript learned it
  // here it will call data as activities,  and here we destruct the things we get
  const {activities, isPending} = useActivities();


  // passing the params to more than component is called prop drilling


  // another hook to cause a side effect when this component mount is useEffect
  // we will pass a callback function
  // useEffect(() => {
  //   // a fetch returns a javascript promise, so we gonna use then to unwrap the promise
  //   // fetch('https://localhost:5001/api/activities')
  //   // .then(response => response.json())
  //   // .then(data => setActivities(data))

  //   axios.get<Activity[]>('https://localhost:5001/api/activities')
  //   .then(response => setActivities(response.data))


  // }, [])

  // it is cleaner to make the functions inside the component as arrow function just like the component function
  const handleSelectActivity = (id : string) => {
    setSelectedActivity(activities!.find(x => x.id === id)) // the ! will remove the typescript errors for type safety
  }

  const handleCancelSelectActivity = () => {
    setSelectedActivity(undefined);
  }

  const handleOpenForm = (id? : string) => {
    if(id) handleSelectActivity(id); // these to lines are to clear the selection if created a new activity or just opened the form
    else handleCancelSelectActivity();
    setEditMode(true);
  }

  const handleCloseForm = () => {
    setEditMode(false);
  }


  return (
    // <> == <Fragment> and we will use Box instead so we can add styling
    <Box sx={{bgcolor: "#eee", minHeight: "100vh"}}>
      <CssBaseline/>
      <NavBar openForm={handleOpenForm}/>
        {/* we use map to loop over the list */}
        {/* we don't need to do this {activities.map((activity : Activity) => (
            since we did defined its type at the higher scope*/}
      <Container maxWidth="xl" sx={{mt: 3}}>
        {!activities || isPending? (
          <Typography>Loading...</Typography>
        ) : (
          <ActivityDashboard 
          activities={activities} 
          selectActivity={handleSelectActivity} 
          cancelSelectActivity={handleCancelSelectActivity}
          selectedActivity ={selectedActivity}
          editMode ={editMode}
          openForm={handleOpenForm}
          closeForm={handleCloseForm}
          />
        )}
      </Container>
    </Box>
  )
}

export default App


