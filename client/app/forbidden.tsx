"use client";

import { House, UserLock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition } from "react";
import { logoutAction } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Forbidden() {
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="pointer-events-none">
            <Image
              alt="Access Denied"
              height={500}
              src="/unauthorized.svg"
              width={500}
            />
          </EmptyMedia>
          <EmptyTitle className="font-bold text-3xl text-blue-900">
            Access Restricted
          </EmptyTitle>
          <EmptyDescription className="text-blue-600 text-sm md:text-base">
            It looks like you don't have the necessary permissions to view this
            page. This section is reserved for Team Lead. If you believe you
            should have access, please reach out to your project manager.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">
                <House />
                Go to Dashboard
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="secondary">
              <UserLock />
              Logout & Switch Account
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
