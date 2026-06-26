import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "../../lib/hooks/useAccount"
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useForm, useWatch } from "react-hook-form";
import { Box, Button, Paper, Typography } from "@mui/material";
import { GitHub, LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";
import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginForm() {

    const [notVerified, setNotVerified] = useState(false);
    const { loginUser, resendConfirmationEmail } = useAccount();
    const navigate = useNavigate();
    const location = useLocation();
    const { control, handleSubmit, formState: { isValid, isSubmitting }} = useForm<LoginSchema>({
        mode: 'onTouched',
        resolver: zodResolver(loginSchema)
    });

    const email = useWatch({control, name: 'email'})

    const handleResendEmail = async () => {
        try {
            await resendConfirmationEmail.mutateAsync({email});
            setNotVerified(false);
        } catch (error) {
            console.log(error)
            toast.error('Problem sending email - please check email address');
        }
    }

    const onSubmit = async (data: LoginSchema) => {
        await loginUser.mutateAsync(data, {
            onSuccess: ()=>{
                navigate(location.state?.from || '/activities')
            },
            onError: error => {
                if(error.message === 'NotAllowed') {
                    setNotVerified(true);
                }
            }
        });
    }

    const loginWithGithub = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
        // to go to github
        window.location.href=
        // the scope we use it to get access to these if they are private => read:user is for the access of profile
            `https://github.com/login/oauth/authorize?client_id=${clientId}&redirectUri=${redirectUrl}&scope=read:user user:email`
    }

  return (
    <Paper 
        component='form' 
        onSubmit={handleSubmit(onSubmit)}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            gap: 3,
            maxWidth: 'md',
            mx: 'auto',
            borderRadius: 3
        }}    
    >
        <Box sx={{display: 'flex', alignItems:"center", justifyContent:'center', gap: 3, color:'secondary.main'}}>
            <LockOpen fontSize="large"/>
            <Typography variant="h4">Sign in</Typography>
        </Box>
        <TextInput label='Email' control={control} name="email"/>
        <TextInput label='Password' type="password" control={control} name="password"/>
        <Button type="submit" disabled={!isValid} loading={isSubmitting} variant="contained" size="large">
            Login
        </Button>
        <Button 
            onClick={loginWithGithub} startIcon={<GitHub/>} 
            sx={{backgroundColor: 'black'}} type='button' 
            variant="contained" size="large"
        >
            Login with Github
        </Button>
        {notVerified ? (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <Typography sx={{textAlign: 'center'}} color="error">
                    Your email has not been verified. You can click the button to re-send the verification email
                </Typography>
                <Button loading={resendConfirmationEmail.isPending} onClick={handleResendEmail}> Re-send Email Link</Button>
            </Box>
        ) : (
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', gap:3}}>
                <Typography sx={{textAlign: 'center'}}>
                    Forgot password? Click <Link to='/forgot-password'>here</Link>
                </Typography>
                <Typography sx={{textAlign: 'center'}}>
                    Don't have an account?
                    <Typography sx={{ml: 1}} component={Link} to='/register'  color="primary">
                        Sign Up
                    </Typography>
                </Typography>
            </Box>
        )}
    </Paper>
  )
}