/**
 * StatusBadge — updated to use the new burgundy/cream design system.
 * Colors match the cream-panel aesthetic while remaining clearly distinct.
 */
const STATUS_CLASSES = {
  Pending:    'badge-pending',
  Processing: 'badge-processing',
  Approved:   'badge-approved',
  Released:   'badge-released',
  Rejected:   'badge-rejected',
  Cancelled:  'badge-cancelled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={STATUS_CLASSES[status] || 'badge bg-cream-100 text-gray-600 border border-cream-300'}>
      {status}
    </span>
  );
}
