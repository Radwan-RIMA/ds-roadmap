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
    <div>
      <LP>NumPy is the engine under everything in data science — Pandas, scikit-learn, TensorFlow all use it internally. You don't need to master it deeply, but you need to understand how it thinks.</LP>
      <Callout icon="🧠" color="#38bdf8" title="The core idea">NumPy replaces Python loops with math that runs on your entire dataset at once. 1 million rows? Same speed as 10 rows. This is called vectorization.</Callout>

      <LH>1. Creating Arrays</LH>
      <Block label="The 6 ways you'll actually use">{`import numpy as np

# From a list
a = np.array([1, 2, 3, 4, 5])

# Zeros and ones (common for initialization)
np.zeros(5)          # [0. 0. 0. 0. 0.]
np.ones((3, 4))      # 3x4 matrix of 1s

# Range of numbers
np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]

# Evenly spaced (great for plotting)
np.linspace(0, 1, 5) # [0.  , 0.25, 0.5 , 0.75, 1.  ]

# Random (essential for ML)
np.random.seed(42)
np.random.randn(3, 3)  # 3x3 matrix of random normal values`}</Block>

      <LH>2. Array Shape — the most important concept</LH>
      <LP>Every NumPy array has a shape. Understanding shape is critical for ML — model inputs must match expected shapes.</LP>
      <Block label="Shape and reshaping">{`a = np.array([[1,2,3],[4,5,6]])
print(a.shape)    # (2, 3) → 2 rows, 3 columns
print(a.ndim)     # 2 → two-dimensional
print(a.size)     # 6 → total elements

# Reshape — change shape without changing data
a.reshape(3, 2)   # now 3 rows, 2 columns
a.reshape(6)      # flatten to 1D
a.flatten()       # same result

# Transpose — flip rows and columns
a.T               # shape becomes (3, 2)`}</Block>
      <Callout icon="⚠️" color="#f59e0b" title="Common shape error">If you get 'shapes not aligned' errors in ML, it's always a shape problem. Print .shape on every array when debugging.</Callout>

      <LH>3. Indexing and Slicing</LH>
      <Block label="1D indexing">{`a = np.array([10, 20, 30, 40, 50])
a[0]      # 10 — first element
a[-1]     # 50 — last element
a[1:4]    # [20, 30, 40] — index 1,2,3 (end not included)
a[::2]    # [10, 30, 50] — every 2nd element
a[::-1]   # [50, 40, 30, 20, 10] — reversed`}</Block>
      <Block label="2D indexing">{`m = np.array([[1,2,3],
              [4,5,6],
              [7,8,9]])

m[0]        # [1,2,3]  — first row
m[1,2]      # 6        — row 1, column 2
m[:,0]      # [1,4,7]  — ALL rows, first column
m[0:2, 1:]  # [[2,3],[5,6]] — rows 0-1, columns 1-2`}</Block>

      <LH>4. Vectorized Operations — the whole point</LH>
      <Block label="Operations on whole arrays">{`a = np.array([1, 2, 3, 4, 5])

# Math — applies to every element
a + 10       # [11, 12, 13, 14, 15]
a * 2        # [2, 4, 6, 8, 10]
a ** 2       # [1, 4, 9, 16, 25]
np.sqrt(a)   # [1., 1.41, 1.73, 2., 2.23]

# Two arrays — element by element
b = np.array([10, 20, 30, 40, 50])
a + b        # [11, 22, 33, 44, 55]
a * b        # [10, 40, 90, 160, 250]`}</Block>
      <Block label="Statistics — what you use every day">{`data = np.array([15, 22, 18, 30, 12, 27, 19])

np.mean(data)    # 20.43 — average
np.median(data)  # 19.0  — middle value
np.std(data)     # 5.98  — spread
np.var(data)     # 35.67 — variance
np.min(data)     # 12
np.max(data)     # 30
np.sum(data)     # 143
np.argmax(data)  # 3 — INDEX of the maximum value`}</Block>

      <LH>5. Boolean Masking — filtering without loops</LH>
      <LP>This is used constantly in data science. Instead of a loop, you create a True/False mask and apply it.</LP>
      <Block label="Boolean masking">{`salaries = np.array([35000, 72000, 48000, 95000, 61000])

# Create a mask
mask = salaries > 50000
# [False, True, False, True, True]

# Apply mask — keeps only True elements
salaries[mask]
# [72000, 95000, 61000]

# One line version
salaries[salaries > 50000]  # same result

# Multiple conditions
salaries[(salaries > 40000) & (salaries < 80000)]
# [72000, 48000, 61000]`}</Block>

      <LH>6. np.where — conditional replacement</LH>
      <Block label="np.where">{`scores = np.array([45, 78, 62, 90, 55])

# np.where(condition, value_if_true, value_if_false)
grades = np.where(scores >= 60, "Pass", "Fail")
# ['Fail', 'Pass', 'Pass', 'Pass', 'Fail']

# Clip values (common in ML preprocessing)
np.clip(scores, 50, 85)
# [50, 78, 62, 85, 55] — values clamped to range`}</Block>

      <LH>7. Real World — NumPy on the Telco Churn dataset</LH>
      <LP>Let's see NumPy in a real context. Imagine you loaded the Telco churn dataset:</LP>
      <Block label="NumPy on real data">{`import numpy as np
import pandas as pd

df = pd.read_csv('telco_churn.csv')

# Extract a column as NumPy array
charges = df['MonthlyCharges'].values  # .values converts to numpy

# Analyze
print("Average charge: $" + f"" + str(round(np.mean(charges),2)))
print("Std deviation:  $" + f"" + str(round(np.std(charges),2)))
print("Min: $" + f"" + str(round(np.min(charges),2)) + ", Max: $" + f"" + str(round(np.max(charges),2)))

# Find high-value customers
high_value = charges[charges > np.percentile(charges, 75)]
print("High-value customers: " + str(len(high_value)))

# Normalize for ML (scale to 0-1)
normalized = (charges - charges.min()) / (charges.max() - charges.min())
print("Normalized range: " + str(round(normalized.min(),2)) + " to " + str(round(normalized.max(),2)))`}</Block>
      <Callout icon="★" color="#f7c96e" title="Gold rule">In practice you rarely write NumPy directly — Pandas handles most data operations. But NumPy thinking (vectorization, shapes, broadcasting) is the foundation that makes everything else click.</Callout>

      <LH>Common Mistakes</LH>
      <Block label="Mistakes to avoid">{`# WRONG — Python loop over NumPy array
total = 0
for x in my_array:
    total += x

# RIGHT — vectorized
total = np.sum(my_array)

# WRONG — modifying during iteration
for i in range(len(a)):
    a[i] = a[i] * 2

# RIGHT
a = a * 2

# WRONG — ignoring shapes in ML
# ValueError: shapes (100,) and (100,1) not aligned
# RIGHT — check and fix
a = a.reshape(-1, 1)  # -1 means "figure it out"`}</Block>

      <Quiz questions={[
        {q:"np.arange(2, 10, 3) produces:",options:["[2,5,8]","[2,3,4,5,6,7,8,9]","[2,5,8,11]","[3,6,9]"],answer:"[2,5,8]",explanation:"arange(start, stop, step) — starts at 2, adds 3 each time, stops before 10. So: 2, 5, 8."},
        {q:"a = np.array([[1,2],[3,4],[5,6]]). What is a.shape?",options:["(2,3)","(3,2)","(6,)","(2,2,2)"],answer:"(3,2)",explanation:"3 rows, 2 columns. Shape is always (rows, columns)."},
        {q:"salaries = np.array([30,50,70,90]). What does salaries[salaries > 50] return?",options:["[True,False,True,True]","[70,90]","[50,70,90]","Error"],answer:"[70,90]",explanation:"salaries > 50 creates [False,False,True,True]. Applying this mask keeps only elements where True: [70,90]."},
        {q:"What does np.argmax(np.array([5,2,9,1,7])) return?",options:["9","2","4","0"],answer:"2",explanation:"argmax returns the INDEX of the maximum value, not the value itself. The maximum is 9, which is at index 2."},
        {q:"You need to scale an array to range 0-1. Which formula?",options:["a / np.max(a)","(a - a.mean()) / a.std()","(a - a.min()) / (a.max() - a.min())","a / np.sum(a)"],answer:"(a - a.min()) / (a.max() - a.min())",explanation:"This is min-max normalization. Subtract minimum (so smallest becomes 0), divide by range (so largest becomes 1)."},
      ]}/>
      <CodeExercise
        title="Filter high salaries and compute their average"
        description="You have a salaries array. Your tasks: (1) filter salaries above 50000 using boolean masking, (2) print the average of those high salaries rounded to 2 decimal places."
        starterCode={`import numpy as np

salaries = np.array([35000, 72000, 48000, 95000, 61000, 42000, 88000])

# Step 1: create 'high' — salaries above 50000
high = ___

# Step 2: print the average of 'high', rounded to 2 decimal places
print(___)`}
        hint="Boolean masking: salaries[salaries > 50000]. Average: np.mean(high). Wrap in round(..., 2)."
        validate={(output) => output.trim() === "79000.0"}
      />
    </div>
  )},
  {id:"pandas-basics",phase:"Python for DS",emoji:"🐼",color:"#a78bfa",title:"Pandas: Loading & Exploring Data",subtitle:"The tool you will use every single day as a data scientist",
   body:()=>(
    <div>
      <LP>Pandas is the most important Python library for data science. It gives you a DataFrame — think of it as a programmable Excel spreadsheet. Every DS role requires it.</LP>
      <Callout icon="🧠" color="#a78bfa" title="Mental model">A DataFrame is a table. Rows are observations (customers, transactions, patients). Columns are features (age, price, date). Everything you do in data science starts here.</Callout>

      <LH>1. Loading Data</LH>
      <Block label="Reading files">{`import pandas as pd

# CSV — most common
df = pd.read_csv('telco_churn.csv')

# Excel
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')

# From a URL
df = pd.read_csv('https://raw.githubusercontent.com/.../data.csv')

# With options
df = pd.read_csv('data.csv',
    sep=';',              # if separator is ; not ,
    encoding='utf-8',     # character encoding
    parse_dates=['date'], # auto-parse date columns
    index_col='id'        # use id column as index
)`}</Block>

      <LH>2. First Look — always do this first</LH>
      <Block label="Understanding your data">{`df.shape          # (7043, 21) — rows, columns
df.head(5)        # first 5 rows
df.tail(3)        # last 3 rows
df.dtypes         # data type of each column
df.info()         # types + null counts + memory usage
df.describe()     # stats for numeric columns
df.nunique()      # unique values per column
df.columns.tolist()  # list of column names`}</Block>
      <Callout icon="💡" color="#38bdf8" title="What to check in df.info()">Look for: (1) object columns that should be numeric, (2) columns with many nulls, (3) unexpected data types. Fix these before any analysis.</Callout>

      <LH>3. Selecting Data</LH>
      <Block label="Columns and rows">{`# Select ONE column → returns Series
df['MonthlyCharges']
df.MonthlyCharges  # same thing (dot notation)

# Select MULTIPLE columns → returns DataFrame
df[['customerID', 'MonthlyCharges', 'Churn']]

# Select rows by position (iloc)
df.iloc[0]        # first row
df.iloc[0:5]      # first 5 rows
df.iloc[0:5, 1:3] # rows 0-4, columns 1-2

# Select rows by label (loc)
df.loc[0]         # row with index label 0
df.loc[0:5, 'MonthlyCharges':'Churn']  # range of labels`}</Block>

      <LH>4. Filtering — the most used operation</LH>
      <Block label="Boolean filtering">{`# Single condition
df[df['Churn'] == 'Yes']
df[df['MonthlyCharges'] > 70]

# Multiple conditions — use & (and), | (or)
churned_high = df[
    (df['Churn'] == 'Yes') &
    (df['MonthlyCharges'] > 70)
]

# isin — match any value in a list
df[df['Contract'].isin(['Month-to-month', 'One year'])]

# String contains
df[df['InternetService'].str.contains('Fiber')]

# query — readable alternative
df.query("MonthlyCharges > 70 and Churn == 'Yes'")`}</Block>

      <LH>5. groupby — your most powerful tool</LH>
      <Block label="Aggregating groups">{`# Average monthly charge by contract type
df.groupby('Contract')['MonthlyCharges'].mean()

# Multiple aggregations at once
df.groupby('Contract').agg(
    avg_charge=('MonthlyCharges', 'mean'),
    total_customers=('customerID', 'count'),
    churn_count=('Churn', lambda x: (x=='Yes').sum())
)

# Churn rate by contract
df.groupby('Contract')['Churn'].value_counts(normalize=True)`}</Block>

      <LH>6. Adding & Modifying Columns</LH>
      <Block label="Creating new features">{`# Simple calculation
df['ChargesPerMonth'] = df['TotalCharges'] / (df['tenure'] + 1)

# Conditional column
df['HighValue'] = df['MonthlyCharges'] > 70

# Map values
df['ChurnBinary'] = df['Churn'].map({'Yes': 1, 'No': 0})

# Bin numeric values
df['TenureGroup'] = pd.cut(df['tenure'],
    bins=[0, 12, 24, 48, 999],
    labels=['New', 'Growing', 'Mature', 'Loyal']
)`}</Block>

      <LH>7. Sorting and Counting</LH>
      <Block label="Sort and count">{`df.sort_values('MonthlyCharges', ascending=False).head(10)
df.sort_values(['Contract', 'MonthlyCharges'])

df['Contract'].value_counts()
df['Contract'].value_counts(normalize=True)  # percentages`}</Block>

      <LH>Real World — Telco Churn First Look</LH>
      <Block label="Full first-look pipeline">{`df = pd.read_csv('telco_churn.csv')

print("Dataset: " + str(df.shape[0]) + " customers, " + str(df.shape[1]) + " features")
print("Churn rate: " + str(round((df['Churn']=='Yes').mean()*100,1)) + "%")
print("Avg monthly charge: $" + f"" + str(round(df['MonthlyCharges'].mean(),2)))
print("Missing values:\n" + str(df.isnull().sum()[df.isnull().sum()>0]))

# Who churns more — fiber or DSL?
df.groupby('InternetService')['Churn'].apply(
    lambda x: (x=='Yes').mean()
).sort_values(ascending=False)`}</Block>

      <Quiz questions={[
        {q:"df.iloc[2:5] returns:",options:["Rows with index labels 2,3,4","Rows at positions 2,3,4","Columns 2,3,4","Rows 2,3,4,5"],answer:"Rows at positions 2,3,4",explanation:"iloc uses integer positions. [2:5] means positions 2,3,4 (5 not included). Use loc for label-based selection."},
        {q:"df[(df['age']>30) & (df['salary']>50000)] — what does & do here?",options:["Bitwise AND on numbers","Combines two conditions — both must be True","Same as 'and' keyword","Selects columns age and salary"],answer:"Combines two conditions — both must be True",explanation:"In Pandas, use & instead of 'and' for combining conditions. Both conditions must be True for a row to be included. Always wrap each condition in parentheses."},
        {q:"df.groupby('dept')['salary'].mean() — what does this return?",options:["One number — mean of all salaries","A Series with mean salary per department","A DataFrame","An error"],answer:"A Series with mean salary per department",explanation:"groupby splits the data by dept. .mean() computes the average salary within each group. Result is a Series indexed by department name."},
        {q:"df['Churn'].value_counts(normalize=True) returns:",options:["Count of each unique value","Percentage of each unique value","Sorted values","Normalized numeric column"],answer:"Percentage of each unique value",explanation:"normalize=True divides each count by total, giving proportions (0 to 1). Multiply by 100 for percentages."},
        {q:"You want rows where Contract is 'Month-to-month' OR 'One year'. Best approach?",options:["Two separate filters merged","df[df['Contract'].isin(['Month-to-month','One year'])]","df.query('Contract == Month-to-month or One year')","df[df['Contract'] == 'Month-to-month' or 'One year']"],answer:"df[df['Contract'].isin(['Month-to-month','One year'])]",explanation:"isin() is the cleanest way to check membership in a list. The last option would raise a TypeError."},
      ]}/>
      <CodeExercise
        title="Explore a small customer DataFrame"
        description="A small customer dataset is provided. Fill in the blanks to: (1) print the number of rows, (2) print the average age, (3) print how many customers are from 'Beirut'."
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
  )},
  {id:"pandas-advanced",phase:"Python for DS",emoji:"🔗",color:"#34d399",title:"Pandas: Cleaning, Merging & Transforming",subtitle:"Real data is messy — here is how to fix it",
   body:()=>(
    <div>
      <LP>80% of a data scientist's time is spent cleaning and preparing data. This lesson covers the tools that make it fast and clean.</LP>

      <LH>1. Handling Missing Values</LH>
      <Block label="Finding and fixing nulls">{`# Find missing values
df.isnull().sum()                     # count per column
df.isnull().sum() / len(df) * 100     # percentage missing

# Drop missing
df.dropna()                           # drop rows with ANY null
df.dropna(subset=['TotalCharges'])    # only where this column is null
df.dropna(thresh=5)                   # keep rows with at least 5 non-null values

# Fill missing
df['TotalCharges'].fillna(0)
df['MonthlyCharges'].fillna(df['MonthlyCharges'].median())
df['Contract'].fillna('Unknown')
df.fillna(method='ffill')             # forward fill (time series)`}</Block>
      <Callout icon="🧠" color="#34d399" title="Drop vs Fill?">Drop when: data is missing randomly and you have enough rows. Fill when: missing has meaning (no internet = no internet charges), or you can't afford to lose rows. Never fill before splitting train/test.</Callout>

      <LH>2. Fixing Data Types</LH>
      <Block label="Type conversion">{`# TotalCharges loaded as string — needs to be numeric
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
# errors='coerce' turns non-convertible values into NaN

# Convert to datetime
df['signup_date'] = pd.to_datetime(df['signup_date'])
df['year'] = df['signup_date'].dt.year
df['month'] = df['signup_date'].dt.month
df['days_since'] = (pd.Timestamp.now() - df['signup_date']).dt.days

# Convert Yes/No to 1/0
df['Churn'] = (df['Churn'] == 'Yes').astype(int)`}</Block>

      <LH>3. String Operations</LH>
      <Block label="Working with text columns">{`# All string operations use .str accessor
df['Contract'].str.lower()
df['Contract'].str.upper()
df['Contract'].str.strip()            # remove whitespace
df['Contract'].str.replace('-', ' ')

# Extract patterns
df['email'].str.split('@').str[1]     # get domain from email
df['name'].str.contains('Ahmed')      # boolean mask

# Encode categories
df['Contract_encoded'] = df['Contract'].astype('category').cat.codes`}</Block>

      <LH>4. apply — custom transformations</LH>
      <Block label="apply on columns and rows">{`# On a column (Series)
df['RiskLevel'] = df['MonthlyCharges'].apply(
    lambda x: 'High' if x > 70 else ('Medium' if x > 40 else 'Low')
)

# On each row (slower — use only when needed)
df['Summary'] = df.apply(
    lambda row: f"{row['Contract']} customer paying $" + f"{row['MonthlyCharges']:.0f}/mo",
    axis=1
)

# Use vectorized alternatives when possible (faster):
# Instead of apply for math, use direct operations:
df['ChargePerTenure'] = df['MonthlyCharges'] / (df['tenure'] + 1)`}</Block>

      <LH>5. Merging DataFrames</LH>
      <Block label="Joins — combining tables">{`# Inner join — only rows that match in both
merged = customers.merge(orders, on='customer_id', how='inner')

# Left join — all rows from left, matching from right
merged = customers.merge(orders, on='customer_id', how='left')

# Multiple keys
merged = df1.merge(df2, on=['customer_id', 'date'])

# Concatenate — stack DataFrames vertically
combined = pd.concat([df_2022, df_2023], ignore_index=True)
combined = pd.concat([df_train, df_test], ignore_index=True)`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="Common merge mistake">After merging, always check the shape. If rows exploded (many-to-many join), you have duplicate keys. Always check for duplicates before merging: df.duplicated('key_column').sum()</Callout>

      <LH>6. Method Chaining — clean professional code</LH>
      <Block label="Full cleaning pipeline">{`# Messy way — lots of intermediate variables
df2 = df.copy()
df2 = df2.dropna(subset=['TotalCharges'])
df2['TotalCharges'] = pd.to_numeric(df2['TotalCharges'], errors='coerce')
df2['Churn'] = (df2['Churn'] == 'Yes').astype(int)
df2 = df2.sort_values('MonthlyCharges', ascending=False)

# Clean way — method chaining
df_clean = (
    df
    .copy()
    .dropna(subset=['TotalCharges'])
    .assign(
        TotalCharges=lambda x: pd.to_numeric(x['TotalCharges'], errors='coerce'),
        Churn=lambda x: (x['Churn'] == 'Yes').astype(int),
        ChargePerMonth=lambda x: x['TotalCharges'] / (x['tenure'] + 1)
    )
    .sort_values('MonthlyCharges', ascending=False)
    .reset_index(drop=True)
)`}</Block>

      <LH>7. pivot_table — summarize like Excel</LH>
      <Block label="pivot_table">{`# Average monthly charge by contract and internet service
pd.pivot_table(df,
    values='MonthlyCharges',
    index='Contract',
    columns='InternetService',
    aggfunc='mean'
)

# Churn rate by contract type
pd.pivot_table(df,
    values='Churn',
    index='Contract',
    aggfunc=lambda x: (x=='Yes').mean()
)`}</Block>

      <LH>Real World — Clean the Telco Dataset</LH>
      <Block label="Full cleaning pipeline for Telco">{`df = pd.read_csv('telco_churn.csv')

df_clean = (
    df
    .copy()
    .replace(' ', pd.NA)               # blank strings → NaN
    .assign(
        TotalCharges=lambda x: pd.to_numeric(x['TotalCharges'], errors='coerce'),
        Churn=lambda x: (x['Churn'] == 'Yes').astype(int),
        SeniorCitizen=lambda x: x['SeniorCitizen'].astype(int),
        ChargesPerMonth=lambda x: x['TotalCharges'] / (x['tenure'] + 1)
    )
    .dropna(subset=['TotalCharges'])
    .reset_index(drop=True)
)

print("Clean dataset: " + str(df_clean.shape))
print("Churn rate: " + str(round(df_clean['Churn'].mean()*100,1)) + "%")`}</Block>

      <Quiz questions={[
        {q:"pd.to_numeric(df['col'], errors='coerce') — what does errors='coerce' do?",options:["Raises error on bad values","Skips bad values","Converts bad values to NaN","Converts to string"],answer:"Converts bad values to NaN",explanation:"errors='coerce' silently converts anything that can't be turned into a number into NaN. Useful when a numeric column has some text values mixed in."},
        {q:"After merging two DataFrames your row count tripled. What happened?",options:["Normal — merging adds rows","Many-to-many join — duplicate keys in one or both tables","left join behavior","The merge failed"],answer:"Many-to-many join — duplicate keys in one or both tables",explanation:"If the key column has duplicates in both tables, each row matches multiple rows and creates a cartesian product. Always check for duplicates before merging."},
        {q:"df.assign(new_col=lambda x: x['a'] + x['b']) — what does this do?",options:["Modifies df in place","Returns a new DataFrame with new_col added","Raises AttributeError","Modifies columns a and b"],answer:"Returns a new DataFrame with new_col added",explanation:"assign() always returns a new DataFrame — it never modifies in place. This makes it safe to use in method chains."},
        {q:"df['Contract'].str.contains('month', case=False) — what does this return?",options:["The matching strings","A True/False Series","Count of matches","Error"],answer:"A True/False Series",explanation:"str.contains() returns a boolean Series — True where the pattern is found. case=False makes it case-insensitive."},
        {q:"When should you use dropna() vs fillna()?",options:["Always use dropna","Always use fillna","Drop when you can afford to lose rows; fill when missing has meaning or you need all rows","Drop numeric nulls; fill text nulls"],answer:"Drop when you can afford to lose rows; fill when missing has meaning or you need all rows",explanation:"dropna loses data. fillna can introduce bias if not done carefully. For ML: never fill before train/test split — fit imputers on train, transform both."},
      ]}/>
      <CodeExercise
        title="Clean a messy DataFrame"
        description="A DataFrame has missing values and duplicates. Fill in the blanks to: (1) fill missing age with the column mean, (2) drop duplicate rows, (3) print the final shape."
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
print(df.___)` }
        hint="df['age'].mean() for the fill value. drop_duplicates() removes duplicates. df.shape gives (rows, cols)."
        validate={(output) => output.includes("(4,") || output.includes("4,")}
      />
    </div>
  )},
  {id:"eda",phase:"Python for DS",emoji:"🔍",color:"#f472b6",title:"Exploratory Data Analysis (EDA)",subtitle:"The skill that separates good data scientists from great ones",
   body:()=>(
    <div>
      <LP>EDA is what separates a data scientist from someone who just runs models. Senior DSs spend more time on EDA than on modeling — because understanding your data is what prevents bad models.</LP>
      <Callout icon="🧠" color="#f472b6" title="The detective mindset">You're a detective. Every dataset has hidden stories, problems, and patterns. Your job before touching any model is to find them. Ask questions first, code second.</Callout>

      <LH>1. The EDA Framework — 5 Questions</LH>
      <LP>Before writing any code, ask these 5 questions about every dataset:</LP>
      <Block label="5 questions to answer">{`# 1. What is the shape of my data?
# 2. What are the types and meanings of each column?
# 3. What is missing and how much?
# 4. What does the target variable look like?
# 5. What features correlate with the target?`}</Block>

      <LH>2. The EDA Starter Pack</LH>
      <Block label="Always run this first">{`import pandas as pd
import numpy as np

df = pd.read_csv('telco_churn.csv')

# Shape
print("Rows: " + str(df.shape[0]) + ", Columns: " + str(df.shape[1]))

# Types and missing
print(df.info())

# Statistics
print(df.describe())

# Missing values
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(2)
print(pd.DataFrame({'Missing': missing, 'Pct': missing_pct})
      [missing > 0])`}</Block>

      <LH>3. Understanding the Target Variable</LH>
      <Block label="Analyzing churn (target)">{`# Class distribution — critical for ML
print(df['Churn'].value_counts())
print(df['Churn'].value_counts(normalize=True))

# Output:
# No     5174  (73.5%)
# Yes    1869  (26.5%)

# This is class imbalance — important for model selection!
# A model that always predicts "No" gets 73.5% accuracy
# but catches 0 churners. Always check this.`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="Class imbalance trap">If your target is imbalanced (e.g. 95% No, 5% Yes), accuracy is meaningless. Use precision, recall, F1, and AUC instead. This is one of the most common mistakes in real ML projects.</Callout>

      <LH>4. Univariate Analysis — one column at a time</LH>
      <Block label="Numeric columns">{`import matplotlib.pyplot as plt
import seaborn as sns

# Distribution of monthly charges
sns.histplot(df['MonthlyCharges'], bins=40, kde=True)
plt.title('Monthly Charges Distribution')
plt.show()

# Key stats
print("Mean:   $" + f"" + str(round(df['MonthlyCharges'].mean(),2)))
print("Median: $" + f"" + str(round(df['MonthlyCharges'].median(),2)))
print("Std:    $" + f"" + str(round(df['MonthlyCharges'].std(),2)))

# If mean >> median → right skew → outliers pulling up`}</Block>
      <Block label="Categorical columns">{`# Contract type counts
df['Contract'].value_counts().plot(kind='bar')
plt.title('Contract Types')
plt.show()

# All categorical columns at once
cat_cols = df.select_dtypes(include='object').columns
for col in cat_cols:
    print("\n" + str(col) + ":")
    print(df[col].value_counts())`}</Block>

      <LH>5. Bivariate Analysis — how features relate to target</LH>
      <Block label="Feature vs target">{`# Numeric feature vs churn
sns.boxplot(x='Churn', y='MonthlyCharges', data=df)
plt.title('Monthly Charges by Churn Status')
plt.show()

# Categorical feature vs churn rate
churn_by_contract = df.groupby('Contract')['Churn'].apply(
    lambda x: (x=='Yes').mean()
).sort_values(ascending=False)

churn_by_contract.plot(kind='bar', color='#f472b6')
plt.title('Churn Rate by Contract Type')
plt.ylabel('Churn Rate')
plt.show()`}</Block>

      <LH>6. Correlation Analysis</LH>
      <Block label="Finding correlations">{`# Correlation with target (after encoding)
df['ChurnBinary'] = (df['Churn'] == 'Yes').astype(int)

# Numeric correlations
corr = df.select_dtypes(include='number').corr()['ChurnBinary']
print(corr.sort_values(ascending=False))

# Heatmap of all correlations
plt.figure(figsize=(10,8))
sns.heatmap(
    df.select_dtypes(include='number').corr(),
    annot=True, fmt='.2f', cmap='coolwarm', center=0
)
plt.show()`}</Block>

      <LH>7. Outlier Detection</LH>
      <Block label="IQR method">{`def find_outliers(df, col):
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = df[(df[col] < lower) | (df[col] > upper)]
    print(str(col) + ": " + str(len(outliers)) + " outliers (" + str(round(len(outliers)/len(df)*100,1)) + "%" + ")")
    return outliers

for col in ['MonthlyCharges', 'TotalCharges', 'tenure']:
    find_outliers(df, col)`}</Block>

      <LH>8. Full EDA on Telco Churn</LH>
      <Block label="Real EDA workflow">{`df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['ChurnBinary'] = (df['Churn'] == 'Yes').astype(int)

print("=== DATASET OVERVIEW ===")
print("Shape: " + str(df.shape))
print("Churn rate: " + str(round(df['ChurnBinary'].mean()*100,1)) + "%")
print("Missing: " + str(df.isnull().sum().sum()) + " total")

print("\n=== TOP CHURN PREDICTORS ===")
# Contract type
print(df.groupby('Contract')['ChurnBinary'].mean().sort_values(ascending=False))

print("\n=== HIGH-RISK SEGMENT ===")
high_risk = df[
    (df['Contract'] == 'Month-to-month') &
    (df['tenure'] < 12) &
    (df['MonthlyCharges'] > 65)
]
print("High-risk customers: " + str(len(high_risk)))
print("Their churn rate: " + str(round(high_risk['ChurnBinary'].mean()*100,1)) + "%")`}</Block>
      <Callout icon="★" color="#f7c96e" title="Gold habit">Before every model, write 5 specific questions about the data. Answer each with code. This forces you to understand the data instead of blindly running sklearn.</Callout>

      <Quiz questions={[
        {q:"You're building a fraud model. 99% of transactions are legitimate. You get 99% accuracy. Is the model good?",options:["Yes, 99% is excellent","No — a model predicting 'not fraud' always gets 99% accuracy","Only if recall is also 99%","Depends on the algorithm"],answer:"No — a model predicting 'not fraud' always gets 99% accuracy",explanation:"Class imbalance makes accuracy misleading. Always check precision, recall, and F1. A model that never detects fraud is useless despite high accuracy."},
        {q:"df['price'].mean() = 1200 but df['price'].median() = 450. What does this suggest?",options:["Normal distribution","Right skew — expensive outliers pulling the mean up","Left skew","Data has errors"],answer:"Right skew — expensive outliers pulling the mean up",explanation:"When mean >> median, a few very high values are pulling the average up. Always check median for skewed data — it's more representative of the 'typical' value."},
        {q:"What is the first thing you should check about your target variable?",options:["Its correlation with features","Its class distribution (balance)","Its data type","Its missing values"],answer:"Its class distribution (balance)",explanation:"Class imbalance fundamentally changes how you build and evaluate models. A severely imbalanced target requires special techniques like SMOTE, class weights, and different evaluation metrics."},
        {q:"Correlation of -0.4 between 'tenure' and 'Churn'. What does this mean?",options:["No relationship","Longer tenure → less likely to churn","Longer tenure → more likely to churn","The relationship is too weak to matter"],answer:"Longer tenure → less likely to churn",explanation:"Negative correlation means as one goes up, the other goes down. Customers who stay longer are less likely to churn — they're loyal."},
        {q:"What does bivariate analysis mean?",options:["Analyzing two datasets","Analyzing the relationship between two variables","Using two algorithms","Splitting data into two parts"],answer:"Analyzing the relationship between two variables",explanation:"Bivariate = two variables. You're looking at how one feature relates to another — especially how each feature relates to your target variable."},
      ]}/>
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

# 2. Churn rate % rounded to 1 decimal
churn_rate = (df['churn'] == ___).mean() * 100
print(round(churn_rate, ___))

# 3. Most common contract type
print(df[___].value_counts().idxmax())` }
        hint="df.shape. 'Yes' for churn condition. round(x, 1). df['contract'].value_counts().idxmax()."
        validate={(output) => output.includes("(6,") && output.includes("50.0") && output.includes("Month-to-month")}
      />
    </div>
  )},
  {id:"visualization",phase:"Python for DS",emoji:"📊",color:"#fb923c",title:"Data Visualization",subtitle:"Turn numbers into insights that anyone can understand",
   body:()=>(
    <div>
      <LP>Visualization is how you communicate findings. A great insight nobody understands is worthless. A good chart that tells a clear story wins every meeting.</LP>
      <Callout icon="🧠" color="#fb923c" title="The rule">Every chart must answer one specific question. If you can't state the question, don't make the chart.</Callout>

      <LH>1. Which Chart to Use</LH>
      <Block label="Chart decision guide">{`# Distribution of ONE numeric column     → Histogram
# Counts of ONE categorical column       → Bar chart
# Relationship between TWO numeric cols  → Scatter plot
# Numeric vs categorical comparison      → Box plot
# Change over time                       → Line chart
# Correlation between many columns       → Heatmap
# Part of a whole                        → Pie chart (use sparingly)`}</Block>

      <LH>2. Setup</LH>
      <Block label="Imports and style">{`import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Set a clean style
sns.set_theme(style='darkgrid', palette='muted')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 12

df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['ChurnBinary'] = (df['Churn'] == 'Yes').astype(int)`}</Block>

      <LH>3. Histogram — understanding distributions</LH>
      <Block label="Histogram">{`fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Monthly charges distribution
sns.histplot(df['MonthlyCharges'], bins=40, kde=True, ax=axes[0], color='#7eb8f7')
axes[0].set_title('Monthly Charges Distribution')
axes[0].set_xlabel('Monthly Charges ($)')

# By churn status
sns.histplot(data=df, x='MonthlyCharges', hue='Churn',
             bins=30, kde=True, ax=axes[1])
axes[1].set_title('Monthly Charges: Churned vs Retained')
plt.tight_layout()
plt.show()`}</Block>

      <LH>4. Bar Chart — comparing categories</LH>
      <Block label="Bar chart">{`# Churn rate by contract type
churn_rate = df.groupby('Contract')['ChurnBinary'].mean().sort_values(ascending=False)

plt.figure(figsize=(8, 5))
bars = plt.bar(churn_rate.index, churn_rate.values * 100,
               color=['#f28b82', '#f7c96e', '#6dd6a0'])

# Add value labels on bars
for bar, val in zip(bars, churn_rate.values):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
             f'{val:.1%}', ha='center', va='bottom', fontweight='bold')

plt.title('Churn Rate by Contract Type')
plt.ylabel('Churn Rate (%)')
plt.show()`}</Block>

      <LH>5. Box Plot — distributions across groups</LH>
      <Block label="Box plot">{`plt.figure(figsize=(10, 6))
sns.boxplot(data=df, x='Contract', y='MonthlyCharges',
            hue='Churn', palette={'Yes': '#f28b82', 'No': '#6dd6a0'})
plt.title('Monthly Charges by Contract Type and Churn Status')
plt.xlabel('Contract Type')
plt.ylabel('Monthly Charges ($)')
plt.legend(title='Churned')
plt.show()

# How to read: box = middle 50%, line = median, dots = outliers`}</Block>

      <LH>6. Scatter Plot — relationships</LH>
      <Block label="Scatter plot">{`plt.figure(figsize=(10, 6))
scatter = plt.scatter(
    df['tenure'],
    df['MonthlyCharges'],
    c=df['ChurnBinary'],           # color by churn
    cmap='RdYlGn_r',               # red=churn, green=stay
    alpha=0.4,
    s=20
)
plt.colorbar(scatter, label='Churned (1=Yes)')
plt.title('Tenure vs Monthly Charges (colored by Churn)')
plt.xlabel('Tenure (months)')
plt.ylabel('Monthly Charges ($)')
plt.show()`}</Block>

      <LH>7. Heatmap — correlations</LH>
      <Block label="Correlation heatmap">{`plt.figure(figsize=(10, 8))
corr_matrix = df.select_dtypes(include='number').corr()
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))  # hide upper triangle

sns.heatmap(corr_matrix,
    mask=mask,
    annot=True,
    fmt='.2f',
    cmap='coolwarm',
    center=0,
    square=True,
    linewidths=0.5
)
plt.title('Feature Correlation Matrix')
plt.tight_layout()
plt.show()`}</Block>

      <LH>8. Subplots — telling the full story</LH>
      <Block label="Dashboard-style multi-chart">{`fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Telco Churn — EDA Dashboard', fontsize=16, fontweight='bold')

# 1. Churn distribution
df['Churn'].value_counts().plot(kind='pie', ax=axes[0,0],
    autopct='%1.1f%%', colors=['#6dd6a0','#f28b82'])
axes[0,0].set_title('Churn Distribution')

# 2. Monthly charges by churn
sns.boxplot(data=df, x='Churn', y='MonthlyCharges', ax=axes[0,1],
    palette={'Yes':'#f28b82','No':'#6dd6a0'})
axes[0,1].set_title('Monthly Charges by Churn')

# 3. Churn by contract
churn_by_contract = df.groupby('Contract')['ChurnBinary'].mean()
churn_by_contract.plot(kind='bar', ax=axes[1,0], color='#7eb8f7')
axes[1,0].set_title('Churn Rate by Contract')
axes[1,0].set_ylabel('Churn Rate')

# 4. Tenure distribution
sns.histplot(data=df, x='tenure', hue='Churn', ax=axes[1,1], bins=30)
axes[1,1].set_title('Tenure Distribution by Churn')

plt.tight_layout()
plt.show()`}</Block>

      <Callout icon="★" color="#f7c96e" title="Presentation rule">Every chart in a report needs: (1) a clear title, (2) labeled axes, (3) a one-sentence takeaway in the caption. 'This chart shows...' is not a takeaway. 'Month-to-month customers churn 3x more than annual customers' is.</Callout>

      <Quiz questions={[
        {q:"You want to compare salary distributions across 5 departments AND show outliers. Best chart?",options:["5 histograms","Scatter plot","Box plot","Bar chart"],answer:"Box plot",explanation:"Box plots show median, IQR, and outliers for each group side by side. Perfect for comparing distributions across categories."},
        {q:"A correlation heatmap shows -0.35 between 'tenure' and 'Churn'. What does this mean?",options:["No correlation","Longer tenure → lower churn probability","Longer tenure → higher churn probability","Weak positive relationship"],answer:"Longer tenure → lower churn probability",explanation:"-0.35 is a moderate negative correlation. As tenure increases, churn decreases. Loyal customers stay."},
        {q:"When should you NOT use a pie chart?",options:["When comparing categories","When you have more than 3-4 segments","When showing percentages","Always — pie charts are never useful"],answer:"When you have more than 3-4 segments",explanation:"Pie charts are hard to read with many slices. For more than 3-4 categories, use a bar chart instead."},
        {q:"What does kde=True do in sns.histplot()?",options:["Adds a kernel density estimate curve","Makes bars wider","Shows outliers","Normalizes to percentages"],answer:"Adds a kernel density estimate curve",explanation:"KDE (Kernel Density Estimate) is a smooth curve showing the probability distribution of the data. It helps visualize the shape of the distribution beyond just bar heights."},
        {q:"You make a chart but can't write a one-sentence takeaway. What should you do?",options:["Add more data to the chart","Rethink what question the chart is answering","Add a legend","Change the chart type"],answer:"Rethink what question the chart is answering",explanation:"If you can't state a clear takeaway, the chart isn't answering a specific question. Every visualization should start with a question, not a plot command."},
      ]}/>
      <CodeExercise
        title="Compute chart-ready summary stats"
        description="Before plotting, always summarize first. Fill in the blanks: compute mean charge per contract type, then print the top contract."
        starterCode={`import pandas as pd

data = {
    'contract': ['Month-to-month','One year','Month-to-month','Two year','One year','Two year'],
    'monthly_charges': [75, 55, 85, 40, 60, 45]
}
df = pd.DataFrame(data)

# Mean charge per contract type
result = df.groupby(___)[___].mean().round(1)
print(result)

# Contract with highest mean
print(result.___)` }
        hint="groupby('contract')['monthly_charges'].mean(). Then .idxmax() for the highest."
        validate={(output) => output.includes("Month-to-month") && output.includes("80.0")}
      />
    </div>
  )},
    {id:"sql-basics",phase:"SQL",emoji:"🗄️",color:"#fb923c",title:"SQL Foundations",subtitle:"SELECT, WHERE, GROUP BY — the language of data",
   body:()=>(
    <div>
      <LP>SQL is how you talk to databases. It's required in almost every data job. The good news: 80% of real SQL uses just 6 keywords.</LP>
      <Callout icon="🧠" color="#fb923c" title="The golden order"><strong style={{color:"#fff"}}>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT</strong><br/>SQL always executes in this order. Writing it in any other order causes errors.</Callout>

      <LH>1. SELECT and FROM — the basics</LH>
      <Block label="Selecting data">{`-- All columns
SELECT * FROM customers;

-- Specific columns
SELECT customer_id, name, monthly_charges FROM customers;

-- With calculations
SELECT name,
       monthly_charges,
       monthly_charges * 12 AS annual_charges,
       monthly_charges * 0.1 AS monthly_discount
FROM customers;

-- Rename columns
SELECT name AS customer_name,
       monthly_charges AS charge
FROM customers;`}</Block>

      <LH>2. WHERE — filtering rows</LH>
      <Block label="Filtering">{`-- Single condition
SELECT * FROM customers WHERE churn = 'Yes';

-- Comparison operators: =, !=, >, <, >=, <=
SELECT * FROM customers WHERE monthly_charges > 70;

-- AND / OR
SELECT * FROM customers
WHERE monthly_charges > 70 AND contract = 'Month-to-month';

SELECT * FROM customers
WHERE contract = 'Month-to-month' OR contract = 'One year';

-- IN — match a list
SELECT * FROM customers
WHERE contract IN ('Month-to-month', 'One year');

-- BETWEEN (inclusive)
SELECT * FROM customers
WHERE monthly_charges BETWEEN 50 AND 80;

-- LIKE — pattern matching
SELECT * FROM customers WHERE name LIKE 'Ahmed%';  -- starts with Ahmed
SELECT * FROM customers WHERE email LIKE '%@gmail.com';  -- gmail users

-- NULL handling
SELECT * FROM customers WHERE total_charges IS NULL;
SELECT * FROM customers WHERE total_charges IS NOT NULL;`}</Block>

      <LH>3. GROUP BY + Aggregations</LH>
      <Block label="Aggregating data">{`-- Aggregate functions: COUNT, SUM, AVG, MIN, MAX
SELECT
    contract,
    COUNT(*) AS total_customers,
    AVG(monthly_charges) AS avg_charge,
    SUM(monthly_charges) AS total_revenue,
    MIN(monthly_charges) AS min_charge,
    MAX(monthly_charges) AS max_charge
FROM customers
GROUP BY contract;

-- COUNT(*) vs COUNT(column)
-- COUNT(*) counts ALL rows including NULLs
-- COUNT(col) counts only non-NULL values
SELECT COUNT(*), COUNT(total_charges) FROM customers;

-- DISTINCT — count unique values
SELECT COUNT(DISTINCT customer_id) FROM orders;`}</Block>

      <LH>4. HAVING — filter groups</LH>
      <Callout icon="🧠" color="#f7c96e" title="WHERE vs HAVING">WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER grouping. You cannot use AVG/SUM in WHERE.</Callout>
      <Block label="HAVING">{`-- Contracts with more than 1000 customers
SELECT contract, COUNT(*) AS total
FROM customers
GROUP BY contract
HAVING COUNT(*) > 1000;

-- High-revenue contract types
SELECT contract, AVG(monthly_charges) AS avg_charge
FROM customers
GROUP BY contract
HAVING AVG(monthly_charges) > 65
ORDER BY avg_charge DESC;`}</Block>

      <LH>5. ORDER BY and LIMIT</LH>
      <Block label="Sorting and limiting">{`-- Sort by monthly charges descending
SELECT * FROM customers
ORDER BY monthly_charges DESC;

-- Multiple sort keys
SELECT * FROM customers
ORDER BY contract ASC, monthly_charges DESC;

-- Top 10 highest-paying customers
SELECT name, monthly_charges
FROM customers
ORDER BY monthly_charges DESC
LIMIT 10;`}</Block>

      <LH>6. CASE WHEN — if/else in SQL</LH>
      <Block label="CASE WHEN">{`SELECT name, monthly_charges,
    CASE
        WHEN monthly_charges > 80 THEN 'High Value'
        WHEN monthly_charges > 50 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS customer_segment
FROM customers;

-- Count by segment
SELECT
    CASE
        WHEN monthly_charges > 80 THEN 'High'
        WHEN monthly_charges > 50 THEN 'Medium'
        ELSE 'Low'
    END AS segment,
    COUNT(*) AS count,
    AVG(CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END) AS churn_rate
FROM customers
GROUP BY 1  -- group by first SELECT column
ORDER BY churn_rate DESC;`}</Block>

      <LH>Real World — Telco Churn Analysis in SQL</LH>
      <Block label="Business questions answered in SQL">{`-- Question 1: What is the overall churn rate?
SELECT
    COUNT(*) AS total_customers,
    SUM(CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END) AS churned,
    AVG(CASE WHEN churn = 'Yes' THEN 1.0 ELSE 0 END) AS churn_rate
FROM customers;

-- Question 2: Which contract type has highest churn?
SELECT contract,
       COUNT(*) AS customers,
       AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END) AS churn_rate
FROM customers
GROUP BY contract
ORDER BY churn_rate DESC;

-- Question 3: Top 5 most expensive churned customers
SELECT customer_id, name, monthly_charges, total_charges
FROM customers
WHERE churn = 'Yes'
ORDER BY monthly_charges DESC
LIMIT 5;`}</Block>

      <Quiz questions={[
        {q:"What is wrong with: SELECT dept, AVG(salary) FROM emp WHERE AVG(salary) > 70000 GROUP BY dept",options:["Nothing","Cannot use AVG() in WHERE — use HAVING","GROUP BY must come before WHERE","HAVING is missing"],answer:"Cannot use AVG() in WHERE — use HAVING",explanation:"WHERE runs before GROUP BY, so aggregates don't exist yet. Move AVG(salary) > 70000 to HAVING."},
        {q:"SELECT COUNT(*) vs SELECT COUNT(salary) — difference?",options:["No difference","COUNT(*) counts all rows; COUNT(salary) skips NULLs","COUNT(salary) is faster","COUNT(*) only counts distinct values"],answer:"COUNT(*) counts all rows; COUNT(salary) skips NULLs",explanation:"COUNT(*) counts every row regardless of nulls. COUNT(column) only counts rows where that column is not NULL."},
        {q:"SELECT * FROM orders WHERE total BETWEEN 100 AND 200 — this includes:",options:["100 < total < 200 (exclusive)","100 <= total <= 200 (inclusive)","Only 100 and 200","total > 100 AND total < 200"],answer:"100 <= total <= 200 (inclusive)",explanation:"BETWEEN is inclusive on both ends. BETWEEN 100 AND 200 is equivalent to total >= 100 AND total <= 200."},
        {q:"You want all customers whose email ends with '@gmail.com'. Which WHERE clause?",options:["WHERE email = '@gmail.com'","WHERE email LIKE '%@gmail.com'","WHERE email CONTAINS '@gmail.com'","WHERE email IN ('@gmail.com')"],answer:"WHERE email LIKE '%@gmail.com'",explanation:"% is a wildcard matching any number of characters. '%@gmail.com' means anything followed by @gmail.com."},
        {q:"To get the 3 most expensive products per category, you need:",options:["WHERE rank <= 3","ORDER BY price DESC LIMIT 3","GROUP BY category HAVING rank <= 3","Window function with PARTITION BY category ORDER BY price DESC, then filter WHERE rn <= 3"],answer:"Window function with PARTITION BY category ORDER BY price DESC, then filter WHERE rn <= 3",explanation:"LIMIT applies to the whole result, not per group. You need ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) to rank within each category."},
      ]}/>
      <CodeExercise
        title="Summarize sales data with GROUP BY logic"
        description="Use pandas to replicate SQL GROUP BY. Fill in the blanks to: (1) compute total revenue per city sorted descending, (2) print the city with the highest revenue."
        starterCode={`import pandas as pd

data = {
    'city':    ['Beirut','Tripoli','Beirut','Sidon','Tripoli','Beirut'],
    'revenue': [500, 300, 700, 200, 450, 600]
}
df = pd.DataFrame(data)

# 1. Group by city, sum revenue, sort descending
result = df.groupby(___)[___].sum().sort_values(ascending=___)
print(result.to_string())

# 2. Print the city with the highest revenue
print(result.___())`}
        hint="groupby('city')['revenue'].sum().sort_values(ascending=False). Then .idxmax() gives the top city."
        validate={(output) => output.includes("Beirut") && output.includes("1800")}
      />
    </div>
  )},
  {id:"sql-joins",phase:"SQL",emoji:"🔀",color:"#f472b6",title:"SQL JOINs & Subqueries",subtitle:"Connecting tables — tested in every DS interview",
   body:()=>(
    <div>
      <LP>Real databases spread data across many tables. JOINs connect them. This is the most tested SQL topic in data science interviews.</LP>

      <LH>1. Understanding JOINs with a Visual</LH>
      <Block label="Sample tables">{`-- customers table              -- orders table
customer_id | name  | city       order_id | customer_id | amount
1           | Ahmed | Beirut     101      | 1           | 250
2           | Sara  | Dubai      102      | 1           | 180
3           | Omar  | Cairo      103      | 2           | 320
4           | Lina  | Beirut     104      | 5           | 150  ← no match!`}</Block>

      <LH>2. INNER JOIN — only matching rows</LH>
      <Block label="INNER JOIN">{`SELECT c.name, o.order_id, o.amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
-- Returns: Ahmed (2 rows), Sara (1 row)
-- Omar and Lina dropped — no orders
-- Order 104 dropped — customer 5 doesn't exist`}</Block>

      <LH>3. LEFT JOIN — all left, matching right</LH>
      <Block label="LEFT JOIN">{`SELECT c.name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;
-- Returns: Ahmed, Sara, Omar (NULL), Lina (NULL)
-- All customers kept, non-matching orders = NULL

-- Find customers with NO orders
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`}</Block>

      <LH>4. Multiple JOINs</LH>
      <Block label="Chaining joins">{`SELECT
    c.name,
    o.amount,
    p.product_name,
    s.rep_name AS sales_rep
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN products p ON o.product_id = p.product_id
LEFT JOIN sales_reps s ON c.rep_id = s.rep_id
WHERE o.amount > 200;`}</Block>

      <LH>5. CTEs — making complex queries readable</LH>
      <Callout icon="★" color="#f7c96e" title="Interview gold">In interviews, always use CTEs to decompose complex problems. It shows structured thinking.</Callout>
      <Block label="CTE example">{`-- Without CTE — hard to read
SELECT a.contract, a.avg_charge, b.churn_rate
FROM (SELECT contract, AVG(monthly_charges) as avg_charge FROM customers GROUP BY contract) a
JOIN (SELECT contract, AVG(CASE WHEN churn='Yes' THEN 1.0 ELSE 0 END) as churn_rate FROM customers GROUP BY contract) b
ON a.contract = b.contract;

-- With CTEs — clean and readable
WITH contract_charges AS (
    SELECT contract, AVG(monthly_charges) AS avg_charge
    FROM customers
    GROUP BY contract
),
contract_churn AS (
    SELECT contract,
           AVG(CASE WHEN churn = 'Yes' THEN 1.0 ELSE 0 END) AS churn_rate
    FROM customers
    GROUP BY contract
)
SELECT cc.contract, cc.avg_charge, ch.churn_rate
FROM contract_charges cc
JOIN contract_churn ch ON cc.contract = ch.contract
ORDER BY ch.churn_rate DESC;`}</Block>

      <LH>6. Subqueries</LH>
      <Block label="Subqueries">{`-- Customers who pay more than the average
SELECT name, monthly_charges
FROM customers
WHERE monthly_charges > (SELECT AVG(monthly_charges) FROM customers);

-- Customers who have placed at least one order > $500
SELECT name FROM customers
WHERE customer_id IN (
    SELECT DISTINCT customer_id FROM orders WHERE amount > 500
);

-- Correlated subquery — slowest but powerful
SELECT name, monthly_charges
FROM customers c
WHERE monthly_charges > (
    SELECT AVG(monthly_charges)
    FROM customers
    WHERE contract = c.contract  -- references outer query
);`}</Block>

      <LH>Real Interview Question</LH>
      <Block label="Classic DS interview SQL">{`-- "Find the contract type with the highest average monthly charge
--  among customers who have been with us more than 24 months"

WITH long_term AS (
    SELECT * FROM customers WHERE tenure > 24
)
SELECT
    contract,
    COUNT(*) AS customers,
    ROUND(AVG(monthly_charges), 2) AS avg_charge
FROM long_term
GROUP BY contract
ORDER BY avg_charge DESC
LIMIT 1;`}</Block>

      <Quiz questions={[
        {q:"You want ALL customers AND their orders (if any). Customers with no orders should still appear. Which join?",options:["INNER JOIN","RIGHT JOIN","LEFT JOIN (customers LEFT JOIN orders)","FULL OUTER JOIN"],answer:"LEFT JOIN (customers LEFT JOIN orders)",explanation:"LEFT JOIN keeps all rows from the left table (customers). Customers with no matching orders get NULL in order columns."},
        {q:"After a LEFT JOIN, you filter WHERE o.order_id IS NULL. What does this return?",options:["All rows with orders","Rows where join failed — customers with no orders","NULL rows from both tables","An error"],answer:"Rows where join failed — customers with no orders",explanation:"After LEFT JOIN, unmatched rows from the right table become NULL. Filtering for NULL finds customers who have no matching orders."},
        {q:"What is the main advantage of a CTE over a subquery?",options:["CTEs execute faster","CTEs are named, reusable within the query, and more readable","Subqueries can't be used with JOINs","CTEs support more SQL functions"],answer:"CTEs are named, reusable within the query, and more readable",explanation:"CTEs make complex queries readable by breaking them into named steps. You can also reference the same CTE multiple times, unlike a subquery."},
        {q:"customers INNER JOIN orders ON customer_id — Omar has no orders. Does Omar appear?",options:["Yes with NULL in order columns","No — INNER JOIN drops non-matching rows","Yes — INNER JOIN keeps all rows","Depends on the database"],answer:"No — INNER JOIN drops non-matching rows",explanation:"INNER JOIN only returns rows that have a match in BOTH tables. Omar with no orders is excluded."},
        {q:"You're asked to find the top 3 customers by total spending in each city. What do you need?",options:["GROUP BY city ORDER BY SUM(amount) DESC LIMIT 3","PARTITION BY city ORDER BY SUM(amount) DESC, then WHERE rn <= 3","WHERE city IN (SELECT TOP 3...)","Two separate queries combined with UNION"],answer:"PARTITION BY city ORDER BY SUM(amount) DESC, then WHERE rn <= 3",explanation:"LIMIT 3 is global. For top N per group, use ROW_NUMBER() OVER (PARTITION BY city ORDER BY total_spending DESC) in a CTE, then filter WHERE rn <= 3."},
      ]}/>
      <CodeExercise
        title="Simulate a JOIN with pandas merge"
        description="Fill in the blanks to merge two DataFrames (INNER JOIN) and print total spending per customer name."
        starterCode={`import pandas as pd

customers = pd.DataFrame({
    'customer_id': [1, 2, 3],
    'name': ['Ahmed', 'Sara', 'Omar']
})
orders = pd.DataFrame({
    'customer_id': [1, 1, 2],
    'amount': [250, 180, 320]
})

# Merge on customer_id (INNER JOIN)
merged = customers.___(orders, on=___, how=___)

# Total amount per customer name
result = merged.groupby(___)['amount'].sum()
print(result.to_string())` }
        hint="customers.merge(orders, on='customer_id', how='inner'). groupby('name')."
        validate={(output) => output.includes("Ahmed") && output.includes("430")}
      />
    </div>
  )},
  {id:"sql-window",phase:"SQL",emoji:"🪟",color:"#c084fc",title:"Window Functions",subtitle:"The SQL skill that makes you dangerous",
   body:()=>(
    <div>
      <LP>Window functions are what separates people who "know SQL" from people who are genuinely strong at SQL. Every senior DS uses them. They appear in almost every technical interview.</LP>
      <Callout icon="🧠" color="#c084fc" title="GROUP BY vs Window Functions">GROUP BY collapses rows into one row per group. Window functions ADD a computed column to each row without removing any rows. You keep the full detail.</Callout>

      <LH>1. The OVER() Clause</LH>
      <Block label="Basic structure">{`-- function() OVER (PARTITION BY col ORDER BY col)
-- PARTITION BY = which group to compute within (like GROUP BY)
-- ORDER BY = how to sort within the partition

SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    salary - AVG(salary) OVER (PARTITION BY department) AS vs_dept_avg
FROM employees;
-- Every row is kept. Each row shows its salary AND dept average.`}</Block>

      <LH>2. ROW_NUMBER, RANK, DENSE_RANK</LH>
      <Block label="Ranking functions">{`SELECT name, department, salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
    RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rnk
FROM employees;

-- If two people tie at $80k:
-- ROW_NUMBER:  1, 2, 3  (always unique — arbitrary tiebreak)
-- RANK:        1, 1, 3  (both get 1, next is 3 — gap)
-- DENSE_RANK:  1, 1, 2  (both get 1, next is 2 — no gap)

-- Classic interview: Top earner per department
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
    FROM employees
)
SELECT * FROM ranked WHERE rn = 1;`}</Block>

      <LH>3. LAG and LEAD — accessing other rows</LH>
      <Block label="LAG and LEAD">{`-- Month-over-month revenue change
SELECT
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month)  AS prev_month_revenue,
    LEAD(revenue, 1) OVER (ORDER BY month) AS next_month_revenue,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS monthly_change,
    ROUND(
        (revenue - LAG(revenue,1) OVER (ORDER BY month)) /
        LAG(revenue,1) OVER (ORDER BY month) * 100, 2
    ) AS pct_change
FROM monthly_sales;`}</Block>

      <LH>4. SUM/AVG OVER — running calculations</LH>
      <Block label="Running totals and moving averages">{`SELECT
    date,
    daily_sales,
    SUM(daily_sales) OVER (ORDER BY date) AS running_total,
    AVG(daily_sales) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_avg
FROM daily_sales;

-- ROWS BETWEEN defines the window frame:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  → from start to now
-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          → last 7 rows
-- ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING           → 3-row centered window`}</Block>

      <LH>5. NTILE — percentile buckets</LH>
      <Block label="NTILE">{`-- Divide customers into 4 spending quartiles
SELECT name, monthly_charges,
    NTILE(4) OVER (ORDER BY monthly_charges) AS quartile
FROM customers;
-- Quartile 1 = lowest spenders, 4 = highest`}</Block>

      <LH>Real Interview Question — Solved Step by Step</LH>
      <Block label="Classic window function interview problem">{`-- "For each customer, show their monthly charge,
--  the average charge of their contract type,
--  their rank within their contract type by charge,
--  and their cumulative charges month by month"

SELECT
    customer_id,
    name,
    contract,
    monthly_charges,
    ROUND(AVG(monthly_charges) OVER (PARTITION BY contract), 2) AS contract_avg,
    RANK() OVER (PARTITION BY contract ORDER BY monthly_charges DESC) AS rank_in_contract,
    SUM(monthly_charges) OVER (
        PARTITION BY customer_id
        ORDER BY tenure
    ) AS cumulative_charges
FROM customers;`}</Block>

      <Quiz questions={[
        {q:"What does PARTITION BY do in a window function?",options:["Same as GROUP BY — collapses rows","Defines the group for calculation without collapsing rows","Filters rows before calculation","Sorts the output"],answer:"Defines the group for calculation without collapsing rows",explanation:"PARTITION BY divides data into groups for the window function to operate within, but all rows remain in the output. This is the key difference from GROUP BY."},
        {q:"Two employees tie with $80k salary. ROW_NUMBER gives them 1 and 2. RANK gives them both 1. What comes next in RANK?",options:["2","3","1","Depends on ORDER BY"],answer:"3",explanation:"RANK skips ranks for ties. Two people at rank 1 means the next person is rank 3 (rank 2 is skipped). DENSE_RANK would give rank 2 without skipping."},
        {q:"LAG(sales, 1) OVER (ORDER BY month) returns:",options:["Next month's sales","Sales 1% lower","Previous month's sales","Average of all months"],answer:"Previous month's sales",explanation:"LAG looks backward. LAG(col, 1) returns the value from 1 row before in the specified ordering. LEAD looks forward."},
        {q:"SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) computes:",options:["Total sum of all rows","Running total from start to current row","Sum of last N rows","Sum partitioned by date"],answer:"Running total from start to current row",explanation:"UNBOUNDED PRECEDING means from the very beginning. This is a cumulative sum — each row shows the sum of all previous rows including itself."},
        {q:"You need the 2nd highest paid employee in each department. What's your approach?",options:["WHERE salary = 2nd_max subquery","RANK() OVER (PARTITION BY dept ORDER BY salary DESC) then WHERE rnk = 2","ORDER BY salary DESC LIMIT 2 per dept","GROUP BY dept HAVING salary = MAX-1"],answer:"RANK() OVER (PARTITION BY dept ORDER BY salary DESC) then WHERE rnk = 2",explanation:"Use RANK or DENSE_RANK (DENSE_RANK handles ties better) to rank within each department, wrap in a CTE, then filter WHERE rnk = 2."},
      ]}/>
      <CodeExercise
        title="Add running total and rank columns"
        description="Fill in the blanks to add: (1) a running_total column using cumsum, (2) a rank column based on sales descending."
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

print(df.to_string(index=False))` }
        hint="df['sales'].cumsum(). df['sales'].rank(ascending=False, method='min')."
        validate={(output) => output.includes("750") && output.includes("1") && output.includes("Apr")}
      />
    </div>
  )},
  {id:"probability",phase:"Statistics",emoji:"🎲",color:"#818cf8",title:"Probability & Bayes",subtitle:"The foundation of every ML prediction",
   body:()=>(
    <div>
      <LP>Every ML model outputs a probability. Understanding what that number means — and how to reason with it — is what separates good data scientists from people who just run code.</LP>

      <LH>1. Basic Probability</LH>
      <Block label="Core definitions">{`# P(event) = favorable outcomes / total outcomes
# P(rolling a 6) = 1/6 ≈ 0.167

# Key rules:
# 0 ≤ P(A) ≤ 1  (probability is between 0 and 1)
# P(A) + P(not A) = 1  (complement rule)
# P(A or B) = P(A) + P(B) - P(A and B)  (addition rule)
# P(A and B) = P(A) × P(B)  if A and B are INDEPENDENT

# Example: Telco churn
# P(churn) = 1869/7043 ≈ 0.265
# P(not churn) = 1 - 0.265 = 0.735`}</Block>

      <LH>2. Conditional Probability</LH>
      <Block label="P(A | B) — probability of A given B">{`# P(A|B) = P(A and B) / P(B)
# "What is the probability of churn GIVEN month-to-month contract?"

# In Python:
import pandas as pd
df = pd.read_csv('telco_churn.csv')

# P(churn | month-to-month)
month_to_month = df[df['Contract'] == 'Month-to-month']
p_churn_given_monthly = (month_to_month['Churn'] == 'Yes').mean()
print("P(churn | month-to-month) = " + str(round(p_churn_given_monthly*100,1)) + "%")
# ≈ 42.7% — much higher than overall 26.5%

# Compare:
for contract in df['Contract'].unique():
    subset = df[df['Contract'] == contract]
    rate = (subset['Churn'] == 'Yes').mean()
    print("P(churn | " + contract + ") = " + str(round(rate*100,1)) + "%")`}</Block>

      <LH>3. Bayes' Theorem</LH>
      <LP>Bayes' theorem is how you update your belief when you get new evidence. It's the foundation of spam filters, medical tests, and Naive Bayes classifiers.</LP>
      <Block label="Bayes theorem">{`# P(A|B) = P(B|A) × P(A) / P(B)

# Real example: Email spam filter
# P(spam) = 0.20  (prior — 20% of emails are spam)
# P(word "FREE" | spam) = 0.60  (60% of spam contains "FREE")
# P(word "FREE" | not spam) = 0.05  (5% of legit emails contain "FREE")

p_spam = 0.20
p_free_given_spam = 0.60
p_free_given_not_spam = 0.05
p_not_spam = 1 - p_spam

# P("FREE")
p_free = p_free_given_spam * p_spam + p_free_given_not_spam * p_not_spam
# P("FREE") = 0.60 × 0.20 + 0.05 × 0.80 = 0.12 + 0.04 = 0.16

# P(spam | "FREE")
p_spam_given_free = (p_free_given_spam * p_spam) / p_free
print("P(spam | email contains FREE) = " + str(round(p_spam_given_free*100,1)) + "%")
# ≈ 75% — seeing "FREE" strongly suggests spam`}</Block>

      <LH>4. Independence vs Dependence</LH>
      <Block label="When events are independent">{`# Two events are independent if P(A and B) = P(A) × P(B)
# Knowing A happened tells you nothing about B

# Independent: two coin flips
p_heads_twice = 0.5 * 0.5  # = 0.25 ✓

# NOT independent: churn and contract type
# Knowing contract = month-to-month changes P(churn)
# These are DEPENDENT

# In ML: feature independence is assumed by Naive Bayes
# It's often wrong but works surprisingly well in practice`}</Block>

      <LH>5. Expected Value</LH>
      <Block label="Expected value">{`# E[X] = sum of (value × probability)
# "On average, what do we expect?"

# Example: Customer lifetime value
# 40% chance customer stays 12 months paying $65/mo = $780
# 35% chance customer stays 6 months paying $65/mo = $390
# 25% chance customer churns in 3 months paying $65/mo = $195

e_ltv = (0.40 * 780) + (0.35 * 390) + (0.25 * 195)
print("Expected LTV: $" + f"" + str(round(e_ltv,2)))
# = $312 + $136.5 + $48.75 = $497.25`}</Block>

      <Quiz questions={[
        {q:"P(churn) = 0.27. What is P(not churn)?",options:["0.27","0.73","0.54","Cannot determine"],answer:"0.73",explanation:"P(not A) = 1 - P(A). If 27% churn, 73% don't. Probabilities of all outcomes must sum to 1."},
        {q:"P(A and B) = P(A) × P(B). This means A and B are:",options:["Mutually exclusive","Dependent","Independent","Complementary"],answer:"Independent",explanation:"Two events are independent when knowing one gives no information about the other. For independent events, joint probability = product of individual probabilities."},
        {q:"You test 1000 customers. 300 are on month-to-month contracts. Of those, 128 churned. What is P(churn | month-to-month)?",options:["128/1000 = 12.8%","128/300 = 42.7%","300/1000 = 30%","128/700 = 18.3%"],answer:"128/300 = 42.7%",explanation:"Conditional probability = favorable cases within the condition / total cases within the condition. 128 churned out of 300 month-to-month customers."},
        {q:"Bayes theorem updates what?",options:["The algorithm weights","Your prior belief based on new evidence","The training data","The model architecture"],answer:"Your prior belief based on new evidence",explanation:"Bayes theorem is about updating beliefs. You start with a prior probability, observe evidence, and calculate the posterior probability — your updated belief."},
        {q:"E[revenue] = (0.6 × $1000) + (0.4 × $200). What is the expected revenue?",options:["$600","$680","$1200","$800"],answer:"$680",explanation:"0.6 × 1000 = 600. 0.4 × 200 = 80. Total = $680. Expected value is the probability-weighted average outcome."},
      ]}/>
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
print("Expected revenue: $" + str(expected))` }
        hint="prob_a=0.6, rev_a=1000, prob_b=0.4, rev_b=200. expected = prob_a*rev_a + prob_b*rev_b."
        validate={(output) => output.includes("680")}
      />
    </div>
  )},
  {id:"distributions",phase:"Statistics",emoji:"📈",color:"#fbbf24",title:"Statistical Distributions",subtitle:"Normal, Binomial, Poisson — and why they matter for ML",
   body:()=>(
    <div>
      <LP>Distributions describe how data is spread. Every ML algorithm makes assumptions about distributions. Knowing them helps you choose the right model and debug bad ones.</LP>

      <LH>1. Normal (Gaussian) Distribution</LH>
      <Block label="The bell curve">{`import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# Normal distribution: N(mean, std)
# mean = center of the bell curve
# std = width (how spread out)

# Properties:
# 68% of data within 1 std of mean
# 95% of data within 2 std of mean
# 99.7% of data within 3 std of mean

mu, sigma = 65, 15  # mean=65, std=15
data = np.random.normal(mu, sigma, 1000)

plt.hist(data, bins=40, density=True, alpha=0.7, color='#818cf8')
x = np.linspace(20, 110, 100)
plt.plot(x, stats.norm.pdf(x, mu, sigma), 'r-', linewidth=2)
plt.title('Normal Distribution N(65, 15)')
plt.show()

# Check if YOUR data is normal
from scipy.stats import shapiro
stat, p = shapiro(data[:50])  # shapiro works on small samples
print("p-value: " + str(round(p,3)))
# p > 0.05 → data is likely normal`}</Block>
      <Callout icon="💡" color="#818cf8" title="When data is normal">Linear regression, many statistical tests, and z-scores all assume normality. If your data is heavily skewed, you may need to log-transform it first.</Callout>

      <LH>2. Standardization (Z-scores)</LH>
      <Block label="Standardizing data">{`# Z-score = (value - mean) / std
# Converts to: mean=0, std=1
# Tells you: how many standard deviations from the mean?

from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

# Manual z-score
z_scores = (data - data.mean()) / data.std()

# Practical use: identify outliers
# |z| > 3 → likely outlier (beyond 3 standard deviations)
outliers = data[np.abs(z_scores) > 3]
print("Outliers: " + str(len(outliers)))`}</Block>

      <LH>3. Binomial Distribution</LH>
      <Block label="Counting successes">{`# Binomial(n, p): n trials, p probability of success each time
# "How many customers will churn out of 100?"

from scipy.stats import binom

n = 100      # 100 new customers
p = 0.265    # 26.5% churn rate

# Expected number of churners
expected = n * p
print("Expected churners: " + str(round(expected,1)))

# Probability of exactly 30 churning
p_exactly_30 = binom.pmf(30, n, p)
print("P(exactly 30 churn) = " + str(round(p_exactly_30,3)))

# Probability of 25 or fewer churning
p_25_or_fewer = binom.cdf(25, n, p)
print("P(25 or fewer churn) = " + str(round(p_25_or_fewer,3)))`}</Block>

      <LH>4. Central Limit Theorem (CLT)</LH>
      <LP>This is one of the most important theorems in statistics. It says: no matter what distribution your data follows, if you take enough samples and compute their means, those means follow a normal distribution.</LP>
      <Block label="CLT in action">{`# Non-normal data (exponential)
data = np.random.exponential(scale=2, size=10000)

# Take 1000 samples of size 30 and compute their means
sample_means = [np.mean(np.random.choice(data, 30)) for _ in range(1000)]

plt.figure(figsize=(12,4))
plt.subplot(1,2,1)
plt.hist(data, bins=50, color='#f28b82')
plt.title('Original Data (skewed)')

plt.subplot(1,2,2)
plt.hist(sample_means, bins=50, color='#6dd6a0')
plt.title('Sample Means (normal!)')
plt.tight_layout()
plt.show()

# WHY THIS MATTERS:
# CLT is why t-tests and confidence intervals work
# even on non-normal data, as long as n >= 30`}</Block>

      <LH>5. Skewness in Real Data</LH>
      <Block label="Detecting and fixing skew">{`import pandas as pd
df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')

print("Skewness of TotalCharges: " + str(round(df['TotalCharges'].skew(),2)))
# Positive skew = tail on right = few very high values

# Fix with log transform
import numpy as np
df['TotalCharges_log'] = np.log1p(df['TotalCharges'])
print("Skewness after log: " + str(round(df['TotalCharges_log'].skew(),2)))

# Why fix skew?
# Linear models perform better on normally distributed features
# Outliers have less influence after log transform`}</Block>

      <Quiz questions={[
        {q:"68% of data falls within what range in a normal distribution N(50, 10)?",options:["40 to 60","30 to 70","45 to 55","20 to 80"],answer:"40 to 60",explanation:"68% falls within 1 standard deviation (±1σ) of the mean. Mean=50, std=10, so 50-10=40 to 50+10=60."},
        {q:"A z-score of -2.5 means the value is:",options:["2.5 units below mean","2.5 standard deviations below the mean","In the bottom 2.5%","Negative"],answer:"2.5 standard deviations below the mean",explanation:"Z-score = (value - mean) / std. Z=-2.5 means 2.5 standard deviations below the mean, which puts it in roughly the bottom 1% of the distribution."},
        {q:"The Central Limit Theorem says:",options:["All data is normally distributed","Large datasets are always normal","Sample means approach normal distribution as sample size grows","Standard deviation decreases with more data"],answer:"Sample means approach normal distribution as sample size grows",explanation:"CLT: regardless of the population distribution, the distribution of sample means approaches normal as n increases (typically n ≥ 30 is sufficient)."},
        {q:"You have right-skewed data (salary). What transformation helps?",options:["Squaring the values","Subtracting the mean","Log transformation","Adding the median"],answer:"Log transformation",explanation:"Log transformation compresses the long right tail, making skewed data more symmetric. np.log1p() is used (log(1+x)) to handle zero values."},
        {q:"Binomial(100, 0.1) models what scenario?",options:["100 trials, each with 10% success probability","10 trials with 100% success","Success after 100 failures","100% probability of 10 successes"],answer:"100 trials, each with 10% success probability",explanation:"Binomial(n, p) = n independent trials, each with probability p of success. Here: 100 trials (customers), 10% chance each one churns."},
      ]}/>
      <CodeExercise
        title="Sample from a normal distribution"
        description="Fill in the blanks to generate 1000 samples with mean=50, std=10, then print the sample mean and std."
        starterCode={`import numpy as np
np.random.seed(42)

# Generate 1000 samples — mean=50, std=10
samples = np.random.normal(loc=___, scale=___, size=___)

# Print sample mean (rounded to 1 decimal)
print(round(np.___(samples), 1))

# Print sample std (rounded to 1 decimal)
print(round(np.___(samples), 1))` }
        hint="np.random.normal(loc=50, scale=10, size=1000). np.mean() and np.std()."
        validate={(output) => { const lines=output.trim().split("\n"); const m=parseFloat(lines[0]); const s=parseFloat(lines[1]); return m>48&&m<52&&s>9&&s<11; }}
      />
    </div>
  )},
  {id:"correlation",phase:"Statistics",emoji:"🔗",color:"#2dd4bf",title:"Correlation & Causation",subtitle:"The mistake that gets candidates eliminated in interviews",
   body:()=>(
    <div>
      <LP>Confusing correlation with causation is the most common statistical mistake in data science. Understanding this deeply will make you stand out in interviews and in real projects.</LP>

      <LH>1. Correlation — measuring relationships</LH>
      <Block label="Pearson correlation">{`import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['ChurnBinary'] = (df['Churn'] == 'Yes').astype(int)

# Pearson correlation (-1 to +1)
# +1 = perfect positive (as X goes up, Y goes up)
#  0 = no linear relationship
# -1 = perfect negative (as X goes up, Y goes down)

corr = df[['tenure', 'MonthlyCharges', 'TotalCharges', 'ChurnBinary']].corr()
print(corr['ChurnBinary'].sort_values())

# Heatmap
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.show()`}</Block>
      <Callout icon="💡" color="#2dd4bf" title="Interpreting Pearson r">abs(r) below 0.3 = weak, 0.3–0.7 = moderate, above 0.7 = strong. But correlation only measures LINEAR relationships.</Callout>

      <LH>2. Types of Correlation</LH>
      <Block label="Pearson vs Spearman vs Point-Biserial">{`from scipy import stats

# Pearson — linear relationship between two continuous variables
r, p = stats.pearsonr(df['tenure'], df['MonthlyCharges'])
print("Pearson r = " + str(round(r,3)) + ", p = " + str(round(p,4)))

# Spearman — rank-based, handles non-linear relationships and outliers
rho, p = stats.spearmanr(df['tenure'], df['MonthlyCharges'])
print("Spearman rho = " + str(round(rho,3)) + ", p = " + str(round(p,4)))

# Point-biserial — continuous vs binary
r, p = stats.pointbiserialr(df['ChurnBinary'], df['MonthlyCharges'])
print("Point-biserial r = " + str(round(r,3)) + ", p = " + str(round(p,4)))

# Use Spearman when: data is skewed, has outliers, or relationship is non-linear`}</Block>

      <LH>3. Correlation vs Causation — the big idea</LH>
      <Block label="Famous examples">{`# CORRELATION ≠ CAUSATION

# Classic examples:
# Ice cream sales correlate with drowning deaths → CAUSE: summer heat
# Nicolas Cage movies correlate with pool drownings → COINCIDENCE
# Shoe size correlates with reading ability in children → CAUSE: age

# Spurious correlations in data:
# In our Telco data:
# TotalCharges correlates strongly with tenure (r ≈ 0.83)
# But TotalCharges = MonthlyCharges × tenure — it's a mathematical relationship!
# It's not a CAUSAL relationship

# The 3 explanations for correlation:
# 1. A causes B
# 2. B causes A
# 3. C causes both A and B (confounding variable)`}</Block>

      <LH>4. Confounding Variables</LH>
      <Block label="Confounders in real data">{`# Example: "Internet service correlates with high churn"
# But fiber customers also have higher monthly charges
# Is it the internet type or the price causing churn?

# Check for confounding:
print(df.groupby('InternetService')[['MonthlyCharges', 'ChurnBinary']].mean())

# Fiber users pay more AND churn more
# We can't tell if it's the service or the price without controlling

# Controlling for confounders:
high_charge = df[df['MonthlyCharges'] > 70]
low_charge = df[df['MonthlyCharges'] <= 70]

for name, subset in [('High charge', high_charge), ('Low charge', low_charge)]:
    churn = subset.groupby('InternetService')['ChurnBinary'].mean()
    print("\n" + str(name) + ":\n" + str(churn))`}</Block>

      <LH>5. When Correlation IS Useful</LH>
      <Block label="Feature selection with correlation">{`# In ML, correlation helps select features
# and detect multicollinearity

# High correlation with target → good predictor
target_corr = df.select_dtypes(include='number').corr()['ChurnBinary']
good_features = target_corr[target_corr.abs() > 0.2].index.tolist()
print("Potentially useful features:", good_features)

# High correlation between features → multicollinearity problem
# Tenure and TotalCharges are highly correlated (r=0.83)
# Including both adds little information, can hurt some models
# Solution: drop one, or use PCA

# VIF (Variance Inflation Factor) detects multicollinearity
from statsmodels.stats.outliers_influence import variance_inflation_factor
# VIF > 10 indicates problematic multicollinearity`}</Block>

      <Quiz questions={[
        {q:"A study finds ice cream sales correlate with drowning deaths (r=0.85). What is the most likely explanation?",options:["Ice cream causes drowning","Drowning causes ice cream sales","A confounding variable (summer heat) causes both","The correlation is spurious and meaningless"],answer:"A confounding variable (summer heat) causes both",explanation:"Summer heat increases both ice cream sales AND swimming (which increases drowning risk). Heat is the confounding variable. This is correlation without causation."},
        {q:"Pearson r = 0.02 between two variables. What does this mean?",options:["Strong positive relationship","Perfect independence","Weak or no LINEAR relationship","Weak negative relationship"],answer:"Weak or no LINEAR relationship",explanation:"Pearson r only measures linear relationships. r=0.02 means no linear relationship — but there could be a strong non-linear relationship. Always plot your data."},
        {q:"Spearman correlation is preferred over Pearson when:",options:["Data is perfectly normal","You need higher precision","Data has outliers or non-linear relationships","Sample size is large"],answer:"Data has outliers or non-linear relationships",explanation:"Spearman uses ranks instead of raw values, making it robust to outliers and non-linear monotonic relationships."},
        {q:"Feature A has r=0.75 with the target AND r=0.90 with feature B. What's the concern?",options:["A is too important","B should be removed","Multicollinearity — A and B carry similar information","No concern"],answer:"Multicollinearity — A and B carry similar information",explanation:"High correlation between features (multicollinearity) means they carry redundant information. This can inflate feature importance and make coefficients unstable in linear models."},
        {q:"You find that customers with fiber internet churn more. You want to claim 'fiber internet CAUSES churn'. What do you need?",options:["A correlation above 0.7","A p-value below 0.05","A controlled experiment (A/B test) or controlling for all confounders","More data"],answer:"A controlled experiment (A/B test) or controlling for all confounders",explanation:"Correlation doesn't prove causation. To claim cause, you need either a randomized controlled experiment (A/B test) or careful statistical control for all potential confounders."},
      ]}/>
      <CodeExercise
        title="Find the most correlated feature"
        description="Fill in the blanks to compute a correlation matrix and find which feature correlates most with churn_score."
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

# 2. Feature most correlated with churn_score
corr = df.corr()[___].drop(___).abs()
print(corr.idxmax())` }
        hint="df.corr(). corr()['churn_score'].drop('churn_score').abs().idxmax()."
        validate={(output) => output.includes("support_calls") || output.includes("tenure")}
      />
    </div>
  )},
  {id:"inference",phase:"Statistics",emoji:"🧪",color:"#f87171",title:"Statistical Inference & A/B Testing",subtitle:"Make data-driven decisions with confidence",
   body:()=>(
    <div>
      <LP>Statistical inference is how you make confident conclusions from data. A/B testing is how companies make product decisions. Both are core DS skills used every day at tech companies.</LP>

      <LH>1. Hypothesis Testing Framework</LH>
      <Block label="The 5-step process">{`# Step 1: State the hypotheses
# H0 (null hypothesis): "no effect" — the boring default
# H1 (alternative hypothesis): "there IS an effect"

# Example: "Does our new onboarding reduce churn?"
# H0: New onboarding has NO effect on churn rate
# H1: New onboarding reduces churn rate

# Step 2: Choose significance level (α)
alpha = 0.05  # 5% — most common in industry
# This is our tolerance for false positives

# Step 3: Calculate test statistic and p-value
# Step 4: Compare p-value to α
# Step 5: Decide — reject H0 or fail to reject H0`}</Block>
      <Callout icon="🧠" color="#f87171" title="What p-value actually means">p-value = probability of seeing your results (or more extreme) IF H0 is true. p = 0.03 means: if there were truly no effect, you'd see results this extreme only 3% of the time. Low p → reject H0.</Callout>

      <LH>2. The Most Common Tests</LH>
      <Block label="t-test — comparing means">{`from scipy import stats
import pandas as pd
import numpy as np

df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')

# Question: Do churned customers pay different monthly charges?
churned = df[df['Churn']=='Yes']['MonthlyCharges']
retained = df[df['Churn']=='No']['MonthlyCharges']

# Two-sample t-test
t_stat, p_value = stats.ttest_ind(churned, retained)
print("Churned mean:  $" + f"" + str(round(churned.mean(),2)))
print("Retained mean: $" + f"" + str(round(retained.mean(),2)))
print("t-statistic: " + str(round(t_stat,3)))
print("p-value: " + str(round(p_value,6)))

if p_value < 0.05:
    print("REJECT H0 — significant difference in monthly charges")
else:
    print("FAIL TO REJECT H0 — no significant difference")`}</Block>

      <LH>3. Chi-Square Test — for categorical variables</LH>
      <Block label="Chi-square test">{`# Question: Is there a relationship between contract type and churn?
contingency = pd.crosstab(df['Contract'], df['Churn'])
print(contingency)

chi2, p, dof, expected = stats.chi2_contingency(contingency)
print("\nChi-square: " + str(round(chi2,2)))
print("p-value: " + str(round(p,6)))
print("Degrees of freedom: " + str(dof))

if p < 0.05:
    print("Contract type and churn are NOT independent — significant relationship")`}</Block>

      <LH>4. A/B Testing — the industry standard</LH>
      <Block label="Full A/B test workflow">{`import numpy as np
from scipy import stats

# Scenario: Test new onboarding flow
# Control: 1000 customers, 245 churned (24.5%)
# Treatment: 1000 customers, 198 churned (19.8%)

n_control = 1000
churn_control = 245
rate_control = churn_control / n_control

n_treatment = 1000
churn_treatment = 198
rate_treatment = churn_treatment / n_treatment

print("Control churn rate:   " + str(round(rate_control*100,1)) + "%")
print("Treatment churn rate: " + str(round(rate_treatment*100,1)) + "%")
print("Absolute reduction:   " + str(round(rate_control - rate_treatment*100,1)) + "%")
print("Relative reduction:   " + str(round((rate_control - rate_treatment)/rate_control*100,1)) + "%")

# Statistical test for proportions
count = np.array([churn_treatment, churn_control])
nobs = np.array([n_treatment, n_control])
z_stat, p_value = stats.proportions_ztest(count, nobs, alternative='smaller')

print("\nz-statistic: " + str(round(z_stat,3)))
print("p-value: " + str(round(p_value,4)))
print("Result:", "SIGNIFICANT ✓" if p_value < 0.05 else "NOT significant ✗")`}</Block>

      <LH>5. Statistical Power and Sample Size</LH>
      <Block label="How many users do you need?">{`from statsmodels.stats.power import TTestIndPower, NormalIndPower

# Key inputs:
# effect_size: how big a difference you want to detect
# alpha: significance level (0.05)
# power: probability of detecting a real effect (0.80 = standard)

# For churn rate: current = 26.5%, want to detect 3% reduction
p1 = 0.265  # control
p2 = 0.235  # treatment (3% absolute reduction)

# Effect size (Cohen's h for proportions)
from statsmodels.stats.proportion import proportion_effectsize
effect = proportion_effectsize(p1, p2)

from statsmodels.stats.power import NormalIndPower
analysis = NormalIndPower()
n = analysis.solve_power(effect_size=effect, alpha=0.05, power=0.80)
print("Required sample size per group: " + str(round(n,0)))
# You need this many users in EACH group before starting the test!`}</Block>
      <Callout icon="⚠️" color="#f28b82" title="Common A/B testing mistakes">1. Stopping early when you see significance (p-hacking). 2. Running multiple tests and using the best p-value. 3. Not calculating required sample size before starting. 4. Confusing statistical significance with practical significance.</Callout>

      <LH>6. Confidence Intervals</LH>
      <Block label="Confidence intervals">{`import scipy.stats as stats
import numpy as np

# 95% CI for churn rate
n = 1000
churned = 245
rate = churned / n

# Wilson score interval (better than normal approximation)
from statsmodels.stats.proportion import proportion_confint
ci_low, ci_high = proportion_confint(churned, n, alpha=0.05, method='wilson')
print("Churn rate: " + str(round(rate*100,1)) + "%")
print("95% CI: [" + str(round(ci_low*100,1)) + "%" + ", " + str(round(ci_high*100,1)) + "%" + "]")
# "We're 95% confident the true churn rate is between X% and Y%"

# For a mean:
data = np.random.normal(65, 15, 100)
ci = stats.t.interval(0.95, len(data)-1, loc=np.mean(data), scale=stats.sem(data))
print("Mean: " + str(round(np.mean(data),1)))
print("95% CI: [" + str(round(ci[0],1)) + ", " + str(round(ci[1],1)) + "]")`}</Block>

      <Quiz questions={[
        {q:"p-value = 0.03 with α = 0.05. What do you conclude?",options:["Accept H0","Reject H0 — statistically significant result","The effect is practically significant","You need more data"],answer:"Reject H0 — statistically significant result",explanation:"p < α means you reject the null hypothesis. p=0.03 means there's only a 3% chance of seeing these results if H0 were true — unlikely enough to reject H0."},
        {q:"An A/B test shows a 0.1% improvement with p=0.001. Should you ship the change?",options:["Yes — p < 0.05 so it's significant","Maybe — statistical significance doesn't mean practical significance","No — p is too low","Yes — always ship significant results"],answer:"Maybe — statistical significance doesn't mean practical significance",explanation:"Statistical significance means the effect is real, not due to chance. But 0.1% improvement may not be worth the engineering cost. Always evaluate both statistical AND practical significance."},
        {q:"You run 20 A/B tests simultaneously and report the one with p < 0.05. What's wrong?",options:["Nothing — p < 0.05 is significant","P-hacking — with 20 tests, 1 significant result by chance is expected","You need more tests","The sample size is wrong"],answer:"P-hacking — with 20 tests, 1 significant result by chance is expected",explanation:"With α=0.05, you expect 1 false positive per 20 tests by chance. Running many tests and cherry-picking significant ones inflates false positive rate. Use Bonferroni correction."},
        {q:"What does statistical power mean?",options:["The strength of the p-value","Probability of detecting a real effect when it exists","The size of your dataset","Confidence in your sample"],answer:"Probability of detecting a real effect when it exists",explanation:"Power = 1 - β (probability of a false negative). Power of 0.80 means if there IS a real effect, you have an 80% chance of detecting it. Low power → miss real effects."},
        {q:"Chi-square test is used for:",options:["Comparing two means","Testing independence between two categorical variables","Testing normality","Comparing variances"],answer:"Testing independence between two categorical variables",explanation:"Chi-square test of independence checks whether two categorical variables are related. Example: 'Is there a relationship between contract type and churn status?'"},
      ]}/>
      <CodeExercise
        title="Evaluate an A/B test"
        description="Fill in the blanks to compute conversion rates, uplift %, and decide whether to launch."
        starterCode={`# A/B Test results
control_converts = 120
control_users    = 1000
test_converts    = 150
test_users       = 1000

# 1. Conversion rates
control_rate = ___ / ___
test_rate    = ___ / ___

# 2. Relative uplift %
uplift = ((test_rate - control_rate) / ___) * 100

print("Control: " + str(round(control_rate*100,1)) + "%")
print("Test: " + str(round(test_rate*100,1)) + "%")
print("Uplift: " + str(round(uplift, 1)) + "%")
print("Launch: " + str(uplift > ___))` }
        hint="control_rate = 120/1000. uplift = (test_rate - control_rate) / control_rate * 100. Launch if uplift > 10."
        validate={(output) => output.includes("25.0") && output.includes("True")}
      />
    </div>
  )},
];

// ══ FOUNDATION LESSONS ═══════════════════════════════════════════════════════

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

const ML_LESSONS = [
  {
    id:"ml-workflow", title:"The ML Workflow", subtitle:"The 6-step process every ML project follows",
    emoji:"🔄", color:"#a78bfa", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Machine learning isn't magic — it's a repeatable 6-step process. Every project from predicting customer churn to detecting fraud follows the same structure. Master the process first, then worry about algorithms.</LP>
        <Callout icon="🧠" color="#a78bfa" title="The big picture">A model is only as good as the data and process behind it. 80% of ML work is data preparation, EDA, and evaluation — not picking algorithms.</Callout>

        <LH>The 6-Step ML Workflow</LH>
        <div style={{display:"grid",gap:10,margin:"12px 0"}}>
          {[
            {n:"01",color:"#7eb8f7",title:"Define the Problem",desc:"What are you predicting? Is it regression (number) or classification (category)? What metric defines success?"},
            {n:"02",color:"#6dd6a0",title:"Get & Explore Data",desc:"Load the data, run EDA. Check nulls, distributions, class imbalance, outliers. Know your data before touching it."},
            {n:"03",color:"#f7c96e",title:"Prepare Features",desc:"Split train/test FIRST. Then encode categoricals, scale numerics, impute missing values — all fitted on train only."},
            {n:"04",color:"#f28b82",title:"Train a Baseline Model",desc:"Start simple — logistic regression or decision tree. Establish a baseline before trying complex models."},
            {n:"05",color:"#c792ea",title:"Evaluate Properly",desc:"Use the right metric for your problem. Accuracy for balanced data. F1/AUC for imbalanced. RMSE for regression."},
            {n:"06",color:"#a78bfa",title:"Improve & Iterate",desc:"Feature engineering, hyperparameter tuning, trying different algorithms. Iterate based on what the metrics tell you."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:s.color+"22",border:`1px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:10,color:s.color,fontWeight:700}}>{s.n}</div>
              <div><div style={{color:s.color,fontWeight:700,fontSize:13,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
            </div>
          ))}
        </div>

        <LH>Data Splitting — The Golden Rule</LH>
        <LP>Split your data BEFORE any preprocessing. If you fit a scaler on the full dataset, test data statistics leak into training — this is called data leakage and makes your model look better than it is.</LP>
        <Block label="python — correct splitting order">{`import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df = df.dropna()

# Encode target
df['Churn'] = (df['Churn'] == 'Yes').astype(int)

# Select features
features = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen']
X = df[features]
y = df['Churn']

# STEP 1: Split first
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
# stratify=y keeps class proportions equal in both splits

print("Train: " + str(len(X_train)) + " rows, churn rate: " + str(round(y_train.mean()*100,1)) + "%")
print("Test:  " + str(len(X_test)) + " rows,  churn rate: " + str(round(y_test.mean()*100,1)) + "%")`}</Block>

        <LH>The Scikit-learn Pattern</LH>
        <LP>Every sklearn algorithm uses the same 3 methods. Learn this once and it works for all 50+ algorithms.</LP>
        <Block label="python — universal sklearn pattern">{`from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

# STEP 2: Fit preprocessing on TRAIN only
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # transform only (no fit!)

# STEP 3: Train model
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)

# STEP 4: Predict
preds = model.predict(X_test_scaled)
probs = model.predict_proba(X_test_scaled)[:, 1]

# STEP 5: Evaluate
from sklearn.metrics import accuracy_score, classification_report
print("Accuracy: " + str(round(accuracy_score(y_test, preds),3)))
print(classification_report(y_test, preds))`}</Block>
        <Warn>Never call fit_transform() on test data. Only transform(). Fitting on test data leaks information and gives falsely optimistic scores.</Warn>

        <LH>Choosing the Right Metric</LH>
        <Block label="metric decision guide">{`# Regression (predicting a number):
# → RMSE: penalizes large errors more
# → MAE: treats all errors equally
# → R²: % of variance explained

# Classification (predicting a category):
# → Accuracy: only for balanced classes
# → Precision: "when I predict Yes, how often am I right?"
# → Recall: "of all actual Yes cases, how many did I catch?"
# → F1: harmonic mean of precision and recall
# → AUC-ROC: overall ranking ability (best for imbalanced)

# For churn prediction (imbalanced ~26% churn):
# → Use F1 and AUC, NOT accuracy`}</Block>
        <Tip>Before every project, write down: What is the target? Is it balanced? What metric do I optimize? What would a "good" score look like for this business problem? Answer these BEFORE writing any model code.</Tip>

        <Quiz questions={[
          {q:"You fit a StandardScaler on X (all data) before splitting. What's wrong?",options:["Nothing — scaling is just math","Data leakage — test statistics influence the scaler's parameters","The model won't train","You can't scale before splitting"],answer:"Data leakage — test statistics influence the scaler's parameters",explanation:"Fitting on all data means the scaler uses test set mean/std. The model indirectly 'sees' test data during training. Always: split first, then fit transformers on train only."},
          {q:"stratify=y in train_test_split does what?",options:["Sorts the data","Ensures equal class proportions in train and test sets","Reduces test set size","Speeds up splitting"],answer:"Ensures equal class proportions in train and test sets",explanation:"If 26% churn in full data, stratify ensures both train and test also have ~26% churn. Without it, random splits might have very different churn rates."},
          {q:"You're predicting customer churn (26% positive). Which metric should you NOT rely on?",options:["F1 score","AUC-ROC","Accuracy","Recall"],answer:"Accuracy",explanation:"With 26% churn, predicting 'no churn' always gives 74% accuracy. A model that catches zero churners looks decent by accuracy. Use F1 and AUC instead."},
          {q:"scaler.transform(X_test) vs scaler.fit_transform(X_test) — which is correct?",options:["fit_transform — always use it","transform — use the scaler already fitted on train","Either works the same","Neither — don't scale test data"],answer:"transform — use the scaler already fitted on train",explanation:"You fit the scaler once on train data (learning its mean/std). Then use transform() on both train and test. Calling fit_transform on test would learn new statistics from test data — leakage."},
          {q:"What is the correct order for a new ML project?",options:["Train model → EDA → Split → Evaluate","Split → EDA → Feature Engineering → Train → Evaluate","EDA → Train → Split → Feature Engineering","Feature Engineering → Split → EDA → Train"],answer:"Split → EDA → Feature Engineering → Train → Evaluate",explanation:"Always split first to prevent leakage. EDA on train only. Feature engineering fitted on train. Then train and evaluate on held-out test. Never let test data influence any earlier step."},
        ]}/>
      <CodeExercise
        title="Build a train/test split"
        description="Fill in the blanks to split data into train and test sets, then print both shapes."
        starterCode={`import pandas as pd
from sklearn.model_selection import train_test_split

data = {'tenure':[1,12,24,36,6,48,3,18,30,9],
        'charges':[80,60,50,45,85,40,90,65,48,75],
        'churn':[1,0,0,0,1,0,1,0,0,1]}
df = pd.DataFrame(data)

X = df[['tenure','charges']]
y = df['churn']

# Split: 80% train, 20% test, random_state=42
X_train, X_test, y_train, y_test = train_test_split(
    ___, ___, test_size=___, random_state=___
)

print(X_train.shape)
print(X_test.shape)` }
        hint="train_test_split(X, y, test_size=0.2, random_state=42). X_train.shape gives (rows, cols)."
        validate={(output) => output.includes("(8,") && output.includes("(2,")}
      />
      </div>
    )
  },
  {
    id:"ml-regression", title:"Linear & Logistic Regression", subtitle:"Two models every data scientist must know cold",
    emoji:"📈", color:"#34d399", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>These two algorithms are the foundation of ML. Simple, fast, interpretable — and often competitive with complex models. Master them before moving to trees or neural networks.</LP>
        <Compare items={[
          {color:"#7eb8f7",label:"Linear Regression",text:"Predicts a continuous number. Output: salary, price, temperature. Metric: RMSE, R²"},
          {color:"#34d399",label:"Logistic Regression",text:"Predicts a category probability. Output: 0-1 probability. Metric: F1, AUC, accuracy"},
        ]}/>

        <LH>Linear Regression — predicting numbers</LH>
        <Block label="python — predicting total charges">{`from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import numpy as np

# Predict TotalCharges from tenure and MonthlyCharges
features = ['tenure', 'MonthlyCharges']
X = df[features]
y = df['TotalCharges']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

preds = model.predict(X_test)

# Evaluation metrics
rmse = np.sqrt(mean_squared_error(y_test, preds))
mae  = mean_absolute_error(y_test, preds)
r2   = r2_score(y_test, preds)

print("RMSE: " + str(round(rmse,2)))  # average error in dollars
print("MAE:  " + str(round(mae,2)))   # median error in dollars
print("R²:   " + str(round(r2,3)))    # 0.85 = model explains 85% of variance

# What did the model learn?
for feat, coef in zip(features, model.coef_):
    print("  " + str(feat) + ": " + str(round(coef,3)))
print("  intercept: " + str(round(model.intercept_,3)))`}</Block>
        <Callout icon="💡" color="#34d399" title="Reading coefficients">Each coefficient says: 'for 1 unit increase in this feature, the prediction changes by this amount, holding all else constant.' tenure coef = 60 means: each extra month of tenure adds $60 to predicted total charges.</Callout>

        <LH>Logistic Regression — predicting churn</LH>
        <Block label="python — churn classification">{`from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

# Prepare data
df_clean = df.copy()
df_clean['Churn'] = (df_clean['Churn'] == 'Yes').astype(int)

features = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen']
X = df_clean[features]
y = df_clean['Churn']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale — logistic regression needs it
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# Train
model = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
model.fit(X_train_s, y_train)

# Predict
preds = model.predict(X_test_s)
probs = model.predict_proba(X_test_s)[:, 1]  # churn probability

# Evaluate
print(classification_report(y_test, preds, target_names=['Stay', 'Churn']))
print("AUC-ROC: " + str(round(roc_auc_score(y_test, probs),3)))

# Feature importance (coefficients)
for feat, coef in zip(features, model.coef_[0]):
    direction = "↑ churn" if coef > 0 else "↓ churn"
    print("  " + str(feat) + ": " + str(round(coef,3)) + " (" + str(direction) + ")")`}</Block>
        <Warn>class_weight='balanced' is critical for imbalanced data like churn. It tells sklearn to penalize mistakes on the minority class (churners) more heavily. Without it, the model learns to mostly predict 'no churn'.</Warn>

        <LH>Reading the Classification Report</LH>
        <Block label="understanding the output">{`              precision  recall  f1-score  support
       Stay       0.88      0.76      0.82     1056
      Churn       0.54      0.73      0.62      353

# Precision (Stay=0.88): When model says "Stay", it's right 88% of the time
# Recall (Stay=0.76):    Of all actual Stay customers, model caught 76%
# Precision (Churn=0.54): When model says "Churn", it's right 54% of the time
# Recall (Churn=0.73):    Of all actual churners, model caught 73%

# For churn: HIGH RECALL is more valuable than high precision
# Missing a churner (false negative) costs more than a false alarm
# Set threshold lower to catch more churners:
threshold = 0.35  # default is 0.5
preds_low = (probs >= threshold).astype(int)`}</Block>
        <Tip>In business problems, always ask: what's worse — a false positive or a false negative? For churn, missing a churner (false negative) is expensive. For fraud, missing fraud is catastrophic. This determines whether to optimize precision or recall.</Tip>

        <Quiz questions={[
          {q:"R² = 0.73 means:",options:["73% of predictions are correct","The model explains 73% of the variance in the target","RMSE is 0.73","73% accuracy"],answer:"The model explains 73% of the variance in the target",explanation:"R² measures how much of the target's variation the model captures. R²=0.73 means 27% of the variance is unexplained — due to missing features or noise."},
          {q:"class_weight='balanced' in LogisticRegression does what?",options:["Balances the dataset by oversampling","Gives higher penalty for misclassifying the minority class","Splits data equally","Makes training faster"],answer:"Gives higher penalty for misclassifying the minority class",explanation:"For imbalanced data, the model naturally learns to predict the majority class. class_weight='balanced' compensates by penalizing minority class errors more."},
          {q:"probs = model.predict_proba(X_test)[:, 1] — what is probs[0] = 0.72?",options:["72% accuracy","The model is 72% confident this customer will churn","72 customers will churn","The model is wrong 28% of the time"],answer:"The model is 72% confident this customer will churn",explanation:"predict_proba returns [P(class 0), P(class 1)]. [:, 1] selects column 1 (churn probability). 0.72 means the model assigns 72% probability to this customer churning."},
          {q:"For churn prediction, which is more costly: false positive (predict churn but customer stays) or false negative (miss a churner)?",options:["False positive — wasted retention offer","False negative — lost customer revenue","Both are equally costly","Depends on the algorithm"],answer:"False negative — lost customer revenue",explanation:"Missing a churner means losing that customer with no intervention. A false positive just means offering a discount to a loyal customer — wasteful but not catastrophic. Optimize for recall."},
          {q:"What does AUC-ROC = 0.5 mean?",options:["50% accuracy","The model is no better than random guessing","Half the classes are correct","Very good model"],answer:"The model is no better than random guessing",explanation:"AUC-ROC measures ranking ability. 0.5 = random, 1.0 = perfect. A model with AUC=0.5 can't distinguish churners from non-churners at all."},
        ]}/>
      <CodeExercise
        title="Train a logistic regression model"
        description="Fill in the blanks to train a LogisticRegression, make predictions, and print accuracy."
        starterCode={`import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

data = {'tenure':[1,24,6,36,3,48,12,30,5,18],
        'charges':[90,45,80,42,88,40,65,48,85,62],
        'churn':[1,0,1,0,1,0,0,0,1,0]}
df = pd.DataFrame(data)
X = df[['tenure','charges']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.3,random_state=42)

# Train model
model = ___(random_state=42)
model.___(X_train, y_train)

# Predict and score
preds = model.___(X_test)
print(accuracy_score(y_test, preds))` }
        hint="LogisticRegression(). model.fit(X_train, y_train). model.predict(X_test)."
        validate={(output) => !isNaN(parseFloat(output.trim()))}
      />
      </div>
    )
  },
  {
    id:"ml-trees", title:"Decision Trees & Random Forests", subtitle:"The workhorse algorithm of real-world data science",
    emoji:"🌳", color:"#f59e0b", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Random Forest is the most commonly used algorithm in industry data science. It works well on tabular data with minimal tuning, handles mixed feature types, and is robust to outliers.</LP>

        <LH>Decision Trees — the building block</LH>
        <LP>A decision tree splits data by asking yes/no questions. At each node it finds the feature and threshold that best separates the classes.</LP>
        <Block label="python — decision tree on churn">{`from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, roc_auc_score
import pandas as pd

# Prepare Telco churn data
df_ml = df.copy()
df_ml['Churn'] = (df_ml['Churn'] == 'Yes').astype(int)

# Encode categorical features
cat_cols = ['Contract', 'InternetService', 'PaymentMethod']
df_encoded = pd.get_dummies(df_ml, columns=cat_cols)

features = [c for c in df_encoded.columns if c not in ['customerID','Churn','TotalCharges']]
X = df_encoded[features].fillna(0)
y = df_encoded['Churn']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Train decision tree
tree = DecisionTreeClassifier(max_depth=5, class_weight='balanced', random_state=42)
tree.fit(X_train, y_train)

print("Train accuracy: " + str(round(tree.score(X_train, y_train),3)))
print("Test accuracy:  " + str(round(tree.score(X_test, y_test),3)))
print("AUC-ROC: " + str(round(roc_auc_score(y_test, tree.predict_proba(X_test)[,3)))`}</Block>
        <Warn>Single decision trees overfit badly. Without max_depth, a tree reaches 100% train accuracy but 60% test accuracy — it memorized the training data. Random Forest fixes this.</Warn>

        <LH>Random Forest — fixing overfitting</LH>
        <LP>Random Forest builds hundreds of trees, each trained on a random sample of data and random subset of features. Then averages their predictions. The randomness prevents overfitting.</LP>
        <Block label="python — random forest">{`from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=200,       # number of trees
    max_depth=None,         # grow full trees — forest handles overfitting
    min_samples_leaf=5,     # minimum samples per leaf
    class_weight='balanced',
    random_state=42,
    n_jobs=-1               # use all CPU cores
)
rf.fit(X_train, y_train)

preds = rf.predict(X_test)
probs = rf.predict_proba(X_test)[:,1]

print("Train AUC: " + str(round(roc_auc_score(y_train, rf.predict_proba(X_train)[,3)))
print("Test AUC:  " + str(round(roc_auc_score(y_test, probs),3)))
print(classification_report(y_test, preds, target_names=['Stay','Churn']))`}</Block>

        <LH>Feature Importance — what drives churn?</LH>
        <Block label="python — feature importance">{`import matplotlib.pyplot as plt

importances = pd.Series(rf.feature_importances_, index=X_train.columns)
top_features = importances.sort_values(ascending=False).head(10)

plt.figure(figsize=(10, 6))
top_features.plot(kind='barh', color='#f59e0b')
plt.title('Top 10 Features for Churn Prediction')
plt.xlabel('Feature Importance')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()

# Typically the top features are:
# tenure, MonthlyCharges, Contract_Month-to-month, TotalCharges`}</Block>
        <Callout icon="💡" color="#f59e0b" title="Feature importance in business">Feature importance tells you what DRIVES the outcome. If MonthlyCharges is the top feature, that's actionable — offer discounts to high-paying customers at risk. This turns ML into a business tool.</Callout>

        <LH>Decision Tree vs Random Forest</LH>
        <Compare items={[
          {color:"#7eb8f7",label:"Decision Tree",text:"Fast, interpretable, can visualize. But overfits easily. Good for explainability."},
          {color:"#f59e0b",label:"Random Forest",text:"Slower, harder to interpret. But much more accurate. Good for production models."},
        ]}/>

        <Quiz questions={[
          {q:"A decision tree scores 100% on train, 62% on test. What happened?",options:["Good model — high train accuracy is ideal","Overfitting — tree memorized training data","Underfitting","The test set is corrupted"],answer:"Overfitting — tree memorized training data",explanation:"Overfitting: model learns training data too specifically, including noise. Huge train/test gap is the signature. Fix: limit max_depth, use min_samples_leaf, or switch to Random Forest."},
          {q:"Why does Random Forest reduce overfitting compared to a single tree?",options:["It uses more data","Each tree sees random subsets of data and features — averaging reduces variance","It limits tree depth automatically","It uses gradient descent"],answer:"Each tree sees random subsets of data and features — averaging reduces variance",explanation:"Each tree overfits differently (random data and features). When you average 200 overfit trees that overfit in different directions, the errors cancel out and you get a well-generalized model."},
          {q:"n_jobs=-1 in RandomForestClassifier means:",options:["Use 1 CPU core","Run 1 job at a time","Use all available CPU cores in parallel","Limit to -1 trees"],answer:"Use all available CPU cores in parallel",explanation:"n_jobs=-1 tells scikit-learn to use all CPU cores. Since each tree is independent, training 200 trees can be parallelized massively. This speeds up training significantly."},
          {q:"Feature importance = 0.35 for 'tenure'. What does this mean?",options:["35% of customers have this tenure","Tenure explains 35% of the target variance","The feature was used in 35% of splits — it contributes 35% to predictions","35% accuracy improvement"],answer:"The feature was used in 35% of splits — it contributes 35% to predictions",explanation:"Feature importance in Random Forest measures how much each feature reduces impurity across all splits in all trees. Higher = more useful for predictions."},
          {q:"pd.get_dummies(df, columns=['Contract']) creates:",options:["One column with numeric codes","One binary column per unique contract value","Removes the Contract column","A new DataFrame with only contract columns"],answer:"One binary column per unique contract value",explanation:"get_dummies (one-hot encoding) creates a binary column for each unique value. Contract has 3 values → 3 new columns: Contract_Month-to-month, Contract_One year, Contract_Two year."},
        ]}/>
      <CodeExercise
        title="Train a Random Forest and get feature importances"
        description="Fill in the blanks to train a RandomForestClassifier and print feature importances sorted descending."
        starterCode={`import pandas as pd
from sklearn.ensemble import RandomForestClassifier

data = {'tenure':[1,24,6,36,3,48,12,30,5,18],
        'charges':[90,45,80,42,88,40,65,48,85,62],
        'calls':[5,1,4,0,6,1,2,1,5,2],
        'churn':[1,0,1,0,1,0,0,0,1,0]}
df = pd.DataFrame(data)
X = df[['tenure','charges','calls']]
y = df['churn']

# Train a Random Forest with 50 trees
model = ___(n_estimators=___, random_state=42)
model.___(X, y)

# Print feature importances sorted descending
imp = pd.Series(model.___, index=X.columns).sort_values(ascending=False)
print(imp.round(3))` }
        hint="RandomForestClassifier(n_estimators=50). model.fit(X,y). model.feature_importances_."
        validate={(output) => output.includes("tenure") || output.includes("charges")}
      />
      </div>
    )
  },
  {
    id:"ml-evaluation", title:"Model Evaluation", subtitle:"How to know if your model is actually good",
    emoji:"📊", color:"#06b6d4", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Getting a model to run is easy. Knowing whether it's actually good — that's the skill that separates junior from senior data scientists. Wrong evaluation leads to models that fail in production.</LP>

        <LH>1. The Confusion Matrix</LH>
        <Block label="python — confusion matrix">{`from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

cm = confusion_matrix(y_test, preds)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Stay','Churn'])
disp.plot(cmap='Blues')
plt.title('Confusion Matrix')
plt.show()

# Reading the matrix:
#                 Predicted Stay  Predicted Churn
# Actual Stay:    TN (correct)    FP (false alarm)
# Actual Churn:   FN (missed!)    TP (caught!)

tn, fp, fn, tp = cm.ravel()
print("True Negatives:  " + str(tn) + "  (correctly predicted stay)")
print("False Positives: " + str(fp) + "  (predicted churn, actually stayed)")
print("False Negatives: " + str(fn) + "  (predicted stay, actually churned!)")
print("True Positives:  " + str(tp) + "  (correctly predicted churn)")`}</Block>

        <LH>2. Precision, Recall, F1</LH>
        <Block label="python — metrics from scratch">{`# Precision: Of all predicted churners, how many actually churned?
precision = tp / (tp + fp)
print("Precision: " + str(round(precision,3)))
# High precision = fewer false alarms

# Recall (Sensitivity): Of all actual churners, how many did we catch?
recall = tp / (tp + fn)
print("Recall: " + str(round(recall,3)))
# High recall = fewer missed churners

# F1: Harmonic mean — balances precision and recall
f1 = 2 * (precision * recall) / (precision + recall)
print("F1: " + str(round(f1,3)))

# sklearn version
from sklearn.metrics import precision_score, recall_score, f1_score
print("F1 (sklearn): " + str(round(f1_score(y_test, preds),3)))`}</Block>
        <Callout icon="🧠" color="#06b6d4" title="Precision vs Recall trade-off">Lowering the classification threshold (e.g., 0.3 instead of 0.5) catches more churners (higher recall) but also more false alarms (lower precision). For churn: prioritize recall. For spam: prioritize precision.</Callout>

        <LH>3. AUC-ROC — the gold standard for classification</LH>
        <Block label="python — ROC curve">{`from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

fpr, tpr, thresholds = roc_curve(y_test, probs)
auc = roc_auc_score(y_test, probs)

plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='#06b6d4', linewidth=2, label=f'AUC = {auc:.3f}')
plt.plot([0,1],[0,1],'--',color='gray',label='Random (AUC=0.5)')
plt.fill_between(fpr, tpr, alpha=0.1, color='#06b6d4')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate (Recall)')
plt.title('ROC Curve — Churn Model')
plt.legend()
plt.show()

# AUC interpretation:
# 0.5 = random guessing
# 0.7-0.8 = decent
# 0.8-0.9 = good
# > 0.9 = excellent (or suspicious — check for leakage)`}</Block>

        <LH>4. Cross-Validation — more reliable evaluation</LH>
        <LP>A single train/test split gives one score. Cross-validation gives you 5 scores and tells you how stable your model is.</LP>
        <Block label="python — 5-fold cross-validation">{`from sklearn.model_selection import cross_val_score, StratifiedKFold
import numpy as np

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(rf, X, y, cv=cv, scoring='roc_auc', n_jobs=-1)

print("CV AUC scores: " + str(scores.round(3)))
print("Mean AUC: " + str(round(scores.mean(),3)) + " ± " + str(round(scores.std(),3)))
# Large std → model is unstable (overfitting or bad features)
# Small std → model is consistent`}</Block>

        <LH>5. Regression Metrics</LH>
        <Block label="python — regression evaluation">{`from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# For predicting TotalCharges
rmse = np.sqrt(mean_squared_error(y_test, preds))
mae  = mean_absolute_error(y_test, preds)
r2   = r2_score(y_test, preds)

print("RMSE: " + str(round(rmse,2)))  # in same units as target
print("MAE:  " + str(round(mae,2)))   # more interpretable
print("R²:   " + str(round(r2,3)))    # % variance explained

# RMSE vs MAE:
# RMSE penalizes large errors more (squared)
# MAE treats all errors equally
# Use RMSE when big errors are especially bad
# Use MAE for a simple "average error" interpretation`}</Block>
        <Tip>Always report multiple metrics. A model with great AUC but terrible recall on the minority class is useless for churn. A model with low RMSE but terrible R² might just be predicting the mean. Know what each metric tells you.</Tip>

        <Quiz questions={[
          {q:"Your model has recall=0.90 but precision=0.30 for churn. What does this mean?",options:["Good model — recall is high","It catches 90% of churners but 70% of its churn predictions are wrong","It misses 90% of churners","Precision and recall should be equal"],answer:"It catches 90% of churners but 70% of its churn predictions are wrong",explanation:"Recall=0.90 means 90% of actual churners are caught. Precision=0.30 means only 30% of predicted churners actually churn — many false alarms. For a retention campaign, high recall with moderate false alarms may still be acceptable."},
          {q:"AUC-ROC = 0.97 on your test set. What should you suspect?",options:["Great model — ship it","Data leakage — check preprocessing","Need more data","Model is underfitting"],answer:"Data leakage — check preprocessing",explanation:"AUC > 0.95 on real-world tabular data is suspicious. Check: did you fit transformers on all data before splitting? Is there a feature that encodes the target? Leakage makes models look superhuman."},
          {q:"5-fold CV gives AUC scores: [0.82, 0.83, 0.81, 0.84, 0.82]. What is the reliable estimate?",options:["0.82 (first fold)","0.84 (best fold)","0.824 ± 0.010 (mean ± std)","Max minus min"],answer:"0.824 ± 0.010 (mean ± std)",explanation:"Cross-validation gives a distribution of scores. Report mean ± std. Low std means the model is consistent. Always report CV results, not a single train/test split."},
          {q:"False Negative in churn prediction means:",options:["Model predicted churn, customer stayed","Model predicted stay, customer churned","Both predictions were wrong","Model predicted correctly"],answer:"Model predicted stay, customer churned",explanation:"False Negative = model predicted the NEGATIVE class (stay) but the TRUE label was POSITIVE (churn). The model missed a churner — the most costly error in churn prediction."},
          {q:"When should you use MAE instead of RMSE?",options:["Never — RMSE is always better","When large errors are especially bad","When you want a simple average-error interpretation robust to outliers","When R² is low"],answer:"When you want a simple average-error interpretation robust to outliers",explanation:"MAE = average absolute error. RMSE = root mean squared error (penalizes big errors more). Use MAE when outlier predictions shouldn't dominate your metric. Use RMSE when large prediction errors are especially costly."},
        ]}/>
      <CodeExercise
        title="Compute classification metrics"
        description="Fill in the blanks to compute precision, recall, F1, and print a confusion matrix."
        starterCode={`from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

# Actual vs predicted churn labels
y_true = [1,0,1,1,0,0,1,0,1,0]
y_pred = [1,0,0,1,0,1,1,0,1,0]

# Compute metrics
p = ___(y_true, y_pred)
r = ___(y_true, y_pred)
f = ___(y_true, y_pred)

print('Precision: ' + str(round(p,2)))
print('Recall:    ' + str(round(r,2)))
print('F1:        ' + str(round(f,2)))
print(___(y_true, y_pred))` }
        hint="precision_score, recall_score, f1_score. confusion_matrix(y_true, y_pred)."
        validate={(output) => output.includes("Precision") && output.includes("Recall") && output.includes("F1")}
      />
      </div>
    )
  },
  {
    id:"ml-overfitting", title:"Overfitting & Regularization", subtitle:"Why models fail in production and how to fix it",
    emoji:"🎯", color:"#f472b6", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Overfitting is the #1 reason ML models fail in production. Understanding it deeply — and knowing how to fix it — is what makes you a reliable data scientist.</LP>

        <LH>1. Understanding Overfitting</LH>
        <Block label="python — diagnosing overfitting">{`from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score

models = {
    'Deep Tree (overfit)': DecisionTreeClassifier(max_depth=None, random_state=42),
    'Shallow Tree': DecisionTreeClassifier(max_depth=4, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    train_auc = roc_auc_score(y_train, model.predict_proba(X_train)[:,1])
    test_auc  = roc_auc_score(y_test,  model.predict_proba(X_test)[:,1])
    gap = train_auc - test_auc
    print(str(name) + ":")
    print("  Train AUC: " + str(round(train_auc,3)) + " | Test AUC: " + str(round(test_auc,3)) + " | Gap: " + str(round(gap,3)))
    print("  " + str('⚠ OVERFITTING' if gap > 0.05 else '✓ OK'))`}</Block>
        <Compare items={[
          {color:"#f28b82",label:"Overfitting",text:"Train score high, test score much lower. Model memorized training data including noise."},
          {color:"#f7c96e",label:"Underfitting",text:"Both train and test scores are low. Model is too simple to capture the pattern."},
          {color:"#6dd6a0",label:"Good fit",text:"Train and test scores are close and both reasonable. Model generalizes well."},
        ]}/>

        <LH>2. Learning Curves — diagnose visually</LH>
        <Block label="python — learning curves">{`from sklearn.model_selection import learning_curve
import matplotlib.pyplot as plt
import numpy as np

train_sizes, train_scores, test_scores = learning_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=5, scoring='roc_auc',
    train_sizes=np.linspace(0.1, 1.0, 10),
    n_jobs=-1
)

plt.figure(figsize=(10, 6))
plt.plot(train_sizes, train_scores.mean(axis=1), 'o-', color='#f472b6', label='Train AUC')
plt.plot(train_sizes, test_scores.mean(axis=1), 'o-', color='#6dd6a0', label='CV AUC')
plt.fill_between(train_sizes, train_scores.mean(1)-train_scores.std(1), train_scores.mean(1)+train_scores.std(1), alpha=0.1, color='#f472b6')
plt.fill_between(train_sizes, test_scores.mean(1)-test_scores.std(1), test_scores.mean(1)+test_scores.std(1), alpha=0.1, color='#6dd6a0')
plt.xlabel('Training Size')
plt.ylabel('AUC-ROC')
plt.title('Learning Curves')
plt.legend()
plt.show()
# Large gap → overfitting. Both low → underfitting. Converging → good.`}</Block>

        <LH>3. Regularization for Linear Models</LH>
        <Block label="python — Ridge and Lasso">{`from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.preprocessing import StandardScaler

# Always scale before regularization
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Ridge (L2): shrinks all coefficients toward zero
ridge = Ridge(alpha=1.0)  # alpha controls regularization strength
ridge.fit(X_train_s, y_train)

# Lasso (L1): shrinks some coefficients to exactly zero (feature selection!)
lasso = Lasso(alpha=0.01)
lasso.fit(X_train_s, y_train)

# ElasticNet: combines L1 and L2
elastic = ElasticNet(alpha=0.01, l1_ratio=0.5)
elastic.fit(X_train_s, y_train)

# Check which features Lasso eliminated
zero_features = sum(1 for c in lasso.coef_ if c == 0)
print("Lasso eliminated " + str(zero_features) + "/" + str(len(lasso.coef_)) + " features")

# Find best alpha with cross-validation
from sklearn.linear_model import RidgeCV
ridge_cv = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0], cv=5)
ridge_cv.fit(X_train_s, y_train)
print("Best alpha: " + str(ridge_cv.alpha_))`}</Block>

        <LH>4. Cross-Validation — the proper way to evaluate</LH>
        <Block label="python — nested cross-validation">{`from sklearn.model_selection import cross_validate

# Evaluate multiple metrics at once
results = cross_validate(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=5,
    scoring=['roc_auc', 'f1', 'precision', 'recall'],
    n_jobs=-1
)

for metric, scores in results.items():
    if metric.startswith('test_'):
        print(str(metric[5) + ": " + str(round(scores.mean(),3)) + " ± " + str(round(scores.std(),3)))`}</Block>
        <Warn>Never use the test set to tune hyperparameters. If you try 50 different settings and pick the best one on the test set, you've effectively trained on the test set. Use cross-validation on the train set for tuning, then evaluate once on test.</Warn>

        <Quiz questions={[
          {q:"Train AUC = 0.98, Test AUC = 0.71. What is this?",options:["Good model","Underfitting","Overfitting — large train/test gap","Data leakage"],answer:"Overfitting — large train/test gap",explanation:"A large gap between train and test performance is the signature of overfitting. The model memorized training data but fails to generalize. Fix: reduce model complexity, add regularization, get more data."},
          {q:"Lasso (L1) regularization sets some coefficients to exactly zero. Why is this useful?",options:["Makes the model faster","Performs automatic feature selection","Improves accuracy","Prevents underfitting"],answer:"Performs automatic feature selection",explanation:"Lasso's L1 penalty forces some coefficients to exactly zero, effectively removing those features from the model. This is automatic feature selection — useful when you have many features and want a sparse model."},
          {q:"Learning curves show both train and test scores are low and flat. This indicates:",options:["Overfitting","Good generalization","Underfitting — model needs more complexity","Need more training data"],answer:"Underfitting — model needs more complexity",explanation:"When both scores are low, the model is too simple. Try: more features, higher max_depth, more complex algorithm. Overfitting shows high train, low test. Good fit shows both converging at a high score."},
          {q:"You tune hyperparameters by evaluating on the test set 50 times. What went wrong?",options:["Nothing — test set is for evaluation","Test set contamination — you effectively trained on it","50 iterations is too many","Should use train set instead"],answer:"Test set contamination — you effectively trained on it",explanation:"If you repeatedly evaluate on the test set and pick the best result, the test set becomes part of your training process. Your final score is optimistically biased. Use cross-validation on train set for tuning, evaluate on test set ONCE at the end."},
          {q:"What does alpha control in Ridge regularization?",options:["Learning rate","Number of features","Strength of regularization penalty","Train/test split ratio"],answer:"Strength of regularization penalty",explanation:"Higher alpha = stronger regularization = smaller coefficients. alpha=0 is no regularization (ordinary regression). Large alpha shrinks all coefficients strongly toward zero, reducing variance but increasing bias."},
        ]}/>
      <CodeExercise
        title="Detect overfitting with train vs test scores"
        description="Fill in the blanks to train a model and compare train vs test accuracy to detect overfitting."
        starterCode={`from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.3,random_state=42)

# Overfit model — no depth limit
model = DecisionTreeClassifier(max_depth=___)
model.fit(X_train, y_train)

train_acc = accuracy_score(y_train, model.___(X_train))
test_acc  = accuracy_score(y_test,  model.___(X_test))
print('Train: ' + str(round(train_acc,2)))
print('Test:  ' + str(round(test_acc,2)))
print('Overfit: ' + str(train_acc - test_acc > 0.15))` }
        hint="max_depth=None for no limit. model.predict(X_train) and model.predict(X_test)."
        validate={(output) => output.includes("Train:") && output.includes("Test:")}
      />
      </div>
    )
  },
  {
    id:"ml-sklearn", title:"Scikit-learn in Practice", subtitle:"Building a production-ready ML pipeline",
    emoji:"⚙️", color:"#8b5cf6", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>This lesson ties everything together. We'll build a complete, production-ready churn prediction pipeline on the Telco dataset — the kind of code you'd write in a real job.</LP>

        <LH>1. Full Data Preparation</LH>
        <Block label="python — complete preprocessing">{`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

df = pd.read_csv('telco_churn.csv')

# Clean
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['Churn'] = (df['Churn'] == 'Yes').astype(int)
df = df.drop('customerID', axis=1)

# Feature engineering
df['ChargesPerMonth'] = df['TotalCharges'] / (df['tenure'] + 1)
df['IsNewCustomer'] = (df['tenure'] <= 6).astype(int)

# Encode binary columns
binary_cols = ['gender','Partner','Dependents','PhoneService',
               'PaperlessBilling','SeniorCitizen']
for col in binary_cols:
    if df[col].dtype == object:
        df[col] = (df[col] == 'Yes').astype(int)

# One-hot encode multi-category columns
multi_cols = ['MultipleLines','InternetService','OnlineSecurity',
              'OnlineBackup','DeviceProtection','TechSupport',
              'StreamingTV','StreamingMovies','Contract','PaymentMethod']
df = pd.get_dummies(df, columns=multi_cols, drop_first=True)

X = df.drop('Churn', axis=1)
y = df['Churn']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Features: " + str(X.shape[1]) + ", Train: " + str(len(X_train)) + ", Test: " + str(len(X_test)))`}</Block>

        <LH>2. The sklearn Pipeline — proper way</LH>
        <Block label="python — Pipeline class">{`from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Pipeline ensures no leakage — all steps fitted on train only
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),  # fill NaN
    ('scaler', StandardScaler()),                    # scale features
    ('model', RandomForestClassifier(
        n_estimators=200,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    ))
])

# Train — pipeline handles all preprocessing automatically
pipeline.fit(X_train, y_train)

# Predict — same preprocessing applied automatically
preds = pipeline.predict(X_test)
probs = pipeline.predict_proba(X_test)[:,1]

from sklearn.metrics import roc_auc_score, classification_report
print("AUC-ROC: " + str(round(roc_auc_score(y_test, probs),3)))
print(classification_report(y_test, preds, target_names=['Stay','Churn']))`}</Block>
        <Callout icon="💡" color="#8b5cf6" title="Why Pipeline?">Without Pipeline, you must manually call fit_transform on train and transform on test for every step. With Pipeline, pipeline.fit(X_train) does everything correctly. pipeline.predict(X_new) always applies the right transformations.</Callout>

        <LH>3. GridSearchCV — hyperparameter tuning</LH>
        <Block label="python — tuning the pipeline">{`from sklearn.model_selection import GridSearchCV

param_grid = {
    'model__n_estimators': [100, 200],
    'model__max_depth': [None, 10, 20],
    'model__min_samples_leaf': [1, 5],
}
# Note: 'model__' prefix because 'model' is the pipeline step name

search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,
    verbose=1
)

search.fit(X_train, y_train)

print("Best params: " + str(search.best_params_))
print("Best CV AUC: " + str(round(search.best_score_,3)))
print("Test AUC:    " + str(round(roc_auc_score(y_test, search.predict_proba(X_test)[,3)))`}</Block>

        <LH>4. Saving and Loading a Model</LH>
        <Block label="python — production deployment">{`import joblib

# Save the entire pipeline (preprocessing + model)
joblib.dump(search.best_estimator_, 'churn_model.pkl')

# Load later (in API, scheduled job, etc.)
loaded_pipeline = joblib.load('churn_model.pkl')

# Predict on new data — no need to manually preprocess
new_customer = pd.DataFrame({
    'tenure': [3],
    'MonthlyCharges': [85.5],
    # ... all other features
})

churn_prob = loaded_pipeline.predict_proba(new_customer)[0, 1]
print("Churn probability: " + str(round(churn_prob*100,1)) + "%")
print("Action: " + str('Intervene' if churn_prob > 0.5 else 'Monitor'))`}</Block>

        <LH>5. Comparing Multiple Models</LH>
        <Block label="python — model comparison">{`from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score
import pandas as pd

models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
    'Decision Tree':       DecisionTreeClassifier(max_depth=5, class_weight='balanced'),
    'Random Forest':       RandomForestClassifier(n_estimators=200, class_weight='balanced', n_jobs=-1),
    'Gradient Boosting':   GradientBoostingClassifier(n_estimators=200, learning_rate=0.1),
}

results = []
for name, model in models.items():
    pipe = Pipeline([('imp', SimpleImputer()), ('scl', StandardScaler()), ('mdl', model)])
    pipe.fit(X_train, y_train)
    auc = roc_auc_score(y_test, pipe.predict_proba(X_test)[:,1])
    results.append({'Model': name, 'AUC': round(auc, 3)})

pd.DataFrame(results).sort_values('AUC', ascending=False)`}</Block>
        <Tip>Always start with Logistic Regression as your baseline. If a complex model doesn't beat it significantly, the simpler model is often better in production — it's faster, more interpretable, and easier to maintain.</Tip>

        <Quiz questions={[
          {q:"What is the main advantage of using sklearn Pipeline?",options:["It's faster than manual preprocessing","It prevents data leakage by ensuring fit happens only on train data","It automatically selects features","It tunes hyperparameters automatically"],answer:"It prevents data leakage by ensuring fit happens only on train data",explanation:"Pipeline guarantees that all preprocessing steps (imputation, scaling) are only fitted on training data. When you call pipeline.predict(X_new), it applies the same transformations learned from training."},
          {q:"In GridSearchCV, scoring='roc_auc' means:",options:["Split data by AUC","Optimize for AUC-ROC across all CV folds","Use AUC as loss function","Report only AUC"],answer:"Optimize for AUC-ROC across all CV folds",explanation:"scoring defines what metric to maximize during the search. 'roc_auc' means GridSearchCV picks the hyperparameters that give the highest mean AUC across all cross-validation folds."},
          {q:"joblib.dump(pipeline, 'model.pkl') saves:",options:["Only the model weights","Only the preprocessing parameters","The entire pipeline including fitted scaler and model","The training data"],answer:"The entire pipeline including fitted scaler and model",explanation:"joblib saves the entire Python object — including the fitted StandardScaler (with its learned mean/std) and the trained model. Loading it later gives you the complete pipeline ready to predict."},
          {q:"param_grid = {'model__n_estimators': [100,200]} — why the 'model__' prefix?",options:["It's required by sklearn","'model' is the step name in the Pipeline — __ navigates into that step's parameters","It sets a model-level parameter","It prevents parameter conflicts"],answer:"'model' is the step name in the Pipeline — __ navigates into that step's parameters",explanation:"In GridSearchCV with a Pipeline, use stepname__param_name to access nested parameters. If you named the step 'clf' instead of 'model', you'd use 'clf__n_estimators'."},
          {q:"Logistic Regression AUC = 0.82. Random Forest AUC = 0.84. Which should you deploy?",options:["Always Random Forest — higher AUC","Always Logistic Regression — simpler","Depends: if 0.02 improvement justifies complexity, Random Forest; otherwise Logistic","Random Forest only if n > 10000"],answer:"Depends: if 0.02 improvement justifies complexity, Random Forest; otherwise Logistic",explanation:"A 0.02 AUC improvement may not justify the extra complexity. Logistic Regression is faster, more interpretable, easier to explain to stakeholders, and easier to maintain. Always evaluate: is the performance gain worth the cost?"},
        ]}/>
      <CodeExercise
        title="Build a full sklearn pipeline"
        description="Fill in the blanks to build a Pipeline with a scaler and logistic regression, then print the test accuracy."
        starterCode={`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.3,random_state=42)

# Build pipeline: scaler + logistic regression
pipe = Pipeline([
    ('scaler', ___()),
    ('model',  ___(random_state=42))
])

pipe.fit(___, ___)
preds = pipe.predict(___)
print(round(accuracy_score(y_test, preds), 2))` }
        hint="StandardScaler(). LogisticRegression(). pipe.fit(X_train, y_train). pipe.predict(X_test)."
        validate={(output) => !isNaN(parseFloat(output.trim()))}
      />
      </div>
    )
  },
];

