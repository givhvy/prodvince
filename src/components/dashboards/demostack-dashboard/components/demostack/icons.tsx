import type { ComponentType, SVGProps } from "react";
import {
  BarChart3,
  Building2,
  ChevronsUpDown,
  Command,
  CreditCard,
  FolderOpen,
  GraduationCap,
  Headphones,
  Home,
  Lightbulb,
  Mail,
  Music2,
  Play,
  Search,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

function icon(Icon: ComponentType<IconProps>) {
  return function WrappedIcon(props: IconProps) {
    return <Icon {...props} />;
  };
}

export const BuildingIcon = icon(Building2);
export const CaretUpDownIcon = icon(ChevronsUpDown);
export const NavSearchIcon = icon(Search);
export const NavCmdIcon = icon(Command);
export const HomeIcon = icon(Home);
export const DemostacksIcon = icon(Music2);
export const ShowcasesIcon = icon(Headphones);
export const VideosIcon = icon(Upload);
export const GroupGenericIcon = icon(Users);
export const NavTitleIcon = icon(BarChart3);
export const DashboardFolderPlusIcon = icon(Upload);
export const DashboardVideoIcon = icon(Mail);
export const DashboardImagesIcon = icon(CreditCard);
export const FigGraduationIcon = icon(GraduationCap);
export const FigLightbulbIcon = icon(Lightbulb);
export const FigPlayIcon = icon(Play);
export const FigSparkleIcon = icon(Sparkles);
export const InspireOneIcon = icon(Music2);
export const InspireTwoIcon = icon(CreditCard);
export const InspireThreeIcon = icon(Mail);
export const InspireFourIcon = icon(BarChart3);

export function BgFolderVector(props: IconProps) {
  return <FolderOpen {...props} className={`text-muted-foreground/30 ${props.className ?? ""}`} />;
}
