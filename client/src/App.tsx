import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { useEffect, useState } from "react"
import axios from 'axios';

function App() {


  // now javascript don't remember or store things so in order to do that we need to use hooks 
  // => so we gonna use useState

  const [activities, setActivities] = useState<Activity[]>([]); // the [] are for initialization and it will be executed once we load

  // another hook to cause a side effect when this component mount is useEffect
  // we will pass a callback function
  useEffect(() => {
    // a fetch returns a javascript promise, so we gonna use then to unwrap the promise
    // fetch('https://localhost:5001/api/activities')
    // .then(response => response.json())
    // .then(data => setActivities(data))

    axios.get<Activity[]>('https://localhost:5001/api/activities')
    .then(response => setActivities(response.data))


  }, [])

  return (
    // <> == <Fragment>
    <>
      <Typography variant="h3">Reactivities</Typography>
      <ul> 
        {/* we use map to loop over the list */}
        {/* we don't need to do this {activities.map((activity : Activity) => (
            since we did defined its type at the higher scope*/}
        <List>
          {activities.map((activity) => (
            // we added the key to be able to track them latter and update
              <ListItem key={activity.id}>
                <ListItemText>
                  {activity.title}
                </ListItemText>
              </ListItem>
          ))}
        </List>
      </ul>
    </>
  )
}

export default App
