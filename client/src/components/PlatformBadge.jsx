const PLATFORM_STYLES = {
  YouTube: { bar: '#FF0000', label: 'YouTube' },
  NPTEL: { bar: '#1E3A8A', label: 'NPTEL' },
  Coursera: { bar: '#0056D2', label: 'Coursera' },
  edX: { bar: '#02262B', label: 'edX' },
  Other: { bar: '#5B6180', label: 'Other' },
};

export function platformBar(platform) {
  return PLATFORM_STYLES[platform]?.bar || PLATFORM_STYLES.Other.bar;
}

export default function PlatformBadge({ platform }) {
  const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Other;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.bar }} />
      {style.label}
    </span>
  );
}
