import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Monitor, DollarSign, User, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getReport(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/reports/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
  received: "info",
  investigating: "warning",
  resolved: "success",
  rejected: "danger",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/reports">
        <Button variant="ghost" size="sm" className="mb-6 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Button>
      </Link>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">
              {report.scamTypeName}
            </span>
            <Badge variant={statusVariant[report.status] ?? "default"}>
              {report.status}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">{report.title}</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><Monitor className="h-3 w-3" />Platform</span>
              <span className="text-sm font-semibold text-gray-700">{report.platform}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" />Reported</span>
              <span className="text-sm font-semibold text-gray-700">{formatDate(report.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><DollarSign className="h-3 w-3" />Financial Loss</span>
              <span className="text-sm font-semibold text-red-600">{formatCurrency(report.financialLoss)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><User className="h-3 w-3" />Reporter Age</span>
              <span className="text-sm font-semibold text-gray-700">{report.reporterAge ?? "Not provided"}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{report.description}</p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Stay Safe</p>
                <p className="text-sm text-orange-700 mt-1">
                  If you have encountered this scam, do not send any money or personal information. Report it to your local authorities immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}