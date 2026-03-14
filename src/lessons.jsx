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
print(f"Average charge: $" + f"{np.mean(charges):.2f}")
print(f"Std deviation:  $" + f"{np.std(charges):.2f}")
print(f"Min: $" + f"{np.min(charges):.2f}, Max: $" + f"{np.max(charges):.2f}")

# Find high-value customers
high_value = charges[charges > np.percentile(charges, 75)]
print(f"High-value customers: {len(high_value)}")

# Normalize for ML (scale to 0-1)
normalized = (charges - charges.min()) / (charges.max() - charges.min())
print(f"Normalized range: {normalized.min():.2f} to {normalized.max():.2f}")`}</Block>
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

print(f"Dataset: {df.shape[0]} customers, {df.shape[1]} features")
print(f"Churn rate: {(df['Churn']=='Yes').mean():.1%}")
print(f"Avg monthly charge: $" + f"{df['MonthlyCharges'].mean():.2f}")
print(f"Missing values:\n{df.isnull().sum()[df.isnull().sum()>0]}")

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

print(f"Clean dataset: {df_clean.shape}")
print(f"Churn rate: {df_clean['Churn'].mean():.1%}")`}</Block>

      <Quiz questions={[
        {q:"pd.to_numeric(df['col'], errors='coerce') — what does errors='coerce' do?",options:["Raises error on bad values","Skips bad values","Converts bad values to NaN","Converts to string"],answer:"Converts bad values to NaN",explanation:"errors='coerce' silently converts anything that can't be turned into a number into NaN. Useful when a numeric column has some text values mixed in."},
        {q:"After merging two DataFrames your row count tripled. What happened?",options:["Normal — merging adds rows","Many-to-many join — duplicate keys in one or both tables","left join behavior","The merge failed"],answer:"Many-to-many join — duplicate keys in one or both tables",explanation:"If the key column has duplicates in both tables, each row matches multiple rows and creates a cartesian product. Always check for duplicates before merging."},
        {q:"df.assign(new_col=lambda x: x['a'] + x['b']) — what does this do?",options:["Modifies df in place","Returns a new DataFrame with new_col added","Raises AttributeError","Modifies columns a and b"],answer:"Returns a new DataFrame with new_col added",explanation:"assign() always returns a new DataFrame — it never modifies in place. This makes it safe to use in method chains."},
        {q:"df['Contract'].str.contains('month', case=False) — what does this return?",options:["The matching strings","A True/False Series","Count of matches","Error"],answer:"A True/False Series",explanation:"str.contains() returns a boolean Series — True where the pattern is found. case=False makes it case-insensitive."},
        {q:"When should you use dropna() vs fillna()?",options:["Always use dropna","Always use fillna","Drop when you can afford to lose rows; fill when missing has meaning or you need all rows","Drop numeric nulls; fill text nulls"],answer:"Drop when you can afford to lose rows; fill when missing has meaning or you need all rows",explanation:"dropna loses data. fillna can introduce bias if not done carefully. For ML: never fill before train/test split — fit imputers on train, transform both."},
      ]}/>
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
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

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
print(f"Mean:   $" + f"{df['MonthlyCharges'].mean():.2f}")
print(f"Median: $" + f"{df['MonthlyCharges'].median():.2f}")
print(f"Std:    $" + f"{df['MonthlyCharges'].std():.2f}")