const ADVANCED_ML_LESSONS = [
  {
    id:"adv-xgboost", title:"XGBoost & Gradient Boosting", subtitle:"The algorithm that wins Kaggle competitions",
    emoji:"⚡", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>XGBoost is one of the most powerful ML algorithms ever built. It won hundreds of Kaggle competitions and is used at every major tech company. Let us understand why.</LP>

      <LH>1. What is Gradient Boosting?</LH>
      <LP>Gradient Boosting builds trees <strong style={{color:T.text}}>sequentially</strong> — each new tree corrects the mistakes of the previous one. XGBoost is a fast, optimized version of this idea.</LP>
      <Callout icon="🧠" color="#f7c96e" title="Core idea">Random Forest builds trees in parallel and averages them. XGBoost builds trees one by one, each fixing what the last got wrong. That is why it is more accurate — but also slower to train.</Callout>

      <LH>2. XGBoost in Code</LH>
      <Block label="python">{`from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import pandas as pd

df = pd.read_csv('telco_churn.csv')
X = df[['tenure','MonthlyCharges','TotalCharges']].fillna(0)
y = (df['Churn'] == 'Yes').astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    random_state=42
)

model.fit(X_train, y_train)
probs = model.predict_proba(X_test)[:,1]
print("AUC-ROC: " + str(round(roc_auc_score(y_test, probs), 3)))`}</Block>

      <LH>3. Key Hyperparameters</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li><code style={{color:"#f7c96e"}}>n_estimators</code> — number of trees. More = better but slower. Start with 100.</li>
        <li><code style={{color:"#f7c96e"}}>learning_rate</code> — how much each tree contributes. Lower = more robust. Try 0.05-0.1.</li>
        <li><code style={{color:"#f7c96e"}}>max_depth</code> — depth of each tree. Lower = less overfitting. Try 3-5.</li>
        <li><code style={{color:"#f7c96e"}}>subsample</code> — fraction of rows used per tree. 0.8 helps prevent overfitting.</li>
      </ul>

      <LH>4. XGBoost vs Random Forest</LH>
      <Compare items={[
        {color:"#6dd6a0",label:"Random Forest",text:"Trees in parallel. Easy to tune. Great baseline. Less prone to overfitting."},
        {color:"#f7c96e",label:"XGBoost",text:"Trees in sequence. Higher accuracy. More hyperparameters. Can overfit if not tuned."},
      ]}/>
      <Tip>Always start with Random Forest as your baseline. Switch to XGBoost when you need to squeeze out more performance.</Tip>

      <LH>5. Feature Importance</LH>
      <Block label="python">{`import pandas as pd

# After fitting the model
imp = pd.Series(model.feature_importances_, index=X.columns)
print(imp.sort_values(ascending=False).round(3))

# tenure         0.421
# MonthlyCharges 0.318
# TotalCharges   0.261`}</Block>

      <Quiz questions={[
        {q:"What makes XGBoost different from Random Forest?",options:["XGBoost uses deeper trees","XGBoost builds trees sequentially, each correcting the previous","XGBoost uses more features","XGBoost is always faster"],answer:"XGBoost builds trees sequentially, each correcting the previous",explanation:"Random Forest builds trees in parallel and averages them. XGBoost builds trees one by one, each one focused on fixing the errors of the last — this is gradient boosting."},
        {q:"learning_rate=0.01 vs learning_rate=0.3 — which is more robust?",options:["0.3 — faster learning","0.01 — smaller steps, less overfitting","They are identical","Depends on max_depth"],answer:"0.01 — smaller steps, less overfitting",explanation:"A smaller learning rate means each tree contributes less. You need more trees (higher n_estimators) but the model is more robust and less prone to overfitting."},
        {q:"Your XGBoost model has train AUC=0.98 and test AUC=0.71. What should you try?",options:["Increase n_estimators","Decrease max_depth and increase learning_rate","Add more features","Remove the test set"],answer:"Decrease max_depth and increase learning_rate",explanation:"Train much higher than test = overfitting. Reduce max_depth (simpler trees) and lower learning_rate. Also try subsample < 1.0."},
        {q:"feature_importances_ gives you:",options:["SHAP values for each prediction","Which features the model used most across all trees","Correlation with the target","The number of times each feature appears"],answer:"Which features the model used most across all trees",explanation:"Feature importance measures how much each feature contributed to reducing the loss function across all trees. Higher = more important to the model globally."},
        {q:"When would you choose Random Forest over XGBoost?",options:["Never — XGBoost is always better","When you need a quick baseline, have limited time to tune, or the dataset is small","When you have more than 100 features","When you need probabilities"],answer:"When you need a quick baseline, have limited time to tune, or the dataset is small",explanation:"Random Forest works well out of the box with minimal tuning. XGBoost needs careful hyperparameter tuning to shine. For quick prototyping, start with Random Forest."},
      ]}/>

      <CodeExercise
        title="Train a Gradient Boosting model and get feature importances"
        description="Fill in the blanks to train a GradientBoostingClassifier with 50 trees and learning rate 0.1, then print feature importances sorted descending."
        starterCode={`from sklearn.ensemble import GradientBoostingClassifier
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'calls':[5,1,4,0,6,1,2,1,5,2,6,0,4,1,5],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges','calls']]
y = df['churn']

# Train with 50 trees and learning_rate=0.1
model = ___(n_estimators=___, learning_rate=___, random_state=42)
model.___(X, y)

# Print feature importances sorted descending
imp = pd.Series(model.___, index=X.columns)
print(imp.sort_values(ascending=False).round(3))`}
        hint="GradientBoostingClassifier(n_estimators=50, learning_rate=0.1). model.fit(X,y). model.feature_importances_."
        validate={(output) => output.includes("tenure") || output.includes("calls")}
      />
    </div>
  )},
  {
    id:"adv-lightgbm", title:"LightGBM & CatBoost", subtitle:"Faster boosting for large datasets",
    emoji:"🚀", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>LightGBM (by Microsoft) and CatBoost (by Yandex) are XGBoost alternatives that are faster on large datasets and handle categorical features better. You will see them in every serious ML competition.</LP>

      <LH>1. Why LightGBM is Faster</LH>
      <LP>XGBoost grows trees level by level. LightGBM grows trees leaf by leaf, only expanding the most promising leaf. This makes it much faster on large datasets.</LP>
      <Callout icon="🧠" color="#f7c96e" title="Key difference">LightGBM is 5-10x faster than XGBoost on large datasets. Same accuracy, less time. On small datasets (under 10k rows) the difference is negligible.</Callout>

      <LH>2. LightGBM Code</LH>
      <Block label="python — LightGBM">{`# pip install lightgbm
import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    num_leaves=31,       # controls complexity
    random_state=42,
    verbose=-1           # suppress output
)

model.fit(X_train, y_train)
preds = model.predict(X_test)`}</Block>

      <LH>3. CatBoost — No Encoding Needed</LH>
      <LP>CatBoost handles categorical features automatically. You do not need to one-hot encode or label encode them — just tell the model which columns are categorical.</LP>
      <Block label="python — CatBoost">{`# pip install catboost
from catboost import CatBoostClassifier

model = CatBoostClassifier(
    iterations=200,
    learning_rate=0.05,
    cat_features=['gender', 'contract_type'],  # no encoding needed!
    verbose=False
)

model.fit(X_train, y_train)`}</Block>

      <LH>4. When to Use Which</LH>
      <Compare items={[
        {color:"#7eb8f7",label:"XGBoost",text:"Best known. Great default choice. Huge community. Works on any size dataset."},
        {color:"#6dd6a0",label:"LightGBM",text:"Fastest. Best for large datasets (100k+ rows). Slightly harder to tune."},
        {color:"#c792ea",label:"CatBoost",text:"Best for datasets with many categorical columns. Minimal preprocessing needed."},
      ]}/>

      <Quiz questions={[
        {q:"LightGBM is faster than XGBoost because:",options:["It uses fewer trees","It grows trees leaf-by-leaf instead of level-by-level","It uses a different loss function","It skips cross-validation"],answer:"It grows trees leaf-by-leaf instead of level-by-level",explanation:"LightGBM uses leaf-wise tree growth, only expanding the most promising leaf at each step. XGBoost grows level-by-level. Leaf-wise is faster and often more accurate."},
        {q:"CatBoost's main advantage is:",options:["It is faster than all other boosting libraries","It handles categorical features without manual encoding","It requires no hyperparameter tuning","It works without any training data"],answer:"It handles categorical features without manual encoding",explanation:"CatBoost uses a special algorithm to handle categorical features internally. You just specify which columns are categorical — no get_dummies or LabelEncoder needed."},
        {q:"You have 2 million rows and 50 features. Which boosting library would you try first?",options:["XGBoost — most popular","LightGBM — fastest on large data","CatBoost — most accurate","All three simultaneously"],answer:"LightGBM — fastest on large data",explanation:"LightGBM was designed specifically for large datasets. On millions of rows it can be 10x faster than XGBoost with similar or better accuracy."},
        {q:"num_leaves=31 in LightGBM controls:",options:["Number of trees","Number of features used","Maximum leaves per tree — controls model complexity","Learning rate"],answer:"Maximum leaves per tree — controls model complexity",explanation:"num_leaves is LightGBM's main complexity parameter (like max_depth in XGBoost). Higher = more complex model. Default is 31. Increase for more power, decrease to prevent overfitting."},
        {q:"For a Kaggle competition, what is the typical approach?",options:["Use only XGBoost","Use only LightGBM","Train all three and ensemble their predictions","Pick the fastest one"],answer:"Train all three and ensemble their predictions",explanation:"In competitions, ensembling (averaging predictions from multiple models) almost always beats any single model. Top Kaggle solutions typically blend XGBoost, LightGBM, and CatBoost."},
      ]}/>

      <CodeExercise
        title="Compare GradientBoosting vs RandomForest"
        description="Fill in the blanks to train both models and compare their accuracy on the test set."
        starterCode={`from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges']]
y = df['churn']
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.3,random_state=42)

# Train both models with 50 estimators
gb = ___(n_estimators=50, random_state=42)
rf = ___(n_estimators=50, random_state=42)
gb.___(X_train, y_train)
rf.___(X_train, y_train)

print('GradientBoosting: ' + str(round(accuracy_score(y_test, gb.___(X_test)), 2)))
print('RandomForest:     ' + str(round(accuracy_score(y_test, rf.___(X_test)), 2)))`}
        hint="GradientBoostingClassifier(). RandomForestClassifier(). .fit(X_train, y_train). .predict(X_test)."
        validate={(output) => output.includes("GradientBoosting:") && output.includes("RandomForest:")}
      />
    </div>
  )},
  {
    id:"adv-shap", title:"SHAP & Model Explainability", subtitle:"Understand why your model makes predictions",
    emoji:"🔍", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>SHAP (SHapley Additive exPlanations) answers the most important question in ML: <strong style={{color:T.text}}>"Why did the model predict this?"</strong></LP>
      <LP>This is critical in real jobs — businesses need to explain decisions to customers, managers, and regulators. A model you cannot explain is hard to trust and deploy.</LP>

      <LH>1. The Problem with Feature Importance</LH>
      <LP>Regular feature importance tells you which features matter globally. SHAP tells you which features pushed a specific prediction up or down — for each individual row.</LP>
      <Compare items={[
        {color:"#8b87a8",label:"Feature Importance",text:"tenure is the most important feature globally. That is all it tells you."},
        {color:"#f7c96e",label:"SHAP",text:"For this customer: tenure pushed churn probability UP by 0.32, MonthlyCharges pushed it DOWN by 0.15."},
      ]}/>

      <LH>2. SHAP Values Explained</LH>
      <Callout icon="🧠" color="#f7c96e" title="How to read SHAP values">
        A SHAP value of +0.3 means that feature pushed the prediction 0.3 higher than the baseline.
        A SHAP value of -0.2 means it pushed the prediction 0.2 lower.
        The sum of all SHAP values equals the final prediction minus the baseline.
      </Callout>
      <Block label="python — SHAP with sklearn">{`# pip install shap
import shap
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# For binary classification, shap_values is a list [class0, class1]
# Use class 1 (churn)
import numpy as np
mean_shap = pd.Series(
    np.abs(shap_values[1]).mean(axis=0),
    index=X_test.columns
)
print(mean_shap.sort_values(ascending=False))`}</Block>

      <LH>3. Permutation Importance — Simpler Alternative</LH>
      <LP>If you cannot install SHAP, permutation importance is a great alternative. It measures how much accuracy drops when you shuffle each feature randomly.</LP>
      <Block label="python — permutation importance">{`from sklearn.inspection import permutation_importance

result = permutation_importance(model, X_test, y_test, random_state=42)

imp = pd.Series(result.importances_mean, index=X_test.columns)
print(imp.sort_values(ascending=False).round(3))

# tenure         0.087
# MonthlyCharges 0.054
# TotalCharges   0.021`}</Block>

      <LH>4. In a Job Interview</LH>
      <Callout icon="💼" color="#6dd6a0" title="What to say">
        "I use SHAP to explain model predictions at both global and individual levels.
        For each prediction I can show which features pushed the score up or down and by how much.
        This makes the model trustworthy and auditable for business stakeholders."
      </Callout>

      <Quiz questions={[
        {q:"Feature importance says 'tenure' is most important. SHAP adds what information?",options:["It confirms the same thing with more math","For each prediction, how much did tenure push the score up or down","The correlation between tenure and churn","The p-value of tenure"],answer:"For each prediction, how much did tenure push the score up or down",explanation:"Feature importance gives global rankings. SHAP gives local explanations — for each individual row, it shows the exact contribution of each feature to that prediction."},
        {q:"A SHAP value of -0.25 for 'tenure' means:",options:["Tenure is 25% correlated with churn","Tenure pushed this prediction 0.25 lower than the baseline","Tenure has 25% feature importance","The model ignores tenure"],answer:"Tenure pushed this prediction 0.25 lower than the baseline",explanation:"Negative SHAP value means the feature reduced the prediction for this specific row. For churn prediction, this means tenure is making this customer less likely to churn."},
        {q:"Permutation importance works by:",options:["Removing features one at a time","Randomly shuffling one feature and measuring accuracy drop","Training a separate model per feature","Computing gradient of the loss"],answer:"Randomly shuffling one feature and measuring accuracy drop",explanation:"Permutation importance shuffles a feature (breaking its relationship with the target) and measures how much model accuracy drops. Big drop = important feature. No drop = irrelevant feature."},
        {q:"When would a business REQUIRE model explainability?",options:["Never — accuracy is all that matters","When the model is used for loan approvals, hiring, or medical decisions","Only for neural networks","Only when AUC is below 0.8"],answer:"When the model is used for loan approvals, hiring, or medical decisions",explanation:"Regulations like GDPR and financial lending laws require models to explain their decisions. If your model denies someone a loan, you must be able to say why. SHAP makes this possible."},
        {q:"shap_values[1] vs shap_values[0] — what is the difference?",options:["No difference","shap_values[1] is for class 1 (e.g. churn=Yes), shap_values[0] is for class 0","shap_values[1] is the second feature","shap_values[0] is more accurate"],answer:"shap_values[1] is for class 1 (e.g. churn=Yes), shap_values[0] is for class 0",explanation:"For binary classification, TreeExplainer returns a list with SHAP values for each class. Index [1] gives explanations for predicting the positive class (churn=Yes), which is usually what you want."},
      ]}/>

      <CodeExercise
        title="Compute permutation importance"
        description="Fill in the blanks to train a RandomForest, compute permutation importance, and print features sorted by importance."
        starterCode={`from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'calls':[5,1,4,0,6,1,2,1,5,2,6,0,4,1,5],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges','calls']]
y = df['churn']

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.___(X, y)

result = ___(model, X, y, random_state=42)

imp = pd.Series(result.___, index=X.columns)
print(imp.sort_values(ascending=False).round(3))`}
        hint="model.fit(X, y). permutation_importance(model, X, y, random_state=42). result.importances_mean."
        validate={(output) => output.includes("tenure") || output.includes("calls")}
      />
    </div>
  )},
  {
    id:"adv-feature-eng", title:"Feature Engineering", subtitle:"Turn raw data into powerful signals",
    emoji:"🔧", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>Feature engineering is the process of creating new input variables from raw data. It is often more impactful than switching to a better algorithm. A simple model with great features beats a complex model with bad features.</LP>

      <LH>1. Date Features</LH>
      <LP>Dates contain hidden signals — day of week, month, time since an event. Always extract these.</LP>
      <Block label="python — date features">{`import pandas as pd

df['signup_date'] = pd.to_datetime(df['signup_date'])

df['account_age_days']  = (pd.Timestamp.now() - df['signup_date']).dt.days
df['signup_month']      = df['signup_date'].dt.month
df['signup_dayofweek']  = df['signup_date'].dt.dayofweek  # 0=Monday
df['is_weekend_signup'] = (df['signup_dayofweek'] >= 5).astype(int)`}</Block>

      <LH>2. Interaction Features</LH>
      <LP>Combine two features to capture relationships that neither expresses alone.</LP>
      <Block label="python — interaction features">{`# Charge efficiency — high charges for short tenure = risky customer
df['charges_per_month'] = df['total_charges'] / (df['tenure'] + 1)

# Service density — how many services per dollar
df['services_per_dollar'] = df['num_services'] / (df['monthly_charges'] + 1)

# High value flag
df['high_value'] = ((df['tenure'] > 24) & (df['monthly_charges'] > 70)).astype(int)`}</Block>

      <LH>3. Binning</LH>
      <LP>Convert continuous values into meaningful groups. This helps the model find non-linear patterns.</LP>
      <Block label="python — binning">{`# Tenure groups — business-meaningful bins
df['tenure_group'] = pd.cut(
    df['tenure'],
    bins=[0, 6, 12, 24, 60, 999],
    labels=['new', 'settling', 'established', 'loyal', 'champion']
)

# Charge tier
df['charge_tier'] = pd.qcut(
    df['MonthlyCharges'],
    q=4,
    labels=['budget', 'standard', 'premium', 'enterprise']
)`}</Block>

      <LH>4. Encoding Categoricals</LH>
      <Block label="python — encoding">{`# One-hot encoding — for low cardinality columns
df = pd.get_dummies(df, columns=['Contract', 'PaymentMethod'], drop_first=True)

# Label encoding — for ordinal columns (where order matters)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['TechSupport_encoded'] = le.fit_transform(df['TechSupport'])`}</Block>

      <LH>5. The Golden Rule</LH>
      <Callout icon="★" color="#f7c96e" title="Always think business first">Create features based on business logic, not just math. Ask: what would a domain expert think matters here? A churn analyst would say: customers who pay a lot relative to tenure and call support often are high risk. That insight becomes a feature.</Callout>
      <Warn>Always create features AFTER train/test split, or you will leak test data into training. Use a Pipeline to apply feature engineering consistently at prediction time.</Warn>

      <Quiz questions={[
        {q:"charges_per_month = total_charges / tenure is an example of:",options:["Binning","An interaction feature","One-hot encoding","Label encoding"],answer:"An interaction feature",explanation:"Interaction features combine two or more columns to capture a relationship neither expresses alone. charges/tenure captures how expensive the customer is relative to how long they have stayed."},
        {q:"pd.cut(df['tenure'], bins=[0,12,24,60,999]) creates:",options:["A normalized column","Groups based on fixed boundaries","Groups based on equal frequencies","A binary flag"],answer:"Groups based on fixed boundaries",explanation:"pd.cut splits data into bins based on value ranges you define. pd.qcut splits into bins with equal numbers of observations. Use pd.cut when the boundaries have business meaning (e.g. 0-12 months = new customer)."},
        {q:"Why is drop_first=True used in pd.get_dummies?",options:["To speed up computation","To avoid multicollinearity — one category is implied by all others being 0","To save memory","To improve accuracy"],answer:"To avoid multicollinearity — one category is implied by all others being 0",explanation:"If you have 3 categories and encode all 3, one is redundant (you can infer it from the others). drop_first removes one column to avoid this redundancy, which matters especially for linear models."},
        {q:"You create a feature using the test set before splitting. This causes:",options:["Better accuracy","Data leakage — test information contaminates training","No problem if you use cross-validation","Faster training"],answer:"Data leakage — test information contaminates training",explanation:"Data leakage happens when information from the test set influences the training process. Always split first, then engineer features using only training data statistics. Use sklearn Pipeline to prevent this automatically."},
        {q:"A simple model with great features vs a complex model with raw features — which wins?",options:["Always the complex model","Usually the simple model with good features","They are always equal","Depends on dataset size only"],answer:"Usually the simple model with good features",explanation:"Feature engineering is often more impactful than model complexity. A logistic regression with well-engineered features frequently beats a random forest on raw data. Good features make every model better."},
      ]}/>

      <CodeExercise
        title="Engineer interaction and flag features"
        description="Fill in the blanks to create two new features: charge_per_tenure (charges divided by tenure+1) and high_risk flag (tenure less than 6 AND charges greater than 70)."
        starterCode={`import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12],
        'charges':[90,45,80,42,88,40,65]}
df = pd.DataFrame(data)

# Feature 1: charge per tenure month
df['charge_per_tenure'] = df[___] / (df[___] + 1)

# Feature 2: high risk flag — tenure < 6 AND charges > 70
df['high_risk'] = ((df[___] < ___) & (df[___] > ___)).astype(int)

print(df.round(2).to_string(index=False))`}
        hint="df['charges'] / (df['tenure'] + 1). (df['tenure'] < 6) & (df['charges'] > 70). .astype(int)."
        validate={(output) => output.includes("charge_per_tenure") && output.includes("high_risk")}
      />
    </div>
  )},
  {
    id:"adv-pipelines", title:"ML Pipelines & Production", subtitle:"Build ML systems that work in the real world",
    emoji:"⚙️", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>A production ML pipeline ensures your model gets exactly the same preprocessing at training time and prediction time. Forgetting this is one of the most common ML bugs in the industry.</LP>

      <LH>1. The Problem</LH>
      <Block label="python — wrong way">{`# BAD — preprocessing done separately outside the model
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
model.fit(X_train_scaled, y_train)

# Later in production you get new customer data...
X_new = get_new_customer()
preds = model.predict(X_new)  # WRONG — forgot to scale!
# The model now gets unscaled input and predicts garbage`}</Block>
      <Warn>Training-serving skew is when your model gets different input at prediction time than at training time. It silently destroys model performance in production and is very hard to debug.</Warn>

      <LH>2. The Fix — sklearn Pipeline</LH>
      <LP>A Pipeline chains preprocessing and modeling into one object. When you call predict, it automatically applies all the same transformations.</LP>
      <Block label="python — correct way">{`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression

pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),  # step 1: fill nulls
    ('scaler',  StandardScaler()),                   # step 2: scale features
    ('model',   LogisticRegression())                # step 3: train model
])

# Train — all steps applied automatically
pipeline.fit(X_train, y_train)

# Predict — same preprocessing applied automatically
predictions = pipeline.predict(X_new)  # correct!`}</Block>

      <LH>3. Save and Load the Pipeline</LH>
      <Block label="python — save and load">{`import joblib

# Save the entire pipeline (preprocessing + model)
joblib.dump(pipeline, 'churn_pipeline.pkl')

# Load it later or on a different machine
loaded = joblib.load('churn_pipeline.pkl')

# Make predictions — works identically
loaded.predict(X_new)`}</Block>

      <LH>4. ColumnTransformer — Different Steps for Different Columns</LH>
      <Block label="python — ColumnTransformer">{`from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

numeric_features = ['tenure', 'MonthlyCharges', 'TotalCharges']
categorical_features = ['Contract', 'PaymentMethod']

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LogisticRegression())
])`}</Block>

      <Callout icon="💼" color="#6dd6a0" title="Why this matters for jobs">Companies do not want models in notebooks. They want models they can deploy and maintain. Knowing how to build proper pipelines signals you are production-ready — not just a notebook data scientist.</Callout>

      <Quiz questions={[
        {q:"What is training-serving skew?",options:["When train accuracy is higher than test accuracy","When the model gets different preprocessing at prediction time vs training time","When the model is too slow in production","When features are different between datasets"],answer:"When the model gets different preprocessing at prediction time vs training time",explanation:"Training-serving skew means your model was trained on data processed one way but gets data processed differently in production. This silently destroys performance. A Pipeline prevents this by bundling preprocessing and model together."},
        {q:"pipeline.fit(X_train, y_train) does what?",options:["Only trains the model","Fits only the preprocessors","Fits all steps in order — each preprocessor learns from training data, then the model trains","Fits preprocessors on X_train and model on X_test"],answer:"Fits all steps in order — each preprocessor learns from training data, then the model trains",explanation:"Pipeline.fit runs each step in sequence. The imputer learns the median, the scaler learns mean and std, then the model trains on the transformed data — all from training data only."},
        {q:"Why must you NOT call fit_transform on X_test?",options:["It is slower","It leaks test statistics into your evaluation — use transform only","It does not work on test data","It changes the number of features"],answer:"It leaks test statistics into your evaluation — use transform only",explanation:"fit_transform computes statistics (mean, std) from the data. On test data, you must use transform only — applying the statistics learned from training. Recomputing on test data leaks information and gives overoptimistic results."},
        {q:"joblib.dump(pipeline, 'model.pkl') saves:",options:["Only the model weights","Only the preprocessor parameters","The entire pipeline including all preprocessing steps and model","A summary of the model"],answer:"The entire pipeline including all preprocessing steps and model",explanation:"joblib serializes the entire Pipeline object — all fitted transformers and the trained model. Loading it with joblib.load gives you a fully functional object that can immediately make predictions on new raw data."},
        {q:"ColumnTransformer lets you:",options:["Train different models on different columns","Apply different preprocessing to numeric vs categorical columns","Merge multiple datasets","Select the best features automatically"],answer:"Apply different preprocessing to numeric vs categorical columns",explanation:"ColumnTransformer routes different columns to different preprocessing pipelines. Numeric columns get imputation + scaling. Categorical columns get imputation + one-hot encoding. The outputs are concatenated automatically."},
      ]}/>

      <CodeExercise
        title="Build a preprocessing pipeline"
        description="Fill in the blanks to build a Pipeline with mean imputation and standard scaling, then fit and transform the data."
        starterCode={`from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

data = {'tenure':[1,24,np.nan,36,3,48,12],
        'charges':[90,45,80,np.nan,88,40,65]}
df = pd.DataFrame(data)

# Pipeline: fill nulls with mean, then scale
pipe = Pipeline([
    ('imputer', ___(strategy=___)),
    ('scaler',  ___())
])

result = pipe.fit_transform(df)
print(result.round(2))`}
        hint="SimpleImputer(strategy='mean'). StandardScaler(). pipe.fit_transform(df)."
        validate={(output) => output.includes("[") && !output.includes("nan")}
      />
    </div>
  )},
  {
    id:"adv-hypertuning", title:"Hyperparameter Tuning", subtitle:"Squeeze every bit of performance from your model",
    emoji:"🎯", phase:"Advanced ML", color:"#f7c96e",
    body:()=>(
    <div>
      <LP>Hyperparameter tuning finds the best settings for your model. The difference between default settings and well-tuned settings is typically 2-5% in AUC — which is a lot in real applications.</LP>

      <LH>1. What are Hyperparameters?</LH>
      <LP>Hyperparameters are settings you choose before training — like max_depth, learning_rate, n_estimators. They are not learned from data. Tuning means finding the combination that gives the best cross-validated score.</LP>
      <Compare items={[
        {color:"#8b87a8",label:"Parameters",text:"Learned during training. Example: the weights in a linear regression or the split thresholds in a tree."},
        {color:"#f7c96e",label:"Hyperparameters",text:"Set before training. Example: max_depth=4, learning_rate=0.1, n_estimators=100."},
      ]}/>

      <LH>2. GridSearchCV — Try Every Combination</LH>
      <Block label="python — GridSearchCV">{`from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import GradientBoostingClassifier

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth':    [2, 3, 4],
    'learning_rate':[0.05, 0.1, 0.2]
}
# Total combinations: 3 x 3 x 3 = 27

search = GridSearchCV(
    GradientBoostingClassifier(random_state=42),
    param_grid,
    cv=5,           # 5-fold cross-validation
    scoring='roc_auc',
    n_jobs=-1       # use all CPU cores
)

search.fit(X_train, y_train)
print("Best params:", search.best_params_)
print("Best AUC:   ", round(search.best_score_, 3))`}</Block>

      <LH>3. RandomizedSearchCV — Faster for Large Grids</LH>
      <LP>When your grid has hundreds of combinations, trying all of them is too slow. RandomizedSearchCV randomly samples a fixed number of combinations.</LP>
      <Block label="python — RandomizedSearchCV">{`from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

param_dist = {
    'n_estimators':  randint(50, 500),    # random int between 50 and 500
    'max_depth':     randint(2, 8),
    'learning_rate': uniform(0.01, 0.29), # random float between 0.01 and 0.3
    'subsample':     uniform(0.6, 0.4)    # random float between 0.6 and 1.0
}

search = RandomizedSearchCV(
    GradientBoostingClassifier(random_state=42),
    param_dist,
    n_iter=30,        # try 30 random combinations
    cv=5,
    scoring='roc_auc',
    random_state=42
)

search.fit(X_train, y_train)`}</Block>

      <LH>4. Cross-Validation — Honest Evaluation</LH>
      <Block label="python — cross_val_score">{`from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)

scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
print("CV AUC scores: " + str(scores.round(3)))
print("Mean AUC:      " + str(round(scores.mean(), 3)))
print("Std:           " + str(round(scores.std(), 3)))`}</Block>
      <Tip>If your std is high (above 0.05), your model results are unstable — the training set matters too much. Try more data or simpler models.</Tip>

      <LH>5. Tuning Rules of Thumb</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li>Small grid (under 100 combos) → GridSearchCV</li>
        <li>Large grid (100+ combos) → RandomizedSearchCV with n_iter=50</li>
        <li>Want best results and have compute budget → Optuna (Bayesian optimization)</li>
        <li>Always tune with cross-validation, never on the test set</li>
        <li>Start with the most impactful params: n_estimators, max_depth, learning_rate</li>
      </ul>
      <Warn>Never tune hyperparameters using the test set. If you do, your test set is no longer an honest evaluation — it has been used to make decisions. Use cross-validation on the training set only.</Warn>

      <Quiz questions={[
        {q:"What is the difference between a parameter and a hyperparameter?",options:["They are the same thing","Parameters are learned during training, hyperparameters are set before training","Hyperparameters are learned, parameters are set manually","Parameters are only in neural networks"],answer:"Parameters are learned during training, hyperparameters are set before training",explanation:"Model parameters (like tree split thresholds or linear regression weights) are learned from data. Hyperparameters (like max_depth or learning_rate) are settings you choose before training that control how the model learns."},
        {q:"GridSearchCV with 3 values for each of 4 hyperparameters and cv=5 runs how many fits?",options:["12","15","405","81"],answer:"405",explanation:"3^4 = 81 combinations. Each evaluated with 5-fold CV = 81 x 5 = 405 model fits. This is why large grids are slow and RandomizedSearchCV is preferred for big search spaces."},
        {q:"Your GridSearchCV best_score_ is 0.87 but test set AUC is 0.79. What likely happened?",options:["Nothing — this is normal","Overfitting to the training folds during search — use a held-out test set","The model is underfitting","cross-validation is not working"],answer:"Overfitting to the training folds during search — this gap is expected but large gaps signal a problem",explanation:"Some gap between CV score and test score is expected. A large gap means the tuning process overfit to the specific training folds. Use more CV folds or a larger dataset. Never tune on the test set."},
        {q:"n_iter=30 in RandomizedSearchCV means:",options:["Train for 30 epochs","Try 30 random combinations from the distribution","Use 30 cross-validation folds","Train 30 separate models in parallel"],answer:"Try 30 random combinations from the distribution",explanation:"n_iter controls how many random hyperparameter combinations to try. Each combination is evaluated with cross-validation. Higher n_iter = better search but more compute time."},
        {q:"cross_val_score std=0.08. What does this tell you?",options:["The model is 8% accurate","Results vary significantly across folds — the model may be unstable or data is small","The model is overfitting by 8%","Nothing — std is not meaningful here"],answer:"Results vary significantly across folds — the model may be unstable or data is small",explanation:"High std means the model performs very differently depending on which data it trains on. This signals instability — possibly too little data, too complex a model, or too few CV folds. Aim for std below 0.03."},
      ]}/>

      <CodeExercise
        title="Run GridSearchCV"
        description="Fill in the blanks to run a GridSearchCV on a DecisionTree and print the best parameters and best score."
        starterCode={`from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV
import pandas as pd

data = {'tenure':[1,24,6,36,3,48,12,30,5,18,2,42,8,28,4],
        'charges':[90,45,80,42,88,40,65,48,85,62,91,41,78,50,87],
        'churn':[1,0,1,0,1,0,0,0,1,0,1,0,1,0,1]}
df = pd.DataFrame(data)
X = df[['tenure','charges']]
y = df['churn']

param_grid = {
    'max_depth': [2, 3, 4],
    'min_samples_split': [2, 5]
}

grid = ___(DecisionTreeClassifier(random_state=42), ___, cv=3, scoring='accuracy')
grid.___(X, y)
print('Best params:', grid.___)
print('Best score:', round(grid.___, 2))`}
        hint="GridSearchCV(model, param_grid, cv=3). grid.fit(X,y). grid.best_params_. grid.best_score_."
        validate={(output) => output.includes("Best params:") && output.includes("Best score:")}
      />
    </div>
  )},
];

