"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  SearchCheck,
  ArrowLeftRight,
  ShieldCheck,
  ArrowRight,
  Medal,
  GraduationCap,
  Code2,
  Briefcase,
  User
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import Navbar from "@/components/navbar";

export default function HomePage() {

  const { isSignedIn } = useUser();

  const features = [
    {
      icon: LayoutDashboard,
      title: "Clear Visual Workflow",
      description:
        "Create unlimited boards. Structure your workflow the way you work - simple, flexible, and designed for clarity.",
    },
    {
      icon: SearchCheck,
      title: "Find What Matters Instantly",
      description:
        "Quickly locate tasks across boards using smart search and filters, helping you focus only on what matters.",
    },
    {
      icon: ArrowLeftRight,
      title: "Adapt to Any Workflow",
      description:
        "Move tasks between stages, reorder them with ease, rename them and create as many workflow steps needed.",
    },
    {
      icon: ShieldCheck,
      title: "Always in Sync & Secure",
      description:
        "Enterprise-grade security to protect your data with instantaneous realtime-sync to keep you updated.",
    },
  ];

  const users = [
    {
      icon: GraduationCap,
      title: "Students",
      description:
        "Organize assignments, track deadlines, and manage semesters.",
    },
    {
      icon: Code2,
      title: "Developers",
      description:
        "Plan projects, track features and bugs, and maintain focus.",
    },
    {
      icon: Briefcase,
      title: "Managers & Founders",
      description:
        "Get clear overview of progress & priorities without any complexity.",
    },
    {
      icon: User,
      title: "Individuals",
      description:
        "Stay on top of personal goals, daily tasks, and long-term plans.",
    },
  ];
  

  return (
    <div className="min-h-screen bg-radial from-white to-purple-50">
      <Navbar />

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mx-auto mb-4 w-fit flex items-center border border-purple-700 shadow-sm p-4 bg-purple-100 text-purple-700 rounded-full font-bold uppercase">
            <Medal className="h-6 w-6 mr-2" />
            built for speed, focus, & clarity
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Way to Stay{" "}
            <span className="text-purple-500">Organized</span> - Task
            <span className="text-purple-500">Flow</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Plan projects, organize tasks, track progress, and streamline your
            workflow with fast, flexible Kanban system. From daily planning to
            long-term goals, TaskFlow adapts to how you work, helps stay
            organized, focused, and ahead.
          </p>

          {!isSignedIn ? (
            <div className="flex flex-row gap-4 justify-center">
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                >
                  Explore Features
                </Button>
              </a>
              <SignUpButton>
                <Button
                  size="lg"
                  className="text-lg px-8 bg-purple-500 hover:bg-purple-600"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          ) : (
            <div className="flex flex-row gap-4 justify-center">
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                >
                  Explore Features
                </Button>
              </a>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-purple-500 hover:bg-purple-600"
                >
                  Go to DashBoard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-purple-500 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to help your team collaborate and get more done.
          </p>
        </div>

        <div className="grid grid-cols-2 mx-auto max-w-4xl gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-purple-300 shadow-lg shadow-purple-200 hover:shadow-xl gap-4 transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-purple-700">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-15">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold text-purple-500 mb-4">
              Built for people who get things done
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              TaskFlow adapts to your workflow, solo or in teams.
            </p>
          </div>

          <div className="space-y-8 flex flex-col items-center">
            {users.map((user) => (
              <div
                key={user.title}
                className="flex items-center gap-5 p-2 rounded-xl hover:bg-purple-50 transition w-full max-w-xl"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg shrink-0">
                  <user.icon className="h-6 w-6 text-purple-600" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-700">
                    {user.title}
                  </h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    {user.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-purple-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to organize your work better?
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-5 max-w-2xl mx-auto">
            From daily tasks to complex workflows — all in one place.
          </p>

          {!isSignedIn && (
            <SignUpButton>
              <Button size="lg" variant="secondary" className="text-lg text-purple-600 px-8">
                Start for free
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>

      <footer className="py-3 border-t border-purple-200 bg-white/70">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-6 justify-between">
            <div className="flex items-center space-x-2">
              <Logo className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold">
                Task<span className="text-purple-500">Flow</span>
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 text-center text-sm text-purple-700">
              <span>© 2025 TaskFlow.</span>
              <span>Built with ❤️ by Ved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