# If mean >> median → right skew → outliers pulling up`}</Block>
      <Block label="Categorical columns">{`# Contract type counts
df['Contract'].value_counts().plot(kind='bar')
plt.title('Contract Types')
plt.show()

# All categorical columns at once
cat_cols = df.select_dtypes(include='object').columns
for col in cat_cols:
    print(f"\n{col}:")
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
    print(f"{col}: {len(outliers)} outliers ({len(outliers)/len(df):.1%})")
    return outliers

for col in ['MonthlyCharges', 'TotalCharges', 'tenure']:
    find_outliers(df, col)`}</Block>

      <LH>8. Full EDA on Telco Churn</LH>
      <Block label="Real EDA workflow">{`df = pd.read_csv('telco_churn.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['ChurnBinary'] = (df['Churn'] == 'Yes').astype(int)

print("=== DATASET OVERVIEW ===")
print(f"Shape: {df.shape}")
print(f"Churn rate: {df['ChurnBinary'].mean():.1%}")
print(f"Missing: {df.isnull().sum().sum()} total")

print("\n=== TOP CHURN PREDICTORS ===")
# Contract type
print(df.groupby('Contract')['ChurnBinary'].mean().sort_values(ascending=False))

print("\n=== HIGH-RISK SEGMENT ===")
high_risk = df[
    (df['Contract'] == 'Month-to-month') &
    (df['tenure'] < 12) &
    (df['MonthlyCharges'] > 65)
]
print(f"High-risk customers: {len(high_risk)}")
print(f"Their churn rate: {high_risk['ChurnBinary'].mean():.1%}")`}</Block>
      <Callout icon="★" color="#f7c96e" title="Gold habit">Before every model, write 5 specific questions about the data. Answer each with code. This forces you to understand the data instead of blindly running sklearn.</Callout>

      <Quiz questions={[
        {q:"You're building a fraud model. 99% of transactions are legitimate. You get 99% accuracy. Is the model good?",options:["Yes, 99% is excellent","No — a model predicting 'not fraud' always gets 99% accuracy","Only if recall is also 99%","Depends on the algorithm"],answer:"No — a model predicting 'not fraud' always gets 99% accuracy",explanation:"Class imbalance makes accuracy misleading. Always check precision, recall, and F1. A model that never detects fraud is useless despite high accuracy."},
        {q:"df['price'].mean() = 1200 but df['price'].median() = 450. What does this suggest?",options:["Normal distribution","Right skew — expensive outliers pulling the mean up","Left skew","Data has errors"],answer:"Right skew — expensive outliers pulling the mean up",explanation:"When mean >> median, a few very high values are pulling the average up. Always check median for skewed data — it's more representative of the 'typical' value."},
        {q:"What is the first thing you should check about your target variable?",options:["Its correlation with features","Its class distribution (balance)","Its data type","Its missing values"],answer:"Its class distribution (balance)",explanation:"Class imbalance fundamentally changes how you build and evaluate models. A severely imbalanced target requires special techniques like SMOTE, class weights, and different evaluation metrics."},
        {q:"Correlation of -0.4 between 'tenure' and 'Churn'. What does this mean?",options:["No relationship","Longer tenure → less likely to churn","Longer tenure → more likely to churn","The relationship is too weak to matter"],answer:"Longer tenure → less likely to churn",explanation:"Negative correlation means as one goes up, the other goes down. Customers who stay longer are less likely to churn — they're loyal."},
        {q:"What does bivariate analysis mean?",options:["Analyzing two datasets","Analyzing the relationship between two variables","Using two algorithms","Splitting data into two parts"],answer:"Analyzing the relationship between two variables",explanation:"Bivariate = two variables. You're looking at how one feature relates to another — especially how each feature relates to your target variable."},
      ]}/>
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
print(f"P(churn | month-to-month) = {p_churn_given_monthly:.1%}")
# ≈ 42.7% — much higher than overall 26.5%

# Compare:
for contract in df['Contract'].unique():
    subset = df[df['Contract'] == contract]
    rate = (subset['Churn'] == 'Yes').mean()
    print(f"P(churn | {contract}) = {rate:.1%}")`}</Block>

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
print(f"P(spam | email contains FREE) = {p_spam_given_free:.1%}")
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
print(f"Expected LTV: $" + f"{e_ltv:.2f}")
# = $312 + $136.5 + $48.75 = $497.25`}</Block>

      <Quiz questions={[
        {q:"P(churn) = 0.27. What is P(not churn)?",options:["0.27","0.73","0.54","Cannot determine"],answer:"0.73",explanation:"P(not A) = 1 - P(A). If 27% churn, 73% don't. Probabilities of all outcomes must sum to 1."},
        {q:"P(A and B) = P(A) × P(B). This means A and B are:",options:["Mutually exclusive","Dependent","Independent","Complementary"],answer:"Independent",explanation:"Two events are independent when knowing one gives no information about the other. For independent events, joint probability = product of individual probabilities."},
        {q:"You test 1000 customers. 300 are on month-to-month contracts. Of those, 128 churned. What is P(churn | month-to-month)?",options:["128/1000 = 12.8%","128/300 = 42.7%","300/1000 = 30%","128/700 = 18.3%"],answer:"128/300 = 42.7%",explanation:"Conditional probability = favorable cases within the condition / total cases within the condition. 128 churned out of 300 month-to-month customers."},
        {q:"Bayes theorem updates what?",options:["The algorithm weights","Your prior belief based on new evidence","The training data","The model architecture"],answer:"Your prior belief based on new evidence",explanation:"Bayes theorem is about updating beliefs. You start with a prior probability, observe evidence, and calculate the posterior probability — your updated belief."},
        {q:"E[revenue] = (0.6 × $1000) + (0.4 × $200). What is the expected revenue?",options:["$600","$680","$1200","$800"],answer:"$680",explanation:"0.6 × 1000 = 600. 0.4 × 200 = 80. Total = $680. Expected value is the probability-weighted average outcome."},
      ]}/>
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
print(f"p-value: {p:.3f}")
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
print(f"Outliers: {len(outliers)}")`}</Block>

      <LH>3. Binomial Distribution</LH>
      <Block label="Counting successes">{`# Binomial(n, p): n trials, p probability of success each time
