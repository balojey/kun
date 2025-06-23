'use client';

import Link from 'next/link';
import { ArrowRight, Mic, Mail, Zap, Shield, Clock, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl">Aven</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="container px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Email Assistant
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Transform Your Email
              <span className="block text-gradient">
                With Voice
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Aven is the AI voice assistant that helps busy professionals manage, reply to, 
              and organize emails through natural conversation. No more endless clicking—just speak.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                <Mic className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="container px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Email Management, Reimagined
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Experience the future of email productivity with AI-powered voice commands
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Voice-First Interface</CardTitle>
                <CardDescription>
                  Simply speak to compose, reply, and manage emails. No typing required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Smart Email Control</CardTitle>
                <CardDescription>
                  Archive, delete, schedule, and organize emails with natural language commands.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>AI Understanding</CardTitle>
                <CardDescription>
                  Advanced AI comprehends context and intent for accurate email actions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Save Hours Daily</CardTitle>
                <CardDescription>
                  Reduce email processing time by up to 70% with voice automation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level encryption and privacy controls keep your data secure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-cyan-500" />
                </div>
                <CardTitle>Tool Integration</CardTitle>
                <CardDescription>
                  Connect Gmail, Calendar, Slack, and more for unified productivity.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="container px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Aven Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to transform your email workflow
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Your Email</h3>
              <p className="text-muted-foreground">
                Securely link your Gmail account and other productivity tools in seconds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Start Speaking</h3>
              <p className="text-muted-foreground">
                Use natural language to tell Aven what you want to do with your emails.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Watch It Happen</h3>
              <p className="text-muted-foreground">
                Aven executes your commands instantly while you focus on what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Transform Your Email?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of professionals who've revolutionized their email workflow with Aven.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl">Aven</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Aven. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}