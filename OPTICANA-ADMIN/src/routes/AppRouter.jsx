import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import Orders from "../pages/Orders";
import POS from "../pages/POS";
import Sales from "../pages/Sales";
import Customers from "../pages/Customers";
import Repairs from "../pages/Repairs";
import Suppliers from "../pages/Suppliers";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Purchases from "../pages/Purchases";
import CustomerBalances from "../pages/CustomerBalances";
import Categories from "../pages/Categories";
import Reviews from "../pages/Reviews";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/auth/Profile";
import StoreContent from "../pages/StoreContent";
import Users from "../pages/Users";

import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRouter() {
  return (
    <Routes>

      {/* =========================
          AUTH
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* =========================
          PROTECTED ADMIN
      ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/inventory"
            element={<Inventory />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/pos"
            element={<POS />}
          />

          <Route
            path="/sales"
            element={<Sales />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/repairs"
            element={<Repairs />}
          />

          <Route
            path="/suppliers"
            element={<Suppliers />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/purchases"
            element={<Purchases />}
          />

          <Route
            path="/customer-balances"
            element={<CustomerBalances />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="/reviews"
            element={<Reviews />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
  path="/store-content"
  element={<StoreContent />}
/>


        </Route>
      </Route>

    </Routes>
  );
}

export default AppRouter;