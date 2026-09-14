export default function SkillBadge({ skill, onRemove }) {
  const name = typeof skill === 'string' ? skill : skill.name;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-sm text-ink-600">
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(name)}
          aria-label={`Remove ${name}`}
          className="text-ink-400 hover:text-warn"
        >
          ×
        </button>
      )}
    </span>
  );
}
