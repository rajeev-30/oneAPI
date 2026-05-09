export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full max-h-screen flex items-center justify-center bg-surface-primary p-4 pt-30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
      {children}
    </div>
  );
}
