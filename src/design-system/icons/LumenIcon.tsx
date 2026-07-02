// ============================================================
// LUMEN Design System — Unified Icon System (Lucide)
// ============================================================

import React from "react";
import {
  // Navigation & UI
  Home,
  Bell,
  Settings,
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  Menu,
  Filter,
  SlidersHorizontal,
  // Domain — Reports & Issues
  Flag,
  FileText,
  Clipboard,
  ClipboardList,
  // Domain — Infrastructure
  Zap,
  Droplets,
  Flame,
  Lightbulb,
  Car,
  Building2,
  Landmark,
  Package,
  Trash2,
  AlertOctagon,
  // Domain — Engineer
  Wrench,
  HardHat,
  Truck,
  Camera,
  Upload,
  CheckSquare,
  Timer,
  BarChart3,
  TrendingUp,
  Activity,
  // Domain — Maps & Location
  MapPin,
  Map,
  Navigation,
  Navigation2,
  Compass,
  LocateFixed,
  Route,
  // Domain — Communication
  MessageSquare,
  Phone,
  Mail,
  Share2,
  // Domain — AI & Analytics
  Cpu,
  BrainCircuit,
  Sparkles,
  PieChart,
  LineChart,
  // Domain — Media
  Image as ImageIcon,
  Paperclip,
  Link,
  // Domain — Status
  Clock,
  Calendar,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Circle,
  // Profile & Auth
  LogOut,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  // Misc
  Star,
  Heart,
  Bookmark,
  Download,
  ExternalLink,
  Globe,
  Sun,
  Moon,
  WifiOff,
  Battery,
} from "lucide-react-native";

// Domain-specific icon aliases for LUMEN
const LUMEN_ICONS = {
  // Navigation
  home: Home,
  notifications: Bell,
  settings: Settings,
  profile: User,
  search: Search,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  close: X,
  add: Plus,
  check: Check,
  menu: Menu,
  filter: Filter,
  sliders: SlidersHorizontal,
  back: ArrowLeft,
  forward: ArrowRight,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,

  // Reports
  report: Flag,
  reportList: ClipboardList,
  reportDetails: FileText,
  clipboard: Clipboard,

  // Infrastructure Issues
  road: Car,
  electricity: Zap,
  water: Droplets,
  fire: Flame,
  streetlight: Lightbulb,
  garbage: Trash2,
  bridge: Landmark,
  building: Building2,
  emergency: AlertOctagon,
  other: Package,

  // Engineer
  engineer: HardHat,
  tools: Wrench,
  vehicle: Truck,
  camera: Camera,
  upload: Upload,
  taskCheck: CheckSquare,
  timer: Timer,

  // Analytics
  analytics: BarChart3,
  trend: TrendingUp,
  activity: Activity,
  pie: PieChart,
  line: LineChart,

  // Maps
  mapPin: MapPin,
  map: Map,
  navigate: Navigation,
  navigate2: Navigation2,
  compass: Compass,
  locate: LocateFixed,
  route: Route,

  // Communication
  comment: MessageSquare,
  phone: Phone,
  email: Mail,
  share: Share2,

  // AI
  ai: BrainCircuit,
  cpu: Cpu,
  spark: Sparkles,

  // Media
  image: ImageIcon,
  attachment: Paperclip,
  link: Link,

  // Status
  clock: Clock,
  calendar: Calendar,
  refresh: RefreshCw,
  reset: RotateCcw,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  help: HelpCircle,
  circle: Circle,

  // Auth & Profile
  logout: LogOut,
  shield: Shield,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  biometric: Fingerprint,

  // Misc
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  download: Download,
  external: ExternalLink,
  globe: Globe,
  sun: Sun,
  moon: Moon,
  offline: WifiOff,
  battery: Battery,

  // Alerts
  alert: AlertTriangle,
} as const;

export type LumenIconName = keyof typeof LUMEN_ICONS;

export interface LumenIconProps {
  name: LumenIconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  color?: string;
  strokeWidth?: number;
}

const SIZES: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
};

export function LumenIcon({ name, size = "md", color = "#101828", strokeWidth = 2 }: LumenIconProps) {
  const IconComponent = LUMEN_ICONS[name];
  const resolvedSize = typeof size === "number" ? size : (SIZES[size] ?? 20);

  if (!IconComponent) return null;
  return <IconComponent size={resolvedSize} color={color} strokeWidth={strokeWidth} />;
}
