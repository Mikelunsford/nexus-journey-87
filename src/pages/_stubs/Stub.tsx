import PageSection from "@/components/layout/PageSection";

interface StubProps {
  title: string;
}

export default function Stub({ title }: StubProps) {
  return (
    <PageSection title={title} subtitle="Placeholder view">
      <div className="panel p-5">Coming soon</div>
    </PageSection>
  );
}