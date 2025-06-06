import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeDetails from './pages/RecipeDetails';
import Market from './pages/Market';
import IngredientDetails from './pages/IngredientDetails';
import Checkout from "./pages/Checkout";
import Categories from './pages/Categories';
import Countries from './pages/Countries';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgetPassword from "./pages/Auth/ForgetPassword";
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import TwoFactorAuth from './pages/Auth/TwoFactorAuth';
import AuthLayout from "./pages/Auth/AuthLayout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Home /> },
            { path: "recipes", element: <RecipeList /> },
            { path: "recipes/:id", element: <RecipeDetails /> },
            { path: "market", element: <Market /> },
            { path: "ingredients/:id", element: <IngredientDetails /> },
            { path: "checkout", element: <Checkout /> },
            { path: "categories", element: <Categories /> },
            { path: "countries", element: <Countries /> },
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { index: true, element: <Login /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "forgot-password", element: <ForgetPassword /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
            { path: "verify-email/:token", element: <VerifyEmail /> },
            { path: "2fa", element: <TwoFactorAuth /> },
        ],
    }
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;