LESSONS.push(...ML_LESSONS);
LESSONS.push(...ADVANCED_ML_LESSONS);
LESSONS.push(...FOUNDATION_LESSONS);

// ══ PHASE 2 EXTRA LESSONS ════════════════════════════════════════════════════
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
  {id:"streamlit-lesson", phase:"🤖 Machine Learning", emoji:"🚀", color:"#ff4b4b", title:"Streamlit — Deploy ML Apps", subtitle:"'Here's my live demo' wins interviews",
   body:()=>(
    <div>
      <LP>Streamlit turns Python scripts into live web apps in minutes — no HTML, no CSS, no JavaScript. Every DS project you build should have a Streamlit demo. "Here's a live link" is the most powerful thing you can say in an interview.</LP>
      <Callout icon="🧠" color="#ff4b4b" title="The one rule">Build the simplest version that works and deploy it. A live ugly app beats a beautiful app that only runs on your laptop.</Callout>

      <LH>1. Getting Started — your first app in 5 lines</LH>
      <Block label="app.py">{`import streamlit as st

st.title("My First DS App")
st.write("Hello, world!")

name = st.text_input("What's your name?")
if name:
    st.write(f"Hello, {name}! Welcome to data science.")`}</Block>
      <Block label="Run it">{`# In terminal
pip install streamlit
streamlit run app.py
# Opens at localhost:8501 automatically`}</Block>

      <LH>2. Core UI Elements</LH>
      <Block label="Text and layout">{`import streamlit as st

# Text
st.title("Dashboard Title")           # large title
st.header("Section Header")          # h2
st.subheader("Subsection")           # h3
st.write("Any text or Python object") # versatile
st.markdown("**Bold** and *italic*")  # markdown support
st.code("import pandas as pd", language="python")
st.metric(label="Accuracy", value="87.3%", delta="+2.1%")  # KPI card

# Layout
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Precision", "84.2%")
with col2:
    st.metric("Recall", "91.5%")
with col3:
    st.metric("F1 Score", "87.7%")

# Sidebar
st.sidebar.title("Settings")
threshold = st.sidebar.slider("Decision Threshold", 0.0, 1.0, 0.5)

# Expander — hide details
with st.expander("Show raw data"):
    st.dataframe(df)`}</Block>

      <LH>3. Input Widgets</LH>
      <Block label="All the inputs you need">{`import streamlit as st

# Text
name   = st.text_input("Customer name")
notes  = st.text_area("Notes", height=100)

# Numbers
age    = st.number_input("Age", min_value=18, max_value=100, value=30)
budget = st.slider("Monthly Budget ($)", 20, 200, 75)

# Selections
plan   = st.selectbox("Contract", ["Month-to-month","One year","Two year"])
services = st.multiselect("Services", ["Phone","Internet","TV","Security"])

# Toggles
vip    = st.checkbox("VIP customer")
mode   = st.radio("Mode", ["Predict", "Analyze", "Compare"])

# File upload
uploaded = st.file_uploader("Upload CSV", type="csv")
if uploaded:
    import pandas as pd
    df = pd.read_csv(uploaded)
    st.dataframe(df.head())

# Buttons
if st.button("Run Prediction"):
    st.success("Prediction complete!")`}</Block>

      <LH>4. Displaying Data and Charts</LH>
      <Block label="Data display and visualization">{`import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px

df = pd.read_csv("customers.csv")

# Tables
st.dataframe(df)                     # interactive, sortable
st.table(df.head(5))                 # static
st.json({"key": "value"})            # formatted JSON

# Charts — built-in (fast)
st.line_chart(df['monthly_charges'])
st.bar_chart(df.groupby('contract')['churn'].mean())
st.area_chart(df[['tenure','monthly_charges']].head(50))

# Matplotlib
fig, ax = plt.subplots()
ax.hist(df['monthly_charges'], bins=30, color='#8b7cf6')
ax.set_title("Monthly Charges Distribution")
st.pyplot(fig)

# Plotly — interactive
fig2 = px.scatter(df, x='tenure', y='monthly_charges',
                  color='churn', title="Tenure vs Charges")
st.plotly_chart(fig2, use_container_width=True)`}</Block>

      <LH>5. Full Churn Prediction App</LH>
      <Block label="Complete ML app — save as app.py">{`import streamlit as st
import pandas as pd
import numpy as np
import joblib

# Load pre-trained pipeline
@st.cache_resource   # cache so it loads once
def load_model():
    return joblib.load("churn_pipeline.pkl")

model = load_model()

# App header
st.title("🔄 Customer Churn Predictor")
st.markdown("Enter customer details to predict churn probability.")

# Sidebar inputs
st.sidebar.header("Customer Details")
tenure         = st.sidebar.slider("Tenure (months)", 0, 72, 12)
monthly_charge = st.sidebar.slider("Monthly Charges ($)", 20, 120, 65)
contract       = st.sidebar.selectbox("Contract", 
                    ["Month-to-month","One year","Two year"])
internet       = st.sidebar.selectbox("Internet Service",
                    ["Fiber optic","DSL","No"])

# Predict button
if st.sidebar.button("Predict Churn"):
    input_df = pd.DataFrame({
        'tenure':           [tenure],
        'MonthlyCharges':   [monthly_charge],
        'Contract':         [contract],
        'InternetService':  [internet],
    })
    
    prob = model.predict_proba(input_df)[0][1]
    pred = "Will Churn" if prob > 0.5 else "Will Stay"
    color = "error" if prob > 0.5 else "success"
    
    # Display results
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Prediction", pred)
    with col2:
        st.metric("Churn Probability", f"{prob:.1%}")
    
    # Probability gauge
    st.progress(float(prob))
    
    if prob > 0.7:
        st.error("⚠️ High churn risk — consider retention offer")
    elif prob > 0.4:
        st.warning("⚡ Medium risk — monitor this customer")
    else:
        st.success("✅ Low churn risk")`}</Block>

      <LH>6. Deploy to Streamlit Cloud — free in 2 minutes</LH>
      <Block label="Deployment steps">{`# 1. Push your app to GitHub
git add app.py requirements.txt
git commit -m "Add Streamlit churn app"
git push origin main

# 2. requirements.txt — list your dependencies
streamlit
pandas
scikit-learn
joblib
plotly

# 3. Go to share.streamlit.io
#    → New app → connect GitHub repo → select app.py → Deploy

# 4. You get a live URL: yourapp.streamlit.app
#    Share this in your portfolio, LinkedIn, interviews

# Useful Streamlit features for deployment
st.cache_data      # cache data loading (speeds up app)
st.cache_resource  # cache model loading (loads model once)
st.secrets         # store API keys safely (like .env)`}</Block>
      <Tip>Add @st.cache_resource to your model loading function. Without it, the model reloads every time a user interacts with the app — very slow.</Tip>

      <LH>7. Session State — remember user actions</LH>
      <Block label="Session state">{`import streamlit as st

# Without session state, variables reset on every interaction
# With session state, they persist

if 'prediction_count' not in st.session_state:
    st.session_state.prediction_count = 0

if 'history' not in st.session_state:
    st.session_state.history = []

if st.button("Predict"):
    st.session_state.prediction_count += 1
    st.session_state.history.append({"run": st.session_state.prediction_count})
    st.write(f"Total predictions: {st.session_state.prediction_count}")

st.write("History:", st.session_state.history)`}</Block>

      <Quiz questions={[
        {q:"@st.cache_resource on your model loading function does what?",options:["Loads the model faster","Loads the model once and reuses it across all users/interactions","Saves the model to disk","Validates model inputs"],answer:"Loads the model once and reuses it across all users/interactions",explanation:"Without caching, Streamlit reruns the entire script on every interaction — reloading the model each time. @st.cache_resource caches the loaded model in memory so it's only loaded once, making the app much faster."},
        {q:"st.columns(3) returns:",options:["A list of 3 column containers","3 empty DataFrames","A 3-column table widget","Error — columns takes no arguments"],answer:"A list of 3 column containers","explanation":"st.columns(n) returns n column objects. Use 'with col1:' to place content in each column. This is how you create side-by-side layouts in Streamlit."},
        {q:"A user uploads a CSV. You want to read it with pandas. What do you pass to pd.read_csv()?",options:["The filename string","The uploaded file object directly","st.file_uploader result after .read()","You can't use uploaded files with pandas"],answer:"The uploaded file object directly",explanation:"Streamlit's file_uploader returns a file-like object that pandas can read directly. pd.read_csv(uploaded_file) works without saving to disk first."},
        {q:"Why does Streamlit rerun the entire script on every user interaction?",options:["It's a bug","This is Streamlit's core design — reactive execution model","To clear the cache","Because Python is slow"],answer:"This is Streamlit's core design — reactive execution model",explanation:"Streamlit reruns top-to-bottom on every interaction. This simplicity is by design — you write regular Python, Streamlit handles the reactivity. Use st.session_state and st.cache_* to manage state and performance."},
        {q:"You want different sidebar settings to change what's shown in the main area. What do you use?",options:["st.sidebar.connect()","st.session_state","Normal Python — sidebar widgets return values you can use anywhere","st.callback()"],answer:"Normal Python — sidebar widgets return values you can use anywhere",explanation:"Streamlit widgets return values. contract = st.sidebar.selectbox(...) gives you the selected value. Use it anywhere in your script. Streamlit's rerun model means the main area automatically updates when sidebar changes."},
      ]}/>

      <CodeExercise
        title="Build a mini data explorer app"
        description="Write a Streamlit app that: shows a title, takes a number input for 'n rows' (default 5), generates a simple DataFrame with 'id', 'score', and 'grade' columns, and displays the first n rows."
        starterCode={`import streamlit as st
import pandas as pd
import numpy as np

st.title(___)

# Number input for rows to show
n = st.number_input("Rows to show", min_value=1, max_value=20, value=___)

# Generate sample data
np.random.seed(42)
df = pd.DataFrame({
    'id':    range(1, 21),
    'score': np.random.randint(50, 100, 20),
})
df['grade'] = df['score'].apply(lambda s: 'A' if s>=90 else 'B' if s>=75 else 'C')

# Show first n rows
st.write(f"Showing first {n} rows:")
st.___(df.head(___))

# Show a metric
st.metric("Average Score", round(df['score'].mean(), 1))`}
        hint="st.title('any string'). value=5 for default. st.dataframe(df.head(n))."
        validate={(out)=>out.includes("Showing first")&&out.includes("Average Score")}
      />
    </div>
  )},
];
LESSONS.push(...PHASE2_LESSONS);

