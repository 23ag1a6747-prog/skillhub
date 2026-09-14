import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import LoadingState from '../components/LoadingState';

export default function PublicPortfolio() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/portfolio/${username}`)
      .then((res) => setProfile(res.data))
      .catch((err) => setError(apiErrorMessage(err, 'Profile not found.')));
  }, [username]);

  if (error) {
    return <div className="mx-auto max-w-lg px-4 py-24 text-center text-ink-400">{error}</div>;
  }
  if (!profile) return <LoadingState label="Loading portfolio…" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="card p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-signal-50 font-display text-xl font-bold text-signal">
            {profile.name?.[0]}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{profile.name}</h1>
            {profile.headline && <p className="text-sm text-ink-600">{profile.headline}</p>}
            {profile.location && <p className="text-xs text-ink-400">{profile.location}</p>}
          </div>
        </div>

        {profile.bio && <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600">{profile.bio}</p>}

        {profile.careerGoal && (
          <p className="mt-3 inline-block rounded-full bg-ember-50 px-3 py-1 text-xs font-medium text-ember">
            Working toward: {profile.careerGoal}
          </p>
        )}

        {profile.links && Object.values(profile.links).some(Boolean) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-signal">
            {Object.entries(profile.links)
              .filter(([, v]) => v)
              .map(([key, v]) => (
                <a key={key} href={v} target="_blank" rel="noreferrer" className="hover:underline">
                  {key[0].toUpperCase() + key.slice(1)}
                </a>
              ))}
          </div>
        )}

        {profile.skills?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-base font-semibold text-ink">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s.name} className="rounded-full border border-line px-3 py-1 text-sm text-ink-600">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.certificates?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-base font-semibold text-ink">Certificates</h2>
            <div className="mt-2 space-y-2">
              {profile.certificates.map((c) => (
                <div key={c._id} className="rounded-control border border-line p-3 text-sm">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.issuingOrganization}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.projects?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-base font-semibold text-ink">Projects</h2>
            <div className="mt-2 space-y-3">
              {profile.projects.map((p) => (
                <div key={p.id} className="rounded-control border border-line p-3 text-sm">
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="text-ink-600">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.completedCourses?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-base font-semibold text-ink">Completed courses</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-ink-600">
              {profile.completedCourses.map((c) => (
                <li key={c._id}>
                  {c.title} <span className="text-ink-400">· {c.platform}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
