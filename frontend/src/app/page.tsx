import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className="w-full border-b px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between h-14">
          <span className="text-base font-semibold tracking-tight">CareerLens AI</span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-xl w-full text-center py-20 sm:py-32">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Resume + LinkedIn + GitHub</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Prove It or Build It
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Cross-reference your Resume, LinkedIn, and GitHub against any target role.
            Get evidence-backed skill scores and a roadmap to close the gaps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium px-6 py-2.5 text-sm hover:bg-primary/90 transition-colors">
              Start Free Analysis
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-md border font-medium px-6 py-2.5 text-sm hover:bg-secondary transition-colors">
              I have an account
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">No credit card required. Your data stays private.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground px-4">
        Built for the hackathon &mdash; CareerLens AI
      </footer>
    </div>
  );
}
