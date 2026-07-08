import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <section className="text-center">
        <p className="text-sm font-medium text-brand-600 mb-3">Hotis Studio</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight">
          Is your website costing you customer?
        </h1>
        <p className="mt-4 text-lg text-muted">
          Get a free, instant health check - performance, SEO, and accessibility
          scored in seconds.
        </p>
      </section>

      <Card className="mt-10">
        <p className="text-sm text-muted">URL input form goes here - Day 3.</p>
      </Card>

      <div className="mt-10 flex justify-center gap-3">
        <Button variant="primary">Run My Free Check</Button>
        <Button variant="secondary">Learn More</Button>
      </div>
    </main>
  );
}
