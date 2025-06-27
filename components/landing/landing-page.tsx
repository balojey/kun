'use client';

import Link from 'next/link';
import { ArrowRight, Mic, Mail, Zap, Shield, Clock, Brain, CheckCircle, Star, Users, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { TypingAnimation } from '@/components/landing/typing-animation';
import { AnimatedButton } from '@/components/landing/animated-button';
import { ThreeBackground } from '@/components/landing/three-background';
import { useAuthContext } from '@/components/auth/auth-provider';
import { Logo } from '@/components/logo';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-background w-full relative overflow-hidden">
      {/* Three.js Animated Background */}
      <ThreeBackground />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center justify-between px-6 w-full max-w-none mx-auto">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Logo width={32} height={32} priority />
            <span className="font-bold text-xl logo-gradient">
              Aven
            </span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/pricing">
              <AnimatedButton className='' variant="ghost">Pricing</AnimatedButton>
            </Link>
            {user ? (
              <Link href="/app">
                <AnimatedButton className=''>Open App</AnimatedButton>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <AnimatedButton className='' variant="ghost">Sign In</AnimatedButton>
                </Link>
                <Link href="/signup">
                  <AnimatedButton className=''>Get Started Free</AnimatedButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 lg:py-40 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-lg bg-primary/10 text-primary border-primary/20">
                <Zap className="mr-2 h-4 w-4" />
                10,000 Free Tokens • No Credit Card Required
              </Badge>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
                <TypingAnimation 
                  phrases={[
                    "Turn Conversations Into Actions.",
                    "Speak. Aven Handles Your Inbox.",
                    "From Email Chaos to Inbox Zero.",
                    "Your Voice-Powered Email Assistant."
                  ]}
                  className="text-gradient"
                  speed={150}
                  deleteSpeed={80}
                  pauseDuration={2000}
                />
              </h1>
            </motion.div>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Stop drowning in emails. Aven transforms how busy professionals manage their inbox through natural conversation. 
              Simply speak your commands—reply to clients, schedule meetings, organize messages—and watch your productivity soar.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              {user ? (
                <Link href="/app">
                  <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold hover:opacity-90">
                    Open Your Dashboard
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              ) : (
                <Link href="/signup">
                  <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold hover:opacity-90">
                    Claim 10,000 Free Tokens
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              )}
              <Link href="/pricing">
                <AnimatedButton variant="outline" size="lg" className="h-16 px-12 text-lg border-primary/30 hover:border-primary">
                  <Mic className="mr-3 h-5 w-5" />
                  See Token Packages
                </AnimatedButton>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>10,000+ Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>4.9/5 User Rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 w-full relative">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-3xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Why Executives Choose Aven
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for C-suite leaders, entrepreneurs, and high-performing professionals who value their time. 
              Connect your tools once, then control everything with your voice.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Mic,
                title: 'Natural Voice Commands',
                description: 'Say "Reply to Sarah about the quarterly report" and Aven drafts the perfect response. No typing, no clicking—just speak naturally.',
                color: 'primary'
              },
              {
                icon: Brain,
                title: 'Contextual AI Intelligence',
                description: 'Aven understands your communication style, priorities, and relationships. It learns from your patterns to make smarter suggestions.',
                color: 'primary'
              },
              {
                icon: Zap,
                title: 'Universal Tool Integration',
                description: 'Connect Gmail, Calendar, Docs, Sheets, Notion, Slack, and more. One voice command controls your entire productivity stack.',
                color: 'primary'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift border-primary/10">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-logo-blue/5" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-3xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Perfect For Busy Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              Whether you're a CEO managing hundreds of emails daily or a consultant juggling multiple clients, 
              Aven adapts to your workflow and amplifies your productivity.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: 'C-Suite Executives',
                description: 'Manage board communications, investor updates, and strategic decisions without getting lost in email threads.',
                color: 'primary'
              },
              {
                icon: Calendar,
                title: 'Consultants & Freelancers',
                description: 'Juggle multiple clients effortlessly. Schedule calls, send proposals, and track project updates with voice commands.',
                color: 'primary'
              },
              {
                icon: FileText,
                title: 'Sales & Business Development',
                description: 'Follow up with prospects, schedule demos, and manage your pipeline while staying focused on closing deals.',
                color: 'primary'
              }
            ].map((useCase, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift border-primary/10">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
                      <useCase.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-3">{useCase.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Token System Explanation */}
      <section className="py-32 w-full relative">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-lg bg-primary/10 text-primary border-primary/20">
              <Zap className="mr-2 h-4 w-4" />
              Fair, Transparent Pricing
            </Badge>
            
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Pay Only for What You Use
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              No monthly subscriptions or hidden fees. Purchase tokens once and use them whenever you need AI assistance. 
              Your tokens never expire, and you get 10,000 free tokens to start—enough for weeks of email management.
            </p>
            
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000</div>
                <div className="text-sm text-muted-foreground">Free tokens on signup</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">~150</div>
                <div className="text-sm text-muted-foreground">Emails processed per 1,000 tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Tokens never expire</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-logo-blue/5" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Ready to Reclaim Your Time?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join 10,000+ professionals who've eliminated email overwhelm. Start with 10,000 free tokens—no credit card required. 
              Experience the future of email management in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <Link href="/app">
                  <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold hover:opacity-90">
                    Access Your Dashboard
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold hover:opacity-90">
                      Start Free with 10,000 Tokens
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </AnimatedButton>
                  </Link>
                  <Link href="/login">
                    <AnimatedButton variant="outline" size="lg" className="h-16 px-12 text-lg border-primary/30 hover:border-primary">
                      Sign In to Existing Account
                    </AnimatedButton>
                  </Link>
                </>
              )}
            </div>
            
            {/* Final Trust Signal */}
            <div className="mt-12 pt-8 border-t border-border/20">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by executives at leading companies
              </p>
              <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
                <span>✓ SOC 2 Type II Certified</span>
                <span>✓ GDPR Compliant</span>
                <span>✓ 99.9% Uptime SLA</span>
                <span>✓ 30-Day Money Back</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 w-full bg-background/80 backdrop-blur-xl">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo width={32} height={32} className="shadow-lg" />
              <span className="font-bold text-xl logo-gradient">
                Aven
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Aven. All rights reserved. • Built for professionals who value their time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}