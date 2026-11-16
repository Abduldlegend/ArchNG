import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AdminShell, ProviderShell, PublicLayout } from "./components/layout";
import { Toast } from "./components/ui";
import Discover from "./features/Discover";
import { Directory, SavedPractices } from "./features/Directory";
import ArchitectProfile from "./features/ArchitectProfile";
import ProjectDetail from "./features/ProjectDetail";
import Auth from "./features/Auth";
import RequestDemo from "./features/RequestDemo";
import { MyRequests, RequestDetail } from "./features/Requests";
import { LeadsInbox, ProfileEditor, ProjectEditor, ProviderDashboard } from "./features/Provider";
import { AdminDashboard, VerificationQueue } from "./features/Admin";
import { NotFound, SystemStates } from "./features/SystemStates";
import { useApp } from "./context/context";

function AppToast() {
  const { toast } = useApp();
  return <Toast message={toast} />;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Discover />} />
            <Route path="architects" element={<Directory />} />
            <Route path="architects/:slug" element={<ArchitectProfile />} />
            <Route path="architects/:slug/accepted" element={<ArchitectProfile forceUnlocked />} />
            <Route path="saved" element={<SavedPractices />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="request-demo/:slug" element={<RequestDemo />} />
            <Route path="requests" element={<MyRequests />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="system-states" element={<SystemStates />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/signin" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          <Route path="/provider" element={<ProviderShell />}>
            <Route index element={<ProviderDashboard />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="projects/:id/edit" element={<ProjectEditor />} />
            <Route path="leads" element={<LeadsInbox />} />
          </Route>

          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="verification" element={<VerificationQueue />} />
          </Route>
        </Routes>
        <AppToast />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
