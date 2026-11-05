import type { ComponentType, SVGProps } from "react";
import {
  ClassificationIcon,
  ComplianceIcon,
  HomeIcon,
  IntegrationIcon,
  ReportsIcon,
  SettingsIcon,
} from "./components/astrix/icons";

export type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavigationItem = {
  name: string;
  href: string;
  icon: SvgIcon;
  badge?: string;
};

export const currentUser = {
  name: "Vansh Patel",
  email: "vanshpatel@gmail.com",
  avatar: "https://api.dicebear.com/10.x/notionists/svg",
  initials: "VP",
} as const;

export const notifications = [
  {
    id: "new-sale",
    title: "New MP3 license sold",
    description: "Midnight Trap was purchased via Whop checkout.",
    time: "12 min ago",
  },
  {
    id: "campaign-draft",
    title: "Campaign draft saved",
    description: "Your trap drops email is ready to send.",
    time: "1 hour ago",
  },
  {
    id: "beat-uploaded",
    title: "Beat uploaded",
    description: "Velvet Soul is live in your catalog.",
    time: "Yesterday",
  },
] as const;

export type MetricCard = {
  label: string;
  value: string;
  trend?: {
    value: string;
    label: string;
    tone: "positive" | "warning";
  };
  footnote?: string;
};

export type DateRange =
  | "today"
  | "last-7-days"
  | "last-30-days"
  | "last-90-days";

export const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "last-90-days", label: "Last 90 Days" },
];

export const dashboardMetricsByRange: Record<DateRange, MetricCard[]> = {
  today: [
    {
      label: "License conversion",
      value: "18.4%",
      trend: { value: "+0.8%", label: "vs yesterday", tone: "positive" },
    },
    {
      label: "Preview plays",
      value: "2,418",
      trend: { value: "6.1%", label: "vs yesterday", tone: "positive" },
    },
    {
      label: "Draft beats",
      value: "3",
      trend: { value: "+1", label: "since 09:00", tone: "warning" },
    },
    {
      label: "Checkout",
      value: "Whop",
      footnote: "Live payments enabled",
    },
  ],
  "last-7-days": [
    {
      label: "License conversion",
      value: "21.2%",
      trend: { value: "+1.4%", label: "this week", tone: "positive" },
    },
    {
      label: "Preview plays",
      value: "48,102",
      trend: { value: "12.5%", label: "vs last week", tone: "positive" },
    },
    {
      label: "Draft beats",
      value: "3",
      trend: { value: "+1", label: "this week", tone: "warning" },
    },
    {
      label: "Checkout",
      value: "Whop",
      footnote: "MP3 · WAV · Exclusive",
    },
  ],
  "last-30-days": [
    {
      label: "License conversion",
      value: "19.8%",
      trend: { value: "+2.1%", label: "this month", tone: "positive" },
    },
    {
      label: "Preview plays",
      value: "186,440",
      trend: { value: "9.8%", label: "vs last month", tone: "positive" },
    },
    {
      label: "Draft beats",
      value: "6",
      trend: { value: "+2", label: "this month", tone: "warning" },
    },
    {
      label: "Checkout",
      value: "Whop",
      footnote: "Live payments enabled",
    },
  ],
  "last-90-days": [
    {
      label: "License conversion",
      value: "17.6%",
      trend: { value: "+3.2%", label: "this quarter", tone: "positive" },
    },
    {
      label: "Preview plays",
      value: "512,890",
      trend: { value: "18.3%", label: "vs last quarter", tone: "positive" },
    },
    {
      label: "Draft beats",
      value: "11",
      trend: { value: "+4", label: "this quarter", tone: "warning" },
    },
    {
      label: "Checkout",
      value: "Whop",
      footnote: "4 live plans connected",
    },
  ],
};

export type ClassificationStatus = "approved" | "needs-review" | "processing";

export type ClassificationRow = {
  id: string;
  product: string;
  hsCode: string;
  confidence: string;
  status: ClassificationStatus;
  submitted: string;
};

