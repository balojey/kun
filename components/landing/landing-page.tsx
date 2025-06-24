'use client';

import Link from 'next/link';
import { ArrowRight, Mic, Mail, Zap, Shield, Clock, Brain, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { TypingAnimation } from '@/components/landing/typing-animation';
import { AnimatedButton } from '@/components/landing/animated-button';
import { ThreeBackground } from '@/components/landing/three-background';

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
        <div className="flex h-16 items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Aven
            </span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/pricing">
              <AnimatedButton variant="ghost">Pricing</AnimatedButton>
            </Link>
            <Link href="/login">
              <AnimatedButton variant="ghost">Sign In</AnimatedButton>
            </Link>
            <Link href="/signup">
              <AnimatedButton>Get Started</AnimatedButton>
            </Link>
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
                AI Voice for Your Inbox
              </Badge>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
                <TypingAnimation 
                  phrases={[
                    "Your AI Email Assistant.",
                    "Converse. Control. Inbox Zero.",
                    "Voice-First Email Management."
                  ]}
                  className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent"
                  speed={180}
                  deleteSpeed={90}
                  pauseDuration={2500}
                />
              </h1>
            </motion.div>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
            >
              Converse with your inbox. Arrive at Inbox Zero.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <Link href="/signup">
                <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold">
                  Get Started with Aven
                  <ArrowRight className="ml-3 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link href="/pricing">
                <AnimatedButton variant="outline" size="lg" className="h-16 px-12 text-lg">
                  <Mic className="mr-3 h-5 w-5" />
                  View Pricing
                </AnimatedButton>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 w-full relative">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Email Management, Reimagined
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the future of email productivity
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
                title: 'Voice-First Interface',
                description: 'Simply speak to compose, reply, and manage emails.',
                color: 'blue'
              },
              {
                icon: Brain,
                title: 'AI Understanding',
                description: 'Advanced AI comprehends context and intent.',
                color: 'purple'
              },
              {
                icon: Clock,
                title: 'Save Hours Daily',
                description: 'Reduce email processing time by up to 70%.',
                color: 'orange'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 shadow-lg`}>
                      <feature.icon className={`h-7 w-7 text-${feature.color}-500`} />
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

      {/* CTA Section */}
      <section className="py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              Ready to Transform Your Email?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of professionals who've revolutionized their workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <AnimatedButton size="lg" className="h-16 px-12 text-lg font-semibold">
                  Start Your Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link href="/login">
                <AnimatedButton variant="outline" size="lg" className="h-16 px-12 text-lg">
                  Sign In
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 w-full bg-background/80 backdrop-blur-xl">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Aven
              </span>
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