"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";


const PLATFORMS = ["Facebook","Instagram","WhatsApp","Email","Phone","Telegram","TikTok","Twitter","Website","Other"];
const AGE_GROUPS = ["Under 18","18-24","25-34","35-44","45-54","55-64","65+","Prefer not to say"];

export default function ReportPage() {
  const router = useRouter();
  const [scamTypes, setScamTypes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", platform: "",
    scamTypeId: "", financialLoss: "", reporterAge: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        }
      });
  }, []);

  useEffect(() => {
    fetch("/api/scam-types").then((r) => r.json()).then(setScamTypes);
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.platform || !form.scamTypeId) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.title.length < 5) { setError("Title must be at least 5 characters."); return; }
    if (form.description.length < 20) { setError("Description must be at least 20 characters."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          platform: form.platform,
          scamTypeId: parseInt(form.scamTypeId),
          financialLoss: form.financialLoss ? parseFloat(form.financialLoss) : null,
          reporterAge: form.reporterAge || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Report Submitted!</h1>
        <p className="text-gray-500 mb-8">Thank you. Your report helps protect the community from scams.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setSubmitted(false); setForm({ title:"",description:"",platform:"",scamTypeId:"",financialLoss:"",reporterAge:"" }); }}>
            Submit Another
          </Button>
          <Button variant="outline" onClick={() => router.push("/reports")}>
            View All Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report a Scam</h1>
        <p className="text-gray-500 mt-2">Your report helps protect others in the community.</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. Fake job offer on Facebook" value={form.title} onChange={set("title")} />
              <p className="text-xs text-gray-400 mt-1">Minimum 5 characters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Scam Type <span className="text-red-500">*</span>
                </label>
                <Select value={form.scamTypeId} onChange={set("scamTypeId")}>
                  <option value="">Select a type...</option>
                  {scamTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Platform <span className="text-red-500">*</span>
                </label>
                <Select value={form.platform} onChange={set("platform")}>
                  <option value="">Select a platform...</option>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe what happened in as much detail as possible..."
                className="min-h-[140px]"
                value={form.description}
                onChange={set("description")}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 20 characters. Do not include personal information.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Financial Loss (USD) <span className="text-gray-400 font-normal">optional</span>
                </label>
                <Input type="number" min="0" placeholder="0.00" value={form.financialLoss} onChange={set("financialLoss")} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Age Group <span className="text-gray-400 font-normal">optional</span>
                </label>
                <Select value={form.reporterAge} onChange={set("reporterAge")}>
                  <option value="">Prefer not to say</option>
                  {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}