import { HomeIcon } from "lucide-react";
import Index from "./pages/Index.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  // Note: LLM Generator, Schema Validator and Test Runner are available via browser console
  // See LLM_INTEGRATION.md and AUTOMATED_TESTING.md for usage instructions
];
