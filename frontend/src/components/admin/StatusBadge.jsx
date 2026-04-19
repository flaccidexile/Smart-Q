const STATUS_CLASSES = {
  Pending:    'badge-pending',
  Processing: 'badge-processing',
  Approved:   'badge-approved',
  Released:   'badge-released',
  Rejected:   'badge-rejected',
};

export default function StatusBadge({ status }) {
  return (
    <span className={STATUS_CLASSES[status] || 'badge bg-slate-700 text-slate-300'}>
      {status}
    </span>
  );
}
