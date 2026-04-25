import { Divider, Paper, Typography } from '@mui/material';
import { useLocation } from 'react-router';


export default function ServerError() {
    const {state} = useLocation();
    return (
        <Paper>
            {state.error ? (
                <>
                    <Typography gutterBottom variant='h3' sx={{px: 4, py:2}} color='secondary'>
                        {/* this message might be empty so we add backups */}
                        {state.error?.message || 'There has been an error'}
                    </Typography>
                    <Divider/>
                    <Typography variant='body1' sx={{p: 4}}>
                        {/* the details might not always exist which is happening when in production while in development it might show */}
                        {state.error?.details || 'Internal server error'}
                    </Typography>
                </>
            ) : (
                <Typography variant='h5'>Server error</Typography>
            )}
        </Paper>
    )
}