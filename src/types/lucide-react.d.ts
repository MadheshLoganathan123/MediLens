declare module 'lucide-react' {
    import { FC, SVGProps } from 'react'
    export interface IconProps extends SVGProps<SVGSVGElement> {
        size?: string | number
        color?: string
        strokeWidth?: string | number
    }
    export type Icon = FC<IconProps>
    export const AlertCircle: Icon
    export const FolderOpen: Icon
    export const MapPin: Icon
    export const User: Icon
    export const Heart: Icon
    export const Activity: Icon
    export const Pill: Icon
    export const Calendar: Icon
    export const Clock: Icon
    export const Home: Icon
    export const Settings: Icon
    export const Bell: Icon
    export const Zap: Icon
    export const Droplet: Icon
    export const Moon: Icon
    export const TrendingUp: Icon
    export const Target: Icon
    export const Smartphone: Icon
    export const BookOpen: Icon
    export const Phone: Icon
    export const LogOut: Icon
    export const Users: Icon
    export const FileText: Icon
    export const Shield: Icon
    export const ChevronLeft: Icon
    export const Search: Icon
    export const Navigation: Icon
    export const Star: Icon
    export const Map: Icon
    export const List: Icon
    export const Stethoscope: Icon
    export const Building2: Icon
    export const CheckCircle: Icon
    export const Loader2: Icon
}
