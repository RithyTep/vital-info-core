import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import PatientEdit from "./pages/PatientEdit";
import Doctors from "./pages/Doctors";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import POS from "@/pages/POS"
import History from "@/pages/History";
const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patient/:id" element={<PatientDetail />} />
        <Route path="/patients/:id/edit" element={<PatientEdit />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/history"  element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
