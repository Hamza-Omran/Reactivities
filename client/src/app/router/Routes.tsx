import { createBrowserRouter } from "react-router";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import ActivityDashboard from "../../features/activities/dashbaord/ActivityDashboard";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetail from "../../features/activities/details/ActivityDetail";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {path: "", element: <HomePage/>},
            {path: "activities", element: <ActivityDashboard/>},
            {path: "activities/:id", element: <ActivityDetail/>},
            // now when we change from edit to create the form doesn't change too so if we could tell react these are two
            // different and each with id then it will dispose the old one and mount the new form
            {path: "createActivity", element: <ActivityForm key={"create"}/>},
            {path: "manage/:id", element: <ActivityForm/>},
        ]
    }
])