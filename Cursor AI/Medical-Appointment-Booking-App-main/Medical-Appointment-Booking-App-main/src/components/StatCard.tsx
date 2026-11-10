type StatCardProps = {
  label: string;
  value: number;
  tone?: 'blue' | 'green' | 'gray';
};

export function StatCard({ label, value, tone = 'blue' }: StatCardProps) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
