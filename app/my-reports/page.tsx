"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert, Clock, CheckCircle,
  XCircle, RefreshCw, AlertTriangle, Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
  received: "info",
  investigating: "warning",
  resolved: "success",
  rejected: "danger",
};

const statusIcon: Record<string, any> = {
  received: Clock,
  investigating: RefreshCw,
  resolved: CheckCircle,
  rejected: XCircle,
};

const statusMessage: Record<string, string> = {
  received: "Your report has been received and is waiting for review.",
  investigating: "Our team is currently investigating this report.",
  resolved: "This report has been resolved.",
  rejected: "This report was not accepted.",
};

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        // Fetch their reports
        fetch("/api/my-reports")
          .then((r) => r.json())
          .then((reports) => {
            setReports(Array.isArray(reports) ? reports : []);
            setLoading(false);
          });
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">
            Reports submitted by <span className="font-semibold text-orange-500">@{user?.username}</span>
          </p>
        </div>
        <Link href="/report">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20">
          <ShieldAlert className="h-14 w-14 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No reports yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            You have not submitted any scam reports yet.
          </p>
          <Link href="/report">
            <Button>
              <Plus className="h-4 w-4" />
              Submit Your First Report
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const Icon = statusIcon[report.status] ?? Clock;
            return (
              <Card
                key={report.id}
                className={`border-l-4 ${
                  report.status === "rejected" ? "border-l-red-500" :
                  report.status === "resolved" ? "border-l-green-500" :
                  report.status === "investigating" ? "border-l-yellow-500" :
                  "border-l-blue-400"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                          {report.scamTypeName}
                        </span>
                        <Badge variant={statusVariant[report.status] ?? "default"}>
                          <Icon className="h-3 w-3 mr-1" />
                          {report.status}
                        </Badge>
                      </div>
                      <Link href={`/reports/${report.id}`}>
                        <h3 className="font-bold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">
                          {report.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        <span>{report.platform}</span>
                        <span>{formatDate(report.createdAt)}</span>
                        {report.financialLoss != null && (
                          <span className="text-red-500 font-medium">
                            {formatCurrency(report.financialLoss)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status message */}
                  <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    report.status === "rejected" ? "bg-red-50 text-red-700" :
                    report.status === "resolved" ? "bg-green-50 text-green-700" :
                    report.status === "investigating" ? "bg-yellow-50 text-yellow-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>
                    <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{statusMessage[report.status]}</p>
                      {report.adminNotes && (
                        <p className="mt-1 font-semibold">
                          Admin note: {report.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}