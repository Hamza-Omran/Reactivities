import { createBrowserRouter, Navigate } from "react-router";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import ActivityDashboard from "../../features/activities/dashbaord/ActivityDashboard";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetailPage from "../../features/activities/details/ActivityDetailPage";
import Counter from "../../features/counter/Counter";
import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import LoginForm from "../../features/account/LoginForm";
import RequireAuth from "./RequireAuth";
import RegisterForm from "../../features/account/RegisterForm";
import ProfilePage from "../../features/profiles/ProfilePage";
import VerifyEmail from "../../features/account/VerifyEmail";
import ChangePasswordForm from "../../features/account/ChangePasswordForm";
import ForgotPasswordForm from "../../features/account/ForgotPasswordForm";
import ResetPasswordForm from "../../features/account/ResetPasswordForm";
import AuthCallback from "../../features/account/AuthCallback";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {element: <RequireAuth/>, children: [
                {path: "activities", element: <ActivityDashboard/>},
                {path: "activities/:id", element: <ActivityDetailPage/>},
                // now when we change from edit to create the form doesn't change too so if we could tell react these are two
                // different and each with id then it will dispose the old one and mount the new form
                {path: "createActivity", element: <ActivityForm key={"create"}/>},
                {path: "manage/:id", element: <ActivityForm/>},
                {path: "profile/:id", element: <ProfilePage/>},
                {path: "change-password", element: <ChangePasswordForm/>}
            ]},
            {path: "", element: <HomePage/>},
            {path: "counter", element: <Counter/>},
            {path: "errors", element: <TestErrors/>},
            {path: "not-found", element: <NotFound/>},
            {path: "server-error", element: <ServerError/>},
            {path: "login", element: <LoginForm/>},
            {path: "register", element: <RegisterForm/>},
            {path: "confirm-email", element: <VerifyEmail/>},
            {path: "forgot-password", element: <ForgotPasswordForm/>},
            {path: "reset-password", element: <ResetPasswordForm/>},
            {path: "auth-callback", element: <AuthCallback/>},
            // using the star is called wildcard route so it directs any not matching routes to here
            {path: "*", element: <Navigate replace to='/not-found'/>} // and here it will direct us to not found component as well
        ]
    }
])