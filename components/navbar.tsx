"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { Logo } from "./logo";

interface Props {
  boardTitle?: string;
  onEditBoard?: () => void;

  onFilterClick?: () => void;
  filterCount?: number;
}

export default function Navbar({
  boardTitle,
  onEditBoard,
  onFilterClick,
  filterCount = 0,
}: Props) {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  if (isDashboardPage) {
    return (
      <header className="border-b border-purple-200 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo className="w-6 h-6 sm:h-8 sm:w-8 text-purple-500" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              Task<span className="text-purple-500">Flow</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 rounded-full border-2 border-purple-500">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  if (isBoardPage) {
    return (
      <header className="border-b border-purple-200 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-purple-700 hover:text-gray-900 shrink-0"
              >
                <Button
                  size="sm"
                  className="text-sm bg-purple-500 hover:bg-purple-600"
                >
                  <ArrowLeft />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2 min-w-0">
                <Logo className="h-6 w-6 text-purple-500" />
                <div className="items-center space-x-1 min-w-0">
                  <span className="text-lg font-bold text-gray-900 truncate">
                    {boardTitle}
                  </span>
                  {onEditBoard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 shrink-0 hover:bg-purple-100"
                      onClick={onEditBoard}
                    >
                      <MoreHorizontal className="text-purple-600" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              {onFilterClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`border-2 border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600 ${
                    filterCount > 0 ? "bg-purple-100" : ""
                  }`}
                  onClick={onFilterClick}
                >
                  <Filter className="h-3 w-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                  {filterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs ml-1 bg-purple-50 border-purple-500"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-purple-200 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo className="w-6 h-6 sm:h-8 sm:w-8 text-purple-500" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            Task<span className="text-purple-500">Flow</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-purple-700 hidden sm:block">
                Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress}
              </span>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="text-xs sm:text-sm bg-purple-500 hover:bg-purple-600"
                >
                  Go to Dashboard <ArrowRight />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-x-1">
              <SignInButton>
                <Button
                  variant="outline"
                  className="text-xs sm:text-sm border-2 border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="text-xs sm:text-sm bg-purple-500 hover:bg-purple-600">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
