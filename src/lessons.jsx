import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const T = {
  bg:"#13111a", bgCard:"#1c1927", bgDeep:"#161320",
  border:"#2a2540", borderHi:"#3d3660",
  text:"#e2dff0", textDim:"#8b87a8", textFade:"#4a4665",
  p1:"#7eb8f7", p2:"#6dd6a0", p3:"#f7c96e", p4:"#c792ea",
  gold:"#f7c96e", warn:"#f28b82", good:"#6dd6a0", info:"#7eb8f7",
};

// ── LESSON HELPERS
const Code = ({children}) => (
  <code style={{background:"#1e1040",color:"#a78bfa",padding:"2px 8px",borderRadius:"4px",fontFamily:"'Fira Code',monospace",fontSize:"0.87em",border:"1px solid #3d3060"}}>{children}</code>
);

const Block = ({children,label}) => (
  <div style={{margin:"16px 0",borderRadius:"10px",overflow:"hidden",border:"1px solid #1e2a3a",boxShadow:"0 4px 16px rgba(0,0,0,0.3)"}}>
    {label && (
      <div style={{background:"#0d1520",color:"#475569",fontSize:"11px",padding:"6px 14px",fontFamily:"monospace",borderBottom:"1px solid #1e2a3a",display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#f28b82"}}/>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#f7c96e"}}/>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#6dd6a0"}}/>
        <span style={{marginLeft:8,color:"#4a5568"}}>{label}</span>
      </div>
    )}
    <pre style={{background:"#060d18",margin:0,padding:"16px",color:"#e2e8f0",fontFamily:"'Fira Code',monospace",fontSize:"12px",overflowX:"auto",lineHeight:"1.8",whiteSpace:"pre-wrap"}}>{children}</pre>
  </div>
);

const Callout = ({icon,color,title,children,type}) => {
  const styles = {
    brain: {bg: color+"12", border: `1px solid ${color}33`, accent: color},
    warn:  {bg: "#f28b8210", border: "1px solid #f28b8233", accent: "#f28b82"},
    gold:  {bg: "#f7c96e10", border: "1px solid #f7c96e33", accent: "#f7c96e"},
    tip:   {bg: "#6dd6a010", border: "1px solid #6dd6a033", accent: "#6dd6a0"},
  };
  const s = styles[type] || {bg: color+"12", border: `1px solid ${color}33`, accent: color};
  return (
    <div style={{background:s.bg,border:s.border,borderRadius:"10px",padding:"14px 16px",margin:"14px 0",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:s.accent,borderRadius:"10px 0 0 10px"}}/>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,paddingLeft:8}}>
        <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
        <div>
          <div style={{color:s.accent,fontSize:"11px",fontWeight:"700",marginBottom:"5px",letterSpacing:"0.05em"}}>{title}</div>
          <div style={{color:"#94a3b8",fontSize:"13px",lineHeight:"1.75"}}>{children}</div>
        </div>
      </div>
    </div>
  );
};

const LP = ({children}) => <p style={{color:"#8b87a8",fontSize:"13.5px",lineHeight:"1.85",margin:"10px 0"}}>{children}</p>;

const LH = ({children}) => (
  <h3 style={{color:"#e2dff0",fontSize:"15px",fontWeight:"700",margin:"24px 0 8px 0",display:"flex",alignItems:"center",gap:8}}>
    <span style={{width:3,height:16,background:"linear-gradient(to bottom,#8b7cf6,#6dd6a0)",borderRadius:2,display:"inline-block",flexShrink:0}}/>
    {children}
  </h3>
);

const Tip = ({children}) => (
  <div style={{background:"#0d1f10",border:"1px solid #1a3a1a",borderRadius:8,padding:"10px 14px",margin:"10px 0",display:"flex",gap:8,alignItems:"flex-start"}}>
    <span style={{color:"#6dd6a0",fontSize:14,flexShrink:0}}>★</span>
    <div style={{color:"#6dd6a0",fontSize:"12.5px",lineHeight:1.7}}>{children}</div>
  </div>
);

const Warn = ({children}) => (
  <div style={{background:"#1f0d0d",border:"1px solid #3a1a1a",borderRadius:8,padding:"10px 14px",margin:"10px 0",display:"flex",gap:8,alignItems:"flex-start"}}>
    <span style={{color:"#f28b82",fontSize:14,flexShrink:0}}>⚠</span>
    <div style={{color:"#f28b82",fontSize:"12.5px",lineHeight:1.7}}>{children}</div>
  </div>
);

const Compare = ({items}) => (
  <div style={{display:"grid",gridTemplateColumns:`repeat(${items.length},1fr)`,gap:10,margin:"12px 0"}}>
    {items.map((item,i)=>(
      <div key={i} style={{background:item.color+"10",border:`1px solid ${item.color}33`,borderRadius:8,padding:"12px 14px"}}>
        <div style={{color:item.color,fontWeight:700,fontSize:12,marginBottom:6}}>{item.label}</div>
        <div style={{color:"#8b87a8",fontSize:12,lineHeight:1.7}}>{item.text}</div>
      </div>
    ))}
  </div>
);

// ── LESSON WRAPPER — applies hook + progress strip to every lesson
const LESSON_META = {
  // Python Core
  "pycore-basics":        { hook:"You already know how to think logically. Python just gives you a way to make a computer do it for you. After this lesson, you'll write real code that runs — no theory, just practice.", steps:["Variables & Types","Loops","Functions","✓ Quiz","Error Handling","✓ Challenge"] },
  "pycore-advanced":      { hook:"The difference between a beginner and someone who writes clean, professional Python is these patterns. List comprehensions, file I/O, classes — this is where your code starts looking like real DS code.", steps:["Comprehensions","File I/O","Classes","✓ Quiz","Clean Patterns","✓ Challenge"] },
  "pycore-ds-patterns":   { hook:"90% of data science code uses the same 10 patterns over and over. This lesson gives you those patterns. Once you have them, reading other people's DS code becomes effortless.", steps:["String & Date","Functional Tools","Error Handling","✓ Quiz","DS Patterns","✓ Challenge"] },
  // Python for DS
  "numpy":                { hook:"You're about to analyze a dataset with 1 million rows. With a Python loop, that takes minutes. With NumPy, milliseconds — same syntax, 1000x faster. This is vectorization, and it's how every serious data scientist thinks.", steps:["Arrays & Shape","Indexing","Vectorization","✓ Quiz","Boolean Masking","Real World","✓ Challenge"] },
  "pandas-basics":        { hook:"Pandas is the tool you will open every single day as a data scientist. It's your programmable Excel — but it can handle millions of rows, automate cleaning, and feed directly into ML models.", steps:["Loading Data","First Look","Selecting","Filtering","✓ Quiz","groupby","✓ Challenge"] },
  "pandas-advanced":      { hook:"Real data is never clean. Missing values, duplicates, wrong types, tables that need joining — this lesson teaches you to fix all of it. Every DS job interview tests exactly these skills.", steps:["Missing Values","Duplicates","Type Fixing","Merging","✓ Quiz","Reshaping","✓ Challenge"] },
  "eda":                  { hook:"EDA is the skill that separates good data scientists from great ones. Before any model, you need to understand your data — its shape, its problems, its story. This lesson shows you how.", steps:["Distribution Analysis","Outliers","Correlations","✓ Quiz","Categorical EDA","Full Pipeline","✓ Challenge"] },
  "visualization":        { hook:"A model that produces a result nobody understands is useless. Visualization is how you communicate findings to people who don't code. This is the skill that gets you promoted.", steps:["Matplotlib Basics","Seaborn","Chart Types","✓ Quiz","Plotly Interactive","Storytelling","✓ Challenge"] },
  // SQL
  "sql-basics":           { hook:"SQL is the first filter in almost every data science interview. Companies run their entire business on databases — knowing SQL means you can query any of it in seconds.", steps:["SELECT & WHERE","Aggregations","GROUP BY","✓ Quiz","Subqueries","Real Business Qs","✓ Challenge"] },
  "sql-joins":            { hook:"Real data lives in multiple tables. JOINs let you connect them. This is the concept that trips up most candidates in interviews — master it here and you'll stand out.", steps:["INNER JOIN","LEFT JOIN","Multiple Tables","✓ Quiz","Subqueries","Interview Patterns","✓ Challenge"] },
  "sql-window":           { hook:"Window functions are what make SQL candidates look dangerous. RANK, LAG, LEAD, running totals — these appear in almost every senior DS interview and most candidates can't do them.", steps:["ROW_NUMBER & RANK","LAG & LEAD","Running Totals","✓ Quiz","PARTITION BY","Interview Patterns","✓ Challenge"] },
  // Statistics
  "probability":          { hook:"Every ML model is just a probability estimate in disguise. Logistic regression outputs probabilities. Naive Bayes is pure probability. Understanding this makes you understand models at a deeper level than most.", steps:["Basic Probability","Conditional","Bayes Theorem","✓ Quiz","Distributions","Real DS Use","✓ Challenge"] },
  "distributions":        { hook:"When you see data, you need to know what distribution it follows — because that determines which model to use, which test to run, and what assumptions you're making. This lesson builds that intuition.", steps:["Normal Distribution","Binomial","Poisson","✓ Quiz","Sampling","ML Connection","✓ Challenge"] },
  "correlation":          { hook:"'Correlation implies causation' is the mistake that gets DS candidates eliminated in interviews. Understanding when two things move together vs when one causes the other is a core analytical skill.", steps:["Correlation Basics","Pearson & Spearman","Heatmaps","✓ Quiz","Causation Traps","Interview Prep","✓ Challenge"] },
  "inference":            { hook:"Every A/B test, every business experiment, every 'does this feature work?' question — they all need statistical inference. This is how companies make data-driven decisions instead of guessing.", steps:["Hypothesis Testing","p-values","Confidence Intervals","✓ Quiz","A/B Test Design","Common Mistakes","✓ Challenge"] },
  // Linear Algebra
  "linalg-vectors":       { hook:"Linear algebra is the language ML models speak internally. When scikit-learn trains a model, it's doing matrix operations. You don't need to implement it — but you need to understand what's happening.", steps:["Vectors","Matrix Operations","Dot Product","✓ Quiz","Transformations","ML Connection","✓ Challenge"] },
  "linalg-eigen":         { hook:"PCA — the most common dimensionality reduction technique — is built on eigenvalues. SHAP values, neural network layers, covariance matrices — all linear algebra. This lesson makes it visual and intuitive.", steps:["Eigenvalues Intuition","Eigenvectors","Covariance Matrix","✓ Quiz","PCA Step-by-Step","Real Application","✓ Challenge"] },
  // Tools
  "cli-git-lesson":       { hook:"Every DS job posting says 'Git required'. Most DS candidates are terrible at it. The command line and Git are the difference between someone who can only run code locally and someone who can ship to production.", steps:["Terminal Basics","File Navigation","Git Init & Commit","✓ Quiz","Branching","Collaboration","✓ Challenge"] },
  "jupyter-lesson":       { hook:"Your dev environment is where you spend every working hour. A well-configured workspace makes you 2x faster, catches bugs earlier, and makes your work reproducible. This is worth one hour of your time.", steps:["Jupyter vs VSCode","Keyboard Shortcuts","Reproducibility","✓ Quiz","Magic Commands","Best Practices","✓ Challenge"] },
  // ML
  "ml-workflow":          { hook:"This is the lesson where data science becomes real. The full pipeline — from raw data to a deployed model — is what every DS job actually involves. Everything before this was preparation for this moment.", steps:["The Pipeline","Data Splitting","Training","✓ Quiz","Evaluation","Full Workflow","✓ Challenge"] },
  "ml-regression":        { hook:"Linear and logistic regression are asked in almost every DS interview. Not because you'll use them every day — but because they test whether you understand how models actually learn from data.", steps:["Linear Regression","Coefficients","Logistic Regression","✓ Quiz","Evaluation Metrics","Interview Prep","✓ Challenge"] },
  "ml-trees":             { hook:"Random Forests win more Kaggle competitions than any other algorithm on tabular data. Decision Trees explain exactly why a prediction was made. Both are essential — this lesson covers both.", steps:["Decision Trees","Splitting Criteria","Overfitting","✓ Quiz","Random Forests","Feature Importance","✓ Challenge"] },
  "ml-evaluation":        { hook:"Accuracy is a trap. On imbalanced datasets it's useless. This lesson teaches you which metric to use for which problem — the question that eliminates most candidates in interviews.", steps:["Accuracy & Its Limits","Precision & Recall","F1 & AUC-ROC","✓ Quiz","Confusion Matrix","Choosing Metrics","✓ Challenge"] },
  "ml-overfitting":       { hook:"Every beginner trains a model that scores 99% on training data and fails on real data. Overfitting is the most common ML mistake. This lesson teaches you to diagnose it, fix it, and prevent it.", steps:["Bias vs Variance","Diagnosing Overfit","Regularization","✓ Quiz","Cross-Validation","Practical Fixes","✓ Challenge"] },
  "ml-sklearn":           { hook:"scikit-learn is the tool you'll use in every ML project. This lesson teaches you the full sklearn workflow — the exact pattern used in every professional DS codebase.", steps:["Sklearn API","Preprocessing","Pipelines","✓ Quiz","Grid Search","Full Example","✓ Challenge"] },
  "feature-engineering":  { hook:"XGBoost with good features beats a neural network with bad features. Feature engineering is the skill that separates Kaggle beginners from top finishers — and junior DS from senior DS.", steps:["Missing Values","Encoding","Date Features","✓ Quiz","Interactions","Target Encoding","✓ Challenge"] },
  "ml-pipelines":         { hook:"A model that only runs in your notebook is not a model — it's a science project. ML Pipelines package everything together so it runs the same way every time, on any data, without data leakage.", steps:["Why Pipelines","ColumnTransformer","Full Pipeline","✓ Quiz","Cross-Val Pipeline","Production Ready","✓ Challenge"] },
  // Advanced ML
  "adv-xgboost":          { hook:"XGBoost is the algorithm that wins tabular ML competitions. It's in production at every major tech company. If you only learn one advanced algorithm, make it this one.", steps:["Gradient Boosting","XGBoost Params","Training","✓ Quiz","Tuning","vs Random Forest","✓ Challenge"] },
  "adv-lightgbm":         { hook:"LightGBM is XGBoost's faster cousin — it handles large datasets better and trains 10x faster. CatBoost handles categorical features automatically. Both appear in production systems at scale.", steps:["LightGBM Basics","Key Differences","Training","✓ Quiz","CatBoost","Choosing Between","✓ Challenge"] },
  "adv-shap":             { hook:"'Why did the model predict this?' is the question every stakeholder asks. SHAP gives you the answer — for any model, any prediction. It's also what regulators require for AI decisions in finance and healthcare.", steps:["Model Explainability","SHAP Values","Waterfall Plots","✓ Quiz","Summary Plots","Business Use","✓ Challenge"] },
  "adv-feature-eng":      { hook:"Advanced feature engineering is what separates top-10% Kaggle solutions from the rest. Interaction features, polynomial features, target encoding done right — this is the craft part of data science.", steps:["Interaction Features","Polynomial","Target Encoding","✓ Quiz","Time-Based","Kaggle Patterns","✓ Challenge"] },
  "adv-pipelines":        { hook:"Production ML pipelines don't break when new data arrives. They handle missing values, new categories, scaling — all automatically. This lesson shows you how to build systems, not scripts.", steps:["Pipeline Design","Custom Transformers","Versioning","✓ Quiz","Monitoring","Deployment","✓ Challenge"] },
  "adv-hypertuning":      { hook:"Manual hyperparameter tuning is a waste of time. Optuna finds better parameters in fewer trials than any human. This lesson teaches you to tune models systematically — the way top Kagglers do it.", steps:["Search Strategies","GridSearchCV","RandomSearch","✓ Quiz","Optuna","Best Practices","✓ Challenge"] },
  // Deep Learning
  "dl-nn-lesson":         { hook:"Neural networks are how image recognition, voice assistants, and language models work. You don't need a PhD to use them — you need to understand the intuition. That's what this lesson gives you.", steps:["Neuron Intuition","Layers & Activation","Forward Pass","✓ Quiz","Backpropagation","Training a Net","✓ Challenge"] },
  "dl-nlp-lesson":        { hook:"NLP is the hottest subfield in AI. Every chatbot, every sentiment analysis, every document classifier — they all use the techniques in this lesson. Transformers changed everything and this is where you learn why.", steps:["Text Preprocessing","Embeddings","Attention Mechanism","✓ Quiz","BERT & Variants","Fine-Tuning","✓ Challenge"] },
  "llm-lesson":           { hook:"Companies are integrating LLMs into every data product. Knowing how to build with LLM APIs — not just use ChatGPT — is one of the most valuable skills in the job market right now.", steps:["How LLMs Work","Prompt Engineering","LLM APIs","✓ Quiz","RAG Pattern","Build a RAG App","✓ Challenge"] },
  // Deploy
  "streamlit-lesson":     { hook:"'Here's my live demo' is the most powerful thing you can say in a DS interview. Streamlit turns your model into a working app in under an hour. This lesson gets you there.", steps:["First App","UI Elements","Input Widgets","✓ Quiz","Data Display","Deploy to Cloud","✓ Challenge"] },
  "mlops-lesson":         { hook:"Most candidates can train a model. Almost none can deploy one. MLOps is the skill that makes you a complete data scientist — someone who ships to production, not just to a notebook.", steps:["Git for DS","FastAPI","Docker","✓ Quiz","Experiment Tracking","Live Deployment","✓ Challenge"] },
};

function LessonWrapper({ id, color, children }) {
  const meta = LESSON_META[id];
  if (!meta) return <div>{children}</div>;

  // We use a ref to track scroll for the progress strip (handled by LearnTab)
  // Here we just render the hook card + part dividers injected via children
  return (
    <div>
      {/* ── HOOK CARD ── */}
      <div style={{background:`linear-gradient(135deg,${color}08,${color}04)`,border:`1px solid ${color}25`,borderRadius:12,padding:"20px 22px",marginBottom:24}}>
        <div style={{fontSize:11,color,fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// why this lesson matters</div>
        <p style={{color:"#c8d8e8",fontSize:13.5,lineHeight:1.85,margin:0}}>{meta.hook}</p>
      </div>
      {/* ── LESSON CONTENT ── */}
      {children}
    </div>
  );
}

// ── QUIZ
function Quiz({questions}) {
  const [answers,setAnswers] = useState({});
  const [revealed,setRevealed] = useState({});
  const pick = (qi,opt) => {
    if(answers[qi]!==undefined) return;
    setAnswers(a=>({...a,[qi]:opt}));
    setRevealed(r=>({...r,[qi]:true}));
  };
  const allDone = questions.every((_,i)=>answers[i]!==undefined);
  const score = questions.filter((q,i)=>answers[i]===q.answer).length;
  return (
    <div style={{marginTop:"24px",background:"#0a0f1a",border:"1px solid #1e2a3a",borderRadius:"12px",overflow:"hidden"}}>
      <div style={{background:"#0d1520",padding:"12px 18px",borderBottom:"1px solid #1e2a3a",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 6px #8b7cf6"}}/>
        <span style={{color:"#4a5568",fontSize:"11px",fontWeight:"700",letterSpacing:"0.12em"}}>KNOWLEDGE CHECK</span>
        <span style={{marginLeft:"auto",color:"#2a3548",fontSize:"11px"}}>{Object.keys(answers).length}/{questions.length} answered</span>
      </div>
      <div style={{padding:"16px 18px"}}>
        {questions.map((q,qi)=>{
          const chosen=answers[qi];
          const isRev=revealed[qi];
          return (
            <div key={qi} style={{marginBottom:"20px",paddingBottom:"20px",borderBottom:qi<questions.length-1?"1px solid #0d1520":"none"}}>
              <div style={{color:"#c8c3e0",fontSize:"13px",marginBottom:"10px",fontWeight:"500",lineHeight:1.6}}>
                <span style={{color:"#8b7cf6",marginRight:"8px",fontSize:"11px",fontFamily:"monospace",fontWeight:700}}>Q{qi+1}</span>{q.q}
              </div>
              <div style={{display:"grid",gap:"6px"}}>
                {q.options.map(opt=>{
                  const isChosen=chosen===opt,isCorrect=opt===q.answer;
                  let bg="#0d1520",border="#1e2a3a",color="#64748b",cursor="pointer";
                  if(isRev){
                    if(isCorrect){bg="#041a0e";border="#16a34a55";color="#4ade80";}
                    else if(isChosen){bg="#1a0404";border="#dc262655";color="#f87171";}
                    cursor="default";
                  } else {
                    bg="#0d1520"; border="#1e2a3a"; color="#64748b";
                  }
                  return (
                    <div key={opt} onClick={()=>pick(qi,opt)}
                      style={{padding:"9px 13px",borderRadius:"7px",border:`1px solid ${border}`,background:bg,color,fontSize:"12.5px",cursor,display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
                      <span style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9}}>
                        {isRev&&isCorrect?"✓":isRev&&isChosen?"✗":""}
                      </span>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {chosen!==undefined&&(
                <div style={{marginTop:"8px",padding:"10px 13px",background:"#060d18",borderRadius:"7px",borderLeft:"2px solid #7dd3fc",color:"#7dd3fc",fontSize:"12px",lineHeight:"1.7"}}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
        {allDone&&(
          <div style={{textAlign:"center",padding:"12px",background:score===questions.length?"#041a0e":"#1a0f04",borderRadius:8,border:`1px solid ${score===questions.length?"#16a34a55":"#f59e0b55"}`}}>
            <span style={{color:score===questions.length?"#4ade80":"#f59e0b",fontWeight:"700",fontSize:"16px"}}>
              {score===questions.length?"🎉 Perfect score!":"⭐ "+score+"/"+questions.length+" — check the explanations above"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CODE EXERCISE
function CodeExercise({title, description, starterCode, hint, validate}) {
  const [code, setCode] = useState(starterCode||"");
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState(null); // null | "running" | "pass" | "fail" | "error"
  const [showHint, setShowHint] = useState(false);
  const pyodideRef = React.useRef(null);
  const loadingRef = React.useRef(false);

  const loadPyodide = async () => {
    if(pyodideRef.current) return pyodideRef.current;
    if(loadingRef.current) return null;
    loadingRef.current = true;
    if(!window._pyodideInstance){
      const py = await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"});
      await py.loadPackage(["numpy", "pandas", "scikit-learn"]);
      window._pyodideInstance = py;
    }
    pyodideRef.current = window._pyodideInstance;
    return pyodideRef.current;
  };

  const runCode = async () => {
    setStatus("running");
    setOutput(null);
    try {
      const py = await loadPyodide();
      if(!py){ setStatus("error"); setOutput("Pyodide still loading, try again in a second."); return; }
      let captured = "";
      py.setStdout({batched: s => { captured += s + "\n"; }});
      py.setStderr({batched: s => { captured += "ERROR: " + s + "\n"; }});
      await py.runPythonAsync(code);
      setOutput(captured.trim() || "(no output)");
      if(validate){
        const passed = validate(captured.trim(), py);
        setStatus(passed ? "pass" : "fail");
      } else {
        setStatus("pass");
      }
    } catch(e) {
      setOutput(e.message);
      setStatus("error");
    }
  };

  const statusColors = {pass:"#6dd6a0", fail:"#f7c96e", error:"#f28b82", running:"#7eb8f7"};
  const statusMsg = {pass:"✓ Correct! Well done.", fail:"Not quite — check your output and try again.", error:"❌ Error in your code — check the output below.", running:"⏳ Running..."};

  return (
    <div style={{margin:"24px 0",border:"1px solid #2a3548",borderRadius:12,overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:"#0d1520",padding:"12px 18px",borderBottom:"1px solid #1e2a3a",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,background:"#6dd6a0",borderRadius:"50%",boxShadow:"0 0 6px #6dd6a0"}}/>
        <span style={{color:"#4a5568",fontSize:"11px",fontWeight:"700",letterSpacing:"0.12em"}}>CODING EXERCISE</span>
        {hint && <button onClick={()=>setShowHint(h=>!h)} style={{marginLeft:"auto",background:"none",border:"1px solid #2a3548",color:"#8b87a8",fontSize:10,padding:"2px 10px",borderRadius:4,cursor:"pointer"}}>{showHint?"hide hint":"💡 hint"}</button>}
      </div>
      <div style={{padding:"16px 18px",background:"#080e1a"}}>
        <div style={{color:"#c8c3e0",fontSize:13,marginBottom:10,lineHeight:1.7,fontWeight:500}}>{title}</div>
        <div style={{color:"#8b87a8",fontSize:12,marginBottom:14,lineHeight:1.7}}>{description}</div>
        {showHint && hint && <div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"#6dd6a0",fontSize:12,lineHeight:1.7}}>💡 {hint}</div>}
        {/* Editor */}
        <textarea
          value={code}
          onChange={e=>setCode(e.target.value)}
          onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart;const end=e.target.selectionEnd;setCode(c=>c.substring(0,s)+"    "+c.substring(end));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+4;},0);}}}
          style={{width:"100%",boxSizing:"border-box",minHeight:120,background:"#060d18",border:"1px solid #1e2a3a",borderRadius:8,padding:"12px 14px",color:"#e2e8f0",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:1.8,resize:"vertical",outline:"none",whiteSpace:"pre"}}
          spellCheck={false}
        />
        <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>
          <button onClick={runCode} disabled={status==="running"} style={{background:"#6dd6a0",color:"#000",border:"none",padding:"8px 20px",borderRadius:7,cursor:status==="running"?"not-allowed":"pointer",fontWeight:700,fontSize:12,opacity:status==="running"?0.6:1}}>
            {status==="running"?"Running...":"▶ Run Code"}
          </button>
          <button onClick={()=>{setCode(starterCode||"");setOutput(null);setStatus(null);}} style={{background:"none",border:"1px solid #2a3548",color:"#8b87a8",padding:"8px 14px",borderRadius:7,cursor:"pointer",fontSize:12}}>Reset</button>
          {status && status!=="running" && <span style={{fontSize:12,color:statusColors[status],fontWeight:600}}>{statusMsg[status]}</span>}
        </div>
        {/* Output */}
        {output!==null && (
          <div style={{marginTop:12,background:"#040a12",border:`1px solid ${status==="pass"?"#6dd6a033":status==="error"?"#f28b8233":"#1e2a3a"}`,borderRadius:8,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"#4a5568",marginBottom:6,letterSpacing:"0.1em",fontFamily:"monospace"}}>OUTPUT</div>
            <pre style={{margin:0,color:status==="error"?"#f28b82":"#a8d8a8",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ══ LESSONS ══════════════════════════════════════════════════════════════════
const LESSONS = [
  {id:"numpy",phase:"Python for DS",emoji:"🔢",color:"#38bdf8",title:"NumPy Arrays",subtitle:"Why arrays beat loops — the foundation of all data science",
   body:()=>(
    <LessonWrapper id="numpy" color="#38bdf8">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Arrays & Shape","Indexing","Vectorization","✓ Quiz","Boolean Masking","Real World","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#38bdf8":"transparent",border:`2px solid ${i===0?"#38bdf8":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#38bdf8":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#38bdf8" title="The core idea">NumPy replaces Python loops with math that runs on your entire dataset at once. 1 million rows? Same speed as 10 rows. This is called vectorization — and it is how every serious data scientist thinks.</Callout>

      {/* ══ PART 1: ARRAYS & SHAPE ══ */}
      <div style={{background:"#38bdf808",border:"1px solid #38bdf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#38bdf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 5 — ARRAYS & SHAPE</div>
        <LH>Creating your first array</LH>
        <LP>An array is like a Python list, but it can do math on all its elements at once — no loop needed.</LP>
        <Block label="Run this — change the numbers and see what happens">{`import numpy as np

a = np.array([1, 2, 3, 4, 5])
print(a)
print(type(a))

print(np.zeros(5))
print(np.ones((2,3)))
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))

np.random.seed(42)
print(np.random.randn(3, 3))`}</Block>
        <Tip>Try changing <code style={{background:"#1e3a4a",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#38bdf8"}}>np.zeros(5)</code> to <code style={{background:"#1e3a4a",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#38bdf8"}}>np.zeros((3,4))</code> — the double parenthesis is a tuple meaning rows x columns.</Tip>

        <LH>Shape — the most important concept in ML</LH>
        <LP>Every array has a shape. When your ML model throws an error, 90% of the time it is a shape mismatch. Learn to read shapes instinctively.</LP>
        <Block label="Print shape before and after each operation">{`import numpy as np

a = np.array([[1,2,3],
              [4,5,6]])

print(a.shape)      # (2, 3) — 2 rows, 3 columns
print(a.ndim)       # 2 — two-dimensional
print(a.size)       # 6 — total elements

print(a.reshape(3, 2))   # 3 rows, 2 columns
print(a.reshape(6))      # flatten to 1D
print(a.T.shape)         # (3, 2) — transposed`}</Block>
        <Callout icon="⚠️" color="#f59e0b" title="The #1 ML error" type="warn">If you see <code style={{background:"#2a1500",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#f7c96e"}}>ValueError: shapes not aligned</code> — immediately print <code style={{background:"#2a1500",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#f7c96e"}}>.shape</code> on every array involved. It is always a shape problem.</Callout>
      </div>

      {/* ══ PART 2: INDEXING ══ */}
      <div style={{background:"#38bdf808",border:"1px solid #38bdf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#38bdf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 5 — INDEXING & SLICING</div>
        <LH>Grabbing exactly what you need</LH>
        <Block label="Predict the output of each line before running">{`import numpy as np

a = np.array([10, 20, 30, 40, 50])
print(a[0])      # first element
print(a[-1])     # last element
print(a[1:4])    # positions 1,2,3
print(a[::2])    # every 2nd element
print(a[::-1])   # reversed`}</Block>
        <Block label="2D — rows and columns">{`import numpy as np

m = np.array([[1,2,3],
              [4,5,6],
              [7,8,9]])

print(m[0])         # entire first row
print(m[1,2])       # row 1, column 2
print(m[:,0])       # ALL rows, first column
print(m[0:2, 1:])   # rows 0-1, columns 1+`}</Block>
        <Tip>The colon <code style={{background:"#1e3a4a",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#38bdf8"}}>:</code> means "all of". So <code style={{background:"#1e3a4a",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#38bdf8"}}>m[:,0]</code> means "all rows, column 0".</Tip>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"np.arange(2, 10, 3) produces:",options:["[2,5,8]","[2,3,4,5,6,7,8,9]","[2,5,8,11]","[3,6,9]"],answer:"[2,5,8]",explanation:"arange(start, stop, step) — starts at 2, adds 3, stops before 10. So: 2, 5, 8."},
          {q:"a = np.array([[1,2],[3,4],[5,6]]). What is a.shape?",options:["(2,3)","(3,2)","(6,)","(2,2,2)"],answer:"(3,2)",explanation:"3 rows, 2 columns. Shape is always (rows, columns)."},
          {q:"m = np.array([[1,2,3],[4,5,6]]). What does m[:,1] return?",options:["[1,2,3]","[2,5]","[4,5,6]","[1,4]"],answer:"[2,5]",explanation:"[:,1] means all rows, column index 1. Column 1 has values 2 and 5."},
        ]}/>
      </div>

      {/* ══ PART 3: VECTORIZATION ══ */}
      <div style={{background:"#38bdf808",border:"1px solid #38bdf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#38bdf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 5 — VECTORIZED OPERATIONS</div>
        <LH>Math on every element — no loop needed</LH>
        <Block label="Try changing the numbers — notice it always applies to all elements">{`import numpy as np

a = np.array([1, 2, 3, 4, 5])

print(a + 10)      # [11, 12, 13, 14, 15]
print(a * 2)       # [ 2,  4,  6,  8, 10]
print(a ** 2)      # [ 1,  4,  9, 16, 25]
print(np.sqrt(a))

b = np.array([10, 20, 30, 40, 50])
print(a + b)
print(a * b)`}</Block>
        <LH>Statistics — your daily toolkit</LH>
        <Block label="These functions replace manual loops in every EDA">{`import numpy as np

data = np.array([15, 22, 18, 30, 12, 27, 19])

print(np.mean(data))    # average
print(np.median(data))  # middle value
print(np.std(data))     # spread
print(np.min(data))     # minimum
print(np.max(data))     # maximum
print(np.argmax(data))  # INDEX of max — not the value itself`}</Block>
        <Warn>np.argmax() returns the <strong>index</strong> of the maximum, not the value. This trips up almost every beginner. Use np.max() if you want the actual value.</Warn>

        <LH>Boolean Masking — filtering without loops</LH>
        <Block label="Try changing 50000 to different values">{`import numpy as np

salaries = np.array([35000, 72000, 48000, 95000, 61000])

mask = salaries > 50000
print(mask)                     # [False True False True True]
print(salaries[mask])           # [72000 95000 61000]
print(salaries[salaries > 50000])  # same, one line

# Multiple conditions
print(salaries[(salaries > 40000) & (salaries < 80000)])`}</Block>
        <Tip>This pattern — create a condition, apply it as a filter — is identical in Pandas. Master it here and Pandas filtering will feel natural.</Tip>
      </div>

      {/* ══ PART 4: REAL WORLD ══ */}
      <div style={{background:"#38bdf808",border:"1px solid #38bdf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#38bdf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 4 OF 5 — REAL WORLD APPLICATION</div>
        <LH>NumPy in a real DS preprocessing pipeline</LH>
        <Block label="A complete preprocessing pipeline">{`import numpy as np

# Simulate monthly charges from a telecom dataset
charges = np.array([29.85, 56.95, 53.85, 42.30, 70.70, 99.65, 89.10, 29.75])

# Step 1: basic stats
print("Mean:   $" + str(round(np.mean(charges), 2)))
print("Std:    $" + str(round(np.std(charges), 2)))
print("Range:  $" + str(np.min(charges)) + " - $" + str(np.max(charges)))

# Step 2: find high-value customers (above 75th percentile)
high_value = charges[charges > np.percentile(charges, 75)]
print("High-value customers: " + str(len(high_value)) + " of " + str(len(charges)))

# Step 3: min-max normalization (required before most ML models)
normalized = (charges - charges.min()) / (charges.max() - charges.min())
print("Normalized: " + str(normalized.round(2)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Gold rule" type="gold">In real jobs you rarely write raw NumPy — Pandas wraps it. But when a model throws a shape error or your preprocessing is slow, NumPy thinking is what saves you. Every DS who does not understand it hits a wall.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"salaries = np.array([30,50,70,90]). What does salaries[salaries > 50] return?",options:["[True,False,True,True]","[70,90]","[50,70,90]","Error"],answer:"[70,90]",explanation:"salaries > 50 creates [False,False,True,True]. The mask keeps only True positions: 70 and 90."},
          {q:"You need to scale an array to 0-1 range. Which formula?",options:["a / np.max(a)","(a - a.mean()) / a.std()","(a - a.min()) / (a.max() - a.min())","a / np.sum(a)"],answer:"(a - a.min()) / (a.max() - a.min())",explanation:"This is min-max normalization. Subtract min so smallest becomes 0. Divide by range so largest becomes 1."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Filter high salaries and compute their average"
          description="Use boolean masking to get salaries above 50000, then print their average rounded to 2 decimal places."
          starterCode={`import numpy as np

salaries = np.array([35000, 72000, 48000, 95000, 61000, 42000, 88000])

# Step 1: filter salaries above 50000
high = ___

# Step 2: print the average, rounded to 2 decimal places
print(___)`}
          hint="Boolean masking: salaries[salaries > 50000]. Then: np.mean(high). Wrap in round(..., 2)."
          validate={(output) => output.trim() === "79000.0"}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"pandas-basics",phase:"Python for DS",emoji:"🐼",color:"#a78bfa",title:"Pandas: Loading & Exploring Data",subtitle:"The tool you will use every single day as a data scientist",
   body:()=>(
    <LessonWrapper id="pandas-basics" color="#a78bfa">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Loading Data","First Look","✓ Quiz","Selecting & Filtering","groupby","Real World","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#a78bfa":"transparent",border:`2px solid ${i===0?"#a78bfa":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#a78bfa":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#a78bfa" title="The mental model before we start">A DataFrame is a table. Rows are observations — customers, transactions, patients. Columns are features — age, price, date. One DataFrame can handle millions of rows. Everything you do in data science starts here.</Callout>

      {/* ══ PART 1: LOADING ══ */}
      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 5 — LOADING DATA</div>
        <LH>Reading your first DataFrame</LH>
        <LP>99% of the time you will load data from a CSV. Pandas reads it in one line and gives you a DataFrame ready to explore.</LP>
        <Block label="Try changing head(5) to head(10) — notice what changes">{`import pandas as pd

# Simulate loading a CSV (in real code: pd.read_csv("file.csv"))
import io
csv_data = """customer_id,tenure,monthly_charges,contract,churn
1,1,29.85,Month-to-month,Yes
2,34,56.95,One year,No
3,2,53.85,Month-to-month,Yes
4,45,42.30,One year,No
5,2,70.70,Month-to-month,Yes"""

df = pd.read_csv(io.StringIO(csv_data))

print(df.head(5))           # first 5 rows
print("Shape:", df.shape)   # (rows, columns)
print("Columns:", df.columns.tolist())`}</Block>
        <Tip>Always print <code style={{background:"#1e1040",padding:"1px 6px",borderRadius:4,fontSize:11,color:"#a78bfa"}}>df.shape</code> first. It tells you the scale — 100 rows needs different thinking than 10 million.</Tip>
        <LH>Loading options you will actually use</LH>
        <Block label="Real-world loading patterns">{`import pandas as pd

# CSV with semicolon separator (common in European datasets)
# df = pd.read_csv('data.csv', sep=';')

# Auto-parse date columns
# df = pd.read_csv('sales.csv', parse_dates=['order_date'])

# Skip rows that cause errors
# df = pd.read_csv('messy.csv', on_bad_lines='skip')

# Excel
# df = pd.read_excel('report.xlsx', sheet_name='Sheet1')

# After loading — always check types immediately
import io, pandas as pd
csv = "name,age,score\nAli,25,88.5\nSara,32,91.0\nOmar,28,79.3"
df = pd.read_csv(io.StringIO(csv))
print(df.dtypes)   # int64, float64, object — know what you have`}</Block>
      </div>

      {/* ══ PART 2: FIRST LOOK ══ */}
      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 5 — FIRST LOOK</div>
        <LH>The first-look checklist — run this on every new dataset</LH>
        <LP>Before writing a single line of analysis, you need to understand your data. This is the exact sequence professionals use every time they open a new dataset.</LP>
        <Block label="Run each line — read the output carefully">{`import pandas as pd

data = {
    'customer_id': [1,2,3,4,5],
    'monthly_charges': [29.85, 56.95, 53.85, 42.30, 70.70],
    'tenure': [1, 34, 2, 45, 2],
    'contract': ['Month-to-month','One year','Month-to-month','One year','Month-to-month'],
    'churn': ['No','No','Yes','No','Yes']
}
df = pd.DataFrame(data)

print("--- SHAPE ---")
print(df.shape)            # (5, 5)

print("--- FIRST ROWS ---")
print(df.head(3))

print("--- DATA TYPES ---")
print(df.dtypes)

print("--- MISSING VALUES ---")
print(df.isnull().sum())

print("--- SUMMARY STATS ---")
print(df.describe())`}</Block>
        <Callout icon="⚠️" color="#f59e0b" title="Three red flags to spot in df.dtypes" type="warn">1) A column that should be numeric but shows <code style={{background:"#2a1500",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f7c96e"}}>object</code>. 2) Columns with many nulls. 3) Fewer rows than expected. Fix these before any analysis or your results will be wrong.</Callout>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint — test yourself before continuing</div>
        <Quiz questions={[
          {q:"df.iloc[2:5] returns:",options:["Rows with index labels 2,3,4","Rows at positions 2,3,4","Columns 2,3,4","Rows 2,3,4,5"],answer:"Rows at positions 2,3,4",explanation:"iloc uses integer positions. [2:5] means positions 2,3,4 (5 not included). Use loc for label-based selection."},
          {q:"df['Churn'].value_counts(normalize=True) returns:",options:["Count of each unique value","Proportion of each value (0 to 1)","Sorted values","An error"],answer:"Proportion of each value (0 to 1)",explanation:"normalize=True divides each count by total rows. Multiply by 100 for percentages."},
          {q:"df[(df['age']>30) & (df['salary']>50000)] — what does & do?",options:["Bitwise AND on numbers","Both conditions must be True","Same as 'and' keyword","Selects both columns"],answer:"Both conditions must be True",explanation:"In Pandas use & not 'and'. Always wrap each condition in parentheses or you get a TypeError."},
        ]}/>
      </div>

      {/* ══ PART 3: SELECTING & FILTERING ══ */}
      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 5 — SELECTING & FILTERING</div>
        <LH>Selecting columns and rows</LH>
        <LP>Two ways to select: by position (iloc) or by label (loc). Memorize the difference — it comes up in every DS interview.</LP>
        <Block label="Try selecting different rows and columns — predict the output first">{`import pandas as pd

data = {'name':['Ali','Sara','Omar','Lina'],'age':[25,32,28,35],'salary':[3000,5500,4200,6100]}
df = pd.DataFrame(data)

# One column
print(df['name'])

# Multiple columns
print(df[['name','salary']])

# By position (iloc)
print(df.iloc[0])         # first row
print(df.iloc[1:3])       # rows 1,2
print(df.iloc[0:2, 1:])   # rows 0-1, columns from index 1 onward

# By label (loc)
print(df.loc[0, 'name'])  # single value: 'Ali'
print(df.loc[1:2, 'age':'salary'])  # range of labels`}</Block>
        <Tip>Rule: use <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>iloc</code> when you think in numbers. Use <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>loc</code> when you think in column names.</Tip>
        <LH>Filtering rows</LH>
        <Block label="Try changing the conditions — predict what each filter returns">{`import pandas as pd

data = {'name':['Ali','Sara','Omar','Lina','Karim'],'age':[25,32,28,35,22],'city':['Beirut','Tripoli','Beirut','Sidon','Beirut'],'salary':[3000,5500,4200,6100,2800]}
df = pd.DataFrame(data)

# Single condition
print(df[df['age'] > 28])

# Multiple conditions — & means AND, | means OR
print(df[(df['city'] == 'Beirut') & (df['salary'] > 3000)])

# isin — cleaner than chaining OR conditions
print(df[df['city'].isin(['Beirut', 'Tripoli'])])

# query — most readable
print(df.query("age > 25 and city == 'Beirut'"))`}</Block>
        <Warn>Never use Python's <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>and</code>/<code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>or</code> inside Pandas filters. Use <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>&</code> and <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>|</code>, and wrap every condition in parentheses.</Warn>
      </div>

      {/* ══ PART 4: GROUPBY & COLUMNS ══ */}
      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 4 OF 5 — GROUPBY & NEW COLUMNS</div>
        <LH>groupby — answers "how does X vary by Y?"</LH>
        <Block label="Try changing .mean() to .sum() or .max()">{`import pandas as pd

data = {
    'contract': ['Month-to-month','One year','Month-to-month','Two year','One year'],
    'charges':  [29.85, 56.95, 53.85, 42.30, 70.70],
    'churn':    ['Yes','No','Yes','No','No']
}
df = pd.DataFrame(data)

# Average charges per contract type
print(df.groupby('contract')['charges'].mean())

# Multiple aggregations
print(df.groupby('contract').agg(
    avg_charge=('charges','mean'),
    count=('charges','count'),
    churned=('churn', lambda x: (x=='Yes').sum())
))

# Churn rate per contract
print(df.groupby('contract')['churn'].apply(lambda x: (x=='Yes').mean()))`}</Block>
        <LH>Creating new columns</LH>
        <Block label="Try adding your own column at the bottom">{`import pandas as pd

data = {'tenure':[1,34,2,45,2],'charges':[29.85,56.95,53.85,42.30,70.70],'churn':['Yes','No','Yes','No','Yes']}
df = pd.DataFrame(data)

df['annual_charges'] = df['charges'] * 12
df['high_value']     = df['charges'] > 50
df['churn_binary']   = df['churn'].map({'Yes':1,'No':0})
df['tenure_group']   = pd.cut(df['tenure'], bins=[0,12,36,999], labels=['New','Mid','Loyal'])

print(df)`}</Block>
        <Tip>The <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>churn_binary</code> pattern (Yes→1, No→0) lets you compute churn rate with a simple <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>.mean()</code>. You will use this in every classification project.</Tip>
      </div>

      {/* ══ PART 5: REAL WORLD ══ */}
      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 5 OF 5 — REAL WORLD PIPELINE</div>
        <LH>The first-look pipeline every DS runs on a new dataset</LH>
        <Block label="Run this — this is what a DS does in the first 5 minutes with any dataset">{`import pandas as pd

data = {
    'customer_id': range(1,21),
    'tenure': [i%72 for i in range(20)],
    'monthly_charges': [round(20+(i%80),2) for i in range(20)],
    'contract': ['Month-to-month' if i%3==0 else 'One year' if i%3==1 else 'Two year' for i in range(20)],
    'churn': ['Yes' if i%4==0 else 'No' for i in range(20)]
}
df = pd.DataFrame(data)

print("=== SHAPE ===")
print(df.shape)

print("=== QUALITY ===")
print("Missing:", df.isnull().sum().sum())
print("Duplicates:", df.duplicated().sum())

print("=== KEY METRICS ===")
churn_rate = df['churn'].map({'Yes':1,'No':0}).mean()
print("Churn rate:", str(round(churn_rate*100,1)) + "%")
print("Avg charge:", round(df['monthly_charges'].mean(),2))

print("=== SEGMENT ===")
print(df.groupby('contract')['monthly_charges'].mean().round(2))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview gold" type="gold">"Walk me through how you'd explore a new dataset" is asked in almost every DS interview. The answer is always: shape → types → nulls → distributions → key metrics → segment breakdown. Memorize this sequence.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"df.groupby('dept')['salary'].mean() returns:",options:["One number","A Series with mean salary per department","A DataFrame","An error"],answer:"A Series with mean salary per department",explanation:"groupby splits by dept, .mean() computes the average within each group. Result is a Series indexed by department."},
          {q:"Best way to filter rows where Contract is 'Month-to-month' OR 'One year'?",options:["df[df['Contract'].isin(['Month-to-month','One year'])]","df[df['Contract']=='Month-to-month' or 'One year']","Two separate filters","df.query('Contract == Month-to-month or One year')"],answer:"df[df['Contract'].isin(['Month-to-month','One year'])]",explanation:"isin() is cleanest for checking membership in a list. The second option raises a TypeError."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Explore a small customer DataFrame"
          description="Fill in the blanks to: (1) print the number of rows, (2) print the average age, (3) print how many customers are from Beirut."
          starterCode={`import pandas as pd

data = {
    'name': ['Ali', 'Sara', 'Omar', 'Lina', 'Karim'],
    'age':  [25, 32, 28, 35, 22],
    'city': ['Beirut', 'Tripoli', 'Beirut', 'Sidon', 'Beirut']
}
df = pd.DataFrame(data)

# 1. Print number of rows
print(___)

# 2. Print average age
print(___)

# 3. Print count of customers from Beirut
print(___)`}
          hint="len(df) for rows. df['age'].mean() for average. (df['city'] == 'Beirut').sum() for city count."
          validate={(output) => {
            const lines = output.trim().split("\n");
            return lines[0].trim()==="5" && lines[1].trim()==="28.4" && lines[2].trim()==="3";
          }}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"pandas-advanced",phase:"Python for DS",emoji:"🔗",color:"#34d399",title:"Pandas: Cleaning, Merging & Transforming",subtitle:"Real data is messy — here is how to fix it",
   body:()=>(
    <LessonWrapper id="pandas-advanced" color="#34d399">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Missing Values","Type Fixing","✓ Quiz","apply & Strings","Merging","Method Chaining","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#34d399":"transparent",border:`2px solid ${i===0?"#34d399":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#34d399":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#34d399" title="The reality of DS work">80% of a data scientist's time is spent cleaning and preparing data — not building models. This lesson is where you learn the tools that make that 80% fast and reliable.</Callout>

      {/* ══ PART 1: MISSING VALUES ══ */}
      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — MISSING VALUES</div>
        <LH>Finding and fixing nulls</LH>
        <LP>Missing data is in every real dataset. Before you can model, you need to know where it is and decide what to do with it.</LP>
        <Block label="Try both fillna and dropna — notice how shape changes">{`import pandas as pd
import numpy as np

data = {
    'name':    ['Ali','Sara','Omar','Lina','Karim'],
    'age':     [25, np.nan, 28, np.nan, 22],
    'charges': [70.0, 56.0, np.nan, 42.0, 65.0],
    'plan':    ['premium', None, 'basic', 'premium', None]
}
df = pd.DataFrame(data)

# Find missing values
print("Missing per column:")
print(df.isnull().sum())
print("Missing %:")
print((df.isnull().sum() / len(df) * 100).round(1))

# Fill missing
df2 = df.copy()
df2['age']     = df2['age'].fillna(df2['age'].mean())
df2['charges'] = df2['charges'].fillna(df2['charges'].median())
df2['plan']    = df2['plan'].fillna('unknown')
print(df2)`}</Block>
        <Callout icon="🧠" color="#34d399" title="Drop vs Fill?">Drop when: missing is random and you have enough rows. Fill when: missing has meaning or you cannot afford to lose rows. <strong>Never fill before splitting train/test</strong> — fit imputers on train only, then transform both.</Callout>
      </div>

      {/* ══ PART 2: TYPE FIXING ══ */}
      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — FIXING DATA TYPES</div>
        <LH>Type errors cause silent bugs</LH>
        <LP>The most common real-world issue: a numeric column loaded as string. You can compute on it without error, but the results are wrong. Always check dtypes immediately after loading.</LP>
        <Block label="Try computing the mean before and after the type fix">{`import pandas as pd

# Simulate a common real-world problem
data = {'customer': ['A','B','C','D'], 'charges': ['29.85','56.95','bad_data','42.30'], 'churn': ['Yes','No','Yes','No']}
df = pd.DataFrame(data)

print("Before fix:", df['charges'].dtype)  # object — wrong!

# Fix: convert to numeric, turn bad values into NaN
df['charges'] = pd.to_numeric(df['charges'], errors='coerce')
print("After fix:", df['charges'].dtype)   # float64 — correct
print("Mean charge:", df['charges'].mean())

# Convert Yes/No to 1/0 (required for most ML models)
df['churn_binary'] = (df['churn'] == 'Yes').astype(int)

# Datetime conversion
import pandas as pd
dates = pd.Series(['2023-01-15', '2023-06-20', '2024-03-10'])
dates = pd.to_datetime(dates)
print(dates.dt.year)   # extract year
print(dates.dt.month)  # extract month`}</Block>
        <Tip><code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#34d399"}}>errors='coerce'</code> is your friend — it silently converts anything that can not become a number into NaN instead of crashing. Always use it when you are unsure about data quality.</Tip>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"pd.to_numeric(df['col'], errors='coerce') — what does errors='coerce' do?",options:["Raises error on bad values","Skips bad values","Converts bad values to NaN","Converts to string"],answer:"Converts bad values to NaN",explanation:"errors='coerce' silently converts anything that can't be a number into NaN. Useful when a numeric column has text mixed in."},
          {q:"After merging two DataFrames your row count tripled. What happened?",options:["Normal — merging adds rows","Many-to-many join — duplicate keys in one or both tables","Left join behavior","The merge failed"],answer:"Many-to-many join — duplicate keys in one or both tables",explanation:"If the key column has duplicates in both tables, each row matches multiple rows — cartesian product. Always check for duplicates before merging."},
          {q:"df.assign(new_col=lambda x: x['a'] + x['b']) — what does this return?",options:["Modifies df in place","New DataFrame with new_col added","Raises AttributeError","Modifies columns a and b"],answer:"New DataFrame with new_col added",explanation:"assign() always returns a new DataFrame — never modifies in place. Safe to use in method chains."},
        ]}/>
      </div>

      {/* ══ PART 3: APPLY & MERGING ══ */}
      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 4 — APPLY, STRINGS & MERGING</div>
        <LH>apply — custom transformations</LH>
        <Block label="Try changing the thresholds in the risk lambda">{`import pandas as pd

data = {'customer':['A','B','C','D','E'], 'charges':[29.85,56.95,85.00,42.30,70.70], 'tenure':[1,34,2,45,12]}
df = pd.DataFrame(data)

# Apply a custom function to a column
df['risk'] = df['charges'].apply(lambda x: 'High' if x > 70 else ('Medium' if x > 40 else 'Low'))
print(df[['customer','charges','risk']])

# String operations — always use .str accessor
df['customer_lower'] = df['customer'].str.lower()
df['customer_clean'] = df['customer'].str.strip().str.replace('-', '_')
print(df['customer_lower'])`}</Block>

        <LH>Merging DataFrames — like SQL JOINs</LH>
        <Block label="Try changing how='left' to how='inner' — count the difference">{`import pandas as pd

customers = pd.DataFrame({'id':[1,2,3,4], 'name':['Ali','Sara','Omar','Lina']})
orders    = pd.DataFrame({'id':[1,2,2,3], 'amount':[100,200,150,300]})

# Inner join — only matching rows
inner = customers.merge(orders, on='id', how='inner')
print("Inner:", inner.shape)
print(inner)

# Left join — all customers, even those without orders
left = customers.merge(orders, on='id', how='left')
print("Left:", left.shape)
print(left)

# Stack DataFrames vertically
df_jan = pd.DataFrame({'month':['Jan','Jan'], 'sales':[500,700]})
df_feb = pd.DataFrame({'month':['Feb','Feb'], 'sales':[600,800]})
combined = pd.concat([df_jan, df_feb], ignore_index=True)
print(combined)`}</Block>
        <Warn>After every merge, check the shape. If rows exploded unexpectedly, you have duplicate keys causing a many-to-many join. Always run <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>df.duplicated('key').sum()</code> before merging.</Warn>
      </div>

      {/* ══ PART 4: METHOD CHAINING ══ */}
      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 4 OF 4 — METHOD CHAINING</div>
        <LH>Professional cleaning pipelines</LH>
        <LP>Instead of creating 10 intermediate variables, chain operations together. This is how senior DS engineers write cleaning code — readable, reproducible, no side effects.</LP>
        <Block label="Run this — then try adding another .assign() step">{`import pandas as pd
import numpy as np

data = {'name':['Ali','Sara',None,'Lina'],'charges':['29.85','bad','53.85','42.30'],'churn':['Yes','No','Yes','No']}
df = pd.DataFrame(data)

# Clean, readable, chainable pipeline
df_clean = (
    df
    .copy()
    .dropna(subset=['name'])
    .assign(
        charges     = lambda x: pd.to_numeric(x['charges'], errors='coerce'),
        churn_binary= lambda x: (x['churn'] == 'Yes').astype(int),
        high_value  = lambda x: x['charges'] > 50,
    )
    .dropna(subset=['charges'])
    .reset_index(drop=True)
)
print(df_clean)
print("Shape:", df_clean.shape)`}</Block>
        <Callout icon="★" color="#f7c96e" title="Gold rule" type="gold">Method chaining is the hallmark of professional Pandas code. Each step is one operation, the whole pipeline reads top to bottom, and the original DataFrame is never mutated. Learn to love parentheses.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"df['Contract'].str.contains('month', case=False) returns:",options:["The matching strings","A True/False Series","Count of matches","Error"],answer:"A True/False Series",explanation:"str.contains() returns a boolean Series — True where the pattern matches. case=False makes it case-insensitive."},
          {q:"When should you use dropna() vs fillna()?",options:["Always use dropna","Always use fillna","Drop when you can afford losing rows; fill when missing has meaning or you need all rows","Drop numeric nulls; fill text nulls"],answer:"Drop when you can afford losing rows; fill when missing has meaning or you need all rows",explanation:"For ML: never fill before train/test split. Fit imputers on train only, then transform both sets."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Clean a messy DataFrame"
          description="Fill in the blanks to: (1) fill missing age with the column mean, (2) drop duplicate rows, (3) print the final shape."
          starterCode={`import pandas as pd
import numpy as np

data = {
    'name': ['Ali', 'Sara', 'Omar', 'Ali', 'Lina'],
    'age':  [25, np.nan, 28, 25, np.nan],
    'city': ['Beirut', 'Tripoli', 'Beirut', 'Beirut', 'Sidon']
}
df = pd.DataFrame(data)

# 1. Fill missing age with the column mean
df['age'] = df['age'].fillna(___)

# 2. Drop duplicate rows
df = df.___(keep='first')

# 3. Print the final shape
print(df.___)`}
          hint="df['age'].mean() for the fill value. drop_duplicates() removes duplicates. df.shape gives (rows, cols)."
          validate={(output) => output.includes("(4,") || output.includes("4,")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"eda",phase:"Python for DS",emoji:"🔍",color:"#f472b6",title:"Exploratory Data Analysis (EDA)",subtitle:"The skill that separates good data scientists from great ones",
   body:()=>(
    <LessonWrapper id="eda" color="#f472b6">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["5 Questions","Starter Pack","✓ Quiz","Target Analysis","Bivariate","Outliers","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f472b6":"transparent",border:`2px solid ${i===0?"#f472b6":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f472b6":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f472b6" title="The detective mindset">You are a detective. Every dataset has hidden stories, problems, and patterns. Your job before touching any model is to find them. Senior DSs spend more time on EDA than on modeling — because understanding your data is what prevents bad models.</Callout>

      {/* ══ PART 1: FRAMEWORK & STARTER PACK ══ */}
      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — THE EDA FRAMEWORK</div>
        <LH>5 questions to answer before any model</LH>
        <LP>Before writing a single line of analysis code, ask these 5 questions. They force you to think like a data scientist, not a coder.</LP>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",q:"What is the shape of my data?",a:"Rows = observations, columns = features. Scale determines your approach."},
            {n:"02",q:"What are the types and meanings of each column?",a:"Is it categorical, numeric, datetime? What does it represent in the real world?"},
            {n:"03",q:"What is missing and how much?",a:"Less than 5% → drop rows. More than 30% → consider dropping the column."},
            {n:"04",q:"What does the target variable look like?",a:"Is it balanced or skewed? This determines your evaluation metric."},
            {n:"05",q:"What features correlate with the target?",a:"Strong correlations = strong predictors. Weak correlations = noise."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:"#0d1520",borderRadius:8,border:"1px solid #f472b622"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"#f472b222",border:"1px solid #f472b644",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:"#f472b6",fontWeight:700}}>{item.n}</div>
              <div><div style={{color:"#f472b6",fontWeight:700,fontSize:12,marginBottom:3}}>{item.q}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{item.a}</div></div>
            </div>
          ))}
        </div>

        <LH>The EDA starter pack — run this on every new dataset</LH>
        <Block label="Copy this template for every new project">{`import pandas as pd
import numpy as np

# Use a sample dataset we can run in the browser
data = {
    'contract':        ['Month-to-month','One year','Month-to-month','Two year','Month-to-month','One year'],
    'tenure':          [1, 34, 2, 45, 12, 60],
    'monthly_charges': [70.0, 50.0, 90.0, 45.0, 65.0, 55.0],
    'churn':           ['Yes','No','Yes','No','Yes','No']
}
df = pd.DataFrame(data)
df['churn_binary'] = (df['churn'] == 'Yes').astype(int)

# Q1: Shape
print("Shape:", df.shape)

# Q3: Missing
print("Missing:", df.isnull().sum().to_dict())

# Q4: Target distribution
print("Churn rate:", str(round(df['churn_binary'].mean()*100,1)) + "%")
print(df['churn'].value_counts())

# Q5: Correlations with target
print(df[['tenure','monthly_charges','churn_binary']].corr()['churn_binary'])`}</Block>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"You build a fraud model. 99% of transactions are legit. You get 99% accuracy. Is the model good?",options:["Yes, 99% is excellent","No — a model always predicting 'not fraud' gets 99% too","Only if recall is also 99%","Depends on the algorithm"],answer:"No — a model always predicting 'not fraud' gets 99% too",explanation:"Class imbalance makes accuracy meaningless. A model that never detects fraud is useless despite 99% accuracy. Always check precision, recall, and F1."},
          {q:"df['price'].mean() = 1200 but df['price'].median() = 450. What does this suggest?",options:["Normal distribution","Right skew — expensive outliers pulling the mean up","Left skew","Data errors"],answer:"Right skew — expensive outliers pulling the mean up",explanation:"When mean >> median, a few very high values pull the average up. For skewed data, median is more representative of the 'typical' value."},
          {q:"What is the first thing to check about your target variable?",options:["Correlation with features","Class distribution (balance)","Data type","Missing values"],answer:"Class distribution (balance)",explanation:"Class imbalance fundamentally changes how you build and evaluate models. A severely imbalanced target requires special techniques and different metrics."},
        ]}/>
      </div>

      {/* ══ PART 2: ANALYSIS ══ */}
      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — UNIVARIATE & BIVARIATE ANALYSIS</div>
        <LH>Univariate — understanding one column at a time</LH>
        <Block label="Try printing stats for different columns">{`import pandas as pd
import numpy as np

data = {'contract':['Month-to-month','One year','Month-to-month','Two year','Month-to-month','One year'],'tenure':[1,34,2,45,12,60],'monthly_charges':[70.0,50.0,90.0,45.0,65.0,55.0],'churn':['Yes','No','Yes','No','Yes','No']}
df = pd.DataFrame(data)

# Numeric column stats
col = 'monthly_charges'
print("Mean:   " + str(round(df[col].mean(), 2)))
print("Median: " + str(round(df[col].median(), 2)))
print("Std:    " + str(round(df[col].std(), 2)))
print("Min/Max:" + str(df[col].min()) + " / " + str(df[col].max()))

# Categorical column counts
print(df['contract'].value_counts())
print(df['contract'].value_counts(normalize=True).round(2))

# All categorical columns at once
for col in df.select_dtypes(include='object').columns:
    print(col, ":", df[col].nunique(), "unique values")`}</Block>

        <LH>Bivariate — how features relate to the target</LH>
        <Block label="Try grouping by contract and computing mean churn rate">{`import pandas as pd

data = {'contract':['Month-to-month','One year','Month-to-month','Two year','Month-to-month','One year'],'tenure':[1,34,2,45,12,60],'monthly_charges':[70.0,50.0,90.0,45.0,65.0,55.0],'churn':['Yes','No','Yes','No','Yes','No']}
df = pd.DataFrame(data)
df['churn_binary'] = (df['churn'] == 'Yes').astype(int)

# Categorical feature vs target
churn_by_contract = df.groupby('contract')['churn_binary'].mean().sort_values(ascending=False)
print("Churn rate by contract:")
print(churn_by_contract.round(2))

# Numeric feature vs target
for col in ['tenure', 'monthly_charges']:
    churned     = df[df['churn']=='Yes'][col].mean()
    not_churned = df[df['churn']=='No'][col].mean()
    print(col + ": churned=" + str(round(churned,1)) + " not_churned=" + str(round(not_churned,1)))`}</Block>
        <Tip>When a numeric feature's mean differs significantly between churned and non-churned customers, it is likely a useful predictor. This is your first signal before running any model.</Tip>
      </div>

      {/* ══ PART 3: OUTLIERS & FULL PIPELINE ══ */}
      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 4 — OUTLIERS & FULL EDA PIPELINE</div>
        <LH>Outlier detection with IQR</LH>
        <Block label="Try it on monthly_charges — how many outliers does it find?">{`import pandas as pd
import numpy as np

data = {'monthly_charges':[29.85,56.95,53.85,42.30,70.70,200.0,85.0,30.0],'tenure':[1,34,2,45,2,1,12,60]}
df = pd.DataFrame(data)

def find_outliers(df, col):
    Q1  = df[col].quantile(0.25)
    Q3  = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = df[(df[col] < lower) | (df[col] > upper)]
    pct = round(len(outliers)/len(df)*100,1)
    print(col + ": " + str(len(outliers)) + " outliers (" + str(pct) + "%)")
    print("  Bounds: [" + str(round(lower,1)) + ", " + str(round(upper,1)) + "]")
    return outliers

find_outliers(df, 'monthly_charges')
find_outliers(df, 'tenure')`}</Block>
        <Callout icon="★" color="#f7c96e" title="Gold habit" type="gold">Before every model, write 5 specific questions about the data. Answer each with code. This forces you to understand the data instead of blindly running sklearn. Senior DSs do this every time.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Correlation of -0.4 between 'tenure' and 'Churn'. What does this mean?",options:["No relationship","Longer tenure → less likely to churn","Longer tenure → more likely to churn","Too weak to matter"],answer:"Longer tenure → less likely to churn",explanation:"Negative correlation: as tenure goes up, churn goes down. Loyal long-term customers are less likely to churn."},
          {q:"What does bivariate analysis mean?",options:["Analyzing two datasets","Analyzing the relationship between two variables","Using two algorithms","Splitting data in two"],answer:"Analyzing the relationship between two variables",explanation:"Bivariate = two variables. You are looking at how one feature relates to another — especially each feature's relationship to the target."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Run basic EDA on a dataset"
          description="Fill in the blanks to: (1) print the shape, (2) compute churn rate as a percentage rounded to 1 decimal, (3) print the most common contract type."
          starterCode={`import pandas as pd

data = {
    'contract': ['Month-to-month','One year','Month-to-month','Two year','Month-to-month','One year'],
    'monthly_charges': [70, 50, 90, 45, 65, 55],
    'churn': ['Yes','No','Yes','No','Yes','No']
}
df = pd.DataFrame(data)

# 1. Print shape
print(___)

# 2. Churn rate as a percentage (round to 1 decimal)
churn_rate = round((df['churn'] == 'Yes').mean() * ___, 1)
print(str(churn_rate) + "%")

# 3. Most common contract type
print(df['contract'].value_counts().___())`}
          hint="df.shape. Multiply by 100 for percentage. .idxmax() returns the index (contract name) with the highest count."
          validate={(output) => output.includes("(6") && output.includes("50.0") && output.includes("Month-to-month")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"visualization",phase:"Python for DS",emoji:"📊",color:"#fb923c",title:"Data Visualization",subtitle:"Turn numbers into insights that anyone can understand",
   body:()=>(
    <LessonWrapper id="visualization" color="#fb923c">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Chart Guide","Histogram","✓ Quiz","Bar & Box","Scatter & Heatmap","Subplots","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fb923c":"transparent",border:`2px solid ${i===0?"#fb923c":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#fb923c":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#fb923c" title="The rule that matters most">Every chart must answer one specific question. If you cannot state the question in one sentence, do not make the chart. 'This chart shows...' is not a question. 'Which contract type has the highest churn rate?' is.</Callout>

      {/* ══ PART 1: CHART GUIDE ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — WHICH CHART TO USE</div>
        <LH>The chart decision guide</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {situation:"Distribution of ONE numeric column",chart:"Histogram",color:"#7eb8f7"},
            {situation:"Counts of ONE categorical column",chart:"Bar chart",color:"#6dd6a0"},
            {situation:"Numeric vs categorical comparison",chart:"Box plot",color:"#f472b6"},
            {situation:"Relationship between TWO numerics",chart:"Scatter plot",color:"#a78bfa"},
            {situation:"Correlation between many columns",chart:"Heatmap",color:"#f7c96e"},
            {situation:"Change over time",chart:"Line chart",color:"#34d399"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"#0d1520",borderRadius:8,border:"1px solid #1e2a3a"}}>
              <span style={{color:"#8b87a8",fontSize:12}}>{item.situation}</span>
              <span style={{background:item.color+"22",color:item.color,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0,marginLeft:12}}>{item.chart}</span>
            </div>
          ))}
        </div>
        <Tip>Use pie charts only when you have 3-4 categories max and want to show part-of-whole. For anything else, a bar chart is almost always clearer.</Tip>
      </div>

      {/* ══ PART 2: HISTOGRAMS & BARS ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — HISTOGRAMS & BAR CHARTS</div>
        <LH>Histogram — understand distributions</LH>
        <Block label="Run this — try changing bins= and see what changes">{`import matplotlib.pyplot as plt
import numpy as np

# Simulate customer charges data
np.random.seed(42)
charges = np.concatenate([
    np.random.normal(35, 10, 200),   # budget customers
    np.random.normal(70, 15, 300),   # mid-tier
    np.random.normal(95, 8, 100),    # premium
])
charges = np.clip(charges, 20, 120)

plt.figure(figsize=(8, 4))
plt.hist(charges, bins=30, color='#7eb8f7', edgecolor='#1e3a5a', alpha=0.8)
plt.axvline(charges.mean(), color='#f28b82', linestyle='--', label='Mean: ' + str(round(charges.mean(),1)))
plt.axvline(np.median(charges), color='#6dd6a0', linestyle='--', label='Median: ' + str(round(np.median(charges),1)))
plt.title('Monthly Charges Distribution')
plt.xlabel('Monthly Charges ($)')
plt.ylabel('Count')
plt.legend()
plt.tight_layout()
plt.show()`}</Block>

        <LH>Bar chart — compare categories</LH>
        <Block label="Try sorting the bars — which contract type churns most?">{`import matplotlib.pyplot as plt
import pandas as pd

data = {'contract':['Month-to-month','One year','Two year'],'churn_rate':[0.427, 0.113, 0.028]}
df = pd.DataFrame(data).sort_values('churn_rate', ascending=False)

colors = ['#f28b82' if r > 0.3 else '#f7c96e' if r > 0.1 else '#6dd6a0' for r in df['churn_rate']]
bars = plt.bar(df['contract'], df['churn_rate'] * 100, color=colors)

for bar, val in zip(bars, df['churn_rate']):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
             str(round(val*100,1)) + '%', ha='center', va='bottom', fontweight='bold', color='white')

plt.title('Churn Rate by Contract Type')
plt.ylabel('Churn Rate (%)')
plt.tight_layout()
plt.show()`}</Block>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"You want to compare salary distributions across 5 departments AND show outliers. Best chart?",options:["5 histograms","Scatter plot","Box plot","Bar chart"],answer:"Box plot",explanation:"Box plots show median, IQR, and outliers for each group side by side — perfect for comparing distributions across categories."},
          {q:"When should you NOT use a pie chart?",options:["When comparing categories","When you have more than 3-4 segments","When showing percentages","Never — pie charts are always useful"],answer:"When you have more than 3-4 segments",explanation:"Pie charts are hard to read with many slices. For more than 3-4 categories, use a bar chart instead."},
          {q:"What does kde=True do in a histogram?",options:["Adds a kernel density estimate curve","Makes bars wider","Shows outliers","Normalizes to percentages"],answer:"Adds a kernel density estimate curve",explanation:"KDE (Kernel Density Estimate) is a smooth curve showing the probability distribution shape. It helps visualize distribution beyond just bar heights."},
        ]}/>
      </div>

      {/* ══ PART 3: BOX, SCATTER, HEATMAP ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 4 — BOX PLOTS, SCATTER & HEATMAP</div>
        <LH>Box plot — spot group differences and outliers</LH>
        <Block label="The box shows middle 50% of data — dots are outliers">{`import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
month_to_month = np.random.normal(65, 20, 100)
one_year       = np.random.normal(55, 15, 80)
two_year       = np.random.normal(45, 12, 60)

plt.figure(figsize=(8, 5))
plt.boxplot([month_to_month, one_year, two_year],
            labels=['Month-to-month','One year','Two year'],
            patch_artist=True,
            boxprops=dict(facecolor='#7eb8f722', color='#7eb8f7'),
            medianprops=dict(color='#f28b82', linewidth=2))
plt.title('Monthly Charges by Contract Type')
plt.ylabel('Monthly Charges ($)')
plt.tight_layout()
plt.show()`}</Block>

        <LH>Correlation heatmap — find predictors fast</LH>
        <Block label="Darker red or blue = stronger correlation with the target">{`import matplotlib.pyplot as plt
import numpy as np

# Simulate a correlation matrix
np.random.seed(42)
n = 100
tenure   = np.random.randint(1, 73, n)
charges  = 20 + tenure * 0.3 + np.random.normal(0, 15, n)
churn    = (charges > 70).astype(int) + np.random.randint(0, 2, n)
churn    = (churn > 0).astype(int)

import pandas as pd
df = pd.DataFrame({'tenure':tenure,'monthly_charges':charges,'churn':churn})
corr = df.corr()

plt.figure(figsize=(6, 4))
im = plt.imshow(corr.values, cmap='coolwarm', vmin=-1, vmax=1)
plt.colorbar(im)
plt.xticks(range(len(corr)), corr.columns, rotation=45)
plt.yticks(range(len(corr)), corr.columns)
for i in range(len(corr)):
    for j in range(len(corr)):
        plt.text(j, i, str(round(corr.values[i,j],2)), ha='center', va='center', fontsize=10, color='black')
plt.title('Correlation Matrix')
plt.tight_layout()
plt.show()`}</Block>
      </div>

      {/* ══ PART 4: STORYTELLING ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 4 OF 4 — STORYTELLING & PRESENTATION</div>
        <LH>Multi-chart dashboard — tell the full story</LH>
        <Block label="This is what a DS presents to a manager — try running it">{`import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

np.random.seed(42)
n = 200
contract  = np.random.choice(['Month-to-month','One year','Two year'], n, p=[0.55,0.25,0.20])
tenure    = np.random.randint(1, 73, n)
charges   = np.where(contract=='Month-to-month', np.random.normal(65,18,n),
            np.where(contract=='One year', np.random.normal(55,15,n), np.random.normal(45,12,n)))
churn_p   = np.where(contract=='Month-to-month', 0.43, np.where(contract=='One year', 0.11, 0.03))
churn     = np.random.binomial(1, churn_p, n)
df = pd.DataFrame({'contract':contract,'tenure':tenure,'charges':charges,'churn':churn})

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle('Customer Churn Analysis', fontsize=14, fontweight='bold', color='white')
fig.patch.set_facecolor('#13111a')
for ax in axes.flat:
    ax.set_facecolor('#1c1927')
    ax.tick_params(colors='#8b87a8')
    ax.title.set_color('#e2dff0')

# 1. Churn distribution
vals = df['churn'].value_counts()
axes[0,0].pie([vals.get(0,0), vals.get(1,0)], labels=['Retained','Churned'],
              autopct='%1.1f%%', colors=['#6dd6a0','#f28b82'])
axes[0,0].set_title('Overall Churn Rate')

# 2. Churn rate by contract
cr = df.groupby('contract')['churn'].mean().sort_values(ascending=False)
axes[0,1].bar(cr.index, cr.values*100, color=['#f28b82','#f7c96e','#6dd6a0'])
axes[0,1].set_title('Churn Rate by Contract')
axes[0,1].set_ylabel('Churn Rate (%)', color='#8b87a8')

# 3. Charges distribution
axes[1,0].hist(df[df['churn']==1]['charges'], bins=20, alpha=0.7, label='Churned', color='#f28b82')
axes[1,0].hist(df[df['churn']==0]['charges'], bins=20, alpha=0.7, label='Retained', color='#6dd6a0')
axes[1,0].set_title('Charges: Churned vs Retained')
axes[1,0].legend()

# 4. Tenure vs charges
sc = axes[1,1].scatter(df['tenure'], df['charges'], c=df['churn'], cmap='RdYlGn_r', alpha=0.5, s=15)
axes[1,1].set_title('Tenure vs Charges by Churn')
axes[1,1].set_xlabel('Tenure', color='#8b87a8')

plt.tight_layout()
plt.show()`}</Block>
        <Callout icon="★" color="#f7c96e" title="Presentation rule" type="gold">Every chart in a report needs: (1) a clear title, (2) labeled axes, (3) a one-sentence takeaway. 'Month-to-month customers churn 43% vs 3% for two-year contracts' is a takeaway. 'This chart shows churn' is not.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"A correlation heatmap shows -0.35 between 'tenure' and 'Churn'. What does this mean?",options:["No correlation","Longer tenure → lower churn probability","Longer tenure → higher churn probability","Weak positive relationship"],answer:"Longer tenure → lower churn probability",explanation:"-0.35 is a moderate negative correlation. As tenure increases, churn decreases. Loyal customers stay."},
          {q:"You make a chart but cannot write a one-sentence takeaway. What should you do?",options:["Add more data","Rethink what question the chart is answering","Add a legend","Change the chart type"],answer:"Rethink what question the chart is answering",explanation:"If you cannot state a clear takeaway, the chart is not answering a specific question. Always start with the question, not the plot command."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Compute chart-ready summary stats"
          description="Before plotting, always summarize first. Compute mean charge per contract type, then print the contract with the highest mean."
          starterCode={`import pandas as pd

data = {
    'contract': ['Month-to-month','One year','Month-to-month','Two year','One year','Two year'],
    'monthly_charges': [75, 55, 85, 40, 60, 45]
}
df = pd.DataFrame(data)

# Mean charge per contract type
result = df.groupby(___)[___].mean().round(1)
print(result)

# Contract with highest mean charge
print(result.___)`}
          hint="groupby('contract')['monthly_charges'].mean(). Then .idxmax() gives the top contract."
          validate={(output) => output.includes("Month-to-month") && output.includes("80.0")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"sql-basics",phase:"SQL",emoji:"🗄️",color:"#fb923c",title:"SQL Foundations",subtitle:"SELECT, WHERE, GROUP BY — the language of data",
   body:()=>(
    <LessonWrapper id="sql-basics" color="#fb923c">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["SELECT & FROM","WHERE","✓ Quiz","GROUP BY","HAVING","CASE WHEN","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fb923c":"transparent",border:`2px solid ${i===0?"#fb923c":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#fb923c":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#fb923c" title="The golden rule — memorize this order"><strong style={{color:"#fff"}}>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT</strong><br/>SQL always executes in this order internally. Writing filters in the wrong place causes errors.</Callout>

      {/* ══ PART 1: SELECT & WHERE ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — SELECT, FROM & WHERE</div>
        <LH>Reading data from a table</LH>
        <LP>Every SQL query starts with SELECT and FROM. These two keywords alone can answer most basic business questions.</LP>
        <Block label="The patterns you will write every day">{`-- All columns
SELECT * FROM customers;

-- Specific columns only (always prefer this over *)
SELECT customer_id, name, monthly_charges FROM customers;

-- Calculated columns with aliases
SELECT name,
       monthly_charges,
       monthly_charges * 12 AS annual_charges
FROM customers;

-- Rename columns for clarity
SELECT name AS customer_name,
       monthly_charges AS charge
FROM customers;`}</Block>
        <Tip>Always name your SELECT columns explicitly instead of using <code style={{background:"#2a1500",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#fb923c"}}>SELECT *</code> in production. It makes queries readable and prevents breaking when tables change.</Tip>

        <LH>WHERE — filtering rows</LH>
        <Block label="Try combining multiple conditions">{`-- Single condition
SELECT * FROM customers WHERE churn = 'Yes';
SELECT * FROM customers WHERE monthly_charges > 70;

-- AND / OR
SELECT * FROM customers
WHERE monthly_charges > 70 AND contract = 'Month-to-month';

-- IN — cleaner than multiple ORs
SELECT * FROM customers
WHERE contract IN ('Month-to-month', 'One year');

-- BETWEEN (inclusive on both ends)
SELECT * FROM customers
WHERE monthly_charges BETWEEN 50 AND 80;

-- LIKE — pattern matching
SELECT * FROM customers WHERE name LIKE 'Ahmed%';     -- starts with Ahmed
SELECT * FROM customers WHERE email LIKE '%@gmail.com'; -- ends with @gmail.com

-- NULL handling — must use IS NULL not = NULL
SELECT * FROM customers WHERE total_charges IS NULL;`}</Block>
        <Warn>Never use <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>= NULL</code> to check for missing values — it always returns nothing. Always use <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>IS NULL</code> or <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>IS NOT NULL</code>.</Warn>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"SELECT * FROM orders WHERE total BETWEEN 100 AND 200 — this includes:",options:["100 < total < 200 (exclusive)","100 <= total <= 200 (inclusive)","Only 100 and 200","total > 100 AND total < 200"],answer:"100 <= total <= 200 (inclusive)",explanation:"BETWEEN is inclusive on both ends. BETWEEN 100 AND 200 equals total >= 100 AND total <= 200."},
          {q:"You want customers whose email ends with '@gmail.com'. Which clause?",options:["WHERE email = '@gmail.com'","WHERE email LIKE '%@gmail.com'","WHERE email CONTAINS '@gmail.com'","WHERE email IN ('@gmail.com')"],answer:"WHERE email LIKE '%@gmail.com'",explanation:"% is a wildcard matching any number of characters. '%@gmail.com' means anything followed by @gmail.com."},
          {q:"What is wrong with: SELECT dept, AVG(salary) FROM emp WHERE AVG(salary) > 70000 GROUP BY dept",options:["Nothing","Cannot use AVG() in WHERE — use HAVING","GROUP BY must come before WHERE","HAVING is missing"],answer:"Cannot use AVG() in WHERE — use HAVING",explanation:"WHERE runs before GROUP BY, so aggregate functions don't exist yet at that point. Move the condition to HAVING."},
        ]}/>
      </div>

      {/* ══ PART 2: GROUP BY & HAVING ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — GROUP BY, HAVING & ORDER BY</div>
        <LH>GROUP BY — aggregate per category</LH>
        <Block label="Try changing the aggregate function — SUM, MIN, MAX">{`-- Count, average, sum per contract type
SELECT
    contract,
    COUNT(*) AS total_customers,
    AVG(monthly_charges) AS avg_charge,
    SUM(monthly_charges) AS total_revenue
FROM customers
GROUP BY contract;

-- COUNT(*) vs COUNT(column) — key difference
-- COUNT(*) counts ALL rows including NULLs
-- COUNT(col) counts only non-NULL values
SELECT COUNT(*), COUNT(total_charges) FROM customers;

-- DISTINCT — unique values only
SELECT COUNT(DISTINCT customer_id) FROM orders;`}</Block>
        <Callout icon="🧠" color="#f7c96e" title="WHERE vs HAVING">WHERE filters rows BEFORE grouping. HAVING filters groups AFTER grouping. You cannot use aggregate functions like AVG() or SUM() in WHERE — only in HAVING.</Callout>
        <Block label="HAVING — filter the groups themselves">{`-- Only contract types with more than 1000 customers
SELECT contract, COUNT(*) AS total
FROM customers
GROUP BY contract
HAVING COUNT(*) > 1000;

-- High-value contract types, sorted
SELECT contract, AVG(monthly_charges) AS avg_charge
FROM customers
GROUP BY contract
HAVING AVG(monthly_charges) > 65
ORDER BY avg_charge DESC;`}</Block>
      </div>

      {/* ══ PART 3: CASE WHEN & REAL WORLD ══ */}
      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 4 — CASE WHEN & REAL WORLD</div>
        <LH>CASE WHEN — if/else inside SQL</LH>
        <Block label="Try adding a fourth tier">{`SELECT name, monthly_charges,
    CASE
        WHEN monthly_charges > 80 THEN 'High Value'
        WHEN monthly_charges > 50 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS customer_segment
FROM customers;

-- CASE inside aggregation — compute churn rate without joining
SELECT
    contract,
    COUNT(*) AS customers,
    AVG(CASE WHEN churn = 'Yes' THEN 1.0 ELSE 0 END) AS churn_rate
FROM customers
GROUP BY contract
ORDER BY churn_rate DESC;`}</Block>
        <LH>Business questions answered in SQL</LH>
        <Block label="These are real interview questions — read them carefully">{`-- Q1: Overall churn rate
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END) AS churned,
    ROUND(AVG(CASE WHEN churn = 'Yes' THEN 1.0 ELSE 0 END) * 100, 1) AS churn_pct
FROM customers;

-- Q2: Which contract type churns most?
SELECT contract,
       COUNT(*) AS customers,
       ROUND(AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END)*100,1) AS churn_pct
FROM customers
GROUP BY contract
ORDER BY churn_pct DESC;

-- Q3: Top 5 most expensive churned customers
SELECT customer_id, name, monthly_charges
FROM customers
WHERE churn = 'Yes'
ORDER BY monthly_charges DESC
LIMIT 5;`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview gold" type="gold">The <code style={{background:"#2a1a00",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f7c96e"}}>AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END)</code> pattern computes a rate in one query without needing two separate counts. Interviewers love seeing this — it shows you think in SQL, not just queries.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"SELECT COUNT(*) vs SELECT COUNT(salary) — difference?",options:["No difference","COUNT(*) counts all rows; COUNT(salary) skips NULLs","COUNT(salary) is faster","COUNT(*) only counts distinct values"],answer:"COUNT(*) counts all rows; COUNT(salary) skips NULLs",explanation:"COUNT(*) counts every row. COUNT(column) only counts rows where that column is not NULL."},
          {q:"To get the top 3 products per category, you need:",options:["WHERE rank <= 3","ORDER BY price DESC LIMIT 3","GROUP BY category HAVING rank <= 3","Window function: PARTITION BY category ORDER BY price DESC, then WHERE rn <= 3"],answer:"Window function: PARTITION BY category ORDER BY price DESC, then WHERE rn <= 3",explanation:"LIMIT applies globally. For top N per group, use ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) in a CTE, then filter WHERE rn <= 3."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Summarize sales data with GROUP BY logic"
          description="Use pandas to replicate SQL GROUP BY. Compute total revenue per city sorted descending, then print the city with the highest revenue."
          starterCode={`import pandas as pd

data = {
    'city':    ['Beirut','Tripoli','Beirut','Sidon','Tripoli','Beirut'],
    'revenue': [500, 300, 700, 200, 450, 600]
}
df = pd.DataFrame(data)

# 1. Group by city, sum revenue, sort descending
result = df.groupby(___)[___].sum().sort_values(ascending=___)
print(result.to_string())

# 2. City with highest revenue
print(result.___())`}
          hint="groupby('city')['revenue'].sum().sort_values(ascending=False). Then .idxmax()."
          validate={(output) => output.includes("Beirut") && output.includes("1800")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"sql-joins",phase:"SQL",emoji:"🔀",color:"#f472b6",title:"SQL JOINs & Subqueries",subtitle:"Connecting tables — tested in every DS interview",
   body:()=>(
    <LessonWrapper id="sql-joins" color="#f472b6">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["INNER JOIN","LEFT JOIN","✓ Quiz","Multiple JOINs","CTEs","Subqueries","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f472b6":"transparent",border:`2px solid ${i===0?"#f472b6":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f472b6":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f472b6" title="Why JOINs matter">Real data lives in multiple tables — customers in one, orders in another, products in a third. JOINs connect them. This is the most tested SQL concept in data science interviews, and the one most candidates get wrong.</Callout>

      {/* ══ PART 1: INNER & LEFT JOIN ══ */}
      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — INNER JOIN & LEFT JOIN</div>
        <LH>The two tables we will join</LH>
        <Block label="Read these carefully before looking at any JOIN">{`-- customers table                    -- orders table
-- customer_id | name  | city         -- order_id | customer_id | amount
-- 1           | Ahmed | Beirut        -- 101      | 1           | 250
-- 2           | Sara  | Dubai         -- 102      | 1           | 180
-- 3           | Omar  | Cairo         -- 103      | 2           | 320
-- 4           | Lina  | Beirut        -- 104      | 5           | 150 ← no match!

-- Omar (id=3) and Lina (id=4) have no orders
-- Order 104 has customer_id=5 which does not exist in customers`}</Block>
        <LH>INNER JOIN — only rows that match in both tables</LH>
        <Block label="Notice: Omar and Lina disappear — they have no orders">{`SELECT c.name, o.order_id, o.amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Result:
-- Ahmed | 101 | 250
-- Ahmed | 102 | 180
-- Sara  | 103 | 320
-- Omar and Lina: dropped (no orders)
-- Order 104: dropped (customer 5 doesn't exist)`}</Block>
        <LH>LEFT JOIN — all rows from left table, NULLs where no match</LH>
        <Block label="All customers kept — Omar and Lina show NULL for order columns">{`SELECT c.name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;

-- Result:
-- Ahmed | 101  | 250
-- Ahmed | 102  | 180
-- Sara  | 103  | 320
-- Omar  | NULL | NULL   ← kept with NULLs
-- Lina  | NULL | NULL   ← kept with NULLs

-- Find customers with NO orders (anti-join pattern)
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`}</Block>
        <Tip>The anti-join pattern (<code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>LEFT JOIN ... WHERE right.id IS NULL</code>) finds rows that exist in one table but not another. You will use this constantly in DS work.</Tip>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"You want ALL customers AND their orders (if any). Customers with no orders should still appear. Which join?",options:["INNER JOIN","RIGHT JOIN","LEFT JOIN (customers LEFT JOIN orders)","FULL OUTER JOIN"],answer:"LEFT JOIN (customers LEFT JOIN orders)",explanation:"LEFT JOIN keeps all rows from the left table. Customers with no matching orders get NULL in order columns."},
          {q:"After a LEFT JOIN, you filter WHERE o.order_id IS NULL. What does this return?",options:["All rows with orders","Customers with no orders","NULL rows from both tables","An error"],answer:"Customers with no orders",explanation:"After LEFT JOIN, unmatched rows from the right table become NULL. Filtering for NULL finds the customers who have no matching orders."},
          {q:"customers INNER JOIN orders — Omar has no orders. Does Omar appear?",options:["Yes, with NULL in order columns","No — INNER JOIN drops non-matching rows","Yes — INNER JOIN keeps all rows","Depends on the database"],answer:"No — INNER JOIN drops non-matching rows",explanation:"INNER JOIN only returns rows with a match in BOTH tables. Omar with no orders is excluded."},
        ]}/>
      </div>

      {/* ══ PART 2: CTEs & SUBQUERIES ══ */}
      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — MULTIPLE JOINS, CTEs & SUBQUERIES</div>
        <LH>Multiple JOINs — chaining tables</LH>
        <Block label="Each JOIN adds a new table to the query">{`SELECT
    c.name,
    o.amount,
    p.product_name,
    s.rep_name AS sales_rep
FROM customers c
LEFT JOIN orders o     ON c.customer_id = o.customer_id
LEFT JOIN products p   ON o.product_id  = p.product_id
LEFT JOIN sales_reps s ON c.rep_id      = s.rep_id
WHERE o.amount > 200;`}</Block>

        <LH>CTEs — break complex queries into readable steps</LH>
        <Block label="Always use CTEs in interviews — it shows structured thinking">{`-- Without CTE — impossible to read
SELECT a.contract, a.avg_charge, b.churn_rate
FROM (SELECT contract, AVG(monthly_charges) as avg_charge FROM customers GROUP BY contract) a
JOIN (SELECT contract, AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END) as churn_rate FROM customers GROUP BY contract) b
ON a.contract = b.contract;

-- With CTEs — clean, readable, maintainable
WITH contract_charges AS (
    SELECT contract, AVG(monthly_charges) AS avg_charge
    FROM customers GROUP BY contract
),
contract_churn AS (
    SELECT contract,
           AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END) AS churn_rate
    FROM customers GROUP BY contract
)
SELECT cc.contract, cc.avg_charge, ch.churn_rate
FROM contract_charges cc
JOIN contract_churn ch ON cc.contract = ch.contract
ORDER BY ch.churn_rate DESC;`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview gold" type="gold">In every SQL interview, use CTEs to decompose complex problems. It shows you think in structured steps — not one giant query that nobody can read.</Callout>

        <LH>Subqueries — queries inside queries</LH>
        <Block label="Three patterns you will see in every interview">{`-- Pattern 1: scalar subquery — compare to a single value
SELECT name, monthly_charges
FROM customers
WHERE monthly_charges > (SELECT AVG(monthly_charges) FROM customers);

-- Pattern 2: IN subquery — filter by a list
SELECT name FROM customers
WHERE customer_id IN (
    SELECT DISTINCT customer_id FROM orders WHERE amount > 500
);

-- Pattern 3: correlated subquery — references outer query
-- (slower but powerful)
SELECT name, monthly_charges
FROM customers c
WHERE monthly_charges > (
    SELECT AVG(monthly_charges)
    FROM customers
    WHERE contract = c.contract  -- uses outer table's contract
);`}</Block>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"What is the main advantage of a CTE over a subquery?",options:["CTEs execute faster","CTEs are named, reusable, and more readable","Subqueries can't be used with JOINs","CTEs support more SQL functions"],answer:"CTEs are named, reusable, and more readable",explanation:"CTEs make complex queries readable by breaking them into named steps. You can also reference the same CTE multiple times, unlike a subquery."},
          {q:"You need the top 3 customers by total spending in each city. What do you need?",options:["GROUP BY city ORDER BY SUM(amount) DESC LIMIT 3","ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC), then WHERE rn <= 3","WHERE city IN (SELECT TOP 3...)","Two separate queries with UNION"],answer:"ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC), then WHERE rn <= 3",explanation:"LIMIT is global. For top N per group use ROW_NUMBER() partitioned by city, wrap in CTE, then filter WHERE rn <= 3."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Simulate a JOIN with pandas merge"
          description="Merge two DataFrames (INNER JOIN) on customer_id, then print total spending per customer name."
          starterCode={`import pandas as pd

customers = pd.DataFrame({
    'customer_id': [1, 2, 3],
    'name': ['Ahmed', 'Sara', 'Omar']
})
orders = pd.DataFrame({
    'customer_id': [1, 1, 2],
    'amount': [250, 180, 320]
})

# Merge (INNER JOIN)
merged = customers.___(orders, on=___, how=___)

# Total amount per customer name
result = merged.groupby(___)['amount'].sum()
print(result.to_string())`}
          hint="customers.merge(orders, on='customer_id', how='inner'). groupby('name')."
          validate={(output) => output.includes("Ahmed") && output.includes("430")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"sql-window",phase:"SQL",emoji:"🪟",color:"#c084fc",title:"Window Functions",subtitle:"The SQL skill that makes you dangerous",
   body:()=>(
    <LessonWrapper id="sql-window" color="#c084fc">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["OVER() Clause","ROW_NUMBER & RANK","✓ Quiz","LAG & LEAD","Running Totals","Real Interview Q","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#c084fc":"transparent",border:`2px solid ${i===0?"#c084fc":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#c084fc":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#c084fc" title="GROUP BY vs Window Functions">GROUP BY collapses many rows into one per group. Window functions ADD a computed column to each row — without removing any rows. You get the detail AND the aggregate in the same result.</Callout>

      {/* ══ PART 1: OVER, RANK ══ */}
      <div style={{background:"#c084fc08",border:"1px solid #c084fc20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — OVER() & RANKING FUNCTIONS</div>
        <LH>The OVER() clause — the key to everything</LH>
        <LP>OVER() is what makes a function a window function. PARTITION BY defines the group, ORDER BY defines the sort within that group.</LP>
        <Block label="Notice: every row is kept, each shows its salary AND dept average">{`SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    salary - AVG(salary) OVER (PARTITION BY department) AS vs_dept_avg
FROM employees;

-- Without PARTITION BY — computes over ALL rows
SELECT name, salary,
    AVG(salary) OVER () AS company_avg
FROM employees;`}</Block>
        <Tip>Think of <code style={{background:"#1e1040",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#c084fc"}}>PARTITION BY</code> as "GROUP BY that doesn't collapse". Each row keeps its original data plus the group-level computation.</Tip>

        <LH>ROW_NUMBER, RANK, DENSE_RANK — understand the difference</LH>
        <Block label="If two salaries tie — watch how each function handles it">{`SELECT name, department, salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
    RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS d_rnk
FROM employees;

-- If Ahmed and Sara both earn $80k (tied):
-- ROW_NUMBER:  1, 2, 3  (always unique — arbitrary tiebreak)
-- RANK:        1, 1, 3  (both get 1 — rank 2 is skipped)
-- DENSE_RANK:  1, 1, 2  (both get 1 — no gap, next is 2)

-- Classic interview: top earner per department
WITH ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
    FROM employees
)
SELECT * FROM ranked WHERE rn = 1;`}</Block>
        <Warn>For "top N per group" problems — always use ROW_NUMBER or DENSE_RANK in a CTE, then filter <code style={{background:"#1f0d0d",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f28b82"}}>WHERE rn &lt;= N</code>. Never use LIMIT alone — it applies globally, not per group.</Warn>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"What does PARTITION BY do in a window function?",options:["Same as GROUP BY — collapses rows","Defines the group for calculation without collapsing rows","Filters rows before calculation","Sorts the output"],answer:"Defines the group for calculation without collapsing rows",explanation:"PARTITION BY divides data into groups for the window function to operate within, but all rows remain in the output. Key difference from GROUP BY."},
          {q:"Two employees tie at $80k. RANK gives them both 1. What rank comes next?",options:["2","3","1","Depends on ORDER BY"],answer:"3",explanation:"RANK skips ranks after a tie. Two people at rank 1 means the next is rank 3. DENSE_RANK would give rank 2 without skipping."},
          {q:"LAG(sales, 1) OVER (ORDER BY month) returns:",options:["Next month's sales","Sales 1% lower","Previous month's sales","Average of all months"],answer:"Previous month's sales",explanation:"LAG looks backward. LAG(col, 1) returns the value 1 row before in the ordering. LEAD looks forward."},
        ]}/>
      </div>

      {/* ══ PART 2: LAG, LEAD, RUNNING TOTALS ══ */}
      <div style={{background:"#c084fc08",border:"1px solid #c084fc20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — LAG, LEAD & RUNNING CALCULATIONS</div>
        <LH>LAG and LEAD — compare a row to its neighbors</LH>
        <Block label="Month-over-month change is one of the most common DS SQL tasks">{`SELECT
    month,
    revenue,
    LAG(revenue, 1)  OVER (ORDER BY month) AS prev_month,
    LEAD(revenue, 1) OVER (ORDER BY month) AS next_month,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS monthly_change,
    ROUND(
        (revenue - LAG(revenue,1) OVER (ORDER BY month)) /
        NULLIF(LAG(revenue,1) OVER (ORDER BY month), 0) * 100, 1
    ) AS pct_change
FROM monthly_sales;`}</Block>
        <Tip>Wrap the denominator in <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>NULLIF(..., 0)</code> to prevent division by zero — a detail interviewers notice.</Tip>

        <LH>Running totals and moving averages</LH>
        <Block label="Running total = cumulative sum from start to current row">{`SELECT
    date,
    daily_sales,
    SUM(daily_sales) OVER (ORDER BY date) AS running_total,
    AVG(daily_sales) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_avg
FROM daily_sales;

-- Window frame options:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  → from start to now
-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          → last 7 rows
-- ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING          → 3-row centered window`}</Block>
      </div>

      {/* ══ PART 3: REAL INTERVIEW Q ══ */}
      <div style={{background:"#c084fc08",border:"1px solid #c084fc20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 3 OF 4 — REAL INTERVIEW QUESTION</div>
        <LH>Solving a multi-window interview problem step by step</LH>
        <LP>This exact type of question appears in DS interviews at tech companies. Read it slowly — then study how each window function contributes.</LP>
        <Block label="Read and understand each line before running">{`-- "For each customer: show their monthly charge,
--  the average for their contract type,
--  their rank within their contract type,
--  and their running total charges"

SELECT
    customer_id,
    name,
    contract,
    monthly_charges,

    -- Average charge within same contract type
    ROUND(AVG(monthly_charges) OVER (PARTITION BY contract), 2) AS contract_avg,

    -- How does their charge compare to contract peers?
    monthly_charges - AVG(monthly_charges) OVER (PARTITION BY contract) AS vs_avg,

    -- Rank within contract type (highest = 1)
    RANK() OVER (PARTITION BY contract ORDER BY monthly_charges DESC) AS rank_in_contract,

    -- Running total within each customer's history
    SUM(monthly_charges) OVER (
        PARTITION BY customer_id ORDER BY tenure
    ) AS cumulative_charges

FROM customers;`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview approach" type="gold">When you see a complex window function problem: (1) identify what PARTITION BY should be, (2) identify what ORDER BY means, (3) pick the right function. Write it as a CTE first, test it, then combine.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) computes:",options:["Total sum of all rows","Running total from start to current row","Sum of last N rows","Sum partitioned by date"],answer:"Running total from start to current row",explanation:"UNBOUNDED PRECEDING means from the very beginning. This is a cumulative sum — each row shows the total of all previous rows including itself."},
          {q:"You need the 2nd highest paid employee per department. Best approach?",options:["WHERE salary = 2nd_max","ORDER BY salary DESC LIMIT 2 per dept","DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC), then WHERE rnk = 2","GROUP BY dept HAVING salary = MAX-1"],answer:"DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC), then WHERE rnk = 2",explanation:"Use DENSE_RANK (handles ties better than RANK) to rank within each department, wrap in CTE, filter WHERE rnk = 2."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Add running total and rank columns"
          description="Fill in the blanks to add: (1) a running_total column using cumsum, (2) a rank column based on sales descending (1 = highest)."
          starterCode={`import pandas as pd

data = {
    'month': ['Jan','Feb','Mar','Apr','May'],
    'sales': [100, 150, 120, 200, 180]
}
df = pd.DataFrame(data)

# 1. Running total
df['running_total'] = df[___].___

# 2. Rank by sales descending (1 = highest)
df['rank'] = df[___].rank(ascending=___, method='min').astype(int)

print(df.to_string(index=False))`}
          hint="df['sales'].cumsum(). df['sales'].rank(ascending=False, method='min')."
          validate={(output) => output.includes("750") && output.includes("1") && output.includes("Apr")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"probability",phase:"Statistics",emoji:"🎲",color:"#818cf8",title:"Probability & Bayes",subtitle:"The foundation of every ML prediction",
   body:()=>(
    <LessonWrapper id="probability" color="#818cf8">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Basic Probability","Conditional P","✓ Quiz","Bayes Theorem","Expected Value","Real DS Use","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#818cf8":"transparent",border:`2px solid ${i===0?"#818cf8":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#818cf8":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#818cf8" title="Why probability matters for ML">Every ML model outputs a probability — logistic regression gives P(churn), random forest gives P(class). Understanding what those numbers mean, and how to reason with them, is what separates good data scientists from people who just run code.</Callout>

      {/* ══ PART 1: BASIC & CONDITIONAL ══ */}
      <div style={{background:"#818cf808",border:"1px solid #818cf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — BASIC & CONDITIONAL PROBABILITY</div>
        <LH>The core rules</LH>
        <Block label="Run this — try changing the churn numbers">{`# Core rules
# P(event) = favorable / total
# 0 <= P(A) <= 1
# P(A) + P(not A) = 1  — complement rule
# P(A or B)  = P(A) + P(B) - P(A and B)  — addition rule
# P(A and B) = P(A) x P(B)  if A and B are INDEPENDENT

# Real example: Telco churn
total_customers = 7043
churned = 1869

p_churn     = churned / total_customers
p_not_churn = 1 - p_churn

print("P(churn)     = " + str(round(p_churn, 3)))
print("P(not churn) = " + str(round(p_not_churn, 3)))`}</Block>

        <LH>Conditional probability — the key to segmentation</LH>
        <LP>P(A | B) = "probability of A, given that B already happened." This is how you answer: "among month-to-month customers, what fraction churn?"</LP>
        <Block label="Try computing P(churn | Two year contract) — how does it compare?">{`import pandas as pd

# Simulate the Telco dataset
data = {
    'contract': ['Month-to-month']*5 + ['One year']*3 + ['Two year']*2,
    'churn':    ['Yes','Yes','No','Yes','No','No','Yes','No','No','No']
}
df = pd.DataFrame(data)

# P(churn | contract type) for each contract
for contract in df['contract'].unique():
    subset = df[df['contract'] == contract]
    p = (subset['churn'] == 'Yes').mean()
    print("P(churn | " + contract + ") = " + str(round(p*100,1)) + "%")`}</Block>
        <Tip>Conditional probability is why segmentation works in data science. The overall churn rate is 26.5%, but month-to-month customers churn at 42.7%. The condition changes everything.</Tip>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"P(churn) = 0.27. What is P(not churn)?",options:["0.27","0.73","0.54","Cannot determine"],answer:"0.73",explanation:"P(not A) = 1 - P(A). Probabilities of all outcomes must sum to 1."},
          {q:"P(A and B) = P(A) x P(B). This means A and B are:",options:["Mutually exclusive","Dependent","Independent","Complementary"],answer:"Independent",explanation:"For independent events, knowing one gives no information about the other. Joint probability = product of individual probabilities."},
          {q:"300 customers are on month-to-month contracts. 128 churned. What is P(churn | month-to-month)?",options:["128/1000 = 12.8%","128/300 = 42.7%","300/1000 = 30%","128/700 = 18.3%"],answer:"128/300 = 42.7%",explanation:"Conditional probability = favorable cases within the condition / total cases within the condition. 128 churned out of 300 month-to-month customers."},
        ]}/>
      </div>

      {/* ══ PART 2: BAYES & EXPECTED VALUE ══ */}
      <div style={{background:"#818cf808",border:"1px solid #818cf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — BAYES THEOREM & EXPECTED VALUE</div>
        <LH>Bayes theorem — updating beliefs with new evidence</LH>
        <LP>Bayes is how you update your belief when you get new evidence. Spam filters, medical tests, and Naive Bayes classifiers all use this formula.</LP>
        <Block label="Try changing p_spam to 0.5 — how does P(spam|FREE) change?">{`# P(A|B) = P(B|A) x P(A) / P(B)

# Spam filter example:
p_spam               = 0.20  # prior: 20% of emails are spam
p_free_given_spam    = 0.60  # 60% of spam contains "FREE"
p_free_given_legit   = 0.05  # 5% of legit emails contain "FREE"

# P("FREE") = total probability of seeing the word
p_free = (p_free_given_spam * p_spam) + (p_free_given_legit * (1 - p_spam))
print("P(FREE): " + str(round(p_free, 3)))

# Bayes: P(spam | "FREE")
p_spam_given_free = (p_free_given_spam * p_spam) / p_free
print("P(spam | email has FREE) = " + str(round(p_spam_given_free*100,1)) + "%")
# Seeing "FREE" updates our belief from 20% to ~75%`}</Block>
        <LH>Expected value — what you "expect" on average</LH>
        <Block label="Try changing the probabilities — expected value must always sum to 1">{`# E[X] = sum of (value x probability)
# "On average, what outcome do we expect?"

# Customer lifetime value model:
# 40% chance: stays 12 months at $65/mo = $780
# 35% chance: stays 6 months at $65/mo  = $390
# 25% chance: churns in 3 months        = $195

e_ltv = (0.40 * 780) + (0.35 * 390) + (0.25 * 195)
print("Expected LTV: $" + str(round(e_ltv, 2)))
# = $312 + $136.5 + $48.75 = $497.25

# Used in: pricing, A/B test decisions, risk models`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview gold" type="gold">Bayes theorem comes up in almost every statistics interview. The key insight: you start with a prior belief, observe evidence, and compute an updated (posterior) belief. Learn to apply the formula without looking it up.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Bayes theorem updates what?",options:["Algorithm weights","Your prior belief based on new evidence","The training data","The model architecture"],answer:"Your prior belief based on new evidence",explanation:"Bayes theorem: start with a prior probability, observe evidence, compute posterior probability — your updated belief."},
          {q:"E[revenue] = (0.6 x $1000) + (0.4 x $200). What is the expected revenue?",options:["$600","$680","$1200","$800"],answer:"$680",explanation:"0.6 x 1000 = 600. 0.4 x 200 = 80. Total = $680. Expected value is the probability-weighted average outcome."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Compute expected value"
          description="Fill in the blanks to compute the expected revenue from two scenarios."
          starterCode={`# Scenario A: 60% chance of $1000
# Scenario B: 40% chance of $200
prob_a = ___
rev_a  = ___
prob_b = ___
rev_b  = ___

expected = (prob_a * rev_a) + (___)
print("Expected revenue: $" + str(expected))`}
          hint="prob_a=0.6, rev_a=1000, prob_b=0.4, rev_b=200."
          validate={(output) => output.includes("680")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"distributions",phase:"Statistics",emoji:"📈",color:"#fbbf24",title:"Statistical Distributions",subtitle:"Normal, Binomial, Poisson — and why they matter for ML",
   body:()=>(
    <LessonWrapper id="distributions" color="#fbbf24">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Normal Distribution","Z-scores","✓ Quiz","Binomial","CLT","Skewness","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fbbf24":"transparent",border:`2px solid ${i===0?"#fbbf24":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#fbbf24":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#fbbf24" title="Why distributions matter">Every ML algorithm makes assumptions about how data is distributed. Linear regression assumes normal errors. Logistic regression outputs Bernoulli probabilities. Knowing distributions helps you choose the right model and debug wrong ones.</Callout>

      {/* ══ PART 1: NORMAL & Z-SCORES ══ */}
      <div style={{background:"#fbbf2408",border:"1px solid #fbbf2420",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fbbf24",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — NORMAL DISTRIBUTION & Z-SCORES</div>
        <LH>The normal distribution — the most important shape in statistics</LH>
        <LP>The bell curve describes many natural phenomena. It is defined by just two numbers: mean (center) and standard deviation (spread).</LP>
        <Block label="Try changing mu and sigma — watch the bell curve shift">{`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
mu, sigma = 65, 15
data = np.random.normal(mu, sigma, 1000)

plt.figure(figsize=(8, 4))
plt.hist(data, bins=40, density=True, alpha=0.7, color='#818cf8', edgecolor='#1e1a3a')
plt.axvline(mu, color='#f7c96e', linewidth=2, label='Mean=' + str(mu))
plt.axvline(mu-sigma, color='#f28b82', linewidth=1, linestyle='--', label='-1 std')
plt.axvline(mu+sigma, color='#f28b82', linewidth=1, linestyle='--', label='+1 std')
plt.title('Normal Distribution N(' + str(mu) + ', ' + str(sigma) + ')')
plt.legend()
plt.tight_layout()
plt.show()

# The 68-95-99.7 rule:
print("68% of data is between:", mu-sigma, "and", mu+sigma)
print("95% of data is between:", mu-2*sigma, "and", mu+2*sigma)`}</Block>
        <Tip>The 68-95-99.7 rule is fundamental. Memorize it: 68% within 1σ, 95% within 2σ, 99.7% within 3σ. This is how you know whether a value is "normal" or an outlier.</Tip>

        <LH>Z-scores — standardizing to a common scale</LH>
        <Block label="Try computing z-scores manually — what does z=-2.5 mean?">{`import numpy as np

# Z-score = (value - mean) / std
# Answers: "how many standard deviations from the mean?"
# After z-scoring: mean=0, std=1

data = np.array([42, 58, 65, 71, 90, 105])
z_scores = (data - data.mean()) / data.std()

for val, z in zip(data, z_scores):
    print("Value:", val, "  Z-score:", round(z, 2))

# Detect outliers: |z| > 3 means likely outlier
outliers = data[np.abs(z_scores) > 1.5]
print("Unusual values:", outliers)

# Used in ML: StandardScaler does exactly this
# from sklearn.preprocessing import StandardScaler`}</Block>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fbbf24",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"68% of data falls within what range for N(50, 10)?",options:["40 to 60","30 to 70","45 to 55","20 to 80"],answer:"40 to 60",explanation:"68% falls within 1 standard deviation of the mean. Mean=50, std=10: 50-10=40 to 50+10=60."},
          {q:"A z-score of -2.5 means:",options:["2.5 units below mean","2.5 standard deviations below the mean","In the bottom 2.5%","A negative value"],answer:"2.5 standard deviations below the mean",explanation:"Z = (value - mean) / std. Z=-2.5 means 2.5 standard deviations below the mean — roughly the bottom 1% of the distribution."},
          {q:"The Central Limit Theorem says:",options:["All data is normal","Large datasets are always normal","Sample means approach normal distribution as sample size grows","Standard deviation decreases with more data"],answer:"Sample means approach normal distribution as sample size grows",explanation:"CLT: regardless of population distribution, the distribution of sample means approaches normal as n grows (n ≥ 30 is typically enough)."},
        ]}/>
      </div>

      {/* ══ PART 2: BINOMIAL, CLT, SKEWNESS ══ */}
      <div style={{background:"#fbbf2408",border:"1px solid #fbbf2420",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fbbf24",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — BINOMIAL, CLT & SKEWNESS</div>
        <LH>Binomial distribution — counting successes</LH>
        <Block label="Try changing n and p — see how expected churners changes">{`import numpy as np
import matplotlib.pyplot as plt

# Binomial(n, p): n trials, p = probability of success per trial
# "How many out of 100 customers will churn?"
n = 100       # 100 new customers
p = 0.265     # 26.5% churn rate

# Expected churners = n x p
expected = n * p
std_dev  = np.sqrt(n * p * (1-p))
print("Expected churners:", round(expected, 1))
print("Std deviation:    ", round(std_dev, 1))

# Simulate 1000 batches of 100 customers
results = np.random.binomial(n, p, 1000)
plt.hist(results, bins=20, color='#fbbf24', alpha=0.8)
plt.axvline(expected, color='#f28b82', linewidth=2, label='Expected=' + str(round(expected,1)))
plt.title('Distribution of Churners per 100 Customers')
plt.xlabel('Number who churn')
plt.legend()
plt.show()`}</Block>

        <LH>The Central Limit Theorem — why statistics works</LH>
        <Block label="Run this — the original data is skewed but sample means are normal">{`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
# Non-normal original data
data = np.random.exponential(scale=2, size=5000)

# Take 1000 samples of 30 and compute their means
sample_means = [np.mean(np.random.choice(data, 30)) for _ in range(1000)]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.hist(data, bins=50, color='#f28b82', alpha=0.8)
ax1.set_title('Original data (right-skewed)')
ax2.hist(sample_means, bins=50, color='#6dd6a0', alpha=0.8)
ax2.set_title('Sample means (normal!)')
plt.tight_layout()
plt.show()

print("Original skewness:", round(float(np.mean(((data - data.mean())/data.std())**3)), 2))
print("Means skewness:   ", round(float(np.mean(((np.array(sample_means)-np.mean(sample_means))/np.std(sample_means))**3)), 2))`}</Block>
        <Tip>CLT is why t-tests and confidence intervals work even on non-normal data, as long as n ≥ 30. It is one of the most powerful results in all of statistics.</Tip>

        <LH>Skewness — and how to fix it</LH>
        <Block label="Log transform reduces right skew — try it">{`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
# Right-skewed data (like salaries, revenue, charges)
skewed = np.random.exponential(scale=50, size=500)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.hist(skewed, bins=40, color='#f28b82', alpha=0.8)
ax1.set_title('Original (skewed) — skew: ' + str(round(float(np.mean(((skewed-skewed.mean())/skewed.std())**3)),1)))

log_data = np.log1p(skewed)
ax2.hist(log_data, bins=40, color='#6dd6a0', alpha=0.8)
ax2.set_title('After log transform — much more normal')
plt.tight_layout()
plt.show()`}</Block>
        <Callout icon="★" color="#f7c96e" title="When to log-transform" type="gold">Apply log transform when: (1) skewness > 1 or &lt; -1, (2) data has a long tail on one side, (3) you are using a model that assumes normality (linear regression, LDA). Always use <code style={{background:"#2a1a00",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f7c96e"}}>np.log1p()</code> to handle zero values safely.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fbbf24",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"You have right-skewed data (salary). What transformation helps?",options:["Squaring the values","Subtracting the mean","Log transformation","Adding the median"],answer:"Log transformation",explanation:"Log compresses the right tail, making skewed data more symmetric. np.log1p() handles zero values."},
          {q:"Binomial(100, 0.1) models what?",options:["100 trials, 10% success each","10 trials with 100% success","Success after 100 failures","100% probability of 10 successes"],answer:"100 trials, 10% success each",explanation:"Binomial(n, p) = n independent trials, each with probability p of success."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Sample from a normal distribution"
          description="Generate 1000 samples with mean=50, std=10, then print the sample mean and std."
          starterCode={`import numpy as np
np.random.seed(42)

# Generate 1000 samples — mean=50, std=10
samples = np.random.normal(loc=___, scale=___, size=___)

# Print sample mean (rounded to 1 decimal)
print(round(np.___(samples), 1))

# Print sample std (rounded to 1 decimal)
print(round(np.___(samples), 1))`}
          hint="np.random.normal(loc=50, scale=10, size=1000). np.mean() and np.std()."
          validate={(output) => { const lines=output.trim().split("\n"); const m=parseFloat(lines[0]); const s=parseFloat(lines[1]); return m>48&&m<52&&s>9&&s<11; }}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"correlation",phase:"Statistics",emoji:"🔗",color:"#2dd4bf",title:"Correlation & Causation",subtitle:"The mistake that gets candidates eliminated in interviews",
   body:()=>(
    <LessonWrapper id="correlation" color="#2dd4bf">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Pearson Correlation","Spearman","✓ Quiz","Causation Traps","Confounders","Feature Selection","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#2dd4bf":"transparent",border:`2px solid ${i===0?"#2dd4bf":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#2dd4bf":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#2dd4bf" title="The most common statistical mistake">Correlation does not imply causation. Every DS interview tests whether you understand this. Getting it wrong in front of a stakeholder is career-limiting.</Callout>

      {/* ══ PART 1: CORRELATION TYPES ══ */}
      <div style={{background:"#2dd4bf08",border:"1px solid #2dd4bf20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#2dd4bf",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — MEASURING CORRELATION</div>
        <LH>Pearson correlation — the standard measure</LH>
        <Block label="Try changing the data — what makes r close to 1 or -1?">{`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
n = 100

# Strong positive correlation
x = np.random.normal(50, 10, n)
y_pos = x * 1.5 + np.random.normal(0, 5, n)

# Strong negative correlation
y_neg = -x * 1.2 + np.random.normal(0, 5, n)

# No correlation
y_none = np.random.normal(50, 15, n)

# Compute Pearson r
r_pos  = np.corrcoef(x, y_pos)[0,1]
r_neg  = np.corrcoef(x, y_neg)[0,1]
r_none = np.corrcoef(x, y_none)[0,1]

print("r (positive): " + str(round(r_pos, 2)))   # ~0.94
print("r (negative): " + str(round(r_neg, 2)))   # ~-0.92
print("r (none):     " + str(round(r_none, 2)))  # ~0.00

# Interpretation guide:
# |r| < 0.3  = weak
# |r| 0.3-0.7 = moderate
# |r| > 0.7  = strong`}</Block>
        <Warn>Pearson r only measures <strong>linear</strong> relationships. Two variables can have r=0 and still have a strong non-linear relationship. Always plot your data before trusting the number.</Warn>

        <LH>Pearson vs Spearman — when to use which</LH>
        <Block label="Try adding an outlier — see how Pearson changes but Spearman stays stable">{`import numpy as np

np.random.seed(42)
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = np.array([2, 4, 5, 4, 5, 7, 8, 9, 10, 100])  # outlier at end!

# Pearson — sensitive to outliers
r_pearson = np.corrcoef(x, y)[0,1]

# Spearman — rank-based, robust to outliers
from scipy.stats import spearmanr
r_spear, _ = spearmanr(x, y)

print("Pearson:  " + str(round(r_pearson, 3)))  # distorted by outlier
print("Spearman: " + str(round(r_spear, 3)))    # more stable`}</Block>
        <Tip>Use Spearman when: data has outliers, data is skewed, or the relationship is monotonic but not linear. Use Pearson for clean, normally distributed data.</Tip>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#2dd4bf",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"Pearson r = 0.02 between two variables. What does this mean?",options:["Strong positive relationship","Perfect independence","Weak or no LINEAR relationship","Weak negative relationship"],answer:"Weak or no LINEAR relationship",explanation:"Pearson r only measures linear relationships. r=0.02 means no linear relationship — but a strong non-linear relationship could still exist. Always plot."},
          {q:"Spearman correlation is preferred over Pearson when:",options:["Data is perfectly normal","You need higher precision","Data has outliers or non-linear monotonic relationship","Sample size is large"],answer:"Data has outliers or non-linear monotonic relationship",explanation:"Spearman uses ranks instead of raw values — robust to outliers and non-linear monotonic relationships."},
          {q:"A study finds ice cream sales correlate with drowning deaths (r=0.85). Most likely explanation?",options:["Ice cream causes drowning","Drowning causes ice cream sales","A confounding variable (summer heat) causes both","The correlation is meaningless"],answer:"A confounding variable (summer heat) causes both",explanation:"Summer causes both ice cream sales AND more swimming (which increases drowning risk). Heat is the confounder. Classic correlation without causation."},
        ]}/>
      </div>

      {/* ══ PART 2: CAUSATION & FEATURE SELECTION ══ */}
      <div style={{background:"#2dd4bf08",border:"1px solid #2dd4bf20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#2dd4bf",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — CAUSATION & PRACTICAL USE</div>
        <LH>Three ways correlation misleads</LH>
        <div style={{display:"grid",gap:10,margin:"12px 0"}}>
          {[
            {title:"Confounding variable",color:"#f28b82",example:"Ice cream & drowning both caused by summer heat. Remove season — correlation disappears."},
            {title:"Reverse causation",color:"#f7c96e",example:"'Hospitals cause death' — sick people go to hospitals, not the other way around."},
            {title:"Spurious correlation",color:"#a78bfa",example:"Nicolas Cage movies correlate with pool drownings. Pure coincidence with unrelated time trends."},
          ].map((item,i)=>(
            <div key={i} style={{background:"#0d1520",borderRadius:8,padding:"12px 14px",borderLeft:"3px solid "+item.color}}>
              <div style={{color:item.color,fontWeight:700,fontSize:12,marginBottom:4}}>{item.title}</div>
              <div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{item.example}</div>
            </div>
          ))}
        </div>
        <Callout icon="🧠" color="#2dd4bf" title="To prove causation you need">A randomized controlled experiment (A/B test) — OR — careful statistical control for ALL potential confounders. Correlation alone never proves causation, no matter how high r is.</Callout>

        <LH>Correlation in feature selection</LH>
        <Block label="Try lowering the threshold — what features get added?">{`import numpy as np
import pandas as pd

np.random.seed(42)
n = 100
tenure   = np.random.randint(1, 73, n)
charges  = 20 + tenure * 0.3 + np.random.normal(0, 15, n)
calls    = np.maximum(0, 6 - tenure*0.1 + np.random.normal(0,1,n)).astype(int)
churn    = ((charges > 70) | (calls > 4)).astype(int)

df = pd.DataFrame({'tenure':tenure,'monthly_charges':charges,'support_calls':calls,'churn':churn})

# High correlation with target = good predictor
target_corr = df.corr()['churn'].drop('churn').abs().sort_values(ascending=False)
print("Correlation with churn:")
print(target_corr.round(3))

# High correlation between features = multicollinearity problem
print("\nFeature-feature correlations:")
print(df[['tenure','monthly_charges','support_calls']].corr().round(2))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Multicollinearity" type="gold">When two features are highly correlated with each other (r > 0.8), they carry redundant information. Including both can destabilize coefficients in linear models. Solution: drop one, use PCA, or check VIF.</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#2dd4bf",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Feature A has r=0.75 with target AND r=0.90 with feature B. What is the concern?",options:["A is too important","B should be removed","Multicollinearity — A and B carry redundant information","No concern"],answer:"Multicollinearity — A and B carry redundant information",explanation:"High correlation between features means they carry the same signal. This inflates feature importance and destabilizes coefficients in linear models."},
          {q:"You find fiber customers churn more. To claim 'fiber CAUSES churn' you need:",options:["Correlation above 0.7","p-value below 0.05","A controlled experiment (A/B test) or controlling for all confounders","More data"],answer:"A controlled experiment (A/B test) or controlling for all confounders",explanation:"Correlation never proves causation. Fiber customers may differ in other ways (price, region, tenure). To claim causation you need an experiment or full confounder control."},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Find the most correlated feature"
          description="Compute a correlation matrix and find which feature correlates most with churn_score."
          starterCode={`import pandas as pd

data = {
    'tenure':         [1, 24, 6, 36, 3, 48],
    'monthly_charge': [80, 50, 75, 45, 85, 40],
    'support_calls':  [5, 1, 4, 1, 6, 0],
    'churn_score':    [0.9, 0.2, 0.7, 0.1, 0.85, 0.05]
}
df = pd.DataFrame(data)

# 1. Correlation matrix rounded to 2 decimals
print(df.___().round(2))

# 2. Feature most correlated with churn_score (excluding churn_score itself)
corr = df.corr()[___].drop(___).abs()
print(corr.idxmax())`}
          hint="df.corr(). corr()['churn_score'].drop('churn_score').abs().idxmax()."
          validate={(output) => output.includes("support_calls") || output.includes("tenure")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},
  {id:"inference",phase:"Statistics",emoji:"🧪",color:"#f87171",title:"Statistical Inference & A/B Testing",subtitle:"Make data-driven decisions with confidence",
   body:()=>(
    <LessonWrapper id="inference" color="#f87171">
      <div>

      {/* ── PROGRESS STEPS ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Hypothesis Testing","p-values","✓ Quiz","t-test & Chi²","A/B Testing","Sample Size","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f87171":"transparent",border:`2px solid ${i===0?"#f87171":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f87171":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f87171" title="Why this matters">Every A/B test at every tech company uses statistical inference. 'Is the new feature better?' cannot be answered by gut feel — it requires a hypothesis test. This is one of the most practically useful lessons in the entire course.</Callout>

      {/* ══ PART 1: HYPOTHESIS TESTING ══ */}
      <div style={{background:"#f8717108",border:"1px solid #f8717120",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f87171",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 4 — HYPOTHESIS TESTING FRAMEWORK</div>
        <LH>The 5-step process — memorize this</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",title:"State the hypotheses",desc:"H0 (null): no effect — the boring default. H1 (alternative): there IS an effect.",color:"#7eb8f7"},
            {n:"02",title:"Choose significance level α",desc:"Usually α = 0.05. This is your tolerance for false positives (5%).",color:"#6dd6a0"},
            {n:"03",title:"Collect data and compute test statistic",desc:"The test statistic measures how far your result is from the null hypothesis.",color:"#f7c96e"},
            {n:"04",title:"Compute the p-value",desc:"Probability of seeing your results (or more extreme) if H0 were true.",color:"#f472b6"},
            {n:"05",title:"Decision: p < α → reject H0",desc:"Low p means the result is unlikely under H0. High p means we cannot reject H0.",color:"#a78bfa"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${item.color}22`}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:item.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:item.color,fontWeight:700}}>{item.n}</div>
              <div><div style={{color:item.color,fontWeight:700,fontSize:12,marginBottom:3}}>{item.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{item.desc}</div></div>
            </div>
          ))}
        </div>
        <Callout icon="🧠" color="#f87171" title="What p-value ACTUALLY means">p = 0.03 means: if there were truly no effect (H0 is true), you would see results this extreme only 3% of the time. Low p → the data is unlikely under H0 → reject H0. It does NOT mean 97% chance the effect is real.</Callout>
      </div>

      {/* ══ MID-LESSON QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f87171",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"p-value = 0.03 with α = 0.05. What do you conclude?",options:["Accept H0","Reject H0 — statistically significant","The effect is practically significant","You need more data"],answer:"Reject H0 — statistically significant",explanation:"p < α → reject H0. p=0.03 means only 3% chance of seeing these results if H0 were true — unlikely enough to reject."},
          {q:"An A/B test shows 0.1% improvement with p=0.001. Should you ship?",options:["Yes — p < 0.05","Maybe — statistical significance doesn't mean practical significance","No — p too low","Always ship significant results"],answer:"Maybe — statistical significance doesn't mean practical significance",explanation:"Statistical significance means the effect is real. But 0.1% improvement may not justify engineering cost. Always evaluate both statistical AND practical significance."},
          {q:"You run 20 A/B tests and report the one with p < 0.05. What's wrong?",options:["Nothing","P-hacking — 1 significant result by chance in 20 tests is expected","You need more tests","Sample size is wrong"],answer:"P-hacking — 1 significant result by chance in 20 tests is expected",explanation:"With α=0.05, you expect 1 false positive per 20 tests by chance. Cherry-picking inflates false positive rate. Use Bonferroni correction."},
        ]}/>
      </div>

      {/* ══ PART 2: TESTS & A/B ══ */}
      <div style={{background:"#f8717108",border:"1px solid #f8717120",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f87171",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 4 — COMMON TESTS & A/B TESTING</div>
        <LH>t-test — comparing two means</LH>
        <Block label="Try changing the group sizes — watch the p-value change">{`import numpy as np
from scipy import stats

np.random.seed(42)
# Do churned customers pay different monthly charges?
churned  = np.random.normal(74, 20, 200)   # simulated churned charges
retained = np.random.normal(61, 22, 500)   # simulated retained charges

t_stat, p_value = stats.ttest_ind(churned, retained)
print("Churned mean:  $" + str(round(churned.mean(), 2)))
print("Retained mean: $" + str(round(retained.mean(), 2)))
print("t-statistic:   " + str(round(t_stat, 3)))
print("p-value:       " + str(round(p_value, 6)))

if p_value < 0.05:
    print("REJECT H0 — significant difference in charges")
else:
    print("FAIL TO REJECT H0")`}</Block>

        <LH>Full A/B test — the industry workflow</LH>
        <Block label="This is the exact workflow used at tech companies">{`import numpy as np
from scipy import stats

# Scenario: new onboarding flow
# Control:   1000 users, 245 churned (24.5%)
# Treatment: 1000 users, 198 churned (19.8%)
n_c, churn_c = 1000, 245
n_t, churn_t = 1000, 198

rate_c = churn_c / n_c
rate_t = churn_t / n_t

print("Control rate:   " + str(round(rate_c*100,1)) + "%")
print("Treatment rate: " + str(round(rate_t*100,1)) + "%")
print("Absolute reduction: " + str(round((rate_c-rate_t)*100,1)) + "pp")
print("Relative reduction: " + str(round((rate_c-rate_t)/rate_c*100,1)) + "%")

# Proportions z-test
count = np.array([churn_t, churn_c])
nobs  = np.array([n_t, n_c])
z_stat, p_value = stats.proportions_ztest(count, nobs, alternative='smaller')

print("z-statistic: " + str(round(z_stat, 3)))
print("p-value:     " + str(round(p_value, 4)))
print("Significant:", p_value < 0.05)`}</Block>
        <Callout icon="⚠️" color="#f28b82" title="4 A/B testing mistakes that get DSs fired" type="warn">1. Stopping early when you see significance (p-hacking). 2. Running multiple tests, reporting the best p-value. 3. Not calculating required sample size BEFORE starting. 4. Confusing statistical significance (real effect) with practical significance (worth doing).</Callout>
      </div>

      {/* ══ FINAL QUIZ ══ */}
      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f87171",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"What does statistical power mean?",options:["Strength of the p-value","Probability of detecting a real effect when it exists","Size of your dataset","Confidence in your sample"],answer:"Probability of detecting a real effect when it exists",explanation:"Power = 1 - β. Power=0.80 means if there IS a real effect, you have 80% chance of detecting it. Low power = miss real effects."},
          {q:"Chi-square test is used for:",options:["Comparing two means","Testing independence between two categorical variables","Testing normality","Comparing variances"],answer:"Testing independence between two categorical variables",explanation:"Chi-square test of independence checks whether two categorical variables are related. Example: 'Is contract type related to churn status?'"},
        ]}/>
      </div>

      {/* ══ CHALLENGE ══ */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Evaluate an A/B test"
          description="Compute conversion rates, uplift %, and decide whether to launch."
          starterCode={`control_converts = 120
control_users    = 1000
test_converts    = 150
test_users       = 1000

# 1. Conversion rates
control_rate = ___ / ___
test_rate    = ___ / ___

# 2. Relative uplift %
uplift = ((test_rate - control_rate) / ___) * 100

print("Control: " + str(round(control_rate*100,1)) + "%")
print("Test:    " + str(round(test_rate*100,1)) + "%")
print("Uplift:  " + str(round(uplift, 1)) + "%")
print("Launch:  " + str(uplift > ___))`}
          hint="control_rate=120/1000. uplift=(test_rate-control_rate)/control_rate*100. Launch if uplift > 10."
          validate={(output) => output.includes("25.0") && output.includes("True")}
        />
      </div>

    </div>
    </LessonWrapper>
  )},

];

const FOUNDATION_LESSONS = [

  // ── PYTHON CORE 1: Variables, Loops, Functions
  {id:"pycore-basics", phase:"Python Core", emoji:"🐍", color:"#4ade80", title:"Python Basics", subtitle:"Variables, loops, functions — the building blocks of everything",
   body:()=>(
    <div>
      <LP>Python is the language of data science. Before NumPy, Pandas, or ML — you need to think like Python. This lesson covers the core building blocks you'll use every single day.</LP>
      <Callout icon="🧠" color="#4ade80" title="The goal">You don't need to master every Python feature. You need to write clean, readable code that does what you intend. Focus on understanding, not memorizing.</Callout>

      <LH>1. Variables and Data Types</LH>
      <Block label="The 5 types you'll use constantly">{`# Numbers
age = 25          # int
price = 19.99     # float

# Strings
name = "Ahmed"
city = 'Beirut'   # single or double quotes both work

# Boolean
is_active = True
is_churned = False

# None — represents "no value" (like NULL in SQL)
result = None

# Check type
print(type(age))    # <class 'int'>
print(type(name))   # <class 'str'>
print(type(None))   # <class 'NoneType'>

# Type conversion
str(42)       # "42"
int("7")      # 7
float("3.14") # 3.14
bool(0)       # False — 0, "", [], None are all falsy`}</Block>

      <LH>2. Lists — ordered, mutable collections</LH>
      <Block label="Lists">{`scores = [85, 92, 78, 95, 88]

# Access
scores[0]    # 85 — first element
scores[-1]   # 88 — last element
scores[1:3]  # [92, 78] — slice (end not included)

# Modify
scores.append(91)        # add to end
scores.insert(0, 100)    # insert at index
scores.remove(78)        # remove by value
scores.pop()             # remove and return last item

# Useful operations
len(scores)      # length
sorted(scores)   # returns new sorted list
scores.sort()    # sorts in place
sum(scores)      # 529
max(scores)      # 95
min(scores)      # 85

# Check membership
88 in scores     # True`}</Block>

      <LH>3. Dictionaries — key-value pairs</LH>
      <Block label="Dictionaries">{`customer = {
    "name": "Sara",
    "age": 28,
    "plan": "premium",
    "active": True
}

# Access
customer["name"]           # "Sara"
customer.get("email", "")  # "" — safe access with default

# Modify
customer["email"] = "sara@mail.com"  # add key
customer["age"] = 29                 # update value
del customer["active"]               # delete key

# Iterate
for key, value in customer.items():
    print(f"{key}: {value}")

# Check key exists
"name" in customer    # True
"phone" in customer   # False

# Dictionary from two lists
keys   = ["a", "b", "c"]
values = [1, 2, 3]
d = dict(zip(keys, values))  # {"a":1, "b":2, "c":3}`}</Block>

      <LH>4. Loops</LH>
      <Block label="For and while loops">{`# For loop — iterate over a sequence
scores = [85, 92, 78, 95]
for score in scores:
    print(score)

# Range — generate numbers
for i in range(5):        # 0,1,2,3,4
    print(i)

for i in range(2, 10, 2): # 2,4,6,8
    print(i)

# Enumerate — index + value
for i, score in enumerate(scores):
    print(f"Student {i}: {score}")

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# Loop control
for score in scores:
    if score < 80:
        continue    # skip this iteration
    if score == 95:
        break       # exit loop entirely
    print(score)`}</Block>
      <Tip>In data science you rarely write explicit loops — NumPy and Pandas handle them faster internally. But understanding loops is essential for writing custom logic and debugging.</Tip>

      <LH>5. Functions</LH>
      <Block label="Defining and using functions">{`# Basic function
def greet(name):
    return f"Hello, {name}!"

greet("Ahmed")   # "Hello, Ahmed!"

# Default arguments
def power(base, exponent=2):
    return base ** exponent

power(3)     # 9  (uses default exponent=2)
power(3, 3)  # 27

# Multiple return values
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([5, 2, 8, 1, 9])
print(low, high)  # 1 9

# *args — variable number of arguments
def total(*args):
    return sum(args)

total(1, 2, 3)         # 6
total(10, 20, 30, 40)  # 100

# Real DS example
def calculate_churn_rate(total_customers, churned_customers):
    if total_customers == 0:
        return 0
    return round(churned_customers / total_customers * 100, 2)

calculate_churn_rate(1000, 73)  # 7.3`}</Block>

      <LH>6. Error Handling</LH>
      <Block label="Try/except">{`# Without error handling — crashes everything
# result = 10 / 0   # ZeroDivisionError!

# With error handling
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

safe_divide(10, 2)  # 5.0
safe_divide(10, 0)  # None — no crash

# Multiple exceptions
def parse_number(text):
    try:
        return int(text)
    except ValueError:
        return None
    except TypeError:
        return None

parse_number("42")    # 42
parse_number("abc")   # None
parse_number(None)    # None`}</Block>

      <Quiz questions={[
        {q:"What does customer.get('phone', 'N/A') return if 'phone' key doesn't exist?",options:["None","KeyError","'N/A'","False"],answer:"'N/A'",explanation:"dict.get(key, default) safely returns the default value if the key doesn't exist, instead of raising a KeyError. This is the safe way to access dictionary values."},
        {q:"scores = [85,92,78]. What does scores[-1] return?",options:["85","92","78","IndexError"],answer:"78",explanation:"Negative indexing counts from the end. -1 is the last element, -2 is second to last, etc. scores[-1] returns 78."},
        {q:"range(1, 10, 3) produces:",options:["[1,2,3,4,5,6,7,8,9]","[1,4,7]","[3,6,9]","[1,3,6,9]"],answer:"[1,4,7]",explanation:"range(start, stop, step) — starts at 1, adds 3 each time, stops before 10. So: 1, 4, 7."},
        {q:"What's the difference between .sort() and sorted()?",options:["No difference","sorted() is faster","sort() modifies the list in-place; sorted() returns a new list","sorted() only works on numbers"],answer:"sort() modifies the list in-place; sorted() returns a new list",explanation:"list.sort() modifies the original list and returns None. sorted(list) leaves the original unchanged and returns a new sorted list. In data science, you usually want sorted() to avoid side effects."},
        {q:"bool(0), bool(''), bool([]) all return:",options:["True","False","None","Error"],answer:"False",explanation:"In Python, 0, empty string '', empty list [], empty dict {}, and None are all 'falsy' — they evaluate to False in a boolean context. Everything else is truthy."},
      ]}/>

      <CodeExercise
        title="Analyze student scores with functions"
        description="Write a function that takes a list of scores and returns a dict with 'mean', 'highest', 'lowest', and 'passed' (count of scores >= 60). Then call it and print each value."
        starterCode={`def analyze_scores(scores):
    return {
        "mean":    round(sum(scores) / ___, 1),
        "highest": ___,
        "lowest":  ___,
        "passed":  len([s for s in scores if s >= ___])
    }

results = analyze_scores([72, 45, 88, 91, 55, 63, 79, 42, 95, 68])

for key, value in results.___():
    print(f"{key}: {value}")`}
        hint="len(scores) for mean. max(scores), min(scores). s >= 60. results.items()."
        validate={(out)=>out.includes("mean:")&&out.includes("passed:")&&out.includes("7")}
      />
    </div>
  )},

  // ── PYTHON CORE 2: List Comprehensions, File I/O, Classes
  {id:"pycore-advanced", phase:"Python Core", emoji:"⚡", color:"#4ade80", title:"Python Intermediate", subtitle:"Comprehensions, file I/O, classes, and clean code patterns",
   body:()=>(
    <div>
      <LP>Once you know the basics, these patterns will make your code 10x cleaner and faster to write. List comprehensions and file I/O show up constantly in real DS work.</LP>
      <Callout icon="🧠" color="#4ade80" title="The mindset">Good Python code reads almost like English. If your code is hard to read, it's probably not Pythonic. Aim for clarity first, cleverness never.</Callout>

      <LH>1. List Comprehensions — the Python superpower</LH>
      <Block label="Transform lists in one line">{`# Standard loop version
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
# [1, 4, 9, 16, 25]

# Comprehension version — same result, one line
squares = [x ** 2 for x in range(1, 6)]

# With condition (filter)
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Real DS example: clean a list of prices
raw_prices = ["$12.50", "$8.99", "$24.00", "$5.75"]
prices = [float(p.replace("$", "")) for p in raw_prices]
# [12.5, 8.99, 24.0, 5.75]

# Filter and transform together
high_scores = [s * 1.1 for s in [72,45,88,91,55] if s >= 60]
# [79.2, 96.8, 100.1]`}</Block>

      <LH>2. Dictionary Comprehensions</LH>
      <Block label="Build dicts in one line">{`# Map student names to their scores
names  = ["Ahmed", "Sara", "Omar"]
scores = [88, 92, 75]

grade_book = {name: score for name, score in zip(names, scores)}
# {"Ahmed": 88, "Sara": 92, "Omar": 75}

# Filter: only passing students
passing = {name: score for name, score in grade_book.items() if score >= 80}
# {"Ahmed": 88, "Sara": 92}

# Real DS: encode binary column
churn_map = {"Yes": 1, "No": 0}
raw = ["Yes","No","Yes","Yes","No"]
encoded = {i: churn_map[v] for i, v in enumerate(raw)}
# {0:1, 1:0, 2:1, 3:1, 4:0}`}</Block>

      <LH>3. Lambda Functions — quick one-liners</LH>
      <Block label="Lambda">{`# Regular function
def double(x):
    return x * 2

# Lambda equivalent
double = lambda x: x * 2

# Where lambdas shine — as arguments to other functions
prices = [12.5, 8.99, 24.0, 5.75]

# Sort by price descending
sorted(prices, key=lambda x: -x)

# Sort list of dicts by a field
customers = [
    {"name": "Ahmed", "spend": 1200},
    {"name": "Sara",  "spend": 850},
    {"name": "Omar",  "spend": 2100},
]
sorted(customers, key=lambda c: c["spend"], reverse=True)
# Omar, Ahmed, Sara`}</Block>

      <LH>4. File I/O — reading and writing data</LH>
      <Block label="Working with files">{`# Read a file
with open("data.txt", "r") as f:
    content = f.read()         # whole file as string
    
with open("data.txt", "r") as f:
    lines = f.readlines()      # list of lines

# Write a file
with open("output.txt", "w") as f:
    f.write("Hello, data science!\n")

# Append to existing file
with open("log.txt", "a") as f:
    f.write("New log entry\n")

# Read a CSV manually (before pandas)
import csv
with open("customers.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["monthly_charges"])

# Write CSV
data = [{"name":"Ahmed","score":88}, {"name":"Sara","score":92}]
with open("results.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name","score"])
    writer.writeheader()
    writer.writerows(data)`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="Always use 'with'">The with statement automatically closes files even if an error occurs. Never use open() without with — you'll leak file handles.</Callout>

      <LH>5. Classes — basics only</LH>
      <Block label="Classes in data science context">{`# In DS you mainly USE classes (sklearn models, pandas DataFrames)
# But understanding the basics helps you read documentation

class DataCleaner:
    def __init__(self, df):
        self.df = df.copy()
        self.steps_applied = []
    
    def drop_nulls(self):
        self.df = self.df.dropna()
        self.steps_applied.append("drop_nulls")
        return self  # allows chaining
    
    def remove_duplicates(self):
        self.df = self.df.drop_duplicates()
        self.steps_applied.append("remove_duplicates")
        return self
    
    def get_shape(self):
        return self.df.shape

# Usage
import pandas as pd
df = pd.DataFrame({"a":[1,2,None,2], "b":[4,5,6,5]})

cleaner = DataCleaner(df)
cleaner.drop_nulls().remove_duplicates()
print(cleaner.get_shape())        # (2, 2)
print(cleaner.steps_applied)     # ['drop_nulls', 'remove_duplicates']`}</Block>

      <LH>6. Common Built-ins You'll Use Daily</LH>
      <Block label="Essential built-in functions">{`# zip — pair up two lists
names  = ["Ahmed", "Sara", "Omar"]
scores = [88, 92, 75]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# enumerate — index + value
for i, name in enumerate(names, start=1):
    print(f"{i}. {name}")

# map — apply function to every element
prices = [10, 20, 30]
doubled = list(map(lambda x: x*2, prices))  # [20, 40, 60]

# filter — keep elements matching condition
passing = list(filter(lambda x: x >= 80, scores))  # [88, 92]

# any / all — check conditions across a list
any([False, True, False])   # True — at least one
all([True, True, True])     # True — all must be true
any(s > 90 for s in scores) # True — Sara has 92`}</Block>

      <Quiz questions={[
        {q:"[x**2 for x in range(5) if x % 2 == 0] produces:",options:["[0,4,16]","[1,4,9,16]","[0,1,4,9,16]","[4,16]"],answer:"[0,4,16]",explanation:"range(5) is 0,1,2,3,4. Filter x%2==0 keeps 0,2,4. Square each: 0,4,16."},
        {q:"What does zip(['a','b'],[ 1,2]) produce?",options:["['a','b',1,2]","[('a',1),('b',2)]","{'a':1,'b':2}","Error"],answer:"[('a',1),('b',2)]",explanation:"zip pairs elements from multiple iterables into tuples. Commonly used with dict() to build dictionaries or with for loops to iterate two lists together."},
        {q:"Why use 'with open(file) as f:' instead of f = open(file)?",options:["It's faster","It automatically closes the file even if an error occurs","It reads the whole file at once","It only works for CSV files"],answer:"It automatically closes the file even if an error occurs",explanation:"The 'with' statement is a context manager. It guarantees the file is closed when the block exits, even if an exception is raised. This prevents resource leaks."},
        {q:"sorted(customers, key=lambda c: c['spend'], reverse=True) — what does this do?",options:["Modifies customers in place","Returns a new list sorted by spend descending","Filters customers with high spend","Sorts alphabetically"],answer:"Returns a new list sorted by spend descending",explanation:"sorted() returns a NEW list (original unchanged). key= specifies what to sort by. reverse=True sorts descending. lambda c: c['spend'] extracts the spend value from each dict."},
        {q:"all([True, True, False]) returns:",options:["True","False","None","Error"],answer:"False",explanation:"all() returns True only if every element is truthy. One False makes the whole thing False. any() would return True here since at least one element is True."},
      ]}/>

      <CodeExercise
        title="Clean a messy price list with comprehensions"
        description="Given raw price strings like '$12.50', use a list comprehension to extract floats, then compute total, average, and count of items over $10."
        starterCode={`raw = ["$12.50", "$8.99", "$24.00", "$5.75", "$18.40", "$3.20", "$15.00"]

# Step 1: comprehension to strip $ and convert to float
prices = [float(p.replace(___, "")) for p in raw]

# Step 2: stats
total   = round(sum(prices), 2)
average = round(sum(prices) / len(prices), 2)
over_10 = len([p for p in prices if p > ___])

print(f"Total: {total}")
print(f"Average: {average}")
print(f"Over 10+: {over_10}")`}
        hint="p.replace('$', ''). p > 10. len(prices) for average."
        validate={(out)=>out.includes("Total:")&&out.includes("Average:")&&out.includes("Over $10: 4")}
      />
    </div>
  )},

  // ── PYTHON CORE 3: Real DS Patterns
  {id:"pycore-ds-patterns", phase:"Python Core", emoji:"🔧", color:"#4ade80", title:"Python Patterns for DS", subtitle:"The coding patterns every data scientist uses daily",
   body:()=>(
    <div>
      <LP>These are the Python patterns you'll use in almost every data science project. Not syntax — patterns. The difference between someone who knows Python and someone who writes good Python.</LP>

      <LH>1. Working with JSON — the format of APIs and configs</LH>
      <Block label="JSON in Python">{`import json

# Parse JSON string → Python dict
raw = '{"name": "Ahmed", "score": 88, "passed": true}'
data = json.loads(raw)
print(data["name"])   # Ahmed
print(data["passed"]) # True

# Python dict → JSON string
result = {"accuracy": 0.92, "f1": 0.87, "model": "RandomForest"}
json_str = json.dumps(result, indent=2)
print(json_str)

# Read JSON file
with open("config.json", "r") as f:
    config = json.load(f)

# Write JSON file
with open("results.json", "w") as f:
    json.dump(result, f, indent=2)

# Real use: API response
import urllib.request
url = "https://api.example.com/data"
# response = json.loads(urllib.request.urlopen(url).read())`}</Block>

      <LH>2. String Formatting — clean output</LH>
      <Block label="f-strings and formatting">{`name = "Ahmed"
score = 88.5678
n = 1234567

# f-strings (Python 3.6+) — use these always
print(f"Student: {name}")
print(f"Score: {score:.2f}")      # 88.57 — 2 decimal places
print(f"Score: {score:.0f}%")     # 89%  — rounded, no decimals
print(f"Count: {n:,}")            # 1,234,567 — thousands separator
print(f"Hex:   {255:#x}")         # 0xff

# In data science reports
accuracy = 0.9234
print(f"Model accuracy: {accuracy:.1%}")  # 92.3%

# Multi-line f-string
report = f"""
=== Model Report ===
Student: {name}
Score:   {score:.1f}
Grade:   {'Pass' if score >= 60 else 'Fail'}
"""
print(report)`}</Block>

      <LH>3. Generators — memory-efficient iteration</LH>
      <Block label="Generators">{`# List — stores everything in memory
squares_list = [x**2 for x in range(1_000_000)]  # 8MB in memory!

# Generator — computes one at a time, tiny memory footprint
squares_gen = (x**2 for x in range(1_000_000))   # almost 0MB

# You iterate the same way
for sq in squares_gen:
    if sq > 100:
        break
    print(sq)

# Generator function — use yield
def chunk_data(data, chunk_size):
    """Yield data in chunks — useful for large datasets"""
    for i in range(0, len(data), chunk_size):
        yield data[i:i+chunk_size]

rows = list(range(1000))
for chunk in chunk_data(rows, 100):
    print(f"Processing {len(chunk)} rows...")`}</Block>

      <LH>4. *args and **kwargs — flexible functions</LH>
      <Block label="Variable arguments">{`# *args — any number of positional arguments
def log(*messages):
    for msg in messages:
        print(f"[LOG] {msg}")

log("Starting model training")
log("Epoch 1 done", "Epoch 2 done", "Training complete")

# **kwargs — any number of keyword arguments
def create_model(**params):
    print("Model params:")
    for key, val in params.items():
        print(f"  {key}: {val}")

create_model(n_estimators=100, max_depth=5, random_state=42)

# Real DS pattern: pass config to model
def train(model_class, X, y, **kwargs):
    model = model_class(**kwargs)
    model.fit(X, y)
    return model`}</Block>

      <LH>5. Common Patterns in Real DS Code</LH>
      <Block label="Patterns you'll see everywhere">{`import os
import time

# 1. Path handling
data_path = os.path.join("data", "raw", "customers.csv")
os.makedirs("outputs", exist_ok=True)  # create folder if not exists

# 2. Timing code
start = time.time()
# ... your expensive operation ...
elapsed = time.time() - start
print(f"Completed in {elapsed:.2f}s")

# 3. Unpacking
a, b, c = [1, 2, 3]
first, *rest = [10, 20, 30, 40]  # first=10, rest=[20,30,40]

# 4. Ternary expression
label = "churn" if prediction == 1 else "retain"

# 5. Default dict pattern (avoid KeyError)
from collections import defaultdict
counts = defaultdict(int)
for word in ["data", "science", "data", "python", "data"]:
    counts[word] += 1
# {"data":3, "science":1, "python":1}

# 6. Flatten a nested list
nested = [[1,2,3],[4,5],[6,7,8,9]]
flat = [x for sublist in nested for x in sublist]
# [1,2,3,4,5,6,7,8,9]`}</Block>

      <Callout icon="★" color="#f7c96e" title="Interview tip">f-strings, list comprehensions, zip, enumerate, and defaultdict come up constantly in DS coding interviews. Practice until they feel natural.</Callout>

      <Quiz questions={[
        {q:"f'{0.856:.1%}' outputs:",options:["0.856","85.6%","86%","0.9%"],answer:"85.6%",explanation:":.1% formats as percentage with 1 decimal place. Python multiplies by 100 and adds % sign automatically. 0.856 → 85.6%."},
        {q:"What's the key advantage of a generator over a list comprehension for large data?",options:["Generators are faster","Generators use much less memory — they compute one item at a time","Generators support more operations","Generators can be sorted"],answer:"Generators use much less memory — they compute one item at a time",explanation:"A list comprehension builds the entire list in memory. A generator yields one item at a time — perfect for large datasets where you can't load everything at once."},
        {q:"first, *rest = [10,20,30,40]. What is rest?",options:["[10]","[20,30,40]","20","[30,40]"],answer:"[20,30,40]",explanation:"*rest captures everything that doesn't match a named variable. first gets 10, rest collects the remainder [20,30,40]."},
        {q:"os.makedirs('outputs', exist_ok=True) — what does exist_ok=True do?",options:["Overwrites existing files","Prevents error if folder already exists","Creates parent folders too","Makes folder read-only"],answer:"Prevents error if folder already exists",explanation:"Without exist_ok=True, makedirs raises FileExistsError if the folder already exists. exist_ok=True silently ignores that — safe to call every time your script runs."},
        {q:"json.loads() vs json.load() — difference?",options:["No difference","loads() parses a string; load() reads from a file","load() is faster","loads() only works for arrays"],answer:"loads() parses a string; load() reads from a file",explanation:"loads() = load string. load() = load file object. Remember: loads has an 's' for string. The same pattern applies to json.dumps() (to string) vs json.dump() (to file)."},
      ]}/>

      <CodeExercise
        title="Parse and summarize a JSON dataset"
        description="Given a JSON string of students, parse it and use list comprehensions to: print the count of passing students (score >= 60), compute average score, and print names of top scorers (score >= 90)."
        starterCode={`import json

raw = '[{"name":"Ahmed","score":88},{"name":"Sara","score":92},{"name":"Omar","score":45},{"name":"Lina","score":95},{"name":"Karim","score":58},{"name":"Nour","score":71}]'

# Step 1: parse JSON
students = json.___(raw)

# Step 2: count passing (score >= 60)
passing = len([s for s in students if s[___] >= 60])

# Step 3: average score
avg = round(sum(s['score'] for s in students) / len(students), 1)

# Step 4: top scorers (>= 90)
top = [s[___] for s in students if s['score'] >= 90]

print(f"Passing: {passing}")
print(f"Average: {avg}")
print(f"Top scorers: {top}")`}
        hint="json.loads(). s['score']. s['name']. len([...]) for passing count."
        validate={(out)=>out.includes("Passing: 4")&&out.includes("Average:")&&out.includes("Top scorers:")}
      />
    </div>
  )},

  // ── LINEAR ALGEBRA 1: Vectors and Matrices
  {id:"linalg-vectors", phase:"Linear Algebra", emoji:"📐", color:"#e879f9", title:"Vectors & Matrices", subtitle:"The math behind every ML model — visually explained",
   body:()=>(
    <div>
      <LP>Linear algebra is the language ML is written in. Every time sklearn fits a model, it's doing matrix operations. You don't need to be a mathematician — you need the intuition and the NumPy code.</LP>
      <Callout icon="🧠" color="#e879f9" title="Watch this first">Before reading this lesson, watch 3Blue1Brown's 'Essence of Linear Algebra' chapters 1-3 on YouTube. 30 minutes. It will make everything here click visually.</Callout>

      <LH>1. Vectors — what they really are</LH>
      <LP>A vector is a list of numbers. In data science, each row of your dataset is a vector — a point in N-dimensional space where N is the number of features.</LP>
      <Block label="Vectors in NumPy">{`import numpy as np

# A customer described by 3 features
customer = np.array([35, 75.5, 24])  # [age, monthly_charge, tenure]

# Vector properties
print(customer.shape)   # (3,) — 3-dimensional vector
print(len(customer))    # 3

# Vector arithmetic
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

a + b      # [5, 7, 9]  — element-wise addition
a - b      # [-3,-3,-3]
a * 2      # [2, 4, 6]  — scalar multiplication
a * b      # [4,10,18]  — element-wise multiply (NOT dot product)

# Vector magnitude (length)
magnitude = np.linalg.norm(a)  # sqrt(1+4+9) = 3.74

# Normalize to unit vector (magnitude = 1)
unit = a / np.linalg.norm(a)
print(np.linalg.norm(unit))  # 1.0`}</Block>

      <LH>2. Dot Product — the most important operation</LH>
      <LP>The dot product measures similarity between two vectors. It's the core operation in neural networks, cosine similarity, and matrix multiplication.</LP>
      <Block label="Dot product">{`import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Three equivalent ways
dot1 = np.dot(a, b)       # 32
dot2 = a @ b              # 32 (cleaner syntax)
dot3 = sum(a * b)         # 32 (manual)

# Geometric interpretation: a·b = |a||b|cos(θ)
# If dot product > 0: vectors point in similar direction
# If dot product = 0: vectors are perpendicular (orthogonal)
# If dot product < 0: vectors point in opposite directions

# Cosine similarity — normalized dot product (used in NLP)
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

doc1 = np.array([1, 1, 0, 1])  # word frequencies
doc2 = np.array([1, 1, 1, 0])
print(cosine_similarity(doc1, doc2))  # 0.667 — moderately similar`}</Block>
      <Callout icon="★" color="#f7c96e" title="Why dot products matter in ML">In a neural network, every neuron computes: output = dot(weights, inputs) + bias. The entire forward pass is matrix multiplication. Understanding dot products = understanding neural networks.</Callout>

      <LH>3. Matrices — grids of numbers</LH>
      <Block label="Creating and indexing matrices">{`import numpy as np

# Dataset as matrix — rows=samples, cols=features
X = np.array([
    [35, 75.5, 24],   # customer 1: age, charge, tenure
    [28, 45.0, 12],   # customer 2
    [52, 90.0, 36],   # customer 3
    [41, 60.0, 18],   # customer 4
])

print(X.shape)    # (4, 3) — 4 samples, 3 features

# Indexing
X[0]        # first row (customer 1)
X[:, 0]     # first column (all ages)
X[1, 2]     # row 1, col 2 = 12

# Matrix arithmetic
A = np.array([[1,2],[3,4]])
B = np.array([[5,6],[7,8]])

A + B       # element-wise addition
A * B       # element-wise multiplication (NOT matrix multiply)
A @ B       # MATRIX multiplication (what you usually want)
A.T         # transpose — flip rows and columns`}</Block>

      <LH>4. Matrix Multiplication — explained clearly</LH>
      <Block label="Matrix multiply step by step">{`import numpy as np

# Matrix multiply: (m×n) @ (n×p) = (m×p)
# Inner dimensions must match!

A = np.array([[1,2,3],
              [4,5,6]])      # shape (2,3)

B = np.array([[7,8],
              [9,10],
              [11,12]])      # shape (3,2)

C = A @ B                   # shape (2,2)
print(C)
# [[58, 64],
#  [139, 154]]

# How C[0,0] = 58:
# Row 0 of A = [1,2,3]
# Col 0 of B = [7,9,11]
# Dot product = 1*7 + 2*9 + 3*11 = 7+18+33 = 58

# Shape rule: CRITICAL for debugging ML errors
print(A.shape)  # (2,3)
print(B.shape)  # (3,2)
print(C.shape)  # (2,2) ← (2,3)@(3,2) = (2,2) inner 3s cancel`}</Block>
      <Warn>The most common ML error: "shapes (100,) and (100,1) not aligned". This is always a shape problem. Always print .shape when debugging matrix operations.</Warn>

      <LH>5. Why This Matters in ML</LH>
      <Compare items={[
        {label:"Linear Regression", color:"#7eb8f7", text:"predictions = X @ weights + bias. One matrix multiply gives predictions for all samples at once."},
        {label:"Neural Networks", color:"#e879f9", text:"Each layer: output = activation(W @ input + b). The whole network is chained matrix multiplications."},
        {label:"PCA", color:"#6dd6a0", text:"Finds directions (eigenvectors) of maximum variance. Projection = X @ eigenvectors. Reduces dimensions."},
      ]}/>
      <Block label="Linear regression as matrix operation">{`import numpy as np

# X: 4 samples, 2 features (+ bias column of 1s)
X = np.array([
    [1, 35, 75.5],  # [bias, age, charge]
    [1, 28, 45.0],
    [1, 52, 90.0],
    [1, 41, 60.0],
])
weights = np.array([0.5, 0.02, 0.01])  # [w_bias, w_age, w_charge]

# Predict for ALL customers in one matrix multiply
predictions = X @ weights
print(predictions)  # [1.775, 1.546, 2.44, 1.922]`}</Block>

      <Quiz questions={[
        {q:"np.dot([1,2,3],[4,5,6]) equals:",options:["[4,10,18]","32","21","None"],answer:"32",explanation:"Dot product = sum of element-wise products. 1×4 + 2×5 + 3×6 = 4+10+18 = 32. Not element-wise multiplication (which gives [4,10,18])."},
        {q:"Matrix A has shape (3,4) and B has shape (4,2). What is (A@B).shape?",options:["(3,2)","(4,4)","(3,4)","Error — incompatible shapes"],answer:"(3,2)",explanation:"Matrix multiply rule: (m×n) @ (n×p) = (m×p). Inner dimensions (4 and 4) must match. Result is outer dimensions: (3×2)."},
        {q:"Cosine similarity of 1.0 means two vectors are:",options:["Perpendicular","Opposite directions","Identical direction","Unrelated"],answer:"Identical direction",explanation:"Cosine similarity ranges from -1 to 1. 1.0 means vectors point in exactly the same direction. 0 means perpendicular. -1 means opposite. Used in NLP to measure document similarity."},
        {q:"A.T transposes matrix A. If A.shape=(3,5), what is A.T.shape?",options:["(3,5)","(5,3)","(15,)","Error"],answer:"(5,3)",explanation:"Transpose flips rows and columns. A (3,5) matrix becomes (5,3). Useful in linear algebra and often needed to make matrix multiplications work."},
        {q:"The dot product of two vectors is 0. This means they are:",options:["Identical","Parallel","Perpendicular (orthogonal)","Antiparallel"],answer:"Perpendicular (orthogonal)",explanation:"Dot product = |a||b|cos(θ). If dot product = 0, then cos(θ) = 0, which means θ = 90°. The vectors are perpendicular. In ML, orthogonal features carry independent information."},
      ]}/>

      <CodeExercise
        title="Compute cosine similarity between customers"
        description="Given two customer feature vectors (age, monthly_charge, tenure), compute their cosine similarity using NumPy. Print the result rounded to 3 decimal places."
        starterCode={`import numpy as np

customer_a = np.array([35, 75.5, 24])
customer_b = np.array([33, 72.0, 22])
customer_c = np.array([22, 20.0, 3])

def cosine_similarity(a, b):
    dot    = np.dot(___, ___)
    norm_a = np.linalg.norm(___)
    norm_b = np.linalg.norm(___)
    return dot / (norm_a * norm_b)

sim_ab = cosine_similarity(customer_a, customer_b)
sim_ac = cosine_similarity(customer_a, customer_c)

print(f"A vs B similarity: {round(sim_ab, 3)}")
print(f"A vs C similarity: {round(sim_ac, 3)}")
print(f"More similar to A: {'B' if sim_ab > sim_ac else 'C'}")`}
        hint="np.dot(a, b). np.linalg.norm(a). np.linalg.norm(b)."
        validate={(out)=>out.includes("A vs B similarity:")&&out.includes("A vs C similarity:")&&out.includes("More similar to A: B")}
      />
    </div>
  )},

  // ── LINEAR ALGEBRA 2: Eigenvalues, PCA intuition
  {id:"linalg-eigen", phase:"Linear Algebra", emoji:"🌀", color:"#e879f9", title:"Eigenvalues & PCA Intuition", subtitle:"The math behind dimensionality reduction",
   body:()=>(
    <div>
      <LP>Eigenvalues and eigenvectors sound intimidating. They're not. This lesson gives you the intuition and the practical NumPy code — enough to understand PCA, explain it in interviews, and implement it.</LP>
      <Callout icon="🧠" color="#e879f9" title="The one-line summary">An eigenvector is a special direction that a matrix transformation doesn't rotate — only stretches or shrinks. The eigenvalue is how much it stretches.</Callout>

      <LH>1. What is an Eigenvector?</LH>
      <Block label="Eigenvectors in code">{`import numpy as np

# A transformation matrix
A = np.array([[3, 1],
              [0, 2]])

# For most vectors, A changes their direction:
v1 = np.array([1, 1])
print(A @ v1)  # [4, 2] — different direction!

# Eigenvectors are special — A only scales them
# A @ v = λ * v  (lambda = eigenvalue, v = eigenvector)

# Compute eigenvalues and eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)       # [3., 2.]
print("Eigenvectors:\n", eigenvectors)   # columns are eigenvectors

# Verify: A @ v = λ * v for first eigenvector
v = eigenvectors[:, 0]    # first eigenvector
lam = eigenvalues[0]      # first eigenvalue
print(np.allclose(A @ v, lam * v))  # True`}</Block>

      <LH>2. Covariance Matrix — the bridge to PCA</LH>
      <Block label="Computing covariance">{`import numpy as np

# Dataset: 5 customers, 2 features (age, charge)
X = np.array([
    [25, 45],
    [30, 60],
    [35, 75],
    [28, 50],
    [42, 85],
])

# Center the data (subtract mean)
X_centered = X - X.mean(axis=0)

# Covariance matrix
# cov[i,j] = how feature i and j vary together
cov = np.cov(X_centered.T)
print("Covariance matrix:")
print(cov)
# Large off-diagonal values = features correlated
# Small off-diagonal = features independent

# Alternatively
cov2 = np.cov(X.T)  # numpy centers automatically
print(np.allclose(cov, cov2))  # True`}</Block>

      <LH>3. PCA from Scratch</LH>
      <LP>PCA finds the directions of maximum variance in your data. Those directions are eigenvectors of the covariance matrix.</LP>
      <Block label="PCA step by step">{`import numpy as np

np.random.seed(42)
# Simulate correlated data (like height and weight)
X = np.random.multivariate_normal(
    mean=[170, 70],
    cov=[[100, 60], [60, 50]],
    size=200
)

# Step 1: Center
X_centered = X - X.mean(axis=0)

# Step 2: Covariance matrix
cov = np.cov(X_centered.T)

# Step 3: Eigendecomposition
eigenvalues, eigenvectors = np.linalg.eig(cov)

# Step 4: Sort by eigenvalue (largest = most variance)
idx = np.argsort(eigenvalues)[::-1]
eigenvalues  = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

# Step 5: Project onto top k components
k = 1  # keep 1 component
principal_components = eigenvectors[:, :k]
X_reduced = X_centered @ principal_components  # (200,2) → (200,1)

print(f"Original shape: {X.shape}")
print(f"Reduced shape:  {X_reduced.shape}")

# Explained variance
total_var = eigenvalues.sum()
explained = eigenvalues[:k].sum() / total_var
print(f"Variance explained by PC1: {explained:.1%}")`}</Block>
      <Callout icon="★" color="#f7c96e" title="Interview gold">If asked 'explain PCA': center data → compute covariance matrix → find eigenvectors → project onto top k eigenvectors. Each eigenvector is a principal component. Eigenvalue = variance explained by that component.</Callout>

      <LH>4. PCA with sklearn — how you'll actually use it</LH>
      <Block label="sklearn PCA">{`from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

np.random.seed(42)
X = np.random.randn(100, 10)  # 100 samples, 10 features

# ALWAYS scale before PCA
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit PCA
pca = PCA(n_components=3)
X_reduced = pca.fit_transform(X_scaled)

print(f"Original: {X_scaled.shape}")   # (100, 10)
print(f"Reduced:  {X_reduced.shape}")  # (100, 3)

# Explained variance ratio
for i, var in enumerate(pca.explained_variance_ratio_):
    print(f"PC{i+1}: {var:.1%} variance explained")

# Cumulative — how many components do you need?
cumulative = np.cumsum(pca.explained_variance_ratio_)
n_for_95 = np.argmax(cumulative >= 0.95) + 1
print(f"Components needed for 95% variance: {n_for_95}")`}</Block>
      <Warn>Always StandardScale before PCA. Without scaling, features with larger ranges (like salary in thousands) dominate the principal components, making PCA useless.</Warn>

      <Compare items={[
        {label:"When to use PCA", color:"#6dd6a0", text:"High-dimensional data (100+ features), multicollinear features, visualization (reduce to 2D), speed up training."},
        {label:"When NOT to use PCA", color:"#f28b82", text:"When interpretability matters (PCA components are uninterpretable). When features aren't correlated. When n_features < 20."},
        {label:"PCA vs Feature Selection", color:"#7eb8f7", text:"PCA creates NEW features (linear combinations). Feature selection KEEPS original features. Selection is more interpretable."},
      ]}/>

      <Quiz questions={[
        {q:"The first principal component captures:",options:["The most important feature","The direction of maximum variance in the data","The feature with highest correlation to target","The mean of all features"],answer:"The direction of maximum variance in the data",explanation:"PCA finds directions (eigenvectors) of the covariance matrix ordered by variance explained (eigenvalues). PC1 captures the most variance, PC2 the second most, etc."},
        {q:"Why must you StandardScale before PCA?",options:["PCA requires normal distribution","Features with large ranges would dominate the variance","StandardScale makes PCA faster","PCA only works on scaled data"],answer:"Features with large ranges would dominate the variance",explanation:"PCA is variance-based. A feature measured in thousands (like salary) will have much higher variance than one measured in 0-1 (like a rate). Scaling ensures all features contribute equally to the analysis."},
        {q:"eigenvalues = [4.2, 2.1, 0.8, 0.3]. How much variance do the first 2 PCs explain?",options:["4.2/7.4 = 56.8%","(4.2+2.1)/7.4 = 85.1%","2.1/7.4 = 28.4%","100%"],answer:"(4.2+2.1)/7.4 = 85.1%",explanation:"Explained variance ratio = eigenvalue / sum of all eigenvalues. For 2 components: (4.2+2.1)/(4.2+2.1+0.8+0.3) = 6.3/7.4 = 85.1%."},
        {q:"A @ v = 3 * v. What is 3 here?",options:["The eigenvector","The eigenvalue","The dot product","The determinant"],answer:"The eigenvalue",explanation:"The eigenvalue equation is A @ v = λ * v where v is the eigenvector and λ (lambda) is the eigenvalue. The eigenvalue tells you how much the transformation stretches or shrinks the eigenvector."},
        {q:"You reduce 50 features to 5 with PCA explaining 90% variance. What happens to model accuracy?",options:["Always improves","Always decreases","Depends — may improve due to noise reduction or decrease due to information loss","Stays exactly the same"],answer:"Depends — may improve due to noise reduction or decrease due to information loss",explanation:"PCA trades information for simplicity. Removing noise often improves model performance. But if the discarded 10% of variance contains important signal, accuracy drops. Always compare with and without PCA on your specific task."},
      ]}/>

      <CodeExercise
        title="PCA from scratch — find top component"
        description="Given a 2D dataset, implement PCA manually: center the data, compute covariance matrix, find eigenvalues/eigenvectors, and print the explained variance ratio of the first component."
        starterCode={`import numpy as np

np.random.seed(42)
X = np.random.multivariate_normal([0,0], [[3,2],[2,2]], size=100)

# Step 1: center
X_centered = X - X.___(axis=0)

# Step 2: covariance matrix
cov = np.cov(X_centered.___)

# Step 3: eigendecomposition
eigenvalues, eigenvectors = np.linalg.___(cov)

# Step 4: sort descending
idx = np.argsort(eigenvalues)___
eigenvalues = eigenvalues[idx]

# Step 5: explained variance of first component
explained = eigenvalues[0] / eigenvalues.___()
print(f"PC1 explains: {round(explained*100, 1)}% of variance")`}
        hint="X.mean(axis=0). X_centered.T for cov. np.linalg.eig(cov). [::-1] to reverse. eigenvalues.sum()."
        validate={(out)=>out.includes("PC1 explains:")&&out.includes("%")}
      />
    </div>
  )},

  // ── COMMAND LINE & GIT
  {id:"cli-git-lesson", phase:"Tools", emoji:"💻", color:"#facc15", title:"Command Line & Git", subtitle:"Every DS job requires this — learn it once, use it forever",
   body:()=>(
    <div>
      <LP>The command line and Git are the professional tools of data science. Every job posting lists them. Every team uses them. This lesson covers what you actually need — no fluff.</LP>
      <Callout icon="🧠" color="#facc15" title="Your GitHub is your DS resume">Recruiters look at GitHub profiles. Every project you build should be pushed to GitHub with a proper README. Start today.</Callout>

      <LH>1. Command Line Essentials</LH>
      <Block label="Navigation and file operations">{`# Navigate folders
pwd                    # print working directory — where am I?
ls                     # list files (Mac/Linux)
dir                    # list files (Windows)
ls -la                 # list with details + hidden files

cd Desktop             # go into Desktop folder
cd ..                  # go up one level
cd ~                   # go to home directory
cd "My Projects"       # quotes for paths with spaces

# Files and folders
mkdir my_project       # create folder
mkdir -p data/raw      # create nested folders
touch analysis.py      # create empty file (Mac/Linux)
cp file.py backup.py   # copy file
mv old_name.py new.py  # rename / move
rm file.py             # delete file (CAREFUL — no trash!)
rm -rf folder/         # delete folder recursively (VERY careful!)

# View file contents
cat data.csv           # print file contents
head -n 5 data.csv     # first 5 lines
tail -n 10 data.csv    # last 10 lines`}</Block>

      <LH>2. Running Python from Terminal</LH>
      <Block label="Python in the terminal">{`# Run a script
python script.py
python3 script.py      # on some systems

# Run with arguments
python train.py --model rf --epochs 10

# Interactive Python
python                 # starts REPL
>>> import pandas as pd
>>> exit()

# Virtual environments — ALWAYS use these
python -m venv venv           # create environment
source venv/bin/activate      # activate (Mac/Linux)
venv\\Scripts\\activate          # activate (Windows)
pip install pandas scikit-learn  # install in this env
pip freeze > requirements.txt    # save all packages
pip install -r requirements.txt  # install from file
deactivate                       # leave the environment`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="Always use virtual environments">Never install packages globally. Every project gets its own venv. This prevents version conflicts between projects and makes your code reproducible for others.</Callout>

      <LH>3. Git — the mental model first</LH>
      <Compare items={[
        {label:"Working Directory", color:"#7eb8f7", text:"Your actual files. Where you write code. Changes here aren't tracked yet."},
        {label:"Staging Area", color:"#f7c96e", text:"Files you've marked to be saved in the next commit. git add puts files here."},
        {label:"Repository (.git)", color:"#6dd6a0", text:"The full history of all commits. git commit saves the staging area here permanently."},
      ]}/>
      <Block label="Git workflow — daily use">{`# Setup (once)
git config --global user.name "Your Name"
git config --global user.email "you@email.com"

# Start a project
git init                        # initialize new repo
git clone URL                   # clone existing repo

# Daily workflow
git status                      # what changed?
git add analysis.py             # stage one file
git add .                       # stage all changes
git commit -m "Add EDA notebook"  # save to history
git push origin main            # upload to GitHub

# Check history
git log --oneline               # compact history
git diff                        # what changed since last commit
git diff HEAD~1                 # compare to previous commit

# Undo mistakes
git restore file.py             # discard unstaged changes
git restore --staged file.py    # unstage a file
git revert HEAD                 # undo last commit (safe)`}</Block>

      <LH>4. Branching — work without breaking things</LH>
      <Block label="Branches">{`# Create and switch to new branch
git checkout -b feature/add-model
# or (modern syntax)
git switch -c feature/add-model

# See all branches
git branch

# Switch between branches
git switch main
git switch feature/add-model

# Merge your work back
git switch main
git merge feature/add-model

# Push branch to GitHub
git push origin feature/add-model

# Delete branch after merging
git branch -d feature/add-model`}</Block>

      <LH>5. Writing Good Commit Messages</LH>
      <Compare items={[
        {label:"❌ Bad commits", color:"#f28b82", text:'"fix" "stuff" "asdfgh" "updated" "final" "final_v2" "pls work"'},
        {label:"✅ Good commits", color:"#6dd6a0", text:'"Add churn prediction model with 87% accuracy" "Fix null handling in customer_id column" "Refactor EDA notebook into reusable functions"'},
      ]}/>
      <Tip>Format: verb + what + why (if not obvious). "Add random forest baseline — outperforms logistic regression by 4%". Your future self and teammates will thank you.</Tip>

      <LH>6. Essential .gitignore</LH>
      <Block label=".gitignore for DS projects">{`# Create .gitignore in project root
# This file tells Git what NOT to track

# Python
__pycache__/
*.pyc
*.pyo
.env

# Virtual environment
venv/
env/
.venv/

# Data files (often too large for GitHub)
data/raw/
*.csv
*.xlsx
*.parquet

# Jupyter checkpoints
.ipynb_checkpoints/

# API keys and secrets — NEVER commit these!
.env
secrets.py
config.py

# OS files
.DS_Store        # Mac
Thumbs.db        # Windows`}</Block>

      <Quiz questions={[
        {q:"You edited 3 files. You want to commit only 2 of them. What do you do?",options:["git add . then git commit","git add file1.py file2.py then git commit","git commit file1.py file2.py","git push file1.py file2.py"],answer:"git add file1.py file2.py then git commit",explanation:"git add selects specific files for staging. git add . stages everything. You can add files individually to include only the ones you want in this commit."},
        {q:"What does 'git restore file.py' do?",options:["Deletes the file","Discards unstaged changes to file.py","Restores a deleted file from GitHub","Commits the file"],answer:"Discards unstaged changes to file.py",explanation:"git restore discards changes in your working directory, reverting the file to its state at the last commit. Warning: this cannot be undone — the changes are gone."},
        {q:"Why should you NEVER commit API keys or passwords?",options:["Git can't store strings","GitHub is public — anyone can see and use your keys","Git compresses text files differently","Commit messages are limited in length"],answer:"GitHub is public — anyone can see and use your keys",explanation:"Once pushed to GitHub, secrets are permanently in history even if you delete them later. Bots scan GitHub for exposed credentials and use them within minutes. Always use .env files and add them to .gitignore."},
        {q:"What is a virtual environment?",options:["A cloud server for running Python","An isolated Python installation per project with its own packages","A way to run Python in the browser","A Docker container"],answer:"An isolated Python installation per project with its own packages",explanation:"A virtual environment creates a separate Python installation for each project. This prevents 'it works on my machine' issues and version conflicts between projects. pip install inside a venv only affects that project."},
        {q:"git log --oneline shows commits. You want to undo the last commit but keep the code changes. Which command?",options:["git revert HEAD","git reset HEAD~1 --soft","git restore HEAD","git push --force"],answer:"git reset HEAD~1 --soft",explanation:"--soft reset moves the commit pointer back but keeps your changes staged. Hard reset (--hard) discards code changes too. revert creates a new commit that undoes the last one — safer for shared branches."},
      ]}/>

      <CodeExercise
        title="Simulate git workflow with file tracking"
        description="Python can simulate the concept of a git staging area using sets. Implement a simple GitSimulator class with add(), commit(), and log() methods."
        starterCode={`class GitSimulator:
    def __init__(self):
        self.staged   = []
        self.commits  = []
    
    def add(self, filename):
        if filename not in self.staged:
            self.staged.append(filename)
            print(f"Staged: {filename}")
    
    def commit(self, message):
        if not self.staged:
            print("Nothing to commit")
            return
        self.commits.append({
            "message": message,
            "files":   list(self.staged)
        })
        self.staged = ___  # clear staging area
        print(f"Committed: {message}")
    
    def log(self):
        for i, c in enumerate(reversed(self.commits)):
            print(f"#{len(self.commits)-i} {c[___]} — {c['files']}")

repo = GitSimulator()
repo.add("analysis.py")
repo.add("model.py")
repo.commit("Add initial analysis and model")
repo.add("README.md")
repo.commit("Add README")
repo.log()`}
        hint="self.staged = [] to clear. c['message'] for the commit message."
        validate={(out)=>out.includes("Committed: Add README")&&out.includes("README.md")&&out.includes("#1")}
      />
    </div>
  )},

  // ── JUPYTER & DEV ENVIRONMENT
  {id:"jupyter-lesson", phase:"Tools", emoji:"📓", color:"#38bdf8", title:"Jupyter & Dev Environment", subtitle:"Set up your workspace like a professional data scientist",
   body:()=>(
    <div>
      <LP>Your dev environment is where you spend every working hour. A well-configured environment makes you faster, catches bugs earlier, and makes your work reproducible. This lesson shows you what professionals actually use.</LP>
      <Callout icon="🧠" color="#38bdf8" title="Key principle">A notebook that only runs in order, with a fresh kernel, on any machine = reproducible. Everything else is a liability.</Callout>

      <LH>1. Jupyter Notebook vs JupyterLab vs VS Code</LH>
      <Compare items={[
        {label:"Jupyter Notebook", color:"#7eb8f7", text:"Classic. Simple. Good for sharing. Limited for large projects. Access at localhost:8888."},
        {label:"JupyterLab", color:"#6dd6a0", text:"Modern Jupyter. Side-by-side views, file browser, terminal. Better for serious work."},
        {label:"VS Code + Jupyter", color:"#f7c96e", text:"Best of both worlds. Full IDE features (autocomplete, linting, debugging) + notebooks. Recommended."},
      ]}/>
      <Block label="Starting Jupyter">{`# Install
pip install jupyterlab notebook

# Start JupyterLab
jupyter lab

# Start classic notebook
jupyter notebook

# Start on specific port
jupyter lab --port 8889

# Convert notebook to script
jupyter nbconvert --to script analysis.ipynb

# Run notebook non-interactively
jupyter nbconvert --to notebook --execute analysis.ipynb`}</Block>

      <LH>2. Essential Keyboard Shortcuts</LH>
      <Block label="Shortcuts that save hours">{`# MODE: Blue border = Command mode, Green = Edit mode
# Press Escape → Command mode
# Press Enter  → Edit mode

# In COMMAND mode (blue):
A          # insert cell Above
B          # insert cell Below
DD         # Delete cell (press D twice)
M          # change cell to Markdown
Y          # change cell to Code
Z          # undo cell deletion
Shift+Up   # select multiple cells upward
Shift+Down # select multiple cells downward
C          # copy cell
V          # paste cell below
X          # cut cell

# In EDIT mode (green):
Shift+Enter    # Run cell + move to next
Ctrl+Enter     # Run cell, stay on it
Alt+Enter      # Run cell + insert new cell below
Tab            # Autocomplete
Shift+Tab      # Show function signature/docs
Ctrl+/         # Toggle comment
Ctrl+Z         # Undo

# Any mode:
Ctrl+Shift+P   # Command palette (JupyterLab)`}</Block>
      <Tip>Learn Shift+Enter, A, B, DD, M, and Y first. These alone will save 30 minutes per day. Add the rest gradually.</Tip>

      <LH>3. Magic Commands — Jupyter superpowers</LH>
      <Block label="Magic commands">{`# Time a single expression
%timeit sum(range(1000))

# Time a whole cell
%%timeit
result = []
for i in range(1000):
    result.append(i**2)

# Run a shell command from notebook
!pip install seaborn
!ls data/
!git status

# Display all variables in memory
%whos

# Load external script into cell
%load my_functions.py

# Autoreload — automatically reimport modules on change
%load_ext autoreload
%autoreload 2

# Display matplotlib inline
%matplotlib inline

# Profile code performance
%prun my_function()

# Write cell content to file
%%writefile my_script.py
import pandas as pd
df = pd.read_csv("data.csv")
print(df.head())`}</Block>

      <LH>4. Professional Notebook Structure</LH>
      <Block label="Template for every DS notebook">{`# 1. TITLE + PURPOSE
# Always start with a markdown cell:
"""
# Customer Churn Analysis
**Goal:** Identify key drivers of churn in the Telco dataset
**Data:** telco_churn.csv (7,043 rows × 21 columns)
**Author:** Your Name | Date: 2024-01-15
"""

# 2. IMPORTS — all at the top, one cell
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split

# Config
pd.set_option('display.max_columns', None)
plt.style.use('seaborn-v0_8')
RANDOM_STATE = 42

# 3. DATA LOADING
df = pd.read_csv("../data/raw/telco_churn.csv")
print(f"Shape: {df.shape}")
df.head()

# 4. EDA (separate cells per insight)

# 5. PREPROCESSING

# 6. MODELING

# 7. EVALUATION

# 8. CONCLUSIONS — always end with markdown summary`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="The golden rule">Before sharing any notebook: Kernel → Restart & Run All. If it fails, it's broken. If it succeeds, it's reproducible.</Callout>

      <LH>5. VS Code Setup for Data Science</LH>
      <Block label="Must-have VS Code extensions">{`# Install these extensions in VS Code:

# 1. Python (Microsoft) — language support, linting, debugging
# 2. Jupyter — run .ipynb notebooks in VS Code
# 3. Pylance — fast type checking and autocomplete
# 4. GitLens — powerful git history view
# 5. indent-rainbow — visual indentation guides
# 6. Rainbow CSV — colorize CSV files

# Settings to add to settings.json:
{
    "editor.formatOnSave": true,
    "python.formatting.provider": "black",
    "editor.rulers": [88],          // Black's default line length
    "jupyter.runStartupCommands": "%matplotlib inline"
}`}</Block>

      <LH>6. Project Folder Structure</LH>
      <Block label="Standard DS project structure">{`my_project/
├── data/
│   ├── raw/          # original data — NEVER modify
│   └── processed/    # cleaned, transformed data
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   └── 03_modeling.ipynb
├── src/
│   ├── __init__.py
│   ├── data.py       # data loading functions
│   ├── features.py   # feature engineering
│   └── models.py     # model training/evaluation
├── outputs/
│   ├── figures/      # saved plots
│   └── models/       # saved model files
├── requirements.txt
├── .gitignore
└── README.md         # ALWAYS write this`}</Block>
      <Tip>Number your notebooks (01_, 02_, 03_). It forces you to think about the order and makes the project story clear to anyone who opens the repo.</Tip>

      <Quiz questions={[
        {q:"In Jupyter command mode, what does pressing 'DD' do?",options:["Duplicates the cell","Deletes the current cell","Moves to the next cell","Debug mode"],answer:"Deletes the current cell",explanation:"DD (press D twice quickly) deletes the current cell in command mode. Press Z immediately after to undo. Make sure you're in command mode (blue border) not edit mode."},
        {q:"Why should you 'Restart & Run All' before sharing a notebook?",options:["It makes the notebook smaller","It ensures cells run in order with a fresh state — proving reproducibility","It clears all outputs","It converts to PDF"],answer:"It ensures cells run in order with a fresh state — proving reproducibility",explanation:"In Jupyter, you can run cells out of order. A notebook that only works when you run cells in a specific order is broken. Restart & Run All proves it executes correctly from top to bottom."},
        {q:"%timeit sum(range(1000)) — what does this do?",options:["Runs the code once and shows memory usage","Runs the code many times and reports average execution time","Shows the code's complexity","Times the entire notebook"],answer:"Runs the code many times and reports average execution time",explanation:"%timeit runs the expression thousands of times and reports mean ± std. Use it to benchmark code and compare approaches. %%timeit (double %) times a whole cell."},
        {q:"Where should you put all your import statements?",options:["Right before you use each library","Anywhere, it doesn't matter","All in the first code cell, at the top of the notebook","In a separate imports.py file"],answer:"All in the first code cell, at the top of the notebook",explanation:"All imports at the top is a Python convention (PEP 8). In notebooks, it means anyone can see all dependencies immediately, and you avoid 'ModuleNotFoundError' appearing 30 cells in."},
        {q:"You have data/raw/customers.csv in your project. What should be in .gitignore?",options:["Nothing — always commit your data","data/raw/ — raw data is often too large for GitHub","customers.csv only","All csv files regardless of location"],answer:"data/raw/ — raw data is often too large for GitHub",explanation:"Raw data files are often large (MBs to GBs) and shouldn't go in Git. Store them in cloud storage (S3, Drive) or provide a download script. Add data/raw/ to .gitignore but document how to get the data in README.md."},
      ]}/>

      <CodeExercise
        title="Build a notebook health checker"
        description="Write a function that checks a list of 'notebook cells' (represented as dicts with 'type' and 'content') and returns a health report: whether it has a title cell, imports cell, and conclusion cell."
        starterCode={`def check_notebook_health(cells):
    has_title      = False
    has_imports    = False
    has_conclusion = False
    
    for cell in cells:
        content = cell['content'].lower()
        if cell['type'] == 'markdown' and content.startswith('# '):
            has_title = ___
        if cell['type'] == 'code' and 'import' in content:
            has_imports = ___
        if cell['type'] == 'markdown' and 'conclusion' in content:
            has_conclusion = ___
    
    print(f"Title cell:      {'✅' if has_title else '❌'}")
    print(f"Imports cell:    {'✅' if has_imports else '❌'}")
    print(f"Conclusion cell: {'✅' if has_conclusion else '❌'}")
    score = sum([has_title, has_imports, has_conclusion])
    print(f"Health score: {score}/3")

cells = [
    {'type':'markdown', 'content':'# Customer Churn Analysis'},
    {'type':'code',     'content':'import pandas as pd\\nimport numpy as np'},
    {'type':'code',     'content':'df = pd.read_csv("data.csv")'},
    {'type':'markdown', 'content':'## Conclusions\\nChurn rate is 26%'},
]
check_notebook_health(cells)`}
        hint="Set has_title = True, has_imports = True, has_conclusion = True in the right if blocks."
        validate={(out)=>out.includes("✅")&&out.includes("Health score: 3/3")}
      />
    </div>
  )},
];
LESSONS.push(...FOUNDATION_LESSONS);

const ML_LESSONS = [
  {
    id:"ml-workflow", title:"The ML Workflow", subtitle:"The 6-step process every ML project follows",
    emoji:"🔄", color:"#a78bfa", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-workflow" color="#a78bfa">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["The Pipeline","Data Splitting","✓ Quiz","Train a Baseline","Evaluate","Iterate","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#a78bfa":"transparent",border:`2px solid ${i===0?"#a78bfa":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#a78bfa":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#a78bfa" title="The big picture">Machine learning is a repeatable 6-step process. Every project — predicting churn, detecting fraud, forecasting sales — follows the same structure. Master the process first, then worry about algorithms.</Callout>

      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — THE 6-STEP WORKFLOW</div>
        <LH>The 6 steps — memorize this sequence</LH>
        <div style={{display:"grid",gap:10,margin:"12px 0"}}>
          {[
            {n:"01",color:"#7eb8f7",title:"Define the Problem",desc:"What are you predicting? Regression (number) or classification (category)? What metric defines success?"},
            {n:"02",color:"#6dd6a0",title:"Get & Explore Data",desc:"Load data, run EDA. Check nulls, distributions, class imbalance, outliers. Know your data before touching it."},
            {n:"03",color:"#f7c96e",title:"Prepare Features",desc:"Split train/test FIRST. Then encode categoricals, scale numerics, impute nulls — all fitted on train only."},
            {n:"04",color:"#f28b82",title:"Train a Baseline",desc:"Start simple — logistic regression or decision tree. Establish a baseline before trying complex models."},
            {n:"05",color:"#c792ea",title:"Evaluate Properly",desc:"Right metric for the problem. Accuracy for balanced data. F1/AUC for imbalanced. RMSE for regression."},
            {n:"06",color:"#a78bfa",title:"Improve & Iterate",desc:"Feature engineering, hyperparameter tuning, trying different algorithms. Let metrics guide decisions."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:10,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:13,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <LH>Data Splitting — the golden rule</LH>
        <Block label="Always split FIRST — before any preprocessing">{`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

np.random.seed(42)
data = {'tenure': np.random.randint(1,73,200),
        'charges': np.random.normal(65,20,200),
        'churn': np.random.binomial(1,0.27,200)}
df = pd.DataFrame(data)

X = df[['tenure','charges']]
y = df['churn']

# Split BEFORE any preprocessing — this is the golden rule
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,      # 80% train, 20% test
    random_state=42,    # reproducibility
    stratify=y          # preserve class ratio in both splits
)

print("Train size:", len(X_train))
print("Test size: ", len(X_test))
print("Train churn rate:", round(y_train.mean(),3))
print("Test churn rate: ", round(y_test.mean(),3))`}</Block>
        <Warn>Never fit scalers, encoders, or imputers on the full dataset. Fit on train only, then transform both. Fitting on test data leaks future information into training — your validation results will be falsely optimistic.</Warn>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"Why do you split data before preprocessing?",options:["To make training faster","To prevent test data information from leaking into the training process","It's just a convention","To balance the classes"],answer:"To prevent test data information from leaking into the training process",explanation:"If you fit a scaler on the full dataset, your test set statistics influence the scaling — this is data leakage. Always split first, then fit preprocessing on train only."},
          {q:"stratify=y in train_test_split does what?",options:["Randomizes the split","Ensures both splits have similar class proportions","Stratifies by a third variable","Makes the split faster"],answer:"Ensures both splits have similar class proportions",explanation:"Without stratify, a random split might put 90% of churners in train and 10% in test. stratify=y ensures the churn rate is similar in both splits — essential for imbalanced classes."},
          {q:"You get 99% train accuracy and 72% test accuracy. What happened?",options:["Great model","Underfitting","Overfitting — model memorized training data","Data leakage"],answer:"Overfitting — model memorized training data",explanation:"A massive gap between train and test accuracy is the classic overfitting signature. The model memorized training examples instead of learning generalizable patterns."},
        ]}/>
      </div>

      <div style={{background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — FULL PIPELINE EXAMPLE</div>
        <LH>A complete end-to-end pipeline</LH>
        <Block label="This is what a real DS project looks like — read every comment">{`import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score

np.random.seed(42)
n = 500
tenure  = np.random.randint(1, 73, n)
charges = 20 + np.random.normal(0,20,n) - tenure*0.3
churn   = ((charges > 60) | (tenure < 6)).astype(int)
churn   = np.minimum(churn + np.random.binomial(1,0.1,n), 1)
df = pd.DataFrame({'tenure':tenure,'charges':charges,'churn':churn})

# Step 1: Split FIRST
X = df[['tenure','charges']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

# Step 2: Fit scaler on train only
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)   # transform only — no fit!

# Step 3: Train baseline model
model = LogisticRegression(class_weight='balanced', random_state=42)
model.fit(X_train_s, y_train)

# Step 4: Evaluate
preds = model.predict(X_test_s)
probs = model.predict_proba(X_test_s)[:,1]
print(classification_report(y_test, preds, target_names=['Stay','Churn']))
print("AUC-ROC:", round(roc_auc_score(y_test, probs), 3))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Gold rule" type="gold">80% of ML work is steps 1-3 (data, splitting, preprocessing). Most beginners rush to step 4 (training). Senior DSs spend most time understanding the data and engineering features — that is where the gains come from.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#a78bfa",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"What is the correct order?",options:["Train → Split → Preprocess → Evaluate","Split → Preprocess → Train → Evaluate","Preprocess → Split → Train → Evaluate","EDA → Train → Split → Evaluate"],answer:"Split → Preprocess → Train → Evaluate",explanation:"Always split first. Then preprocess (fit on train, transform both). Then train on train set. Then evaluate on test set."},
          {q:"Cross-validation is better than a single train/test split because:",options:["It trains faster","It uses all data for both training and testing (just not simultaneously)","It prevents overfitting automatically","It only works for classification"],answer:"It uses all data for both training and testing (just not simultaneously)",explanation:"k-fold CV: split data into k folds, train on k-1 folds, test on the remaining fold, rotate. Every sample is used for testing exactly once. Gives more reliable performance estimates."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Build and evaluate a complete pipeline"
          description="Fill in the blanks to complete the split → scale → train → evaluate pipeline."
          starterCode={`import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

np.random.seed(42)
X = np.random.randn(200, 3)
y = (X[:,0] + X[:,1] > 0).astype(int)

# 1. Split — 80/20, stratified
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=___, stratify=___, random_state=42)

# 2. Scale — fit on train only
scaler = StandardScaler()
X_train_s = scaler.fit_transform(___)
X_test_s  = scaler.transform(___)

# 3. Train
model = LogisticRegression(random_state=42)
model.fit(___, ___)

# 4. Evaluate
preds = model.predict(___)
print(round(accuracy_score(y_test, preds), 3))`}
          hint="test_size=0.2, stratify=y. fit_transform(X_train), transform(X_test). fit(X_train_s, y_train). predict(X_test_s)."
          validate={(out)=>!isNaN(parseFloat(out.trim()))&&parseFloat(out.trim())>0.7}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
  {
    id:"ml-regression", title:"Linear & Logistic Regression", subtitle:"The models that explain predictions — not just make them",
    emoji:"📈", color:"#34d399", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-regression" color="#34d399">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Linear Regression","Coefficients","✓ Quiz","Logistic Regression","predict_proba","Metrics","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#34d399":"transparent",border:`2px solid ${i===0?"#34d399":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#34d399":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#34d399" title="Why learn regression before tree models?">Linear and logistic regression are asked in almost every DS interview. Not because you use them every day — but because they test whether you understand how models learn from data. They are also the most interpretable models, which matters in business.</Callout>

      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — LINEAR REGRESSION</div>
        <LH>Linear Regression — predicting numbers</LH>
        <LP>Linear regression finds the straight line that best fits your data. It learns weights for each feature — telling you exactly how much each feature contributes to the prediction.</LP>
        <Block label="Try changing the features — see how R² changes">{`import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)
n = 300
tenure  = np.random.randint(1, 73, n)
charges = 20 + tenure * 0.8 + np.random.normal(0, 12, n)

X = tenure.reshape(-1,1)
y = charges

X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
preds = model.predict(X_test)

print("Coefficient (tenure):", round(model.coef_[0], 3))
print("Intercept:           ", round(model.intercept_, 3))
print("R² score:            ", round(r2_score(y_test, preds), 3))
print("RMSE:                ", round(np.sqrt(mean_squared_error(y_test, preds)), 3))
print()
print("Interpretation: each extra month of tenure adds $" + str(round(model.coef_[0],2)) + " to monthly charges")`}</Block>
        <Tip>The coefficient tells you: "holding all else equal, what happens to the prediction when this feature increases by 1?" This is why linear regression is so powerful for business — you can explain every prediction.</Tip>

        <LH>Multiple features + what R² really means</LH>
        <Block label="R² = 0.73 means the model explains 73% of the variance">{`import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

np.random.seed(42)
n = 300
tenure  = np.random.randint(1, 73, n)
age     = np.random.randint(18, 70, n)
charges = 15 + tenure * 0.7 + age * 0.3 + np.random.normal(0,10,n)

X = np.column_stack([tenure, age])
y = charges
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

print("Coefficients:")
for name, coef in zip(['tenure','age'], model.coef_):
    print("  " + name + ": " + str(round(coef,3)))
print("R²:", round(r2_score(y_test, model.predict(X_test)), 3))`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"R² = 0.73 means:",options:["73% of predictions are correct","The model explains 73% of variance in the target","RMSE is 0.73","73% accuracy"],answer:"The model explains 73% of variance in the target",explanation:"R² measures how much of the target's variation the model captures. R²=0.73 means 27% of variance is unexplained — due to missing features or noise."},
          {q:"Linear regression coefficient for 'tenure' is 0.8. What does this mean?",options:["80% accuracy","Each extra month of tenure predicts $0.80 higher charge","Tenure explains 80% of variance","0.8 customers per month"],answer:"Each extra month of tenure predicts $0.80 higher charge",explanation:"Coefficients in linear regression mean: for every 1-unit increase in this feature, the prediction changes by the coefficient amount, holding all other features constant."},
          {q:"probs = model.predict_proba(X_test)[:, 1]. What is probs[0] = 0.72?",options:["72% accuracy","72% probability this customer will churn","72 customers will churn","Model is wrong 28% of the time"],answer:"72% probability this customer will churn",explanation:"predict_proba returns [P(class 0), P(class 1)]. [:, 1] selects churn probability. 0.72 = this customer has a 72% estimated probability of churning."},
        ]}/>
      </div>

      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — LOGISTIC REGRESSION</div>
        <LH>Logistic Regression — predicting probabilities</LH>
        <LP>Despite the name, logistic regression is a classification model. It outputs a probability (0 to 1) that a sample belongs to a class. The decision boundary is: predict class 1 if P > threshold (default 0.5).</LP>
        <Block label="Try changing the threshold — watch precision/recall trade off">{`import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

np.random.seed(42)
n = 400
tenure  = np.random.randint(1, 73, n)
charges = 20 + np.random.normal(0,20,n) - tenure*0.4
churn   = ((charges > 55) | (tenure < 8)).astype(int)
df_X = np.column_stack([tenure, charges])
y    = churn

X_train,X_test,y_train,y_test = train_test_split(df_X,y,test_size=0.2,random_state=42,stratify=y)
scaler = StandardScaler()
X_tr = scaler.fit_transform(X_train)
X_te = scaler.transform(X_test)

model = LogisticRegression(class_weight='balanced', random_state=42)
model.fit(X_tr, y_train)

# Default threshold = 0.5
preds_50  = model.predict(X_te)
probs     = model.predict_proba(X_te)[:,1]

# Lower threshold catches more churners (higher recall)
threshold = 0.35
preds_35  = (probs >= threshold).astype(int)

print("Threshold 0.50:")
print(classification_report(y_test, preds_50, target_names=['Stay','Churn'], digits=2))
print("Threshold 0.35:")
print(classification_report(y_test, preds_35, target_names=['Stay','Churn'], digits=2))`}</Block>
        <Warn>class_weight='balanced' is critical for imbalanced data. Without it, the model learns to mostly predict the majority class. With it, sklearn automatically weights minority class errors more heavily.</Warn>
        <Tip>For churn: missing a churner (false negative) is more expensive than a false alarm. Lower the threshold to 0.3-0.4 to catch more churners at the cost of more false positives.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"class_weight='balanced' does what?",options:["Balances dataset by oversampling","Penalizes minority class errors more heavily","Splits data equally","Makes training faster"],answer:"Penalizes minority class errors more heavily",explanation:"For imbalanced data, the model naturally predicts majority class. class_weight='balanced' compensates by weighting minority class errors higher during training."},
          {q:"AUC-ROC = 0.5 means:",options:["50% accuracy","No better than random guessing","Half the classes are correct","Very good model"],answer:"No better than random guessing",explanation:"AUC=0.5 means the model can't distinguish classes better than random. AUC=1.0 is perfect. A model predicting randomly gets AUC=0.5."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Train a logistic regression model"
          description="Fill in the blanks to train a LogisticRegression, make predictions, and print accuracy."
          starterCode={`import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

np.random.seed(42)
X = np.random.randn(200, 2)
y = (X[:,0] - X[:,1] > 0).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = ___(random_state=42)
model.___(X_train, y_train)
preds = model.___(X_test)
print(round(accuracy_score(y_test, preds), 3))`}
          hint="LogisticRegression(). model.fit(X_train, y_train). model.predict(X_test)."
          validate={(output) => !isNaN(parseFloat(output.trim()))&&parseFloat(output.trim())>0.7}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
  {
    id:"ml-trees", title:"Decision Trees & Random Forests", subtitle:"The workhorse algorithm of real-world data science",
    emoji:"🌳", color:"#f59e0b", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-trees" color="#f59e0b">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Decision Trees","Overfitting","✓ Quiz","Random Forests","Feature Importance","Comparison","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f59e0b":"transparent",border:`2px solid ${i===0?"#f59e0b":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f59e0b":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f59e0b" title="Why Random Forests win">Random Forest is the most commonly used algorithm in industry DS. It works well on tabular data with minimal tuning, handles mixed feature types, is robust to outliers, and tells you which features matter. Learn it deeply.</Callout>

      <div style={{background:"#f59e0b08",border:"1px solid #f59e0b20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f59e0b",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — DECISION TREES</div>
        <LH>Decision Trees — ask yes/no questions until you classify</LH>
        <LP>A decision tree splits data by finding the feature and threshold that best separates the classes at each step. The result is a flowchart of decisions you can actually read.</LP>
        <Block label="Try changing max_depth — watch train vs test accuracy diverge">{`import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
n = 400
X = np.random.randn(n, 4)
y = ((X[:,0] + X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

for depth in [2, 5, 10, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=42)
    tree.fit(X_train, y_train)
    train_auc = roc_auc_score(y_train, tree.predict_proba(X_train)[:,1])
    test_auc  = roc_auc_score(y_test,  tree.predict_proba(X_test)[:,1])
    label = str(depth) if depth else "None"
    print("depth=" + label + " | train AUC=" + str(round(train_auc,3)) + " | test AUC=" + str(round(test_auc,3)))`}</Block>
        <Warn>Single decision trees overfit badly. With no max_depth, a tree reaches near 100% train AUC but test AUC drops — it memorized the training data. Always use max_depth or use Random Forest instead.</Warn>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f59e0b",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"A decision tree with no max_depth gets 99% train accuracy and 65% test accuracy. What happened?",options:["Great model","Underfitting","Overfitting — memorized training data","Data leakage"],answer:"Overfitting — memorized training data",explanation:"A fully grown tree creates a leaf for every training sample, achieving near-perfect train accuracy but failing to generalize. max_depth, min_samples_leaf, or using Random Forest prevents this."},
          {q:"Random Forest reduces overfitting vs a single tree because:",options:["It uses more data","Each tree sees a random subset of data and features — averaging reduces variance","It scales features automatically","It uses gradient descent"],answer:"Each tree sees a random subset of data and features — averaging reduces variance",explanation:"Bagging: each tree is trained on a bootstrap sample. Feature randomness: each split considers a random feature subset. Averaging many diverse trees reduces variance — this is the ensemble effect."},
          {q:"feature_importances_ in Random Forest measures:",options:["Pearson correlation with target","How much each feature reduces impurity across all trees","Coefficient magnitude","P-value significance"],answer:"How much each feature reduces impurity across all trees",explanation:"Feature importance = average reduction in Gini impurity (or entropy) from splits on that feature across all trees. Higher = more useful for discrimination."},
        ]}/>
      </div>

      <div style={{background:"#f59e0b08",border:"1px solid #f59e0b20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f59e0b",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — RANDOM FORESTS</div>
        <LH>Random Forest — fixing overfitting with ensembles</LH>
        <Block label="Try increasing n_estimators — AUC improves up to a point then plateaus">{`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

np.random.seed(42)
n = 500
X = np.random.randn(n, 5)
y = ((X[:,0] + X[:,1] > 0.5) | (X[:,2] < -1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

rf = RandomForestClassifier(
    n_estimators=200,        # 100-500 is usually enough
    max_depth=None,          # forest handles overfitting — grow full trees
    min_samples_leaf=5,      # min samples per leaf — prevents overfitting
    class_weight='balanced',
    random_state=42,
    n_jobs=-1                # use all CPU cores
)
rf.fit(X_train, y_train)

probs = rf.predict_proba(X_test)[:,1]
preds = rf.predict(X_test)
print("Test AUC:", round(roc_auc_score(y_test, probs), 3))
print(classification_report(y_test, preds, target_names=['Stay','Churn']))`}</Block>

        <LH>Feature importance — what drives the outcome?</LH>
        <Block label="Feature importances tell you which inputs matter most">{`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

np.random.seed(42)
n = 400
tenure  = np.random.randint(1,73,n)
charges = 20 + np.random.normal(0,20,n)
age     = np.random.randint(18,70,n)
calls   = np.random.randint(0,10,n)
churn   = ((charges>65)|(tenure<6)|(calls>7)).astype(int)

X = np.column_stack([tenure,charges,age,calls])
y = churn
feature_names = ['tenure','charges','age','support_calls']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

importances = rf.feature_importances_
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    bar = '█' * int(imp * 40)
    print(name.ljust(15) + bar + " " + str(round(imp,3)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview gold" type="gold">Random Forest + feature importance is the go-to answer for 'how would you identify key churn drivers?' in interviews. It is non-parametric, handles mixed types, requires minimal preprocessing, and the importances tell a story stakeholders understand.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f59e0b",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"When should you use max_depth in a single Decision Tree?",options:["Never","Always to prevent overfitting","Only for regression","Only with > 1000 samples"],answer:"Always to prevent overfitting",explanation:"Without max_depth, a tree grows until every leaf has 1 sample — perfect train accuracy, terrible generalization. Set max_depth=3-10 for single trees."},
          {q:"n_jobs=-1 in RandomForestClassifier does:",options:["Trains 1 tree at a time","Uses all available CPU cores for parallel training","Disables parallelism","Sets number of trees"],answer:"Uses all available CPU cores for parallel training",explanation:"Random Forest trees are independent and can be trained in parallel. n_jobs=-1 uses all cores, dramatically speeding up training on large datasets."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Train Random Forest and print top features"
          description="Train a Random Forest, then print feature importances sorted descending."
          starterCode={`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
X = np.random.randn(300, 4)
y = ((X[:,0] > 0) & (X[:,1] < 0.5)).astype(int)
names = ['feature_A','feature_B','feature_C','feature_D']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

rf = ___(n_estimators=100, random_state=42)
rf.fit(___, ___)

for name, imp in sorted(zip(names, rf.___), key=lambda x: -x[1]):
    print(name + ": " + str(round(imp, 3)))`}
          hint="RandomForestClassifier(). rf.fit(X_train,y_train). rf.feature_importances_."
          validate={(out)=>out.includes("feature_A")&&out.includes("feature_B")}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
  {
    id:"ml-evaluation", title:"Model Evaluation", subtitle:"Choosing the right metric for the right problem",
    emoji:"📊", color:"#06b6d4", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-evaluation" color="#06b6d4">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Accuracy Trap","Confusion Matrix","✓ Quiz","Precision & Recall","F1 & AUC","Choosing Metrics","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#06b6d4":"transparent",border:`2px solid ${i===0?"#06b6d4":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#06b6d4":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#06b6d4" title="Accuracy is a trap">On imbalanced datasets, accuracy is meaningless. A model that always predicts 'no churn' gets 73% accuracy — and catches zero churners. The right metric depends on the problem. This lesson teaches you how to choose.</Callout>

      <div style={{background:"#06b6d408",border:"1px solid #06b6d420",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#06b6d4",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — THE CONFUSION MATRIX</div>
        <LH>The confusion matrix — where errors live</LH>
        <Block label="Run this — understand each cell before moving on">{`import numpy as np
from sklearn.metrics import confusion_matrix, classification_report

# Simulate a churn model
np.random.seed(42)
y_true = np.array([0]*730 + [1]*270)   # 27% churn rate
# Model is OK but misses some churners
y_pred = y_true.copy()
y_pred[np.random.choice(np.where(y_true==1)[0], 80)] = 0  # miss 80 churners
y_pred[np.random.choice(np.where(y_true==0)[0], 50)] = 1  # 50 false alarms

cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print("                Predicted Stay  Predicted Churn")
print("Actual Stay     " + str(cm[0,0]) + "             " + str(cm[0,1]))
print("Actual Churn    " + str(cm[1,0]) + "              " + str(cm[1,1]))
print()
print("TN:", cm[0,0], "— correctly predicted Stay")
print("FP:", cm[0,1], "— predicted Churn but actually Stay (false alarm)")
print("FN:", cm[1,0], "— predicted Stay but actually Churn (missed churner)")
print("TP:", cm[1,1], "— correctly predicted Churn")
print()
acc = (cm[0,0]+cm[1,1]) / cm.sum()
print("Accuracy:", round(acc,3), "← looks ok, but...")
print("Churners caught:", round(cm[1,1]/(cm[1,0]+cm[1,1]),3), "← only this matters for churn!")`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#06b6d4",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"A fraud model has 99% accuracy but catches 0% of fraud. What is wrong?",options:["Nothing — 99% is great","Class imbalance makes accuracy meaningless — the model predicts 'not fraud' always","The model needs more data","The threshold is too high"],answer:"Class imbalance makes accuracy meaningless — the model predicts 'not fraud' always",explanation:"With 99% non-fraud transactions, predicting 'not fraud' always gives 99% accuracy but zero utility. Use precision, recall, and F1 instead."},
          {q:"False Negative means:",options:["Model predicted positive and was wrong","Model predicted negative but truth was positive","Model predicted negative correctly","Model predicted positive correctly"],answer:"Model predicted negative but truth was positive",explanation:"False Negative: the model said 'no churn' (negative) but the customer actually churned (positive truth). For churn, this is the most costly error."},
          {q:"For churn prediction, which error is more costly?",options:["False Positive — sent unnecessary retention offer","False Negative — missed a churner","Both equally costly","Depends on the algorithm"],answer:"False Negative — missed a churner",explanation:"Missing a churner means losing that customer with no intervention. A false positive just wastes a discount offer on a loyal customer. Optimize for recall (catching churners)."},
        ]}/>
      </div>

      <div style={{background:"#06b6d408",border:"1px solid #06b6d420",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#06b6d4",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — PRECISION, RECALL, F1 & AUC</div>
        <LH>The metrics that actually matter</LH>
        <Block label="Try computing each metric manually — understand the formula">{`import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

np.random.seed(42)
y_true = np.array([0]*730 + [1]*270)
y_pred = y_true.copy()
y_pred[np.random.choice(np.where(y_true==1)[0], 80)] = 0
y_pred[np.random.choice(np.where(y_true==0)[0], 50)] = 1
probs  = np.where(y_true==1, np.random.uniform(0.5,0.95,1000), np.random.uniform(0.05,0.5,1000))

precision = precision_score(y_true, y_pred)
recall    = recall_score(y_true, y_pred)
f1        = f1_score(y_true, y_pred)
auc       = roc_auc_score(y_true, probs)

print("Precision:", round(precision,3), "— of predicted churners, how many actually churn?")
print("Recall:   ", round(recall,3),    "— of actual churners, how many did we catch?")
print("F1:       ", round(f1,3),        "— harmonic mean of precision and recall")
print("AUC-ROC:  ", round(auc,3),       "— ranking ability, threshold-independent")`}</Block>
        <LH>Choosing the right metric</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {metric:"Accuracy",use:"Balanced classes, costs equal",avoid:"Imbalanced classes",color:"#7eb8f7"},
            {metric:"Precision",use:"Cost of false alarm is high (spam filter)",avoid:"Missing positives is costly",color:"#6dd6a0"},
            {metric:"Recall",use:"Missing positives is costly (cancer, churn, fraud)",avoid:"Too many false alarms",color:"#f472b6"},
            {metric:"F1",use:"Balance precision and recall, imbalanced data",avoid:"When one error type is much costlier",color:"#f7c96e"},
            {metric:"AUC-ROC",use:"Comparing models, threshold-independent ranking",avoid:"When absolute calibration matters",color:"#a78bfa"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"8px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${item.color}22`,alignItems:"flex-start"}}>
              <div style={{color:item.color,fontWeight:700,fontSize:12,minWidth:90,flexShrink:0}}>{item.metric}</div>
              <div style={{flex:1}}><span style={{color:"#6dd6a0",fontSize:11}}>Use when: </span><span style={{color:"#8b87a8",fontSize:11}}>{item.use}</span></div>
              <div style={{flex:1}}><span style={{color:"#f28b82",fontSize:11}}>Avoid when: </span><span style={{color:"#8b87a8",fontSize:11}}>{item.avoid}</span></div>
            </div>
          ))}
        </div>
        <Callout icon="★" color="#f7c96e" title="Interview answer" type="gold">When asked 'what metric would you use?' — always ask: 'what's worse, a false positive or a false negative?' If false negatives are costlier → optimize recall. If false positives are costlier → optimize precision. If unclear → use F1 or AUC.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#06b6d4",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Precision = 0.90, Recall = 0.40. What does this mean?",options:["90% accurate overall","When model predicts churn it's right 90% — but only catches 40% of churners","40% accurate","90% of churners are caught"],answer:"When model predicts churn it's right 90% — but only catches 40% of churners",explanation:"High precision, low recall: the model is conservative — only flags high-confidence churners, so its predictions are accurate but it misses many actual churners."},
          {q:"AUC-ROC is threshold-independent. This means:",options:["No threshold needed","It measures performance across all possible thresholds","Default threshold is used","It only works for binary classification"],answer:"It measures performance across all possible thresholds",explanation:"AUC = area under the ROC curve, which plots TPR vs FPR at every threshold. It measures overall ranking ability regardless of which threshold you pick."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Compute classification metrics"
          description="Fill in the blanks to compute precision, recall, and F1 for a churn model."
          starterCode={`import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

np.random.seed(42)
y_true = np.array([0,0,1,1,0,1,0,1,1,0,0,1,0,1,0])
y_pred = np.array([0,1,1,1,0,0,0,1,1,0,1,1,0,0,0])

precision = ___(y_true, y_pred)
recall    = ___(y_true, y_pred)
f1        = ___(y_true, y_pred)

print("Precision:", round(precision, 3))
print("Recall:   ", round(recall, 3))
print("F1:       ", round(f1, 3))`}
          hint="precision_score(y_true, y_pred). recall_score(...). f1_score(...)."
          validate={(out)=>out.includes("Precision:")&&out.includes("Recall:")&&out.includes("F1:")}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
  {
    id:"ml-overfitting", title:"Overfitting & Regularization", subtitle:"Diagnosing and fixing the most common ML mistake",
    emoji:"🎯", color:"#f472b6", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-overfitting" color="#f472b6">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Bias vs Variance","Diagnosing","✓ Quiz","Regularization","Cross-Validation","Practical Fixes","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f472b6":"transparent",border:`2px solid ${i===0?"#f472b6":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f472b6":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f472b6" title="The most common ML mistake">Every beginner trains a model that scores 99% on training data and fails on real data. Overfitting. This lesson teaches you to diagnose it, fix it, and prevent it before it happens.</Callout>

      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — BIAS vs VARIANCE</div>
        <LH>The bias-variance tradeoff</LH>
        <Compare items={[
          {label:"High Bias (Underfitting)",color:"#7eb8f7",text:"Model too simple. High train AND test error. Misses the pattern. Fix: more features, more complex model."},
          {label:"High Variance (Overfitting)",color:"#f28b82",text:"Model too complex. Low train error, high test error. Memorized noise. Fix: more data, regularization, simpler model."},
          {label:"Just Right",color:"#6dd6a0",text:"Low train error, similar test error. Generalizes well. This is what you are aiming for."},
        ]}/>
        <Block label="Visualize bias-variance tradeoff with model complexity">{`import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(500, 5)
y = ((X[:,0]+X[:,1] > 0.3) & (X[:,2] < 0.8)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

print("depth | train AUC | test AUC | gap (overfit indicator)")
for d in [1, 2, 4, 6, 10, None]:
    m = DecisionTreeClassifier(max_depth=d, random_state=42)
    m.fit(X_train, y_train)
    tr = roc_auc_score(y_train, m.predict_proba(X_train)[:,1])
    te = roc_auc_score(y_test,  m.predict_proba(X_test)[:,1])
    label = str(d).rjust(4) if d else "None"
    print(label + "  |   " + str(round(tr,3)) + "    |   " + str(round(te,3)) + "   | " + str(round(tr-te,3)))`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"Train AUC = 0.98, Test AUC = 0.65. What is happening?",options:["Great model","Underfitting","Overfitting","Data leakage"],answer:"Overfitting",explanation:"A large gap between train and test performance is the overfitting signature. The model memorized training examples instead of learning generalizable patterns."},
          {q:"Ridge regression adds L2 regularization. This:",options:["Removes features","Shrinks all coefficients toward zero","Sets small coefficients to exactly zero","Increases model complexity"],answer:"Shrinks all coefficients toward zero",explanation:"L2 (Ridge) penalizes large coefficients by adding their squared sum to the loss. This shrinks all coefficients but keeps them non-zero — different from L1 (Lasso) which sets some to exactly zero."},
          {q:"Cross-validation is more reliable than a single train/test split because:",options:["It trains faster","It uses all data for both training and testing — more stable estimate","It prevents overfitting","It uses more hyperparameters"],answer:"It uses all data for both training and testing — more stable estimate",explanation:"k-fold CV: each sample is in the test set exactly once. Gives a less noisy, more representative performance estimate than one lucky/unlucky split."},
        ]}/>
      </div>

      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — REGULARIZATION & CROSS-VALIDATION</div>
        <LH>Regularization — penalize complexity</LH>
        <Block label="Try different C values — see how train/test gap changes">{`import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(300, 10)
y = (X[:,0] + X[:,1] > 0.5).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

print("C value | train AUC | test AUC | note")
for C, note in [(0.01,"heavy L2"), (0.1,"moderate L2"), (1.0,"default"), (10,"light L2"), (100,"almost none")]:
    m = LogisticRegression(C=C, max_iter=1000, random_state=42)
    m.fit(X_train, y_train)
    tr = roc_auc_score(y_train, m.predict_proba(X_train)[:,1])
    te = roc_auc_score(y_test,  m.predict_proba(X_test)[:,1])
    print(str(C).rjust(5) + "   |  " + str(round(tr,3)) + "    |  " + str(round(te,3)) + "   | " + note)`}</Block>
        <LH>Cross-validation — reliable performance estimates</LH>
        <Block label="5-fold CV gives a more honest accuracy estimate">{`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold

np.random.seed(42)
X = np.random.randn(400, 5)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
cv  = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(rf, X, y, cv=cv, scoring='roc_auc')
print("CV AUC per fold:", scores.round(3))
print("Mean AUC:  ", round(scores.mean(), 3))
print("Std AUC:   ", round(scores.std(), 3))
print("Reported as:", str(round(scores.mean(),3)) + " ± " + str(round(scores.std(),3)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Always report CV score ± std" type="gold">Never report a single train/test split result in an interview or report. Always use cross-validation and report mean ± std. A high std means your estimate is unstable — you need more data or a more robust model.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"In LogisticRegression, C=0.01 vs C=100 — which has stronger regularization?",options:["C=100","C=0.01","Both the same","Depends on the data"],answer:"C=0.01",explanation:"In sklearn's LogisticRegression, C is the inverse of regularization strength. Small C = strong regularization (shrinks coefficients more). Large C = weak regularization."},
          {q:"Practical ways to fix overfitting include:",options:["Get more data, use regularization, simplify the model, use cross-validation","Get less data, use higher learning rate","Add more features","Increase max_depth"],answer:"Get more data, use regularization, simplify the model, use cross-validation",explanation:"More data gives the model more signal to learn from. Regularization penalizes complexity. Simpler models can't overfit as badly. CV gives reliable performance estimates."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Detect overfitting with train/test gap"
          description="Train two models — one with max_depth=None (overfit) and one with max_depth=3 (regularized). Print both train and test AUC to see the gap."
          starterCode={`import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(300, 5)
y = (X[:,0]+X[:,1] > 0).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

for depth in [___, ___]:
    m = DecisionTreeClassifier(max_depth=depth, random_state=42)
    m.fit(X_train, y_train)
    tr = roc_auc_score(y_train, m.predict_proba(X_train)[:,1])
    te = roc_auc_score(y_test,  m.predict_proba(X_test)[:,1])
    print("depth=" + str(depth) + " train=" + str(round(tr,3)) + " test=" + str(round(te,3)))`}
          hint="Try [None, 3] for the two depths."
          validate={(out)=>out.includes("None")&&out.includes("train=")&&out.includes("test=")}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
  {
    id:"ml-sklearn", title:"Scikit-learn in Practice", subtitle:"The ML library that powers real data science work",
    emoji:"⚙️", color:"#8b5cf6", phase:"🤖 Machine Learning",
    body: () => (
      <LessonWrapper id="ml-sklearn" color="#8b5cf6">
      <div>

      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["sklearn API","Preprocessing","✓ Quiz","Pipelines","Grid Search","Full Example","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#8b5cf6":"transparent",border:`2px solid ${i===0?"#8b5cf6":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#8b5cf6":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#8b5cf6" title="The sklearn API is universal">Every sklearn model, preprocessor, and metric follows the same interface: fit() → transform()/predict(). Learn this pattern once and it applies to every algorithm in the library — hundreds of them.</Callout>

      <div style={{background:"#8b5cf608",border:"1px solid #8b5cf620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — THE SKLEARN API & PREPROCESSING</div>
        <LH>The universal sklearn pattern</LH>
        <Block label="Every estimator in sklearn follows this exact pattern">{`# The pattern is always:
# 1. Create the object
# 2. fit() — learn from data
# 3. transform() or predict() — apply to new data

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import numpy as np

np.random.seed(42)
X_train = np.random.randn(100, 3)
X_test  = np.random.randn(20, 3)
y_train = (X_train[:,0] > 0).astype(int)

# Preprocessor — fit on train, transform both
scaler = StandardScaler()
scaler.fit(X_train)                          # learn mean and std
X_train_s = scaler.transform(X_train)       # apply to train
X_test_s  = scaler.transform(X_test)        # apply to test (same params!)

# fit_transform is a shortcut for the train set only
X_train_s = scaler.fit_transform(X_train)   # fit + transform in one

# Model — same pattern
model = LogisticRegression(random_state=42)
model.fit(X_train_s, y_train)               # learn from labeled data
preds = model.predict(X_test_s)            # classify new samples
probs = model.predict_proba(X_test_s)[:,1]  # probability of class 1`}</Block>
        <LH>Preprocessing tools you will use constantly</LH>
        <Block label="Try each preprocessor — notice what changes about the data">{`import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder

np.random.seed(42)
data = np.array([10, 200, 50, 150, 30, 500]).reshape(-1,1)

# StandardScaler: mean=0, std=1 (use for most models)
ss = StandardScaler()
print("StandardScaler:", ss.fit_transform(data).flatten().round(2))

# MinMaxScaler: range [0,1] (use for neural nets, KNN)
mm = MinMaxScaler()
print("MinMaxScaler:  ", mm.fit_transform(data).flatten().round(2))

# Encoding categories
categories = ['Month-to-month','One year','Two year','Month-to-month']
le = LabelEncoder()
print("LabelEncoder:  ", le.fit_transform(categories))
# [0, 1, 2, 0] — ordinal encoding, fine for tree models

# OneHotEncoder creates binary columns (for linear models)
ohe = OneHotEncoder(sparse_output=False)
print("OneHotEncoder:\n", ohe.fit_transform(np.array(categories).reshape(-1,1)))`}</Block>
        <Tip>Use StandardScaler for linear models and SVMs. Use MinMaxScaler for neural networks and KNN. Use LabelEncoder only for tree models (they handle ordinal encoding). Use OneHotEncoder for linear models.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"scaler.fit_transform(X_train) vs scaler.transform(X_test) — why different?",options:["fit_transform is faster","fit() learns parameters from train only — applying it to test would leak test statistics into training","transform() is deprecated","No difference"],answer:"fit() learns parameters from train only — applying it to test would leak test statistics into training",explanation:"fit() learns mean and std from the data. If you fit on the full dataset, test set statistics influence the scaler — data leakage. Always fit on train, then transform both."},
          {q:"A sklearn Pipeline with steps [('scaler', StandardScaler()), ('model', RandomForest())] — what does pipeline.fit(X_train, y_train) do?",options:["Only fits the scaler","Only fits the model","Fits scaler on X_train, transforms X_train, then fits model on transformed X_train","Fits both independently"],answer:"Fits scaler on X_train, transforms X_train, then fits model on transformed X_train",explanation:"Pipeline chains steps. fit() on the pipeline: calls fit_transform on all intermediate steps, then fit on the final estimator. predict() calls transform on all steps, then predict on the final."},
          {q:"GridSearchCV with cv=5 trains how many models for 2×3 parameter grid?",options:["6","30","5","15"],answer:"30",explanation:"2×3 grid = 6 parameter combinations. Each evaluated with 5-fold CV = 6 × 5 = 30 total model fits. Plus a final fit on the full training data for the best parameters."},
        ]}/>
      </div>

      <div style={{background:"#8b5cf608",border:"1px solid #8b5cf620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — PIPELINES & GRID SEARCH</div>
        <LH>Pipelines — prevent data leakage automatically</LH>
        <Block label="Pipeline makes your code cleaner and leakage-proof">{`import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score

np.random.seed(42)
X = np.random.randn(300, 4)
y = (X[:,0]+X[:,1] > 0.5).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

# Pipeline: preprocessing + model in one object
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  LogisticRegression(class_weight='balanced', random_state=42))
])

# fit() automatically: scales train, trains model
pipe.fit(X_train, y_train)

# predict() automatically: scales test, predicts
preds = pipe.predict(X_test)
print("Test accuracy:", round(pipe.score(X_test, y_test), 3))

# Cross-validate the whole pipeline — no leakage possible
cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='roc_auc')
print("CV AUC:", str(round(cv_scores.mean(),3)) + " +- " + str(round(cv_scores.std(),3)))`}</Block>

        <LH>Grid Search — find the best hyperparameters</LH>
        <Block label="Let GridSearchCV do the tuning — do not tune manually">{`import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV

np.random.seed(42)
X = np.random.randn(300, 5)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

pipe = Pipeline([
    ('model', RandomForestClassifier(random_state=42, n_jobs=-1))
])

param_grid = {
    'model__n_estimators': [50, 100, 200],
    'model__max_depth':    [None, 5, 10],
    'model__min_samples_leaf': [1, 5],
}

gs = GridSearchCV(pipe, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
gs.fit(X_train, y_train)

print("Best params:", gs.best_params_)
print("Best CV AUC:", round(gs.best_score_, 3))
print("Test AUC:   ", round(gs.score(X_test, y_test), 3))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Pipeline + GridSearchCV is the professional standard" type="gold">In every real DS project: wrap your preprocessing and model in a Pipeline, then search hyperparameters with GridSearchCV or RandomizedSearchCV. This prevents data leakage, makes your code reproducible, and deploys as a single object.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Why use Pipeline instead of manual preprocessing?",options:["It's faster","Prevents data leakage in cross-validation and makes code deployable as one object","Pipeline is required by sklearn","It automatically selects features"],answer:"Prevents data leakage in cross-validation and makes code deployable as one object",explanation:"Without Pipeline, cross-validation leaks: you'd fit the scaler on all folds including the test fold. Pipeline ensures the scaler is fit only on training folds. It also means you save one object for deployment."},
          {q:"RandomizedSearchCV vs GridSearchCV — when to use Randomized?",options:["Always","Never — Grid is always better","When the hyperparameter space is large — Randomized samples efficiently","When you have less data"],answer:"When the hyperparameter space is large — Randomized samples efficiently",explanation:"GridSearchCV tries every combination — exponentially expensive with many parameters. RandomizedSearchCV samples n_iter random combinations — much faster with similar results when n_iter is large enough."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Build a Pipeline and cross-validate"
          description="Fill in the blanks to build a Pipeline with StandardScaler + LogisticRegression, then cross-validate it."
          starterCode={`import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score

np.random.seed(42)
X = np.random.randn(300, 3)
y = (X[:,0] + X[:,1] > 0).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

pipe = Pipeline([
    ('scaler', ___()),
    ('model',  ___(random_state=42))
])

pipe.fit(___, ___)
scores = cross_val_score(pipe, X_train, y_train, cv=___, scoring='roc_auc')
print("CV AUC:", str(round(scores.mean(),3)) + " +- " + str(round(scores.std(),3)))`}
          hint="StandardScaler(). LogisticRegression(random_state=42). fit(X_train, y_train). cv=5."
          validate={(out)=>out.includes("CV AUC:")&&out.includes("+-")}
        />
      </div>

      </div>
      </LessonWrapper>
    )
  },
];
LESSONS.push(...ML_LESSONS);


const ADVANCED_ML_LESSONS = [
  {
    id:"adv-xgboost", title:"XGBoost & Gradient Boosting", subtitle:"The algorithm that wins tabular ML competitions",
    emoji:"⚡", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-xgboost" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Boosting Intuition","XGBoost Code","✓ Quiz","Hyperparameters","vs Random Forest","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — HOW BOOSTING WORKS</div>
        <LH>Gradient Boosting — trees that learn from each other's mistakes</LH>
        <LP>Random Forest builds trees in parallel and averages them. XGBoost builds trees sequentially — each new tree focuses specifically on the errors the previous trees made. This sequential correction is why it outperforms Random Forest on most tabular datasets.</LP>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",color:"#7eb8f7",title:"Train a simple tree",desc:"Start with a weak model. It makes predictions — many of them wrong."},
            {n:"02",color:"#6dd6a0",title:"Calculate residuals",desc:"Find exactly which predictions were wrong and by how much."},
            {n:"03",color:"#f7c96e",title:"Train next tree on residuals",desc:"The new tree learns to predict the errors of the previous trees."},
            {n:"04",color:"#a78bfa",title:"Add tree × learning_rate",desc:"Add the correction (scaled by learning rate) to improve predictions."},
            {n:"05",color:"#f28b82",title:"Repeat N times",desc:"Each tree makes the ensemble slightly better. After 100-500 trees you have a powerful model."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:12,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <LH>XGBoost in code</LH>
        <Block label="Try changing max_depth and learning_rate — watch train vs test AUC">{`from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import numpy as np

np.random.seed(42)
n = 500
X = np.random.randn(n, 5)
y = ((X[:,0]+X[:,1] > 0.3) & (X[:,2] < 1) | (X[:,3] > 1.5)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

model = GradientBoostingClassifier(
    n_estimators=100,      # number of trees
    learning_rate=0.1,     # step size — lower = more robust
    max_depth=4,           # depth per tree — lower = less overfit
    subsample=0.8,         # fraction of data per tree
    random_state=42
)
model.fit(X_train, y_train)

tr_auc = roc_auc_score(y_train, model.predict_proba(X_train)[:,1])
te_auc = roc_auc_score(y_test,  model.predict_proba(X_test)[:,1])
print("Train AUC:", round(tr_auc,3))
print("Test AUC: ", round(te_auc,3))
print("Gap:      ", round(tr_auc-te_auc,3), "(< 0.05 = good)")`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"What makes XGBoost different from Random Forest?",options:["XGBoost uses deeper trees","XGBoost builds trees sequentially, each correcting previous errors","XGBoost uses more features","XGBoost is always faster"],answer:"XGBoost builds trees sequentially, each correcting previous errors",explanation:"Random Forest builds trees in parallel and averages. XGBoost builds one by one, each focused on fixing the previous ensemble's mistakes — this is gradient boosting."},
          {q:"learning_rate=0.01 vs 0.3 — which is more robust?",options:["0.3 — faster learning","0.01 — smaller steps, less overfitting","They are identical","Depends on max_depth"],answer:"0.01 — smaller steps, less overfitting",explanation:"Smaller learning rate means each tree contributes less. You need more trees but the model is more robust and less prone to overfitting."},
          {q:"Train AUC=0.98, Test AUC=0.71. What should you try?",options:["Increase n_estimators","Decrease max_depth, lower learning_rate, increase subsample","Add more features","Remove test set"],answer:"Decrease max_depth, lower learning_rate, increase subsample",explanation:"Large train-test gap = overfitting. Simpler trees (lower max_depth), smaller steps (lower learning_rate), and data sampling (subsample < 1) all reduce overfitting."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — HYPERPARAMETERS & COMPARISON</div>
        <LH>Key hyperparameters</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {param:"n_estimators",val:"100–500",tip:"More trees = better up to a point, then plateaus. Use early stopping."},
            {param:"learning_rate",val:"0.05–0.1",tip:"Lower = more robust. Pair with higher n_estimators."},
            {param:"max_depth",val:"3–6",tip:"Shallow trees overfit less. Start at 4."},
            {param:"subsample",val:"0.7–0.9",tip:"Train each tree on a random fraction. Reduces overfitting."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"8px 14px",background:"#0d1520",borderRadius:8,border:"1px solid #1e2a3a",alignItems:"flex-start"}}>
              <code style={{color:"#f7c96e",fontSize:11,minWidth:120,flexShrink:0}}>{item.param}</code>
              <span style={{color:"#6dd6a0",fontSize:11,minWidth:70,flexShrink:0}}>{item.val}</span>
              <span style={{color:"#8b87a8",fontSize:11}}>{item.tip}</span>
            </div>
          ))}
        </div>
        <Compare items={[
          {label:"Random Forest",color:"#6dd6a0",text:"Trees in parallel. Easy to tune. Great baseline. Less prone to overfitting. Start here."},
          {label:"XGBoost",color:"#f7c96e",text:"Trees sequential. Higher accuracy ceiling. More tuning needed. Wins competitions."},
        ]}/>
        <Callout icon="★" color="#f7c96e" title="Gold rule" type="gold">Always start with Random Forest as baseline. Switch to XGBoost when you need to squeeze more performance. The difference is usually 1-3% AUC — worth it for production models, not worth it for quick prototypes.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"feature_importances_ in XGBoost measures:",options:["SHAP values","How much each feature reduced the loss across all trees","Pearson correlation","P-value significance"],answer:"How much each feature reduced the loss across all trees",explanation:"Feature importance = average reduction in loss from splits on that feature across all trees. Use SHAP for more reliable and local explanations."},
          {q:"When would you choose Random Forest over XGBoost?",options:["Never — XGBoost always wins","Quick baseline, limited tuning time, small dataset","More than 100 features","When you need probabilities"],answer:"Quick baseline, limited tuning time, small dataset",explanation:"Random Forest works well out of the box. XGBoost needs tuning to shine. For prototyping start with RF. For competition/production, tune XGBoost."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Train gradient boosting and print feature importances"
          description="Fill in the blanks to train a GradientBoostingClassifier with 50 trees, lr=0.1, then print importances sorted descending."
          starterCode={`from sklearn.ensemble import GradientBoostingClassifier
import numpy as np

np.random.seed(42)
X = np.random.randn(200, 4)
y = ((X[:,0]+X[:,1] > 0) | (X[:,2] < -1)).astype(int)
names = ['tenure','charges','calls','age']

model = ___(n_estimators=___, learning_rate=___, random_state=42)
model.fit(X, y)

for name, imp in sorted(zip(names, model.___), key=lambda x: -x[1]):
    print(name + ": " + str(round(imp,3)))`}
          hint="GradientBoostingClassifier(n_estimators=50, learning_rate=0.1). model.feature_importances_."
          validate={(out)=>out.includes("tenure")&&out.includes("charges")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {
    id:"adv-lightgbm", title:"LightGBM & CatBoost", subtitle:"Faster boosting for large datasets",
    emoji:"🚀", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-lightgbm" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Why LightGBM","LightGBM Code","✓ Quiz","CatBoost","Choosing Between","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f7c96e" title="Why learn these?">LightGBM and CatBoost appear in top Kaggle solutions constantly. LightGBM is 5-10x faster than XGBoost on large datasets. CatBoost handles categorical features without encoding. Both can drop into your existing sklearn workflow.</Callout>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — LIGHTGBM</div>
        <LH>LightGBM — leaf-wise tree growth</LH>
        <LP>XGBoost grows trees level by level. LightGBM grows leaf by leaf — only expanding the leaf that reduces loss the most. This makes it faster while achieving similar or better accuracy.</LP>
        <Compare items={[
          {label:"XGBoost (level-wise)",color:"#7eb8f7",text:"Grows all leaves at each depth level. Balanced trees. More stable."},
          {label:"LightGBM (leaf-wise)",color:"#f7c96e",text:"Grows the most promising leaf at each step. Faster. Can overfit on small data — use min_data_in_leaf."},
        ]}/>
        <Block label="LightGBM sklearn API — drops in like any sklearn model">{`# pip install lightgbm
import lightgbm as lgb
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(500, 8)
y = ((X[:,0]+X[:,1] > 0.5) | (X[:,2] < -1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    num_leaves=31,          # key param: max leaves per tree (replaces max_depth)
    min_child_samples=20,   # min samples per leaf (prevents overfitting on small data)
    class_weight='balanced',
    random_state=42,
    verbose=-1
)
model.fit(X_train, y_train)
probs = model.predict_proba(X_test)[:,1]
print("LightGBM AUC:", round(roc_auc_score(y_test, probs), 3))`}</Block>
        <Tip>In LightGBM, <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>num_leaves</code> is the most important parameter — it controls model complexity like max_depth does in XGBoost. Keep it between 15 and 63 for most problems.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"LightGBM is faster than XGBoost because:",options:["It uses fewer trees","Leaf-wise growth only expands the most promising leaf","It uses GPU by default","It ignores some features"],answer:"Leaf-wise growth only expands the most promising leaf",explanation:"XGBoost grows level by level (all nodes at depth k before depth k+1). LightGBM grows leaf by leaf — skipping unpromising branches. Same accuracy, much faster on large datasets."},
          {q:"CatBoost's main advantage over XGBoost is:",options:["Always higher accuracy","Handles categorical features natively without encoding","Faster training","No hyperparameters to tune"],answer:"Handles categorical features natively without encoding",explanation:"CatBoost uses an ordered target statistics encoding that prevents data leakage. You pass cat_features=[...] and it handles encoding internally — no get_dummies needed."},
          {q:"On a dataset with 1 million rows, which would you try first?",options:["Random Forest","XGBoost","LightGBM","Logistic Regression"],answer:"LightGBM",explanation:"LightGBM is specifically designed for large datasets. Its leaf-wise growth and histogram-based algorithms make it 5-10x faster than XGBoost on millions of rows."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — CATBOOST & CHOOSING</div>
        <LH>CatBoost — no encoding needed</LH>
        <Block label="Pass categorical columns directly — no get_dummies">{`# pip install catboost
from catboost import CatBoostClassifier
import numpy as np
import pandas as pd

np.random.seed(42)
df = pd.DataFrame({
    'contract': np.random.choice(['Month-to-month','One year','Two year'], 200),
    'internet': np.random.choice(['Fiber','DSL','None'], 200),
    'tenure':   np.random.randint(1,73,200),
    'charges':  np.random.normal(65,20,200),
    'churn':    np.random.binomial(1,0.27,200)
})

X = df[['contract','internet','tenure','charges']]
y = df['churn']

# Tell CatBoost which columns are categorical
cat_features = ['contract','internet']

model = CatBoostClassifier(
    iterations=200,
    learning_rate=0.05,
    cat_features=cat_features,  # handles encoding internally
    random_state=42,
    verbose=False
)
model.fit(X, y)
print("CatBoost trained — no encoding needed!")`}</Block>
        <LH>When to use which</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {algo:"XGBoost",when:"Your go-to. Mature, well-documented, great on most tabular problems.",color:"#7eb8f7"},
            {algo:"LightGBM",when:"Large datasets (> 100k rows). When training speed matters. Competitions.",color:"#6dd6a0"},
            {algo:"CatBoost",when:"Many categorical features. When you want to skip encoding entirely.",color:"#f7c96e"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"8px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${item.color}22`}}>
              <span style={{color:item.color,fontWeight:700,fontSize:12,minWidth:90,flexShrink:0}}>{item.algo}</span>
              <span style={{color:"#8b87a8",fontSize:12}}>{item.when}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"num_leaves in LightGBM controls:",options:["Number of trees","Maximum leaves per tree — the main complexity parameter","Learning rate","Subsample fraction"],answer:"Maximum leaves per tree — the main complexity parameter",explanation:"num_leaves replaces max_depth as the primary complexity control in LightGBM. More leaves = more complex model. Keep between 15-63 for most problems."},
          {q:"Which algorithm would you pick for a dataset with 15 categorical columns?",options:["XGBoost — always best","LightGBM — fastest","CatBoost — handles categoricals natively","Random Forest — simpler"],answer:"CatBoost — handles categoricals natively",explanation:"CatBoost's ordered target statistics handle high-cardinality categoricals without the data leakage risk of standard target encoding. You don't need get_dummies at all."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Compare GradientBoosting vs sklearn baseline"
          description="Train GradientBoostingClassifier and LogisticRegression on the same data. Print AUC for both."
          starterCode={`import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(300, 5)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

for name, model in [
    ("Logistic", ___()),
    ("GradBoost", ___(n_estimators=100, random_state=42))
]:
    model.fit(X_train, y_train)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
    print(name + " AUC: " + str(round(auc,3)))`}
          hint="LogisticRegression(). GradientBoostingClassifier(n_estimators=100, random_state=42)."
          validate={(out)=>out.includes("Logistic AUC:")&&out.includes("GradBoost AUC:")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {
    id:"adv-shap", title:"SHAP & Model Explainability", subtitle:"Why did the model predict this?",
    emoji:"🔍", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-shap" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Why Explainability","SHAP Values","✓ Quiz","Global vs Local","Business Use","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — SHAP VALUES</div>
        <LH>Why explainability matters</LH>
        <LP>"Why did the model predict this customer will churn?" — stakeholders, regulators, and customers all ask this. Feature importance answers globally. SHAP answers for every individual prediction.</LP>
        <Compare items={[
          {label:"Feature Importance",color:"#7eb8f7",text:"Global: 'tenure matters most overall'. Cannot explain individual predictions."},
          {label:"SHAP Values",color:"#f7c96e",text:"Local + Global: 'for THIS customer, short tenure pushed churn probability up by 0.18'. Explains every prediction."},
        ]}/>
        <LH>Computing SHAP values</LH>
        <Block label="Try running this — each row shows how each feature pushed the prediction">{`import numpy as np
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 400
tenure  = np.random.randint(1,73,n)
charges = 20 + np.random.normal(0,20,n) - tenure*0.3
calls   = np.maximum(0, 6 - tenure*0.1 + np.random.normal(0,1,n)).astype(int)
churn   = ((charges>60)|(tenure<6)|(calls>6)).astype(int)

X = np.column_stack([tenure,charges,calls])
y = churn
feature_names = ['tenure','charges','support_calls']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Compute SHAP values
explainer   = shap.TreeExplainer(rf)
shap_values = explainer.shap_values(X_test)  # shape: (n_samples, n_features, n_classes)

# SHAP for class 1 (churn)
sv = shap_values[:,:,1] if len(shap_values.shape)==3 else shap_values[1]

print("SHAP values for first 3 test customers (churn class):")
for i in range(min(3, len(X_test))):
    print("Customer " + str(i+1) + ":")
    for feat, val in zip(feature_names, sv[i]):
        direction = "-> higher churn" if val > 0 else "-> lower churn"
        print("  " + feat.ljust(14) + str(round(val,3)) + " " + direction)`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"SHAP value of -0.15 for 'tenure' on a prediction means:",options:["tenure reduced the prediction by 0.15 vs the baseline","tenure is 15% accurate","tenure has 15% importance globally","The model is 85% confident"],answer:"tenure reduced the prediction by 0.15 vs the baseline",explanation:"SHAP values are additive contributions to the prediction relative to the model's average. Negative = this feature pushed the prediction down (toward not churning)."},
          {q:"Feature importance says 'tenure is most important'. A SHAP waterfall shows tenure pushed THIS customer's churn probability down. Both can be true because:",options:["They can't both be true","Feature importance is global (average effect); SHAP is local (this specific customer)","SHAP overrides feature importance","The model is broken"],answer:"Feature importance is global (average effect); SHAP is local (this specific customer)",explanation:"A long-tenure customer benefits from their loyalty (SHAP negative), even though tenure is globally the most discriminative feature. Global importance ≠ local effect direction."},
          {q:"When would a regulator require SHAP over feature importance?",options:["Never — feature importance is sufficient","When explaining individual credit or insurance decisions","Only for neural networks","When accuracy > 90%"],answer:"When explaining individual credit or insurance decisions",explanation:"Financial and insurance regulations (EU GDPR, US fair lending) require explanations for individual decisions. Feature importance explains the model globally. SHAP explains each specific decision."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — GLOBAL SUMMARY & BUSINESS USE</div>
        <LH>Global SHAP — which features matter most overall</LH>
        <Block label="Mean |SHAP| gives a reliable global feature ranking">{`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 400
tenure  = np.random.randint(1,73,n)
charges = 20 + np.random.normal(0,20,n) - tenure*0.3
calls   = np.maximum(0, 6 - tenure*0.1 + np.random.normal(0,1,n)).astype(int)
age     = np.random.randint(18,70,n)
churn   = ((charges>60)|(tenure<6)|(calls>6)).astype(int)

X = np.column_stack([tenure,charges,calls,age])
y = churn
names = ['tenure','charges','support_calls','age']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Approximate global SHAP via feature importances (no shap package needed)
importances = rf.feature_importances_
print("Global feature ranking (approx SHAP):")
for name, imp in sorted(zip(names, importances), key=lambda x: -x[1]):
    bar = '|' * int(imp * 50)
    print(name.ljust(15) + bar + " " + str(round(imp,3)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="Interview answer for explainability" type="gold">When asked 'how would you explain your model to a business stakeholder?' — say: (1) globally, use feature importance or mean |SHAP| to show which factors drive predictions; (2) for individual decisions, use SHAP waterfall to show exactly what pushed a specific prediction up or down. This is what real DS teams do.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"A SHAP waterfall plot shows: base=0.27, tenure=-0.18, charges=+0.31. What is the predicted churn probability?",options:["0.27","0.40","0.18","0.58"],answer:"0.40",explanation:"SHAP values are additive: 0.27 (base) - 0.18 (tenure pushes down) + 0.31 (charges pushes up) = 0.40. SHAP values sum to the prediction minus the base rate."},
          {q:"When should you use SHAP instead of regular feature importance?",options:["Always","When you need local explanations for individual predictions or when direction matters","Never — too slow","Only for neural networks"],answer:"When you need local explanations for individual predictions or when direction matters",explanation:"Feature importance tells you which features matter globally. SHAP tells you how much and in which direction for each individual prediction — essential for explaining specific decisions."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Compute feature importance as SHAP proxy"
          description="Train a Random Forest and print feature importances as a ranked bar chart using text."
          starterCode={`import numpy as np
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
X = np.random.randn(300, 4)
y = ((X[:,0]+X[:,1] > 0.3) | (X[:,2] < -1)).astype(int)
names = ['tenure','charges','calls','age']

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(___, ___)

importances = rf.___
for name, imp in sorted(zip(names, ___), key=lambda x: -x[1]):
    bar = '|' * int(imp * 50)
    print(name.ljust(8) + bar + " " + str(round(imp, 3)))`}
          hint="rf.fit(X, y). rf.feature_importances_. zip(names, importances)."
          validate={(out)=>out.includes("tenure")&&out.includes("|")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {
    id:"adv-feature-eng", title:"Feature Engineering", subtitle:"The skill that separates good models from great ones",
    emoji:"🔧", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-feature-eng" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Interaction Features","Encoding","✓ Quiz","Date Features","Target Encoding","Kaggle Patterns","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — INTERACTION & ENCODING FEATURES</div>
        <LH>Interaction features — capture combined effects</LH>
        <LP>A customer with high charges AND short tenure is very different from one with high charges AND long tenure. Interaction features let linear models capture this — tree models discover it automatically, but explicit features still help.</LP>
        <Block label="Try adding your own interaction — does it improve the model?">{`import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

np.random.seed(42)
n = 400
tenure  = np.random.randint(1,73,n)
charges = 20 + np.random.normal(0,20,n) - tenure*0.3
churn   = ((charges>60)|(tenure<6)).astype(int)

df = pd.DataFrame({'tenure':tenure,'charges':charges,'churn':churn})

# Baseline features
X_base = df[['tenure','charges']]
rf = RandomForestClassifier(n_estimators=50, random_state=42)
base_auc = cross_val_score(rf, X_base, df['churn'], cv=5, scoring='roc_auc').mean()

# Add interaction features
df['charge_per_tenure']    = df['charges'] / (df['tenure'] + 1)
df['is_new_high_charge']   = ((df['tenure'] < 6) & (df['charges'] > 60)).astype(int)
df['tenure_bucket']        = pd.cut(df['tenure'], bins=[0,12,36,99], labels=[0,1,2]).astype(int)

X_eng = df[['tenure','charges','charge_per_tenure','is_new_high_charge','tenure_bucket']]
eng_auc = cross_val_score(rf, X_eng, df['churn'], cv=5, scoring='roc_auc').mean()

print("Base AUC:        ", round(base_auc,3))
print("Engineered AUC:  ", round(eng_auc,3))
print("Improvement:     +", round(eng_auc-base_auc,3))`}</Block>
        <LH>Encoding categorical variables</LH>
        <Block label="Three encoding strategies — know when to use each">{`import numpy as np
import pandas as pd

contracts = pd.Series(['Month-to-month','One year','Two year','Month-to-month','One year'])

# 1. Label encoding — use for tree models (preserves ordinality if meaningful)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
print("Label:", le.fit_transform(contracts))  # [0, 1, 2, 0, 1]

# 2. One-hot encoding — use for linear models
dummies = pd.get_dummies(contracts, prefix='contract')
print("One-hot:\n", dummies)

# 3. Ordinal encoding — when category has a natural order
order = {'Month-to-month':0, 'One year':1, 'Two year':2}
print("Ordinal:", contracts.map(order).values)  # [0, 1, 2, 0, 1]`}</Block>
        <Tip>Tree models (Random Forest, XGBoost) work fine with label encoding. Linear models (Logistic Regression, SVM) need one-hot encoding — label encoding implies a false ordinal relationship.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"'charge_per_tenure' is an example of:",options:["Data leakage","An interaction feature combining two raw features into a business-meaningful ratio","A target encoding","Polynomial feature"],answer:"An interaction feature combining two raw features into a business-meaningful ratio",explanation:"Interaction features capture the combined effect of two variables. charge/tenure captures 'how much do they pay per month of loyalty' — more informative than either alone."},
          {q:"Why use one-hot encoding for logistic regression but not Random Forest?",options:["Random Forest is faster","Label encoding implies false ordinal relationship to linear models; trees split on exact values so it doesn't matter","One-hot is always better","Logistic regression only handles binary inputs"],answer:"Label encoding implies false ordinal relationship to linear models; trees split on exact values so it doesn't matter",explanation:"Logistic regression treats label-encoded 0/1/2 as meaning '2 is twice as important as 1'. Tree models split by exact value so the numeric representation doesn't imply order."},
          {q:"Target encoding risk:",options:["Too many features","Data leakage if full dataset is encoded before train/test split","Only works for binary targets","Increases training time"],answer:"Data leakage if full dataset is encoded before train/test split",explanation:"Target encoding replaces a category with mean(target). If computed on full data, test set targets leak into training. Always compute target encoding on train fold only — use cross-validation."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — DATE FEATURES & KAGGLE PATTERNS</div>
        <LH>Date/time features — extract hidden signals</LH>
        <Block label="Dates contain many features — extract them all">{`import pandas as pd
import numpy as np

dates = pd.to_datetime(['2023-01-15','2023-06-20','2023-12-03','2024-03-10'])
df = pd.DataFrame({'signup_date': dates, 'charges': [65,72,58,89]})

# Extract everything useful
df['year']          = df['signup_date'].dt.year
df['month']         = df['signup_date'].dt.month
df['day_of_week']   = df['signup_date'].dt.dayofweek   # 0=Mon, 6=Sun
df['quarter']       = df['signup_date'].dt.quarter
df['is_weekend']    = (df['signup_date'].dt.dayofweek >= 5).astype(int)
df['days_since']    = (pd.Timestamp.now() - df['signup_date']).dt.days

# Cyclic encoding — month 12 and month 1 are adjacent
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

print(df[['month','is_weekend','days_since','month_sin','month_cos']])`}</Block>
        <Callout icon="★" color="#f7c96e" title="Kaggle patterns" type="gold">Top Kaggle solutions consistently use: (1) ratio features (A/B), (2) difference features (A-B), (3) grouped statistics (mean/std of target per category), (4) date features, (5) domain-specific features from reading the problem description carefully.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Cyclic encoding (sin/cos) of month is better than raw month values because:",options:["Sin/cos are faster to compute","Month 12 and month 1 are adjacent — raw integers make them look far apart","Cyclic encoding reduces dimensionality","It prevents overfitting"],answer:"Month 12 and month 1 are adjacent — raw integers make them look far apart",explanation:"With raw month (1-12), the model sees December (12) and January (1) as 11 apart. sin/cos encoding makes them adjacent. Same applies to hours of day, day of week."},
          {q:"'is_new_high_charge' = (tenure<6) & (charges>60) is an example of:",options:["Target encoding","A binary interaction feature capturing a high-risk business segment","Data leakage","Polynomial feature"],answer:"A binary interaction feature capturing a high-risk business segment",explanation:"This feature encodes domain knowledge: new customers with high charges churn at much higher rates. Explicit binary flags for known risky segments are often among the most predictive features."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Engineer features and measure improvement"
          description="Add two interaction features and check if AUC improves."
          starterCode={`import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

np.random.seed(42)
n = 300
df = pd.DataFrame({
    'tenure':  np.random.randint(1,73,n),
    'charges': np.random.normal(65,20,n),
    'calls':   np.random.randint(0,10,n),
})
df['churn'] = ((df['charges']>70)|(df['tenure']<6)|(df['calls']>7)).astype(int)

# Baseline
X_base = df[['tenure','charges','calls']]
rf = RandomForestClassifier(n_estimators=50, random_state=42)
base = cross_val_score(rf, X_base, df['churn'], cv=5, scoring='roc_auc').mean()

# Add interaction features
df['charge_per_tenure'] = df['charges'] / (df['tenure'] + ___)
df['is_risky'] = ((df['tenure'] < ___) & (df['calls'] > ___)).astype(int)

X_eng = df[['tenure','charges','calls','charge_per_tenure','is_risky']]
eng = cross_val_score(rf, X_eng, df['churn'], cv=5, scoring='roc_auc').mean()

print("Base AUC:", round(base,3))
print("Eng AUC: ", round(eng,3))`}
          hint="df['charges'] / (df['tenure'] + 1). tenure < 12, calls > 5."
          validate={(out)=>out.includes("Base AUC:")&&out.includes("Eng AUC:")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {
    id:"adv-pipelines", title:"ML Pipelines & Production", subtitle:"From notebook to production-ready code",
    emoji:"⚙️", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-pipelines" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Pipeline Design","ColumnTransformer","✓ Quiz","Custom Transformers","Production","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — COLUMNTRANSFORMER + PIPELINE</div>
        <LH>ColumnTransformer — apply different steps to different columns</LH>
        <LP>Real datasets have numeric and categorical features that need different preprocessing. ColumnTransformer applies the right transformation to each column type — all in one sklearn-compatible object.</LP>
        <Block label="The professional way to preprocess mixed data">{`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score

np.random.seed(42)
n = 300
df = pd.DataFrame({
    'tenure':   np.random.randint(1,73,n),
    'charges':  np.random.normal(65,20,n),
    'contract': np.random.choice(['Month-to-month','One year','Two year'],n),
    'internet': np.random.choice(['Fiber','DSL','None'],n),
    'churn':    np.random.binomial(1,0.27,n)
})

X = df[['tenure','charges','contract','internet']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

num_features = ['tenure','charges']
cat_features = ['contract','internet']

num_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
])
cat_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore')),
])

preprocessor = ColumnTransformer([
    ('num', num_pipe, num_features),
    ('cat', cat_pipe, cat_features),
])

full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])

scores = cross_val_score(full_pipeline, X_train, y_train, cv=5, scoring='roc_auc')
print("CV AUC:", str(round(scores.mean(),3)) + " +- " + str(round(scores.std(),3)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="This is production-level code" type="gold">This full Pipeline with ColumnTransformer is the standard for professional DS work. It handles mixed data types, prevents leakage automatically in CV, and saves as one object for deployment with <code style={{background:"#2a1a00",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#f7c96e"}}>joblib.dump(full_pipeline, 'model.pkl')</code>.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"ColumnTransformer applies:",options:["The same transformation to all columns","Different transformations to different column subsets","Only scaling","Only encoding"],answer:"Different transformations to different column subsets",explanation:"ColumnTransformer lets you define separate preprocessing pipelines for numeric vs categorical columns, then combines them. The result is a single sklearn-compatible transformer."},
          {q:"Pipeline with ColumnTransformer vs manual preprocessing — main advantage?",options:["Faster computation","No leakage in cross-validation — scaler/encoder fitted only on train fold","Automatic hyperparameter tuning","Handles more data types"],answer:"No leakage in cross-validation — scaler/encoder fitted only on train fold",explanation:"Manual preprocessing before CV leaks test fold statistics into training. Pipeline ensures all preprocessing is fit inside each CV fold on train data only."},
          {q:"handle_unknown='ignore' in OneHotEncoder does what?",options:["Raises an error on new categories","Encodes new categories as all zeros — safe for production","Replaces unknown with most frequent","Drops the column"],answer:"Encodes new categories as all zeros — safe for production",explanation:"Production data often has new category values not seen in training. handle_unknown='ignore' encodes them as all zeros instead of crashing. Essential for any deployed model."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — SAVING & LOADING MODELS</div>
        <LH>Saving a pipeline for production</LH>
        <Block label="Train once, deploy anywhere">{`import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

np.random.seed(42)
X = np.random.randn(300, 4)
y = (X[:,0]+X[:,1] > 0.5).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  RandomForestClassifier(n_estimators=100, random_state=42))
])
pipe.fit(X_train, y_train)
print("Test score:", round(pipe.score(X_test, y_test),3))

# Save the whole pipeline (preprocessing + model)
# joblib.dump(pipe, 'churn_model_v1.pkl')

# Load and use anywhere
# pipe_loaded = joblib.load('churn_model_v1.pkl')
# preds = pipe_loaded.predict(new_data)
print("Pipeline ready for deployment!")`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"joblib.dump(pipeline, 'model.pkl') saves:",options:["Only the model weights","The full pipeline including preprocessing steps and model","Only the preprocessing","A Python script"],answer:"The full pipeline including preprocessing steps and model",explanation:"joblib serializes the entire Pipeline object — including fitted scalers, encoders, imputers, and the model. Loading it gives you a complete predict() system that handles raw input."},
          {q:"SimpleImputer(strategy='median') in a Pipeline — when is it fitted?",options:["Before train/test split","On the full dataset","On the training data only during fit()","On the test data during transform()"],answer:"On the training data only during fit()",explanation:"When you call pipeline.fit(X_train), the imputer's fit() is called on X_train only. This ensures the median is computed from training data, not contaminated by test set values."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Build a ColumnTransformer pipeline"
          description="Fill in the blanks to build a pipeline with separate numeric and categorical preprocessing."
          starterCode={`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
df = pd.DataFrame({
    'tenure':   np.random.randint(1,73,200),
    'charges':  np.random.normal(65,20,200),
    'contract': np.random.choice(['Monthly','Annual'],200),
    'churn':    np.random.binomial(1,0.27,200)
})
X = df[['tenure','charges','contract']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

preprocessor = ColumnTransformer([
    ('num', ___(  ), ['tenure','charges']),
    ('cat', ___(handle_unknown='ignore'), ['contract']),
])

pipe = Pipeline([
    ('prep', ___),
    ('model', RandomForestClassifier(n_estimators=50, random_state=42))
])

pipe.fit(___, ___)
print("Test score:", round(pipe.score(X_test, y_test), 3))`}
          hint="StandardScaler(). OneHotEncoder(). preprocessor. X_train, y_train."
          validate={(out)=>out.includes("Test score:")&&!isNaN(parseFloat(out.split(":")[1]))}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {
    id:"adv-hypertuning", title:"Hyperparameter Tuning", subtitle:"Find the best parameters without guessing",
    emoji:"🎯", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <LessonWrapper id="adv-hypertuning" color="#f7c96e">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Search Strategies","GridSearchCV","✓ Quiz","RandomizedSearch","Optuna","Best Practices","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f7c96e":"transparent",border:`2px solid ${i===0?"#f7c96e":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f7c96e":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f7c96e" title="Never tune manually">Manually trying hyperparameter combinations is inefficient and non-reproducible. GridSearchCV, RandomizedSearchCV, and Optuna do it systematically and save the results. This lesson shows you all three.</Callout>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — GRID & RANDOMIZED SEARCH</div>
        <LH>GridSearchCV — exhaustive search</LH>
        <Block label="Try every combination — good for small grids">{`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
X = np.random.randn(300, 5)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

pipe = Pipeline([
    ('model', RandomForestClassifier(random_state=42, n_jobs=-1))
])

# Grid: 3 x 2 x 2 = 12 combinations x 5 folds = 60 model fits
param_grid = {
    'model__n_estimators':    [50, 100, 200],
    'model__max_depth':       [None, 10],
    'model__min_samples_leaf':[1, 5],
}

gs = GridSearchCV(pipe, param_grid, cv=5, scoring='roc_auc', n_jobs=-1, verbose=0)
gs.fit(X_train, y_train)

print("Best params:", gs.best_params_)
print("Best CV AUC:", round(gs.best_score_, 3))
print("Test AUC:   ", round(gs.score(X_test, y_test), 3))`}</Block>
        <LH>RandomizedSearchCV — efficient for large grids</LH>
        <Block label="Samples random combinations — faster than Grid for many params">{`import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from scipy.stats import randint, uniform

np.random.seed(42)
X = np.random.randn(400, 6)
y = ((X[:,0]+X[:,1] > 0.5) | (X[:,2] < -1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

# Much larger search space — Grid would take hours
param_dist = {
    'n_estimators':    randint(50, 300),       # random int between 50-300
    'learning_rate':   uniform(0.01, 0.2),     # random float 0.01-0.21
    'max_depth':       randint(2, 8),
    'subsample':       uniform(0.6, 0.4),      # 0.6 to 1.0
    'min_samples_leaf':randint(1, 20),
}

rs = RandomizedSearchCV(
    GradientBoostingClassifier(random_state=42),
    param_dist,
    n_iter=20,           # try 20 random combinations (not all)
    cv=5,
    scoring='roc_auc',
    random_state=42,
    n_jobs=-1
)
rs.fit(X_train, y_train)
print("Best params:", rs.best_params_)
print("Best AUC:   ", round(rs.best_score_, 3))`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"GridSearchCV with cv=5 and a 3x3 grid trains how many models?",options:["9","45","15","3"],answer:"45",explanation:"3x3 = 9 parameter combinations. Each evaluated with 5-fold CV = 9 x 5 = 45 total fits. Plus 1 final fit on full training data."},
          {q:"When should you use RandomizedSearchCV over GridSearchCV?",options:["Always","When the search space is large — it samples efficiently","When you have less data","When parameters are categorical"],answer:"When the search space is large — it samples efficiently",explanation:"GridSearchCV is exponential in the number of parameters. With 6 parameters and 5 options each = 15,625 combinations. Randomized samples n_iter of them — much faster with similar results."},
          {q:"param_grid key 'model__n_estimators' with double underscore means:",options:["Accessing a private attribute","Accessing n_estimators inside the 'model' step of a Pipeline","A sklearn convention for lists","An error — should be single underscore"],answer:"Accessing n_estimators inside the 'model' step of a Pipeline",explanation:"Double underscore is Pipeline's parameter syntax: 'step_name__param_name'. This lets GridSearchCV tune parameters inside nested Pipeline steps."},
        ]}/>
      </div>

      <div style={{background:"#f7c96e08",border:"1px solid #f7c96e20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — BEST PRACTICES</div>
        <LH>Tuning best practices</LH>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",color:"#6dd6a0",title:"Start with defaults",desc:"RandomForest and XGBoost defaults are already good. Tune only after you have a working baseline."},
            {n:"02",color:"#7eb8f7",title:"Tune the right parameters",desc:"n_estimators + max_depth + min_samples_leaf for RF. learning_rate + max_depth + subsample for XGBoost."},
            {n:"03",color:"#f7c96e",title:"Use CV score, not test score",desc:"Never use the test set to pick hyperparameters. Evaluate on CV. Test is for final reporting only."},
            {n:"04",color:"#f472b6",title:"Set n_jobs=-1",desc:"Parallel search uses all CPU cores. A 60-minute Grid search becomes 10 minutes on 8 cores."},
            {n:"05",color:"#a78bfa",title:"Log your results",desc:"Save best_params_ and best_score_ to a file. You need to reproduce experiments."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:12,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <Callout icon="★" color="#f7c96e" title="Optuna for serious tuning" type="gold">For production models, use Optuna — it uses Bayesian optimization to find good parameters much faster than random search. pip install optuna. It learns from previous trials to suggest better next candidates.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f7c96e",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Why should you never use test set performance to pick hyperparameters?",options:["Test set is too small","It leaks test information into model selection — your test score becomes optimistic","Test set should only have 10% of data","GridSearchCV doesn't support test sets"],answer:"It leaks test information into model selection — your test score becomes optimistic",explanation:"If you tune on test set, you've essentially trained on it. The final test score will be optimistic — overestimating real-world performance. Use CV for tuning, test only for final reporting."},
          {q:"gs.best_estimator_ gives you:",options:["The best parameter dictionary","A refitted model with best params on full training data","The CV scores per fold","The test set predictions"],answer:"A refitted model with best params on full training data",explanation:"After GridSearchCV, best_estimator_ is the model retrained with best_params_ on the entire training set (not just one CV fold). It is ready to call predict() on new data."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Run a GridSearchCV and report best params"
          description="Fill in the blanks to search over n_estimators and max_depth, then print best params and CV AUC."
          starterCode={`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV

np.random.seed(42)
X = np.random.randn(300, 4)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

param_grid = {
    'n_estimators': [50, 100],
    'max_depth':    [None, 5],
}

gs = GridSearchCV(
    RandomForestClassifier(random_state=42),
    ___,
    cv=___,
    scoring='roc_auc',
    n_jobs=-1
)
gs.fit(X_train, y_train)
print("Best params:", gs.___)
print("Best CV AUC:", round(gs.___, 3))`}
          hint="param_grid. cv=5. gs.best_params_. gs.best_score_."
          validate={(out)=>out.includes("Best params:")&&out.includes("Best CV AUC:")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
];
LESSONS.push(...ADVANCED_ML_LESSONS);


const PHASE2_LESSONS = [

  // ── FEATURE ENGINEERING
  {id:"feature-engineering", phase:"🤖 Machine Learning", emoji:"⚙️", color:"#f97316", title:"Feature Engineering", subtitle:"The skill that separates good models from great ones",
   body:()=>(
    <div>
      <LP>Feature engineering is the process of transforming raw data into features that ML models can learn from effectively. It's where domain knowledge meets math — and it's responsible for more model improvements than algorithm selection.</LP>
      <Callout icon="🧠" color="#f97316" title="The key insight">A mediocre model with great features beats a great model with mediocre features. Every time. Feature engineering is where the real leverage is.</Callout>

      <LH>1. Encoding Categorical Variables</LH>
      <LP>ML models need numbers. Categorical columns must be converted — but HOW you convert them matters.</LP>
      <Compare items={[
        {label:"Label Encoding", color:"#7eb8f7", text:"Assign integers: ['Low','Mid','High'] → [0,1,2]. Use ONLY for ordinal categories with natural order."},
        {label:"One-Hot Encoding", color:"#6dd6a0", text:"Create a binary column per category. Use for nominal categories (no order). Watch out for high cardinality."},
        {label:"Target Encoding", color:"#f7c96e", text:"Replace category with its mean target value. Powerful but risks leakage — use with cross-validation."},
      ]}/>
      <Block label="Encoding in practice">{`import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer

df = pd.DataFrame({
    'contract':  ['Month-to-month','One year','Two year','Month-to-month'],
    'size':      ['Small','Large','Medium','Small'],   # ordinal
    'city':      ['Beirut','Dubai','Cairo','Beirut'],
    'churn':     [1, 0, 0, 1]
})

# 1. Label encoding — ordinal only
size_map = {'Small': 0, 'Medium': 1, 'Large': 2}
df['size_encoded'] = df['size'].map(size_map)

# 2. One-hot encoding
df_ohe = pd.get_dummies(df, columns=['contract','city'], drop_first=True)
print(df_ohe.columns.tolist())

# 3. Target encoding (do this in cross-validation loop in practice)
target_means = df.groupby('contract')['churn'].mean()
df['contract_target_enc'] = df['contract'].map(target_means)

print(df[['contract','contract_target_enc']])`}</Block>
      <Warn>Never target-encode using the full dataset before splitting — it leaks the target into features. Use cross-validation or fit on train only.</Warn>

      <LH>2. Numerical Transformations</LH>
      <Block label="Scaling and transforming numbers">{`import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

data = pd.DataFrame({'salary': [30000,45000,52000,68000,250000],
                     'age':    [22, 28, 35, 41, 29]})

# StandardScaler — mean=0, std=1. Use for: linear models, neural nets, SVM
ss = StandardScaler()
data['salary_standard'] = ss.fit_transform(data[['salary']])

# MinMaxScaler — range [0,1]. Use for: neural nets, distance-based models
mm = MinMaxScaler()
data['salary_minmax'] = mm.fit_transform(data[['salary']])

# RobustScaler — uses median + IQR. Best when outliers exist
rs = RobustScaler()
data['salary_robust'] = rs.fit_transform(data[['salary']])

# Log transform — fix right skew BEFORE scaling
data['salary_log'] = np.log1p(data['salary'])  # log(x+1) handles zeros

print(data.round(3))`}</Block>
      <Tip>Tree-based models (Random Forest, XGBoost) don't need scaling — they split on thresholds. Scale for: linear models, SVMs, KNN, neural nets, PCA.</Tip>

      <LH>3. Creating New Features</LH>
      <LP>The best features come from thinking about the problem, not from automated tools. Ask: what combinations would a domain expert care about?</LP>
      <Block label="Feature creation examples">{`import pandas as pd
import numpy as np

df = pd.DataFrame({
    'tenure':          [1, 24, 6, 36, 12],
    'monthly_charges': [75, 45, 85, 42, 60],
    'total_charges':   [75, 1080, 510, 1512, 720],
    'num_services':    [1, 4, 2, 5, 3],
})

# Ratios — often more predictive than raw numbers
df['charge_per_month_tenure'] = df['monthly_charges'] / (df['tenure'] + 1)
df['avg_monthly_spend']       = df['total_charges'] / (df['tenure'] + 1)

# Bins — convert continuous to meaningful buckets
df['tenure_group'] = pd.cut(df['tenure'],
    bins=[0, 6, 24, 72],
    labels=['new','mid','loyal']
)

# Interaction features — multiply two features
df['value_score'] = df['monthly_charges'] * df['num_services']

# Binary flags — domain-specific thresholds
df['is_high_spender']  = (df['monthly_charges'] > 70).astype(int)
df['is_long_term']     = (df['tenure'] > 24).astype(int)
df['is_bundled']       = (df['num_services'] >= 4).astype(int)

print(df.head())`}</Block>

      <LH>4. Handling Missing Values Properly</LH>
      <Block label="Imputation strategies">{`import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer

df = pd.DataFrame({
    'age':    [25, np.nan, 35, 42, np.nan, 28],
    'income': [50000, 75000, np.nan, 90000, 60000, np.nan],
    'plan':   ['basic', np.nan, 'premium', 'basic', np.nan, 'premium']
})

# Strategy 1: SimpleImputer
num_imputer = SimpleImputer(strategy='median')   # or 'mean','most_frequent'
df[['age','income']] = num_imputer.fit_transform(df[['age','income']])

cat_imputer = SimpleImputer(strategy='most_frequent')
df[['plan']] = cat_imputer.fit_transform(df[['plan']])

# Strategy 2: KNN Imputation — uses similar rows
knn = KNNImputer(n_neighbors=2)
df_knn = knn.fit_transform(df[['age','income']])

# Strategy 3: Add missingness indicator (often informative!)
df['income_was_null'] = df['income'].isna().astype(int)
# Sometimes WHY a value is missing is more predictive than the value`}</Block>
      <Callout icon="★" color="#f7c96e" title="Interview gold">Adding a binary 'was_null' column before imputation is a powerful technique. In real datasets, missing values are often not random — they carry signal. A customer with no total_charges may be brand new.</Callout>

      <LH>5. Datetime Features</LH>
      <Block label="Extracting features from dates">{`import pandas as pd

df = pd.DataFrame({
    'signup_date':    pd.to_datetime(['2023-01-15','2023-06-03','2022-11-28']),
    'last_purchase':  pd.to_datetime(['2024-01-10','2023-12-15','2024-01-20']),
})

# Extract components
df['signup_month']   = df['signup_date'].dt.month
df['signup_dayofweek']= df['signup_date'].dt.dayofweek  # 0=Monday
df['signup_quarter'] = df['signup_date'].dt.quarter
df['signup_is_weekend'] = (df['signup_date'].dt.dayofweek >= 5).astype(int)

# Time differences — recency features
df['days_since_last_purchase'] = (
    pd.Timestamp.now() - df['last_purchase']
).dt.days

df['customer_age_days'] = (
    pd.Timestamp.now() - df['signup_date']
).dt.days

# Cyclical encoding for month (January and December are close!)
import numpy as np
df['month_sin'] = np.sin(2 * np.pi * df['signup_month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['signup_month'] / 12)

print(df)`}</Block>

      <LH>6. Feature Selection — removing what hurts</LH>
      <Block label="Select the best features">{`import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectKBest, f_classif

# Method 1: Correlation — remove highly correlated features
corr_matrix = df.corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop = [col for col in upper.columns if any(upper[col] > 0.95)]
print("Drop due to high correlation:", to_drop)

# Method 2: Feature importance from Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

importances = pd.Series(rf.feature_importances_, index=X_train.columns)
importances.sort_values(ascending=False).head(10)`}</Block>

      <Quiz questions={[
        {q:"You have 'city' column with 500 unique cities. One-hot encoding would create 500 columns. Best alternative?",options:["Label encoding","Target encoding","Drop the column","Use as-is"],answer:"Target encoding",explanation:"High cardinality columns (many unique values) explode dimensionality with OHE. Target encoding replaces each category with its mean target value — one column. Use with care to avoid leakage."},
        {q:"Which scaler is most robust to outliers?",options:["StandardScaler","MinMaxScaler","RobustScaler","No scaling needed"],answer:"RobustScaler",explanation:"RobustScaler uses median and IQR instead of mean and std. Outliers don't affect median/IQR much, so extreme values don't distort the scaling. Use when your data has significant outliers."},
        {q:"Why add a 'was_null' binary column before imputing?",options:["It improves imputation accuracy","Missingness itself can be predictive — why a value is missing is informative","Required by sklearn","It reduces dimensionality"],answer:"Missingness itself can be predictive — why a value is missing is informative",explanation:"Missing values are often non-random. A customer with no phone service recorded might be a different type of customer. The fact that it's missing carries signal beyond what any imputed value can capture."},
        {q:"df['charge_per_tenure'] = df['charges'] / df['tenure']. What type of feature engineering?",options:["Binning","Interaction feature","Ratio feature","Target encoding"],answer:"Ratio feature",explanation:"Dividing two features creates a ratio — normalizing one by the other. Charge per month of tenure is often more predictive than raw charges, because it controls for how long the customer has been active."},
        {q:"You're using Random Forest. Do you need to StandardScale your features?",options:["Yes — always scale","No — tree models split on thresholds, not distances or magnitudes","Only for the target variable","Only for categorical features"],answer:"No — tree models split on thresholds, not distances or magnitudes",explanation:"Decision trees and ensembles (RF, XGBoost) find split points. Whether salary is 50000 or 0.65 (scaled) doesn't change which split is optimal. Scale for: linear models, SVMs, KNN, neural nets, PCA."},
      ]}/>

      <CodeExercise
        title="Engineer features from customer data"
        description="Given raw customer data, create 4 new features: charge_per_service (monthly_charges / num_services), is_long_term (tenure > 24, binary), tenure_group (cut into new/mid/loyal), and log_charges (log1p of monthly_charges). Print the resulting DataFrame."
        starterCode={`import pandas as pd
import numpy as np

df = pd.DataFrame({
    'customer_id':     [1, 2, 3, 4, 5],
    'tenure':          [2, 36, 12, 48, 6],
    'monthly_charges': [75.5, 42.0, 88.0, 39.5, 65.0],
    'num_services':    [2, 4, 3, 5, 2],
})

# 1. Ratio feature
df['charge_per_service'] = df[___] / df[___]

# 2. Binary flag
df['is_long_term'] = (df['tenure'] > ___).astype(int)

# 3. Tenure buckets
df['tenure_group'] = pd.cut(df['tenure'],
    bins=[0, 6, 24, 100],
    labels=[___, ___, ___]
)

# 4. Log transform
df['log_charges'] = np.log1p(df[___])

print(df[['customer_id','charge_per_service','is_long_term',
          'tenure_group','log_charges']].round(3).to_string(index=False))`}
        hint="df['monthly_charges'] / df['num_services']. tenure > 24. labels=['new','mid','loyal']. np.log1p(df['monthly_charges'])."
        validate={(out)=>out.includes("charge_per_service")&&out.includes("is_long_term")&&out.includes("loyal")&&out.includes("log_charges")}
      />
    </div>
  )},

  // ── ML PIPELINES
  {id:"ml-pipelines", phase:"🤖 Machine Learning", emoji:"🔩", color:"#22d3ee", title:"ML Pipelines", subtitle:"Package preprocessing + model into one reproducible object",
   body:()=>(
    <div>
      <LP>An ML Pipeline bundles your preprocessing steps and model into a single object. No more "I forgot to scale the test data." No more data leakage. No more 10 lines of code to make one prediction. Pipelines are how professionals ship ML.</LP>
      <Callout icon="🧠" color="#22d3ee" title="Why Pipelines exist">The most common ML bug: fitting the scaler on all data, or forgetting to apply the same transformations to new data. Pipelines make this impossible — everything is applied consistently, automatically.</Callout>

      <LH>1. The Problem Pipelines Solve</LH>
      <Compare items={[
        {label:"Without Pipeline ❌", color:"#f28b82", text:"Fit scaler, transform train, transform test, fit model, transform new data, predict. 6 steps. Easy to forget one. Easy to leak."},
        {label:"With Pipeline ✅", color:"#6dd6a0", text:"pipeline.fit(X_train, y_train). pipeline.predict(X_new). 2 steps. Impossible to forget transformations. No leakage."},
      ]}/>
      <Block label="Basic Pipeline">{`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pandas as pd

# Load data
df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df = df.dropna()
df['Churn'] = (df['Churn'] == 'Yes').astype(int)

X = df[['tenure','MonthlyCharges','TotalCharges']]
y = df['Churn']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build pipeline — list of (name, transformer) tuples
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  LogisticRegression(random_state=42))
])

# Fit on train — scaler fits and transforms, model trains
pipeline.fit(X_train, y_train)

# Predict on test — scaler transforms, model predicts
preds = pipeline.predict(X_test)
print(classification_report(y_test, preds))

# Predict on brand new data — same pipeline, guaranteed correct
new_customer = pd.DataFrame({'tenure':[3],'MonthlyCharges':[85],'TotalCharges':[255]})
print("Churn prediction:", pipeline.predict(new_customer))`}</Block>

      <LH>2. ColumnTransformer — different transforms per column</LH>
      <LP>Real datasets have numeric AND categorical columns that need different preprocessing. ColumnTransformer handles each column type correctly.</LP>
      <Block label="ColumnTransformer + Pipeline">{`from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

# Define column groups
numeric_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']
categorical_cols = ['Contract', 'InternetService', 'PaymentMethod']

# Numeric pipeline: impute then scale
numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler())
])

# Categorical pipeline: impute then one-hot encode
categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('ohe',     OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

# Combine with ColumnTransformer
preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_transformer, numeric_cols),
    ('cat', categorical_transformer, categorical_cols)
])

# Full pipeline: preprocessor + model
full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])

# One fit call handles everything
full_pipeline.fit(X_train, y_train)
score = full_pipeline.score(X_test, y_test)
print(f"Accuracy: {score:.3f}")`}</Block>

      <LH>3. Pipelines + Cross-Validation</LH>
      <LP>Pipelines make cross-validation correct. Each fold's preprocessing is fitted only on that fold's training data — no leakage across folds.</LP>
      <Block label="Cross-validate a pipeline">{`from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import numpy as np

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  LogisticRegression(random_state=42))
])

# StratifiedKFold preserves class proportions in each fold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(
    pipeline, X, y,
    cv=cv,
    scoring='roc_auc'   # or 'f1', 'accuracy', 'recall'
)

print(f"AUC scores: {scores.round(3)}")
print(f"Mean AUC:   {scores.mean():.3f} ± {scores.std():.3f}")`}</Block>
      <Callout icon="★" color="#f7c96e" title="Always report mean ± std">A single train/test split is a lucky or unlucky sample. Cross-validation gives a honest estimate. Report both mean and std — high std means your model is unstable.</Callout>

      <LH>4. Pipelines + GridSearchCV</LH>
      <Block label="Hyperparameter tuning through a Pipeline">{`from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  RandomForestClassifier(random_state=42))
])

# Access pipeline steps with __ notation: stepname__param
param_grid = {
    'model__n_estimators': [50, 100, 200],
    'model__max_depth':    [3, 5, None],
    'model__min_samples_split': [2, 5],
}

grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,       # use all CPU cores
    verbose=1
)

grid_search.fit(X_train, y_train)

print(f"Best AUC: {grid_search.best_score_:.3f}")
print(f"Best params: {grid_search.best_params_}")

# The best estimator is a fitted pipeline — ready to predict
best_pipeline = grid_search.best_estimator_
preds = best_pipeline.predict(X_test)`}</Block>

      <LH>5. Save and Load Pipelines</LH>
      <Block label="Persist your pipeline">{`import joblib
from sklearn.pipeline import Pipeline

# Save the trained pipeline
joblib.dump(full_pipeline, 'churn_model_v1.pkl')
print("Pipeline saved.")

# Load it back — in production, API, or Streamlit
loaded_pipeline = joblib.load('churn_model_v1.pkl')

# Predict on new data — all preprocessing is included
new_data = pd.DataFrame({
    'tenure': [3],
    'MonthlyCharges': [85.5],
    'TotalCharges': [256.5],
    'Contract': ['Month-to-month'],
    'InternetService': ['Fiber optic'],
    'PaymentMethod': ['Electronic check']
})

prediction = loaded_pipeline.predict(new_data)
probability = loaded_pipeline.predict_proba(new_data)[:, 1]
print(f"Churn: {prediction[0]} | Probability: {probability[0]:.1%}")`}</Block>

      <Quiz questions={[
        {q:"What does pipeline.fit(X_train, y_train) do internally?",options:["Only trains the final model","Fits each transformer and model sequentially on training data","Fits transformers on all data, model on train only","Performs cross-validation automatically"],answer:"Fits each transformer and model sequentially on training data",explanation:"Pipeline calls fit_transform() on each transformer in sequence (passing output to the next), then fit() on the final estimator. Everything is fitted only on X_train — no leakage possible."},
        {q:"In GridSearchCV with a Pipeline, how do you tune 'n_estimators' of the model step named 'clf'?",options:["{'n_estimators':[100,200]}","{'clf__n_estimators':[100,200]}","{'clf.n_estimators':[100,200]}","{'model.clf.n_estimators':[100,200]}"],answer:"{'clf__n_estimators':[100,200]}",explanation:"Pipeline parameters use double underscore __ notation: stepname__paramname. So for step 'clf' and param 'n_estimators': 'clf__n_estimators'. This is a very common interview question."},
        {q:"Why is cross_val_score correct with a Pipeline but risky without one?",options:["Pipelines are faster","Without a pipeline, transformers might be fitted on all data including validation folds","Pipelines automatically tune hyperparameters","cross_val_score only works with Pipelines"],answer:"Without a pipeline, transformers might be fitted on all data including validation folds",explanation:"If you scale X before cross_val_score, the scaler has seen all folds including validation data. With a Pipeline, cross_val_score re-fits the scaler on each fold's training data only — the correct approach."},
        {q:"ColumnTransformer with remainder='drop' (default) does what to unspecified columns?",options:["Passes them through unchanged","Raises an error","Drops them from the output","Applies StandardScaler to them"],answer:"Drops them from the output",explanation:"By default, ColumnTransformer drops columns not listed in transformers. Use remainder='passthrough' to keep unspecified columns as-is, or remainder=StandardScaler() to apply a transformer to them."},
        {q:"joblib.dump(pipeline, 'model.pkl') saves what exactly?",options:["Only the model weights","Only the preprocessing steps","The entire pipeline: fitted transformers + fitted model","Just the pipeline structure without fitted parameters"],answer:"The entire pipeline: fitted transformers + fitted model",explanation:"joblib serializes the entire fitted pipeline object — including the scaler's learned mean/std, the encoder's learned categories, and the model's learned parameters. Loading it gives a fully ready-to-predict object."},
      ]}/>

      <CodeExercise
        title="Build a complete Pipeline from scratch"
        description="Build a Pipeline with StandardScaler and LogisticRegression. Fit on training data, evaluate on test data, and print accuracy and the prediction for one new sample."
        starterCode={`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.datasets import load_breast_cancer
import pandas as pd

# Load dataset
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Build pipeline
pipeline = Pipeline([
    (___, StandardScaler()),
    (___, LogisticRegression(random_state=42, max_iter=1000))
])

# Fit on train
pipeline.___(X_train, y_train)

# Evaluate on test
preds = pipeline.___(X_test)
print(f"Accuracy: {round(accuracy_score(y_test, preds), 3)}")

# Predict one new sample
new_sample = X_test.iloc[[0]]
print(f"Prediction: {pipeline.predict(new_sample)[0]}")
print(f"Probability: {round(pipeline.predict_proba(new_sample)[0][1], 3)}")`}
        hint="Pipeline steps need names: ('scaler', StandardScaler()). pipeline.fit(). pipeline.predict()."
        validate={(out)=>out.includes("Accuracy:")&&out.includes("Prediction:")&&out.includes("Probability:")}
      />
    </div>
  )},

  // ── STREAMLIT
  {id:"streamlit-lesson", phase:"🚀 Deploy", emoji:"🚀", color:"#ff4b4b", title:"Streamlit — Deploy ML Apps", subtitle:"'Here is my live demo' wins interviews",
   body:()=>(
    <LessonWrapper id="streamlit-lesson" color="#ff4b4b">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["First App","UI Elements","✓ Quiz","Data Display","Model Integration","Deploy","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#ff4b4b":"transparent",border:`2px solid ${i===0?"#ff4b4b":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#ff4b4b":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#ff4b4b" title="The most powerful thing you can say in a DS interview">"Here is my live demo — you can try it right now at this URL." Streamlit turns your model into a working app in under an hour. This is what separates portfolio projects that get noticed from ones that don't.</Callout>

      <div style={{background:"#ff4b4b08",border:"1px solid #ff4b4b20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#ff4b4b",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — STREAMLIT BASICS</div>
        <LH>Your first Streamlit app in 5 lines</LH>
        <Block label="Save as app.py, run: streamlit run app.py">{`import streamlit as st

st.title("My First DS App")
st.write("Hello, data science!")

name = st.text_input("What is your name?")
if name:
    st.write("Hello " + name + "! Welcome to data science.")`}</Block>
        <LH>Core UI elements for 90% of DS apps</LH>
        <Block label="Widgets — inputs and display">{`import streamlit as st
import numpy as np

st.title("Customer Churn Predictor")
st.markdown("Predict which customers are at risk of churning.")
st.divider()

col1, col2 = st.columns(2)

with col1:
    tenure   = st.slider("Tenure (months)", 1, 72, 12)
    charges  = st.number_input("Monthly Charges ($)", 20.0, 120.0, 65.0)
    contract = st.selectbox("Contract Type", ["Month-to-month","One year","Two year"])

with col2:
    st.metric("Churn Risk Score", "67%", delta="+12% vs avg")
    st.metric("Expected LTV", "$" + str(round(charges * tenure, 0)))

if st.button("Predict Churn Risk", type="primary"):
    risk = "HIGH" if tenure < 12 and charges > 70 else "MEDIUM" if tenure < 24 else "LOW"
    colors = {"HIGH":"red","MEDIUM":"orange","LOW":"green"}
    st.markdown("Risk: :" + colors[risk] + "[**" + risk + "**]")`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#ff4b4b",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"st.cache_resource is used for:",options:["Caching database queries","Loading models once — they persist across all user sessions","Caching user inputs","Speeding up rendering"],answer:"Loading models once — they persist across all user sessions",explanation:"ML models take 1-30 seconds to load. Without caching, every interaction reloads the model. @st.cache_resource loads once and shares the object across all sessions."},
          {q:"Streamlit reruns the entire script when:",options:["The file changes","A user interacts with any widget","Every 5 seconds","Only on page refresh"],answer:"A user interacts with any widget",explanation:"Every widget interaction triggers a full script rerun from top to bottom. State is preserved through st.session_state. Simple to reason about."},
          {q:"Best way to deploy a Streamlit app for portfolio:",options:["AWS EC2 only","Streamlit Community Cloud — free, public, deploys from GitHub in minutes","Docker only","Heroku"],answer:"Streamlit Community Cloud — free, public, deploys from GitHub in minutes",explanation:"Push to GitHub, connect repo at share.streamlit.io, deploy in 2 minutes for free. Perfect for portfolio projects."},
        ]}/>
      </div>

      <div style={{background:"#ff4b4b08",border:"1px solid #ff4b4b20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#ff4b4b",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — MODEL INTEGRATION & DEPLOYMENT</div>
        <LH>Connect your ML model to Streamlit</LH>
        <Block label="Model loads once, predicts on every interaction">{`import streamlit as st
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

@st.cache_resource
def load_model():
    np.random.seed(42)
    n = 500
    tenure  = np.random.randint(1,73,n)
    charges = np.random.normal(65,20,n)
    churn   = ((charges>70)|(tenure<6)).astype(int)
    X = np.column_stack([tenure,charges])
    scaler = StandardScaler()
    X_s    = scaler.fit_transform(X)
    model  = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_s, churn)
    return model, scaler

model, scaler = load_model()

st.title("Churn Risk Predictor")
tenure  = st.slider("Tenure (months)", 1, 72, 6)
charges = st.number_input("Monthly Charges ($)", 20.0, 120.0, 75.0)

if st.button("Predict", type="primary"):
    X_new = scaler.transform([[tenure, charges]])
    prob  = model.predict_proba(X_new)[0][1]
    st.metric("Churn Probability", str(round(prob*100,1)) + "%")
    if prob > 0.6:
        st.error("High Risk — consider a retention offer")
    elif prob > 0.3:
        st.warning("Medium Risk — monitor this customer")
    else:
        st.success("Low Risk — customer is likely to stay")`}</Block>
        <LH>Deploy in 3 steps</LH>
        <Block label="From code to live URL">{`# 1. Create requirements.txt
# streamlit
# scikit-learn
# pandas
# numpy

# 2. Push to GitHub
# git init && git add . && git commit -m "Add Streamlit app"
# git push origin main

# 3. Deploy at share.streamlit.io
# New app -> select repo -> set main file: app.py -> Deploy

# Live at: https://your-username-your-repo-XXXXX.streamlit.app
print("3 steps: requirements.txt -> GitHub -> share.streamlit.io")`}</Block>
        <Callout icon="★" color="#f7c96e" title="Portfolio must-have" type="gold">Every project in your portfolio should have: (1) a GitHub repo with a clean README, (2) a live Streamlit demo link. Showing a working app in an interview is infinitely more powerful than showing a Jupyter notebook.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#ff4b4b",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"@st.cache_resource vs @st.cache_data — difference?",options:["No difference","cache_resource for models/connections (shared); cache_data for DataFrames (per session copy)","cache_data is faster","cache_resource only works for sklearn"],answer:"cache_resource for models/connections (shared); cache_data for DataFrames (per session copy)",explanation:"cache_resource: one shared object for all users — use for ML models. cache_data: returns a copy per session — use for DataFrames and processed data."},
          {q:"st.session_state is used for:",options:["Caching models","Persisting values across reruns — like chat history or a counter","Database connections","Styling"],answer:"Persisting values across reruns — like chat history or a counter",explanation:"Streamlit reruns the whole script on every interaction. session_state persists values between reruns for a given user. Essential for chat apps, multi-step forms, tracking state."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Write the core prediction logic for a Streamlit app"
          description="Fill in the blanks to complete the prediction function."
          starterCode={`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 300
tenure  = np.random.randint(1,73,n)
charges = np.random.normal(65,20,n)
churn   = ((charges>70)|(tenure<6)).astype(int)
X = np.column_stack([tenure,charges])
X_train,X_test,y_train,y_test = train_test_split(X,churn,test_size=0.2,random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(___, ___)

def predict_churn(tenure_val, charges_val):
    X_new = np.array([[___, ___]])
    prob  = model.predict_proba(___)[0][1]
    risk  = "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW"
    return round(prob, 3), risk

prob, risk = predict_churn(3, 90)
print("Prob:", prob, "| Risk:", risk)`}
          hint="fit(X_train, y_train). [[tenure_val, charges_val]]. predict_proba(X_new)."
          validate={(out)=>out.includes("Prob:")&&out.includes("Risk:")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
];
LESSONS.push(...PHASE2_LESSONS);

const PHASE3_LESSONS = [
  {id:"dl-nn-lesson", phase:"🧠 Deep Learning", emoji:"🧠", color:"#818cf8", title:"Neural Networks & Deep Learning", subtitle:"How machines actually learn — from neurons to backpropagation",
   body:()=>(
    <LessonWrapper id="dl-nn-lesson" color="#818cf8">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Neuron Intuition","Activations","✓ Quiz","Forward Pass","Backprop","Training NN","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#818cf8":"transparent",border:`2px solid ${i===0?"#818cf8":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#fff":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#818cf8":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#818cf8" title="The big picture">A neural network is a universal function approximator. Given enough neurons and data, it can learn any mapping from inputs to outputs. The learning is fully automatic via backpropagation. You don't need to implement it — but understanding how it works makes you a better user of it.</Callout>

      <div style={{background:"#818cf808",border:"1px solid #818cf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — NEURONS & ACTIVATIONS</div>
        <LH>The neuron — what it actually computes</LH>
        <LP>A single neuron takes multiple inputs, multiplies each by a weight, adds a bias, and passes through an activation. That is the entire computation. The network learns by finding the right weights.</LP>
        <Block label="Run this — change the weights and see how prediction changes">{`import numpy as np

def neuron(inputs, weights, bias, activation='relu'):
    z = np.dot(inputs, weights) + bias  # weighted sum

    if activation == 'relu':
        return max(0, z)              # ReLU: pass positive, kill negative
    elif activation == 'sigmoid':
        return 1 / (1 + np.exp(-z))  # Sigmoid: squash to 0-1

# Customer: [tenure=12, monthly_charge=75, num_services=3]
inputs  = np.array([12, 75.0, 3])
weights = np.array([-0.08, 0.03, -0.05])  # learned during training
bias    = 0.5

prob = neuron(inputs, weights, bias, activation='sigmoid')
print("Churn probability:", round(prob, 3))

# Interpret weights:
# tenure -0.08: longer tenure -> less likely to churn
# charges +0.03: higher charge -> more likely to churn`}</Block>
        <LH>Activation functions — why they matter</LH>
        <LP>Without activations, stacking layers just creates a bigger linear model — no matter how many layers. Activations add non-linearity so the network can learn complex patterns.</LP>
        <Compare items={[
          {label:"ReLU",color:"#6dd6a0",text:"max(0,x). Default for hidden layers. Fast, avoids vanishing gradients. Use everywhere except output."},
          {label:"Sigmoid",color:"#7eb8f7",text:"1/(1+e^-x) → 0 to 1. Use ONLY for binary output layer. Vanishing gradients in deep nets."},
          {label:"Softmax",color:"#f7c96e",text:"Probabilities summing to 1. Use for multi-class output layer. Never for hidden layers."},
        ]}/>
        <Block label="Visualize what each activation does">{`import numpy as np

x = np.array([-3, -1, 0, 1, 2, 3])

relu    = np.maximum(0, x)
sigmoid = 1 / (1 + np.exp(-x))

print("Input:  ", x)
print("ReLU:   ", relu.round(3))
print("Sigmoid:", sigmoid.round(3))

# ReLU kills negatives, passes positives unchanged
# Sigmoid squashes everything to (0,1)
# This is why they are chosen for different purposes`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"Why are activation functions necessary in neural networks?",options:["They make training faster","Without them, stacking layers is equivalent to one linear layer","They reduce overfitting","They normalize the inputs"],answer:"Without them, stacking layers is equivalent to one linear layer",explanation:"W2 @ (W1 @ x) = (W2 @ W1) @ x — matrix multiplication of matrices is still just a matrix. Activations break this linearity, letting the network learn complex non-linear mappings."},
          {q:"Which activation should you use in the output layer for binary classification?",options:["ReLU","Sigmoid","Softmax","Linear"],answer:"Sigmoid",explanation:"Sigmoid outputs 0-1 — interpretable as a probability for binary classification. Use Softmax for multi-class (outputs sum to 1). Use Linear for regression."},
          {q:"ReLU stands for:",options:["Regularized Linear Unit","Rectified Linear Unit","Recursive Linear Update","Relu Learning Unit"],answer:"Rectified Linear Unit",explanation:"ReLU = max(0, x). 'Rectified' means it 'fixes' negative values to zero. It is the most commonly used activation for hidden layers because it is computationally simple and avoids vanishing gradients."},
        ]}/>
      </div>

      <div style={{background:"#818cf808",border:"1px solid #818cf820",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — TRAINING A NEURAL NETWORK</div>
        <LH>Forward pass → loss → backpropagation → update</LH>
        <Block label="The training loop — what happens every batch">{`import numpy as np

# Tiny 2-layer neural network from scratch
np.random.seed(42)

# Simulated data
X = np.random.randn(100, 3)
y = (X[:,0]+X[:,1] > 0).astype(int)

# Initialize weights (small random values)
W1 = np.random.randn(3, 4) * 0.1   # input -> hidden (3 features -> 4 neurons)
b1 = np.zeros(4)
W2 = np.random.randn(4, 1) * 0.1   # hidden -> output (4 neurons -> 1 output)
b2 = np.zeros(1)
lr = 0.01

for epoch in range(200):
    # FORWARD PASS
    z1 = X @ W1 + b1
    a1 = np.maximum(0, z1)           # ReLU
    z2 = a1 @ W2 + b2
    a2 = 1 / (1 + np.exp(-z2))      # Sigmoid -> probability

    # LOSS (binary cross-entropy)
    loss = -np.mean(y.reshape(-1,1)*np.log(a2+1e-8) + (1-y.reshape(-1,1))*np.log(1-a2+1e-8))

    if epoch % 50 == 0:
        preds = (a2.flatten() > 0.5).astype(int)
        acc = (preds == y).mean()
        print("Epoch " + str(epoch) + " | Loss: " + str(round(float(loss),4)) + " | Acc: " + str(round(acc,3)))`}</Block>
        <LH>Neural networks with sklearn — practical usage</LH>
        <Block label="MLPClassifier — the sklearn neural network">{`import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

np.random.seed(42)
X = np.random.randn(400, 5)
y = ((X[:,0]+X[:,1] > 0.5) | (X[:,2] < -1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

# ALWAYS scale for neural networks
scaler = StandardScaler()
X_tr = scaler.fit_transform(X_train)
X_te = scaler.transform(X_test)

model = MLPClassifier(
    hidden_layer_sizes=(64, 32),  # two hidden layers: 64 neurons, then 32
    activation='relu',
    max_iter=500,
    random_state=42,
    early_stopping=True           # stop when validation stops improving
)
model.fit(X_tr, y_train)
print(classification_report(y_test, model.predict(X_te)))`}</Block>
        <Callout icon="★" color="#f7c96e" title="When to use neural networks vs tree models" type="gold">On tabular data: XGBoost/LightGBM almost always beat neural networks with less tuning. Use neural networks for: images, text, audio, or tabular data with 100k+ rows and complex interactions. Random Forest or XGBoost for everything else.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"hidden_layer_sizes=(64, 32) means:",options:["64 inputs and 32 outputs","Two hidden layers: first with 64 neurons, second with 32","One layer with 96 neurons","Max 64 iterations"],answer:"Two hidden layers: first with 64 neurons, second with 32",explanation:"Each tuple element defines one hidden layer. (64, 32) = Layer 1 has 64 neurons with ReLU, Layer 2 has 32 neurons with ReLU, output layer determined by the task."},
          {q:"Why must you StandardScale before training a neural network?",options:["Networks require values between 0 and 1","Large input values cause exploding gradients and slow convergence","sklearn requires it","Scaling prevents overfitting"],answer:"Large input values cause exploding gradients and slow convergence",explanation:"Neural networks use gradient descent. If inputs have very different scales (salary=50000, age=25), gradients will be dominated by the large-scale feature. Scaling ensures balanced learning across all inputs."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Train a neural network with sklearn"
          description="Fill in the blanks to build, train, and evaluate an MLPClassifier."
          starterCode={`import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

np.random.seed(42)
X = np.random.randn(300, 4)
y = (X[:,0]+X[:,1] > 0.5).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

scaler = StandardScaler()
X_tr = scaler.fit_transform(___)
X_te = scaler.transform(___)

model = ___(hidden_layer_sizes=(___, ___), activation='relu', max_iter=300, random_state=42)
model.fit(___, ___)

preds = model.predict(___)
print("Accuracy:", round(accuracy_score(y_test, preds), 3))`}
          hint="fit_transform(X_train). transform(X_test). MLPClassifier(hidden_layer_sizes=(64,32)). fit(X_tr, y_train). predict(X_te)."
          validate={(out)=>out.includes("Accuracy:")&&!isNaN(parseFloat(out.split(":")[1]))}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {id:"dl-nlp-lesson", phase:"🧠 Deep Learning", emoji:"📝", color:"#f472b6", title:"NLP & Transformers", subtitle:"From raw text to predictions — the full pipeline",
   body:()=>(
    <LessonWrapper id="dl-nlp-lesson" color="#f472b6">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Text Preprocessing","Embeddings","✓ Quiz","Attention","BERT & HuggingFace","Fine-Tuning","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#f472b6":"transparent",border:`2px solid ${i===0?"#f472b6":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#f472b6":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#f472b6" title="Why NLP matters">Every chatbot, sentiment analysis, document classifier, search engine, and language model uses NLP. The transformer architecture changed everything in 2017. This lesson takes you from raw text to state-of-the-art predictions.</Callout>

      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — TEXT PREPROCESSING & EMBEDDINGS</div>
        <LH>Text preprocessing — turning words into numbers</LH>
        <LP>Machine learning models only understand numbers. Text must be converted to numeric representations. The pipeline: raw text → clean → tokenize → vectorize → model.</LP>
        <Block label="Classic text preprocessing pipeline">{`import re
from collections import Counter

text = "The customer is really unhappy with the service! Very bad experience."

# Step 1: lowercase + remove punctuation
def clean(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    return text

cleaned = clean(text)
print("Cleaned:", cleaned)

# Step 2: tokenize (split into words)
tokens = cleaned.split()
print("Tokens:", tokens)

# Step 3: remove stopwords (common words that add no meaning)
stopwords = {'the','is','with','a','an','and','or','in','on','at','very'}
filtered = [t for t in tokens if t not in stopwords]
print("Filtered:", filtered)

# Step 4: count word frequencies (bag of words)
counts = Counter(filtered)
print("Word counts:", dict(counts))`}</Block>
        <LH>TF-IDF — better than raw counts</LH>
        <Block label="TF-IDF weights words by how unique they are across documents">{`from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

reviews = [
    "great product fast delivery excellent quality",
    "terrible product slow delivery bad quality",
    "excellent quality fast shipping love it",
    "poor quality slow delivery disappointed",
]
labels = [1, 0, 1, 0]  # 1=positive, 0=negative

# TF-IDF: Term Frequency * Inverse Document Frequency
# Common words get low weight, unique-to-sentiment words get high weight
vectorizer = TfidfVectorizer(max_features=20)
X = vectorizer.fit_transform(reviews).toarray()

print("Features:", vectorizer.get_feature_names_out())
print("Matrix shape:", X.shape)

# Now train a classifier
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X, labels)

test = vectorizer.transform(["amazing product great quality"])
print("Prediction:", model.predict(test)[0], "(1=positive)")`}</Block>
        <Tip>TF-IDF is still the go-to for text classification when you have limited data. It outperforms simple word counts because it downweights words that appear everywhere (like "the") and upweights distinctive words.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"TF-IDF gives a low score to a word when:",options:["The word is rare across all documents","The word appears in almost every document (low IDF)","The word is long","The word is a stopword"],answer:"The word appears in almost every document (low IDF)",explanation:"IDF = log(total docs / docs containing word). If a word appears everywhere, IDF approaches 0. Words like 'the' get low TF-IDF even if they appear frequently in one document."},
          {q:"Word embeddings (Word2Vec, GloVe) are better than TF-IDF because:",options:["They are faster","They capture semantic meaning — similar words have similar vectors","They require less data","They are simpler"],answer:"They capture semantic meaning — similar words have similar vectors",explanation:"TF-IDF treats each word independently. Embeddings map words to dense vectors where king-man+woman≈queen. Semantic relationships are encoded in the vector geometry."},
          {q:"The attention mechanism in transformers allows:",options:["Faster matrix multiplication","Each word to attend to every other word in the sequence simultaneously","Longer training times","More parameters"],answer:"Each word to attend to every other word in the sequence simultaneously",explanation:"Attention computes a weighted sum of all positions for each position. 'bank' in 'river bank' vs 'savings bank' gets different representations because it attends differently to context words."},
        ]}/>
      </div>

      <div style={{background:"#f472b608",border:"1px solid #f472b620",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — TRANSFORMERS & HUGGING FACE</div>
        <LH>The transformer architecture — why it changed everything</LH>
        <LP>Before transformers (2017), NLP models processed text sequentially — word by word. The transformer processes the entire sequence at once using attention, making it parallelizable and able to capture long-range dependencies.</LP>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",color:"#7eb8f7",title:"Tokenization",desc:"Split text into subword tokens. 'unhappy' → ['un','happy']. Handles unknown words gracefully."},
            {n:"02",color:"#6dd6a0",title:"Embeddings",desc:"Each token gets a vector. Positional encoding adds position information — transformers have no built-in sequence order."},
            {n:"03",color:"#f7c96e",title:"Multi-head Attention",desc:"Each token computes how much to 'attend to' every other token. Captures relationships regardless of distance."},
            {n:"04",color:"#f472b6",title:"Feed-forward + Norm",desc:"Each position processed independently. Layer normalization stabilizes training. Repeated N times (e.g. 12 for BERT-base)."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:12,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <LH>HuggingFace — state-of-the-art in 5 lines</LH>
        <Block label="Sentiment analysis with a pretrained BERT model">{`# pip install transformers
from transformers import pipeline

# Load a pretrained sentiment analysis pipeline
# (downloads model first time — ~500MB)
# sentiment = pipeline("sentiment-analysis")

# reviews = [
#     "This product is absolutely amazing, I love it!",
#     "Terrible experience, very disappointed with quality.",
#     "It's okay, nothing special but works as expected.",
# ]
# for review in reviews:
#     result = sentiment(review)[0]
#     print(review[:40] + "...")
#     print("  -> " + result['label'] + " (" + str(round(result['score']*100,1)) + "%)")

# Output:
# This product is absolutely amazing...
#   -> POSITIVE (99.8%)
# Terrible experience, very disappoint...
#   -> NEGATIVE (99.9%)

print("HuggingFace pipeline loaded successfully!")
print("In production: load once at startup, reuse for all requests")`}</Block>
        <Callout icon="★" color="#f7c96e" title="What to actually learn" type="gold">You do not need to implement transformers from scratch. Learn: (1) TF-IDF for simple text classification, (2) HuggingFace pipeline for quick inference, (3) fine-tuning a BERT model on your domain data for serious projects. The HuggingFace ecosystem makes all three accessible.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#f472b6",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Fine-tuning BERT vs training from scratch — which is better for a small dataset?",options:["Training from scratch — more control","Fine-tuning — BERT's pretrained weights contain vast language knowledge","They are equivalent","Depends on the task"],answer:"Fine-tuning — BERT's pretrained weights contain vast language knowledge",explanation:"BERT was pretrained on billions of tokens. Fine-tuning adapts its representations to your task with a small labeled dataset. Training from scratch would need millions of labeled examples to match this."},
          {q:"A tokenizer converts 'unhappiness' to ['un','happiness']. This is called:",options:["Word tokenization","Subword tokenization — handles unknown words by splitting into known pieces","Character tokenization","Sentence tokenization"],answer:"Subword tokenization — handles unknown words by splitting into known pieces",explanation:"Subword tokenization (BPE, WordPiece) splits rare words into frequent subwords. 'unhappiness' → ['un','##happi','##ness']. This means the vocabulary stays manageable while handling any word."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Text classification with TF-IDF + Logistic Regression"
          description="Fill in the blanks to vectorize text reviews and train a sentiment classifier."
          starterCode={`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

reviews = [
    "great product excellent quality fast delivery",
    "terrible slow broken disappointed refund",
    "amazing love it highly recommend",
    "poor quality bad experience waste money",
    "good product decent quality",
    "awful service never buying again",
]
labels = [1, 0, 1, 0, 1, 0]

vectorizer = ___(max_features=50)
X = vectorizer.fit_transform(___).toarray()

model = LogisticRegression()
model.fit(___, ___)

test = vectorizer.transform(["excellent quality fast shipping"])
print("Prediction:", model.predict(___)[0], "(1=positive)")`}
          hint="TfidfVectorizer(). fit_transform(reviews). fit(X, labels). transform(['excellent quality...'])."
          validate={(out)=>out.includes("Prediction: 1")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {id:"llm-lesson", phase:"🧠 Deep Learning", emoji:"🤖", color:"#34d399", title:"LLMs & RAG", subtitle:"Build production AI apps that work with your own data",
   body:()=>(
    <LessonWrapper id="llm-lesson" color="#34d399">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["How LLMs Work","Prompt Engineering","✓ Quiz","LLM APIs","RAG Pattern","Build RAG App","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#34d399":"transparent",border:`2px solid ${i===0?"#34d399":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#34d399":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#34d399" title="The most valuable skill right now">Companies are integrating LLMs into every data product. Knowing how to build WITH LLM APIs — not just use ChatGPT — is one of the most in-demand skills. RAG is the pattern that makes LLMs useful on your own company's data.</Callout>

      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — HOW LLMs WORK & PROMPT ENGINEERING</div>
        <LH>What LLMs actually do</LH>
        <LP>An LLM predicts the next token given all previous tokens. That's the entire mechanism. The "intelligence" emerges from training on trillions of tokens from the internet. Understanding this helps you prompt better and know the limitations.</LP>
        <div style={{display:"grid",gap:8,margin:"12px 0"}}>
          {[
            {n:"01",color:"#7eb8f7",title:"Tokenization",desc:"Input text is split into tokens (~4 chars each). GPT-4 has a 128k token context window."},
            {n:"02",color:"#6dd6a0",title:"Transformer forward pass",desc:"Tokens go through attention layers. Each token attends to all previous tokens."},
            {n:"03",color:"#f7c96e",title:"Next token prediction",desc:"The model outputs a probability distribution over the vocabulary. Sample from it."},
            {n:"04",color:"#f472b6",title:"Repeat until done",desc:"Append the sampled token, repeat. Temperature controls randomness (0=deterministic, 1=creative)."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:9,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:12,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <LH>Prompt engineering — the skill that 10x your LLM results</LH>
        <Block label="Four patterns that work in production">{`# 1. System prompt — set the role and constraints
system = """You are a data science tutor for MENA students.
Explain concepts clearly using Arabic cultural examples.
Always give a concrete code example. Be concise — max 3 paragraphs."""

# 2. Few-shot examples — show the pattern
few_shot = """
Q: What is overfitting?
A: Overfitting is when your model memorizes training data instead of learning general patterns...

Q: What is the difference between precision and recall?
A: """

# 3. Chain of thought — ask for reasoning steps
cot = "Explain step by step how you would approach building a churn model for a Lebanese telecom company."

# 4. Structured output — ask for JSON
structured = """Analyze this customer and output ONLY valid JSON:
Customer: tenure=2, charges=90, calls=5
Output format: {"risk": "high|medium|low", "reason": "...", "action": "..."}"""

print("Prompt patterns loaded — use these in any LLM API call")`}</Block>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"Temperature=0 in LLM generation means:",options:["No output","Always picks the highest probability next token (deterministic)","Random output","Slower generation"],answer:"Always picks the highest probability next token (deterministic)",explanation:"Temperature scales the probability distribution. T=0 makes it greedy — always picking the most likely token. T=1 samples from the true distribution. T>1 makes output more random/creative."},
          {q:"RAG stands for:",options:["Random Augmented Generation","Retrieval Augmented Generation","Recursive Attention Graph","Real-time API Generation"],answer:"Retrieval Augmented Generation",explanation:"RAG: retrieve relevant documents from your knowledge base, then augment the LLM prompt with those documents. The model answers based on retrieved context — not just its training data."},
          {q:"Why does RAG solve LLM hallucination on domain-specific data?",options:["It makes the model smarter","It provides factual context in the prompt — the model cites documents instead of generating from memory","It fine-tunes the model","It filters bad outputs"],answer:"It provides factual context in the prompt — the model cites documents instead of generating from memory",explanation:"LLMs hallucinate when they don't know the answer and generate plausible-sounding text. RAG grounds the answer in retrieved documents — the model is summarizing real text, not fabricating."},
        ]}/>
      </div>

      <div style={{background:"#34d39908",border:"1px solid #34d39920",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — LLM APIs & RAG PATTERN</div>
        <LH>Calling LLM APIs in Python</LH>
        <Block label="OpenAI-compatible API call — works with OpenAI, Groq, DeepSeek, local models">{`import json

# API call pattern (works with any OpenAI-compatible API)
def call_llm(prompt, system="You are a helpful data science assistant", model="llama-3.3-70b-versatile"):
    # In production: use requests library with your API key
    # import requests
    # response = requests.post(
    #     "https://api.groq.com/openai/v1/chat/completions",
    #     headers={"Authorization": "Bearer YOUR_KEY"},
    #     json={"model": model, "messages": [
    #         {"role": "system", "content": system},
    #         {"role": "user",   "content": prompt}
    #     ], "temperature": 0.1}
    # )
    # return response.json()["choices"][0]["message"]["content"]
    return "API response would appear here"

# Structured output — ask for JSON
customer = {"tenure": 2, "charges": 90, "support_calls": 5}
prompt = """Analyze this customer and return ONLY valid JSON:
Customer data: """ + str(customer) + """
Return: {"risk_level": "high/medium/low", "reason": "one sentence", "recommended_action": "..."}"""

result = call_llm(prompt)
print("LLM response:", result)
print()
print("Pattern: define schema in prompt, parse JSON from response")`}</Block>

        <LH>RAG — make LLMs answer from your own documents</LH>
        <Block label="The complete RAG pipeline">{`import numpy as np

# RAG has 4 steps:
# 1. CHUNK: split documents into overlapping chunks
# 2. EMBED: convert each chunk to a vector
# 3. RETRIEVE: for a query, find most similar chunks
# 4. GENERATE: pass retrieved chunks to LLM as context

# Simplified demo (no external libraries needed)
documents = [
    "Month-to-month customers churn at 42.7% vs 11.3% for annual contracts.",
    "Customers with fiber internet have a 41.9% churn rate vs 18.9% for DSL.",
    "New customers (tenure < 6 months) with high charges churn at 65% rate.",
    "Customers with tech support have 35% lower churn probability.",
    "Average monthly charge for churners is $74.44 vs $61.31 for non-churners.",
]

# Simulate embeddings (in production: use text-embedding-3-small or similar)
np.random.seed(42)
doc_embeddings = np.random.randn(len(documents), 8)  # 8-dim fake embeddings

def retrieve(query, top_k=2):
    # Simulate query embedding
    query_emb = np.random.randn(8)
    # Cosine similarity
    sims = doc_embeddings @ query_emb / (np.linalg.norm(doc_embeddings,axis=1) * np.linalg.norm(query_emb) + 1e-8)
    top_idx = np.argsort(sims)[::-1][:top_k]
    return [documents[i] for i in top_idx]

# Retrieve relevant chunks for a query
query = "Why do fiber customers churn more?"
chunks = retrieve(query)

prompt = "Based on this data:\n" + "\n".join("- "+c for c in chunks) + "\n\nAnswer: " + query
print("RAG Prompt:")
print(prompt)`}</Block>
        <Callout icon="★" color="#f7c96e" title="The production RAG stack" type="gold">In real projects: (1) Chunk documents → (2) Embed with OpenAI text-embedding-3-small → (3) Store in Pinecone/ChromaDB/FAISS → (4) On query: embed query, retrieve top-k, pass to LLM with context. This is what every enterprise AI team is building.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#34d399",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"Fine-tuning vs RAG — when to use RAG?",options:["Always — RAG is always better","When you need the model to answer from specific, updatable documents","When you have millions of labeled examples","When the model is too slow"],answer:"When you need the model to answer from specific, updatable documents",explanation:"RAG is cheaper, faster to update (just add documents), and more transparent (you can show the retrieved sources). Fine-tuning teaches the model new behavior/style. Use RAG for knowledge, fine-tuning for style."},
          {q:"What does chunk size affect in RAG?",options:["Model accuracy only","Context window usage and retrieval precision — small chunks are precise, large chunks have more context","Nothing — any chunk size works","Training speed"],answer:"Context window usage and retrieval precision — small chunks are precise, large chunks have more context",explanation:"Small chunks: more precise retrieval but may miss surrounding context. Large chunks: more context but retrieval is noisier. Typical: 200-500 tokens with 50-token overlap. Experiment with your data."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Build a simple document retrieval system"
          description="Fill in the blanks to find the most relevant document for a query using cosine similarity."
          starterCode={`import numpy as np

documents = [
    "churn rate is highest for month-to-month contracts",
    "fiber internet customers have highest churn probability",
    "long tenure customers are unlikely to churn",
    "customers with many support calls tend to churn more",
]

np.random.seed(42)
doc_embs = np.random.randn(len(documents), 6)

def find_relevant(query_emb, top_k=2):
    # Compute cosine similarity between query and all docs
    sims = ___ @ ___ / (np.linalg.norm(___, axis=1) * np.linalg.norm(___) + 1e-8)
    top_idx = np.argsort(sims)___ [:top_k]
    return [documents[i] for i in top_idx]

query_emb = np.random.randn(6)
results = find_relevant(query_emb)
print("Top relevant documents:")
for r in results:
    print("-", r)`}
          hint="doc_embs @ query_emb. np.linalg.norm(doc_embs, axis=1). np.linalg.norm(query_emb). [::-1] to reverse sort."
          validate={(out)=>out.includes("Top relevant documents:")&&out.includes("-")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
  {id:"mlops-lesson", phase:"🚀 Deploy", emoji:"⚙️", color:"#fb923c", title:"MLOps — From Notebook to Production", subtitle:"FastAPI, Docker, monitoring, and CI/CD — make your model live",
   body:()=>(
    <LessonWrapper id="mlops-lesson" color="#fb923c">
    <div>
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
        {["Git for DS","FastAPI","✓ Quiz","Docker","Experiment Tracking","Live Deployment","✓ Challenge"].map((step,i,arr)=>(
          <React.Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fb923c":"transparent",border:`2px solid ${i===0?"#fb923c":"#2a2540"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i===0?"#000":"#4a4665",fontWeight:700}}>{i+1}</div>
              <span style={{fontSize:8,color:i===0?"#fb923c":"#4a4665",whiteSpace:"nowrap",fontWeight:i===0?700:400}}>{step}</span>
            </div>
            {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2a2540",minWidth:10,marginBottom:14}}/>}
          </React.Fragment>
        ))}
      </div>

      <Callout icon="🧠" color="#fb923c" title="The skill that makes you complete">Most DS candidates can train a model. Almost none can deploy one. MLOps is what makes you a complete data scientist — someone who ships to production, not just to a notebook. 'I built this, you can use it right now at this URL' is a conversation-changer in interviews.</Callout>

      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 1 OF 3 — FASTAPI MODEL SERVING</div>
        <LH>FastAPI — serve your model as a REST API</LH>
        <LP>A model in a notebook is not useful to anyone else. FastAPI turns it into an HTTP endpoint that any application, website, or service can call. It is production-ready, fast, and generates automatic documentation.</LP>
        <Block label="Complete FastAPI ML endpoint — save as main.py">{`# pip install fastapi uvicorn scikit-learn pydantic joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

app = FastAPI(title="Churn Prediction API", version="1.0")

# Load model once at startup — not on every request
@app.on_event("startup")
async def load_model():
    global model
    # model = joblib.load("churn_model.pkl")   # production
    # For demo: train a quick model
    np.random.seed(42)
    X = np.random.randn(500, 3)
    y = (X[:,0] + X[:,1] > 0.5).astype(int)
    model = RandomForestClassifier(n_estimators=50, random_state=42).fit(X, y)

# Define input schema with validation
class CustomerInput(BaseModel):
    tenure:          int   = Field(..., ge=0, le=120, description="Months as customer")
    monthly_charges: float = Field(..., ge=0, le=500,  description="Monthly charge in USD")
    support_calls:   int   = Field(..., ge=0, le=50,   description="Support calls last year")

class PredictionOutput(BaseModel):
    churn_probability: float
    risk_level:        str
    recommendation:    str

@app.get("/health")
def health():
    return {"status": "healthy", "model": "RandomForestClassifier"}

@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    X = np.array([[customer.tenure, customer.monthly_charges, customer.support_calls]])
    prob = float(model.predict_proba(X)[0][1])
    risk = "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW"
    rec  = "Offer discount" if risk=="HIGH" else "Monitor" if risk=="MEDIUM" else "No action"
    return PredictionOutput(churn_probability=round(prob,3), risk_level=risk, recommendation=rec)

# Run with: uvicorn main:app --reload
# Docs at:  http://localhost:8000/docs`}</Block>
        <Tip>The <code style={{background:"#0d1f10",padding:"1px 5px",borderRadius:3,fontSize:11,color:"#6dd6a0"}}>/health</code> endpoint is non-negotiable in production. Load balancers and monitoring systems ping it to check if the service is up. Always include it.</Tip>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// checkpoint</div>
        <Quiz questions={[
          {q:"@app.on_event('startup') in FastAPI does:",options:["Runs on every request","Runs once when server starts — ideal for loading model into memory","Runs on server shutdown","Runs on first request only"],answer:"Runs once when server starts — ideal for loading model into memory",explanation:"Loading a model takes 0.5-30 seconds. If you load inside the predict function, every request waits for it. Startup event loads once, then all requests reuse the loaded model from memory."},
          {q:"Pydantic BaseModel in FastAPI validates:",options:["Database connections","Request input types, ranges, and constraints — raises 422 if invalid","Response only","Authentication"],answer:"Request input types, ranges, and constraints — raises 422 if invalid",explanation:"Pydantic validates that inputs are the right type (int, float, str) and within defined ranges (ge=0, le=120). Invalid requests get a clear 422 error with details — no need to write manual validation."},
          {q:"Docker containerization ensures:",options:["Faster training","The app runs identically on any machine with the same dependencies","Automatic scaling","Free hosting"],answer:"The app runs identically on any machine with the same dependencies",explanation:"Docker packages your app + Python version + dependencies into an image. 'Works on my machine' becomes 'works everywhere that runs Docker'. Essential for reproducible deployments."},
        ]}/>
      </div>

      <div style={{background:"#fb923c08",border:"1px solid #fb923c20",borderRadius:10,padding:"4px 14px 14px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",margin:"12px 0 10px"}}>PART 2 OF 3 — DOCKER & DEPLOYMENT</div>
        <LH>Docker — package your app for anywhere</LH>
        <Block label="Dockerfile for a FastAPI ML app">{`# ── Dockerfile ──
# FROM python:3.11-slim        # small base image

# WORKDIR /app                 # working directory inside container

# COPY requirements.txt .      # copy requirements FIRST (for caching)
# RUN pip install -r requirements.txt   # install deps

# COPY . .                     # copy your code

# EXPOSE 8000                  # expose the port

# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ── Build and run ──
# docker build -t churn-api .
# docker run -p 8000:8000 churn-api

# ── Test it ──
# curl http://localhost:8000/health
# curl -X POST http://localhost:8000/predict \
#      -H "Content-Type: application/json" \
#      -d '{"tenure":3,"monthly_charges":90,"support_calls":5}'

print("Docker containers make deployment reproducible")
print("Same image on your laptop = same image in production")`}</Block>
        <LH>MLflow — track your experiments</LH>
        <Block label="Never lose track of which model was best">{`# pip install mlflow
import mlflow
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
X = np.random.randn(400, 5)
y = ((X[:,0]+X[:,1] > 0) & (X[:,2] < 1)).astype(int)
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

# Log parameters and metrics for every experiment
# with mlflow.start_run(run_name="rf_experiment_1"):
#     params = {"n_estimators": 100, "max_depth": None}
#     mlflow.log_params(params)
#
#     model = RandomForestClassifier(**params, random_state=42)
#     model.fit(X_train, y_train)
#
#     auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
#     mlflow.log_metric("test_auc", auc)
#     mlflow.sklearn.log_model(model, "model")
#
#     print("AUC:", round(auc, 3))
# mlflow ui  # open dashboard at localhost:5000

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
print("AUC:", round(auc,3))
print("In production: wrap with mlflow.start_run() to track every experiment")`}</Block>
        <Callout icon="★" color="#f7c96e" title="The full MLOps stack" type="gold">For a production ML system: (1) Git for code version control, (2) MLflow for experiment tracking, (3) FastAPI for serving, (4) Docker for packaging, (5) Railway/Render/AWS for hosting, (6) monitoring for drift detection. You do not need all 6 for a portfolio project — FastAPI + Docker + Railway is enough to impress.</Callout>
      </div>

      <div style={{margin:"4px 0 20px"}}>
        <div style={{fontSize:10,color:"#fb923c",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// final check</div>
        <Quiz questions={[
          {q:"In your Dockerfile, why copy requirements.txt and pip install BEFORE copying your code?",options:["Required by Docker specification","Docker caches each layer — unchanged requirements means pip install is cached even when code changes","requirements.txt must exist before Python runs","Docker processes COPY alphabetically"],answer:"Docker caches each layer — unchanged requirements means pip install is cached even when code changes",explanation:"If you change app.py but not requirements.txt, Docker reuses the cached pip install layer and only rebuilds from COPY . . onward. Without this ordering, pip reinstalls on every code change — minutes instead of seconds."},
          {q:"Data drift in production means:",options:["Your code has a bug","Statistical properties of production data shifted from training data — model may perform poorly","The model is making more predictions","The API is returning errors"],answer:"Statistical properties of production data shifted from training data — model may perform poorly",explanation:"Models are trained on historical data but serve future data. If customer behavior changes (new plans, market shifts), the model sees distributions it wasn't trained on. Regular drift monitoring catches this before accuracy drops."},
        ]}/>
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"#6dd6a0",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>// your turn</div>
        <CodeExercise
          title="Build a complete FastAPI ML endpoint"
          description="Fill in the blanks to complete the predict function that validates inputs and returns a structured response."
          starterCode={`from pydantic import BaseModel, Field
import numpy as np
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
X = np.random.randn(300, 3)
y = (X[:,0]+X[:,1] > 0.5).astype(int)
model = RandomForestClassifier(n_estimators=50, random_state=42).fit(X, y)

class CustomerInput(___):
    tenure:  int   = Field(..., ge=0, le=120)
    charges: float = Field(..., ge=0, le=500)
    calls:   int   = Field(..., ge=0, le=50)

def predict(customer: ___):
    X_new = np.array([[customer.___, customer.___, customer.___]])
    prob  = float(model.predict_proba(___)[0][1])
    risk  = "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW"
    return {"churn_probability": round(prob,3), "risk_level": risk}

result = predict(CustomerInput(tenure=3, charges=90, calls=5))
print(result)`}
          hint="BaseModel. CustomerInput. customer.tenure, customer.charges, customer.calls. predict_proba(X_new)."
          validate={(out)=>out.includes("churn_probability")&&out.includes("risk_level")}
        />
      </div>
    </div>
    </LessonWrapper>
  )},
];
LESSONS.push(...PHASE3_LESSONS);

const LEARN_PHASES = [
  {label:"🐍 Python Core",    ids:["pycore-basics","pycore-advanced","pycore-ds-patterns"]},
  {label:"🐍 Python for DS",  ids:["numpy","pandas-basics","pandas-advanced","eda","visualization"]},
  {label:"🗄️ SQL",            ids:["sql-basics","sql-joins","sql-window"]},
  {label:"📐 Statistics",     ids:["probability","distributions","correlation","inference"]},
  {label:"📐 Linear Algebra", ids:["linalg-vectors","linalg-eigen"]},
  {label:"🤖 Machine Learning", ids:["ml-workflow","ml-regression","ml-trees","ml-evaluation","ml-overfitting","ml-sklearn","feature-engineering","ml-pipelines"]},
  {label:"⚡ Advanced ML",    ids:["adv-xgboost","adv-lightgbm","adv-shap","adv-feature-eng","adv-pipelines","adv-hypertuning"]},
  {label:"🧠 Deep Learning",  ids:["dl-nn-lesson","dl-nlp-lesson","llm-lesson"]},
  {label:"🚀 Deploy",         ids:["streamlit-lesson","mlops-lesson"]},
  {label:"🛠️ Tools",          ids:["cli-git-lesson","jupyter-lesson"]},
];

// Maps roadmap section id → first lesson to open when "Study this" is clicked
const SECTION_TO_FIRST_LESSON = {
  "python-core":  "pycore-basics",
  "python-ds":    "numpy",
  "sql":          "sql-basics",
  "stats-prob":   "probability",
  "stats-dist":   "distributions",
  "stats-inf":    "inference",
  "linalg":       "linalg-vectors",
  "ml-core":      "ml-workflow",
  "ml-advanced":  "adv-xgboost",
  "feature-eng":  "feature-engineering",
  "ml-pipeline":  "ml-pipelines",
  "dl-nn":        "dl-nn-lesson",
  "dl-nlp":       "dl-nlp-lesson",
  "llm":          "llm-lesson",
  "streamlit":    "streamlit-lesson",
  "mlops":        "mlops-lesson",
  "cli-git":      "cli-git-lesson",
  "jupyter":      "jupyter-lesson",
};

// Maps lesson id → which roadmap section task it completes
const LESSON_COMPLETES_TASK = {
  "pycore-basics":        {section:"python-core",  task:0},
  "pycore-advanced":      {section:"python-core",  task:1},
  "pycore-ds-patterns":   {section:"python-core",  task:2},
  "numpy":                {section:"python-ds",    task:0},
  "pandas-basics":        {section:"python-ds",    task:2},
  "pandas-advanced":      {section:"python-ds",    task:3},
  "eda":                  {section:"python-ds",    task:4},
  "visualization":        {section:"python-ds",    task:4},
  "sql-basics":           {section:"sql",          task:0},
  "sql-joins":            {section:"sql",          task:3},
  "sql-window":           {section:"sql",          task:4},
  "probability":          {section:"stats-prob",   task:0},
  "distributions":        {section:"stats-dist",   task:0},
  "correlation":          {section:"stats-inf",    task:4},
  "inference":            {section:"stats-inf",    task:5},
  "linalg-vectors":       {section:"linalg",       task:0},
  "linalg-eigen":         {section:"linalg",       task:2},
  "ml-workflow":          {section:"ml-core",      task:0},
  "ml-regression":        {section:"ml-core",      task:1},
  "ml-trees":             {section:"ml-core",      task:2},
  "ml-evaluation":        {section:"ml-core",      task:3},
  "ml-overfitting":       {section:"ml-core",      task:4},
  "ml-sklearn":           {section:"ml-core",      task:5},
  "feature-engineering":  {section:"feature-eng",  task:0},
  "ml-pipelines":         {section:"ml-pipeline",  task:0},
  "dl-nn-lesson":         {section:"dl-nn",        task:0},
  "dl-nlp-lesson":        {section:"dl-nlp",       task:0},
  "llm-lesson":           {section:"llm",          task:0},
  "streamlit-lesson":     {section:"streamlit",    task:0},
  "mlops-lesson":         {section:"mlops",        task:0},
  "adv-xgboost":          {section:"ml-advanced",  task:0},
  "adv-lightgbm":         {section:"ml-advanced",  task:1},
  "adv-shap":             {section:"ml-advanced",  task:2},
  "adv-feature-eng":      {section:"ml-advanced",  task:3},
  "adv-pipelines":        {section:"ml-advanced",  task:4},
  "adv-hypertuning":      {section:"ml-advanced",  task:5},
  "cli-git-lesson":       {section:"cli-git",      task:0},
  "jupyter-lesson":       {section:"jupyter",      task:0},
};

// ── LEARN TAB ─────────────────────────────────────────────────────────────────
function LearnTab({currentUser, activeId, setActiveId, onLessonComplete, onBack}) {
  const [done,setDone] = useState({});

  useEffect(()=>{
    const load = async () => {
      const snap = await getDoc(doc(db,"users",currentUser.uid));
      if(snap.exists()) setDone(snap.data().lessonsDone||{});
    };
    load();
  },[currentUser.uid]);

  const lesson  = LESSONS.find(l=>l.id===activeId) || LESSONS[0];
  const idx     = LESSONS.findIndex(l=>l.id===activeId);
  const Body    = lesson.body;
  const totalDone = Object.values(done).filter(Boolean).length;

  const markDone = async () => {
    const newDone = {...done,[activeId]:true};
    setDone(newDone);
    await updateDoc(doc(db,"users",currentUser.uid),{lessonsDone:newDone});
    if(LESSON_COMPLETES_TASK[activeId]) onLessonComplete(activeId);
    if(idx < LESSONS.length-1) setActiveId(LESSONS[idx+1].id);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 110px)"}}>
      <style>{`
        @media (min-width: 769px) { .learn-mobile-strip { display: none !important; } }
        @media (max-width: 768px) { .learn-desktop-sidebar { display: none !important; } .learn-content { padding: 16px !important; } }
      `}</style>

      {/* MOBILE LESSON PICKER — horizontal scroll strip */}
      <div className="learn-mobile-strip" style={{background:T.bgDeep,borderBottom:`1px solid ${T.border}`,overflowX:"auto",WebkitOverflowScrolling:"touch",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 12px",minWidth:"max-content"}}>
          <span style={{fontSize:9,color:T.textFade,letterSpacing:"0.1em",flexShrink:0,marginRight:4}}>{totalDone}/{LESSONS.length}</span>
          {LESSONS.map(l=>{
            const active=l.id===activeId;
            const isDone=done[l.id];
            return(
              <button key={l.id} onClick={()=>setActiveId(l.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:20,border:`1px solid ${active?l.color+"88":T.border}`,background:active?l.color+"18":T.bgCard,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                <span style={{fontSize:13}}>{l.emoji}</span>
                <span style={{fontSize:10,color:active?T.text:T.textDim,fontWeight:active?600:400}}>{l.title}</span>
                {isDone&&<span style={{fontSize:9,color:T.good}}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Desktop Sidebar */}
        <div className="learn-desktop-sidebar" style={{width:200,borderRight:`1px solid ${T.border}`,padding:"14px 10px",overflowY:"auto",background:T.bgDeep,flexShrink:0}}>
          <div style={{fontSize:9,color:T.textFade,letterSpacing:"0.12em",marginBottom:14,paddingLeft:6}}>LESSONS — {totalDone}/{LESSONS.length} DONE</div>
          {LEARN_PHASES.map(phase=>(
            <div key={phase.label} style={{marginBottom:8}}>
              <div style={{fontSize:9,color:T.textFade,fontWeight:700,letterSpacing:"0.07em",padding:"3px 6px",marginBottom:3}}>{phase.label}</div>
              {phase.ids.map(id=>{
                const l = LESSONS.find(x=>x.id===id);
                const active = id===activeId;
                return (
                  <button key={id} onClick={()=>setActiveId(id)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 8px",borderRadius:6,border:"none",cursor:"pointer",background:active?`${l.color}18`:"transparent",borderLeft:active?`2px solid ${l.color}`:"2px solid transparent",textAlign:"left",marginBottom:1}}>
                    <span style={{fontSize:12}}>{l.emoji}</span>
                    <span style={{flex:1,color:active?T.text:T.textDim,fontSize:11,fontWeight:active?600:400,lineHeight:1.3}}>{l.title}</span>
                    {done[id]&&<span style={{color:T.good,fontSize:10}}>✓</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {onBack&&<div style={{padding:"8px 32px",borderBottom:`1px solid ${T.border}`,background:T.bgDeep,flexShrink:0}}>
            <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:T.textDim,padding:"4px 0",cursor:"pointer",fontSize:12,fontWeight:500}}>← Back to Roadmap</button>
          </div>}
        <div className="learn-content" style={{flex:1,overflowY:"auto",padding:"32px 40px"}}>
        <div style={{maxWidth:720}}>
          <div style={{marginBottom:6}}>
            <span style={{background:`${lesson.color}20`,color:lesson.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:"0.08em"}}>{lesson.phase}</span>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,margin:"10px 0 6px 0"}}>
            <span style={{fontSize:32}}>{lesson.emoji}</span>
            <div>
              <h2 style={{margin:0,fontSize:27,fontWeight:700,color:T.text,lineHeight:1.15,letterSpacing:"-0.03em"}}>{lesson.title}</h2>
              <p style={{margin:"8px 0 0 0",color:T.textDim,fontSize:12,fontFamily:"monospace"}}>{lesson.subtitle}</p>
            </div>
          </div>
          <div style={{height:1,background:T.border,margin:"20px 0"}}/>
          <Body/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:36,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
            <button onClick={()=>idx>0&&setActiveId(LESSONS[idx-1].id)} style={{background:T.bgCard,color:idx>0?T.textDim:T.textFade,border:`1px solid ${T.border}`,padding:"8px 16px",borderRadius:7,cursor:idx>0?"pointer":"default",fontSize:12}}>← prev</button>
            <button onClick={markDone} style={{background:lesson.color,color:"#000",border:"none",padding:"9px 22px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12}}>
              {done[activeId]?"✓ done":idx<LESSONS.length-1?"got it, next →":"complete ✓"}
            </button>
          </div>
        </div>
        </div>{/* end learn-content */}
        </div>{/* end content column */}
      </div>{/* end desktop layout */}
    </div>
  );
}

export { LearnTab, LESSONS, LEARN_PHASES, SECTION_TO_FIRST_LESSON, LESSON_COMPLETES_TASK };
