import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";

type Props = {
  closeForm: () => void,
  activity?: Activity,
  handleSubmitForm : (activity:Activity) => void
}

export default function ActivityForm({closeForm, activity, handleSubmitForm} : Props) {
  
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    
    // the key here is the name in the form fields and the value is what is written
    const data : {[key: string]: FormDataEntryValue} = {}
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    if(activity) data.id = activity.id;
    
    handleSubmitForm(data as unknown as Activity); // this is just to cast it in Js

  }
  
  return (
    // for making the background white
    <Paper sx={{borderRadius: 3, padding: 3}}>
      {/* gutterBottom for margin at the bottom */}
      <Typography variant="h5" gutterBottom color="primary">
        Create Activity
      </Typography>
      <Box component='form' onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: 25}}>
        {/* when we are using the value here it is like we are saying this is a controlled input => so we can't edit it if filled
        and when changing the form from create to edit it says can't change type from uncontrolled to controlled 
        and defaultValue is for how we use uncontrolled value instead*/}
        <TextField name="title" label="Title" defaultValue={activity?.title}/>
        {/* if we specified a property like multiline then it is true by default so no need to assignment */}
        <TextField name="description" label="Description" multiline rows={3} defaultValue={activity?.description}/>
        <TextField name="category" label="Category" defaultValue={activity?.category}/>
        <TextField name="date" label="Date" type="date" defaultValue={activity?.date}/>
        <TextField name="city" label="City" defaultValue={activity?.city}/>
        <TextField name="venue" label="Venue" defaultValue={activity?.venue}/>
        <Box style={{display: "flex", justifyContent: "end", gap: 10}}>
          <Button onClick={closeForm} color="inherit">Cancel</Button>
          <Button type="submit" color="success" variant="contained">Submit</Button>
        </Box>
      </Box>
    </Paper>
  )
}