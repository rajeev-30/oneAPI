import Link from "next/link";
import { Zap, Shield, BarChart3, Globe, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-text-primary">
            The Unified Interface{" "}
            <span className="gradient-text">For LLMs</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-xl mx-auto">
            Better prices, better uptime. One API for every model.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link
              href="/keys"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25"
            >
              Get API Key <ArrowRight size={16} />
            </Link>
            <Link
              href="/models"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border-primary text-text-secondary font-medium text-sm hover:text-text-primary hover:bg-white/[0.04] transition-colors"
            >
              Explore Models
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border-secondary">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "5+", label: "Providers" },
            { value: "20+", label: "Models" },
            { value: "SSE", label: "Streaming" },
            { value: "JWT", label: "Auth" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Globe,
              title: "One API for Any Model",
              desc: "Access all major models through a single, unified API. OpenAI, Gemini, Anthropic, Groq, and more.",
              cta: "Browse all",
              href: "/models",
            },
            {
              icon: Shield,
              title: "Secure by Default",
              desc: "API key authentication, rate limiting, and usage tracking built in. Enterprise-grade security.",
              cta: "Learn more",
              href: "/docs",
            },
            {
              icon: BarChart3,
              title: "Usage Analytics",
              desc: "Real-time tracking of requests, tokens, and costs per model. Full visibility into your spend.",
              cta: "View analytics",
              href: "/signup",
            },
            {
              icon: Zap,
              title: "Streaming Support",
              desc: "Server-Sent Events for real-time streaming responses. Sub-second time to first token.",
              cta: "View docs",
              href: "/docs",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border-primary bg-surface-secondary p-5 hover:border-border-active transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                <f.icon size={18} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">{f.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-3">{f.desc}</p>
              <Link href={f.href} className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                {f.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-secondary py-8 px-4 text-center">
        <p className="text-sm text-text-muted">© 2026 oneAPI. Made with 💙 for developers.</p>
      </footer>
    </div>
  );
}
