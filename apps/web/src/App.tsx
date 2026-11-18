import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import type { ReactNode } from "react";
import { IMG } from "./data";
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

function BootGate({ children }: { children: ReactNode }) {
  const { ready, bootError, catalogError, retryBoot } = useApp();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-hairline border-t-terracotta" />
          <p className="mt-5 font-serif text-headline-sm text-ink">Opening the registry</p>
          <p className="mt-2 text-body-sm text-stone">Loading verified practices and published monographs.</p>
        </div>
      </div>
    );
  }

  const error = bootError ?? catalogError;
  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
        <img src={IMG.atrium} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="relative w-full max-w-md rounded-panel border border-hairline bg-card p-8 text-center shadow-lift">
          <p className="font-serif text-headline-sm text-ink">The registry is unavailable</p>
          <p className="mt-3 text-body-sm text-stone">{error}</p>
          <p className="mt-2 text-body-sm text-stone-soft">
            Confirm the API is running on port 4000, then try again.
          </p>
          <button
            type="button"
            onClick={() => void retryBoot()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-ink px-5 text-body-sm text-white hover:bg-stone"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <BootGate>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Discover />} />
            <Route path="architects" element={<Directory />} />
            <Route path="architects/:slug" element={<ArchitectProfile />} />
            <Route path="architects/:slug/accepted" element={<ArchitectProfile />} />
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
        </BootGate>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