# "How many customers will churn out of 100?"

from scipy.stats import binom

n = 100      # 100 new customers
p = 0.265    # 26.5% churn rate

# Expected number of churners
expected = n * p
print(f"Expected churners: {expected:.1f}")

# Probability of exactly 30 churning
p_exactly_30 = binom.pmf(30, n, p)
print(f"P(exactly 30 churn) = {p_exactly_30:.3f}")

# Probability of 25 or fewer churning
p_25_or_fewer = binom.cdf(25, n, p)
print(f"P(25 or fewer churn) = {p_25_or_fewer:.3f}")`}</Block>

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

print(f"Skewness of TotalCharges: {df['TotalCharges'].skew():.2f}")
# Positive skew = tail on right = few very high values

# Fix with log transform
import numpy as np
df['TotalCharges_log'] = np.log1p(df['TotalCharges'])
print(f"Skewness after log: {df['TotalCharges_log'].skew():.2f}")

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
print(f"Pearson r = {r:.3f}, p = {p:.4f}")

# Spearman — rank-based, handles non-linear relationships and outliers
rho, p = stats.spearmanr(df['tenure'], df['MonthlyCharges'])
print(f"Spearman rho = {rho:.3f}, p = {p:.4f}")

# Point-biserial — continuous vs binary
r, p = stats.pointbiserialr(df['ChurnBinary'], df['MonthlyCharges'])
print(f"Point-biserial r = {r:.3f}, p = {p:.4f}")

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
    print(f"\n{name}:\n{churn}")`}</Block>

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
print(f"Churned mean:  $" + f"{churned.mean():.2f}")
print(f"Retained mean: $" + f"{retained.mean():.2f}")
print(f"t-statistic: {t_stat:.3f}")
print(f"p-value: {p_value:.6f}")

if p_value < 0.05:
    print("REJECT H0 — significant difference in monthly charges")
else:
    print("FAIL TO REJECT H0 — no significant difference")`}</Block>

      <LH>3. Chi-Square Test — for categorical variables</LH>
      <Block label="Chi-square test">{`# Question: Is there a relationship between contract type and churn?
contingency = pd.crosstab(df['Contract'], df['Churn'])
print(contingency)

chi2, p, dof, expected = stats.chi2_contingency(contingency)
print(f"\nChi-square: {chi2:.2f}")
print(f"p-value: {p:.6f}")
print(f"Degrees of freedom: {dof}")

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

print(f"Control churn rate:   {rate_control:.1%}")
print(f"Treatment churn rate: {rate_treatment:.1%}")
print(f"Absolute reduction:   {rate_control - rate_treatment:.1%}")
print(f"Relative reduction:   {(rate_control - rate_treatment)/rate_control:.1%}")

# Statistical test for proportions
count = np.array([churn_treatment, churn_control])
nobs = np.array([n_treatment, n_control])
z_stat, p_value = stats.proportions_ztest(count, nobs, alternative='smaller')

print(f"\nz-statistic: {z_stat:.3f}")
print(f"p-value: {p_value:.4f}")
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
print(f"Required sample size per group: {n:.0f}")
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
print(f"Churn rate: {rate:.1%}")
print(f"95% CI: [{ci_low:.1%}, {ci_high:.1%}]")
# "We're 95% confident the true churn rate is between X% and Y%"

