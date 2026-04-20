import { Box, Button, Card, CardActions, CardContent, Chip, Typography } from "@mui/material"

type Props = {
    activity: Activity,
    selectActivity: (id : string) => void
    handleDelete: (id: string) => void
}

// now prop drilling is happening because we don't have route nor global state management

export default function ActivityCard({activity, selectActivity, handleDelete}: Props) {
  return (
    <Card sx={{borderRadius: 3}}>
      <CardContent>
        <Typography variant="h5"> {activity.title} </Typography>
        <Typography sx={{color: "text.secondary", mb: 1}}> {activity.date} </Typography>
        <Typography variant="body2"> {activity.description} </Typography>
        <Typography variant="subtitle1"> {activity.city} / {activity.venue} </Typography>
      </CardContent>
      <CardActions sx={{display: "flex", justifyContent: "space-between", pb: 2}}>
        <Chip label={activity.category} variant="outlined"/>
        <Box style={{display: "flex", gap: 10}}>
          <Button onClick={() => {selectActivity(activity.id)}} size="medium" variant="contained">View</Button>
          <Button onClick={() => {handleDelete(activity.id)}} size="medium" color="error" variant="contained">Delete</Button>
        </Box>
      </CardActions>
    </Card>
  )
}