import { curriculum } from '@/data/curriculum';
import UnitPageClient from '@/components/UnitPageClient';

export function generateStaticParams() {
  return curriculum.map(unit => ({ id: String(unit.id) }));
}

export default function UnitPage({ params }: { params: { id: string } }) {
  return <UnitPageClient params={params} />;
}
