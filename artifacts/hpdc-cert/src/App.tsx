import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk, useUser } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useSyncUser } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { LanguageProvider } from "@/contexts/language-context";
import NotFound from "@/pages/not-found";
import VerifyPage from "@/pages/verify";
import AboutPage from "@/pages/about";
import AdminPage from "@/pages/admin";
import DashboardPage from "@/pages/dashboard";
import CertificatePage from "@/pages/certificate";
import HomePage from "@/pages/home";
import QrViewPage from "@/pages/qr-view";
import RegistryPage from "@/pages/registry";
import SignUpPageCustom from "@/pages/sign-up-page";
import SignInPageCustom from "@/pages/sign-in-page";
import ProfileSetupPage from "@/pages/profile-setup";
import ApplyPage from "@/pages/apply";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const rawClerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkProxyUrl = rawClerkProxyUrl && rawClerkProxyUrl.trim() !== "" ? rawClerkProxyUrl : undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}


function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><HomePage /></Show>
    </>
  );
}

function DashboardRoute() {
  return (
    <>
      <Show when="signed-in"><DashboardPage /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function AdminRoute() {
  return (
    <>
      <Show when="signed-in"><AdminPage /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function ProfileSetupRoute() {
  return (
    <>
      <Show when="signed-in"><ProfileSetupPage /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function ApplyRoute() {
  return (
    <>
      <Show when="signed-in"><ApplyPage /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function UserSync() {
  const { user, isLoaded } = useUser();
  const { mutateAsync: syncUser } = useSyncUser();
  const syncAttempted = useRef(false);
  const qc = useQueryClient();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (isLoaded && user && !syncAttempted.current) {
      syncAttempted.current = true;
      
      let onboardingPayload: Record<string, string> | null = null;
      try {
        const raw = localStorage.getItem("hpdc_onboarding_payload");
        if (raw) {
          onboardingPayload = JSON.parse(raw);
          localStorage.removeItem("hpdc_onboarding_payload");
        }
      } catch { }

      const requestedRole = localStorage.getItem("hpdc_demo_mode") as "admin" | "company" | null;
      if (requestedRole) localStorage.removeItem("hpdc_demo_mode");

      syncUser({
        data: {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          companyName: (onboardingPayload?.companyName) ?? user.fullName ?? undefined,
          requestedRole: requestedRole ?? undefined
        }
      }).then(() => {
        if (!onboardingPayload) return Promise.resolve();
        return fetch(`${basePath}/api/users/onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(onboardingPayload),
        });
      }).then(() => {
        qc.invalidateQueries({ queryKey: ["/api/users/me"] });
      }).catch(() => { });
    }
  }, [isLoaded, user, syncUser, qc, basePath]);

  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const clerk = useClerk();
  const queryClient = useQueryClient();
  useEffect(() => {
    return clerk.addListener((e) => {
      if (!e.user) {
        queryClient.clear();
      }
    });
  }, [clerk, queryClient]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <UserSync />
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?"><SignInPageCustom /></Route>
        <Route path="/sign-up/*?"><SignUpPageCustom /></Route>
        <Route path="/about" component={AboutPage} />
        <Route path="/verify" component={VerifyPage} />
        <Route path="/certificate" component={CertificatePage} />
        <Route path="/registry" component={RegistryPage} />
        <Route path="/qr/:id" component={QrViewPage} />
        <Route path="/dashboard"><DashboardRoute /></Route>
        <Route path="/profile-setup"><ProfileSetupRoute /></Route>
        <Route path="/apply"><ApplyRoute /></Route>
        <Route path="/admin"><AdminRoute /></Route>
        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <ClerkProviderWithRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