# For a mean:
data = np.random.normal(65, 15, 100)
ci = stats.t.interval(0.95, len(data)-1, loc=np.mean(data), scale=stats.sem(data))
print(f"Mean: {np.mean(data):.1f}")
print(f"95% CI: [{ci[0]:.1f}, {ci[1]:.1f}]")`}</Block>

      <Quiz questions={[
        {q:"p-value = 0.03 with α = 0.05. What do you conclude?",options:["Accept H0","Reject H0 — statistically significant result","The effect is practically significant","You need more data"],answer:"Reject H0 — statistically significant result",explanation:"p < α means you reject the null hypothesis. p=0.03 means there's only a 3% chance of seeing these results if H0 were true — unlikely enough to reject H0."},
        {q:"An A/B test shows a 0.1% improvement with p=0.001. Should you ship the change?",options:["Yes — p < 0.05 so it's significant","Maybe — statistical significance doesn't mean practical significance","No — p is too low","Yes — always ship significant results"],answer:"Maybe — statistical significance doesn't mean practical significance",explanation:"Statistical significance means the effect is real, not due to chance. But 0.1% improvement may not be worth the engineering cost. Always evaluate both statistical AND practical significance."},
        {q:"You run 20 A/B tests simultaneously and report the one with p < 0.05. What's wrong?",options:["Nothing — p < 0.05 is significant","P-hacking — with 20 tests, 1 significant result by chance is expected","You need more tests","The sample size is wrong"],answer:"P-hacking — with 20 tests, 1 significant result by chance is expected",explanation:"With α=0.05, you expect 1 false positive per 20 tests by chance. Running many tests and cherry-picking significant ones inflates false positive rate. Use Bonferroni correction."},
        {q:"What does statistical power mean?",options:["The strength of the p-value","Probability of detecting a real effect when it exists","The size of your dataset","Confidence in your sample"],answer:"Probability of detecting a real effect when it exists",explanation:"Power = 1 - β (probability of a false negative). Power of 0.80 means if there IS a real effect, you have an 80% chance of detecting it. Low power → miss real effects."},
        {q:"Chi-square test is used for:",options:["Comparing two means","Testing independence between two categorical variables","Testing normality","Comparing variances"],answer:"Testing independence between two categorical variables",explanation:"Chi-square test of independence checks whether two categorical variables are related. Example: 'Is there a relationship between contract type and churn status?'"},
      ]}/>
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

print(f"Train: {len(X_train)} rows, churn rate: {y_train.mean():.1%}")
print(f"Test:  {len(X_test)} rows,  churn rate: {y_test.mean():.1%}")`}</Block>

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
print(f"Accuracy: {accuracy_score(y_test, preds):.3f}")
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

print(f"RMSE: {rmse:.2f}")  # average error in dollars
print(f"MAE:  {mae:.2f}")   # median error in dollars
print(f"R²:   {r2:.3f}")    # 0.85 = model explains 85% of variance

# What did the model learn?
for feat, coef in zip(features, model.coef_):
    print(f"  {feat}: {coef:.3f}")
print(f"  intercept: {model.intercept_:.3f}")`}</Block>
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
print(f"AUC-ROC: {roc_auc_score(y_test, probs):.3f}")

# Feature importance (coefficients)
for feat, coef in zip(features, model.coef_[0]):
    direction = "↑ churn" if coef > 0 else "↓ churn"
    print(f"  {feat}: {coef:.3f} ({direction})")`}</Block>
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

print(f"Train accuracy: {tree.score(X_train, y_train):.3f}")
print(f"Test accuracy:  {tree.score(X_test, y_test):.3f}")
print(f"AUC-ROC: {roc_auc_score(y_test, tree.predict_proba(X_test)[:,1]):.3f}")`}</Block>
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

print(f"Train AUC: {roc_auc_score(y_train, rf.predict_proba(X_train)[:,1]):.3f}")
print(f"Test AUC:  {roc_auc_score(y_test, probs):.3f}")
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
print(f"True Negatives:  {tn}  (correctly predicted stay)")
print(f"False Positives: {fp}  (predicted churn, actually stayed)")
print(f"False Negatives: {fn}  (predicted stay, actually churned!)")
print(f"True Positives:  {tp}  (correctly predicted churn)")`}</Block>

        <LH>2. Precision, Recall, F1</LH>
        <Block label="python — metrics from scratch">{`# Precision: Of all predicted churners, how many actually churned?
precision = tp / (tp + fp)
print(f"Precision: {precision:.3f}")
# High precision = fewer false alarms

# Recall (Sensitivity): Of all actual churners, how many did we catch?
recall = tp / (tp + fn)
print(f"Recall: {recall:.3f}")
# High recall = fewer missed churners

# F1: Harmonic mean — balances precision and recall
f1 = 2 * (precision * recall) / (precision + recall)
print(f"F1: {f1:.3f}")

# sklearn version
from sklearn.metrics import precision_score, recall_score, f1_score
print(f"F1 (sklearn): {f1_score(y_test, preds):.3f}")`}</Block>
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

