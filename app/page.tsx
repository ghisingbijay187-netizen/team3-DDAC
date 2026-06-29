import Link from "next/link";
import { ShieldAlert, AlertTriangle, BarChart3, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCard } from "@/components/report-card";
import { formatCurrency } from "@/lib/utils";
export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [reportsRes, statsRes] = await Promise.all([
      fetch("http://localhost:3000/api/reports?limit=6&sortBy=newest", { cache: "no-store" }),
      fetch("http://localhost:3000/api/stats", { cache: "no-store" }),
    ]);
    const reports = reportsRes.ok ? await reportsRes.json() : [];
    const stats = statsRes.ok ? await statsRes.json() : null;
    return { reports, stats };
  } catch {
    return { reports: [], stats: null };
  }
}

export default async function Home() {
  const { reports, stats } = await getHomeData();

  const statCards = [
    { label: "Total Reports", value: stats?.summary?.totalReports ?? 0, icon: ShieldAlert, color: "text-orange-500" },
    { label: "Total Losses Reported", value: formatCurrency(stats?.summary?.totalLoss), icon: TrendingUp, color: "text-red-500" },
    { label: "Most Common Scam", value: stats?.summary?.mostCommonScam ?? "N/A", icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Reports This Month", value: stats?.summary?.reportedThisMonth ?? 0, icon: BarChart3, color: "text-blue-500" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <ShieldAlert className="h-4 w-4" />
            Community-Powered Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Expose Scams.<br />
            <span className="text-orange-500">Protect Others.</span>
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            ScamShield is a free community platform to report, track, and learn about online scams — keeping Nepal and the world safer.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 font-bold shadow-lg">
                <AlertTriangle className="h-5 w-5" />
                Report a Scam
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20">
                Browse Reports
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center p-4">
                <Icon className={`h-7 w-7 mx-auto mb-2 ${color}`} />
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent reports */}
      <section className="py-14 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
              <p className="text-gray-500 mt-1">Latest scams reported by the community</p>
            </div>
            <Link href="/reports">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No reports yet. Be the first to report a scam.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.map((report: any) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-14 px-4 bg-white border-t">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How ScamShield Helps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "Report Incidents", desc: "Submit detailed scam reports so others know what to watch out for.", href: "/report", color: "bg-orange-50 text-orange-500" },
              { icon: BarChart3, title: "Track Trends", desc: "See live statistics on the most common scams and affected platforms.", href: "/stats", color: "bg-blue-50 text-blue-500" },
              { icon: BookOpen, title: "Learn to Recognise", desc: "Browse our scam encyclopedia to learn warning signs before it's too late.", href: "/scam-types", color: "bg-green-50 text-green-500" },
            ].map(({ icon: Icon, title, desc, href, color }) => (
              <Link key={title} href={href}>
                <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}