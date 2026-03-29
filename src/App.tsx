import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Operators from "./pages/Operators";
import Deposits from "./pages/Deposits";
import Products from "./pages/Products";
import Brands from "./pages/Brands";
import MaintenanceGroups from "./pages/MaintenanceGroups";
import DailyGroups from "./pages/DailyGroups";
import Suppliers from "./pages/Suppliers";
import Vehicles from "./pages/Vehicles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operators"
              element={
                <ProtectedRoute>
                  <Operators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deposits"
              element={
                <ProtectedRoute>
                  <Deposits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route path="/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
            <Route path="/maintenance-groups" element={<ProtectedRoute><MaintenanceGroups /></ProtectedRoute>} />
            <Route path="/daily-groups" element={<ProtectedRoute><DailyGroups /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