print(f"CV AUC scores: {scores.round(3)}")
print(f"Mean AUC: {scores.mean():.3f} ± {scores.std():.3f}")
# Large std → model is unstable (overfitting or bad features)
# Small std → model is consistent`}</Block>

        <LH>5. Regression Metrics</LH>
        <Block label="python — regression evaluation">{`from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# For predicting TotalCharges
rmse = np.sqrt(mean_squared_error(y_test, preds))
mae  = mean_absolute_error(y_test, preds)
r2   = r2_score(y_test, preds)

print(f"RMSE: {rmse:.2f}")  # in same units as target
print(f"MAE:  {mae:.2f}")   # more interpretable
print(f"R²:   {r2:.3f}")    # % variance explained

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
    print(f"{name}:")
    print(f"  Train AUC: {train_auc:.3f} | Test AUC: {test_auc:.3f} | Gap: {gap:.3f}")
    print(f"  {'⚠ OVERFITTING' if gap > 0.05 else '✓ OK'}")`}</Block>
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
print(f"Lasso eliminated {zero_features}/{len(lasso.coef_)} features")

# Find best alpha with cross-validation
from sklearn.linear_model import RidgeCV
ridge_cv = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0], cv=5)
ridge_cv.fit(X_train_s, y_train)
print(f"Best alpha: {ridge_cv.alpha_}")`}</Block>

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
        print(f"{metric[5:]}: {scores.mean():.3f} ± {scores.std():.3f}")`}</Block>
        <Warn>Never use the test set to tune hyperparameters. If you try 50 different settings and pick the best one on the test set, you've effectively trained on the test set. Use cross-validation on the train set for tuning, then evaluate once on test.</Warn>

        <Quiz questions={[
          {q:"Train AUC = 0.98, Test AUC = 0.71. What is this?",options:["Good model","Underfitting","Overfitting — large train/test gap","Data leakage"],answer:"Overfitting — large train/test gap",explanation:"A large gap between train and test performance is the signature of overfitting. The model memorized training data but fails to generalize. Fix: reduce model complexity, add regularization, get more data."},
          {q:"Lasso (L1) regularization sets some coefficients to exactly zero. Why is this useful?",options:["Makes the model faster","Performs automatic feature selection","Improves accuracy","Prevents underfitting"],answer:"Performs automatic feature selection",explanation:"Lasso's L1 penalty forces some coefficients to exactly zero, effectively removing those features from the model. This is automatic feature selection — useful when you have many features and want a sparse model."},
          {q:"Learning curves show both train and test scores are low and flat. This indicates:",options:["Overfitting","Good generalization","Underfitting — model needs more complexity","Need more training data"],answer:"Underfitting — model needs more complexity",explanation:"When both scores are low, the model is too simple. Try: more features, higher max_depth, more complex algorithm. Overfitting shows high train, low test. Good fit shows both converging at a high score."},
          {q:"You tune hyperparameters by evaluating on the test set 50 times. What went wrong?",options:["Nothing — test set is for evaluation","Test set contamination — you effectively trained on it","50 iterations is too many","Should use train set instead"],answer:"Test set contamination — you effectively trained on it",explanation:"If you repeatedly evaluate on the test set and pick the best result, the test set becomes part of your training process. Your final score is optimistically biased. Use cross-validation on train set for tuning, evaluate on test set ONCE at the end."},
          {q:"What does alpha control in Ridge regularization?",options:["Learning rate","Number of features","Strength of regularization penalty","Train/test split ratio"],answer:"Strength of regularization penalty",explanation:"Higher alpha = stronger regularization = smaller coefficients. alpha=0 is no regularization (ordinary regression). Large alpha shrinks all coefficients strongly toward zero, reducing variance but increasing bias."},
        ]}/>
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