export const classificationStream: ClassificationRow[] = [
  {
    id: "VEL-2026-0847",
    product: "Midnight Trap - Drake x Future Type Beat",
    hsCode: "142 BPM",
    confidence: "12.8k plays",
    status: "approved",
    submitted: "Sep 1, 10:15 AM",
  },
  {
    id: "VEL-2026-0846",
    product: "Red Rum - 90s Boom Bap x Hip Hop",
    hsCode: "96 BPM",
    confidence: "15.6k plays",
    status: "needs-review",
    submitted: "Aug 28, 9:15 AM",
  },
  {
    id: "VEL-2026-0845",
    product: "Velvet Soul - Brent Faiyaz x R&B Type Beat",
    hsCode: "88 BPM",
    confidence: "8.4k plays",
    status: "approved",
    submitted: "Aug 20, 2:30 PM",
  },
  {
    id: "VEL-2026-0844",
    product: "Night Drive - Afro Trap x Burna Type Beat",
    hsCode: "104 BPM",
    confidence: "11.2k plays",
    status: "processing",
    submitted: "Sep 1, 6:00 PM",
  },
];

const classificationProducts = [
  { product: "Midnight Trap - Drake x Future Type Beat", hsCode: "142 BPM" },
  { product: "Red Rum - 90s Boom Bap x Hip Hop", hsCode: "96 BPM" },
  { product: "Velvet Soul - Brent Faiyaz x R&B Type Beat", hsCode: "88 BPM" },
  { product: "Night Drive - Afro Trap x Burna Type Beat", hsCode: "104 BPM" },
  { product: "Chrome Hearts - Melodic Drill", hsCode: "140 BPM" },
  { product: "After Hours - The Weeknd Type", hsCode: "118 BPM" },
  { product: "Soft Launch - SZA x R&B", hsCode: "92 BPM" },
  { product: "Northside - UK Drill", hsCode: "144 BPM" },
  { product: "Low Tide - Lo-fi Hip Hop", hsCode: "82 BPM" },
  { product: "Gold Room - Jersey Club", hsCode: "132 BPM" },
  { product: "Glass House - Hyperpop", hsCode: "150 BPM" },
  { product: "Quiet Luxury - Pop Rap", hsCode: "102 BPM" },
  { product: "Black Ice - Dark Trap", hsCode: "138 BPM" },
  { product: "Sunset Strip - West Coast", hsCode: "98 BPM" },
  { product: "Velvet Rope - 90s R&B", hsCode: "86 BPM" },
  { product: "Pilot Light - Indie Rap", hsCode: "90 BPM" },
  { product: "Heatwave - Dancehall", hsCode: "108 BPM" },
  { product: "Moonmilk - Ambient Trap", hsCode: "126 BPM" },
  { product: "Steel Wool - Grime", hsCode: "140 BPM" },
  { product: "Paper Lantern - Afrobeats", hsCode: "110 BPM" },
  { product: "Night Shift - Tech House", hsCode: "124 BPM" },
  { product: "Cold Open - Cinematic", hsCode: "76 BPM" },
  { product: "Blue Hour - Alternative R&B", hsCode: "94 BPM" },
  { product: "Rack City - Crunk", hsCode: "80 BPM" },
  { product: "Soft Focus - Bedroom Pop", hsCode: "100 BPM" },
  { product: "Iron Gate - Boom Bap", hsCode: "93 BPM" },
  { product: "Pink Smoke - Pluggnb", hsCode: "148 BPM" },
  { product: "Riverbed - Folk Rap", hsCode: "84 BPM" },
  { product: "Arcade - 8-bit Trap", hsCode: "128 BPM" },
  { product: "White Noise - Experimental", hsCode: "120 BPM" },
] as const;

