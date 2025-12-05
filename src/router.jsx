import { createBrowserRouter } from "react-router-dom";

// IMPORTS
import App from "./App";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Explore from "./pages/Explore";
import Course from "./pages/Course";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/signup",
        element: <SignUp />,
    },
    {
        path: "/signin",
        element: <SignIn />,
    },
    {
        path: "/explore",
        element: <Explore />
    },
    {
        path: "/course/:id?",
        element: <Course />,
    },
]);