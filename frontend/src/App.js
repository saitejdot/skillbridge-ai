import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  UserRound,
  Compass,
  Target,
  FileText,
  Map,
  MessageCircle,
  Mic2,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Plus,
  Send,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import './App.css';
import './drawer.css';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;

const nav = [
  ['/dashboard', 'Overview', LayoutDashboard],
  ['/profile', 'Profile & skills', UserRound],
  ['/recommendations', 'Career matches', Compass],
  ['/gap-analyzer', 'Skill gaps', Target],
  ['/resume-analyzer', 'Resume lab', FileText],
  ['/roadmap', 'Learning roadmap', Map],
  ['/mentor', 'Career mentor', MessageCircle],
  ['/interview', 'Interview prep', Mic2],
  ['/analytics', 'Progress analytics', BarChart3],
  ['/documentation', 'Project notes', BookOpen],
];

const get = async (path) => (await axios.get(API + path)).data;
const post = async (path, data, config) => (await axios.post(API + path, data, config)).data;

function Shell({ children }) {
  const loc = useLocation();
  const navg = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <b>SkillBridge</b>
            <span>AI career studio</span>
          </div>
          <button
            className="drawer-close"
            data-testid="mobile-drawer-close-button"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        {nav.map(([href, label, Icon]) => (
          <button
            data-testid={`nav-${href.slice(1)}-link`}
            className={loc.pathname === href ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              navg(href);
              setOpen(false);
            }}
            key={href}
          >
            <Icon size={18} />
            <span>{label}</span>
            {loc.pathname === href && <ChevronRight size={15} />}
          </button>
        ))}

        <div className="sidebar-foot">
          <div className="sdg-badge">
            SDG <b>8</b>
          </div>
          <small>Decent work & economic growth</small>
        </div>
      </aside>

      {open && (
        <button
          className="drawer-backdrop"
          data-testid="mobile-drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            data-testid="mobile-menu-button"
            onClick={() => setOpen(!open)}
          >
            <Menu size={20} />
          </button>
          <div>
            <span className="crumb">Workspace / </span>
            <b>{nav.find((x) => x[0] === loc.pathname)?.[1] || 'Overview'}</b>
          </div>
          <div className="top-actions">
            <span className="status-dot"></span>
            <span className="mode-text">Demo profile</span>
            <button data-testid="google-signin-button" className="signin">
              Google sign-in <ArrowUpRight size={14} />
            </button>
            <div className="avatar">AS</div>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}

function Card({ children, className = '' }) {
  return <div className={'card ' + className}>{children}</div>;
}

function SectionHead({ eyebrow, title, sub, action }) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Pill({ children, tone = '' }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

function Loader() {
  return (
    <div className="loading">
      <div className="loader-dot"></div>
      <span>Loading your career signal…</span>
    </div>
  );
}

function Stat({ label, value, note, color }) {
  return (
    <div className="stat">
      <span className={`stat-icon ${color}`}></span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{note}</em>
    </div>
  );
}

function Dashboard() {
  const [p, setP] = useState(null);
  const [rec, setRec] = useState([]);
  const [road, setRoad] = useState(null);

  useEffect(() => {
    Promise.all([get('/profile'), get('/recommendations'), get('/roadmap')]).then(([a, b, c]) => {
      setP(a);
      setRec(b);
      setRoad(c);
    });
  }, []);

  if (!p) return <Loader />;

  const completion = Math.min(96, 35 + p.technical_skills.length * 7 + p.projects.length * 8);

  return (
    <>
      <SectionHead
        eyebrow="THURSDAY · CAREER CHECK-IN"
        title={`Good morning, ${p.name.split(' ')[0]}.`}
        sub="A clear next step makes progress feel lighter. Here’s your current career signal."
        action={
          <a className="outline-btn" data-testid="dashboard-profile-link" href="/profile">
            Edit profile <ArrowUpRight size={16} />
          </a>
        }
      />

      <div className="hero-band">
        <div>
          <Pill tone="mint">CAREER READINESS</Pill>
          <strong>Keep building your signal.</strong>
          <p>
            Your profile is {completion}% complete. Add evidence through projects and focused practice.
          </p>
          <a href="/roadmap" className="text-link" data-testid="dashboard-roadmap-link">
            Continue roadmap <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="score-ring">
          <span>{completion}%</span>
          <small>profile signal</small>
        </div>
      </div>

      <div className="stat-grid">
        <Stat
          label="Top career match"
          value={rec[0]?.title || 'Explore'}
          note={rec[0] ? `${rec[0].score}% relative match` : ''}
          color="blue"
        />
        <Stat
          label="Skills to develop"
          value={rec[0]?.missing_skills?.length || 0}
          note="across your top match"
          color="orange"
        />
        <Stat
          label="Roadmap progress"
          value={
            road?.tasks?.length
              ? `${Math.round((road.tasks.filter((x) => x.completed).length / road.tasks.length) * 100)}%`
              : '—'
          }
          note={road?.role || 'Not started'}
          color="green"
        />
        <Stat label="ML method" value="TF-IDF" note="explainable baseline" color="violet" />
      </div>

      <div className="two-col">
        <Card>
          <div className="card-head">
            <div>
              <span className="eyebrow">RECOMMENDED FOR YOU</span>
              <h2>Career matches</h2>
            </div>
            <a href="/recommendations" data-testid="dashboard-view-matches-link">
              View all <ArrowUpRight size={15} />
            </a>
          </div>
          {rec.slice(0, 3).map((r, i) => (
            <div className="match-row" key={r.id}>
              <span className="rank">0{i + 1}</span>
              <div className="match-main">
                <b>{r.title}</b>
                <small>
                  {r.tag} · {r.matched_skills.slice(0, 3).join(' · ') || 'Build your signal'}
                </small>
              </div>
              <strong className="match-score">{r.score}%</strong>
            </div>
          ))}
        </Card>

        <Card>
          <div className="card-head">
            <div>
              <span className="eyebrow">LEARNING PULSE</span>
              <h2>Next up</h2>
            </div>
            <a href="/roadmap" data-testid="dashboard-view-roadmap-link">
              Open roadmap <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="next-card">
            <div className="next-icon">
              <Map size={22} />
            </div>
            <div>
              <b>{road?.role || 'Choose a career path'}</b>
              <p>
                {road?.tasks?.[0]?.objective ||
                  'Generate a focused learning plan from your skill gaps.'}
              </p>
            </div>
          </div>
          <div className="progress-line">
            <span style={{ width: `${road?.tasks?.length ? 30 : 0}%` }}></span>
          </div>
          <small className="muted">
            {road?.weeks
              ? `${road.weeks}-week plan · 1 milestone at a time`
              : 'Ready when you are'}
          </small>
        </Card>
      </div>
    </>
  );
}

function Profile() {
  const [p, setP] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get('/profile').then(setP);
  }, []);

  if (!p) return <Loader />;

  const change = (k, v) => setP({ ...p, [k]: v });

  const save = async () => {
    await axios.put(API + '/profile', p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <SectionHead
        eyebrow="YOUR FOUNDATION"
        title="Profile & skills"
        sub="Your recommendations improve when your story is specific."
        action={
          <button className="primary-btn" data-testid="profile-save-button" onClick={save}>
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Saved
              </>
            ) : (
              <>
                Save changes <ArrowUpRight size={16} />
              </>
            )}
          </button>
        }
      />

      <Card className="form-card">
        <div className="form-grid">
          <label>
            Full name
            <input
              data-testid="profile-name-input"
              value={p.name}
              onChange={(e) => change('name', e.target.value)}
            />
          </label>
          <label>
            Education
            <input
              data-testid="profile-education-input"
              value={p.education}
              onChange={(e) => change('education', e.target.value)}
            />
          </label>
          <label>
            Specialization
            <input
              data-testid="profile-specialization-input"
              value={p.specialization}
              onChange={(e) => change('specialization', e.target.value)}
            />
          </label>
          <label>
            Target career role
            <select
              data-testid="profile-target-role-select"
              value={p.target_role}
              onChange={(e) => change('target_role', e.target.value)}
            >
              {[
                'Data Analyst',
                'Data Scientist',
                'Machine Learning Engineer',
                'AI Engineer',
                'Frontend Developer',
                'Backend Developer',
                'Full Stack Developer',
                'Cybersecurity Analyst',
                'Cloud Engineer',
                'DevOps Engineer',
                'UI/UX Designer',
                'QA Automation Engineer',
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Preferred industry
            <input
              data-testid="profile-industry-input"
              value={p.preferred_industry}
              onChange={(e) => change('preferred_industry', e.target.value)}
            />
          </label>
          <label>
            Weekly study hours
            <input
              data-testid="profile-hours-input"
              type="number"
              value={p.weekly_hours}
              onChange={(e) => change('weekly_hours', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="field-wide">
          <label>
            Technical skills <small>comma separated</small>
            <input
              data-testid="profile-technical-skills-input"
              value={p.technical_skills.join(', ')}
              onChange={(e) => change('technical_skills', e.target.value.split(',').map((s) => s.trim()))}
            />
          </label>
          <label>
            Soft skills <small>comma separated</small>
            <input
              data-testid="profile-soft-skills-input"
              value={p.soft_skills.join(', ')}
              onChange={(e) => change('soft_skills', e.target.value.split(',').map((s) => s.trim()))}
            />
          </label>
          <label>
            Projects <small>comma separated</small>
            <textarea
              data-testid="profile-projects-input"
              value={p.projects.join(', ')}
              onChange={(e) => change('projects', e.target.value.split(',').map((s) => s.trim()))}
            />
          </label>
        </div>
      </Card>

      <div className="note-strip">
        <Sparkles size={18} />
        <span>
          <b>Privacy-first demo mode.</b> This profile is stored as your private local workspace.
          Google sign-in is reserved as an optional future connection.
        </span>
      </div>
    </>
  );
}

function Recommendations() {
  const [rs, setRs] = useState([]);

  useEffect(() => {
    get('/recommendations').then(setRs);
  }, []);

  return (
    <>
      <SectionHead
        eyebrow="CAREER INTELLIGENCE"
        title="Paths that fit your signal"
        sub="Relative similarity, not a promise. Each match shows the evidence behind it."
      />

      <div className="method-banner">
        <div className="method-icon">∑</div>
        <div>
          <b>Explainable ML baseline</b>
          <p>
            TF-IDF turns your profile and each role description into weighted text vectors. Cosine
            similarity ranks the closest language, while normalized skill coverage explains the
            gaps.
          </p>
        </div>
        <Pill tone="blue">TF-IDF + COSINE</Pill>
      </div>

      <div className="role-list">
        {rs.map((r, i) => (
          <Card className="role-card" key={r.id}>
            <div className="role-rank">0{i + 1}</div>
            <div className="role-info">
              <div>
                <span className="eyebrow">{r.tag}</span>
                <h2>{r.title}</h2>
              </div>
              <p>{r.description}</p>
              <div className="chips">
                {r.matched_skills.map((s) => (
                  <Pill tone="mint" key={s}>
                    ✓ {s}
                  </Pill>
                ))}
                {r.missing_skills.slice(0, 3).map((s) => (
                  <Pill key={s}>+ {s}</Pill>
                ))}
              </div>
            </div>
            <div className="role-score">
              <strong>{r.score}%</strong>
              <small>relative match</small>
              <a href={`/gap-analyzer?role=${r.id}`} data-testid={`recommendation-gap-${r.id}`}>
                Explore gap <ArrowUpRight size={14} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Gap() {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState('data-analyst');
  const [data, setData] = useState(null);

  useEffect(() => {
    get('/roles').then(setRoles);
  }, []);

  useEffect(() => {
    get('/gap/' + selected).then(setData);
  }, [selected]);

  return (
    <>
      <SectionHead
        eyebrow="CLOSE THE DISTANCE"
        title="Skill gap analyzer"
        sub="See what you already own, what matters next, and why."
      />

      <div className="toolbar">
        <select
          data-testid="gap-role-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {roles.map((r) => (
            <option value={r.id} key={r.id}>
              {r.title}
            </option>
          ))}
        </select>
        <Pill tone="blue">{data?.methodology || 'Normalizing skills…'}</Pill>
      </div>

      {data && (
        <>
          <div className="gap-overview">
            <div>
              <small>SKILL COVERAGE</small>
              <strong>{data.coverage}%</strong>
              <p>
                {data.possessed.length} of {data.role.required.length} essential skills recognized
              </p>
            </div>
            <div className="big-progress">
              <span style={{ width: `${data.coverage}%` }}></span>
            </div>
          </div>

          <div className="three-col">
            <SkillBox title="You have" items={data.possessed} tone="have" />
            <SkillBox title="Priority next" items={data.missing} tone="need" />
            <SkillBox title="Level up later" items={data.additional} tone="later" />
          </div>
        </>
      )}
    </>
  );
}

function SkillBox({ title, items, tone }) {
  return (
    <Card className="skill-box">
      <div className="card-head">
        <h2>{title}</h2>
        <span className={`count ${tone}`}>{items.length}</span>
      </div>
      {items.map((x) => (
        <div className="skill-line" key={x}>
          <span className={`skill-dot ${tone}`}></span>
          {x}
        </div>
      ))}
    </Card>
  );
}

function Resume() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('job_description', jd);
    try {
      setResult(await post('/resume/analyze', fd));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHead
        eyebrow="RESUME LAB"
        title="Make your resume easier to find"
        sub="Upload once for a private, rule-based scan. Files are analyzed in memory and not retained."
      />

      <div className="resume-grid">
        <Card className="upload-card">
          <div className="upload-zone">
            <UploadCloud size={30} />
            <b>{file ? file.name : 'Drop a PDF or DOCX here'}</b>
            <small>Maximum 5 MB · no permanent file storage</small>
            <input
              data-testid="resume-file-input"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <label>
            Target job description
            <textarea
              data-testid="resume-job-description-input"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste a role description for keyword relevance…"
            />
          </label>
          <button
            data-testid="resume-analyze-button"
            className="primary-btn wide"
            onClick={analyze}
            disabled={!file || loading}
          >
            {loading ? (
              'Analyzing…'
            ) : (
              <>
                Analyze resume <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </Card>

        {result ? (
          <Card className="result-card">
            <div className="result-score">
              <strong>{result.relevance_score}%</strong>
              <span>relative relevance</span>
            </div>
            <h2>Resume signal</h2>
            <p>Not an official ATS score. Use this as a practical starting point.</p>
            <div className="result-section">
              <b>Recognized skills</b>
              <div className="chips">
                {result.identified_skills.map((s) => (
                  <Pill tone="mint" key={s}>
                    {s}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="result-section">
              <b>Section completeness</b>
              {Object.entries(result.sections).map(([k, v]) => (
                <div className="check-row" key={k}>
                  <span>{v ? <CheckCircle2 size={16} /> : <span className="empty-check" />}</span>
                  {k}
                  <em>{v ? 'Found' : 'Add section'}</em>
                </div>
              ))}
            </div>
            <div className="result-section">
              <b>Suggested improvements</b>
              {result.suggestions.map((x) => (
                <p className="suggestion" key={x}>
                  ↗ {x}
                </p>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="empty-result">
            <FileText size={35} />
            <h2>Your scan appears here</h2>
            <p>Upload a resume and add a target job description to compare real text signals.</p>
          </Card>
        )}
      </div>
    </>
  );
}

function Roadmap() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState('data-analyst');
  const [weeks, setWeeks] = useState(8);
  const [road, setRoad] = useState(null);

  useEffect(() => {
    Promise.all([get('/roles'), get('/roadmap')]).then(([a, b]) => {
      setRoles(a);
      if (b.tasks?.length) {
        setRoad(b);
        setRole(b.role_id);
      }
    });
  }, []);

  const create = async () => {
    setRoad(await post('/roadmap', new URLSearchParams({ role_id: role, weeks })));
  };

  return (
    <>
      <SectionHead
        eyebrow="YOUR NEXT CHAPTER"
        title="Learning roadmap"
        sub="A focused sequence beats a crowded list of courses."
        action={
          <button data-testid="roadmap-generate-button" className="primary-btn" onClick={create}>
            <Plus size={16} /> Generate plan
          </button>
        }
      />

      <div className="roadmap-controls">
        <select
          data-testid="roadmap-role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {roles.map((r) => (
            <option value={r.id} key={r.id}>
              {r.title}
            </option>
          ))}
        </select>
        <div className="segmented">
          {[4, 8, 12].map((x) => (
            <button
              data-testid={`roadmap-${x}-weeks-button`}
              className={weeks === x ? 'selected' : ''}
              onClick={() => setWeeks(x)}
              key={x}
            >
              {x} weeks
            </button>
          ))}
        </div>
      </div>

      {road?.tasks?.length ? (
        <div className="timeline">
          {road.tasks.map((t, i) => (
            <Card className={t.completed ? 'timeline-item done' : 'timeline-item'} key={i}>
              <div className="week">
                WEEK
                <br />
                <b>{String(t.week).padStart(2, '0')}</b>
              </div>
              <div>
                <Pill tone="blue">{t.objective}</Pill>
                <h2>{t.topics.join(' · ')}</h2>
                <p>{t.exercise}</p>
              </div>
              <div className="milestone">
                {t.milestone ? <CheckCircle2 size={19} /> : <span>{i + 1}</span>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Map size={38} />
          <h2>Your plan is waiting</h2>
          <p>Choose a role and duration, then generate a grounded plan from the skill dataset.</p>
        </div>
      )}
    </>
  );
}

function Mentor() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi Aarav — I’m your career mentor. Ask me about a role, resume improvement, projects, or interview preparation.',
    },
  ]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const q = input;
    setInput('');
    setMessages((m) => [
      ...m,
      { from: 'you', text: q },
      { from: 'bot', text: 'Thinking through your profile…' },
    ]);
    const r = await post('/mentor', { message: q });
    setMessages((m) => [...m.slice(0, -1), { from: 'bot', text: r.answer, mode: r.mode }]);
  };

  return (
    <>
      <SectionHead
        eyebrow="GROUNDING + GUIDANCE"
        title="Career mentor"
        sub="Practical answers grounded in your profile and curated role data."
      />

      <Card className="chat-card">
        <div className="chat-head">
          <div className="mentor-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <b>SkillBridge mentor</b>
            <small>Profile-aware · grounded guidance</small>
          </div>
          <Pill tone="mint">READY</Pill>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div className={m.from === 'you' ? 'message you' : 'message'} key={i}>
              <div>{m.text}</div>
              {m.mode && <small>{m.mode}</small>}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            data-testid="mentor-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask: what should I learn next?"
          />
          <button data-testid="mentor-send-button" className="primary-btn" onClick={send}>
            <Send size={16} />
          </button>
        </div>
      </Card>
    </>
  );
}

function Interview() {
  const [role, setRole] = useState('Data Analyst');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);

  const run = async () => {
    setResult(
      await post('/interview/feedback', {
        role,
        difficulty: 'Beginner',
        category: 'Technical',
        answer,
      })
    );
  };

  return (
    <>
      <SectionHead
        eyebrow="PRACTICE WITH INTENT"
        title="Interview preparation"
        sub="Use repetition to make your thinking easier to explain."
      />

      <div className="interview-grid">
        <Card className="question-card">
          <Pill tone="blue">BEGINNER · TECHNICAL</Pill>
          <h2>Explain a {role} concept you recently practiced.</h2>
          <p>Take a moment to structure your answer: context, approach, result, reflection.</p>
          <label>
            Practice role
            <select
              data-testid="interview-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Data Analyst</option>
              <option>Frontend Developer</option>
              <option>Machine Learning Engineer</option>
              <option>Backend Developer</option>
            </select>
          </label>
          <textarea
            data-testid="interview-answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here…"
          />
          <button
            data-testid="interview-submit-button"
            className="primary-btn"
            onClick={run}
          >
            Get structured feedback <ArrowUpRight size={16} />
          </button>
        </Card>

        <Card className="feedback-card">
          {result ? (
            <>
              <div className="feedback-score">
                <strong>{result.score}</strong>
                <span>
                  / 100
                  <br />
                  practice signal
                </span>
              </div>
              <h2>Coach notes</h2>
              <p>{result.feedback}</p>
              <div className="note-strip">
                <Mic2 size={17} /> {result.note}
              </div>
            </>
          ) : (
            <div className="empty-result">
              <Mic2 size={34} />
              <h2>Your coach notes appear here</h2>
              <p>Submit an answer for supportive, structured practice feedback.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Analytics() {
  return (
    <>
      <SectionHead
        eyebrow="SEE THE ARC"
        title="Progress analytics"
        sub="Small signals compound into career readiness."
      />

      <div className="analytics-grid">
        <Card className="chart-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">SKILL COVERAGE</span>
              <h2>Progress over time</h2>
            </div>
            <Pill tone="mint">DEMO PROFILE</Pill>
          </div>
          <div className="bars">
            {['Profile', 'Skills', 'Resume', 'Roadmap', 'Practice'].map((x, i) => (
              <div className="bar-col" key={x}>
                <span style={{ height: `${[38, 54, 47, 29, 18][i] * 2.1}px` }}></span>
                <small>{x}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <span className="eyebrow">YOUR MOMENTUM</span>
          <h2>Make the next artifact</h2>
          <p className="large-quote">“Evidence beats intention.”</p>
          <p className="muted">
            Turn one missing skill into a small project, then let your profile tell that story.
          </p>
          <a className="text-link" href="/roadmap" data-testid="analytics-roadmap-link">
            Open your roadmap <ArrowUpRight size={15} />
          </a>
        </Card>
      </div>
    </>
  );
}

function Docs() {
  return (
    <>
      <SectionHead
        eyebrow="THE WHY + THE HOW"
        title="Project notes"
        sub="A transparent look at the internship project behind the product."
      />

      <div className="docs-grid">
        <Card>
          <span className="eyebrow">CONCEPT NOTE</span>
          <h2>Career readiness should be navigable.</h2>
          <p>
            SkillBridge AI helps students move from vague ambition to a sequence of evidence-backed
            next steps. It supports SDG 8 by making employability preparation more accessible and
            explainable.
          </p>
          <div className="doc-points">
            <b>01 · Problem</b>
            <p>Students struggle to connect their current skills to realistic entry-level pathways.</p>
            <b>02 · Method</b>
            <p>
              TF-IDF and cosine similarity provide an inspectable NLP baseline, paired with normalized
              skill matching.
            </p>
            <b>03 · Limitation</b>
            <p>
              Similarity is a relative signal, not a probability of success or a substitute for human
              advice.
            </p>
          </div>
        </Card>

        <Card>
          <span className="eyebrow">LEAN CANVAS</span>
          <h2>One workspace, nine signals.</h2>
          {[
            ['Customer segments', 'Students and early-career learners'],
            ['Unique value', 'Explainable next steps, not arbitrary scores'],
            ['Channels', 'Campus programs, mentors, peer sharing'],
            ['Key metrics', 'Profile completion, skill coverage, practice cadence'],
            ['Future scope', 'Google sign-in, richer evaluations, PostgreSQL deployment'],
          ].map(([a, b]) => (
            <div className="canvas-row" key={a}>
              <b>{a}</b>
              <span>{b}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function RouteView() {
  const path = useLocation().pathname;
  const Component =
    path === '/dashboard' || path === '/'
      ? Dashboard
      : path === '/profile'
      ? Profile
      : path === '/recommendations'
      ? Recommendations
      : path === '/gap-analyzer'
      ? Gap
      : path === '/resume-analyzer'
      ? Resume
      : path === '/roadmap'
      ? Roadmap
      : path === '/mentor'
      ? Mentor
      : path === '/interview'
      ? Interview
      : path === '/analytics'
      ? Analytics
      : Docs;

  return <Component />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <RouteView />
      </Shell>
    </BrowserRouter>
  );
}
