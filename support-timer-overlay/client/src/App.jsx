import { OverlayPage } from "./pages/OverlayPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

export function App() {
  const path = window.location.pathname;
  if (path === "/overlay") return <OverlayPage />;
  return <SettingsPage />;
}
