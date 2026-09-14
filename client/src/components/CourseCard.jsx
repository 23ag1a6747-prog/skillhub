import { Link } from 'react-router-dom';
import PlatformBadge, { platformBar } from './PlatformBadge';

export default function CourseCard({ course, isSaved, onToggleSave, saving }) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition hover:shadow-elevate"
      style={{ borderLeftWidth: 4, borderLeftColor: platformBar(course.platform) }}
    >
      <Link to={`/courses/${course._id}`} className="block">
        <div className="aspect-[16/9] w-full overflow-hidden bg-ink-800/5">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-400 text-sm">No preview</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <PlatformBadge platform={course.platform} />
          <span className="text-xs text-ink-400">{course.durationHours}h</span>
        </div>

        <Link to={`/courses/${course._id}`}>
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink hover:text-signal">
            {course.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1.5">
          {(course.skills || []).slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-signal-50 px-2 py-0.5 text-xs text-signal-600">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-400">
          <span>{course.difficulty}</span>
          <span className="flex items-center gap-2">
            {course.hasCertificate && <span className="text-ok">Certificate</span>}
            {onToggleSave && (
              <button
                type="button"
                disabled={saving}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave(course);
                }}
                aria-label={isSaved ? 'Remove from saved courses' : 'Save course'}
                className={`rounded-full border px-2.5 py-1 font-medium transition ${
                  isSaved ? 'border-ember bg-ember-50 text-ember' : 'border-line text-ink-400 hover:border-ink'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