// ══ PHASE 3 LESSONS ══════════════════════════════════════════════════════════
// ══ PHASE 3 LESSONS ══════════════════════════════════════════════════════════
const PHASE3_LESSONS = [
  // ── DEEP LEARNING & NEURAL NETWORKS
  {id:"dl-nn-lesson", phase:"🧠 Deep Learning", emoji:"🧠", color:"#818cf8", title:"Neural Networks & Deep Learning", subtitle:"How machines actually learn — from neurons to backpropagation",
   body:()=>(
    <div>
      <LP>Neural networks are the engine behind image recognition, language models, fraud detection, and most modern AI. This lesson builds your intuition from scratch — how a single neuron works, how layers combine, how backpropagation trains the network, and how to build and evaluate real models using sklearn and the patterns used in industry.</LP>
      <Callout icon="🧠" color="#818cf8" title="The big picture">A neural network is a universal function approximator. Given enough neurons and data, it can learn any mapping from inputs to outputs. The magic isn't the math — it's that the learning process (backpropagation + gradient descent) is fully automatic.</Callout>

      <LH>1. The Neuron — what it actually does</LH>
      <LP>A single neuron takes multiple inputs, multiplies each by a weight, adds a bias, and passes the result through an activation function. That's the entire computation. The network learns by finding the right weights.</LP>
      <Block label="One neuron from scratch">{`import numpy as np

# A single artificial neuron
def neuron(inputs, weights, bias, activation='relu'):
    # Step 1: weighted sum (dot product + bias)
    z = np.dot(inputs, weights) + bias

    # Step 2: activation function
    if activation == 'relu':
        return max(0, z)          # ReLU: pass positive, kill negative
    elif activation == 'sigmoid':
        return 1 / (1 + np.exp(-z))  # Sigmoid: squash to 0-1
    elif activation == 'linear':
        return z                  # No activation (regression output)

# Example: predict churn probability from 3 features
# inputs: [tenure=12 months, monthly_charge=$75, num_services=3]
inputs  = np.array([12, 75.0, 3])
weights = np.array([-0.08, 0.03, -0.05])  # learned during training
bias    = 0.5

prob = neuron(inputs, weights, bias, activation='sigmoid')
print(f"Churn probability: {prob:.3f}")   # e.g. 0.623

# What weights mean:
# tenure weight = -0.08 → longer tenure → LESS likely to churn
# monthly_charge weight = +0.03 → higher charge → MORE likely to churn`}</Block>

      <LH>2. Activation Functions — why they matter</LH>
      <LP>Without activation functions, a neural network is just a linear model no matter how many layers it has. Activations introduce non-linearity, letting the network learn complex patterns.</LP>
      <Compare items={[
        {label:"ReLU", color:"#6dd6a0", text:"max(0, x). Default choice for hidden layers. Fast, simple, avoids vanishing gradients. Most networks use this."},
        {label:"Sigmoid", color:"#7eb8f7", text:"1/(1+e^-x). Output 0 to 1. Use ONLY for binary classification output. Has vanishing gradient problem in deep networks."},
        {label:"Softmax", color:"#f7c96e", text:"Converts logits to probabilities summing to 1. Use for multi-class classification output layers only."},
        {label:"Tanh", color:"#c792ea", text:"Output -1 to 1. Centered at 0 unlike sigmoid. Sometimes used in recurrent networks. Similar vanishing gradient issue."},
      ]}/>
      <Block label="Activation functions in NumPy">{`import numpy as np

z = np.array([-3.0, -1.0, 0.0, 1.0, 3.0])

# ReLU — kills negatives, passes positives unchanged
relu    = np.maximum(0, z)
print("ReLU:   ", relu)    # [0. 0. 0. 1. 3.]

# Sigmoid — smooth 0→1 curve
sigmoid = 1 / (1 + np.exp(-z))
print("Sigmoid:", sigmoid.round(3))  # [0.047 0.269 0.5 0.731 0.953]

# Tanh — smooth -1→1 curve
tanh_v  = np.tanh(z)
print("Tanh:   ", tanh_v.round(3))   # [-0.995 -0.762 0. 0.762 0.995]

# Softmax — multi-class probabilities
def softmax(x):
    # Subtract max for numerical stability (prevents overflow)
    e = np.exp(x - np.max(x))
    return e / e.sum()

logits = np.array([2.1, 0.8, 1.4])  # raw scores for 3 classes
probs  = softmax(logits)
print("Softmax:", probs.round(3))    # [0.508 0.161 0.332]
print("Sum:    ", probs.sum())        # 1.0 (always)

# Derivative of ReLU (used in backprop)
# 0 if x < 0, 1 if x > 0 — that's it`}</Block>
      <Warn>Sigmoid and Tanh suffer from the vanishing gradient problem in deep networks — gradients shrink to near-zero during backprop, and deep layers stop learning. Use ReLU in hidden layers to avoid this. Only use sigmoid at the output layer for binary classification.</Warn>

      <LH>3. Network Architecture — layers and shapes</LH>
      <LP>A neural network is just layers of neurons stacked together. Each layer's output becomes the next layer's input. The key skill is understanding how data flows through the shapes.</LP>
      <Block label="Understanding layer shapes">{`import numpy as np

# Data: 100 customers, 5 features each
n_samples  = 100
n_features = 5   # tenure, charges, services, contract_enc, senior

X = np.random.randn(n_samples, n_features)  # shape: (100, 5)

# Layer 1: 5 inputs → 32 neurons
W1 = np.random.randn(5, 32) * 0.01    # shape: (5, 32)
b1 = np.zeros(32)                      # shape: (32,)

z1 = X @ W1 + b1                       # shape: (100, 32)
a1 = np.maximum(0, z1)                 # ReLU → shape: (100, 32)

# Layer 2: 32 inputs → 16 neurons
W2 = np.random.randn(32, 16) * 0.01   # shape: (32, 16)
b2 = np.zeros(16)

z2 = a1 @ W2 + b2                      # shape: (100, 16)
a2 = np.maximum(0, z2)                 # ReLU → shape: (100, 16)

# Output layer: 16 inputs → 1 output (binary classification)
W3 = np.random.randn(16, 1) * 0.01    # shape: (16, 1)
b3 = np.zeros(1)

z3 = a2 @ W3 + b3                      # shape: (100, 1)
output = 1 / (1 + np.exp(-z3))         # Sigmoid → probabilities

print(f"Input shape:   {X.shape}")       # (100, 5)
print(f"After layer 1: {a1.shape}")      # (100, 32)
print(f"After layer 2: {a2.shape}")      # (100, 16)
print(f"Output shape:  {output.shape}")  # (100, 1)`}</Block>
      <Callout icon="💡" color="#818cf8" title="Shape rule">Matrix multiply: (m, n) @ (n, p) = (m, p). Inner dimensions must match. When you get shape errors in ML, this is almost always the cause. Print .shape everywhere when debugging.</Callout>

      <LH>4. Loss Functions — measuring how wrong we are</LH>
      <Block label="Loss functions for different tasks">{`import numpy as np

# ── BINARY CLASSIFICATION: Binary Cross-Entropy (Log Loss)
# Penalizes confident wrong predictions most severely
def binary_cross_entropy(y_true, y_pred):
    eps = 1e-8  # prevent log(0)
    return -np.mean(
        y_true * np.log(y_pred + eps) +
        (1 - y_true) * np.log(1 - y_pred + eps)
    )

y_true = np.array([1, 0, 1, 1, 0])
y_pred = np.array([0.9, 0.1, 0.8, 0.4, 0.3])  # probabilities

loss = binary_cross_entropy(y_true, y_pred)
print(f"BCE Loss: {loss:.4f}")   # lower is better, 0 = perfect

# What BCE penalizes:
# y=1, pred=0.9 → small loss (correct and confident)
# y=1, pred=0.1 → large loss (wrong and confident!)
per_sample = -(y_true * np.log(y_pred + 1e-8) +
               (1-y_true) * np.log(1-y_pred + 1e-8))
print("Per-sample loss:", per_sample.round(3))

# ── REGRESSION: Mean Squared Error
y_reg_true = np.array([100, 200, 150, 300])
y_reg_pred = np.array([110, 190, 160, 280])
mse = np.mean((y_reg_true - y_reg_pred)**2)
rmse = np.sqrt(mse)
print(f"MSE: {mse:.1f}, RMSE: {rmse:.1f}")

# ── MULTI-CLASS: Categorical Cross-Entropy
# Similar to BCE but for multiple classes
# sklearn handles this automatically in MLPClassifier`}</Block>

      <LH>5. Backpropagation — how the network learns</LH>
      <LP>Backprop is the chain rule of calculus applied to neural networks. The network makes a prediction, measures the loss, then computes how much each weight contributed to the error — and adjusts accordingly. You never implement this yourself; frameworks do it automatically.</LP>
      <Block label="The training loop — what happens every iteration">{`import numpy as np

# Simulated training loop (conceptual — what PyTorch/TF do automatically)
np.random.seed(42)

# Tiny network: 2 inputs → 4 hidden → 1 output
W1 = np.random.randn(2, 4) * 0.1
b1 = np.zeros(4)
W2 = np.random.randn(4, 1) * 0.1
b2 = np.zeros(1)

# Training data: XOR pattern (non-linearly separable)
X = np.array([[0,0],[0,1],[1,0],[1,1]])
y = np.array([[0],[1],[1],[0]])

learning_rate = 0.1
losses = []

for epoch in range(500):
    # ── FORWARD PASS ──
    z1 = X @ W1 + b1
    a1 = np.maximum(0, z1)        # ReLU
    z2 = a1 @ W2 + b2
    output = 1/(1+np.exp(-z2))   # Sigmoid

    # Loss
    loss = -np.mean(y*np.log(output+1e-8)+(1-y)*np.log(1-output+1e-8))
    losses.append(loss)

    # ── BACKWARD PASS (chain rule) ──
    dL_dout  = (output - y) / len(y)
    dL_dz2   = dL_dout * output * (1 - output)
    dL_dW2   = a1.T @ dL_dz2
    dL_db2   = dL_dz2.sum(axis=0)
    dL_da1   = dL_dz2 @ W2.T
    dL_dz1   = dL_da1 * (z1 > 0)  # ReLU derivative
    dL_dW1   = X.T @ dL_dz1
    dL_db1   = dL_dz1.sum(axis=0)

    # ── WEIGHT UPDATE (gradient descent) ──
    W2 -= learning_rate * dL_dW2
    b2 -= learning_rate * dL_db2
    W1 -= learning_rate * dL_dW1
    b1 -= learning_rate * dL_db1

    if epoch % 100 == 0:
        print(f"Epoch {epoch:3d}: loss = {loss:.4f}")

print(f"\nFinal predictions: {output.flatten().round(2)}")
print(f"Expected:          {y.flatten()}")
# Network learned XOR: [0, 1, 1, 0]`}</Block>
      <Callout icon="★" color="#f7c96e" title="What you need to understand — not memorize">Understand the CONCEPT: forward pass computes predictions, loss measures error, backward pass computes gradients (how much each weight contributed to the error), optimizer updates weights in the direction that reduces loss. PyTorch/TF handle the math. You control architecture and hyperparameters.</Callout>

      <LH>6. Neural Networks with sklearn — MLPClassifier</LH>
      <LP>For tabular data, sklearn's MLPClassifier is practical and fast. For images, text, or very large datasets, use PyTorch or TensorFlow. Learn MLPClassifier first — same concepts, much simpler API.</LP>
      <Block label="Full MLPClassifier workflow on churn data">{`from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
import pandas as pd
import numpy as np

# Real churn dataset (simulated)
np.random.seed(42)
n = 1000
df = pd.DataFrame({
    'tenure':          np.random.randint(1, 72, n),
    'monthly_charges': np.random.uniform(20, 120, n),
    'num_services':    np.random.randint(1, 8, n),
    'senior_citizen':  np.random.randint(0, 2, n),
    'contract_enc':    np.random.randint(0, 3, n),  # 0=month, 1=1yr, 2=2yr
})
# Churn depends on contract, tenure, charges
df['churn'] = ((df['contract_enc'] == 0) &
               (df['monthly_charges'] > 70) &
               (df['tenure'] < 12)).astype(int)
df.loc[np.random.choice(n, 200), 'churn'] = 1  # add noise

X = df.drop('churn', axis=1)
y = df['churn']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ALWAYS scale for neural networks
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('nn', MLPClassifier(
        hidden_layer_sizes=(64, 32, 16),  # 3 hidden layers
        activation='relu',
        solver='adam',         # adaptive learning rate optimizer
        alpha=0.001,           # L2 regularization strength
        batch_size=32,
        learning_rate_init=0.001,
        max_iter=500,
        early_stopping=True,   # monitor validation, stop when plateau
        validation_fraction=0.1,
        n_iter_no_change=15,
        random_state=42,
        verbose=False
    ))
])

pipeline.fit(X_train, y_train)

# Evaluation
preds = pipeline.predict(X_test)
probs = pipeline.predict_proba(X_test)[:, 1]

print(classification_report(y_test, preds, target_names=['Stay','Churn']))
print(f"AUC-ROC: {roc_auc_score(y_test, probs):.3f}")
print(f"Converged after {pipeline.named_steps['nn'].n_iter_} epochs")`}</Block>

      <LH>7. Hyperparameters — what to tune and how</LH>
      <Block label="Hyperparameter guide">{`from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('nn', MLPClassifier(random_state=42, max_iter=300))
])

# Key hyperparameters to tune
param_grid = {
    'nn__hidden_layer_sizes': [
        (64,),           # 1 layer, 64 neurons — start here
        (64, 32),        # 2 layers — usually better
        (128, 64, 32),   # 3 layers — more capacity
    ],
    'nn__alpha': [0.0001, 0.001, 0.01],  # L2 regularization
    'nn__learning_rate_init': [0.001, 0.01],
}

grid = GridSearchCV(pipeline, param_grid, cv=5,
                    scoring='roc_auc', n_jobs=-1, verbose=1)
grid.fit(X_train, y_train)

print(f"Best AUC:    {grid.best_score_:.3f}")
print(f"Best params: {grid.best_params_}")

# ── What each hyperparameter does ──
# hidden_layer_sizes: architecture — start simple, add if underfitting
# alpha: L2 regularization — increase if overfitting
# learning_rate_init: step size — 0.001 is usually safe
# batch_size: samples per gradient update — larger = smoother, faster
# early_stopping: ALWAYS True — prevents overfitting automatically`}</Block>

      <LH>8. Diagnosing Training Problems</LH>
      <Compare items={[
        {label:"Overfitting", color:"#f28b82", text:"Train loss low, val loss high. Fix: increase alpha (L2), reduce hidden_layer_sizes, add more training data, use early_stopping."},
        {label:"Underfitting", color:"#f7c96e", text:"Both losses high. Fix: increase hidden_layer_sizes, add layers, reduce alpha, train longer (increase max_iter)."},
        {label:"Not converging", color:"#7eb8f7", text:"Loss oscillates or explodes. Fix: reduce learning_rate_init, increase batch_size, check data for NaN/infinite values."},
        {label:"Slow training", color:"#6dd6a0", text:"Takes too many epochs. Fix: increase learning_rate_init slightly, use larger batch_size, check if features are scaled."},
      ]}/>
      <Block label="Monitoring convergence">{`import matplotlib.pyplot as plt
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)

mlp = MLPClassifier(
    hidden_layer_sizes=(64, 32),
    max_iter=500,
    early_stopping=True,
    validation_fraction=0.1,
    random_state=42,
    verbose=False
)
mlp.fit(X_train_s, y_train)

# Plot learning curve
plt.figure(figsize=(10, 4))
plt.plot(mlp.loss_curve_, label='Training Loss', color='#818cf8')
if mlp.validation_scores_:
    # validation_scores_ is accuracy, not loss
    plt.plot(mlp.validation_scores_, label='Val Accuracy', color='#6dd6a0')
plt.xlabel('Epoch')
plt.ylabel('Loss / Score')
plt.title('Learning Curve')
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()

print(f"Best validation score: {max(mlp.validation_scores_):.3f}")
print(f"Stopped at epoch: {mlp.n_iter_}")`}</Block>

      <LH>9. Neural Networks vs Tree Models — when to use each</LH>
      <Compare items={[
        {label:"Use Neural Networks when", color:"#818cf8", text:"Unstructured data (images, text, audio). Very large datasets (100k+ rows). Complex non-linear patterns. Many input features with interactions."},
        {label:"Use XGBoost/RF when", color:"#6dd6a0", text:"Tabular structured data. Smaller datasets (<100k rows). You need feature importance. Faster training and tuning needed. Interpretability matters."},
        {label:"In practice for tabular data", color:"#f7c96e", text:"Try XGBoost first — it usually wins on tabular data. Add a neural net as comparison. Ensemble both if you care about every 0.1% of performance."},
      ]}/>

      <Quiz questions={[
        {q:"A neuron computes: z = dot(inputs, weights) + bias, then applies activation. What is the purpose of the bias term?",options:["It scales the inputs","It allows the activation to shift left or right — the neuron can fire even when all inputs are zero","It prevents overfitting","It speeds up training"],answer:"It allows the activation to shift left or right — the neuron can fire even when all inputs are zero",explanation:"Without bias, the neuron's output is always 0 when inputs are 0. Bias gives the neuron an independent offset — it can activate at any input level. Like the y-intercept in linear regression, it adds flexibility to the model."},
        {q:"Why does ReLU help with the vanishing gradient problem compared to sigmoid?",options:["ReLU is always between 0 and 1","ReLU's derivative is 0 or 1 — gradients don't shrink as they backpropagate through many layers","ReLU is faster to compute","ReLU prevents overfitting"],answer:"ReLU's derivative is 0 or 1 — gradients don't shrink as they backpropagate through many layers",explanation:"Sigmoid's derivative is at most 0.25. In deep networks, multiplying many small gradients together (chain rule) causes them to vanish. ReLU's derivative is 1 for positive values — gradients pass through unchanged, enabling training of deep networks."},
        {q:"hidden_layer_sizes=(128, 64, 32) creates:",options:["1 layer with 224 neurons","3 hidden layers with 128, 64, and 32 neurons respectively","3 layers each with 128 neurons","128 input, 64 hidden, 32 output neurons"],answer:"3 hidden layers with 128, 64, and 32 neurons respectively",explanation:"Each tuple element defines one hidden layer and the number of neurons in it. (128, 64, 32) = three hidden layers: first has 128 neurons, second has 64, third has 32. The input and output layer sizes are determined by your data."},
        {q:"Training loss = 0.08, validation loss = 0.52 after 100 epochs. What's happening and how do you fix it?",options:["Underfitting — add more layers","Overfitting — increase alpha regularization, reduce architecture complexity","Normal — this gap is expected","Learning rate too high — reduce it"],answer:"Overfitting — increase alpha regularization, reduce architecture complexity",explanation:"Large gap between train and validation loss = overfitting. The model memorized training data including noise. Fixes: increase alpha (L2 regularization), use early_stopping=True, reduce hidden_layer_sizes, get more training data."},
        {q:"You're building a churn predictor on a 50,000-row tabular dataset. Which should you try first?",options:["Deep neural network with 10 layers","Convolutional neural network","XGBoost or Random Forest","BERT fine-tuning"],answer:"XGBoost or Random Forest",explanation:"For tabular structured data, gradient boosting (XGBoost/LightGBM) and random forests consistently outperform neural networks. They're faster to train, easier to tune, and more interpretable. Use neural networks when you have unstructured data (images, text) or very large datasets where their capacity advantage shows."},
      ]}/>

      <CodeExercise
        title="Train and evaluate a neural network on customer data"
        description="Build an MLPClassifier pipeline with StandardScaler. Use hidden_layer_sizes=(64, 32), early_stopping=True. Train on the data, print the classification report and AUC-ROC score."
        starterCode={`from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.datasets import make_classification
import numpy as np

np.random.seed(42)
X, y = make_classification(
    n_samples=800, n_features=8, n_informative=5,
    n_redundant=1, weights=[0.7, 0.3], random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipeline = Pipeline([
    ('scaler', ___()),
    ('nn', MLPClassifier(
        hidden_layer_sizes=(___),
        activation='relu',
        max_iter=300,
        early_stopping=___,
        random_state=42
    ))
])

pipeline.___(X_train, y_train)

preds = pipeline.___(X_test)
probs = pipeline.predict_proba(X_test)[:, 1]

print(classification_report(y_test, preds, target_names=['Stay','Churn']))
print(f"AUC-ROC: {round(roc_auc_score(y_test, probs), 3)}")
print(f"Epochs:  {pipeline.named_steps['nn'].n_iter_}")`}
        hint="StandardScaler(). (64,32). early_stopping=True. pipeline.fit(). pipeline.predict()."
        validate={(out)=>out.includes("AUC-ROC:")&&out.includes("Epochs:")&&out.includes("precision")}
      />
    </div>
  )},
  // ── NLP & TRANSFORMERS
  {id:"dl-nlp-lesson", phase:"🧠 Deep Learning", emoji:"📝", color:"#f472b6", title:"NLP & Transformers", subtitle:"From raw text to predictions — the full pipeline",
   body:()=>(
    <div>
      <LP>Natural Language Processing is the fastest-growing area of data science. Every company with text data — customer reviews, support tickets, social media, legal documents — needs NLP. This lesson takes you from raw messy text all the way to a fine-tuned transformer model, covering every step a real data scientist encounters.</LP>
      <Callout icon="🧠" color="#f472b6" title="The modern NLP stack">2018: Word2Vec embeddings + custom models. 2020: Fine-tune BERT on your task. 2024: Prompt pretrained LLMs, or fine-tune smaller models (DistilBERT) for production. Knowing the full evolution helps you choose the right tool.</Callout>

      <LH>1. Text Cleaning — the foundation of every NLP pipeline</LH>
      <LP>Raw text from the real world is noisy. URLs, HTML tags, punctuation, inconsistent casing, emojis — all of these need handling before any model sees the data. Garbage in, garbage out applies especially to NLP.</LP>
      <Block label="Production text cleaning pipeline">{`import re
import string
import unicodedata

def clean_text(text, 
               lowercase=True,
               remove_urls=True,
               remove_html=True,
               remove_punctuation=True,
               normalize_unicode=True):
    """
    Production-ready text cleaning function.
    Call this on every text sample before any vectorization.
    """
    if not isinstance(text, str):
        return ""

    # Normalize unicode (fix encoding issues)
    if normalize_unicode:
        text = unicodedata.normalize('NFKD', text)

    # Lowercase
    if lowercase:
        text = text.lower()

    # Remove URLs (http, https, www)
    if remove_urls:
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

    # Remove HTML tags
    if remove_html:
        text = re.sub(r'<.*?>', '', text)

    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)

    # Remove punctuation
    if remove_punctuation:
        text = text.translate(str.maketrans('', '', string.punctuation))

    # Remove extra whitespace (tabs, newlines, multiple spaces)
    text = ' '.join(text.split())

    return text.strip()

# Test on realistic messy data
samples = [
    "Check out https://example.com! This product is AMAZING!! 🔥 #bestever",
    "<p>Terrible quality.</p> Would NOT recommend. Cost me $200!!!",
    "Great service   lots of spaces and\nnewlines\there",
    None,  # handle None gracefully
]

for s in samples:
    print(repr(clean_text(s)))`}</Block>

      <LH>2. Tokenization and Stopword Removal</LH>
      <Block label="From string to tokens">{`import re
from collections import Counter

# Simple tokenization without NLTK (works anywhere)
def simple_tokenize(text):
    """Split on non-alphanumeric characters."""
    return re.findall(r'\b[a-z]+\b', text.lower())

# Common English stopwords (no library needed)
STOPWORDS = {
    'i','me','my','myself','we','our','you','your','he','she','it',
    'is','was','are','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might',
    'a','an','the','and','but','or','nor','for','yet','so',
    'in','on','at','to','of','with','by','from','as','into',
    'this','that','these','those','not','no','nor','what','which','who',
}

def tokenize_and_clean(text):
    tokens = simple_tokenize(clean_text(text))
    return [t for t in tokens if t not in STOPWORDS and len(t) > 2]

# Test
review = "This product is absolutely terrible! I would never buy it again."
tokens = tokenize_and_clean(review)
print("Tokens:", tokens)
# ['product', 'absolutely', 'terrible', 'never', 'buy', 'again']

# Vocabulary analysis
corpus = [
    "amazing product love it",
    "terrible quality never again",
    "great value highly recommend",
    "broken arrived disappointed",
]
all_tokens = [t for text in corpus for t in tokenize_and_clean(text)]
vocab = Counter(all_tokens)
print("Most common:", vocab.most_common(5))`}</Block>

      <LH>3. TF-IDF — the go-to baseline for text classification</LH>
      <LP>TF-IDF (Term Frequency–Inverse Document Frequency) converts text into numerical vectors. Words that appear often in one document but rarely across all documents get high scores — they're informative. Common words like "the" get low scores.</LP>
      <Block label="TF-IDF math and implementation">{`import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# The math:
# TF(word, doc) = count of word in doc / total words in doc
# IDF(word) = log(total docs / docs containing word)
# TF-IDF = TF × IDF

corpus = [
    "machine learning model training data",
    "deep learning neural network training",
    "data science python pandas numpy",
    "machine learning data analysis",
]

# sklearn TF-IDF
vectorizer = TfidfVectorizer(
    max_features=1000,      # keep top 1000 terms by TF-IDF score
    ngram_range=(1, 2),     # unigrams AND bigrams: "machine", "machine learning"
    min_df=1,               # ignore terms in fewer than N docs
    max_df=0.95,            # ignore terms in more than 95% of docs (too common)
    sublinear_tf=True,      # replace TF with 1+log(TF) — dampens very frequent words
    strip_accents='unicode',
)

X = vectorizer.fit_transform(corpus)
print(f"Matrix shape: {X.shape}")  # (4 docs, N terms)

# Most important terms per document
feature_names = vectorizer.get_feature_names_out()
for i, doc in enumerate(corpus):
    row = X[i].toarray()[0]
    top_terms = sorted(zip(feature_names, row), key=lambda x: -x[1])[:3]
    print(f"Doc {i}: {top_terms}")`}</Block>
      <Tip>ngram_range=(1,2) captures phrases like "machine learning" as single features, not just individual words. This dramatically improves accuracy for sentiment analysis — "not good" would be split into "not" and "good" with unigrams, losing the negation.</Tip>

      <LH>4. Full Text Classification Pipeline</LH>
      <Block label="Production NLP pipeline — sentiment classification">{`import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score

# Dataset
reviews = [
    "absolutely love this product amazing quality build",
    "terrible waste of money broke in two days",
    "great customer service highly recommend to everyone",
    "very disappointed quality not as described in listing",
    "exceeded all my expectations works perfectly fantastic",
    "poor quality fell apart after one week of use",
    "best purchase I have ever made outstanding product",
    "complete garbage do not buy return immediately",
    "shipping was fast product is exactly as described",
    "horrible experience customer service ignored my complaint",
    "five stars this item is exactly what I needed",
    "one star avoid this seller at all costs",
    "works as advertised great price for the quality",
    "broken on arrival packaging was also damaged",
    "really happy with this purchase will buy again",
    "total scam product looks nothing like the picture",
]
labels = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]

X_train, X_test, y_train, y_test = train_test_split(
    reviews, labels, test_size=0.25, random_state=42, stratify=labels
)

# ── Model 1: TF-IDF + Logistic Regression (always start here)
lr_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1,2), sublinear_tf=True)),
    ('clf',   LogisticRegression(C=1.0, max_iter=1000, random_state=42))
])

lr_pipeline.fit(X_train, y_train)
lr_preds = lr_pipeline.predict(X_test)
lr_probs = lr_pipeline.predict_proba(X_test)[:,1]

print("=== Logistic Regression ===")
print(classification_report(y_test, lr_preds, target_names=['Negative','Positive']))

# Cross-validation for honest estimate
cv_scores = cross_val_score(lr_pipeline, reviews, labels, cv=4, scoring='f1')
print(f"CV F1: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

# Predict new reviews
new = [
    "this is an outstanding product I love it",
    "completely broken and useless waste of money"
]
predictions = lr_pipeline.predict(new)
probabilities = lr_pipeline.predict_proba(new)[:,1]
for text, pred, prob in zip(new, predictions, probabilities):
    label = "Positive" if pred==1 else "Negative"
    print(f"{label} ({prob:.1%}): {text[:40]}...")`}</Block>

      <LH>5. Word Embeddings — giving words meaning</LH>
      <LP>TF-IDF treats words as independent symbols. Embeddings capture meaning — "good" and "excellent" have similar vectors. This semantic understanding dramatically improves performance on complex tasks.</LP>
      <Block label="Word embeddings concept and usage">{`import numpy as np

# Word2Vec intuition (trained on billions of words)
# Each word → dense vector of 50-300 numbers
# Similar words → similar vectors

# Classic examples of embedding arithmetic:
# king - man + woman ≈ queen
# paris - france + italy ≈ rome

# In practice: use pretrained embeddings
# Option 1: sklearn (TF-IDF) — no embeddings, bag of words
# Option 2: gensim Word2Vec — train on your corpus
# Option 3: spaCy pretrained embeddings — good for small datasets
# Option 4: Hugging Face sentence-transformers — best quality

# Sentence-transformers: convert whole sentences to vectors
# pip install sentence-transformers

# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer('all-MiniLM-L6-v2')  # fast, good quality
# sentences = ["I love this product", "Terrible quality"]
# embeddings = model.encode(sentences)
# print(embeddings.shape)  # (2, 384) — 384-dimensional vectors

# Cosine similarity — measure semantic closeness
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Simulated: "amazing" and "excellent" should be similar
amazing   = np.random.randn(384); amazing  /= np.linalg.norm(amazing)
excellent = amazing + np.random.randn(384)*0.3  # similar
terrible  = np.random.randn(384); terrible /= np.linalg.norm(terrible)

print(f"amazing vs excellent: {cosine_similarity(amazing, excellent):.3f}")  # high
print(f"amazing vs terrible:  {cosine_similarity(amazing, terrible):.3f}")   # low`}</Block>

      <LH>6. Transformers — the architecture that changed everything</LH>
      <div style={{display:"grid",gap:8,margin:"12px 0"}}>
        {[
          {n:"01",color:"#7eb8f7",title:"Attention Mechanism",desc:"Each token computes how much it should 'attend' to every other token. 'bank' in 'river bank' attends strongly to 'river', not 'money'. This context-sensitivity is the breakthrough."},
          {n:"02",color:"#f472b6",title:"Self-Attention (Multi-Head)",desc:"Multiple attention heads run in parallel, each capturing different types of relationships — syntax, semantics, coreference. Outputs are concatenated and projected."},
          {n:"03",color:"#6dd6a0",title:"Positional Encoding",desc:"Transformers process all tokens in parallel (unlike RNNs which process sequentially). Positional encoding adds position information so the model knows token order."},
          {n:"04",color:"#f7c96e",title:"Pretraining on Massive Data",desc:"BERT trained on all of Wikipedia + BooksCorpus. GPT-3 on 570GB of text. This pretraining builds deep language understanding — grammar, facts, reasoning."},
          {n:"05",color:"#c792ea",title:"Fine-tuning for Your Task",desc:"Transfer the pretrained knowledge to your task with a small labeled dataset. 1000 labeled examples + fine-tuned BERT often beats 100k examples + custom model."},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:s.color+"22",border:`1px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:10,color:s.color,fontWeight:700}}>{s.n}</div>
            <div><div style={{color:s.color,fontWeight:700,fontSize:13,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
          </div>
        ))}
      </div>

      <LH>7. Hugging Face — using pretrained models</LH>
      <Block label="Zero-shot, few-shot, and fine-tuning">{`from transformers import pipeline as hf_pipeline

# ── ZERO-SHOT: No training at all
# Use when you have no labeled data
classifier = hf_pipeline("sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english")
results = classifier([
    "This product is absolutely fantastic!",
    "Terrible quality, complete waste of money.",
    "It's okay, nothing special."
])
for r in results:
    print(f"{r['label']} ({r['score']:.1%})")

# ── ZERO-SHOT CLASSIFICATION: classify into custom labels
zero_shot = hf_pipeline("zero-shot-classification")
text = "The quarterly revenue grew by 23% driven by cloud services"
result = zero_shot(text, candidate_labels=["finance","technology","healthcare","sports"])
for label, score in zip(result['labels'], result['scores']):
    print(f"{label}: {score:.1%}")

# ── NAMED ENTITY RECOGNITION: extract entities
ner = hf_pipeline("ner", grouped_entities=True)
text = "Apple Inc. CEO Tim Cook announced new products in California."
entities = ner(text)
for e in entities:
    print(f"{e['entity_group']}: {e['word']} ({e['score']:.1%})")`}</Block>
      <Block label="Fine-tuning DistilBERT on your data">{`from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer
)
from datasets import Dataset
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

# Your labeled data
texts  = ["Amazing product!", "Terrible quality", "Love it", "Hate it",
          "Best purchase ever", "Complete waste", "Highly recommend",
          "Would not buy again"]
labels = [1, 0, 1, 0, 1, 0, 1, 0]

# Load tokenizer and model
model_name = "distilbert-base-uncased"
tokenizer  = AutoTokenizer.from_pretrained(model_name)
model      = AutoModelForSequenceClassification.from_pretrained(
                 model_name, num_labels=2)

# Tokenize
def tokenize_batch(batch):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=128
    )

# Create HuggingFace Dataset
dataset = Dataset.from_dict({"text": texts, "label": labels})
dataset = dataset.map(tokenize_batch, batched=True)
dataset = dataset.train_test_split(test_size=0.25)

# Training configuration
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds)
    }

args = TrainingArguments(
    output_dir="./distilbert_sentiment",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    compute_metrics=compute_metrics,
)

trainer.train()
results = trainer.evaluate()
print(f"Accuracy: {results['eval_accuracy']:.3f}")
print(f"F1:       {results['eval_f1']:.3f}")`}</Block>

      <LH>8. Evaluation Metrics for NLP</LH>
      <Block label="Choosing the right NLP metric">{`from sklearn.metrics import (
    f1_score, precision_score, recall_score,
    classification_report, roc_auc_score
)
import numpy as np

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 1, 0, 0, 1, 1, 0, 1, 0]