const classificationStatuses: ClassificationStatus[] = [
  "approved",
  "needs-review",
  "processing",
  "approved",
  "approved",
  "needs-review",
];

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function formatSubmitted(daysAgo: number, hour: number, minute: number) {
  const date = new Date(2026, 3, 5);
  date.setDate(date.getDate() - daysAgo);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "AM" : "PM";
  const paddedMinute = String(minute).padStart(2, "0");
  return `${months[date.getMonth()]} ${date.getDate()}, ${hour12}:${paddedMinute} ${suffix}`;
}

function buildClassificationQueue(count: number): ClassificationRow[] {
  return Array.from({ length: count }, (_, index) => {
    const product =
      classificationProducts[index % classificationProducts.length];
    const status =
      classificationStatuses[
        Math.floor(seededUnit(index + 1) * classificationStatuses.length)
      ];
    const confidence = (82 + seededUnit(index + 17) * 17).toFixed(1);
    const daysAgo = Math.floor(seededUnit(index + 41) * 45);
    const hour = 8 + Math.floor(seededUnit(index + 73) * 10);
    const minute = Math.floor(seededUnit(index + 99) * 60);
    const idNumber = 9000 - index;

    return {
      id: `VEL-2026-${String(idNumber).padStart(4, "0")}`,
      product: product.product,
      hsCode: product.hsCode,
      confidence: `${confidence}%`,
      status,
      submitted: formatSubmitted(daysAgo, hour, minute),
    };
  });
}

export const classificationQueue: ClassificationRow[] =
  buildClassificationQueue(56);

export type ReportStatus = "completed" | "processing";

export type ReportType =
  | "cf-28"
  | "cf-29"
  | "classification-audit"
  | "compliance-summary";

export type ReportTypeOption = {
  id: ReportType;
  title: string;
  description: string;
  typeLabel: string;
};

export type GeneratedReport = {
  id: string;
  name: string;
  type: ReportType;
  typeLabel: string;
  status: ReportStatus;
  generated: string;
};

export const reportTypes: ReportTypeOption[] = [
  {
    id: "cf-28",
    title: "Drop campaign",
    description: "Email followers when a new beat or pack hits the store",
    typeLabel: "Drops",
  },
  {
    id: "cf-29",
    title: "Payout summary",
    description: "Whop license sales, refunds, and producer payouts",
    typeLabel: "Payouts",
  },
  {
    id: "classification-audit",
    title: "Sales audit",
    description: "Lease conversions, exclusive offers, and abandoned checkouts",
    typeLabel: "Sales",
  },
  {
    id: "compliance-summary",
    title: "Catalog health",
    description: "Missing previews, unpriced licenses, and Whop plan gaps",
    typeLabel: "Catalog",
  },
];

export const generatedReports: GeneratedReport[] = [
  {
    id: "CMP-2026-0312",
    name: "September trap drops — follower blast",
    type: "cf-28",
    typeLabel: "Drops",
    status: "completed",
    generated: "Sep 02, 02:30 PM",
  },
  {
    id: "CMP-2026-0311",
    name: "August catalog health check",
    type: "compliance-summary",
    typeLabel: "Catalog",
    status: "completed",
    generated: "Sep 01, 09:00 AM",
  },
  {
    id: "CMP-2026-0308",
    name: "Whop payouts — August",
    type: "cf-29",
    typeLabel: "Payouts",
    status: "processing",
    generated: "Aug 28, 04:45 PM",
  },
  {
    id: "CMP-2026-0302",
    name: "License conversion audit",
    type: "classification-audit",
    typeLabel: "Sales",
    status: "completed",
    generated: "Aug 22, 11:20 AM",
  },
];

export const workspaceNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/studio", icon: HomeIcon },
  {
    name: "Beats",
    href: "/studio/beats",
    icon: ClassificationIcon,
    badge: String(classificationQueue.length),
  },
  { name: "Marketing", href: "/studio/marketing", icon: ReportsIcon },
  { name: "Payments", href: "/studio/payments", icon: IntegrationIcon },
  { name: "Upload", href: "/studio/upload", icon: ComplianceIcon },
  { name: "Settings", href: "/studio/settings", icon: SettingsIcon },
];
