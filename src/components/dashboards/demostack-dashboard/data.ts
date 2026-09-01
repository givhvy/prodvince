import type { ComponentType, SVGProps } from "react";
import {
  BarChart3,
  CreditCard,
  Mail,
  Music2,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { HomeIcon, NavTitleIcon } from "./components/demostack/icons";

export type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavigationItem = {
  name: string;
  href: string;
  icon: SvgIcon;
  badge?: string;
};

export const companies = [
  {
    name: "Velta Beats",
    role: "Producer",
    members: [{ name: "You", avatar: "", initials: "VB" }],
  },
] as const;

export const currentUser = {
  name: "Producer",
  email: "studio@velta.local",
  avatar: "",
  initials: "VB",
} as const;

export const notifications = [
  {
    id: "sale",
    title: "New lease purchase",
    description: "A buyer licensed your latest trap beat.",
    time: "2 min ago",
  },
  {
    id: "campaign",
    title: "Campaign ready",
    description: "Your email draft is ready to send.",
    time: "1 hour ago",
  },
] as const;

export const workspaceNavigation: NavigationItem[] = [
  { name: "Overview", href: "/studio", icon: HomeIcon },
  { name: "Beats", href: "/studio/beats", icon: Music2 },
  { name: "Upload", href: "/studio/upload", icon: Upload },
  { name: "Email", href: "/studio/marketing", icon: Mail, badge: "Beta" },
  { name: "Customers", href: "/studio/customers", icon: Users },
];

export const adminNavigation: NavigationItem[] = [
  { name: "Payments", href: "/studio/payments", icon: CreditCard },
  { name: "Analytics", href: "/studio/beats", icon: BarChart3 },
  { name: "Settings", href: "/studio/settings", icon: Settings },
];

export const pageDetails = {
  "/studio": { title: "Overview", icon: NavTitleIcon },
  "/studio/beats": { title: "Beats", icon: Music2 },
  "/studio/upload": { title: "Upload", icon: Upload },
  "/studio/marketing": { title: "Email", icon: Mail },
  "/studio/customers": { title: "Customers", icon: Users },
  "/studio/payments": { title: "Payments", icon: CreditCard },
  "/studio/settings": { title: "Settings", icon: Settings },
} as const;