print(f"Features: {X.shape[1]}, Train: {len(X_train)}, Test: {len(X_test)}")`}</Block>

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
print(f"AUC-ROC: {roc_auc_score(y_test, probs):.3f}")
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

print(f"Best params: {search.best_params_}")
print(f"Best CV AUC: {search.best_score_:.3f}")
print(f"Test AUC:    {roc_auc_score(y_test, search.predict_proba(X_test)[:,1]):.3f}")`}</Block>

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
print(f"Churn probability: {churn_prob:.1%}")
print(f"Action: {'Intervene' if churn_prob > 0.5 else 'Monitor'}")`}</Block>

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
      </div>
    )
  },
];

const ADVANCED_ML_LESSONS = [
  {
    id:"adv-xgboost", title:"XGBoost & Gradient Boosting", subtitle:"The algorithm that wins Kaggle competitions",
    emoji:"⚡", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>XGBoost is one of the most powerful ML algorithms ever built. It won hundreds of Kaggle competitions and is used at every major tech company. Let's understand why.</LP>
      <LH>What is Gradient Boosting?</LH>
      <LP>Gradient Boosting builds trees <strong>sequentially</strong> — each tree corrects the mistakes of the previous one. XGBoost is an optimized, faster version of this idea.</LP>
      <Block label="python">{`import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    use_label_encoder=False,
    eval_metric='logloss'
)

model.fit(X_train, y_train,
          eval_set=[(X_test, y_test)],
          verbose=False)

