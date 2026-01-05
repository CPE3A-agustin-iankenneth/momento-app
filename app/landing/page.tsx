import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, Calendar, Heart, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-medium tracking-tight">momento</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="size-3.5" />
              Your daily memory companion
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6">
            One moment.
            <br />
            <span className="text-muted-foreground">One memory.</span>
            <br />
            Every day.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Capture your day in a single line and a photo. No pressure, no
            complexity—just you and your story, one moment at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup">Start Your Journal</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[16/10] rounded-2xl bg-gradient-to-br from-card via-muted/50 to-card border border-border/50 shadow-xl overflow-hidden">
            {/* Placeholder for app screenshot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center">
                  <Camera className="size-10 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  App Screenshot Placeholder
                </p>
              </div>
            </div>
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Less is more
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Momento isn&apos;t another productivity app. It&apos;s not about
            tracking habits or building streaks. It&apos;s about creating space
            for reflection—a gentle daily ritual that takes less than 30
            seconds.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-center mb-16">
            Three steps. Thirty seconds.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="relative aspect-[4/5] rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 overflow-hidden mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="size-12 text-primary/60" />
                </div>
                <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
              </div>
              <h3 className="font-medium text-lg">Capture a moment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Take a photo of something that caught your eye today. No
                filters, no perfection—just life as it is.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="relative aspect-[4/5] rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-border/50 overflow-hidden mb-6">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full h-2 bg-border rounded-full" />
                </div>
                <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </span>
              </div>
              <h3 className="font-medium text-lg">Write one line</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Describe how you feel, what happened, or what you&apos;re
                grateful for. One line is all it takes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="relative aspect-[4/5] rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/50 overflow-hidden mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="size-12 text-accent/60" />
                </div>
                <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
              </div>
              <h3 className="font-medium text-lg">Save & remember</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your moments are stored privately and beautifully. Look back
                anytime and rediscover your story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-center mb-4">
            Thoughtfully designed
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Every feature exists to make journaling feel effortless, not
            overwhelming.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-background border border-border/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="size-5 text-primary" />
              </div>
              <h3 className="font-medium">Photo snapshots</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pair each entry with an authentic photo. No editing,
                just raw moments.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Calendar className="size-5 text-foreground" />
              </div>
              <h3 className="font-medium">Calendar view</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                See your year at a glance. Browse past moments by date
                effortlessly.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Heart className="size-5 text-accent" />
              </div>
              <h3 className="font-medium">Favorites</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mark special moments and find them quickly when you need a
                smile.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <svg
                  className="size-5 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-medium">Private by default</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your memories belong to you. Everything is encrypted and stored
                securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-center mb-4">
            Your memories, beautifully organized
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Browse your collection in a stunning gallery or scroll through time
            on your calendar.
          </p>

          {/* Gallery placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center"
              >
                <Camera className="size-6 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">
            Start capturing today
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your future self will thank you. Begin your daily ritual now—it
            only takes 30 seconds.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Free Account</Link>
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            Free to use. No credit card required.
          </p>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-medium">momento</span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Momento. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
