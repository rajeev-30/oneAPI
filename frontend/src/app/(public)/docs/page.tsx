import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Terminal, Code, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PublicDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">API Documentation</h1>
        <p className="text-text-muted mt-2">Everything you need to start using oneAPI</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Zap size={16} className="text-brand-400" /><h2 className="text-base font-semibold text-text-primary">Quick Start</h2></div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
          <li><Link href="/signup" className="text-brand-400 hover:underline">Create an account</Link> and subscribe to a plan</li>
          <li>Generate an API key from your dashboard</li>
          <li>Make requests to <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-accent-blue text-xs">POST /api/v1/chat/completions</code></li>
        </ol>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Terminal size={16} className="text-accent-emerald" /><h2 className="text-base font-semibold text-text-primary">cURL Example</h2><Badge variant="success">bash</Badge></div>
        <pre className="bg-surface-primary border border-border-secondary rounded-lg p-4 overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
{`curl -X POST http://localhost:8000/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"model":"gemini-1.5-flash","messages":[{"role":"user","content":"Hello!"}],"stream":true}'`}
        </pre>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Code size={16} className="text-accent-amber" /><h2 className="text-base font-semibold text-text-primary">JavaScript</h2><Badge variant="warning">fetch</Badge></div>
        <pre className="bg-surface-primary border border-border-secondary rounded-lg p-4 overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
{`const res = await fetch("/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    model: "gemini-1.5-flash",
    messages: [{ role: "user", content: "Hello!" }],
    stream: true
  })
});`}
        </pre>
      </Card>

      <div className="text-center">
        <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors">
          Get Started <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