# F1 — harmonic mean of precision and recall
# macro: equal weight per class — use for balanced classes
# weighted: weight by support — use for imbalanced classes
# binary: for binary classification
print(f"F1 macro:    {f1_score(y_true, y_pred, average='macro'):.3f}")
print(f"F1 weighted: {f1_score(y_true, y_pred, average='weighted'):.3f}")
print(f"F1 binary:   {f1_score(y_true, y_pred, average='binary'):.3f}")

# Full classification report
print(classification_report(y_true, y_pred,
      target_names=['Negative', 'Positive']))

# For text generation (summarization, translation):
# BLEU — n-gram precision overlap with reference
# ROUGE — recall-oriented, common for summarization
# Perplexity — model's surprise at test text, lower is better

# Decision guide:
# Sentiment classification → F1 (weighted if imbalanced)
# Spam detection → Recall (missing spam is costly)
# Translation → BLEU score
# Summarization → ROUGE score
# Topic modeling → coherence score`}</Block>

      <Quiz questions={[
        {q:"TF-IDF gives 'the' a very low score because:",options:["It's a short word","It appears in almost every document — IDF penalizes common words","TF-IDF ignores articles","It's not in the vocabulary"],answer:"It appears in almost every document — IDF penalizes common words",explanation:"IDF = log(total docs / docs containing word). 'The' appears in nearly every document, so IDF ≈ log(1) = 0. TF-IDF = TF × IDF ≈ 0 for 'the'. Rare but informative words get high IDF scores."},
        {q:"ngram_range=(1,2) in TfidfVectorizer means:",options:["Use words of length 1 to 2 characters","Include both single words AND two-word phrases as features","Process 1 to 2 documents at a time","Maximum 2 words per sentence"],answer:"Include both single words AND two-word phrases as features",explanation:"n-grams are contiguous word sequences. ngram_range=(1,2) includes unigrams ('machine','learning') and bigrams ('machine learning'). Bigrams capture meaning lost when words are split — 'not good' vs 'good'."},
        {q:"BERT produces contextual embeddings. This means:",options:["BERT can only process context windows of fixed size","The same word gets different vector representations depending on surrounding context","BERT embeddings are always 768 dimensions","Contextual means the model reads left-to-right"],answer:"The same word gets different vector representations depending on surrounding context",explanation:"In 'river bank' vs 'bank account', BERT gives 'bank' completely different vectors because it reads all surrounding tokens via attention. Word2Vec gives 'bank' one fixed vector regardless of context — losing this crucial disambiguation."},
        {q:"You have 500 labeled customer support tickets. Best approach?",options:["Train BERT from scratch","Fine-tune DistilBERT (much smaller than BERT, faster to fine-tune)","TF-IDF + Logistic Regression baseline first, then upgrade if needed","Use GPT-4 API with few-shot prompting"],answer:"TF-IDF + Logistic Regression baseline first, then upgrade if needed",explanation:"Always start simple. TF-IDF + LR is fast, interpretable, and surprisingly strong. With 500 examples it might achieve 85%+ F1. Only if it falls short, fine-tune DistilBERT. Never train transformers from scratch with small data."},
        {q:"F1 macro vs F1 weighted: your dataset has 90% negative and 10% positive reviews. Which should you report?",options:["Always macro","F1 weighted — accounts for class imbalance, reflects real-world performance","They're always the same","F1 binary only for binary tasks"],answer:"F1 weighted — accounts for class imbalance, reflects real-world performance",explanation:"F1 macro gives equal weight to each class — 10% positive class counts as much as 90% negative. For imbalanced data this overweights the rare class. F1 weighted weights by support (class frequency), reflecting how the model actually performs in production where 90% of cases are negative."},
      ]}/>

      <CodeExercise
        title="Build a complete NLP classification pipeline"
        description="Build a TF-IDF + LogisticRegression pipeline for sentiment classification. Tune the TF-IDF with ngram_range=(1,2) and sublinear_tf=True. Evaluate with classification_report and cross-validation."
        starterCode={`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report

train_texts = [
    "absolutely love this amazing high quality product",
    "terrible waste of money broke immediately do not buy",
    "great customer service fast shipping highly recommend",
    "very disappointed quality nothing like advertised",
    "exceeded all expectations works perfectly fantastic build",
    "poor quality material fell apart after one week",
    "best purchase ever made outstanding value for price",
    "complete garbage avoid this seller at all costs",
    "shipping fast product exactly as described happy",
    "horrible customer service ignored all my emails",
    "five stars perfect item exactly what I needed",
    "one star avoid broken arrived damaged packaging",
]
labels = [1,0,1,0,1,0,1,0,1,0,1,0]

X_train, X_test, y_train, y_test = train_test_split(
    train_texts, labels, test_size=0.25, random_state=42, stratify=labels
)

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=___,
        ngram_range=___,
        sublinear_tf=___
    )),
    ('clf', LogisticRegression(C=___, max_iter=1000, random_state=42))
])

pipeline.fit(X_train, y_train)
preds = pipeline.predict(X_test)
print(classification_report(y_test, preds, target_names=['Negative','Positive'],
                             zero_division=0))

cv = cross_val_score(pipeline, train_texts, labels, cv=3, scoring='f1')
print(f"CV F1: {round(cv.mean(),3)} ± {round(cv.std(),3)}")`}
        hint="max_features=5000. ngram_range=(1,2). sublinear_tf=True. C=1.0."
        validate={(out)=>out.includes("Negative")&&out.includes("Positive")&&out.includes("CV F1:")}
      />
    </div>
  )},
  // ── LLMs & RAG
  {id:"llm-lesson", phase:"🧠 Deep Learning", emoji:"🤖", color:"#34d399", title:"LLMs & RAG", subtitle:"Build production AI apps that work with your own data",
   body:()=>(
    <div>
      <LP>Large Language Models have fundamentally changed what's possible in data science and software engineering. Every company is either building with LLMs or getting left behind. This lesson teaches you to build real LLM-powered applications — not just prompt ChatGPT, but engineer systems that connect language models to your databases, documents, and workflows.</LP>
      <Callout icon="🧠" color="#34d399" title="The real skill gap">Everyone can use ChatGPT. Companies pay premium salaries for engineers who can build reliable, production-ready LLM systems — RAG pipelines, tool-using agents, evaluation frameworks, cost optimization. That's what this lesson teaches.</Callout>

      <LH>1. How LLMs Work — the essential intuition</LH>
      <div style={{display:"grid",gap:8,margin:"12px 0"}}>
        {[
          {n:"01",color:"#7eb8f7",title:"Tokenization",desc:"Text is split into tokens (roughly word-pieces). 'unhappiness' → ['un','happiness']. GPT-4 costs per token. 1000 tokens ≈ 750 words. Context limits (8k, 128k, 1M tokens) define how much the model 'remembers'."},
          {n:"02",color:"#34d399",title:"Self-Attention — reading everything at once",desc:"Unlike humans who read left-to-right, transformers process all tokens simultaneously. Each token computes how much it should attend to every other token. 'bank' reads 'river' and 'account' in context to resolve its meaning."},
          {n:"03",color:"#f7c96e",title:"Next-Token Prediction",desc:"LLMs are trained on one objective: predict the next token given all previous tokens. Do this on trillions of tokens and the model learns grammar, facts, reasoning, and even coding. The simplest task that produces the richest emergent capabilities."},
          {n:"04",color:"#c792ea",title:"Instruction Tuning + RLHF",desc:"Base models just complete text. GPT-4 and Claude are then fine-tuned to follow instructions (supervised fine-tuning) and reinforced with human feedback to be helpful, harmless, and honest. This transforms text completors into AI assistants."},
          {n:"05",color:"#f472b6",title:"Emergent Capabilities",desc:"At sufficient scale, LLMs develop capabilities not explicitly trained: multi-step reasoning, code generation, few-shot learning, math, and more. These emerge from scale alone — a key reason larger models keep surprising researchers."},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:s.color+"22",border:`1px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:10,color:s.color,fontWeight:700}}>{s.n}</div>
            <div><div style={{color:s.color,fontWeight:700,fontSize:13,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
          </div>
        ))}
      </div>

      <LH>2. Prompt Engineering — the craft of talking to LLMs</LH>
      <LP>Prompt engineering is the skill of communicating with LLMs to get reliable, high-quality outputs. Good prompts dramatically outperform bad prompts on the same model.</LP>
      <Block label="The 4 essential prompt patterns">{`import os

# ── PATTERN 1: System prompt + user message
# System prompt sets the persona and constraints
# User message is the actual task
messages_1 = [
    {
        "role": "system",
        "content": (
            "You are a senior data scientist with 10 years of experience. "
            "Give concise, technically accurate answers. "
            "When giving code, use Python with sklearn. "
            "Always mention trade-offs and failure modes."
        )
    },
    {
        "role": "user",
        "content": "When should I use Random Forest vs XGBoost?"
    }
]

# ── PATTERN 2: Few-shot prompting
# Show examples of input → expected output format
few_shot_prompt = """Classify customer support tickets into categories.

Examples:
Ticket: "My order hasn't arrived after 2 weeks"
Category: SHIPPING

Ticket: "The app crashes every time I open it"  
Category: TECHNICAL

Ticket: "I was charged twice for the same order"
Category: BILLING

Now classify:
Ticket: "I can't log into my account, password reset isn't working"
Category:"""

# ── PATTERN 3: Chain of Thought (CoT)
# Tell the model to reason step by step before answering
cot_prompt = """Analyze this sales data and recommend an action.
Think step by step:
1. What changed compared to last period?
2. What's the most likely root cause?
3. What's the recommended action and why?
4. What would you monitor to verify the fix?

Data:
- Monthly revenue: $1.2M (down 23% vs last month)
- New signups: 450 (flat vs last month)  
- Churn rate: 8.3% (up from 5.1% last month)
- Average order value: $267 (down 4%)
- Support tickets: up 340% (mostly about feature X being removed)

Analysis:"""

# ── PATTERN 4: Structured output
# Force JSON output for programmatic use
structured_prompt = """Extract information from this customer complaint.
Return ONLY valid JSON with these exact keys:
{
    "issue_type": "billing|technical|shipping|product|other",
    "severity": 1-5,
    "sentiment": "positive|neutral|negative",
    "requires_escalation": true|false,
    "summary": "one sentence summary"
}

No preamble, no explanation. JSON only.

Complaint: "I've been charged $299 three times this month for a subscription 
that should be $99. I've called support 4 times and no one has resolved it. 
This is completely unacceptable. I'm considering disputing all charges with 
my credit card company and filing a complaint with the BBB."
"""`}</Block>

      <LH>3. Calling LLM APIs in Python</LH>
      <Block label="OpenAI and Anthropic API patterns">{`import os
import json

# ── OpenAI API
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def call_gpt(prompt, system="You are a helpful data scientist.", 
             model="gpt-4o-mini", temperature=0.1):
    """
    temperature: 0=deterministic, 1=creative. 
    Use 0-0.3 for analysis tasks, 0.7-1.0 for creative tasks.
    """
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt}
        ],
        temperature=temperature,
        max_tokens=1000,
    )
    return response.choices[0].message.content

# ── Structured JSON output (OpenAI)
def extract_structured(text):
    prompt = f"""Extract from this text as JSON with keys:
    issue, severity (1-5), department
    
    Text: {text}
    JSON only:"""
    
    raw = call_gpt(prompt, temperature=0)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: find JSON in response
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        return json.loads(match.group()) if match else {}

# ── Cost estimation before you run
# gpt-4o-mini: ~$0.15/1M input tokens, $0.60/1M output tokens
# gpt-4o:     ~$5/1M input tokens, $15/1M output tokens
# Estimate tokens: len(text.split()) * 1.33 ≈ tokens

def estimate_cost(prompt, model="gpt-4o-mini"):
    tokens = len(prompt.split()) * 1.33
    if "mini" in model:
        cost = (tokens / 1_000_000) * 0.15
    else:
        cost = (tokens / 1_000_000) * 5
    print(f"Estimated input cost: {cost:.6f}")`}</Block>

      <LH>4. RAG — Retrieval-Augmented Generation</LH>
      <LP>RAG is the most important LLM architecture pattern for production systems. It solves the core problem: LLMs only know what was in their training data. RAG lets you give the model access to YOUR documents, databases, and real-time information — at query time, not training time.</LP>
      <Block label="Why RAG beats fine-tuning for most cases">{`# ── THE PROBLEM ──
# User: "What is our refund policy for enterprise customers?"
# LLM without RAG: "I don't have information about your specific policies."
# LLM with RAG:  *retrieves relevant policy doc* → "Based on your enterprise 
#                agreement, enterprise customers can request refunds within 90 days..."

# ── RAG vs FINE-TUNING ──
# Fine-tuning:
#   ✓ Fast inference (knowledge in weights)
#   ✗ Expensive: $500-5000+ per training run
#   ✗ Knowledge is frozen at training time
#   ✗ Need to retrain when info changes
#   ✗ Can hallucinate "trained" information
#   → Use for: style transfer, domain-specific reasoning

# RAG:
#   ✓ Free to update (just add new docs)
#   ✓ Citable: can show source documents
#   ✓ No hallucinations about document content
#   ✓ Works with any LLM
#   ✗ Slower (retrieval adds latency)
#   ✗ Quality depends on retrieval quality
#   → Use for: document Q&A, knowledge bases, support bots

# RAG wins for: FAQ bots, document search, knowledge management
# Fine-tuning wins for: consistent tone/style, specialized reasoning`}</Block>

      <LH>5. Building a RAG Pipeline from Scratch</LH>
      <Block label="Complete RAG implementation">{`import numpy as np
from typing import List, Tuple

class SimpleRAG:
    """
    A complete RAG pipeline without external dependencies.
    In production: use LangChain + FAISS + OpenAI embeddings.
    """
    
    def __init__(self, embedding_dim=64):
        self.documents = []
        self.embeddings = []
        self.embedding_dim = embedding_dim
        np.random.seed(42)
    
    def _embed(self, text: str) -> np.ndarray:
        """
        Simulate text embedding.
        In production: use SentenceTransformer or OpenAI embeddings.
        Real embeddings: all-MiniLM-L6-v2 (384d, fast)
                        text-embedding-3-small (1536d, OpenAI)
        """
        # Deterministic hash-based fake embedding for demo
        words = text.lower().split()
        vec = np.zeros(self.embedding_dim)
        for i, word in enumerate(words):
            np.random.seed(hash(word) % 2**31)
            vec += np.random.randn(self.embedding_dim) / (i + 1)
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec
    
    def add_documents(self, docs: List[str]):
        """Index documents — call once at startup."""
        for doc in docs:
            self.documents.append(doc)
            self.embeddings.append(self._embed(doc))
        self.embeddings = np.array(self.embeddings)
        print(f"Indexed {len(docs)} documents. Ready to query.")
    
    def retrieve(self, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Find most relevant documents using cosine similarity."""
        query_emb = self._embed(query)
        # Cosine similarity: dot product of normalized vectors
        similarities = self.embeddings @ query_emb
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [(self.documents[i], float(similarities[i])) 
                for i in top_indices]
    
    def build_prompt(self, query: str, context_docs: List[str]) -> str:
        """Build the augmented prompt with retrieved context."""
        context = "\n\n".join([f"[Doc {i+1}]: {doc}" 
                               for i, doc in enumerate(context_docs)])
        return f"""You are a helpful assistant. Answer the question based ONLY 
on the provided context. If the answer isn't in the context, say 
"I don't have information about that in the provided documents."

Context:
{context}

Question: {query}

Answer:"""
    
    def query(self, question: str, top_k: int = 3) -> dict:
        """Full RAG pipeline: retrieve + augment + generate."""
        # Step 1: Retrieve relevant documents
        retrieved = self.retrieve(question, top_k=top_k)
        
        # Step 2: Build augmented prompt
        docs = [doc for doc, score in retrieved]
        prompt = self.build_prompt(question, docs)
        
        # Step 3: In production, send to LLM API
        # response = call_gpt(prompt)
        
        return {
            "question":   question,
            "retrieved":  retrieved,
            "prompt":     prompt,
            "answer":     "[Would call LLM API here]"
        }

# Build the RAG system
rag = SimpleRAG()

# Your knowledge base — could be from PDFs, databases, docs
knowledge_base = [
    "ZeroToDS offers a structured data science curriculum from beginner to advanced.",
    "The platform includes Python, SQL, Statistics, Machine Learning, and Deep Learning lessons.",
    "Free accounts get access to the complete Python for Data Science phase with 5 lessons.",
    "The Full Access plan costs $29 per month and includes all 40+ lessons and projects.",
    "The Guided Cohort costs $99 one-time and includes weekly live sessions with the instructor.",
    "Cohort enrollment is limited to 10 students per cohort to ensure personal attention.",
    "Lessons include interactive Python code execution directly in the browser.",
    "The platform tracks your progress and marks roadmap tasks complete as you finish lessons.",
    "Students can message the instructor directly through the platform messaging feature.",
    "The AI Career Coach chatbot is available 24/7 to all enrolled students.",
]

rag.add_documents(knowledge_base)

# Query the system
questions = [
    "How much does the cohort cost?",
    "What is included in the free plan?",
    "How many students per cohort?",
]

for q in questions:
    result = rag.query(q, top_k=2)
    print(f"\nQ: {q}")
    for doc, score in result['retrieved']:
        print(f"  [{score:.3f}] {doc[:70]}...")`}</Block>

      <LH>6. Production RAG with FAISS and LangChain</LH>
      <Block label="Real production stack">{`# pip install langchain faiss-cpu sentence-transformers openai

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os

# ── STEP 1: Load and chunk documents
def load_and_chunk(text: str, chunk_size=500, chunk_overlap=50):
    """
    Chunking strategy matters:
    - Too small: individual chunks lose context
    - Too large: retrieval returns too much irrelevant text
    - 300-700 tokens is usually optimal
    - Overlap helps prevent losing information at chunk boundaries
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.create_documents([text])

# ── STEP 2: Embed and store in FAISS vector database
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
    # Fast, 384-dimensional, good quality for most tasks
    # Alternative: "sentence-transformers/all-mpnet-base-v2" (slower, better)
    # OpenAI alternative: OpenAIEmbeddings() (best quality, costs $)
)

your_documents = "Your company documents, PDFs, knowledge base content here..."
chunks = load_and_chunk(your_documents)

# Build FAISS index — stored in memory, can also save to disk
vectorstore = FAISS.from_documents(chunks, embedding_model)

# ── STEP 3: Set up retrieval chain
retriever = vectorstore.as_retriever(
    search_type="similarity",   # or "mmr" for diversity
    search_kwargs={"k": 4}      # retrieve top 4 chunks
)

# ── STEP 4: Full RAG chain
llm = OpenAI(api_key=os.environ["OPENAI_API_KEY"], 
             model="gpt-4o-mini", temperature=0)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",     # "stuff" = concatenate all docs into prompt
    retriever=retriever,
    return_source_documents=True
)

# ── STEP 5: Query
result = qa_chain({"query": "What is our refund policy?"})
print("Answer:", result["result"])
print("\nSources:")
for doc in result["source_documents"]:
    print(f"  - {doc.page_content[:100]}...")`}</Block>

      <LH>7. LLM Evaluation — measuring output quality</LH>
      <Block label="How to evaluate LLM systems">{`import numpy as np

# ── PROBLEM: LLM output is text, not a single number ──
# You can't just compute accuracy. You need to evaluate:
# 1. Faithfulness: Is the answer grounded in the retrieved docs?
# 2. Answer relevance: Does the answer address the question?
# 3. Context relevance: Did we retrieve the right docs?

# ── PRACTICAL EVALUATION APPROACHES ──

# Approach 1: LLM-as-judge (most common in production)
def llm_judge(question, answer, context, model="gpt-4o-mini"):
    prompt = f"""Rate this RAG system response on a scale of 1-5.

Question: {question}
Retrieved Context: {context}
System Answer: {answer}

Criteria:
- Faithfulness (1-5): Is the answer grounded in the context?
- Relevance (1-5): Does the answer actually address the question?
- Completeness (1-5): Does the answer cover all important points?

Return JSON: {{"faithfulness": N, "relevance": N, "completeness": N, "reasoning": "..."}}
JSON only:"""
    # return call_gpt(prompt, temperature=0)
    return '{"faithfulness":4,"relevance":5,"completeness":3,"reasoning":"Good"}'

# Approach 2: RAGAS framework (automated RAG evaluation)
# pip install ragas
# from ragas import evaluate
# from ragas.metrics import faithfulness, answer_relevancy, context_recall

# Approach 3: Test set with known answers
test_cases = [
    {
        "question": "What does the full access plan cost?",
        "expected_answer": "$29",
        "expected_in_answer": ["29", "$29", "29 per month"]
    },
]

def evaluate_test_set(rag_system, test_cases):
    results = []
    for case in test_cases:
        result = rag_system.query(case["question"])
        # Check if expected answer appears in response
        answer = result.get("answer", "").lower()
        correct = any(exp.lower() in answer 
                      for exp in case["expected_in_answer"])
        results.append({"correct": correct, "question": case["question"]})
    
    accuracy = sum(r["correct"] for r in results) / len(results)
    print(f"Test accuracy: {accuracy:.1%} ({sum(r['correct'] for r in results)}/{len(results)})")
    return results`}</Block>

      <Quiz questions={[
        {q:"A context window of 128k tokens means:",options:["The model can only generate 128k tokens","The model can process up to 128,000 tokens of input + output combined","The model has 128k parameters","Maximum 128k words in training data"],answer:"The model can process up to 128,000 tokens of input + output combined",explanation:"Context window is the maximum sequence length a model can handle in one API call (input + output combined). 128k tokens ≈ 96,000 words ≈ 300 pages. Larger context windows allow more documents in RAG prompts, longer conversations, and bigger codebases."},
        {q:"Chain-of-Thought prompting improves LLM performance on complex tasks by:",options:["Making the model faster","Instructing the model to show its reasoning steps before giving a final answer","Reducing API costs","Using multiple models simultaneously"],answer:"Instructing the model to show its reasoning steps before giving a final answer",explanation:"CoT prompting ('Let's think step by step') dramatically improves accuracy on multi-step reasoning tasks (math, logic, analysis). The model's intermediate reasoning steps catch errors that direct answering would miss. Especially effective for GPT-4 and similar large models."},
        {q:"Chunking strategy in RAG: what is chunk overlap and why does it matter?",options:["The percentage of documents retrieved","Text shared between adjacent chunks to prevent losing context at boundaries","The similarity threshold for retrieval","Number of chunks per document"],answer:"Text shared between adjacent chunks to prevent losing context at boundaries",explanation:"When splitting documents into chunks, a key sentence might fall at a boundary. With overlap=50 tokens, adjacent chunks share 50 tokens. This ensures important context isn't lost when a relevant sentence happens to span a chunk boundary."},
        {q:"Your RAG system returns answers that sound plausible but contradict the source documents. This is called:",options:["Overfitting","Hallucination — the model generates confident-sounding false information","Retrieval failure","Context overflow"],answer:"Hallucination — the model generates confident-sounding false information",explanation:"LLMs can generate fluent, confident text even when it contradicts retrieved documents. Mitigation: explicit 'answer only from context' prompts, faithfulness evaluation, returning source citations, using temperature=0 for factual tasks."},
        {q:"When should you use RAG instead of fine-tuning?",options:["Always use RAG","Always fine-tune","RAG when knowledge changes frequently or you need citations; fine-tune for style/tone/specialized reasoning","Fine-tune for all enterprise applications"],answer:"RAG when knowledge changes frequently or you need citations; fine-tune for style/tone/specialized reasoning",explanation:"RAG excels when: knowledge changes (product catalog, policies), you need to cite sources, you have no labeled training data. Fine-tuning excels when: you need consistent output style, domain-specific reasoning patterns, high-volume inference where RAG latency is costly."},
      ]}/>

      <CodeExercise
        title="Build and query a RAG pipeline"
        description="Complete the RAG system: implement the retrieve method to find the top-k most similar documents using cosine similarity, then use it to answer a question."
        starterCode={`import numpy as np

class MiniRAG:
    def __init__(self):
        self.documents = []
        self.embeddings = []
    
    def _embed(self, text):
        """Fake embedder — returns deterministic vector based on word hash."""
        words = text.lower().split()
        vec = np.zeros(32)
        for i, w in enumerate(words):
            np.random.seed(abs(hash(w)) % 10000)
            vec += np.random.randn(32) * (1/(i+1))
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec
    
    def add(self, docs):
        self.documents = docs
        self.embeddings = np.array([self._embed(d) for d in docs])
    
    def retrieve(self, query, top_k=2):
        q_emb = self._embed(___)
        # Cosine similarity = dot product of normalized vectors
        sims = self.embeddings @ ___
        top_idx = np.argsort(sims)[___][::-1]  # top_k highest
        return [(self.documents[i], float(sims[i])) for i in top_idx]

rag = MiniRAG()
rag.add([
    "Python is the most popular language for data science and machine learning.",
    "SQL is required in over 80 percent of data science job postings worldwide.",
    "The average data scientist salary in the US is around 120000 dollars per year.",
    "Neural networks are the foundation of deep learning and modern AI systems.",
    "Feature engineering often has more impact on model performance than algorithm choice.",
])

results = rag.retrieve("What salary does a data scientist earn?", top_k=___)
print("Query: What salary does a data scientist earn?")
for doc, score in results:
    print(f"  [{score:.3f}] {doc}")`}
        hint="self._embed(query). q_emb after computing it. [-top_k:] to get top_k indices. top_k=2."
        validate={(out)=>out.includes("Query:")&&out.includes("salary")&&out.includes("0.")}
      />
    </div>
  )},
  // ── MLOPS
  {id:"mlops-lesson", phase:"🚀 MLOps", emoji:"⚙️", color:"#fb923c", title:"MLOps — From Notebook to Production", subtitle:"FastAPI, Docker, monitoring, and CI/CD — make your model live",
   body:()=>(
    <div>
      <LP>Training a model is 20% of the work. Getting it into production — where real users interact with it reliably, at scale, with monitoring and automatic retraining — is the other 80%. MLOps is the discipline that bridges the gap between a Jupyter notebook and a production system. This is what companies actually pay for.</LP>
      <Callout icon="🧠" color="#fb923c" title="The career differentiator">'I deployed this model, here's the live API endpoint, here are the monitoring metrics, and here's the alert system for when it degrades' — almost no junior candidates can say this. It instantly sets you apart.</Callout>

      <LH>1. The ML Production Gap — why notebooks aren't enough</LH>
      <Compare items={[
        {label:"Notebook (Research)", color:"#f28b82", text:"Runs once. Interactive. Cells run out of order. Data loaded manually. No error handling. Not reproducible. Can't serve predictions."},
        {label:"Production System", color:"#6dd6a0", text:"Runs continuously. Automated. Handles bad inputs. Reproducible anywhere. Serves 1000s of predictions/second. Monitored. Auto-alerts on failures."},
        {label:"The Gap", color:"#f7c96e", text:"Packaging (joblib/pickle). API layer (FastAPI). Containerization (Docker). CI/CD (GitHub Actions). Monitoring (logs, drift detection). Retraining pipeline."},
      ]}/>
      <Block label="The minimal production stack">{`# What you need for a production ML system:
# 1. Trained model saved as artifact (joblib/pickle/ONNX)
# 2. FastAPI to serve predictions via HTTP API
# 3. Input validation (Pydantic schemas)
# 4. Docker container (reproducible environment)
# 5. Cloud deployment (Railway, AWS, GCP, Azure)
# 6. Logging and monitoring
# 7. Health check endpoint

# This lesson covers all of these step by step.
# By the end, you'll have a template you can use for every project.`}</Block>

      <LH>2. Saving Models — doing it right</LH>
      <Block label="Save and load models properly">{`import joblib
import json
import os
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import numpy as np

# Train a model
np.random.seed(42)
X = np.random.randn(1000, 5)
y = (X[:, 0] + X[:, 1] > 0).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])
pipeline.fit(X_train, y_train)

test_auc = roc_auc_score(y_test, pipeline.predict_proba(X_test)[:,1])

# Save model with metadata
os.makedirs("models", exist_ok=True)
version = datetime.now().strftime("%Y%m%d_%H%M%S")
model_path = f"models/churn_pipeline_v{version}.pkl"

joblib.dump(pipeline, model_path)

# Always save metadata alongside the model
metadata = {
    "model_version": version,
    "model_type": "RandomForest",
    "n_features": 5,
    "feature_names": ["tenure", "charges", "services", "contract", "senior"],
    "training_samples": len(X_train),
    "test_auc": round(test_auc, 4),
    "sklearn_version": "1.4.0",
    "trained_at": datetime.now().isoformat(),
    "model_path": model_path,
}

with open(f"models/metadata_v{version}.json", "w") as f:
    json.dump(metadata, f, indent=2)

print(f"Model saved: {model_path}")
print(f"Test AUC: {test_auc:.4f}")

# Load model
loaded_pipeline = joblib.load(model_path)
# Verify it works
sample = np.array([[12, 75.5, 3, 0, 0]])
prob = loaded_pipeline.predict_proba(sample)[0][1]
print(f"Sample prediction: {prob:.3f}")`}</Block>

      <LH>3. FastAPI — building a production ML API</LH>
      <Block label="main.py — complete production API">{`# main.py — save this in your project root
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import joblib
import pandas as pd
import numpy as np
import logging
import os
import json
from datetime import datetime
from typing import Optional

# ── Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ── Initialize FastAPI
app = FastAPI(
    title="Churn Prediction API",
    description="Predict customer churn probability",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI at /docs
    redoc_url="/redoc",    # ReDoc at /redoc
)

# ── CORS — allow frontend apps to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict to your domain in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Load model once at startup (not on every request!)
@app.on_event("startup")
async def load_model():
    global model, model_metadata
    try:
        model = joblib.load(os.environ.get("MODEL_PATH", "churn_pipeline.pkl"))
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

# ── Input schema with validation
class CustomerInput(BaseModel):
    tenure: int = Field(..., ge=0, le=120, description="Months as customer")
    monthly_charges: float = Field(..., ge=0, le=500, description="Monthly bill")
    num_services: int = Field(..., ge=0, le=10, description="Number of services")
    contract_type: str = Field(..., description="Month-to-month, One year, Two year")
    is_senior: int = Field(default=0, ge=0, le=1)
    
    @validator('contract_type')
    def validate_contract(cls, v):
        valid = {'Month-to-month', 'One year', 'Two year'}
        if v not in valid:
            raise ValueError(f"contract_type must be one of {valid}")
        return v

# ── Output schema
class PredictionOutput(BaseModel):
    customer_id: Optional[str]
    churn_probability: float
    churn_prediction: int
    risk_level: str
    confidence: str
    model_version: str

# ── Prediction count for monitoring
prediction_count = 0

@app.get("/health")
async def health_check():
    """Health check — load balancers ping this endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "predictions_served": prediction_count,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/predict", response_model=PredictionOutput)
async def predict(customer: CustomerInput, customer_id: Optional[str] = None):
    """
    Predict churn probability for a single customer.
    Returns probability, binary prediction, and risk level.
    """
    global prediction_count
    
    try:
        # Build feature DataFrame
        contract_map = {"Month-to-month": 0, "One year": 1, "Two year": 2}
        df = pd.DataFrame([{
            "tenure":          customer.tenure,
            "monthly_charges": customer.monthly_charges,
            "num_services":    customer.num_services,
            "contract_enc":    contract_map[customer.contract_type],
            "senior_citizen":  customer.is_senior,
        }])
        
        # Predict
        prob = float(model.predict_proba(df)[0][1])
        pred = int(prob >= 0.5)
        
        # Risk segmentation
        if prob >= 0.75:
            risk = "Critical"
            confidence = "High"
        elif prob >= 0.5:
            risk = "High"
            confidence = "High" if prob >= 0.65 else "Medium"
        elif prob >= 0.3:
            risk = "Medium"
            confidence = "Medium"
        else:
            risk = "Low"
            confidence = "High" if prob <= 0.15 else "Medium"
        
        # Log prediction
        prediction_count += 1
        logger.info(f"Prediction: customer={customer_id}, prob={prob:.3f}, risk={risk}")
        
        return PredictionOutput(
            customer_id=customer_id,
            churn_probability=round(prob, 4),
            churn_prediction=pred,
            risk_level=risk,
            confidence=confidence,
            model_version="1.0.0"
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch")
async def predict_batch(customers: list[CustomerInput]):
    """Predict for multiple customers at once — more efficient than multiple /predict calls."""
    if len(customers) > 1000:
        raise HTTPException(status_code=400, detail="Max 1000 customers per batch")
    
    results = []
    for i, customer in enumerate(customers):
        pred = await predict(customer, customer_id=str(i))
        results.append(pred)
    return {"predictions": results, "count": len(results)}

# Run with: uvicorn main:app --reload --port 8000`}</Block>

      <LH>4. Testing Your API</LH>
      <Block label="Comprehensive API testing">{`import requests
import json

BASE_URL = "http://localhost:8000"

# ── 1. Health check
health = requests.get(f"{BASE_URL}/health")
print("Health:", health.status_code, health.json())

# ── 2. Single prediction
customer = {
    "tenure": 3,
    "monthly_charges": 89.5,
    "num_services": 2,
    "contract_type": "Month-to-month",
    "is_senior": 0
}
response = requests.post(f"{BASE_URL}/predict", json=customer,
                          params={"customer_id": "CUST-001"})
print("Status:", response.status_code)
print("Prediction:", json.dumps(response.json(), indent=2))

# ── 3. Test validation
invalid_customer = {**customer, "contract_type": "invalid_type"}
response = requests.post(f"{BASE_URL}/predict", json=invalid_customer)
print("Validation error:", response.status_code, response.json())

# ── 4. Batch prediction
batch = [
    {"tenure": 1,  "monthly_charges": 95.0, "num_services": 1, "contract_type": "Month-to-month", "is_senior": 0},
    {"tenure": 48, "monthly_charges": 42.0, "num_services": 5, "contract_type": "Two year",        "is_senior": 0},
    {"tenure": 12, "monthly_charges": 65.0, "num_services": 3, "contract_type": "One year",        "is_senior": 1},
]
batch_response = requests.post(f"{BASE_URL}/predict/batch", json=batch)
print("Batch:", batch_response.json()["count"], "predictions")`}</Block>

      <LH>5. Docker — containerize for reproducibility</LH>
      <Block label="Dockerfile and docker-compose">{`# Dockerfile — save in project root
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ── IMPORTANT: Copy requirements BEFORE code
# Docker caches layers. If requirements don't change,
# pip install is reused even when code changes.
# This makes rebuilds 10x faster.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m apiuser && chown -R apiuser:apiuser /app
USER apiuser

# Expose port
EXPOSE 8000

# Health check — Docker will restart container if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]`}</Block>
      <Block label="requirements.txt and Docker commands">{`# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
scikit-learn==1.4.0
pandas==2.1.4
numpy==1.26.3
joblib==1.3.2
pydantic==2.5.3

# ── Build and run locally
docker build -t churn-api:latest .
docker run -p 8000:8000 -e MODEL_PATH=/app/churn_pipeline.pkl churn-api:latest

# ── Test the container
curl http://localhost:8000/health

# ── docker-compose.yml for local development
# version: '3.8'
# services:
#   api:
#     build: .
#     ports: ["8000:8000"]
#     environment:
#       - MODEL_PATH=/app/models/churn_pipeline.pkl
#     volumes:
#       - ./models:/app/models  # mount model files
#     restart: unless-stopped

# ── Push to Docker Hub for deployment
docker tag churn-api:latest yourusername/churn-api:v1.0
docker push yourusername/churn-api:v1.0`}</Block>

      <LH>6. Deployment — getting a live URL</LH>
      <Block label="Deploy to Railway, Render, or AWS">{`# ── OPTION 1: Railway (easiest, free tier)
# 1. Push code + Dockerfile to GitHub
# 2. railway.app → New Project → Deploy from GitHub
# 3. Select repo → Railway detects Dockerfile
# 4. Add env vars: MODEL_PATH=...
# 5. Get URL: https://yourapp.railway.app

# ── OPTION 2: Render (also free)
# render.com → New → Web Service → GitHub repo
# Environment: Docker
# Build command: docker build -t app .
# Start command: docker run -p $PORT:8000 app

# ── OPTION 3: AWS EC2 (more control, slightly complex)
# 1. Launch EC2 instance (t3.micro = free tier)
# 2. SSH in: ssh -i key.pem ec2-user@your-ip
# 3. Install Docker on EC2:
#    sudo yum update -y && sudo yum install -y docker
#    sudo systemctl start docker
# 4. Pull and run your image:
#    docker pull yourusername/churn-api:v1
#    docker run -d -p 80:8000 yourusername/churn-api:v1
# 5. Your API is live at: http://your-ec2-ip/predict

# ── OPTION 4: Hugging Face Spaces (best for demos)
# Supports Streamlit, Gradio, Docker
# Free GPU tier available
# Great for ML demos in portfolio`}</Block>

      <LH>7. MLflow — track every experiment</LH>
      <Block label="Production experiment tracking">{`import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd

# mlflow ui  ← run this in terminal to see dashboard at localhost:5000

mlflow.set_tracking_uri("./mlruns")     # local storage
mlflow.set_experiment("churn_prediction_v2")

# Compare multiple models systematically
models_to_compare = [
    ("LogisticRegression", LogisticRegression(C=1.0, class_weight='balanced', 
                                               max_iter=1000, random_state=42)),
    ("RandomForest_100",   RandomForestClassifier(n_estimators=100, max_depth=6,
                                                   class_weight='balanced', random_state=42)),
    ("RandomForest_200",   RandomForestClassifier(n_estimators=200, max_depth=8,
                                                   class_weight='balanced', random_state=42)),
    ("GradientBoosting",   GradientBoostingClassifier(n_estimators=100, learning_rate=0.1,
                                                        max_depth=4, random_state=42)),
]

best_auc = 0
best_run_id = None

for model_name, model in models_to_compare:
    with mlflow.start_run(run_name=model_name):
        # Log model parameters
        mlflow.log_params(model.get_params())
        mlflow.log_param("model_type", type(model).__name__)
        
        # Train
        model.fit(X_train, y_train)
        
        # Evaluate
        train_probs = model.predict_proba(X_train)[:, 1]
        test_probs  = model.predict_proba(X_test)[:, 1]
        test_preds  = model.predict(X_test)
        
        metrics = {
            "train_auc":  roc_auc_score(y_train, train_probs),
            "test_auc":   roc_auc_score(y_test, test_probs),
            "test_f1":    f1_score(y_test, test_preds),
            "precision":  precision_score(y_test, test_preds),
            "recall":     recall_score(y_test, test_preds),
            "overfit_gap": roc_auc_score(y_train, train_probs) - roc_auc_score(y_test, test_probs)
        }
        mlflow.log_metrics(metrics)
        
        # Save model as MLflow artifact
        mlflow.sklearn.log_model(model, "model")
        
        # Track best model
        if metrics["test_auc"] > best_auc:
            best_auc = metrics["test_auc"]
            best_run_id = mlflow.active_run().info.run_id
        
        print(f"{model_name}: AUC={metrics['test_auc']:.4f}, "
              f"F1={metrics['test_f1']:.4f}, "
              f"Overfit={metrics['overfit_gap']:.4f}")

print(f"\nBest model: run_id={best_run_id}, AUC={best_auc:.4f}")
# Load best model from MLflow
best_model = mlflow.sklearn.load_model(f"runs:/{best_run_id}/model")
joblib.dump(best_model, "churn_pipeline.pkl")`}</Block>

      <LH>8. Monitoring — detect when your model degrades</LH>
      <Block label="Data drift and performance monitoring">{`import numpy as np
import pandas as pd
from scipy import stats

class ModelMonitor:
    """
    Simple production model monitoring.
    In production: use Evidently, WhyLogs, or MLflow monitoring.
    """
    def __init__(self, reference_data: pd.DataFrame):
        """Reference data = training data statistics."""
        self.reference_stats = {
            col: {
                "mean": reference_data[col].mean(),
                "std":  reference_data[col].std(),
                "min":  reference_data[col].min(),
                "max":  reference_data[col].max(),
            }
            for col in reference_data.select_dtypes(include=[np.number]).columns
        }
        self.prediction_log = []
    
    def check_data_drift(self, new_data: pd.DataFrame, alpha=0.05) -> dict:
        """
        Kolmogorov-Smirnov test for distribution shift.
        Compares new data distribution to reference (training) data.
        If p < alpha: distributions are significantly different → drift detected.
        """
        drift_results = {}
        for col in self.reference_stats:
            if col not in new_data.columns:
                continue
            ref_mean = self.reference_stats[col]["mean"]
            ref_std  = self.reference_stats[col]["std"]
            
            # Simulate reference distribution
            ref_samples = np.random.normal(ref_mean, ref_std, 1000)
            new_samples = new_data[col].dropna().values
            
            # KS test
            ks_stat, p_value = stats.ks_2samp(ref_samples, new_samples)
            drift_results[col] = {
                "ks_statistic":  round(ks_stat, 4),
                "p_value":       round(p_value, 4),
                "drift_detected": p_value < alpha,
                "new_mean":      round(new_data[col].mean(), 2),
                "ref_mean":      round(ref_mean, 2),
            }
        return drift_results
    
    def log_prediction(self, features: dict, prediction: float, actual: int = None):
        """Log predictions for performance tracking."""
        self.prediction_log.append({
            "timestamp":  pd.Timestamp.now(),
            "prediction": prediction,
            "actual":     actual,
            **features
        })
    
    def prediction_drift(self) -> dict:
        """Check if prediction distribution has shifted."""
        if len(self.prediction_log) < 100:
            return {"status": "insufficient_data"}
        
        df = pd.DataFrame(self.prediction_log)
        recent    = df.tail(100)["prediction"]
        historical = df.head(len(df)-100)["prediction"] if len(df) > 200 else recent
        
        return {
            "recent_avg_prob":    round(recent.mean(), 4),
            "historical_avg_prob": round(historical.mean(), 4),
            "shift":              round(abs(recent.mean() - historical.mean()), 4),
            "alert":              abs(recent.mean() - historical.mean()) > 0.05
        }

# Usage
reference_df = pd.DataFrame({
    "tenure":          np.random.randint(1, 72, 1000),
    "monthly_charges": np.random.uniform(20, 120, 1000),
})

monitor = ModelMonitor(reference_df)

# Check new data in production
new_data = pd.DataFrame({
    "tenure":          np.random.randint(1, 24, 200),   # newer customers
    "monthly_charges": np.random.uniform(60, 150, 200), # higher charges (drift!)
})

drift = monitor.check_data_drift(new_data)
for feature, result in drift.items():
    status = "⚠ DRIFT" if result["drift_detected"] else "✓ OK"
    print(f"{status} {feature}: ref_mean={result['ref_mean']}, "
          f"new_mean={result['new_mean']}, p={result['p_value']}")`}</Block>

      <LH>9. The Complete MLOps Workflow</LH>
      <div style={{display:"grid",gap:8,margin:"12px 0"}}>
        {[
          {n:"01",color:"#7eb8f7",title:"Experiment Tracking (MLflow)",desc:"Train multiple models. Log all parameters, metrics, and artifacts. Pick the best by test AUC. Never lose an experiment."},
          {n:"02",color:"#6dd6a0",title:"Model Packaging (joblib + metadata)",desc:"Save model + metadata (version, features, metrics, timestamp). Always save metadata alongside the model file."},
          {n:"03",color:"#f7c96e",title:"API Layer (FastAPI + Pydantic)",desc:"Serve predictions via HTTP. Validate inputs. Handle errors gracefully. Add /health and /predict endpoints. Log every prediction."},
          {n:"04",color:"#fb923c",title:"Containerization (Docker)",desc:"Write Dockerfile. Copy requirements before code (caching). Add health check. Build, test locally, push to Docker Hub."},
          {n:"05",color:"#f472b6",title:"Deployment (Railway/AWS/GCP)",desc:"Connect GitHub → Railway detects Dockerfile. Set environment variables. Get live URL. Add to portfolio and LinkedIn."},
          {n:"06",color:"#c792ea",title:"Monitoring (Drift + Performance)",desc:"Log predictions to database. Run drift tests weekly. Alert when model performance drops below threshold. Retrain on schedule."},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"#0d1520",borderRadius:8,border:`1px solid ${s.color}22`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:s.color+"22",border:`1px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace",fontSize:10,color:s.color,fontWeight:700}}>{s.n}</div>
            <div><div style={{color:s.color,fontWeight:700,fontSize:13,marginBottom:3}}>{s.title}</div><div style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{s.desc}</div></div>
          </div>
        ))}
      </div>

      <Quiz questions={[
        {q:"In FastAPI, what does @app.on_event('startup') do?",options:["Runs when the first request arrives","Runs once when the server starts — ideal for loading the model into memory","Runs every request","Runs on server shutdown"],answer:"Runs once when the server starts — ideal for loading the model into memory",explanation:"Loading a model takes time (0.5-30 seconds). If you load it inside the predict function, every request would wait for it. @app.on_event('startup') loads it once at server start, then all requests reuse it from memory — much faster."},
        {q:"In your Dockerfile, why copy requirements.txt and pip install BEFORE copying your code?",options:["Required by Docker specification","Docker caches each layer — unchanged requirements.txt means pip install is cached even when code changes","requirements.txt must exist before Python can run","Docker alphabetically processes COPY commands"],answer:"Docker caches each layer — unchanged requirements.txt means pip install is cached even when code changes",explanation:"Docker builds in layers. If you change app.py but not requirements.txt, Docker reuses the cached pip install layer — only rebuilding from 'COPY . .' onward. Without this ordering, pip reinstalls on every code change — builds take 3-10 minutes instead of 15 seconds."},
        {q:"Data drift means:",options:["Your model's code has a bug","The statistical properties of production data have shifted from training data","The model is making more predictions","The API is returning errors"],answer:"The statistical properties of production data have shifted from training data",explanation:"Models are trained on historical data but serve predictions on future data. If customer behavior changes (e.g., new pricing plan causes average charges to shift), the model sees input distributions it wasn't trained on — performance degrades. Regular drift monitoring catches this early."},
        {q:"MLflow experiment tracking helps you avoid:",options:["Overfitting","Losing track of which hyperparameters produced your best model","Data leakage","Slow API responses"],answer:"Losing track of which hyperparameters produced your best model",explanation:"Without tracking, you run experiments and forget what worked. MLflow logs every run's parameters, metrics, and artifacts. When your manager asks 'why did you choose 200 trees?', you can show the comparison dashboard proving it outperformed 100 trees by 2.3% AUC."},
        {q:"Your prediction endpoint returns 200 OK but predictions are confidently wrong for new customers. What's the first thing to check?",options:["Increase model complexity","Check for data drift — production data may have shifted from training distribution","Restart the Docker container","Add more features"],answer:"Check for data drift — production data may have shifted from training distribution",explanation:"Confident wrong predictions on new data while historical performance was good = classic data drift symptom. Run KS tests comparing current production inputs to training data distributions. If distributions differ significantly, retrain on more recent data or investigate what changed in the business."},
      ]}/>

      <CodeExercise
        title="Build a complete FastAPI ML endpoint with validation"
        description="Complete the FastAPI app: fill in the Pydantic input model, the prediction logic, and the health endpoint. The predict function should validate inputs, make a prediction, and return a structured response."
        starterCode={`from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np

app = FastAPI(title="Churn API")

# Simulate a trained model
class FakeModel:
    def predict_proba(self, features):
        np.random.seed(int(features[0][0]) % 100)
        p = np.random.uniform(0.05, 0.95)
        return [[1-p, p]]

model = FakeModel()

class CustomerInput(___):
    tenure: int = Field(___, ge=0, le=120)
    monthly_charges: float = Field(___, ge=0, le=500)
    contract_type: str

class PredictionOutput(___):
    churn_probability: float
    risk_level: str

@app.get("/___")
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=___)
def predict(customer: ___):
    contract_map = {"Month-to-month": 0, "One year": 1, "Two year": 2}
    if customer.contract_type not in contract_map:
        raise HTTPException(status_code=___, detail="Invalid contract type")
    
    features = [[customer.___, customer.___, contract_map[customer.contract_type]]]
    prob = round(float(model.predict_proba(features)[0][1]), 3)
    risk = "High" if prob > 0.6 else "Medium" if prob > 0.3 else "Low"
    
    return ___(churn_probability=prob, risk_level=risk)`}
        hint="BaseModel. ...(description). PredictionOutput. 'health'. PredictionOutput. CustomerInput. 400. customer.tenure. customer.monthly_charges. PredictionOutput(...)."
        validate={(out)=>out.includes("BaseModel")&&out.includes("PredictionOutput")&&out.includes("health")}
      />
    </div>
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
function LearnTab({currentUser, activeId, setActiveId, onLessonComplete}) {
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
        <div className="learn-content" style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
        <div style={{maxWidth:700}}>
          <div style={{marginBottom:4}}>
            <span style={{background:`${lesson.color}20`,color:lesson.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:"0.08em"}}>{lesson.phase}</span>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,margin:"8px 0 4px 0"}}>
            <span style={{fontSize:28}}>{lesson.emoji}</span>
            <div>
              <h2 style={{margin:0,fontSize:21,fontWeight:700,color:T.text,lineHeight:1.2}}>{lesson.title}</h2>
              <p style={{margin:"4px 0 0 0",color:T.textDim,fontSize:12,fontFamily:"monospace"}}>{lesson.subtitle}</p>
            </div>
          </div>
          <div style={{height:1,background:T.border,margin:"16px 0"}}/>
          <Body/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:28,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
            <button onClick={()=>idx>0&&setActiveId(LESSONS[idx-1].id)} style={{background:T.bgCard,color:idx>0?T.textDim:T.textFade,border:`1px solid ${T.border}`,padding:"8px 16px",borderRadius:7,cursor:idx>0?"pointer":"default",fontSize:12}}>← prev</button>
            <button onClick={markDone} style={{background:lesson.color,color:"#000",border:"none",padding:"9px 22px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12}}>
              {done[activeId]?"✓ done":idx<LESSONS.length-1?"got it, next →":"complete ✓"}
            </button>
          </div>
        </div>
        </div>{/* end desktop layout */}
      </div>{/* end flex wrapper */}
    </div>
  );
}

export { LearnTab, LESSONS, LEARN_PHASES, SECTION_TO_FIRST_LESSON, LESSON_COMPLETES_TASK };
