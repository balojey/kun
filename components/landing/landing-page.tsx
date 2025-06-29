'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mic, Mail, Zap, Shield, Clock, Brain, CheckCircle, Star, Users, Calendar, FileText, Menu, X, Globe, Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="flex items-center gap-4">
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
            
            {/* Bolt Logo - Subtle placement */}
            <div className="flex items-center">
              <div className="w-px h-6 bg-border/50 mx-1" />
              <Link 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors group"
                title="Powered by Bolt"
              >
                <Image
                  src="/bolt.png"
                  alt="Bolt"
                  width={16}
                  height={16}
                  className="opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  bolt
                </span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/pricing">
              <AnimatedButton variant="ghost">Pricing</AnimatedButton>
            </Link>
            <ThemeToggle />
            {user ? (
              <Link href="/app">
                <AnimatedButton>Open App</AnimatedButton>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <AnimatedButton variant="ghost">Sign In</AnimatedButton>
                </Link>
                <Link href="/signup">
                  <AnimatedButton>Get Started Free</AnimatedButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-3">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Pricing
                </Button>
              </Link>
              {user ? (
                <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Open App
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 w-full">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-lg bg-primary/10 text-primary border-primary/20">
                <Globe className="mr-2 h-4 w-4" />
                10,000 Free Tokens • Native Web Browsing • No Credit Card Required
              </Badge>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <TypingAnimation 
                  phrases={[
                    "Your AI Personal Assistant.",
                    "Speak. Aven Handles Everything.",
                    "From Chaos to Organized.",
                    "Voice-Powered Productivity.",
                    "Browse the Web with Voice."
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
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Stop juggling multiple apps and tools. Aven transforms how busy professionals manage their digital workspace through natural conversation. 
              Simply speak your commands—manage emails, schedule meetings, organize documents, <strong>browse the web for real-time information</strong>—and watch your productivity soar.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              {user ? (
                <Link href="/app">
                  <AnimatedButton size="lg" className="h-14 px-8 text-base font-semibold hover:opacity-90">
                    Open Your Dashboard
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              ) : (
                <Link href="/signup">
                  <AnimatedButton size="lg" className="h-14 px-8 text-base font-semibold hover:opacity-90">
                    Claim 10,000 Free Tokens
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              )}
              <Link href="/pricing">
                <AnimatedButton variant="outline" size="lg" className="h-14 px-8 text-base border-primary/30 hover:border-primary">
                  <Mic className="mr-3 h-5 w-5" />
                  See Token Packages
                </AnimatedButton>
              </Link>
            </motion.div>

            {/* Powered By Section */}
            <motion.div 
              variants={fadeInUp}
              className="mb-12"
            >
              <p className="powered-by-text text-sm text-muted-foreground mb-6 tracking-wide">
                Powered by industry leaders
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                {/* Bolt */}
                <motion.div 
                  className="powered-by-logos flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/bolt.png"
                    alt="Bolt"
                    width={32}
                    height={32}
                    className="opacity-70"
                  />
                  {/* <span className="font-semibold text-lg text-muted-foreground">Bolt</span> */}
                </motion.div>

                {/* Tavily */}
                <motion.div 
                  className="powered-by-logos"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/tavily.svg"
                    alt="Tavily"
                    width={80}
                    height={24}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* Pica */}
                <motion.div 
                  className="powered-by-logos"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/pica.svg"
                    alt="Pica"
                    width={80}
                    height={24}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* ElevenLabs */}
                <motion.div 
                  className="powered-by-logos"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/elevenlabs.svg"
                    alt="ElevenLabs"
                    width={80}
                    height={24}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* Supabase */}
                <motion.div 
                  className="powered-by-logos"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/supabase.svg"
                    alt="Supabase"
                    width={30}
                    height={24}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
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
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Real-time Web Access</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Web Browsing Feature Highlight */}
      <section className="py-20 lg:py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-4xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-lg bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Globe className="mr-2 h-4 w-4" />
              Revolutionary Web Browsing
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              The First AI Assistant with <span className="text-gradient">Native Web Browsing</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Unlike other AI assistants limited to training data, Aven accesses the live web in real-time. 
              Get current information, latest news, stock prices, weather updates, and research—all through natural conversation.
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
                icon: Search,
                title: 'Real-Time Research',
                description: 'Ask "What\'s the latest news about AI?" or "Find me information about sustainable energy trends" and get current, accurate results.',
                color: 'blue'
              },
              {
                icon: TrendingUp,
                title: 'Live Market Data',
                description: 'Get real-time stock prices, market analysis, and financial news. "What\'s Tesla\'s current stock price?" delivers instant results.',
                color: 'green'
              },
              {
                icon: Globe,
                title: 'Current Events & News',
                description: 'Stay informed with the latest breaking news, weather updates, and global events. Always current, never outdated.',
                color: 'purple'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift border-primary/10">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 shadow-lg`}>
                      <feature.icon className={`h-7 w-7 text-${feature.color}-500`} />
                    </div>
                    <CardTitle className="text-xl md:text-2xl mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Web Browsing Examples */}
          <motion.div 
            className="mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl md:text-3xl mb-4">Try These Voice Commands</CardTitle>
                <CardDescription className="text-lg">
                  Experience the power of real-time web browsing through natural conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    "What's the weather like in New York today?",
                    "Find me the latest news about renewable energy",
                    "What's Apple's current stock price?",
                    "Research the best restaurants in San Francisco",
                    "Get me information about the latest iPhone release",
                    "What are the trending topics on social media today?"
                  ].map((command, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mic className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">"{command}"</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 w-full relative">
        <div className="px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            className="mx-auto max-w-3xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Why Executives Choose Aven
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Built for C-suite leaders, entrepreneurs, and high-performing professionals who value their time. 
              Connect your tools once, then control everything with your voice—including the entire web.
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
                icon: Globe,
                title: 'Live Web Intelligence',
                description: 'Access real-time information from across the web. Get current news, market data, research, and insights—all through conversation.',
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
              },
              {
                icon: Search,
                title: 'Intelligent Research Assistant',
                description: 'Ask complex questions and get comprehensive answers with sources. "Research our competitors\' latest product launches" delivers detailed insights.',
                color: 'primary'
              },
              {
                icon: Shield,
                title: 'Enterprise-Grade Security',
                description: 'Bank-level encryption, SOC 2 compliance, and complete data privacy. Your conversations and web searches remain confidential.',
                color: 'primary'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift border-primary/10">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl mb-3">{feature.title}</CardTitle>
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
      <section className="py-20 lg:py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-logo-blue/5" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-3xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Perfect For Busy Professionals
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Whether you're a CEO managing hundreds of emails daily or a consultant juggling multiple clients, 
              Aven adapts to your workflow and amplifies your productivity with real-time web intelligence.
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
                description: 'Manage board communications, investor updates, and strategic decisions. Get real-time market intelligence and industry insights without leaving your workflow.',
                color: 'primary'
              },
              {
                icon: Calendar,
                title: 'Consultants & Freelancers',
                description: 'Juggle multiple clients effortlessly. Research industry trends, schedule calls, send proposals, and track project updates with voice commands.',
                color: 'primary'
              },
              {
                icon: FileText,
                title: 'Sales & Business Development',
                description: 'Follow up with prospects, research companies, schedule demos, and manage your pipeline while staying informed about market conditions.',
                color: 'primary'
              }
            ].map((useCase, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm hover-lift border-primary/10">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
                      <useCase.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl mb-3">{useCase.title}</CardTitle>
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
      <section className="py-20 lg:py-32 w-full relative">
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
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Pay Only for What You Use
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              No monthly subscriptions or hidden fees. Purchase tokens once and use them whenever you need AI assistance. 
              Your tokens never expire, and you get 10,000 free tokens to start—enough for weeks of productivity management and web research.
            </p>
            
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">10,000</div>
                <div className="text-sm text-muted-foreground">Free tokens on signup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">~150</div>
                <div className="text-sm text-muted-foreground">Tasks processed per 1,000 tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Tokens never expire</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-logo-blue/5" />
        <div className="px-6 w-full max-w-7xl mx-auto relative">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to Reclaim Your Time?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Join 10,000+ professionals who've eliminated digital overwhelm. Start with 10,000 free tokens—no credit card required. 
              Experience the future of productivity management with real-time web intelligence in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/app">
                  <AnimatedButton size="lg" className="h-14 px-8 text-base font-semibold hover:opacity-90">
                    Access Your Dashboard
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <AnimatedButton size="lg" className="h-14 px-8 text-base font-semibold hover:opacity-90">
                      Start Free with 10,000 Tokens
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </AnimatedButton>
                  </Link>
                  <Link href="/login">
                    <AnimatedButton variant="outline" size="lg" className="h-14 px-8 text-base border-primary/30 hover:border-primary">
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
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                <span>✓ SOC 2 Type II Certified</span>
                <span>✓ GDPR Compliant</span>
                <span>✓ 99.9% Uptime SLA</span>
                <span>✓ 30-Day Money Back</span>
                <span>✓ Real-time Web Access</span>
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
            <div className="text-sm text-muted-foreground text-center md:text-right">
              © 2025 Aven. All rights reserved. • Built for professionals who value their time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}