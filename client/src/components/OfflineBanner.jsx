import useOnlineStatus from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 bg-ink px-4 py-2 text-center text-sm font-medium text-paper">
      Offline mode — showing previously loaded courses and resume data. Changes will sync when you're back online.
    </div>
  );
}
