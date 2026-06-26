import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { LoginSchema } from "../schemas/loginSchema"
import agent from "../api/agent"
import type { ResetPassword, User } from "../types";
import { useNavigate } from "react-router";
import { type RegisterSchema } from "../schemas/registerSchema";
import { toast } from "react-toastify";
import type { ChangePasswordSchema } from "../schemas/changePasswordSchema";

export const useAccount = () => {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const loginUser = useMutation({
        mutationFn: async (creds: LoginSchema) => {
            await agent.post('/login?useCookies=true', creds)
        },
        onSuccess: async () => {
            // invalidate makes it not up to date so it needs to be fetched
            // So after login succeeds, this tells React Query: 
            // "Hey, the user data might have changed, go fetch it again

            // Without this, after login, currentUser would still show the
            // old (or undefined) data because React Query wouldn't know to update it
            await queryClient.invalidateQueries({
                queryKey: ['user']
            })
        }
    });

    // queryKey: ['user'] — This is the cache identifier. React Query uses this to store/retrieve the data in its cache
    // queryFn — The async function that runs to fetch the data. It calls your API's /account/user-info endpoint
    // return response.data — Extracts just the data from the API response (not the whole response object)
    // {data: currentUser} — Destructures the result, so currentUser contains the user data

    const {data: currentUser, isLoading: loadingUserInfo} = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await agent.get<User>('/account/user-info');
            return response.data;
        },
        enabled: !queryClient.getQueryData(['user'])
    })

    const registerUser = useMutation({
        mutationFn: async (creds: RegisterSchema)=>{
            await agent.post('/account/register', creds);
        }
    })

    const verifyEmail = useMutation({
        mutationFn: async ({userId, code} : {userId: string, code: string}) => {
            await agent.get(`/confirmEmail?userId=${userId}&code=${code}`);
        }
    })

    const resendConfirmationEmail = useMutation({
        mutationFn: async ({email, userId}: {email?: string; userId?: string | null}) => {
            await agent.get(`/account/resendConfirmationEmail`, {
                params: {
                    email,
                    userId
                }
            })
        },
        onSuccess: () => {
            toast.success('Email sent - please check your email')
        }
    })

    const logoutUser = useMutation({
        mutationFn: async () => {
            await agent.post('/account/logout');
        },
        onSuccess: async () => {
            queryClient.removeQueries({queryKey: ['user']});
            queryClient.removeQueries({queryKey: ['activities']});
            navigate('/');
        }
    })

    const changePassword = useMutation({
        mutationFn: async (data: ChangePasswordSchema) => {
            await agent.post('/account/change-password', data);
        }
    })

    const forgotPassword = useMutation({
        mutationFn: async (email: string) => {
            await agent.post('/forgotPassword', {email});
        }
    })
    
    const resetPassword = useMutation({
        mutationFn: async (data: ResetPassword) => {
            await agent.post('/resetPassword', data);
        }
    })

    const fetchGithubToken = useMutation({
        mutationFn: async (code: string) => {
            const response = await agent.post(`/account/github-login?code=${code}`);
            return response.data; // this is for testing
        },
        // we will invalidate so we can get the user info just like in the login mutationFn
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['user']
            })
        }
    })

    return {
        loginUser,
        currentUser,
        logoutUser,
        loadingUserInfo,
        registerUser,
        verifyEmail,
        resendConfirmationEmail,
        changePassword,
        forgotPassword,
        resetPassword,
        fetchGithubToken
    }
}