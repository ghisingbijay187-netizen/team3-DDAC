import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <ShieldAlert className="h-16 w-16 text-orange-500 mb-6 opacity-50" />
      <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        This page doesn't exist. It may have been moved or deleted.
      </p>
      <Link href="/">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
}