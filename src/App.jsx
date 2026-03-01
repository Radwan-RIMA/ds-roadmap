import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection,
  onSnapshot, addDoc, serverTimestamp, deleteDoc, query, orderBy
} from "firebase/firestore";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#13111a", bgCard: "#1c1927", bgDeep: "#161320",
  border: "#2a2540", borderHi: "#3d3660",
  text: "#e2dff0", textDim: "#8b87a8", textFade: "#4a4665",
  p1: "#7eb8f7", p2: "#6dd6a0", p3: "#f7c96e", p4: "#c792ea",
  gold: "#f7c96e", warn: "#f28b82", good: "#6dd6a0", info: "#7eb8f7",
};

const phaseColors = ["#7eb8f7", "#6dd6a0", "#f7c96e", "#c792ea"];

// ─── ADMIN EMAIL (change this to your real email) ─────────────────────────────
const ADMIN_EMAIL = "radwanrima0@gmail.com";

// ─── ROADMAP DATA ─────────────────────────────────────────────────────────────
const DEFAULT_ROADMAP = [
  { phase: 1, title: "Foundations", duration: "Months 1–3", color: "#7eb8f7", sections: [
    { id: "python-core", title: "Python Core", weeks: "Week 1–2", tasks: ["Variables, loops, functions", "List comprehensions & dictionaries", "Classes (basics), file I/O, error handling", "Complete Automate the Boring Stuff Ch. 1–8"] },
    { id: "python-ds",   title: "Python for Data Science", weeks: "Week 3–4", tasks: ["NumPy: arrays, indexing, broadcasting", "NumPy: vectorized operations", "Pandas: DataFrames, groupby, merge, pivot tables", "Pandas: nulls, apply, method chaining", "Daily EDA on real Kaggle dataset"] },
    { id: "sql",         title: "SQL", weeks: "Week 5–7", tasks: ["SELECT, WHERE, GROUP BY, HAVING, DISTINCT", "CASE WHEN", "JOINs — know when each applies", "Subqueries & CTEs", "Window functions: ROW_NUMBER, RANK, LAG, LEAD", "2 StrataScratch problems every morning"] },
    { id: "stats-prob",  title: "Probability", weeks: "Week 5–9 (parallel)", tasks: ["Events, conditional probability, independence", "Bayes theorem — explain with real example", "Watch StatQuest probability series"] },
    { id: "stats-dist",  title: "Distributions", weeks: "Week 6–9 (parallel)", tasks: ["Normal, Binomial, Poisson, Uniform", "Central Limit Theorem — explain 3 ways", "5 real-life examples per distribution"] },
    { id: "stats-inf",   title: "Statistical Inference", weeks: "Week 7–10 (parallel)", tasks: ["Hypothesis testing — explain to a PM out loud", "p-value — correct definition, no notes", "Confidence intervals", "Type I and II errors with examples", "Practical vs statistical significance", "A/B testing: design, run, interpret"] },
    { id: "linalg",      title: "Linear Algebra", weeks: "Week 10–11 (parallel)", tasks: ["Vectors, matrices, matrix multiplication", "Dot product — what it measures", "Eigenvalues and eigenvectors conceptually", "Watch 3Blue1Brown Essence of Linear Algebra"] },
  ]},
  { phase: 2, title: "Core ML", duration: "Months 3–7", color: "#6dd6a0", sections: [
    { id: "ml-framework",    title: "The ML Framework", weeks: "Week 1–2", tasks: ["Train / validation / test split", "Overfitting vs underfitting — learning curves", "Bias-variance tradeoff", "Cross-validation: k-fold, stratified", "Regularization L1 and L2"] },
    { id: "ml-regression",   title: "Supervised — Regression", weeks: "Week 3–4", tasks: ["Linear regression with math (OLS)", "Ridge (L2) and Lasso (L1)", "Polynomial regression", "Metrics: MAE, MSE, RMSE, R²"] },
    { id: "ml-class",        title: "Supervised — Classification", weeks: "Week 5–6", tasks: ["Logistic regression — log-odds", "Decision Trees", "Random Forests — why bagging reduces variance", "XGBoost — spend extra time here", "Precision, recall, F1, ROC-AUC", "Class imbalance: SMOTE, class weights", "When recall > precision — real example"] },
    { id: "ml-unsupervised", title: "Unsupervised Learning", weeks: "Week 7", tasks: ["KMeans — elbow method, silhouette", "Hierarchical clustering", "PCA — geometric understanding", "Explained variance ratio"] },
    { id: "ml-pipeline",     title: "Full ML Pipeline", weeks: "Week 8", tasks: ["Raw data → cleaning → EDA → features", "Model selection → tuning → evaluation", "SHAP values for interpretation", "Build from scratch, no tutorial", "Write up as business presentation"] },
    { id: "feature-eng",     title: "Feature Engineering", weeks: "Week 9–10", tasks: ["Missing data: impute vs drop", "Encoding: label vs one-hot vs target", "Interaction features, binning, log transforms", "Datetime features", "Read 3 Kaggle winning solution writeups"] },
  ]},
  { phase: 3, title: "Modern Skills", duration: "Months 7–12", color: "#f7c96e", sections: [
    { id: "dl-nn",   title: "Neural Networks", weeks: "Week 1–2", tasks: ["Backpropagation — chain rule intuitively", "Activation functions: ReLU, sigmoid, tanh", "Batch size, learning rate, epochs", "Dropout and batch normalization", "Build NN from scratch in NumPy", "Rebuild in PyTorch"] },
    { id: "dl-cnn",  title: "CNNs & Transfer Learning", weeks: "Week 3–4", tasks: ["Convolutional layers and pooling", "How CNNs see images", "Transfer learning concept", "Fine-tune ResNet or EfficientNet", "Data augmentation"] },
    { id: "dl-nlp",  title: "NLP & Transformers", weeks: "Week 5–6", tasks: ["Text preprocessing, tokenization, embeddings", "Attention mechanism conceptually", "BERT and variants", "Hugging Face: fine-tune a model", "NLP metrics: F1, BLEU, perplexity"] },
    { id: "llm",     title: "LLMs & Generative AI", weeks: "Week 7–9", tasks: ["How LLMs work: transformers, attention", "Prompt engineering", "RAG — the key pattern", "Fine-tuning vs RAG", "LangChain or LlamaIndex basics", "Build LLM project with real data"] },
    { id: "mlops",   title: "MLOps", weeks: "Week 10–12", tasks: ["Git: branching, PRs, commits", "Docker: containerize your model", "FastAPI: serve model as live API", "MLflow experiment tracking", "Deploy to cloud — live public URL", "Understand concept drift"] },
    { id: "dataviz", title: "Viz & Storytelling", weeks: "Ongoing", tasks: ["Matplotlib & Seaborn for EDA", "Plotly for interactive charts", "Tableau or Power BI", "Read Storytelling with Data", "5-slide business summary per project"] },
  ]},
  { phase: 4, title: "Portfolio & Jobs", duration: "Months 12–18", color: "#c792ea", sections: [
    { id: "portfolio",      title: "Portfolio Projects", weeks: "Month 12–15", tasks: ["Churn prediction with business framing", "Full A/B test analysis", "NLP project on real domain dataset", "Recommendation system as deployed API", "LLM-powered tool live at URL", "Clean README + write-up per project", "Medium/LinkedIn article per project"] },
    { id: "int-sql",        title: "Interview Prep — SQL", weeks: "Month 13–16", tasks: ["50 StrataScratch problems (medium + hard)", "Time yourself — 15 min max per problem", "Practice without autocomplete", "Review every wrong answer"] },
    { id: "int-stats",      title: "Interview Prep — Statistics", weeks: "Month 13–16", tasks: ["p-value: correct definition out loud", "Design A/B test out loud", "Correlation vs causation with example", "Confidence intervals — what they mean", "Statistical power and sample size"] },
    { id: "int-ml",         title: "Interview Prep — ML Theory", weeks: "Month 13–16", tasks: ["Gradient boosting — 2 min verbal", "Random forest: variance vs bias", "Class imbalance: 3 ways to handle", "L1 vs L2 intuitively", "Handle 60% missing feature", "Curse of dimensionality"] },
    { id: "int-case",       title: "Interview Prep — Case Studies", weeks: "Month 14–17", tasks: ["Framework: clarify→data→metric→model→limits", "Design recommendation system out loud", "Design fraud detection pipeline", "Design churn prediction system", "Mock interviews on Pramp"] },
    { id: "networking",     title: "Networking", weeks: "Month 1 → always", tasks: ["Post on LinkedIn weekly", "Comment on senior DS posts", "Attend PyData or DataTalks.Club", "Pick a domain and go deep", "1 specific question to 1 person per week", "Apply from Month 9"] },
  ]},
];

