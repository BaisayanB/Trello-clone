"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Medal,
} from "lucide-react";
import { Logo } from "@/components/logo";
import Navbar from "@/components/navbar";

export default function HomePage() {

  const { isSignedIn, user } = useUser();

  const features = [
    {
      icon: CheckSquare,
      title: "Visually Interactive Boards",
      description:
        "Create unlimited boards. Structure your workflow the way you work - simple, flexible, and designed for clarity.",
    },
    {
      icon: Users,
      title: "Smart Search, Filters & Analytics",
      description:
        "Find tasks instantly using search and advanced filtering. View analytics to understand progress & stay productive.",
    },
    {
      icon: Zap,
      title: "Drag-and-Drop with Custom Columns",
      description:
        "Move tasks between stages, reorder them with ease, rename them and create as many workflow steps needed.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable with Realtime Updates",
      description:
        "Enterprise-grade security to protect your data with instantaneous realtime-sync to keep you updated.",
    },
  ];

  return (
    <div className="min-h-screen bg-radial from-white to-purple-100">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mx-auto mb-4 w-fit flex items-center border border-purple-700 shadow-sm p-4 bg-purple-100 text-purple-700 rounded-full font-bold uppercase">
            <Medal className="h-6 w-6 mr-2" />
            No 1 Task Management App
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

          {!isSignedIn && (
            <div className="flex flex-row gap-4 justify-center">
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg border-2 text-semibold border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
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
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-500 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to help your team collaborate and get more done.
          </p>
        </div>

        <div className="grid grid-cols-2 mx-auto max-w-4xl gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
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

      {/* CTA section */}
      <section className=" py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who are already using Trello to organize
            their work.
          </p>

          {!isSignedIn && (
            <SignUpButton>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start your free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-3 border-t border-purple-200 bg-white/70">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold">
                Task<span className="text-purple-500">Flow</span>
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-purple-700">
              <span>© 2025 TaskFlow. All rights reserved.</span>
              <span>Built with ❤️ by Ved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
