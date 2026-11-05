import { Clock } from 'lucide-react'
import {
  CheckCircleIcon,
  WarningCircleIcon,
} from './icons'
import type { ClassificationStatus, ReportStatus } from '../../data'

const classificationStatusConfig = {
  approved: {
    label: 'Live',
    className: 'bg-success/10 text-success',
    icon: CheckCircleIcon,
  },
  'needs-review': {
    label: 'Draft',
    className: 'bg-primary/10 text-primary',
    icon: WarningCircleIcon,
  },
  processing: {
    label: 'Encoding',
    className: 'bg-info/10 text-info',
    icon: Clock,
  },
} as const

const reportStatusConfig = {
  completed: {
    label: 'Sent',
    className: 'bg-success/10 text-success',
    icon: CheckCircleIcon,
  },
  processing: {
    label: 'Drafting',
    className: 'bg-info/10 text-info',
    icon: Clock,
  },
} as const

export function ClassificationStatusBadge({
  status,
}: {
  status: ClassificationStatus
}) {
  const config = classificationStatusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex h-7.5 items-center gap-2 rounded-xl py-1 pr-4 pl-3 text-sm ${config.className}`}
    >
      <Icon className="size-4" />
      {config.label}
    </span>
  )
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const config = reportStatusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex h-7.5 items-center gap-2 rounded-xl py-1 pr-4 pl-3 text-sm ${config.className}`}
    >
      <Icon className="size-4" />
      {config.label}
    </span>
  )
}
