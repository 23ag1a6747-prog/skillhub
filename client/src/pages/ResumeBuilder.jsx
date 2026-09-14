import { useEffect, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import api, { apiErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { saveResumeDraft, getResumeDraft, queuePendingSync, getPendingSyncItems, clearPendingSyncItem } from '../services/offlineDb';
import LoadingState from '../components/LoadingState';

const SECTION_LABELS = {
  summary: 'Summary',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  experience: 'Experience',
  achievements: 'Achievements',
  links: 'Links',
};

const TEMPLATES = [
  { key: 'modern', label: 'Modern', accent: '#2A4CE0' },
  { key: 'classic', label: 'Classic', accent: '#14171F' },
  { key: 'minimal', label: 'Minimal', accent: '#5B6180' },
  { key: 'compact', label: 'Compact', accent: '#E2712B' },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function ResumeBuilder() {
  const { notify } = useToast();
  const isOnline = useOnlineStatus();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ats, setAts] = useState(null);
  const [checkingAts, setCheckingAts] = useState(false);

  // ---- load resume (network first, offline draft fallback) ----
  useEffect(() => {
    async function load() {
      try {
        if (!isOnline) throw new Error('offline');
        const res = await api.get('/resume');
        setResume(res.data.resume);
        saveResumeDraft(res.data.resume);
      } catch (err) {
        const draft = await getResumeDraft();
        if (draft) {
          setResume(draft);
          if (isOnline) notify(apiErrorMessage(err), { type: 'error' });
        } else if (isOnline) {
          notify(apiErrorMessage(err), { type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOnline, notify]);

  // ---- flush queued offline edits once back online ----
  useEffect(() => {
    async function flush() {
      if (!isOnline) return;
      const items = await getPendingSyncItems();
      for (const item of items) {
        try {
          const res = await api.put('/resume', item.payload);
          setResume(res.data.resume);
          await clearPendingSyncItem(item.id);
        } catch {
          break; // stop on first failure, try again next time we come online
        }
      }
      if (items.length > 0) notify('Synced your offline resume edits.', { type: 'success' });
    }
    flush();
  }, [isOnline, notify]);

  const persist = useCallback(
    async (updated) => {
      setResume(updated);
      saveResumeDraft(updated);
      setSaving(true);
      try {
        if (!isOnline) throw new Error('offline');
        const res = await api.put('/resume', updated);
        setResume(res.data.resume);
      } catch {
        await queuePendingSync(updated);
        if (isOnline) notify('Could not save right now — will retry.', { type: 'error' });
      } finally {
        setSaving(false);
      }
    },
    [isOnline, notify]
  );

  const handleAutofill = async () => {
    try {
      const res = await api.post('/resume/autofill');
      setResume(res.data.resume);
      notify('Pulled in your skills and certificates.', { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  const handleAtsCheck = async () => {
    setCheckingAts(true);
    try {
      const res = await api.get('/resume/ats-score');
      setAts(res.data);
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setCheckingAts(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!resume) return;
    generateResumePdf(resume).save(`${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}.pdf`);
    notify('Resume downloaded.', { type: 'success' });
  };

  if (loading) return <LoadingState label="Loading your resume…" />;
  if (!resume) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Resume builder</h1>
          <p className="mt-1 text-sm text-ink-400">{saving ? 'Saving…' : 'All changes save automatically.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleAutofill} className="btn-secondary">
            Autofill from profile
          </button>
          <button onClick={handleAtsCheck} disabled={checkingAts} className="btn-secondary">
            {checkingAts ? 'Checking…' : 'Check ATS score'}
          </button>
          <button onClick={handleDownloadPdf} className="btn-primary">
            Download PDF
          </button>
        </div>
      </div>

      {ats && (
        <div className="card mt-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {ats.score}
                <span className="text-base font-medium text-ink-400">/100</span>
              </p>
              <p className="text-sm font-medium text-signal">{ats.rating}</p>
            </div>
            <button onClick={() => setAts(null)} className="btn-ghost text-xs">
              Dismiss
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400">{ats.disclaimer}</p>
          {ats.suggestions.length > 0 && (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-ink-600">
              {ats.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResumeEditor resume={resume} onChange={persist} />
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function ResumeEditor({ resume, onChange }) {
  const update = (patch) => onChange({ ...resume, ...patch });

  const moveSection = (index, direction) => {
    const order = [...resume.sectionOrder];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    update({ sectionOrder: order });
  };

  return (
    <div className="space-y-6">
      {/* Template */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Template</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => update({ template: t.key })}
              className={`rounded-control border px-2 py-2 text-xs font-medium transition ${
                resume.template === t.key ? 'border-ink bg-ink text-paper' : 'border-line text-ink-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Personal information</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Full name"
            value={resume.personalInfo?.fullName || ''}
            onChange={(e) => update({ personalInfo: { ...resume.personalInfo, fullName: e.target.value } })}
          />
          <input
            className="input"
            placeholder="Email"
            value={resume.personalInfo?.email || ''}
            onChange={(e) => update({ personalInfo: { ...resume.personalInfo, email: e.target.value } })}
          />
          <input
            className="input"
            placeholder="Phone"
            value={resume.personalInfo?.phone || ''}
            onChange={(e) => update({ personalInfo: { ...resume.personalInfo, phone: e.target.value } })}
          />
          <input
            className="input"
            placeholder="Location"
            value={resume.personalInfo?.location || ''}
            onChange={(e) => update({ personalInfo: { ...resume.personalInfo, location: e.target.value } })}
          />
          <input
            className="input sm:col-span-2"
            placeholder="Headline (e.g. Aspiring Data Analyst)"
            value={resume.personalInfo?.headline || ''}
            onChange={(e) => update({ personalInfo: { ...resume.personalInfo, headline: e.target.value } })}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Career summary</h2>
        <textarea
          className="input mt-3 min-h-[100px]"
          placeholder="2-3 sentences on your goal, strengths, and key skills…"
          value={resume.summary || ''}
          onChange={(e) => update({ summary: e.target.value })}
        />
      </div>

      {/* Skills */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Skills</h2>
        <input
          className="input mt-3"
          placeholder="Comma-separated: Python, SQL, Excel"
          value={(resume.skills || []).join(', ')}
          onChange={(e) =>
            update({
              skills: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <ListEditor
        title="Education"
        items={resume.education || []}
        onChange={(items) => update({ education: items })}
        newItem={() => ({ id: uid(), institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' })}
        fields={[
          { key: 'institution', placeholder: 'Institution' },
          { key: 'degree', placeholder: 'Degree' },
          { key: 'fieldOfStudy', placeholder: 'Field of study' },
          { key: 'startYear', placeholder: 'Start year' },
          { key: 'endYear', placeholder: 'End year' },
          { key: 'grade', placeholder: 'Grade / CGPA' },
        ]}
      />

      <ListEditor
        title="Projects"
        items={resume.projects || []}
        onChange={(items) => update({ projects: items })}
        newItem={() => ({ id: uid(), title: '', description: '', techStack: [], projectUrl: '' })}
        fields={[
          { key: 'title', placeholder: 'Project title' },
          { key: 'projectUrl', placeholder: 'Project URL (optional)' },
        ]}
        textareaField={{ key: 'description', placeholder: 'What did you build, with what tech, and what was the outcome?' }}
        arrayField={{ key: 'techStack', placeholder: 'Tech stack (comma-separated)' }}
      />

      <ListEditor
        title="Experience"
        items={resume.experience || []}
        onChange={(items) => update({ experience: items })}
        newItem={() => ({ id: uid(), role: '', organization: '', startDate: '', endDate: '', description: '' })}
        fields={[
          { key: 'role', placeholder: 'Role' },
          { key: 'organization', placeholder: 'Organization' },
          { key: 'startDate', placeholder: 'Start (e.g. Jun 2024)' },
          { key: 'endDate', placeholder: 'End (or Present)' },
        ]}
        textareaField={{ key: 'description', placeholder: 'What did you do, and what was the impact?' }}
      />

      {/* Achievements */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Achievements</h2>
        <textarea
          className="input mt-3 min-h-[80px]"
          placeholder="One per line, e.g. Ranked top 5% in a national coding contest"
          value={(resume.achievements || []).join('\n')}
          onChange={(e) => update({ achievements: e.target.value.split('\n').filter((l) => l.trim() !== '') })}
        />
      </div>

      {/* Links */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Links</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {['linkedin', 'github', 'portfolio', 'website'].map((key) => (
            <input
              key={key}
              className="input"
              placeholder={key[0].toUpperCase() + key.slice(1)}
              value={resume.links?.[key] || ''}
              onChange={(e) => update({ links: { ...resume.links, [key]: e.target.value } })}
            />
          ))}
        </div>
      </div>

      {/* Section order */}
      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">Section order</h2>
        <p className="mt-1 text-xs text-ink-400">Controls the order sections appear in your preview and PDF.</p>
        <div className="mt-3 space-y-1.5">
          {resume.sectionOrder.map((key, i) => (
            <div key={key} className="flex items-center justify-between rounded-control border border-line px-3 py-2 text-sm">
              <span>{SECTION_LABELS[key] || key}</span>
              <div className="flex gap-1">
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="btn-ghost px-2 py-1 disabled:opacity-30">
                  ↑
                </button>
                <button
                  onClick={() => moveSection(i, 1)}
                  disabled={i === resume.sectionOrder.length - 1}
                  className="btn-ghost px-2 py-1 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListEditor({ title, items, onChange, newItem, fields, textareaField, arrayField }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, newItem()]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        <button onClick={add} className="btn-ghost text-signal">
          + Add
        </button>
      </div>
      <div className="mt-3 space-y-4">
        {items.length === 0 && <p className="text-sm text-ink-400">Nothing added yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-control border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                <input
                  key={f.key}
                  className="input"
                  placeholder={f.placeholder}
                  value={item[f.key] || ''}
                  onChange={(e) => update(item.id, { [f.key]: e.target.value })}
                />
              ))}
            </div>
            {textareaField && (
              <textarea
                className="input mt-2 min-h-[70px]"
                placeholder={textareaField.placeholder}
                value={item[textareaField.key] || ''}
                onChange={(e) => update(item.id, { [textareaField.key]: e.target.value })}
              />
            )}
            {arrayField && (
              <input
                className="input mt-2"
                placeholder={arrayField.placeholder}
                value={(item[arrayField.key] || []).join(', ')}
                onChange={(e) =>
                  update(item.id, {
                    [arrayField.key]: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            )}
            <button onClick={() => remove(item.id)} className="btn-ghost mt-2 text-xs text-warn hover:bg-warn/5">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------------------

function ResumePreview({ resume }) {
  const accent = TEMPLATES.find((t) => t.key === resume.template)?.accent || '#2A4CE0';

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-ink/[0.02] px-4 py-2 text-xs font-medium text-ink-400">Live preview</div>
        <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-8" style={{ fontFamily: resume.template === 'classic' ? 'Georgia, serif' : undefined }}>
          <h1 className="text-2xl font-bold" style={{ color: accent }}>
            {resume.personalInfo?.fullName || 'Your name'}
          </h1>
          {resume.personalInfo?.headline && <p className="mt-0.5 text-sm text-ink-600">{resume.personalInfo.headline}</p>}
          <p className="mt-1 text-xs text-ink-400">
            {[resume.personalInfo?.email, resume.personalInfo?.phone, resume.personalInfo?.location].filter(Boolean).join(' · ')}
          </p>

          {resume.sectionOrder.map((key) => (
            <PreviewSection key={key} sectionKey={key} resume={resume} accent={accent} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ sectionKey, resume, accent }) {
  const heading = (text) => (
    <h2 className="mt-5 border-b pb-1 text-sm font-semibold uppercase tracking-wide" style={{ borderColor: accent, color: accent }}>
      {text}
    </h2>
  );

  switch (sectionKey) {
    case 'summary':
      return resume.summary ? (
        <>
          {heading('Summary')}
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{resume.summary}</p>
        </>
      ) : null;
    case 'education':
      return resume.education?.length ? (
        <>
          {heading('Education')}
          {resume.education.map((e) => (
            <div key={e.id} className="mt-2 text-sm">
              <p className="font-medium text-ink">
                {e.institution} {e.degree && `— ${e.degree}`}
              </p>
              <p className="text-xs text-ink-400">
                {e.fieldOfStudy} {e.startYear && `· ${e.startYear}–${e.endYear || 'present'}`} {e.grade && `· ${e.grade}`}
              </p>
            </div>
          ))}
        </>
      ) : null;
    case 'skills':
      return resume.skills?.length ? (
        <>
          {heading('Skills')}
          <p className="mt-2 text-sm text-ink-600">{resume.skills.join(' · ')}</p>
        </>
      ) : null;
    case 'projects':
      return resume.projects?.length ? (
        <>
          {heading('Projects')}
          {resume.projects.map((p) => (
            <div key={p.id} className="mt-2 text-sm">
              <p className="font-medium text-ink">{p.title}</p>
              <p className="text-ink-600">{p.description}</p>
              {p.techStack?.length > 0 && <p className="text-xs text-ink-400">{p.techStack.join(', ')}</p>}
            </div>
          ))}
        </>
      ) : null;
    case 'certifications':
      return resume.certifications?.length ? (
        <>
          {heading('Certifications')}
          {resume.certifications.map((c) => (
            <div key={c.id} className="mt-2 text-sm">
              <p className="font-medium text-ink">{c.name}</p>
              <p className="text-xs text-ink-400">
                {c.issuingOrganization} {c.issueDate && `· ${c.issueDate}`}
              </p>
            </div>
          ))}
        </>
      ) : null;
    case 'experience':
      return resume.experience?.length ? (
        <>
          {heading('Experience')}
          {resume.experience.map((e) => (
            <div key={e.id} className="mt-2 text-sm">
              <p className="font-medium text-ink">
                {e.role} {e.organization && `· ${e.organization}`}
              </p>
              <p className="text-xs text-ink-400">
                {e.startDate} – {e.current ? 'Present' : e.endDate}
              </p>
              <p className="text-ink-600">{e.description}</p>
            </div>
          ))}
        </>
      ) : null;
    case 'achievements':
      return resume.achievements?.length ? (
        <>
          {heading('Achievements')}
          <ul className="mt-2 list-inside list-disc text-sm text-ink-600">
            {resume.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      ) : null;
    case 'links':
      return resume.links && Object.values(resume.links).some(Boolean) ? (
        <>
          {heading('Links')}
          <p className="mt-2 text-sm text-signal">
            {Object.entries(resume.links)
              .filter(([, v]) => v)
              .map(([, v]) => v)
              .join(' · ')}
          </p>
        </>
      ) : null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

function generateResumePdf(resume) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(resume.personalInfo?.fullName || 'Resume', margin, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (resume.personalInfo?.headline) {
    doc.text(resume.personalInfo.headline, margin, y);
    y += 14;
  }
  const contactLine = [resume.personalInfo?.email, resume.personalInfo?.phone, resume.personalInfo?.location]
    .filter(Boolean)
    .join('   |   ');
  if (contactLine) {
    doc.text(contactLine, margin, y);
    y += 18;
  }

  const heading = (text) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(text.toUpperCase(), margin, y);
    doc.setDrawColor(180);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const paragraph = (text, opts = {}) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * 13 + 4);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.text(lines, margin, y);
    y += lines.length * 13 + (opts.gap || 4);
  };

  const sectionRenderers = {
    summary: () => resume.summary && (heading('Summary'), paragraph(resume.summary)),
    education: () =>
      resume.education?.length &&
      (heading('Education'),
      resume.education.forEach((e) => {
        paragraph(`${e.institution || ''}${e.degree ? ' — ' + e.degree : ''}`, { bold: true, gap: 2 });
        paragraph(
          [e.fieldOfStudy, e.startYear && `${e.startYear}–${e.endYear || 'present'}`, e.grade].filter(Boolean).join(' · ')
        );
      })),
    skills: () => resume.skills?.length && (heading('Skills'), paragraph(resume.skills.join('  ·  '))),
    projects: () =>
      resume.projects?.length &&
      (heading('Projects'),
      resume.projects.forEach((p) => {
        paragraph(p.title, { bold: true, gap: 2 });
        if (p.description) paragraph(p.description, { gap: 2 });
        if (p.techStack?.length) paragraph(p.techStack.join(', '));
      })),
    certifications: () =>
      resume.certifications?.length &&
      (heading('Certifications'),
      resume.certifications.forEach((c) => {
        paragraph(`${c.name} — ${c.issuingOrganization || ''}${c.issueDate ? ' (' + c.issueDate + ')' : ''}`);
      })),
    experience: () =>
      resume.experience?.length &&
      (heading('Experience'),
      resume.experience.forEach((e) => {
        paragraph(`${e.role || ''}${e.organization ? ' · ' + e.organization : ''}`, { bold: true, gap: 2 });
        paragraph(`${e.startDate || ''} – ${e.current ? 'Present' : e.endDate || ''}`, { gap: 2 });
        if (e.description) paragraph(e.description);
      })),
    achievements: () =>
      resume.achievements?.length &&
      (heading('Achievements'), resume.achievements.forEach((a) => paragraph(`•  ${a}`))),
    links: () =>
      resume.links &&
      Object.values(resume.links).some(Boolean) &&
      (heading('Links'), paragraph(Object.values(resume.links).filter(Boolean).join('   |   '))),
  };

  resume.sectionOrder.forEach((key) => sectionRenderers[key]?.());

  return doc;
}
