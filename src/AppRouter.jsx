import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages for optimal bundle size and instant initial load
const Home = lazy(() => import("./pages/Home"));
const RecipeList = lazy(() => import("./pages/RecipeList"));
const RecipeDetails = lazy(() => import("./pages/RecipeDetails"));
const Market = lazy(() => import("./pages/Market"));
const IngredientDetails = lazy(() => import("./pages/IngredientDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Categories = lazy(() => import("./pages/Categories"));
const Countries = lazy(() => import("./pages/Countries"));
const Chat = lazy(() => import("./pages/Chat"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const DietPlan = lazy(() => import("./pages/DietPlan"));
const SearchWithAi = lazy(() => import("./pages/SearchWithAi"));
const RecommendationDetails = lazy(() => import("./pages/RecommendationDetails"));
const Favorite = lazy(() => import("./pages/Favorite"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const Order = lazy(() => import("./pages/Order"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded auth pages
const AuthLayout = lazy(() => import("./pages/Auth/AuthLayout"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgetPassword = lazy(() => import("./pages/Auth/ForgetPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const TwoFactorAuth = lazy(() => import("./pages/Auth/TwoFactorAuth"));

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: withSuspense(NotFound),
    children: [
      { index: true, element: withSuspense(Home) },
      { path: "recipes", element: withSuspense(RecipeList) },
      { path: "recipe/:slug", element: withSuspense(RecipeDetails) },
      { path: "market", element: withSuspense(Market) },
      { path: "ingredient/:slug", element: withSuspense(IngredientDetails) },
      { path: "checkout", element: withSuspense(Checkout) },
      { path: "categories", element: withSuspense(Categories) },
      { path: "countries", element: withSuspense(Countries) },
      { path: "chat", element: withSuspense(Chat) },
      { path: "cart", element: withSuspense(Cart) },
      { path: "profile", element: withSuspense(Profile) },
      { path: "diet-plan", element: withSuspense(DietPlan) },
      { path: "search-ai/:query", element: withSuspense(SearchWithAi) },
      { path: "recommendation/:name", element: withSuspense(RecommendationDetails) },
      { path: "favourites", element: withSuspense(Favorite) },
      { path: "contact", element: withSuspense(Contact) },
      { path: "terms-and-conditions", element: withSuspense(TermsAndConditions) },
      { path: "order", element: withSuspense(Order) },
      { path: "orders", element: withSuspense(Orders) },
      { path: "order/:orderId", element: withSuspense(OrderDetails) },
      { path: "*", element: withSuspense(NotFound) },
    ],
  },
  {
    path: "/auth",
    element: withSuspense(AuthLayout),
    children: [
      { index: true, element: withSuspense(Login) },
      { path: "login", element: withSuspense(Login) },
      { path: "register", element: withSuspense(Register) },
      { path: "forget-password", element: withSuspense(ForgetPassword) },
      { path: "reset-password/:token", element: withSuspense(ResetPassword) },
      { path: "verify-email/:token", element: withSuspense(VerifyEmail) },
      { path: "2fa", element: withSuspense(TwoFactorAuth) },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
