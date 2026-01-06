import { Home } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="pointer-events-none">
            <Image
              alt="Page Not Found"
              height={500}
              src="/not-found.svg"
              width={500}
            />
          </EmptyMedia>
          <EmptyTitle className="font-bold text-3xl text-blue-900">
            Page Not Found
          </EmptyTitle>
          <EmptyDescription className="text-blue-600 text-sm md:text-base">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <Home />
              Back to Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