preds = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds):.3f}")`}</Block>
      <LH>Key Hyperparameters</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li><code style={{color:"#f7c96e"}}>n_estimators</code> — number of trees (more = better but slower)</li>
        <li><code style={{color:"#f7c96e"}}>learning_rate</code> — how much each tree contributes (lower = more robust)</li>
        <li><code style={{color:"#f7c96e"}}>max_depth</code> — depth of each tree (lower = less overfitting)</li>
        <li><code style={{color:"#f7c96e"}}>subsample</code> — fraction of data used per tree (prevents overfitting)</li>
      </ul>
      <LH>XGBoost vs Random Forest</LH>
      <div style={{background:"#0d1520",borderRadius:8,padding:16,fontSize:12,color:"#8b87a8",lineHeight:1.8,border:"1px solid #1e2a3a"}}>
        <div>🌲 <strong style={{color:T.text}}>Random Forest</strong> — trees built in parallel, easy to tune, great baseline</div>
        <div>⚡ <strong style={{color:T.text}}>XGBoost</strong> — trees built sequentially, higher accuracy, needs more tuning</div>
        <div style={{marginTop:8}}>Rule of thumb: start with Random Forest, switch to XGBoost when you need more performance.</div>
      </div>
    </div>
  },
  {
    id:"adv-lightgbm", title:"LightGBM & CatBoost", subtitle:"Faster boosting for large datasets",
    emoji:"🚀", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>LightGBM (by Microsoft) and CatBoost (by Yandex) are XGBoost alternatives that are faster on large datasets and handle categorical features better.</LP>
      <LH>LightGBM</LH>
      <Block label="python">{`import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    num_leaves=31,
    random_state=42
)

model.fit(X_train, y_train)
preds = model.predict(X_test)`}</Block>
      <LH>CatBoost — handles categories automatically</LH>
      <Block label="python">{`from catboost import CatBoostClassifier

model = CatBoostClassifier(
    iterations=200,
    learning_rate=0.05,
    cat_features=['gender', 'contract_type'],  # no encoding needed!
    verbose=False
)

model.fit(X_train, y_train)`}</Block>
      <LH>When to use which?</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li>🔢 <strong style={{color:T.text}}>Mostly numerical data</strong> → XGBoost or LightGBM</li>
        <li>🏷️ <strong style={{color:T.text}}>Many categorical columns</strong> → CatBoost</li>
        <li>📦 <strong style={{color:T.text}}>Very large dataset (millions of rows)</strong> → LightGBM</li>
        <li>🏆 <strong style={{color:T.text}}>Kaggle competition</strong> → Try all three and ensemble</li>
      </ul>
    </div>
  },
  {
    id:"adv-shap", title:"SHAP & Model Explainability", subtitle:"Understand why your model makes predictions",
    emoji:"🔍", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>SHAP (SHapley Additive exPlanations) answers the most important question in ML: <strong style={{color:T.text}}>"Why did the model predict this?"</strong></LP>
      <LP>This is critical for real-world ML — businesses need to explain decisions to customers, regulators, and stakeholders.</LP>
      <LH>Basic SHAP Usage</LH>
      <Block label="python">{`import shap

# Train your model first
model = xgb.XGBClassifier().fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Summary plot — which features matter most overall
shap.summary_plot(shap_values, X_test)

# Explain one prediction
shap.force_plot(explainer.expected_value, 
                shap_values[0], X_test.iloc[0])`}</Block>
      <LH>How to Read SHAP Values</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li><strong style={{color:"#6dd6a0"}}>Positive SHAP value</strong> → feature pushed prediction higher</li>
        <li><strong style={{color:"#f28b82"}}>Negative SHAP value</strong> → feature pushed prediction lower</li>
        <li><strong style={{color:T.text}}>Larger absolute value</strong> → more impact on this prediction</li>
      </ul>
      <LH>SHAP in a Job Interview</LH>
      <div style={{background:"#0d1520",borderRadius:8,padding:16,fontSize:12,color:"#8b87a8",lineHeight:1.8,border:"1px solid #1e2a3a"}}>
        If asked "How do you explain your model to non-technical stakeholders?" — SHAP is your answer. It shows which features matter and by how much, in a way anyone can understand.
      </div>
    </div>
  },
  {
    id:"adv-feature-eng", title:"Feature Engineering", subtitle:"Turn raw data into powerful signals",
    emoji:"🔧", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>Feature engineering is the art of creating new input variables from raw data. It's often more impactful than choosing a better algorithm.</LP>
      <LH>Common Techniques</LH>
      <Block label="python">{`import pandas as pd
import numpy as np

df = pd.read_csv('customers.csv')

# 1. Date features
df['signup_date'] = pd.to_datetime(df['signup_date'])
df['account_age_days'] = (pd.Timestamp.now() - df['signup_date']).dt.days
df['signup_month'] = df['signup_date'].dt.month
df['signup_dayofweek'] = df['signup_date'].dt.dayofweek

# 2. Interaction features
df['charges_per_month'] = df['total_charges'] / (df['tenure'] + 1)
df['services_per_dollar'] = df['num_services'] / (df['monthly_charges'] + 1)

# 3. Binning
df['tenure_group'] = pd.cut(df['tenure'], 
                             bins=[0, 12, 24, 60, 999],
                             labels=['new', 'growing', 'mature', 'loyal'])

# 4. Encoding categoricals
df = pd.get_dummies(df, columns=['contract_type', 'payment_method'])`}</Block>
      <LH>The Golden Rule</LH>
      <div style={{background:"#0d1520",borderRadius:8,padding:16,fontSize:12,color:"#8b87a8",lineHeight:1.8,border:"1px solid #1e2a3a"}}>
        Always create features based on <strong style={{color:T.text}}>business logic</strong>, not just math. Ask: "What would a domain expert think matters here?" Then test if it actually improves your model with cross-validation.
      </div>
    </div>
  },
  {
    id:"adv-pipelines", title:"ML Pipelines & Production", subtitle:"Build ML systems that work in the real world",
    emoji:"⚙️", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>A production ML pipeline ensures your model gets the same preprocessing at training time and prediction time. This is one of the most common sources of ML bugs.</LP>
      <LH>The Problem</LH>
      <Block label="python — wrong way">{`# BAD — preprocessing done separately
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
model.fit(X_train_scaled, y_train)

# Later in production...
X_new = get_new_data()
# Forgot to scale! Model gets wrong input`}</Block>
      <LH>The Solution — sklearn Pipeline</LH>
      <Block label="python">{`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier

# Everything in one object
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('model', XGBClassifier(n_estimators=100))
])

# Train
pipeline.fit(X_train, y_train)

# Predict — preprocessing happens automatically  # OK
predictions = pipeline.predict(X_new)

# Save the whole pipeline
import joblib
joblib.dump(pipeline, 'churn_model.pkl')

# Load later
loaded_pipeline = joblib.load('churn_model.pkl')`}</Block>
      <LH>Why This Matters for Jobs</LH>
      <div style={{background:"#0d1520",borderRadius:8,padding:16,fontSize:12,color:"#8b87a8",lineHeight:1.8,border:"1px solid #1e2a3a"}}>
        Companies don't want models in notebooks. They want models they can deploy. Knowing how to build proper pipelines and save/load models signals you're ready for production work.
      </div>
    </div>
  },
  {
    id:"adv-hypertuning", title:"Hyperparameter Tuning", subtitle:"Squeeze every bit of performance from your model",
    emoji:"🎯", phase:"Advanced ML", color:"#f7c96e",
    body:()=><div>
      <LP>Hyperparameter tuning finds the best settings for your model. The difference between default settings and tuned settings can be 2-5% accuracy — which matters a lot in real applications.</LP>
      <LH>GridSearchCV — try all combinations</LH>
      <Block label="python">{`from sklearn.model_selection import GridSearchCV
from xgboost import XGBClassifier

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [3, 4, 5],
    'learning_rate': [0.01, 0.05, 0.1]
}

search = GridSearchCV(
    XGBClassifier(),
    param_grid,
    cv=5,
    scoring='f1',
    n_jobs=-1,
    verbose=1
)

search.fit(X_train, y_train)
print("Best params:", search.best_params_)
print("Best score:", search.best_score_)`}</Block>
      <LH>RandomizedSearchCV — faster for large grids</LH>
      <Block label="python">{`from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

param_dist = {
    'n_estimators': randint(50, 500),
    'max_depth': randint(2, 8),
    'learning_rate': uniform(0.01, 0.3),
    'subsample': uniform(0.6, 0.4)
}

search = RandomizedSearchCV(
    XGBClassifier(),
    param_dist,
    n_iter=50,  # try 50 random combinations
    cv=5,
    scoring='f1',
    random_state=42
)

search.fit(X_train, y_train)`}</Block>
      <LH>Rule of Thumb</LH>
      <ul style={{color:"#8b87a8",lineHeight:2,paddingLeft:20,fontSize:13}}>
        <li>Small param grid (&lt;100 combos) → GridSearchCV</li>
        <li>Large param grid → RandomizedSearchCV</li>
        <li>Want best results + have time → Optuna (Bayesian optimization)</li>
      </ul>
    </div>
  },
];

