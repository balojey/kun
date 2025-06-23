'use client';

import Link from 'next/link';
import { ArrowRight, Mic, Mail, Zap, Shield, Clock, Brain, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl">Aven</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hover-lift">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="hover-lift">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32 w-full gradient-bg">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2 animate-fade-in">
              <Zap className="mr-2 h-4 w-4" />
              AI Voice for Your Inbox
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in animate-delay-100">
              Converse. Control.
              <span className="block text-gradient mt-2">
                Arrive at Inbox Zero.
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in animate-delay-200">
              Transform your email workflow with Aven's AI voice assistant. 
              Manage, reply, and organize emails through natural conversation.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg hover-lift">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg hover-lift">
                <Mic className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in animate-delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl animate-fade-in">
              Email Management, Reimagined
            </h2>
            <p className="mt-6 text-xl text-muted-foreground animate-fade-in animate-delay-100">
              Experience the future of email productivity with AI-powered voice commands
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mic,
                title: 'Voice-First Interface',
                description: 'Simply speak to compose, reply, and manage emails. No typing required.',
                color: 'text-blue-500',
                delay: 'animate-delay-100'
              },
              {
                icon: Mail,
                title: 'Smart Email Control',
                description: 'Archive, delete, schedule, and organize emails with natural language commands.',
                color: 'text-green-500',
                delay: 'animate-delay-200'
              },
              {
                icon: Brain,
                title: 'AI Understanding',
                description: 'Advanced AI comprehends context and intent for accurate email actions.',
                color: 'text-purple-500',
                delay: 'animate-delay-300'
              },
              {
                icon: Clock,
                title: 'Save Hours Daily',
                description: 'Reduce email processing time by up to 70% with voice automation.',
                color: 'text-orange-500',
                delay: 'animate-delay-100'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption and privacy controls keep your data secure.',
                color: 'text-red-500',
                delay: 'animate-delay-200'
              },
              {
                icon: Zap,
                title: 'Tool Integration',
                description: 'Connect Gmail, Calendar, Slack, and more for unified productivity.',
                color: 'text-cyan-500',
                delay: 'animate-delay-300'
              }
            ].map((feature, index) => (
              <Card key={index} className={`border-0 shadow-lg hover-lift animate-fade-in ${feature.delay}`}>
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color.split('-')[1]}-500/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-muted/30 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl animate-fade-in">
              How Aven Works
            </h2>
            <p className="mt-6 text-xl text-muted-foreground animate-fade-in animate-delay-100">
              Three simple steps to transform your email workflow
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Connect Your Email',
                description: 'Securely link your Gmail account and other productivity tools in seconds.',
                delay: 'animate-delay-100'
              },
              {
                step: '2',
                title: 'Start Speaking',
                description: 'Use natural language to tell Aven what you want to do with your emails.',
                delay: 'animate-delay-200'
              },
              {
                step: '3',
                title: 'Watch It Happen',
                description: 'Aven executes your commands instantly while you focus on what matters.',
                delay: 'animate-delay-300'
              }
            ].map((step, index) => (
              <div key={index} className={`text-center animate-fade-in ${step.delay}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 hover-lift">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 lg:py-32 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl animate-fade-in">
              Trusted by Professionals
            </h2>
            <p className="mt-6 text-xl text-muted-foreground animate-fade-in animate-delay-100">
              Join thousands who've revolutionized their email workflow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                metric: '10,000+',
                label: 'Active Users',
                description: 'Professionals using Aven daily'
              },
              {
                metric: '70%',
                label: 'Time Saved',
                description: 'Average reduction in email processing'
              },
              {
                metric: '99.9%',
                label: 'Uptime',
                description: 'Reliable service you can count on'
              }
            ].map((stat, index) => (
              <div key={index} className={`text-center animate-fade-in animate-delay-${(index + 1) * 100}`}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.metric}</div>
                <div className="text-xl font-semibold mb-2">{stat.label}</div>
                <div className="text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 w-full gradient-bg">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl animate-fade-in">
              Ready to Transform Your Email?
            </h2>
            <p className="mt-6 text-xl text-muted-foreground animate-fade-in animate-delay-100">
              Join thousands of professionals who've revolutionized their email workflow with Aven.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-200">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg hover-lift">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg hover-lift">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
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