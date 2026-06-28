"use client";

import { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/report-card";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [scamTypes, setScamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scamTypeId, setScamTypeId] = useState("");
  const [platform, setPlatform] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    fetch("/api/scam-types")
      .then((r) => r.json())
      .then(setScamTypes);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (scamTypeId) params.set("scamTypeId", scamTypeId);
    if (platform) params.set("platform", platform);
    if (sortBy) params.set("sortBy", sortBy);
    if (dateRange) params.set("dateRange", dateRange);

    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((data) => { setReports(data); setLoading(false); });
  }, [search, scamTypeId, platform, sortBy, dateRange]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Reports</h1>
        <p className="text-gray-500 mt-2">Community-submitted scam reports from around the world</p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <SlidersHorizontal className="h-4 w-4" />
          Filter & Search
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={scamTypeId} onChange={(e) => setScamTypeId(e.target.value)}>
            <option value="">All Scam Types</option>
            {scamTypes.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">All Platforms</option>
            {["Facebook","Instagram","WhatsApp","Email","Phone","Telegram","TikTok","Twitter","Website","Other"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_loss">Highest Loss</option>
          </Select>
        </div>
        <div className="flex gap-3 mt-3">
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-48">
            <option value="">Any Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </Select>
          <Button variant="outline" size="sm" onClick={() => {
            setSearch(""); setScamTypeId(""); setPlatform("");
            setSortBy("newest"); setDateRange("");
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{reports.length} report{reports.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}