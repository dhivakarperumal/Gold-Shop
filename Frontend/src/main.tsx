import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StoreCartProvider } from "./context/StoreCartProvider";
import { DataProvider } from "./context/DataContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { Login } from "./Auth/Login";
import { Register } from "./Auth/Register";
import { Dashboard } from "./Admin/Dashboard/Dashboard";
import { Customers } from "./Admin/Customers/Customers";
import { CustomerForm } from "./Admin/Customers/CustomerForm";
import { CustomerProfile } from "./Admin/Customers/CustomerProfile";
import { Loans } from "./Admin/Loans/Loans";
import { LoanForm } from "./Admin/Loans/LoanForm";
import { Payments } from "./Admin/Payments/Payments";
import { GoldRelease } from "./Admin/Loans/GoldRelease";
import { Dealers } from "./Admin/Dealers/Dealers";
import { DealerForm } from "./Admin/Dealers/DealerForm";
import { DealerProfile } from "./Admin/Dealers/DealerProfile";
import { DealerPurchase } from "./Admin/Dealers/DealerPurchase";
import { DealerPayment } from "./Admin/Dealers/DealerPayment";
import { DealerLedger } from "./Admin/Dealers/DealerLedger";
import { DealerReports } from "./Admin/Dealers/DealerReports";
import { Reports } from "./Admin/Reports/Reports";
import { Products } from "./Admin/Products/Products";
import { AddProduct } from "./Admin/Products/AddProduct";
import { Categories } from "./Admin/Products/Categories";
import { StockDetails } from "./Admin/Products/StockDetails";
import Home from "./components/Home/Home.jsx";
import { ProductDetails } from "./pages/ProductDetails";
import Loader from "./components/CommonComponents/Loader.tsx";
import { Toaster } from "./components/CommonComponents/Toaster";
import { PrivateRoute } from "./context/PrivateRoute";
import BannerManagement from "./Admin/Marketing/BannerManagement.jsx";
import VideoManagement from "./Admin/Marketing/VideoManagement.jsx";
import GalleryManagement from "./Admin/Marketing/GalleryManagement.jsx";
import About from "./pages/About";
import ShopPage from "./pages/ShopPage.tsx";
import OffersPage from "./pages/OffersPage";
import ContactPage from "./pages/ContactPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import { WishlistProvider } from "./context/WishlistContext";

const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "shop", element: <ShopPage /> },
      { path: "offers", element: <OffersPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "wishlist", element: <WishlistPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      {
        path: "account",
        element: (
          <PrivateRoute allowedRoles={["admin", "user"]}>
            <AccountPage />
          </PrivateRoute>
        )
      },
      { path: "product/:id", element: <ProductDetails /> }
    ]
  },

  // Protected Admin Area
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={["admin", "user"]}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "products/all", element: <Products /> },
      { path: "products/add", element: <AddProduct /> },
      { path: "products/edit/:id", element: <AddProduct /> },
      { path: "products/category", element: <Categories /> },
      { path: "products/stock", element: <StockDetails /> },
      { path: "categories", element: <Categories /> },
      { path: "stock-details", element: <StockDetails /> },
      { path: "customers", element: <Customers /> },
      { path: "customers/new", element: <CustomerForm /> },
      { path: "customers/view/:id", element: <CustomerProfile /> },
      { path: "customers/edit/:id", element: <CustomerForm /> },
      { path: "loans", element: <Loans /> },
      { path: "loans/new", element: <LoanForm /> },
      { path: "loans/release/:id", element: <GoldRelease /> },
      { path: "payments", element: <Payments /> },
      { path: "dealers", element: <Dealers /> },
      { path: "dealers/new", element: <DealerForm /> },
      { path: "dealers/edit/:id", element: <DealerForm /> },
      { path: "dealers/view/:id", element: <DealerProfile /> },
      { path: "dealers/purchases", element: <DealerPurchase /> },
      { path: "dealers/payments", element: <DealerPayment /> },
      { path: "dealers/ledger", element: <DealerLedger /> },
      { path: "dealers/reports", element: <DealerReports /> },
      { path: "reports", element: <Reports /> },
      {
        path: "marketing/banners",
        element: (
          <PrivateRoute allowedRoles={["admin", "user"]}>
            <BannerManagement />
          </PrivateRoute>
        )
      },
      {
        path: "marketing/videos",
        element: (
          <PrivateRoute allowedRoles={["admin", "user"]}>
            <VideoManagement />
          </PrivateRoute>
        )
      },
      {
        path: "marketing/gallery",
        element: (
          <PrivateRoute allowedRoles={["admin", "user"]}>
            <GalleryManagement />
          </PrivateRoute>
        )
      }
    ]
  },



  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <StoreCartProvider>
        <DataProvider>
          <WishlistProvider>
            <Toaster />
            <React.Suspense fallback={<Loader />}>
              <RouterProvider router={router} />
            </React.Suspense>
          </WishlistProvider>
        </DataProvider>
      </StoreCartProvider>
    </AuthProvider>
  </StrictMode>
);
