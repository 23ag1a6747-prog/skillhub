import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SkillBadge from '../components/SkillBadge';

const CAREER_GOALS = [
  'Data Analyst',
  'Data Scientist',
  'Web Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'ML Engineer',
  'Cloud Engineer',
  'UI/UX Designer',
];

const DOMAINS = ['Data Science', 'Web Development', 'Cloud & DevOps', 'Design', 'Programming Fundamentals'];

export default function Onboarding() {
  const { updateLocalUser } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [careerGoal, setCareerGoal] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [domains, setDomains] = useState([]);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [submitting, setSubmitting] = useState(false);

  const addSkill = (e) => {
    e.preventDefault();
    const value = skillInput.trim();
    if (value && !skills.includes(value)) setSkills([...skills, value]);
    setSkillInput('');
  };

  const toggleDomain = (d) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/users/me/onboarding', { careerGoal, currentSkills: skills, interestedDomains: domains, skillLevel });
      updateLocalUser(res.data.user);
      notify('Profile set up — here are your recommendations.', { type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-signal' : 'bg-line'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-ink">What's your career goal?</h1>
          <p className="mt-1 text-sm text-ink-400">We'll use this to recommend the right courses first.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {CAREER_GOALS.map((goal) => (
              <button
                type="button"
                key={goal}
                onClick={() => setCareerGoal(goal)}
                className={`rounded-control border px-3 py-2.5 text-left text-sm font-medium transition ${
                  careerGoal === goal ? 'border-signal bg-signal-50 text-signal-600' : 'border-line text-ink-600 hover:border-ink'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <button disabled={!careerGoal} onClick={() => setStep(2)} className="btn-primary mt-6 w-full">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-ink">What skills do you already have?</h1>
          <p className="mt-1 text-sm text-ink-400">Add as many as apply — you can edit these later.</p>
          <form onSubmit={addSkill} className="mt-4 flex gap-2">
            <input
              className="input"
              placeholder="e.g. Python, Excel"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary whitespace-nowrap">
              Add
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <SkillBadge key={s} skill={s} onRemove={(name) => setSkills(skills.filter((sk) => sk !== name))} />
            ))}
            {skills.length === 0 && <p className="text-sm text-ink-400">No skills added yet — that's okay too.</p>}
          </div>

          <h2 className="mt-6 font-display text-base font-semibold text-ink">Interested domains</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleDomain(d)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  domains.includes(d) ? 'border-signal bg-signal-50 text-signal-600' : 'border-line text-ink-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-ink">What's your current skill level?</h1>
          <div className="mt-4 space-y-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setSkillLevel(level)}
                className={`block w-full rounded-control border px-4 py-3 text-left text-sm font-medium capitalize transition ${
                  skillLevel === level ? 'border-signal bg-signal-50 text-signal-600' : 'border-line text-ink-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Back
            </button>
            <button disabled={submitting} onClick={handleFinish} className="btn-primary flex-1">
              {submitting ? 'Setting up…' : 'See my recommendations'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