const quotes = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Stay with problems longer.", author: "Albert Einstein" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
  { text: "A year from now you'll wish you started today.", author: "Karen Lamb" },
  { text: "Every master was once a disaster.", author: "T. Harv Eker" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getTotalProgress(progress, roadmap) {
  const allKeys = roadmap.flatMap(ph => ph.sections.flatMap(s => s.tasks.map((_, i) => `${s.id}-${i}`)));
  const done = allKeys.filter(k => progress[k]).length;
  return { done, total: allKeys.length, pct: allKeys.length ? Math.round(done / allKeys.length * 100) : 0 };
}

function ProgressBar({ pct, color, height = 4 }) {
  return (
    <div style={{ height, background: T.border, borderRadius: height }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: height, transition: "width 0.4s" }} />
    </div>
  );
}

function ProgressRing({ pct, color, size = 48, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ}
        style={{ transition: "stroke-dashoffset 0.6s", strokeLinecap: "round" }} />
    </svg>
  );
}

function Btn({ onClick, children, color = T.info, style = {} }) {
  return (
    <button onClick={onClick} style={{ background: color + "18", border: `1px solid ${color}55`, color, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s", ...style }}>
      {children}
    </button>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  const inp = { background: T.bgDeep, border: `1px solid ${T.borderHi}`, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "40px 36px", width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>DS Roadmap Platform</div>
          <div style={{ fontSize: 12, color: T.textDim }}>Sign in to continue your learning journey</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>EMAIL</div>
          <input style={inp} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your email" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>PASSWORD</div>
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your password" />
        </div>
        {error && <div style={{ fontSize: 11, color: T.warn, marginBottom: 14, background: T.warn + "15", padding: "8px 12px", borderRadius: 6 }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "11px", background: `linear-gradient(135deg, ${T.p1}33, ${T.p4}33)`, border: `1px solid ${T.p1}55`, color: T.text, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: T.textFade, textAlign: "center" }}>
          Contact your instructor to get your login credentials.
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ currentUser }) {
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roadmap, setRoadmap] = useState(DEFAULT_ROADMAP);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [newMsg, setNewMsg] = useState({ to: "all", text: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [userErr, setUserErr] = useState("");
  const [userOk, setUserOk] = useState("");

  // Load students from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "student"));
    });
    return unsub;
  }, []);

  // Load messages
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("time", "desc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Load roadmap
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "config", "roadmap"));
      if (snap.exists()) setRoadmap(snap.data().data);
    };
    load();
  }, []);

  const saveRoadmap = async (r) => {
    setRoadmap(r);
    await setDoc(doc(db, "config", "roadmap"), { data: r });
  };