LESSONS.push(...ML_LESSONS);
LESSONS.push(...ADVANCED_ML_LESSONS);
const LEARN_PHASES = [
  {label:"🐍 Python for DS", ids:["numpy","pandas-basics","pandas-advanced","eda","visualization"]},
  {label:"🗄️ SQL",           ids:["sql-basics","sql-joins","sql-window"]},
  {label:"📐 Statistics",    ids:["probability","distributions","correlation","inference"]},
  {label:"🤖 Machine Learning", ids:["ml-workflow","ml-regression","ml-trees","ml-evaluation","ml-overfitting","ml-sklearn"]},
  {label:"⚡ Advanced ML", ids:["adv-xgboost","adv-lightgbm","adv-shap","adv-feature-eng","adv-pipelines","adv-hypertuning"]},
];


// Maps roadmap section id → first lesson to open when "Study this" is clicked
const SECTION_TO_FIRST_LESSON = {
  "python-ds":  "numpy",
  "sql":        "sql-basics",
  "stats-prob": "probability",
  "stats-dist": "distributions",
  "stats-inf":  "inference",
  "ml-core":    "ml-workflow",
  "ml-advanced":"adv-xgboost",
};

// Maps lesson id → which roadmap section task it completes
const LESSON_COMPLETES_TASK = {
  "numpy":          {section:"python-ds",  task:0},
  "pandas-basics":  {section:"python-ds",  task:2},
  "pandas-advanced":{section:"python-ds",  task:3},
  "eda":            {section:"python-ds",  task:4},
  "visualization":  {section:"python-ds",  task:4},
  "sql-basics":     {section:"sql",        task:0},
  "sql-joins":      {section:"sql",        task:3},
  "sql-window":     {section:"sql",        task:4},
  "probability":    {section:"stats-prob", task:0},
  "distributions":  {section:"stats-dist", task:0},
  "correlation":    {section:"stats-inf",  task:4},
  "inference":      {section:"stats-inf",  task:5},
  "ml-workflow":    {section:"ml-core",    task:0},
  "ml-regression":  {section:"ml-core",    task:1},
  "ml-trees":       {section:"ml-core",    task:2},
  "ml-evaluation":  {section:"ml-core",    task:3},
  "ml-overfitting": {section:"ml-core",    task:4},
  "ml-sklearn":     {section:"ml-core",    task:5},
  "adv-xgboost":    {section:"ml-advanced", task:0},
  "adv-lightgbm":   {section:"ml-advanced", task:1},
  "adv-shap":       {section:"ml-advanced", task:2},
  "adv-feature-eng":{section:"ml-advanced", task:3},
  "adv-pipelines":  {section:"ml-advanced", task:4},
  "adv-hypertuning":{section:"ml-advanced", task:5},
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
    <div style={{display:"flex",height:"calc(100vh - 110px)"}}>
      {/* Sidebar */}
      <div style={{width:200,borderRight:`1px solid ${T.border}`,padding:"14px 10px",overflowY:"auto",background:T.bgDeep,flexShrink:0}}>
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
      <div style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
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
      </div>
    </div>
  );
}

export { LearnTab, LESSONS, LEARN_PHASES, SECTION_TO_FIRST_LESSON, LESSON_COMPLETES_TASK };
