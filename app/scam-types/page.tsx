import { AlertTriangle, Fish, Heart, TrendingUp, Monitor, Briefcase, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";

const iconMap: Record<string, any> = {
  fish: Fish,
  heart: Heart,
  "trending-up": TrendingUp,
  monitor: Monitor,
  briefcase: Briefcase,
  gift: Gift,
};

async function getScamTypes() {
  try {
    const res = await fetch("http://localhost:3000/api/scam-types", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ScamTypesPage() {
  const scamTypes = await getScamTypes();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Scam Encyclopedia</h1>
        <p className="text-gray-500 mt-2">
          Learn to recognise the most common types of online scams and their warning signs.
        </p>
      </div>

      {scamTypes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No scam types found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scamTypes.map((type: any) => {
            const Icon = iconMap[type.icon] ?? AlertTriangle;
            return (
              <Card key={type.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex p-3 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">{type.name}</h2>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{type.description}</p>

                      {type.warningSigns?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Warning Signs
                          </p>
                          <ul className="space-y-1.5">
                            {type.warningSigns.map((sign: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
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