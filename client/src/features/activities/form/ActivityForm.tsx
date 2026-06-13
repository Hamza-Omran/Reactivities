import { Box, Button, Paper, Typography } from "@mui/material";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  activitySchema,
  type ActivityFormValues,
  type ActivitySchema,
} from "../../../lib/schemas/activitySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextInput from "../../../app/shared/components/TextInput";
import SelectInput from "../../../app/shared/components/SelectInput";
import { categoryOptions } from "./categoryOptions";
import DateTimeInput from "../../../app/shared/components/DateTimeInput";
import LocationInput from "../../../app/shared/components/LocationInput";

// type Props = {
//   closeForm: () => void,
//   activity?: Activity,
// }

export default function ActivityForm() {
  
  //  onSubmit is the default mode
  const {reset, control, handleSubmit} = useForm< ActivityFormValues, unknown, ActivitySchema>({
    mode: 'onBlur',
    resolver: zodResolver(activitySchema)
  });

  const navigate = useNavigate();
  const {id} = useParams();
  const {updateActivity, createActivity, activity, isLoadingActivity} = useActivities(id);

  // the second parameter is called array of dependencies
  useEffect(() => {
    if(activity) reset({
      ...activity,
      location: {
        city: activity.city,
        venue: activity.venue,
        latitude: activity.latitude,
        longitude: activity.longitude
      }
    })
  }, [activity, reset]);

  //  so in order to make sure the update is happening even after closing the form we need to use async
  const onSubmit = async (data : ActivitySchema) => {
    const {location, ...rest} = data;
    const flattenedData = {...rest, ...location};

    try {
      if(activity) {
        updateActivity.mutate({...activity, ...flattenedData}, {
          onSuccess: () => navigate(`/activities/${activity.id}`)
        })
      } else {
        createActivity.mutate(flattenedData, {
          onSuccess: (id) => navigate(`/activities/${id}`)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  if(isLoadingActivity) return <Typography>Loading Activity...</Typography>

  return (
    // for making the background white
    <Paper sx={{borderRadius: 3, padding: 3}}>
      {/* gutterBottom for margin at the bottom */}
      <Typography variant="h5" gutterBottom color="primary">
        {activity ? 'Edit Activity' : 'Create Activity'}
      </Typography>
      <Box component='form' onSubmit={handleSubmit(onSubmit)} style={{display: "flex", flexDirection: "column", gap: 25}}>
        {/* when we are using the value here it is like we are saying this is a controlled input => so we can't edit it if filled
        and when changing the form from create to edit it says can't change type from uncontrolled to controlled 
        and defaultValue is for how we use uncontrolled value instead*/}
        {/* for the name we don't need it in react hook form as we gonna pass it inside hte register */}
        {/* !! will cast it into boolean */}
        <TextInput label='Title' control={control} name="title"/>
        {/* if we specified a property like multiline then it is true by default so no need to assignment */}
        <TextInput label='Description' control={control} name="description" multiline rows={3}/>
        <Box sx={{display: 'flex', gap: 3}}>
          <SelectInput items={categoryOptions} label='Category' control={control} name="category"/>
          <DateTimeInput label='Date' control={control} name="date"/>
        </Box>
        <LocationInput control={control} label="Enter the location" name="location"/>
        
        <Box style={{display: "flex", justifyContent: "end", gap: 10}}>
          {/* navigate -1 is to go to the previous page */}
          <Button onClick={() => navigate(-1)} color="inherit">Cancel</Button>
          <Button 
          type="submit" color="success" variant="contained"
          loading={updateActivity.isPending || createActivity.isPending}
          >Submit</Button>
        </Box>
      </Box>
    </Paper>
  )
}