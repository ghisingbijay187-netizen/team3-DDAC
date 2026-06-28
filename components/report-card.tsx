import Link from "next/link";
import { Calendar, Monitor, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

interface ReportCardProps {
  report: {
    id: number;
    title: string;
    description: string;
    platform: string;
    scamTypeName: string;
    financialLoss?: number | null;
    status: string;
    createdAt: string;
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
    received: "info",
    investigating: "warning",
    resolved: "success",
    rejected: "danger",
  };

  return (
    <Link href={`/reports/${report.id}`}>
      <Card className="hover:shadow-md hover:border-orange-200 transition-all cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
              {report.scamTypeName}
            </span>
            <Badge variant={statusVariant[report.status] ?? "default"}>
              {report.status}
            </Badge>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{report.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{report.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" /> {report.platform}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(report.createdAt)}
            </span>
            {report.financialLoss != null && (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <DollarSign className="h-3 w-3" /> {formatCurrency(report.financialLoss)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}