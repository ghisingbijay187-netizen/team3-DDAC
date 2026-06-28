"use client";

import { useEffect, useState } from "react";
import {
  MousePointer, Lock, Shield, AlertTriangle, CreditCard,
  Phone, UserX, Settings, Flag, Building2, LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "mouse-pointer": MousePointer,
  lock: Lock,
  shield: Shield,
  "alert-triangle": AlertTriangle,
  "credit-card": CreditCard,
  phone: Phone,
  "user-x": UserX,
  settings: Settings,
  flag: Flag,
  "building-2": Building2,
};

const categories = [
  { key: "", label: "All Tips" },
  { key: "general", label: "General Safety" },
  { key: "recognition", label: "Recognition" },
  { key: "privacy", label: "Privacy" },
  { key: "recovery", label: "Recovery" },
];

export default function TipsPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = activeCategory ? `?category=${activeCategory}` : "";
    fetch(`/api/tips${qs}`)
      .then((r) => r.json())
      .then((data) => { setTips(data); setLoading(false); });
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Safety Tips</h1>
        <p className="text-gray-500 mt-2">
          Practical advice to help you stay safe online and avoid becoming a victim.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map(({ key, label }) => (
          <Button
            key={key}
            variant={activeCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(key)}
            className={cn(
              activeCategory === key
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No tips found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tips.map((tip: any) => {
            const Icon = iconMap[tip.icon] ?? Shield;
            return (
              <Card key={tip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex gap-4">
                  <div className="inline-flex p-3 rounded-xl bg-orange-50 text-orange-500 h-fit flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900">{tip.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                        {tip.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{tip.content}</p>
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