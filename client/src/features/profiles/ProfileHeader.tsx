import { Avatar, Box, Button, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import type { Profile } from "../../lib/types";

type Props = {
    profile: Profile
}

export default function ProfileHeader({profile} : Props) {
    const isFollowing = true;

    return (
        // we use paper to get the white background
        <Paper elevation={3} sx={{p: 4, borderRadius: 3}}>
            <Grid container spacing={2}>
                <Grid size={8}>
                    {/* stack is another generic container so we can define the items to be vertical or horizontal alignment*/}
                    <Stack direction='row' spacing={3} sx={{alignItems: 'center'}}>
                        <Avatar src={profile.imageUrl} alt={profile.displayName + "image"} sx={{width: 150, height: 150}}/>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Typography variant="h4">{profile.displayName}</Typography>
                            {isFollowing && <Chip variant="outlined" color="secondary" label="Following" sx={{borderRadius: 1}}/>}
                        </Box>
                    </Stack>
                </Grid>
                <Grid size={4}>
                    <Stack spacing={2} sx={{alignItems: 'center'}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
                            <Box sx={{textAlign: 'center'}}>
                                <Typography variant="h6">Followers</Typography>
                                <Typography variant="h3">5</Typography>
                            </Box>
                            <Box sx={{textAlign: 'center'}}>
                                <Typography variant="h6">Following</Typography>
                                <Typography variant="h3">42</Typography>
                            </Box>
                        </Box>
                        <Divider sx={{width: '100%'}}/>
                        <Button fullWidth variant="outlined" color={isFollowing? "error" : "success"}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    )
}