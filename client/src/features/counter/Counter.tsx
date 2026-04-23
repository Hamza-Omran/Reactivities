import { observer } from "mobx-react-lite";
import { useStore } from "../../lib/hooks/useStore"
import { Paper, Box, Button, ButtonGroup, Typography, List, ListItemText } from "@mui/material";

export default observer(function Counter() {
  
  const {counterStore} = useStore();
  
  return (
    // now we don't need to create the actions inside the observers as we don't observe them

    // anything we put inside here has the power to observe our mobx state
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
    {/* rather than using an observer component and pass the jsx to it inside an arrow function we can pass the whole component fn */}
        <Box sx={{width: '60%'}}>
            <Typography variant="h4" gutterBottom>{counterStore.title}</Typography>
            <Typography variant="h6">The count is: {counterStore.count}</Typography>
            <ButtonGroup sx={{mt: 3}}>
                <Button onClick={()=>{counterStore.decrement()}} variant="contained" color="error">Decrement</Button>
                <Button onClick={()=>{counterStore.increment()}} variant="contained" color="success">Increment</Button>
                <Button onClick={()=>{counterStore.increment(5)}} variant="contained" color="primary">Increment by 5</Button>
            </ButtonGroup>
        </Box>
        <Paper sx={{width: '40%', p: 4}}>
            <Typography variant="h5">Counter events {counterStore.eventCount}</Typography>
            <List>
                {counterStore.events.map((event, index)=>(
                    <ListItemText key={index}>{event}</ListItemText>
                ))}
            </List>
        </Paper>
    </Box>
  )
})