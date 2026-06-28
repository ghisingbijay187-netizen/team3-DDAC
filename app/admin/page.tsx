"use client";

import { useEffect, useState } from "react";
import {
  Trash2, CheckCircle, AlertTriangle, Clock,
  XCircle, RefreshCw, ChevronDown, ChevronUp, Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS = ["received", "investigating", "resolved", "rejected"];

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

export default function AdminPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  // Verify admin access on load
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || !data.user.isAdmin) {
          window.location.href = "/login";
        }
      });
  }, []);

  function loadReports() {
    setLoading(true);

    fetch(`/api/reports?limit=1000`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        setAllReports(all);
        const notesMap: Record<number, string> = {};
        all.forEach((r: any) => { notesMap[r.id] = r.adminNotes ?? ""; });
        setNotes(notesMap);
      });

    const params = new URLSearchParams();
    params.set("limit", "100");
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const filtered = filterStatus
          ? all.filter((r: any) => r.status === filterStatus)
          : all;
        setReports(filtered);
        setLoading(false);
      });
  }

  useEffect(() => { loadReports(); }, [filterStatus]);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes[id] ?? "" }),
    });
    setUpdating(null);
    loadReports();
  }

  async function saveNotes(id: number, currentStatus: string) {
    setUpdating(id);
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: currentStatus, adminNotes: notes[id] ?? "" }),
    });
    setUpdating(null);
  }

  async function deleteReport(id: number) {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
    loadReports();
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = allReports.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-2">Manage and moderate submitted scam reports.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
          Logout
        </Button>
      </div>

      {/* Attention banners */}
      {allReports.filter((r) => r.status === "received").length > 0 && (
        <div
          className="mb-4 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => setFilterStatus("received")}
        >
          <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800">
              {allReports.filter((r) => r.status === "received").length} new report
              {allReports.filter((r) => r.status === "received").length !== 1 ? "s" : ""} waiting for review
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Click to filter and review them</p>
          </div>
        </div>
      )}

      {allReports.filter((r) => r.status === "investigating").length > 0 && (
        <div
          className="mb-6 flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => setFilterStatus("investigating")}
        >
          <RefreshCw className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              {allReports.filter((r) => r.status === "investigating").length} report
              {allReports.filter((r) => r.status === "investigating").length !== 1 ? "s" : ""} currently being investigated
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">Click to review investigation progress</p>
          </div>
        </div>
      )}

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATUS_OPTIONS.map((s) => {
          const Icon = statusIcon[s];
          const isActive = filterStatus === s;
          return (
            <Card
              key={s}
              className={`cursor-pointer transition-all hover:border-orange-300 ${
                isActive ? "border-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setFilterStatus(isActive ? "" : s)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{counts[s] ?? 0}</div>
                  <div className="text-xs text-gray-500 capitalize">{s}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-48"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={loadReports}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
        {filterStatus && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setFilterStatus("")}
          >
            Clear Filter
          </Button>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {reports.length} report{reports.length !== 1 ? "s" : ""}
          {filterStatus && ` — filtered by "${filterStatus}"`}
        </span>
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reports found</p>
          {filterStatus && (
            <p className="text-sm mt-1">
              No reports with status <strong>{filterStatus}</strong>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className={`border-l-4 ${
                report.status === "rejected" ? "border-l-red-500 bg-red-50/20" :
                report.status === "resolved" ? "border-l-green-500 bg-green-50/20" :
                report.status === "investigating" ? "border-l-yellow-500 bg-yellow-50/20" :
                "border-l-blue-400 bg-blue-50/10"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-orange-500">
                        {report.scamTypeName}
                      </span>
                      <Badge variant={statusVariant[report.status] ?? "default"}>
                        {report.status}
                      </Badge>
                      {report.adminNotes && (
                        <span className="text-xs text-gray-400 italic">has notes</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select
                      value={report.status}
                      onChange={(e) => updateStatus(report.id, e.target.value)}
                      className="w-36 text-xs h-8"
                      disabled={updating === report.id}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-700 h-8 px-2"
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    >
                      {expandedId === report.id
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />}
                      Notes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expandable notes section */}
                {expandedId === report.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Admin Notes / Rejection Reason
                    </label>
                    <Textarea
                      placeholder="e.g. Resolved — confirmed scam, user assisted. Rejected — insufficient evidence..."
                      className="text-sm min-h-[80px]"
                      value={notes[report.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                      }
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={() => saveNotes(report.id, report.status)}
                        disabled={updating === report.id}
                        className="bg-slate-800 hover:bg-slate-700"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {updating === report.id ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}