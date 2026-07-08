import { Button } from '@/components/ui/Button';
import { UrlCheckForm } from '@/components/UrlCheckForm';

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-mist">
        <span>Hotis Studio</span>
        <span>Site Diagnostic</span>
      </div>

      <h1 className="mt-8 font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper sm:text-6xl">
        Your website
        <br />
        has a pulse.
        <br />
        <span className="text-beacon">Let&rsquo;s check it.</span>
      </h1>

      <p className="mt-6 max-w-md text-lg text-mist">
        Free performance, SEO, and accessibility scan. Results in under a minute
        - no signup required.
      </p>

      <div className="relative mt-10 overflow-hidden rounded-lg border border-mist/20 bg-panel p-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-beacon/40 to-transparent scanline" />

        <div className="relative">
          <UrlCheckForm />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <Button variant="primary">Run Free Diagnostic</Button>
        <a
          href="#"
          className="text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
        >
          Learn more →
        </a>
      </div>

      <div className="mt-20 border-t border-mist/10 pt-6 font-mono text-xs uppercase tracking-widest text-mist">
        Performance · SEO · Accessibility · Best Practices
      </div>
    </main>
  );
}