const addUser = async () => {
    setUserErr(""); setUserOk("");
    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password.trim()) { setUserErr("All fields required."); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, newUser.email.trim(), newUser.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        role: "student",
        progress: {},
        joinedAt: new Date().toISOString(),
      });
      // Sign back in as admin after creating student
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, prompt("Re-enter your admin password to stay logged in:") || "");
      setNewUser({ username: "", email: "", password: "" });
      setUserOk("Student added successfully!");
    } catch (e) {
      setUserErr("Error: " + e.message);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Remove this student?")) return;
    await deleteDoc(doc(db, "users", id));
  };

  const sendMessage = async () => {
    if (!newMsg.text.trim()) return;
    await addDoc(collection(db, "messages"), {
      from: currentUser.email,
      to: newMsg.to,
      text: newMsg.text.trim(),
      time: new Date().toISOString(),
    });
    setNewMsg({ to: "all", text: "" });
  };

  const updateTask = (phaseIdx, secIdx, taskIdx, value) => {
    const r = JSON.parse(JSON.stringify(roadmap));
    r[phaseIdx].sections[secIdx].tasks[taskIdx] = value;
    saveRoadmap(r); setEditingTask(null);
  };

  const deleteTask = (phaseIdx, secIdx, taskIdx) => {
    if (!window.confirm("Delete this task?")) return;
    const r = JSON.parse(JSON.stringify(roadmap));
    r[phaseIdx].sections[secIdx].tasks.splice(taskIdx, 1);
    saveRoadmap(r);
  };

  const addTask = (phaseIdx, secIdx) => {
    if (!newTaskText.trim()) return;
    const r = JSON.parse(JSON.stringify(roadmap));
    r[phaseIdx].sections[secIdx].tasks.push(newTaskText.trim());
    saveRoadmap(r); setAddingTask(null); setNewTaskText("");
  };

  const inp = { background: T.bgDeep, border: `1px solid ${T.borderHi}`, borderRadius: 7, padding: "8px 12px", color: T.text, fontSize: 12, outline: "none" };

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "students", label: "👥 Students" },
    { id: "messages", label: "💬 Messages" },
    { id: "roadmap",  label: "✏️ Edit Roadmap" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background: T.bgDeep, borderBottom: `1px solid ${T.border}`, padding: "14px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: T.textFade, letterSpacing: "0.12em" }}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Admin Dashboard</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: T.textDim }}>👤 {currentUser.email}</div>
            <Btn onClick={() => signOut(auth)} color={T.warn} style={{ padding: "5px 12px", fontSize: 11 }}>Logout</Btn>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "8px 14px", background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? T.p1 : "transparent"}`, color: tab === t.id ? T.p1 : T.textDim, cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total Students", value: students.length, color: T.p1 },
                { label: "Avg Progress", value: students.length ? Math.round(students.reduce((s, u) => s + getTotalProgress(u.progress || {}, roadmap).pct, 0) / students.length) + "%" : "0%", color: T.good },
                { label: "Messages Sent", value: messages.length, color: T.p4 },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, minWidth: 140, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 10, color: T.textFade, letterSpacing: "0.1em", marginBottom: 6 }}>{stat.label.toUpperCase()}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Student Progress</div>
              </div>
              {students.length === 0 && <div style={{ padding: "24px 20px", color: T.textFade, fontSize: 12 }}>No students yet.</div>}
              {[...students].sort((a,b) => getTotalProgress(b.progress||{},roadmap).pct - getTotalProgress(a.progress||{},roadmap).pct).map((u, i) => {
                const prog = getTotalProgress(u.progress || {}, roadmap);
                const color = phaseColors[Math.min(3, Math.floor(prog.pct / 25))];
                return (
                  <div key={u.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 5 }}>{u.username}</div>
                      <ProgressBar pct={prog.pct} color={color} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color }}>{prog.pct}%</div>
                      <div style={{ fontSize: 10, color: T.textFade }}>{prog.done}/{prog.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab === "students" && (
          <div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Add New Student</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input style={{ ...inp, flex: 1, minWidth: 120 }} placeholder="Name" value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} />
                <input style={{ ...inp, flex: 1, minWidth: 160 }} placeholder="Email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
                <input style={{ ...inp, flex: 1, minWidth: 120 }} placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
                <Btn onClick={addUser} color={T.good}>+ Add Student</Btn>
              </div>
              {userErr && <div style={{ fontSize: 11, color: T.warn, marginTop: 8 }}>{userErr}</div>}
              {userOk && <div style={{ fontSize: 11, color: T.good, marginTop: 8 }}>{userOk}</div>}
            </div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>All Students ({students.length})</div>
              </div>
              {students.length === 0 && <div style={{ padding: "24px 20px", color: T.textFade, fontSize: 12 }}>No students added yet.</div>}
              {students.map(u => {
                const prog = getTotalProgress(u.progress || {}, roadmap);
                const color = phaseColors[Math.min(3, Math.floor(prog.pct / 25))];
                return (
                  <div key={u.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{u.username}</div>
                      <div style={{ fontSize: 10, color: T.textFade }}>{u.email}</div>
                    </div>
                    <div style={{ flex: 2, minWidth: 160 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: T.textFade }}>Progress</span>
                        <span style={{ fontSize: 10, color }}>{prog.pct}% ({prog.done}/{prog.total})</span>
                      </div>
                      <ProgressBar pct={prog.pct} color={color} />
                    </div>
                    <button onClick={() => removeUser(u.id)} style={{ background: T.warn + "15", border: `1px solid ${T.warn}44`, color: T.warn, padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Remove</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Send Message</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>TO</div>
                <select value={newMsg.to} onChange={e => setNewMsg(p => ({ ...p, to: e.target.value }))}
                  style={{ ...inp, width: "100%", boxSizing: "border-box" }}>
                  <option value="all">📢 All Students</option>
                  {students.map(u => <option key={u.id} value={u.id}>👤 {u.username}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <textarea value={newMsg.text} onChange={e => setNewMsg(p => ({ ...p, text: e.target.value }))}
                  placeholder="Write your message..." rows={4}
                  style={{ ...inp, width: "100%", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <Btn onClick={sendMessage} color={T.p4}>Send Message</Btn>
            </div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Sent Messages ({messages.length})</div>
              </div>
              {messages.length === 0 && <div style={{ padding: "24px 20px", color: T.textFade, fontSize: 12 }}>No messages sent yet.</div>}
              {messages.map(m => {
                const toName = m.to === "all" ? "All Students" : students.find(u => u.id === m.to)?.username || "Unknown";
                return (
                  <div key={m.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: T.p4, background: T.p4 + "15", padding: "2px 8px", borderRadius: 4 }}>To: {toName}</span>
                      <span style={{ fontSize: 10, color: T.textFade }}>{new Date(m.time).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>{m.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EDIT ROADMAP ── */}
        {tab === "roadmap" && (
          <div>
            <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px" }}>
              ✏️ Changes here apply to all students immediately.
            </div>
            {roadmap.map((ph, pi) => (
              <div key={pi} style={{ marginBottom: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div onClick={() => setExpandedPhase(expandedPhase === pi ? null : pi)}
                  style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: ph.color }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: ph.color }}>Phase {ph.phase} — {ph.title}</span>
                  </div>
                  <span style={{ color: T.textFade }}>▾</span>
                </div>
                {expandedPhase === pi && ph.sections.map((sec, si) => {
                  const secKey = `${pi}-${si}`;
                  return (
                    <div key={si} style={{ borderTop: `1px solid ${T.border}` }}>
                      <div onClick={() => setExpandedSection(expandedSection === secKey ? null : secKey)}
                        style={{ padding: "11px 18px 11px 28px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.textDim }}>{sec.title}</span>
                        <span style={{ fontSize: 10, color: T.textFade }}>{sec.tasks.length} tasks ▾</span>
                      </div>
                      {expandedSection === secKey && (
                        <div style={{ padding: "0 18px 14px 28px" }}>
                          {sec.tasks.map((task, ti) => (
                            <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                              {editingTask === `${pi}-${si}-${ti}` ? (
                                <>
                                  <input defaultValue={task} id={`task-inp-${pi}-${si}-${ti}`} style={{ ...inp, flex: 1, fontSize: 11 }} autoFocus />
                                  <Btn onClick={() => updateTask(pi, si, ti, document.getElementById(`task-inp-${pi}-${si}-${ti}`).value)} color={T.good} style={{ padding: "4px 10px", fontSize: 11 }}>Save</Btn>
                                  <Btn onClick={() => setEditingTask(null)} color={T.textFade} style={{ padding: "4px 10px", fontSize: 11 }}>Cancel</Btn>
                                </>
                              ) : (
                                <>
                                  <span style={{ flex: 1, fontSize: 11, color: T.textDim }}>{task}</span>
                                  <button onClick={() => setEditingTask(`${pi}-${si}-${ti}`)} style={{ background: "none", border: "none", color: T.info, cursor: "pointer", fontSize: 11 }}>Edit</button>
                                  <button onClick={() => deleteTask(pi, si, ti)} style={{ background: "none", border: "none", color: T.warn, cursor: "pointer", fontSize: 11 }}>✕</button>
                                </>
                              )}
                            </div>
                          ))}
                          {addingTask === `${pi}-${si}` ? (
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <input style={{ ...inp, flex: 1, fontSize: 11 }} placeholder="New task..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)} autoFocus />
                              <Btn onClick={() => addTask(pi, si)} color={T.good} style={{ padding: "4px 10px", fontSize: 11 }}>Add</Btn>
                              <Btn onClick={() => { setAddingTask(null); setNewTaskText(""); }} color={T.textFade} style={{ padding: "4px 10px", fontSize: 11 }}>Cancel</Btn>
                            </div>
                          ) : (
                            <button onClick={() => { setAddingTask(`${pi}-${si}`); setNewTaskText(""); }}
                              style={{ marginTop: 8, background: "none", border: `1px dashed ${T.borderHi}`, color: T.textFade, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, width: "100%" }}>
                              + Add Task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
function StudentDashboard({ currentUser, userDoc }) {
  const [tab, setTab] = useState("motivation");
  const [expandedSection, setExpandedSection] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [roadmap, setRoadmap] = useState(DEFAULT_ROADMAP);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(userDoc.progress || {});

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "config", "roadmap"));
      if (snap.exists()) setRoadmap(snap.data().data);
    };
    load();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "student"));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("time", "desc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.to === "all" || m.to === currentUser.uid));
    });
    return unsub;
  }, [currentUser.uid]);

  const saveProgress = async (p) => {
    setProgress(p);
    await updateDoc(doc(db, "users", currentUser.uid), { progress: p });
  };

  const toggle = (sid, i) => {
    const key = `${sid}-${i}`;
    saveProgress({ ...progress, [key]: !progress[key] });
  };

  const total = getTotalProgress(progress, roadmap);
  const phase = roadmap[activePhase];
  const C = phase.color;

  const getSP = s => {
    const d = s.tasks.filter((_, i) => progress[`${s.id}-${i}`]).length;
    return { done: d, total: s.tasks.length, pct: s.tasks.length ? Math.round(d / s.tasks.length * 100) : 0 };
  };
  const getPP = ph => {
    const keys = ph.sections.flatMap(s => s.tasks.map((_, i) => `${s.id}-${i}`));
    const d = keys.filter(k => progress[k]).length;
    return { done: d, total: keys.length, pct: keys.length ? Math.round(d / keys.length * 100) : 0 };
  };

  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const milestones = [5, 10, 25, 50, 75, 100];
  const nextMilestone = milestones.find(m => m > total.pct) || 100;

  const tabs = [
    { id: "motivation", label: "🌟 Home" },
    { id: "roadmap",    label: "📚 Roadmap" },
    { id: "leaderboard",label: "🏆 Leaderboard" },
    { id: "messages",   label: `💬 Messages${messages.length > 0 ? ` (${messages.length})` : ""}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: T.bgDeep, borderBottom: `1px solid ${T.border}`, padding: "14px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: T.textFade, letterSpacing: "0.12em" }}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Zero → Competitive Candidate</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProgressRing pct={total.pct} color={T.p1} size={48} stroke={4} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.p1 }}>{total.pct}%</div>
              <div style={{ fontSize: 9, color: T.textFade }}>{total.done}/{total.total} tasks</div>
            </div>
            <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 12, color: T.textDim, marginBottom: 4 }}>👤 {userDoc.username}</div>
              <button onClick={() => signOut(auth)} style={{ fontSize: 10, color: T.textFade, background: "none", border: "none", cursor: "pointer" }}>Logout</button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "8px 14px", background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? T.p1 : "transparent"}`, color: tab === t.id ? T.p1 : T.textDim, cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {/* ── MOTIVATION ── */}
        {tab === "motivation" && (
          <div style={{ padding: "24px", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 12 }}>★ DAILY MOTIVATION</div>
              <div style={{ fontSize: 16, color: T.text, fontStyle: "italic", marginBottom: 8 }}>"{todayQuote.text}"</div>
              <div style={{ fontSize: 11, color: T.textDim }}>— {todayQuote.author}</div>
              <div style={{ marginTop: 20, padding: "14px", background: T.bgDeep, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.info, letterSpacing: "0.1em", marginBottom: 6 }}>NEXT MILESTONE — {nextMilestone}%</div>
                <div style={{ fontSize: 12, color: T.textDim, marginBottom: 10 }}>
                  {total.pct === 0 ? "You started. Most people never do. That already puts you ahead." :
                   total.pct < 25 ? "Solid foundations. Keep going — it gets more exciting from here." :
                   total.pct < 50 ? "You're in the core ML phase. This is where it clicks." :
                   total.pct < 75 ? "Past the halfway mark. You're building real skills now." :
                   total.pct < 100 ? "Final stretch. You're almost there!" : "🎉 You've completed the roadmap!"}
                </div>
                <ProgressBar pct={(total.pct / nextMilestone) * 100} color={T.info} />
                <div style={{ fontSize: 9, color: T.textFade, marginTop: 4 }}>{total.pct}% — {nextMilestone}% ({nextMilestone - total.pct}% to go)</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Tasks Done", value: total.done, sub: `of ${total.total}`, color: T.p1 },
                { label: "Overall %", value: total.pct + "%", sub: "completed", color: T.good },
                { label: "Projects", value: roadmap.find(p => p.phase === 4)?.sections.find(s => s.id === "portfolio") ? progress[`portfolio-0`] ? 1 : 0 : 0, sub: "of 10", color: T.p3 },
                { label: "Remaining", value: total.total - total.done, sub: "tasks left", color: T.p4 },
              ].map(stat => (
                <div key={stat.label} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 10, color: T.textFade, marginBottom: 6 }}>{stat.label.toUpperCase()}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: T.textFade }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 14 }}>PHASE BREAKDOWN</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {roadmap.map((ph, i) => {
                  const pp = getPP(ph);
                  return (
                    <div key={i} style={{ padding: "12px", background: T.bgDeep, borderRadius: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: ph.color, fontWeight: 600 }}>Phase {ph.phase}</span>
                        <span style={{ fontSize: 11, color: ph.color }}>{pp.pct}%</span>
                      </div>
                      <ProgressBar pct={pp.pct} color={ph.color} />
                      <div style={{ fontSize: 9, color: T.textFade, marginTop: 4 }}>{pp.done}/{pp.total} tasks</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {messages.length > 0 && (
              <div style={{ background: T.bgCard, border: `1px solid ${T.p4}33`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ fontSize: 9, color: T.p4, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 8 }}>💬 MESSAGE FROM YOUR INSTRUCTOR</div>
                <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>{messages[0].text}</div>
                <div style={{ fontSize: 10, color: T.textFade, marginTop: 6 }}>{new Date(messages[0].time).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* ── ROADMAP ── */}
        {tab === "roadmap" && (
          <div style={{ display: "flex", height: "calc(100vh - 120px)" }}>
            <div style={{ width: 210, borderRight: `1px solid ${T.border}`, padding: "16px 12px", overflowY: "auto", background: T.bgDeep, flexShrink: 0 }}>
              {roadmap.map((ph, i) => {
                const p2 = getPP(ph); const a = i === activePhase;
                return (
                  <button key={i} onClick={() => { setActivePhase(i); setExpandedSection(null); }}
                    style={{ width: "100%", background: a ? ph.color + "15" : "transparent", border: `1px solid ${a ? ph.color + "55" : "transparent"}`, color: a ? ph.color : T.textDim, padding: "8px 12px", borderRadius: 7, cursor: "pointer", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, textAlign: "left" }}>
                    <span>{ph.title}</span>
                    <span style={{ fontSize: 10, background: ph.color + "18", color: ph.color, padding: "1px 5px", borderRadius: 3 }}>{p2.pct}%</span>
                  </button>
                );
              })}
              <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 8, paddingTop: 12 }}>
                {phase.sections.map(s => {
                  const sp = getSP(s); const a = expandedSection === s.id;
                  return (
                    <div key={s.id} onClick={() => setExpandedSection(a ? null : s.id)}
                      style={{ marginBottom: 6, cursor: "pointer", padding: "7px 9px", borderRadius: 6, background: a ? C + "0e" : "transparent" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: sp.done === sp.total ? C : T.textDim }}>{s.title}</span>
                        <span style={{ fontSize: 9, color: T.textFade }}>{sp.done}/{sp.total}</span>
                      </div>
                      <ProgressBar pct={sp.pct} color={C + "66"} height={2} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <ProgressRing pct={getPP(phase).pct} color={C} size={40} stroke={4} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C }}>{phase.title}</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>{phase.duration} · {getPP(phase).done}/{getPP(phase).total} tasks</div>
                </div>
              </div>
              {phase.sections.map(section => {
                const sp = getSP(section);
                const isDone = sp.done === sp.total;
                const isExp = expandedSection === section.id;
                return (
                  <div key={section.id} style={{ marginBottom: 10, background: T.bgCard, border: `1px solid ${isDone ? C + "55" : isExp ? C + "33" : T.border}`, borderRadius: 12, overflow: "hidden" }}>
                    <div onClick={() => setExpandedSection(isExp ? null : section.id)}
                      style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? C : T.text }}>{section.title}</span>
                          <span style={{ fontSize: 10, color: T.textFade }}>{section.weeks}</span>
                        </div>
                        <ProgressBar pct={sp.pct} color={isDone ? C : C + "77"} height={2} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? C : T.textDim, marginLeft: 12 }}>{sp.pct}%</span>
                    </div>
                    {isExp && (
                      <div style={{ borderTop: `1px solid ${T.border}`, paddingBottom: 6 }}>
                        {section.tasks.map((task, i) => {
                          const key = `${section.id}-${i}`; const ck = !!progress[key];
                          return (
                            <div key={i} onClick={() => toggle(section.id, i)}
                              style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "8px 16px", cursor: "pointer", background: ck ? C + "0a" : "transparent" }}>
                              <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${ck ? C : T.borderHi}`, background: ck ? C + "25" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {ck && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke={C} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                              </div>
                              <span style={{ fontSize: 12, color: ck ? T.textFade : T.textDim, textDecoration: ck ? "line-through" : "none", lineHeight: 1.6 }}>{task}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div style={{ padding: "24px" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>🏆 Student Leaderboard</div>
              </div>
              {[...students].sort((a,b) => getTotalProgress(b.progress||{},roadmap).pct - getTotalProgress(a.progress||{},roadmap).pct).map((u, i) => {
                const prog = getTotalProgress(u.progress || {}, roadmap);
                const isMe = u.id === currentUser.uid;
                const medals = ["🥇","🥈","🥉"];
                const color = phaseColors[Math.min(3, Math.floor(prog.pct / 25))];
                return (
                  <div key={u.id} style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14, background: isMe ? color + "08" : "transparent" }}>
                    <div style={{ width: 30, fontSize: i < 3 ? 20 : 13, textAlign: "center" }}>{i < 3 ? medals[i] : `#${i+1}`}</div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color }}>{u.username[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isMe ? 700 : 500, color: isMe ? color : T.text, marginBottom: 4 }}>{u.username}{isMe ? " (you)" : ""}</div>
                      <ProgressBar pct={prog.pct} color={color} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color }}>{prog.pct}%</div>
                      <div style={{ fontSize: 10, color: T.textFade }}>{prog.done}/{prog.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div style={{ padding: "24px" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>💬 Messages from your Instructor</div>
              </div>
              {messages.length === 0 && <div style={{ padding: "24px", color: T.textFade, fontSize: 12 }}>No messages yet.</div>}
              {messages.map(m => (
                <div key={m.id} style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: T.p4, background: T.p4 + "15", padding: "2px 8px", borderRadius: 4 }}>{m.to === "all" ? "📢 To everyone" : "📨 To you"}</span>
                    <span style={{ fontSize: 10, color: T.textFade }}>{new Date(m.time).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserDoc(snap.data());
        } else {
          // Admin user won't have a doc in users collection
          setUserDoc({ role: "admin", username: "Admin", email: user.email });
        }
      } else {
        setAuthUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#13111a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2dff0", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
          <div style={{ fontSize: 14, color: "#8b87a8" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!authUser) return <LoginPage />;
  if (userDoc?.role === "admin" || authUser.email === ADMIN_EMAIL) return <AdminDashboard currentUser={authUser} />;
  return <StudentDashboard currentUser={authUser} userDoc={userDoc} />;
}