import Link from "next/link";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              ScamShield
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              A community platform dedicated to protecting people by tracking and exposing online scams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">Resources</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/tips" className="hover:text-orange-400 transition-colors">Safety Tips</Link></li>
              <li><Link href="/scam-types" className="hover:text-orange-400 transition-colors">Scam Encyclopedia</Link></li>
              <li><Link href="/stats" className="hover:text-orange-400 transition-colors">Statistics</Link></li>
              <li><Link href="/reports" className="hover:text-orange-400 transition-colors">Browse Reports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">Take Action</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/report" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Report an Incident
                </Link>
              </li>
              <li><Link href="/admin" className="hover:text-orange-400 transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          © {new Date().getFullYear()} ScamShield. All rights reserved.
        </div>
      </div>
    </footer>
  );
}