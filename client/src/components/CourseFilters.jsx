const PLATFORMS = ['YouTube', 'NPTEL', 'Coursera', 'edX'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'durationAsc', label: 'Shortest first' },
  { value: 'durationDesc', label: 'Longest first' },
];

export default function CourseFilters({ filters, onChange, categories }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="card flex flex-col gap-4 p-4">
      <input
        className="input"
        placeholder="Search by title, skill, or instructor…"
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <select className="input" value={filters.platform} onChange={(e) => set({ platform: e.target.value })}>
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select className="input" value={filters.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select className="input" value={filters.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
          <option value="">All levels</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={filters.certificate}
          onChange={(e) => set({ certificate: e.target.value })}
        >
          <option value="">Any certificate</option>
          <option value="true">Has certificate</option>
          <option value="false">No certificate</option>
        </select>

        <select className="input" value={filters.maxDuration} onChange={(e) => set({ maxDuration: e.target.value })}>
          <option value="">Any duration</option>
          <option value="5">Under 5h</option>
          <option value="15">Under 15h</option>
          <option value="40">Under 40h</option>
        </select>

        <select className="input" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
