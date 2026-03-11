import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection,
  onSnapshot, addDoc, query, orderBy
} from "firebase/firestore";

const T = {
  bg:"#13111a", bgCard:"#1c1927", bgDeep:"#161320",
  border:"#2a2540", borderHi:"#3d3660",
  text:"#e2dff0", textDim:"#8b87a8", textFade:"#4a4665",
  p1:"#7eb8f7", p2:"#6dd6a0", p3:"#f7c96e", p4:"#c792ea",
  gold:"#f7c96e", warn:"#f28b82", good:"#6dd6a0", info:"#7eb8f7",
};
const phaseColors = ["#7eb8f7","#6dd6a0","#f7c96e","#c792ea"];
const ADMIN_EMAIL = "radwanrima0@gmail.com";

// ── LESSON HELPERS
const Code = ({children}) => <code style={{background:"#1a1a2e",color:"#7dd3fc",padding:"2px 7px",borderRadius:"4px",fontFamily:"monospace",fontSize:"0.88em"}}>{children}</code>;
const Block = ({children,label}) => (
  <div style={{margin:"12px 0",borderRadius:"8px",overflow:"hidden",border:"1px solid #1e293b"}}>
    {label && <div style={{background:"#0f172a",color:"#475569",fontSize:"11px",padding:"5px 13px",fontFamily:"monospace",borderBottom:"1px solid #1e293b"}}>{label}</div>}
    <pre style={{background:"#080f1a",margin:0,padding:"12px 14px",color:"#e2e8f0",fontFamily:"monospace",fontSize:"12px",overflowX:"auto",lineHeight:"1.7",whiteSpace:"pre-wrap"}}>{children}</pre>
  </div>
);
const Callout = ({icon,color,title,children}) => (
  <div style={{background:color+"0d",borderLeft:`3px solid ${color}`,borderRadius:"7px",padding:"10px 14px",margin:"12px 0"}}>
    <div style={{color,fontSize:"11px",fontWeight:"700",marginBottom:"4px"}}>{icon} {title}</div>
    <div style={{color:"#94a3b8",fontSize:"13px",lineHeight:"1.7"}}>{children}</div>
  </div>
);
const LP = ({children}) => <p style={{color:"#8b87a8",fontSize:"13px",lineHeight:"1.8",margin:"8px 0"}}>{children}</p>;
const LH = ({children}) => <h3 style={{color:"#e2dff0",fontSize:"15px",fontWeight:"700",margin:"20px 0 6px 0",borderBottom:"1px solid #2a2540",paddingBottom:"5px"}}>{children}</h3>;

// ── QUIZ
function Quiz({questions}) {
  const [answers,setAnswers] = useState({});
  const pick = (qi,opt) => { if(answers[qi]===undefined) setAnswers(a=>({...a,[qi]:opt})); };
  const allDone = questions.every((_,i)=>answers[i]!==undefined);
  const score = questions.filter((q,i)=>answers[i]===q.answer).length;
  return (
    <div style={{marginTop:"20px",background:"#0c1220",border:"1px solid #1e293b",borderRadius:"10px",padding:"16px"}}>
      <div style={{color:"#334155",fontSize:"10px",fontWeight:"700",letterSpacing:"0.1em",marginBottom:"14px"}}>✦ QUICK CHECK</div>
      {questions.map((q,qi)=>{
        const chosen=answers[qi];
        return (
          <div key={qi} style={{marginBottom:"16px"}}>
            <div style={{color:"#e2e8f0",fontSize:"13px",marginBottom:"8px",fontWeight:"500"}}>
              <span style={{color:"#334155",marginRight:"7px"}}>Q{qi+1}.</span>{q.q}
            </div>
            <div style={{display:"grid",gap:"5px"}}>
              {q.options.map(opt=>{
                const isChosen=chosen===opt,isCorrect=opt===q.answer,revealed=chosen!==undefined;
                let bg="#111827",border="#1e293b",color="#64748b";
                if(revealed){
                  if(isCorrect){bg="#052e16";border="#16a34a";color="#4ade80";}
                  else if(isChosen){bg="#2d0707";border="#dc2626";color="#f87171";}
                }
                return <div key={opt} onClick={()=>pick(qi,opt)} style={{padding:"8px 12px",borderRadius:"6px",border:`1px solid ${border}`,background:bg,color,fontSize:"12px",cursor:revealed?"default":"pointer"}}>{revealed&&isCorrect?"✓ ":revealed&&isChosen?"✗ ":""}{opt}</div>;
              })}
            </div>
            {chosen!==undefined&&<div style={{marginTop:"6px",padding:"8px 12px",background:"#0f172a",borderRadius:"5px",color:"#7dd3fc",fontSize:"12px",lineHeight:"1.6"}}>💡 {q.explanation}</div>}
          </div>
        );
      })}
      {allDone&&<div style={{textAlign:"center",paddingTop:"8px",borderTop:"1px solid #1e293b"}}><span style={{color:score===questions.length?"#4ade80":"#f59e0b",fontWeight:"700",fontSize:"15px"}}>{score}/{questions.length} {score===questions.length?"— Perfect! 🎉":"— review explanations above"}</span></div>}
    </div>
  );
}

// ══ LESSONS ══════════════════════════════════════════════════════════════════
const LESSONS = [
  {id:"numpy",phase:"Python for DS",emoji:"🔢",color:"#38bdf8",title:"NumPy Arrays",subtitle:"Why arrays beat loops — the single most important idea",
   body:()=>(
    <div>
      <LP>Imagine 1 million student grades and you want to add 5 bonus points to everyone. In plain Python you'd write a loop. NumPy does it in one line, 100× faster.</LP>
      <LH>List vs Array</LH>
      <Block label="Python list — one at a time">{`grades = [80, 90, 75, 60]
new_grades = [g + 5 for g in grades]   # loop under the hood`}</Block>
      <Block label="NumPy array — ALL at once">{`import numpy as np
grades = np.array([80, 90, 75, 60])
new_grades = grades + 5    # [85, 95, 80, 65]
# This is called a "vectorized operation"`}</Block>
      <Callout icon="🧠" color="#38bdf8" title="Mental model">Think of a NumPy array like an Excel column. A formula applies to the whole column at once. NumPy works the same way.</Callout>
      <LH>Indexing & Slicing</LH>
      <Block label="1D array">{`a = np.array([10, 20, 30, 40, 50])
a[0]    # 10 — first element
a[-1]   # 50 — last element
a[1:4]  # [20, 30, 40] — index 1,2,3
a[::2]  # [10, 30, 50] — every 2nd element`}</Block>
      <Block label="2D array">{`m = np.array([[1,2,3],[4,5,6],[7,8,9]])
m[0]    # [1,2,3] — first row
m[1,2]  # 6 — row 1, col 2
m[:,0]  # [1,4,7] — ALL rows, first column`}</Block>
      <LH>Broadcasting</LH>
      <Block label="Math between different shapes">{`a = np.array([[1,2,3],[4,5,6]])  # shape (2,3)
b = np.array([10,20,30])          # shape (3,)
a + b
# NumPy stretches b across every row:
# [[11,22,33], [14,25,36]]`}</Block>
      <Callout icon="⚠️" color="#f59e0b" title="The #1 mistake">Writing Python loops over NumPy arrays. If you write <Code>for x in my_array</Code>, stop — ask if a NumPy operation can do it. 99% of the time, yes.</Callout>
      <Quiz questions={[
        {q:"grades = np.array([70,80,90]). What does grades * 2 return?",options:["[140,160,180]","Error","[70,80,90,70,80,90]","140"],answer:"[140,160,180]",explanation:"NumPy multiplies every element by 2 at once. No loop needed — this is vectorization."},
        {q:"What does a[1:3] return for a = np.array([5,10,15,20])?",options:["[5,10]","[10,15]","[10,15,20]","[15,20]"],answer:"[10,15]",explanation:"Slice [1:3] includes index 1 and 2, not 3. Index 1=10, index 2=15."},
        {q:"Which is the correct NumPy way to add 100 to every element?",options:["for x in a: x+100","a.add(100)","a+100","np.add_all(a,100)"],answer:"a+100",explanation:"a+100 is the vectorized way. NumPy broadcasts 100 across all elements at once."},
      ]}/>
    </div>
  )},
  {id:"pandas-basics",phase:"Python for DS",emoji:"🐼",color:"#a78bfa",title:"Pandas: Series & DataFrames",subtitle:"The Excel of Python — but actually powerful",
   body:()=>(
    <div>
      <LP>If NumPy is a math machine, Pandas is a smart spreadsheet. You'll use it every single day.</LP>
      <LH>Series — one column of data</LH>
      <Block label="Creating and using a Series">{`import pandas as pd
ages = pd.Series([25,30,22,35], index=["Alice","Bob","Cara","Dan"])
ages["Bob"]      # 30
ages[ages > 28]  # Bob=30, Dan=35 — filtered!`}</Block>
      <LH>DataFrame — a full table</LH>
      <Block label="Essential operations">{`df = pd.DataFrame({
    "name":   ["Alice","Bob","Cara","Dan"],
    "age":    [25,30,22,35],
    "salary": [50000,80000,45000,95000],
    "dept":   ["HR","Eng","HR","Eng"]
})
df.head(2)               # first 2 rows
df.shape                 # (4, 4)
df[df["age"] > 25]       # filter rows
df["bonus"] = df["salary"] * 0.10  # new column`}</Block>
      <LH>groupby — your most used operation</LH>
      <Block label="groupby">{`df.groupby("dept")["salary"].mean()
# dept
# Eng    87500.0
# HR     47500.0`}</Block>
      <LH>merge — joining two tables</LH>
      <Block label="merge = SQL JOIN">{`employees = pd.DataFrame({"id":[1,2,3],"name":["Alice","Bob","Cara"]})
salaries  = pd.DataFrame({"id":[1,2,3],"salary":[50000,80000,45000]})
result = employees.merge(salaries, on="id")`}</Block>
      <Quiz questions={[
        {q:"What does df[df['age'] > 30] do?",options:["Returns columns where age>30","Returns rows where age>30","Deletes rows where age≤30","Raises an error"],answer:"Returns rows where age>30",explanation:"df['age']>30 creates a True/False mask. df[mask] keeps only the True rows."},
        {q:"What is df.groupby('dept')['salary'].mean() computing?",options:["Mean salary of entire dataset","Mean salary for each department","Total salary per department","Nothing — groupby needs .apply()"],answer:"Mean salary for each department",explanation:"groupby splits data by department. .mean() computes the average salary within each group."},
        {q:"df['bonus'] = df['salary'] * 0.1 does what?",options:["Modifies salary column","Creates a new column called bonus","Returns a new DataFrame","Raises KeyError"],answer:"Creates a new column called bonus",explanation:"Assigning to df['new_col'] adds a new column. Each row gets 10% of its salary."},
      ]}/>
    </div>
  )},
  {id:"pandas-advanced",phase:"Python for DS",emoji:"🔗",color:"#34d399",title:"Nulls, Apply & Method Chaining",subtitle:"Writing clean Pandas — no mess, no loops",
   body:()=>(
    <div>
      <LP>Real data is always dirty. Method chaining lets you handle all of it in one clean, readable pipeline.</LP>
      <LH>Handling Null values</LH>
      <Block label="Finding and fixing nulls">{`df.isnull().sum()                    # count nulls per column
df.dropna()                          # remove rows with ANY null
df.dropna(subset=["salary"])         # only where salary is null
df["age"].fillna(df["age"].mean())   # fill with column average
df["dept"].fillna("Unknown")         # fill with fixed string`}</Block>
      <Callout icon="🧠" color="#34d399" title="Mental model">NaN is a hole in a spreadsheet cell. Delete the row (dropna) or patch the hole (fillna). Deleting loses data. Filling can introduce bias.</Callout>
      <LH>apply — custom transformations</LH>
      <Block label="apply examples">{`df["band"] = df["salary"].apply(
    lambda s: "Junior" if s<50000 else ("Mid" if s<80000 else "Senior")
)

# Apply to each ROW (axis=1):
df["summary"] = df.apply(
    lambda row: f"{row['name']} is {row['age']} years old", axis=1
)`}</Block>
      <LH>Method Chaining</LH>
      <Block label="Clean pipeline">{`result = (
    df
    .query("dept == 'Eng'")
    .dropna(subset=["salary"])
    .assign(bonus=lambda x: x["salary"] * 0.1)
    .sort_values("salary", ascending=False)
    .reset_index(drop=True)
)`}</Block>
      <Callout icon="★" color="#f7c96e" title="Gold rule">Use <Code>.assign()</Code> inside chains, not <Code>df['col'] = ...</Code>. Direct assignment breaks the chain.</Callout>
      <Quiz questions={[
        {q:"What does df.isnull().sum() tell you?",options:["Whether the DataFrame is empty","Number of nulls per column","Sum of all numeric columns","Total number of rows"],answer:"Number of nulls per column",explanation:"isnull() returns True/False per cell. sum() adds up Trues per column."},
        {q:"When would you use apply() over a built-in method?",options:["Always — apply() is faster","When you need custom logic no built-in handles","Only for string columns","Never — it's deprecated"],answer:"When you need custom logic no built-in handles",explanation:"apply() runs any Python function over your data. But always check for a built-in first — they're much faster."},
        {q:"What is the advantage of method chaining?",options:["Faster execution","Avoids unnecessary intermediate variables, reads like a pipeline","Uses less memory","Required for Pandas to work"],answer:"Avoids unnecessary intermediate variables, reads like a pipeline",explanation:"Chaining keeps code clean and readable. The transformation story is obvious top to bottom."},
      ]}/>
    </div>
  )},
  {id:"eda",phase:"Python for DS",emoji:"🔍",color:"#f472b6",title:"Exploratory Data Analysis",subtitle:"Understand your data before touching a model",
   body:()=>(
    <div>
      <LP>EDA is what you do before any modeling. Every senior DS spends more time on EDA than on modeling.</LP>
      <Callout icon="🧠" color="#f472b6" title="The mindset">You're a detective. The data is the crime scene. Understand what's there, what's missing, what's weird — before assuming anything.</Callout>
      <LH>Step 1 — First look (always in this order)</LH>
      <Block label="The EDA starter pack">{`df = pd.read_csv("your_data.csv")
df.shape          # rows and columns?
df.head(10)       # what does raw data look like?
df.dtypes         # what type is each column?
df.isnull().sum() # how many missing per column?
df.describe()     # min, max, mean, std for numerics
df.nunique()      # how many unique values per column?`}</Block>
      <Callout icon="💡" color="#38bdf8" title="What to look for in df.describe()"><strong style={{color:"#fff"}}>min/max:</strong> impossible values? (age=-5)<br/><strong style={{color:"#fff"}}>mean vs median (50%):</strong> far apart = skewed data = outliers.<br/><strong style={{color:"#fff"}}>std:</strong> very large = high spread.</Callout>
      <LH>Step 2 — Find outliers (IQR rule)</LH>
      <Block label="IQR outlier detection">{`Q1 = df["salary"].quantile(0.25)
Q3 = df["salary"].quantile(0.75)
IQR = Q3 - Q1
outliers = df[
    (df["salary"] < Q1 - 1.5 * IQR) |
    (df["salary"] > Q3 + 1.5 * IQR)
]
print(f"{len(outliers)} outliers found")`}</Block>
      <LH>Step 3 — Understand relationships</LH>
      <Block label="Correlation and group breakdowns">{`df.corr()["salary"].sort_values(ascending=False)
df.groupby("dept")["salary"].describe()
pd.crosstab(df["dept"], df["churned"])`}</Block>
      <Callout icon="★" color="#f7c96e" title="The gold habit">Before touching a model, write 5 questions about the data. Answer each one in Pandas. This forces real understanding — not just running code.</Callout>
      <Quiz questions={[
        {q:"You get a new dataset. What should you run FIRST?",options:["Start training a model","df.shape, df.head(), df.dtypes, df.isnull().sum()","df.corr() to find relationships","Remove all null values immediately"],answer:"df.shape, df.head(), df.dtypes, df.isnull().sum()",explanation:"Always understand the data before touching it. Shape, raw values, types, and missingness are your first four questions."},
        {q:"df['salary'].mean() is much larger than df['salary'].median(). What does this tell you?",options:["Data is normally distributed","Outliers are pulling the mean up (right skew)","Column has null values","mean and median should always match"],answer:"Outliers are pulling the mean up (right skew)",explanation:"Mean is sensitive to outliers, median is not. A big gap means extreme high values exist — classic right skew."},
        {q:"What is the IQR method used for?",options:["Imputing missing values","Detecting outliers","Normalizing data","Computing correlation"],answer:"Detecting outliers",explanation:"IQR = Q3 - Q1. Points below Q1-1.5*IQR or above Q3+1.5*IQR are flagged as outliers."},
      ]}/>
    </div>
  )},
  {id:"visualization",phase:"Python for DS",emoji:"📊",color:"#fb923c",title:"Matplotlib & Seaborn",subtitle:"Turning numbers into pictures people understand",
   body:()=>(
    <div>
      <LP>Every insight you find, every result you present — you need to visualize it. Not optional in a DS role.</LP>
      <Callout icon="🧠" color="#fb923c" title="Matplotlib vs Seaborn"><strong style={{color:"#fff"}}>Matplotlib:</strong> Foundation. More control, more verbose.<br/><strong style={{color:"#fff"}}>Seaborn:</strong> Built on Matplotlib. Beautiful defaults, less code. Start here.</Callout>
      <LH>Which chart to use when</LH>
      <Block label="Chart decision guide">{`# ONE numeric column    → Histogram (distribution)
# ONE categorical column → Bar chart (counts)
# TWO numeric columns    → Scatter plot (relationship)
# ONE numeric + ONE cat  → Box plot (compare groups)
# TREND over time        → Line chart
# MANY numeric columns   → Heatmap (correlations)`}</Block>
      <LH>Histogram</LH>
      <Block label="Histogram">{`import seaborn as sns
import matplotlib.pyplot as plt

sns.histplot(df["salary"], bins=30, kde=True)
plt.title("Salary Distribution")
plt.show()`}</Block>
      <LH>Scatter plot</LH>
      <Block label="Scatter plot">{`sns.scatterplot(x="age", y="salary", hue="dept", data=df)
# Each department gets a different color`}</Block>
      <LH>Box plot</LH>
      <Block label="Box plot">{`sns.boxplot(x="dept", y="salary", data=df)
# Box = middle 50%, line = median, dots = outliers`}</Block>
      <LH>Correlation heatmap</LH>
      <Block label="Heatmap">{`corr = df.select_dtypes(include="number").corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0)`}</Block>
      <Callout icon="★" color="#f7c96e" title="Golden rule">Every chart needs: a clear title, labeled axes, and a takeaway readable in 5 seconds.</Callout>
      <Quiz questions={[
        {q:"You want to see the relationship between hours_studied and exam_score. Which chart?",options:["Histogram","Bar chart","Scatter plot","Box plot"],answer:"Scatter plot",explanation:"Scatter plots show the relationship between two numeric variables. Each dot is one student."},
        {q:"Compare salary across 4 departments, showing median AND outliers. Which chart?",options:["Line chart","Histogram","Scatter plot","Box plot"],answer:"Box plot",explanation:"Box plots show median, spread, and outliers all in one chart per group."},
        {q:"A heatmap cell shows -0.85 between temperature and hot_drinks_sold. What does this mean?",options:["No relationship","As temperature goes up, hot drinks go down","As temperature goes up, hot drinks go up","Data has errors"],answer:"As temperature goes up, hot drinks go down",explanation:"-0.85 is a strong negative correlation. Hot days = fewer hot drinks."},
      ]}/>
    </div>
  )},
  {id:"sql-basics",phase:"SQL",emoji:"🗄️",color:"#fb923c",title:"SQL Foundations",subtitle:"SELECT, WHERE, GROUP BY — the 80% you use daily",
   body:()=>(
    <div>
      <LP>SQL is how you talk to a database. Every DS interview has SQL. Words always go in this fixed order.</LP>
      <Callout icon="🧠" color="#fb923c" title="The golden order"><strong style={{color:"#fff"}}>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT</strong><br/>Break this order and SQL refuses to run.</Callout>
      <Block label="Core queries">{`SELECT name, salary * 1.1 AS salary_with_raise FROM employees;

SELECT name FROM employees
WHERE salary > 70000 AND department = 'Engineering';

SELECT department, COUNT(*) AS num_employees,
       AVG(salary) AS avg_salary
FROM employees
GROUP BY department;`}</Block>
      <LH>HAVING — filtering groups</LH>
      <Callout icon="🧠" color="#fb923c" title="WHERE vs HAVING">WHERE filters rows BEFORE grouping. HAVING filters groups AFTER grouping. You cannot use AVG/SUM in WHERE.</Callout>
      <Block label="HAVING example">{`SELECT department, AVG(salary) AS avg_sal
FROM employees
GROUP BY department
HAVING AVG(salary) > 75000;`}</Block>
      <LH>CASE WHEN — if/else in SQL</LH>
      <Block label="CASE WHEN">{`SELECT name, salary,
  CASE
    WHEN salary < 50000 THEN 'Junior'
    WHEN salary < 80000 THEN 'Mid'
    ELSE 'Senior'
  END AS level
FROM employees;`}</Block>
      <Quiz questions={[
        {q:"You want departments where average salary > 80,000. Which clause?",options:["WHERE","HAVING","GROUP BY","ORDER BY"],answer:"HAVING",explanation:"HAVING filters after grouping. WHERE can't use aggregate functions like AVG()."},
        {q:"What does COUNT(*) do?",options:["Counts non-null values in a column","Counts ALL rows including nulls","Counts distinct values","Sums numeric columns"],answer:"Counts ALL rows including nulls",explanation:"COUNT(*) counts every row. COUNT(column) skips nulls in that specific column."},
        {q:"SELECT name FROM employees WHERE salary > 60000 ORDER BY salary DESC LIMIT 3 — what returns?",options:["All employees over 60k","3 lowest-paid over 60k","3 highest-paid over 60k","Error"],answer:"3 highest-paid over 60k",explanation:"WHERE filters, ORDER BY DESC sorts highest first, LIMIT 3 keeps top 3."},
      ]}/>
    </div>
  )},
  {id:"sql-joins",phase:"SQL",emoji:"🔀",color:"#f472b6",title:"SQL JOINs & CTEs",subtitle:"Connecting tables — tested in every DS interview",
   body:()=>(
    <div>
      <LP>Real databases never keep all information in one table. JOINs connect them. Most tested SQL concept in DS interviews.</LP>
      <Block label="Tables">{`-- employees                  -- departments
id | name   | dept_id         dept_id | dept_name
1  | Alice  | 1               1       | Engineering
2  | Bob    | 2               2       | Marketing
3  | Cara   | NULL
4  | Dan    | 99              (99 doesn't exist!)`}</Block>
      <LH>INNER JOIN</LH>
      <Block label="Only matching rows">{`SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;
-- Only Alice and Bob. Cara and Dan are dropped.`}</Block>
      <LH>LEFT JOIN</LH>
      <Block label="Keep ALL left rows">{`SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id;
-- Alice | Engineering
-- Bob   | Marketing
-- Cara  | NULL   ← kept
-- Dan   | NULL   ← kept`}</Block>
      <LH>CTEs</LH>
      <Block label="WITH statement">{`WITH dept_averages AS (
    SELECT dept_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY dept_id
)
SELECT d.dept_name, da.avg_salary
FROM dept_averages da
JOIN departments d ON da.dept_id = d.dept_id;`}</Block>
      <Callout icon="★" color="#f7c96e" title="Interview gold">When given a complex SQL problem, write a CTE first. It signals you can decompose a problem cleanly.</Callout>
      <Quiz questions={[
        {q:"You want ALL customers, even those with no orders. Which join?",options:["INNER JOIN","RIGHT JOIN","LEFT JOIN","FULL OUTER JOIN"],answer:"LEFT JOIN",explanation:"LEFT JOIN keeps ALL rows from the left table. Non-matching rows get NULL in order columns."},
        {q:"INNER JOIN returns rows where...",options:["All left rows","All right rows","Only rows with a match in BOTH tables","All rows from both tables"],answer:"Only rows with a match in BOTH tables",explanation:"INNER JOIN is the most restrictive — rows with no match on either side are dropped."},
        {q:"Main advantage of a CTE over a subquery?",options:["CTEs are faster","CTEs are named, readable, and reusable","Subqueries can't join","No difference"],answer:"CTEs are named, readable, and reusable",explanation:"CTEs live at the top with WITH, have a clear name, and make complex queries step-by-step readable."},
      ]}/>
    </div>
  )},
  {id:"sql-window",phase:"SQL",emoji:"🪟",color:"#c084fc",title:"Window Functions",subtitle:"ROW_NUMBER, LAG, LEAD — the advanced tier",
   body:()=>(
    <div>
      <LP>Window functions separate people who "know SQL" from people who are dangerous with SQL.</LP>
      <Callout icon="🧠" color="#c084fc" title="Key difference from GROUP BY">GROUP BY collapses rows. Window functions keep all rows but add a new computed column per row. No collapsing.</Callout>
      <LH>ROW_NUMBER — classic interview pattern</LH>
      <Block label="Top earner per department">{`WITH ranked AS (
    SELECT name, dept, salary,
           ROW_NUMBER() OVER (
               PARTITION BY dept
               ORDER BY salary DESC
           ) AS rn
    FROM employees
)
SELECT * FROM ranked WHERE rn = 1;`}</Block>
      <LH>RANK vs ROW_NUMBER vs DENSE_RANK</LH>
      <Block label="When there are ties">{`-- ROW_NUMBER:  1, 2, 3  — always unique
-- RANK:        1, 1, 3  — ties share rank, next skipped
-- DENSE_RANK:  1, 1, 2  — ties share rank, no skipping`}</Block>
      <LH>LAG & LEAD</LH>
      <Block label="Month-over-month change">{`SELECT month, revenue,
  LAG(revenue,1) OVER (ORDER BY month) AS prev_month,
  revenue - LAG(revenue,1) OVER (ORDER BY month) AS change
FROM monthly_sales;`}</Block>
      <LH>SUM OVER — running totals</LH>
      <Block label="Running total">{`SELECT month, revenue,
  SUM(revenue) OVER (ORDER BY month) AS running_total
FROM monthly_sales;`}</Block>
      <Quiz questions={[
        {q:"What does PARTITION BY do in a window function?",options:["Same as GROUP BY — collapses rows","Splits data into groups for calculation without removing rows","Filters rows","Sorts output"],answer:"Splits data into groups for calculation without removing rows",explanation:"PARTITION BY defines the window group. Unlike GROUP BY, all original rows stay in the result."},
        {q:"You need the 2nd highest salary per department. Which works?",options:["WHERE salary = MAX(salary)-1","ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) then WHERE rn=2","RANK() WHERE rank=2 directly","GROUP BY dept HAVING salary=2nd"],answer:"ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) then WHERE rn=2",explanation:"Rank within each department using ROW_NUMBER in a CTE, then filter WHERE rn=2."},
        {q:"LAG(revenue, 1) gives you:",options:["Next row's revenue","Revenue 1% lower","Revenue from the previous row","Revenue lagging by a month automatically"],answer:"Revenue from the previous row",explanation:"LAG looks backwards. LAG(col,1) = one row before. LEAD looks forward."},
      ]}/>
    </div>
  )},
  {id:"probability",phase:"Statistics",emoji:"🎲",color:"#818cf8",title:"Probability",subtitle:"From coin flips to Bayes — building real intuition",
   body:()=>(
    <div>
      <LP>Probability is about building intuition for uncertainty. Every ML model makes probabilistic predictions.</LP>
      <LH>Basic probability</LH>
      <Block label="Core definition">{`P(event) = ways it can happen / total possible outcomes
P(rolling a 4 on a die) = 1/6
P(rolling even)          = 3/6 = 0.5
P(not rolling a 4) = 1 - 1/6 = 5/6   # complement rule`}</Block>
      <LH>Conditional Probability</LH>
      <LP>P(A|B) = "probability of A given that B already happened."</LP>
      <Callout icon="🧠" color="#818cf8" title="Real example">52 cards. P(Ace) = 4/52. If I tell you it's a spade, P(Ace|Spade) = 1/13. Extra information changed the probability.</Callout>
      <Block label="Formula">{`P(A|B) = P(A and B) / P(B)
# 100 employees. 40 engineers. 10 senior engineers.
P(senior | engineer) = (10/100) / (40/100) = 25%`}</Block>
      <LH>Bayes Theorem</LH>
      <Block>{`P(A|B) = P(B|A) × P(A) / P(B)`}</Block>
      <Callout icon="🧠" color="#818cf8" title="Bayes — the result surprises most people">Disease affects 1% of people. Test is 90% accurate. You test positive. Probability you have it?<br/><br/>Intuition says "90%." Bayes says: <strong style={{color:"#f87171"}}>only ~8.3%</strong>.<br/><br/>Why? The disease is so rare that most positives are false positives from the healthy 99%. This is why base rates matter enormously in ML.</Callout>
      <Quiz questions={[
        {q:"P(not raining) = 0.7. What is P(raining)?",options:["0.7","0.3","0.07","Can't determine"],answer:"0.3",explanation:"P(not A) = 1 - P(A). P(raining) = 1 - 0.7 = 0.3."},
        {q:"If A and B are independent, P(A and B) equals:",options:["P(A)+P(B)","P(A)×P(B)","P(A|B)","P(A)/P(B)"],answer:"P(A)×P(B)",explanation:"Independence means one event doesn't affect the other. Simply multiply individual probabilities."},
        {q:"Bayes theorem is most useful for:",options:["Computing averages","Updating belief about a cause after seeing evidence","Computing probability of independent events","Sorting data"],answer:"Updating belief about a cause after seeing evidence",explanation:"Bayes = update. Start with a prior belief, see evidence, get the updated (posterior) probability."},
      ]}/>
    </div>
  )},
  {id:"distributions",phase:"Statistics",emoji:"📈",color:"#fbbf24",title:"Distributions",subtitle:"Normal, Binomial, Poisson — and the CLT",
   body:()=>(
    <div>
      <LP>Learn the story each distribution tells and when it appears in real life — not the formulas.</LP>
      <LH>Normal Distribution</LH>
      <Callout icon="🌍" color="#fbbf24" title="When it appears">Heights, IQ scores, measurement errors. Anything that results from many small independent effects added together.</Callout>
      <Block label="68-95-99.7 rule — memorize this">{`# Heights: mean=170cm, std=10cm
# 68% between 160–180cm  (mean ± 1 std)
# 95% between 150–190cm  (mean ± 2 std)
# 99.7% between 140–200cm (mean ± 3 std)`}</Block>
      <LH>Binomial Distribution</LH>
      <Callout icon="🌍" color="#fbbf24" title="Real examples">How many of 1000 customers click an ad (CTR=3%)? How many coins land heads in 100 flips?</Callout>
      <Block label="Binomial in Python">{`from scipy.stats import binom
binom.pmf(k=3, n=10, p=0.3)  # P(exactly 3 of 10 buy, each 30% chance)
# Expected = n × p = 10 × 0.3 = 3`}</Block>
      <LH>Poisson Distribution</LH>
      <Callout icon="🌍" color="#fbbf24" title="Real examples">Server crashes per day. Support calls per hour. Typos per page.</Callout>
      <Block label="Poisson in Python">{`from scipy.stats import poisson
poisson.pmf(k=4, mu=2)  # P(4 crashes, avg=2/day) ≈ 9%`}</Block>
      <LH>Central Limit Theorem</LH>
      <Callout icon="🧠" color="#818cf8" title="Three ways to understand CLT"><strong style={{color:"#fff"}}>Way 1:</strong> Take any population — even non-normal. Take many samples and plot their means — they form a normal distribution.<br/><br/><strong style={{color:"#fff"}}>Way 2:</strong> This is why A/B tests work. CLT guarantees the distribution of mean differences is approximately normal.<br/><br/><strong style={{color:"#fff"}}>Way 3:</strong> Averages are more stable than individual values. The more you average, the more normal the result becomes.</Callout>
      <Quiz questions={[
        {q:"Heights: mean=170, std=10. What % are between 160 and 180cm?",options:["50%","68%","95%","99.7%"],answer:"68%",explanation:"160–180 is mean ± 1 std. The 68-95-99.7 rule says 68% falls within 1 standard deviation."},
        {q:"Counting support tickets per hour — which distribution?",options:["Normal","Binomial","Poisson","Uniform"],answer:"Poisson",explanation:"Poisson models counts of events in a fixed time period."},
        {q:"The CLT says the distribution of sample means...",options:["Is always uniform","Approaches normal as sample size grows, regardless of original distribution","Only works if original data is normal","Equals the population distribution"],answer:"Approaches normal as sample size grows, regardless of original distribution",explanation:"Works for ANY distribution. That's why statistical tests work in practice."},
      ]}/>
    </div>
  )},
  {id:"correlation",phase:"Statistics",emoji:"🔗",color:"#2dd4bf",title:"Correlation vs Causation",subtitle:"The mistake that gets candidates eliminated in interviews",
   body:()=>(
    <div>
      <LP>This comes up in nearly every DS interview. Getting it wrong reveals a fundamental misunderstanding of data.</LP>
      <LH>What is correlation?</LH>
      <Block label="Correlation values">{`# +1.0 : perfect positive  (X up → Y up perfectly)
# +0.7 : strong positive
#  0.0 : no linear relationship
# -0.9 : strong negative  (X up → Y down)

df["age"].corr(df["salary"])  # two columns
df.corr()                      # all pairs`}</Block>
      <Callout icon="⚠️" color="#f43f5e" title="The most important distinction in data science">Just because two things move together does NOT mean one causes the other.</Callout>
      <LH>Famous spurious correlations</LH>
      <Block>{`# Ice cream sales and drowning rates are correlated.
# Cause? Hot weather increases BOTH.

# More TVs per household → longer lifespans.
# Cause? Wealth increases BOTH.

# Nicolas Cage films per year correlates with pool drownings.
# Pure coincidence.`}</Block>
      <LH>Three reasons variables can be correlated</LH>
      <Block>{`# 1. A causes B (real causation — proven experimentally)
# 2. B causes A (reverse causation)
# 3. C causes BOTH (confounding variable — the most common trap)`}</Block>
      <Callout icon="🧠" color="#2dd4bf" title="How to establish causation">Random assignment eliminates confounders. This is exactly what an A/B test does. That's why A/B tests are so powerful.</Callout>
      <Callout icon="★" color="#f7c96e" title="Interview language">In observational data, always say "associated with" not "causes." You CANNOT say "X causes Y" without randomized experimental evidence.</Callout>
      <Quiz questions={[
        {q:"Correlation 0.82 between shoe size and reading ability in children. Most likely explanation?",options:["Big feet cause better reading","Better reading causes bigger feet","Age causes both","This correlation must be wrong"],answer:"Age causes both",explanation:"Classic confounding variable. Age drives both shoe size and reading ability."},
        {q:"Company finds coffee drinkers perform better. They conclude 'coffee improves performance.' What's wrong?",options:["Nothing — the correlation proves it","Correlation doesn't establish causation — a third factor could cause both","Coffee data is unreliable","They need a larger sample"],answer:"Correlation doesn't establish causation — a third factor could cause both",explanation:"To establish causation, you'd need a randomized experiment: randomly assign employees to drink coffee."},
        {q:"Which gives the strongest evidence for causation?",options:["A large observational dataset","A high correlation (r > 0.9)","A randomized controlled experiment (A/B test)","A regression with many variables"],answer:"A randomized controlled experiment (A/B test)",explanation:"Random assignment eliminates confounders. No observational data can establish causation."},
      ]}/>
    </div>
  )},
  {id:"inference",phase:"Statistics",emoji:"🧪",color:"#f87171",title:"Statistical Inference & A/B Testing",subtitle:"Hypothesis testing, p-values — no hand-waving",
   body:()=>(
    <div>
      <LP>A/B testing is one of the most common DS tasks at product companies. Most candidates get the definitions wrong under pressure.</LP>
      <LH>The framework</LH>
      <Block label="Hypotheses">{`H₀ (Null): "Nothing is happening. No effect."
H₁ (Alternative): "There IS an effect."
# Assume H₀ is true, then ask: how surprising is my data?`}</Block>
      <LH>p-value — get this exact definition right</LH>
      <Callout icon="⚠️" color="#f87171" title="The most common interview mistake"><strong style={{color:"#fff"}}>WRONG:</strong> "The p-value is the probability the null hypothesis is true."<br/><strong style={{color:"#4ade80"}}>CORRECT:</strong> The probability of seeing a result this extreme, assuming H₀ is true.</Callout>
      <LH>Type I and Type II Errors</LH>
      <Block>{`# Type I  (False Positive): Reality=no effect, you say there IS one
# Type II (False Negative): Reality=real effect, you miss it`}</Block>
      <LH>Practical vs Statistical Significance</LH>
      <Block>{`# 10M users: control=10.000%, treatment=10.001%
# p-value=0.001 (significant!) but lift=0.001% — worthless
# Always report BOTH: p-value AND effect size`}</Block>
      <LH>A/B Test end to end</LH>
      <Block label="Complete process">{`# 1. DESIGN — calculate needed sample size BEFORE running
# 2. RUN — split users randomly
# 3. ANALYZE — only AFTER reaching target sample size
from scipy import stats
t_stat, p_value = stats.ttest_ind(control_data, treatment_data)

if p_value < 0.05:
    print(f"Significant. Effect: {treat_mean - ctrl_mean:.3f}")
else:
    print("Not significant. Fail to reject H₀.")`}</Block>
      <Quiz questions={[
        {q:"A p-value of 0.02 means:",options:["2% chance H₀ is true","98% chance result is real","If H₀ were true, 2% chance of seeing data this extreme","Effect size is 2%"],answer:"If H₀ were true, 2% chance of seeing data this extreme",explanation:"p-value is always 'assuming H₀ is true, how probable is this data?' It says nothing directly about whether H₀ is actually true."},
        {q:"A/B test: p=0.001 on 50M users, lift=0.0005%. What do you tell the PM?",options:["Ship it — it's significant","Statistically significant but practically negligible — not worth shipping","Run it longer","Test was invalid"],answer:"Statistically significant but practically negligible — not worth shipping",explanation:"With huge samples, tiny meaningless differences become significant. Always pair p-value with effect size."},
        {q:"Type II Error means:",options:["Rejecting a true null hypothesis","Failing to detect a real effect that exists","Setting alpha too low","Getting p-value of exactly 0.05"],answer:"Failing to detect a real effect that exists",explanation:"Type II = False Negative = missed a real effect. Usually caused by sample size being too small."},
      ]}/>
    </div>
  )},
];

const LEARN_PHASES = [
  {label:"🐍 Python for DS", ids:["numpy","pandas-basics","pandas-advanced","eda","visualization"]},
  {label:"🗄️ SQL",           ids:["sql-basics","sql-joins","sql-window"]},
  {label:"📐 Statistics",    ids:["probability","distributions","correlation","inference"]},
];

// Maps roadmap section id → first lesson to open when "Study this" is clicked
const SECTION_TO_FIRST_LESSON = {
  "python-ds":  "numpy",
  "sql":        "sql-basics",
  "stats-prob": "probability",
  "stats-dist": "distributions",
  "stats-inf":  "inference",
};

// Maps lesson id → which roadmap section task it completes (section id + task index)
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

// ══ ALL ORIGINAL CODE (unchanged) ════════════════════════════════════════════

const sectionProjects = {
  "python-core": [{type:"coding",title:"Data Cleaner Script",desc:"Write a Python script that takes a messy CSV, cleans it (handle nulls, fix types, remove duplicates), and outputs a clean version. No pandas yet — base Python only."},{type:"coding",title:"File Organizer",desc:"Build a script that reads a folder and sorts files into subfolders by extension, date, or size."}],
  "python-ds": [{type:"dataset",title:"Pandas 30-Question Challenge",desc:"Load the NYC Airbnb dataset. Answer 30 progressively harder questions using only Pandas.",url:"https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data"},{type:"coding",title:"NumPy Matrix Operations",desc:"Implement matrix multiplication, dot product, and cosine similarity from scratch using NumPy."}],
  "sql": [{type:"dataset",title:"Business KPI Dashboard in SQL",desc:"Using Chinook, write 10 SQL queries answering real business questions. Use CTEs and window functions.",url:"https://github.com/lerocha/chinook-database"},{type:"coding",title:"SQL Murder Mystery",desc:"Solve a detective story entirely using SQL queries.",url:"https://mystery.knightlab.com"}],
  "stats-prob": [{type:"coding",title:"Bayes Spam Filter",desc:"Build a Naive Bayes spam classifier using only Python and probability math. No sklearn."},{type:"coding",title:"Monte Carlo Simulations",desc:"Use random simulation to estimate π, birthday paradox probability, and expected value of a dice game."}],
  "stats-dist": [{type:"coding",title:"Distribution Fitting",desc:"Take 3 real datasets. Plot histogram, identify best-fit distribution, fit with scipy, verify with Q-Q plot."},{type:"coding",title:"CLT Visualizer",desc:"Demonstrate the CLT: sample from non-normal distributions in increasing sample sizes and visualize."}],
  "stats-inf": [{type:"dataset",title:"A/B Test from Scratch",desc:"Calculate test statistic, p-value, and CI using only numpy — no scipy. Then verify with scipy.",url:"https://www.kaggle.com/datasets/zhangluyuan/ab-testing"}],
  "linalg": [{type:"coding",title:"PCA from Scratch",desc:"Implement PCA using NumPy: center data, compute covariance matrix, find eigenvectors, project data."}],
  "ml-framework": [{type:"coding",title:"Overfit Then Fix",desc:"Deliberately overfit a decision tree. Then apply regularization, cross-validation, early stopping."}],
  "ml-regression": [{type:"coding",title:"Linear Regression from Scratch",desc:"Implement OLS and gradient descent, compare both against sklearn.",url:"https://www.kaggle.com/c/house-prices-advanced-regression-techniques"}],
  "ml-class": [{type:"dataset",title:"Fraud Detection Challenge",desc:"Handle 99.8% class imbalance. Optimize for recall.",url:"https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud"}],
  "ml-unsupervised": [{type:"dataset",title:"Customer Segmentation",desc:"Use KMeans on e-commerce data. Interpret each cluster in business terms.",url:"https://www.kaggle.com/datasets/carrie1/ecommerce-data"}],
  "ml-pipeline": [{type:"coding",title:"Reproducible Pipeline",desc:"Refactor a messy notebook into clean Python modules. One command to run all."}],
  "feature-eng": [{type:"dataset",title:"Kaggle Feature Engineering Sprint",desc:"Enter a Kaggle tabular competition. Spend 3 days ONLY on feature engineering.",url:"https://www.kaggle.com/competitions"}],
  "dl-nn": [{type:"coding",title:"Neural Net from Scratch",desc:"2-layer NN in NumPy only. Forward pass, backprop, gradient descent. Train on MNIST, reach >90%."}],
  "dl-cnn": [{type:"dataset",title:"Transfer Learning Fine-tune",desc:"Fine-tune pretrained ResNet18 on a dataset of your choice.",url:"https://www.kaggle.com/datasets"}],
  "dl-nlp": [{type:"dataset",title:"Fine-tune BERT",desc:"Fine-tune DistilBERT on text classification. Compare vs TF-IDF + Logistic Regression baseline.",url:"https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews"}],
  "llm": [{type:"coding",title:"Build a RAG System",desc:"Document Q&A: load PDFs, chunk, embed, store in FAISS, retrieve on query, generate answers with LLM."}],
  "mlops": [{type:"coding",title:"Containerize & Deploy",desc:"Wrap your best model in FastAPI, containerize with Docker, deploy to Railway or Render."}],
  "dataviz": [{type:"coding",title:"Remake a Bad Chart",desc:"Find a confusing chart online. Identify what's wrong. Rebuild as clear visualization.",url:"https://www.reddit.com/r/dataisugly/"}],
  "portfolio": [{type:"portfolio",title:"5-Slide Business Deck per Project",desc:"For each project: Problem → Data → Approach → Results → Recommendation. Present as if to a VP."}],
  "int-sql": [{type:"coding",title:"Timed SQL Sprint",desc:"30-minute timer. 3 hard StrataScratch problems, no autocomplete.",url:"https://www.stratascratch.com"}],
  "int-stats": [{type:"coding",title:"Stats Verbal Drill",desc:"Record yourself answering 5 questions out loud: p-values, A/B test design, CLT, Type I/II errors."}],
  "int-ml": [{type:"coding",title:"Algorithm Explainer Cards",desc:"For each algorithm: 150-word explanation covering intuition, assumptions, failure modes, tuning."}],
  "int-case": [{type:"coding",title:"Case Study Mock",desc:"20-minute timer. Design a recommendation system for Netflix out loud. Record yourself."}],
  "networking": [{type:"portfolio",title:"LinkedIn Content Plan",desc:"4 posts over 4 weeks: something learned, a project, a mistake and fix, a concept explained simply."}],
};

const typeColors = {coding:"#7eb8f7",dataset:"#6dd6a0",portfolio:"#c792ea"};
const typeLabels = {coding:"⌨ Coding",dataset:"📈 Dataset",portfolio:"🚀 Portfolio"};

const portfolioProjects = [
  {id:"proj-python",phase:1,type:"coding",difficulty:"Beginner",title:"Data Cleaner & EDA Tool",description:"Build a Python script that takes any messy CSV, cleans it, and outputs a full EDA report.",dataset:{name:"NYC Airbnb Dataset",url:"https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data"},steps:["Load CSV with pandas and inspect: shape, dtypes, nulls","Handle missing values: drop or impute with justification","Fix data types (dates, categories, numerics)","Remove duplicates","Generate 10 insights using groupby and aggregations","Plot 5 charts: distributions, correlations, outliers","Export clean CSV and a summary text file"],skills:["Python","Pandas","Matplotlib","File I/O"],portfolioWorthy:false},
  {id:"proj-sql-kpi",phase:1,type:"dataset",difficulty:"Beginner",title:"Business KPI Dashboard in SQL",description:"Answer 10 real business questions using SQL on a real database.",dataset:{name:"Chinook Music Database",url:"https://github.com/lerocha/chinook-database"},steps:["Set up the Chinook database locally","Write queries for: top 10 customers by revenue, monthly sales trend, best-selling genres","Use CTEs for multi-step logic","Use window functions: rank artists by sales, month-over-month growth","Write one query using all of: JOIN, GROUP BY, HAVING, CTE, window function","Export results and write a 1-page business summary"],skills:["SQL","CTEs","Window Functions","Business Thinking"],portfolioWorthy:false},
  {id:"proj-stats",phase:1,type:"coding",difficulty:"Beginner",title:"A/B Test from Scratch",description:"Run a complete A/B test using only NumPy — no scipy shortcuts.",dataset:{name:"A/B Test Dataset",url:"https://www.kaggle.com/datasets/zhangluyuan/ab-testing"},steps:["Load and explore the dataset","Calculate conversion rates for control and treatment","Compute test statistic manually using NumPy","Calculate p-value from scratch","Compute 95% confidence interval manually","Verify all results match scipy output","Write a recommendation memo"],skills:["Statistics","NumPy","Hypothesis Testing","Python"],portfolioWorthy:false},
  {id:"proj-churn",phase:2,type:"portfolio",difficulty:"Beginner",title:"Customer Churn Predictor",description:"Build an end-to-end churn prediction model with full business framing.",dataset:{name:"Telco Customer Churn",url:"https://www.kaggle.com/datasets/blastchar/telco-customer-churn"},steps:["EDA: visualize churn rate by contract type, tenure, and monthly charges","Feature engineering: encode categoricals, create tenure buckets","Train Logistic Regression, Random Forest, XGBoost","Optimize for recall","Calculate ROI of retaining churners","Deploy as a Streamlit app","Write a 5-slide business summary"],skills:["Python","Pandas","sklearn","XGBoost","Streamlit"],portfolioWorthy:true},
  {id:"proj-abtest",phase:2,type:"dataset",difficulty:"Intermediate",title:"A/B Test Full Analysis",description:"Analyze a real A/B test end-to-end. Go beyond the p-value.",dataset:{name:"A/B Test Dataset",url:"https://www.kaggle.com/datasets/zhangluyuan/ab-testing"},steps:["Calculate conversion rates for control vs treatment","Check sample size — was the test adequately powered?","Run the hypothesis test and compute p-value correctly","Calculate the confidence interval","Discuss practical significance","Write a 1-page recommendation memo to a PM"],skills:["Statistics","Hypothesis Testing","Python","Business Communication"],portfolioWorthy:false},
  {id:"proj-pipeline",phase:2,type:"coding",difficulty:"Intermediate",title:"ML Pipeline from Scratch",description:"Build a complete, reproducible sklearn Pipeline.",dataset:{name:"House Prices Dataset",url:"https://www.kaggle.com/c/house-prices-advanced-regression-techniques"},steps:["Write a data loading module","Build a sklearn ColumnTransformer","Wrap everything in a Pipeline: preprocessor + model","Use GridSearchCV for tuning","Evaluate with cross-validation","Save the pipeline with joblib","Write a predict.py script"],skills:["sklearn Pipelines","Feature Engineering","Clean Code","joblib"],portfolioWorthy:false},
  {id:"proj-nn",phase:3,type:"coding",difficulty:"Intermediate",title:"Neural Network from Scratch (NumPy)",description:"Build a 2-layer neural network using only NumPy.",dataset:{name:"MNIST digits (via sklearn)",url:"https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html"},steps:["Initialize weights and biases randomly","Implement forward pass: linear + ReLU + softmax","Implement cross-entropy loss","Implement backpropagation manually","Implement gradient descent update","Train on MNIST, reach >90% accuracy","Plot loss curve over epochs"],skills:["NumPy","Backpropagation","Linear Algebra","Deep Learning Math"],portfolioWorthy:false},
  {id:"proj-bert",phase:3,type:"portfolio",difficulty:"Intermediate",title:"NLP Sentiment Classifier — Fine-tuned BERT",description:"Fine-tune a pretrained BERT model on real domain-specific text.",dataset:{name:"IMDb Movie Reviews",url:"https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews"},steps:["Load and preprocess dataset using Hugging Face tokenizer","Fine-tune DistilBERT using Hugging Face Trainer API","Evaluate: accuracy, F1, confusion matrix","Wrap model in FastAPI","Deploy to Hugging Face Spaces","Write README explaining model, training, and API usage"],skills:["Hugging Face","BERT","FastAPI","NLP","Deployment"],portfolioWorthy:true},
  {id:"proj-rag",phase:3,type:"portfolio",difficulty:"Advanced",title:"RAG-Powered Document Q&A System",description:"Build a system that lets users ask questions about documents using RAG.",dataset:{name:"Any PDF corpus",url:"https://arxiv.org"},steps:["Load and chunk documents","Embed chunks using an embedding model","Store in FAISS or ChromaDB","On query: embed question, retrieve top-k chunks","Pass context + question to LLM","Add a Streamlit UI","Deploy to Hugging Face Spaces"],skills:["LangChain","Vector Databases","Embeddings","LLMs","Streamlit"],portfolioWorthy:true},
  {id:"proj-mlops",phase:3,type:"portfolio",difficulty:"Advanced",title:"End-to-End Deployed ML System",description:"Make any model production-ready: Docker, FastAPI, experiment tracking, live URL.",dataset:{name:"Use your churn model or any existing model",url:""},steps:["Refactor model into clean Python modules","Track experiments with MLflow","Wrap in FastAPI with input validation","Write unit tests","Containerize with Docker","Deploy to Railway or Render","Add /health endpoint and logging"],skills:["FastAPI","Docker","MLflow","Testing","Cloud Deployment"],portfolioWorthy:true},
  {id:"proj-capstone",phase:4,type:"portfolio",difficulty:"Advanced",title:"Capstone: Domain-Specific DS Project",description:"Your magnum opus. Pick a domain, find a real problem, build a complete solution.",dataset:{name:"Find your own — that's part of the exercise",url:"https://datasetsearch.research.google.com"},steps:["Identify a real unsolved problem in your chosen domain","Find or collect relevant data","Full EDA with domain-specific insights","Feature engineering using domain knowledge","Model selection, training, thorough evaluation","Deploy with Streamlit or Gradio","Write a detailed Medium article","Post on LinkedIn"],skills:["Everything — this is your proof of readiness"],portfolioWorthy:true},
];

const DEFAULT_ROADMAP = [
  {phase:1,title:"Foundations",duration:"Months 1–3",color:"#7eb8f7",sections:[
    {id:"python-core",title:"Python Core",weeks:"Week 1–2",why:"Python is the language of data science. Everything you build will be in Python.",warning:"Don't go deep into advanced Python features. Know enough to write clean, readable code.",goldAdvice:"Every day, open a real dataset from Kaggle and answer 5 questions using code you write yourself.",resources:[{name:"Automate the Boring Stuff with Python",type:"Book (free online)",url:"https://automatetheboringstuff.com"},{name:"Python for Everybody — Coursera",type:"Course (free to audit)",url:"https://www.coursera.org/specializations/python"}],tasks:["Variables, loops, functions","List comprehensions & dictionaries","Classes (basics only), file I/O, error handling","Complete Automate the Boring Stuff Ch. 1–8"]},
    {id:"python-ds",title:"Python for Data Science",weeks:"Week 3–4",why:"NumPy and Pandas are what you'll use 40% of your actual job.",warning:"Most people spend 3 days on NumPy and call it done. Spend a full week.",goldAdvice:"After learning each Pandas method, immediately use it on a real dataset.",resources:[{name:"Pandas documentation",type:"Docs",url:"https://pandas.pydata.org/docs/"},{name:"Kaggle Learn — Pandas",type:"Free mini-course",url:"https://www.kaggle.com/learn/pandas"}],tasks:["NumPy: arrays, indexing, slicing, broadcasting","NumPy: vectorized operations (arrays, not loops)","Pandas: Series, DataFrames, groupby, merge, pivot tables","Pandas: handling nulls, apply, method chaining","Daily EDA on real Kaggle dataset — 5 self-asked questions"]},
    {id:"sql",title:"SQL",weeks:"Week 5–7",why:"SQL is tested before ML in almost every DS interview.",warning:"Window functions are where most people give up. Don't.",goldAdvice:"Solve 2 SQL problems every single morning before you do anything else.",resources:[{name:"Mode Analytics SQL Tutorial",type:"Free tutorial",url:"https://mode.com/sql-tutorial/"},{name:"StrataScratch",type:"DS-specific practice",url:"https://www.stratascratch.com"}],tasks:["SELECT, WHERE, GROUP BY, ORDER BY, HAVING, DISTINCT","CASE WHEN statements","INNER, LEFT, RIGHT, FULL JOINs","Subqueries & CTEs (WITH statements)","Window functions: ROW_NUMBER, RANK, LAG, LEAD, SUM OVER","2 StrataScratch problems every morning — timed"]},
    {id:"stats-prob",title:"Probability",weeks:"Week 5–9 (parallel)",why:"Probability is the mathematical language of uncertainty.",warning:"If you can't explain Bayes theorem with a real example without notes, you don't know it.",goldAdvice:"After each topic, write a 1-paragraph explanation as if talking to someone with no math background.",resources:[{name:"StatQuest with Josh Starmer",type:"YouTube (free, exceptional)",url:"https://www.youtube.com/@statquest"},{name:"Seeing Theory",type:"Free interactive visual",url:"https://seeing-theory.brown.edu"}],tasks:["Events, conditional probability, independence","Bayes theorem — explain with a real example, no notes","Watch StatQuest probability series fully"]},
    {id:"stats-dist",title:"Distributions",weeks:"Week 6–9 (parallel)",why:"Distributions describe how data behaves in the real world.",warning:"Don't just learn the formulas. Learn when each distribution appears in real life.",goldAdvice:"The CLT is the foundation of almost all statistical inference. Learn it so you can explain it three ways.",resources:[{name:"StatQuest distributions playlist",type:"YouTube (free)",url:"https://www.youtube.com/@statquest"}],tasks:["Normal, Binomial, Poisson, Uniform distributions","Central Limit Theorem — know it cold, explain 3 ways","5 real-life examples for each distribution"]},
    {id:"stats-inf",title:"Statistical Inference",weeks:"Week 7–10 (parallel)",why:"A/B testing is 80% of what a DS does at a product company.",warning:"'The probability the null hypothesis is true' is WRONG for p-values.",goldAdvice:"Practice all statistics explanations spoken out loud, not written.",resources:[{name:"StatQuest hypothesis testing",type:"YouTube (free)",url:"https://www.youtube.com/@statquest"}],tasks:["Hypothesis testing — explain to a PM out loud without notes","p-value — correct definition, out loud, without notes","Confidence intervals — what they actually mean","Type I and Type II errors with real examples","Practical vs statistical significance","A/B testing end-to-end: design, run, interpret"]},
    {id:"linalg",title:"Linear Algebra",weeks:"Week 10–11 (parallel)",why:"Linear algebra is the math behind PCA, neural networks, and recommendation systems.",warning:"Don't start with a textbook. Watch 3Blue1Brown's visual series first.",goldAdvice:"A matrix is a transformation of space. Dot products measure similarity.",resources:[{name:"3Blue1Brown — Essence of Linear Algebra",type:"YouTube (free)",url:"https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab"}],tasks:["Vectors, matrices, matrix multiplication — visual intuition","Dot product — what it measures","Eigenvalues and eigenvectors at conceptual level","Watch all of 3Blue1Brown Essence of Linear Algebra"]},
    {id:"cli-git",title:"Command Line & Git",weeks:"Week 1 (do this first!)",why:"Every single DS job requires Git.",warning:"Learn the mental model first: what is a commit, a branch, a remote.",goldAdvice:"Your GitHub profile is your DS resume. Push something every day.",resources:[{name:"The Missing Semester of CS Education",type:"Free MIT course",url:"https://missing.csail.mit.edu"},{name:"Learn Git Branching",type:"Free interactive",url:"https://learngitbranching.js.org"}],tasks:["Navigate folders: cd, ls, mkdir, rm, cp, mv","Run Python scripts from terminal","Virtual environments: python -m venv, activate, pip install","Git init, add, commit, push, pull","Branching: create, switch, merge branches","Write meaningful commit messages","Create a professional GitHub profile with a README","Push every project to GitHub with a proper README"]},
    {id:"jupyter",title:"Jupyter & Dev Environment",weeks:"Week 1–2 (parallel)",why:"Bad notebook habits will slow you down for years.",warning:"Notebooks with cells run out of order are not reproducible.",goldAdvice:"Learn keyboard shortcuts for Jupyter — they save hours.",resources:[{name:"VS Code Python setup",type:"Docs",url:"https://code.visualstudio.com/docs/python/python-tutorial"}],tasks:["Set up VS Code with Python extension","Learn Jupyter keyboard shortcuts (A, B, DD, Shift+Enter, M, Y)","Always restart kernel and run all before sharing","Use markdown cells to document your thinking","Understand the difference between script (.py) and notebook (.ipynb)","Know when to use a notebook vs a script"]},
  ]},
  {phase:2,title:"Core ML",duration:"Months 3–7",color:"#6dd6a0",sections:[
    {id:"ml-framework",title:"The ML Framework",weeks:"Week 1–2",why:"These concepts apply to every single algorithm.",warning:"Most skipped, most costly to skip.",goldAdvice:"For every model: is this overfitting? How do I know?",resources:[{name:"Hands-On ML — Aurélien Géron",type:"Book (the bible)",url:"https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/"},{name:"Andrew Ng ML Specialization",type:"Course (free to audit)",url:"https://www.coursera.org/specializations/machine-learning-introduction"}],tasks:["Train / validation / test split — why each exists","Overfitting vs underfitting — diagnose from learning curves","Bias-variance tradeoff — explain intuitively","Cross-validation: k-fold, stratified k-fold","Regularization L1 and L2 — intuition"]},
    {id:"ml-regression",title:"Supervised — Regression",weeks:"Week 3–4",why:"Linear regression is the foundation.",warning:"Understand what coefficients mean and when the model breaks.",goldAdvice:"For each metric, ask: what business question does this answer?",resources:[{name:"StatQuest regression playlist",type:"YouTube (free)",url:"https://www.youtube.com/@statquest"}],tasks:["Linear regression with math — understand what OLS does","Ridge (L2) and Lasso (L1) regression","Polynomial regression — when to use, overfitting risk","Metrics: MAE, MSE, RMSE, R² — when to prefer each"]},
    {id:"ml-class",title:"Supervised — Classification",weeks:"Week 5–6",why:"Classification is the most common ML task.",warning:"Accuracy is a trap in imbalanced datasets.",goldAdvice:"For every algorithm: how does it work, assumptions, when does it fail, how do you tune it.",resources:[{name:"XGBoost docs",type:"Docs",url:"https://xgboost.readthedocs.io"},{name:"StatQuest Random Forest & XGBoost",type:"YouTube",url:"https://www.youtube.com/@statquest"}],tasks:["Logistic regression — understand log-odds, not just sigmoid","Decision Trees — splitting criteria, depth, pruning","Random Forests — why bagging reduces variance","XGBoost — spend extra time here","Metrics: precision, recall, F1, ROC-AUC","Class imbalance: SMOTE, class weights, threshold tuning"]},
    {id:"ml-unsupervised",title:"Unsupervised Learning",weeks:"Week 7",why:"Clustering and dimensionality reduction are everywhere.",warning:"Understand PCA geometrically.",goldAdvice:"Apply PCA to a real dataset and visualize the explained variance plot.",resources:[{name:"StatQuest PCA",type:"YouTube (free)",url:"https://www.youtube.com/@statquest"}],tasks:["KMeans — algorithm, choosing k (elbow, silhouette)","Hierarchical clustering — dendrograms","PCA — geometric understanding","Explained variance ratio — how to choose n components"]},
    {id:"ml-pipeline",title:"Full ML Pipeline",weeks:"Week 8",why:"This week is where you find out what you actually understand.",warning:"Do this from scratch, no tutorial, real dataset.",goldAdvice:"Spend as much time on interpretation as on training.",resources:[{name:"Kaggle datasets",type:"Free real datasets",url:"https://www.kaggle.com/datasets"}],tasks:["Raw data → cleaning → EDA → feature engineering","Model selection → tuning → evaluation","Feature importance and SHAP values","Build from scratch alone, real dataset","Write up findings as if presenting to a stakeholder"]},
    {id:"feature-eng",title:"Feature Engineering",weeks:"Week 9–10",why:"Good feature engineering beats fancy algorithms.",warning:"Target encoding trap: data leakage.",goldAdvice:"Read winning solution writeups of past Kaggle tabular competitions.",resources:[{name:"Kaggle competition forums",type:"Free (winning solutions)",url:"https://www.kaggle.com/competitions"}],tasks:["Missing data: impute vs drop","Label vs one-hot vs target encoding + their traps","Interaction features and polynomial features","Binning and log transforms","Datetime features: hour, day of week, time since event","Read 3 Kaggle winning solution writeups"]},
    {id:"timeseries",title:"Time Series",weeks:"Week 11–12",why:"Time series comes up in 40% of DS jobs.",warning:"You cannot use future data to predict the past. Always use time-based train/test splits.",goldAdvice:"Master the decomposition first: trend + seasonality + residual.",resources:[{name:"Forecasting: Principles and Practice",type:"Free online book",url:"https://otexts.com/fpp3/"}],tasks:["Time series decomposition: trend, seasonality, residual","Stationarity — ADF test, differencing","ARIMA and SARIMA — intuition and fitting","Prophet by Meta — fast and practical","Time-based train/test split — never random split","Evaluation metrics: MAE, RMSE, MAPE"]},
    {id:"eda-tools",title:"EDA & Model Explainability",weeks:"Week 9–10 (parallel)",why:"Companies want to understand WHY the model predicts what it does.",warning:"Don't just run ydata-profiling and call it EDA.",goldAdvice:"SHAP waterfall plots are a conversation-starter in every interview.",resources:[{name:"SHAP docs",type:"Docs",url:"https://shap.readthedocs.io"}],tasks:["ydata-profiling: generate automated EDA report","SHAP values: global feature importance","SHAP waterfall plot: explain single prediction","Present SHAP results as a business insight, not just a chart"]},
    {id:"api-data",title:"APIs & Real Data Sources",weeks:"Week 10 (parallel)",why:"Real data comes from APIs, not Kaggle CSVs.",warning:"Never hardcode API keys in your code. Use environment variables.",goldAdvice:"Build one project using a real public API.",resources:[{name:"requests library docs",type:"Docs",url:"https://requests.readthedocs.io"}],tasks:["HTTP basics: GET, POST, headers, status codes","requests library: fetch data from any API","Handle pagination and rate limits","Parse JSON responses into Pandas DataFrames","Use environment variables for API keys (.env file)"]},
  ]},
  {phase:3,title:"Modern Skills",duration:"Months 7–12",color:"#f7c96e",sections:[
    {id:"dl-nn",title:"Neural Networks",weeks:"Week 1–2",why:"Deep learning is in 20%+ of DS job postings and growing.",warning:"Don't touch PyTorch yet. Build a NN from scratch in NumPy first.",goldAdvice:"The learning rate is the most important hyperparameter.",resources:[{name:"Andrej Karpathy — Neural Networks: Zero to Hero",type:"YouTube (exceptional)",url:"https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ"}],tasks:["Backpropagation — understand chain rule intuitively","Activation functions: ReLU, sigmoid, tanh","Batch size, learning rate, epochs","Dropout and batch normalization","Build NN from scratch in NumPy","Rebuild it in PyTorch"]},
    {id:"dl-cnn",title:"CNNs & Transfer Learning",weeks:"Week 3–4",why:"Transfer learning is how 90% of real computer vision work is done.",warning:"Don't get lost in architecture details.",goldAdvice:"Pick a domain and fine-tune on a real dataset from that domain.",resources:[{name:"fast.ai Part 1",type:"Free course",url:"https://course.fast.ai"}],tasks:["Convolutional layers and pooling","How CNNs see images intuitively","Transfer learning — why pretrained weights help","Fine-tune ResNet or EfficientNet on custom data","Data augmentation"]},
    {id:"dl-nlp",title:"NLP & Transformers",weeks:"Week 5–6",why:"NLP is the hottest sub-field.",warning:"You don't need to build a transformer from scratch.",goldAdvice:"Pick NLP or Vision and go deeper in one.",resources:[{name:"Hugging Face NLP course",type:"Free",url:"https://huggingface.co/learn/nlp-course"}],tasks:["Text preprocessing, tokenization, embeddings","Attention mechanism — conceptual understanding","BERT and variants","Hugging Face: load and fine-tune a model","NLP metrics: F1, BLEU, perplexity"]},
    {id:"llm",title:"LLMs & Generative AI",weeks:"Week 7–9",why:"Companies are integrating LLMs into every data product.",warning:"Don't just play with ChatGPT. Build something with LLM APIs.",goldAdvice:"Build one project using an LLM API + real data.",resources:[{name:"LangChain docs",type:"Docs",url:"https://docs.langchain.com"}],tasks:["How LLMs work: transformers, attention, tokenization","Prompt engineering — system prompts, few-shot, chain of thought","RAG — the key pattern","Fine-tuning vs RAG","Build one project: LLM API + real data, keep it live"]},
    {id:"mlops",title:"MLOps",weeks:"Week 10–12",why:"Most candidates can train a model. Almost none can deploy one.",warning:"Most DS candidates are bad at Git. Fix this first.",goldAdvice:"'I built this, you can use it right now at this URL' is a conversation-changer.",resources:[{name:"FastAPI docs",type:"Docs",url:"https://fastapi.tiangolo.com"},{name:"Docker getting started",type:"Docs",url:"https://docs.docker.com/get-started/"}],tasks:["Git: branching, PRs, meaningful commit messages","Docker: containerize your model","FastAPI: serve model as live API","MLflow or W&B: experiment tracking","Deploy to cloud — live public URL"]},
    {id:"streamlit",title:"Streamlit — Deploy ML Apps",weeks:"Week 8 (parallel)",why:"'Here's my live demo' is the most powerful thing you can say in an interview.",warning:"Don't over-engineer your Streamlit app.",goldAdvice:"Every project from Phase 2 onwards should have a Streamlit demo.",resources:[{name:"Streamlit docs",type:"Docs",url:"https://docs.streamlit.io"}],tasks:["Build your first Streamlit app in under 1 hour","Add file upload, sliders, dropdowns, and charts","Deploy to Streamlit Cloud — get a live URL","Wrap your churn model in a Streamlit app"]},
    {id:"cloud",title:"Cloud Basics (AWS/GCP)",weeks:"Week 11–12",why:"Every DS job mentions cloud.",warning:"Don't try to learn all cloud services at once.",goldAdvice:"Get the AWS Free Tier account and actually deploy something.",resources:[{name:"AWS Free Tier",type:"Free account",url:"https://aws.amazon.com/free/"}],tasks:["Set up AWS Free Tier account","S3: upload, download, manage files with boto3","EC2: launch a basic instance, SSH into it","Deploy a FastAPI model to EC2 — get a live URL"]},
    {id:"dataviz",title:"Viz & Storytelling",weeks:"Ongoing (parallel)",why:"Being right means nothing if you can't communicate it.",warning:"Don't confuse pretty charts with storytelling.",goldAdvice:"After every project, make a 5-slide summary as if presenting to a VP.",resources:[{name:"Storytelling with Data",type:"Book",url:"https://www.storytellingwithdata.com/book"}],tasks:["Matplotlib & Seaborn for EDA","Plotly for interactive charts","Tableau or Power BI — learn one","5-slide business summary for every project"]},
  ]},
  {phase:4,title:"Portfolio & Jobs",duration:"Months 12–18",color:"#c792ea",sections:[
    {id:"portfolio",title:"Portfolio Projects",weeks:"Month 12–15",why:"Three exceptional projects beat ten mediocre ones.",warning:"'I trained a model on Titanic' is not a project.",goldAdvice:"Write a Medium article per project.",resources:[{name:"Kaggle Datasets",type:"Free",url:"https://www.kaggle.com/datasets"}],tasks:["Churn prediction with dollar-value business framing","Full A/B test analysis beyond p-value","NLP project on a real domain dataset","Recommendation system deployed as API","LLM-powered tool — keep it live","Each project: clean README, write-up, deployed demo"]},
    {id:"int-sql",title:"Interview Prep — SQL",weeks:"Month 13–16",why:"SQL is the first filter in almost every DS interview.",warning:"Practicing with autocomplete is not the same as interview SQL.",goldAdvice:"StrataScratch has questions from real companies. 50 medium/hard problems minimum.",resources:[{name:"StrataScratch",type:"DS-specific SQL practice",url:"https://www.stratascratch.com"}],tasks:["50 StrataScratch problems — medium and hard","Time yourself — 15 minutes max per problem","Practice without autocomplete","Review every wrong answer"]},
    {id:"int-stats",title:"Interview Prep — Statistics",weeks:"Month 13–16",why:"Statistics is the second major filter in DS interviews.",warning:"Most common mistake: getting p-values wrong.",goldAdvice:"Practice ALL statistics explanations spoken out loud.",resources:[{name:"Ace the Data Science Interview",type:"Book",url:"https://www.acethedatascienceinterview.com"}],tasks:["p-value: correct definition out loud without notes","Design an A/B test for a product out loud","Correlation vs causation with real example","Confidence interval: what it actually means"]},
    {id:"int-ml",title:"Interview Prep — ML Theory",weeks:"Month 13–16",why:"ML theory tests whether you understand your tools or just use them.",warning:"Don't memorize answers.",goldAdvice:"For every algorithm: 2-minute verbal explanation.",resources:[{name:"Ace the Data Science Interview",type:"Book",url:"https://www.acethedatascienceinterview.com"}],tasks:["Explain gradient boosting from scratch — 2 min verbal","How does random forest reduce variance?","Class imbalance: 3 ways to handle it","Regularization: L1 vs L2 intuitively"]},
    {id:"int-case",title:"Interview Prep — Case Studies",weeks:"Month 14–17",why:"Case studies test whether you think like a DS.",warning:"Most candidates jump to the model immediately.",goldAdvice:"Framework: clarify → data → metric → model → limitations.",resources:[{name:"Pramp",type:"Free mock interviews",url:"https://www.pramp.com"}],tasks:["Master the framework: clarify → data → metric → model → limits","Design a recommendation system out loud","Design a fraud detection pipeline out loud","Do mock interviews on Pramp or with a friend"]},
    {id:"networking",title:"Networking",weeks:"Start Month 1 — never stop",why:"Most jobs at good companies are found through referrals.",warning:"Don't send cold 'can you refer me?' messages.",goldAdvice:"Pick a domain you care about. Domain expertise is the shortcut most generalists ignore.",resources:[{name:"DataTalks.Club",type:"Free community & events",url:"https://datatalks.club"}],tasks:["Post on LinkedIn weekly — insights, not 'finished a course'","Attend PyData or DataTalks.Club events","Send 1 specific question to 1 relevant person per week","Start applying Month 9 — first 10 apps are practice"]},
    {id:"kaggle",title:"Kaggle Competitions",weeks:"Month 10–14 (parallel)",why:"A top 30% finish on Kaggle shows you can compete against thousands of real data scientists.",warning:"Don't join a competition just to submit once.",goldAdvice:"Your first competition will be humbling. Focus on learning from the leaderboard.",resources:[{name:"Kaggle competitions",type:"Free",url:"https://www.kaggle.com/competitions"}],tasks:["Complete at least one Getting Started competition","Enter one real competition","Read top 3 solution writeups after competition ends","Aim for top 30% on at least one competition"]},
    {id:"linkedin-profile",title:"LinkedIn Optimization",weeks:"Month 12–13",why:"Recruiters search LinkedIn every day.",warning:"Most DS candidates have terrible LinkedIn profiles.",goldAdvice:"Your headline should include your specialization and 'Open to opportunities'.",resources:[{name:"LinkedIn for Job Seekers",type:"Free guide",url:"https://linkedin.com"}],tasks:["Professional headshot","Headline: include specialization and 'Open to opportunities'","Summary: 3 paragraphs — who you are, what you build, what you want","Add all projects with live demo links","Turn on 'Open to Work'"]},
    {id:"salary-neg",title:"Salary Negotiation",weeks:"Month 16–18",why:"Most people leave 10-20% of their salary on the table.",warning:"Never give the first number.",goldAdvice:"Research salaries on Glassdoor, Levels.fyi before any interview.",resources:[{name:"Levels.fyi",type:"Salary data",url:"https://www.levels.fyi"},{name:"Ten Rules for Negotiating — Haseeb Qureshi",type:"Free article (must read)",url:"https://haseebq.com/my-ten-rules-for-negotiating-a-job-offer/"}],tasks:["Research market salaries for DS roles in your target location","Learn the BATNA concept — know your walk-away number","Practice saying 'I need time to consider' out loud","Never accept on the spot — always ask for 48 hours"]},
  ]},
];

const quotes = [
  {text:"The expert in anything was once a beginner.",author:"Helen Hayes"},
  {text:"Stay with problems longer.",author:"Albert Einstein"},
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain"},
  {text:"Small daily improvements lead to stunning results.",author:"Robin Sharma"},
  {text:"A year from now you'll wish you started today.",author:"Karen Lamb"},
  {text:"Every master was once a disaster.",author:"T. Harv Eker"},
  {text:"An investment in knowledge pays the best interest.",author:"Benjamin Franklin"},
];

function getTotalProgress(progress,roadmap){
  const allKeys=roadmap.flatMap(ph=>ph.sections.flatMap(s=>s.tasks.map((_,i)=>`${s.id}-${i}`)));
  const done=allKeys.filter(k=>progress[k]).length;
  return{done,total:allKeys.length,pct:allKeys.length?Math.round(done/allKeys.length*100):0};
}
function ProgressBar({pct,color,height=4}){
  return <div style={{height,background:T.border,borderRadius:height}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:height,transition:"width 0.4s"}}/></div>;
}
function ProgressRing({pct,color,size=48,stroke=4}){
  const r=(size-stroke)/2,circ=2*Math.PI*r;
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ} style={{transition:"stroke-dashoffset 0.6s",strokeLinecap:"round"}}/></svg>;
}
function Btn({onClick,children,color=T.info,style={}}){
  return <button onClick={onClick} style={{background:color+"18",border:`1px solid ${color}55`,color,padding:"7px 14px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,...style}}>{children}</button>;
}

// ── LOGIN PAGE
function LoginPage(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const handleLogin=async()=>{
    setError("");
    if(!email.trim()||!password.trim()){setError("Please enter email and password.");return;}
    setLoading(true);
    try{await signInWithEmailAndPassword(auth,email.trim(),password);}
    catch(e){setError("Invalid email or password.");}
    setLoading(false);
  };
  const inp={background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:8,padding:"10px 14px",color:T.text,fontSize:13,width:"100%",outline:"none",boxSizing:"border-box"};
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:"40px 36px",width:360}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:28,marginBottom:8}}>🎓</div>
          <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>DS Roadmap Platform</div>
          <div style={{fontSize:12,color:T.textDim}}>Sign in to continue your learning journey</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>EMAIL</div>
          <input style={inp} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your email"/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>PASSWORD</div>
          <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your password"/>
        </div>
        {error&&<div style={{fontSize:11,color:T.warn,marginBottom:14,background:T.warn+"15",padding:"8px 12px",borderRadius:6}}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg, ${T.p1}33, ${T.p4}33)`,border:`1px solid ${T.p1}55`,color:T.text,borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,opacity:loading?0.7:1}}>{loading?"Signing in...":"Sign In"}</button>
        <div style={{marginTop:16,fontSize:11,color:T.textFade,textAlign:"center"}}>Contact your instructor to get your login credentials.</div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD
function AdminDashboard({currentUser}){
  const [tab,setTab]=useState("overview");
  const [students,setStudents]=useState([]);
  const [messages,setMessages]=useState([]);
  const [roadmap,setRoadmap]=useState(DEFAULT_ROADMAP);
  const [newUser,setNewUser]=useState({username:"",email:"",password:""});
  const [newMsg,setNewMsg]=useState({to:"all",text:""});
  const [editingTask,setEditingTask]=useState(null);
  const [addingTask,setAddingTask]=useState(null);
  const [newTaskText,setNewTaskText]=useState("");
  const [expandedSection,setExpandedSection]=useState(null);
  const [expandedPhase,setExpandedPhase]=useState(null);
  const [userErr,setUserErr]=useState("");
  const [userOk,setUserOk]=useState("");

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"users"),snap=>{setStudents(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role==="student"&&!u.disabled));});
    return unsub;
  },[]);
  useEffect(()=>{
    const q=query(collection(db,"messages"),orderBy("time","desc"));
    const unsub=onSnapshot(q,snap=>{setMessages(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return unsub;
  },[]);
  useEffect(()=>{
    const load=async()=>{const snap=await getDoc(doc(db,"config","roadmap"));if(snap.exists())setRoadmap(snap.data().data);};
    load();
  },[]);

  const saveRoadmap=async(r)=>{setRoadmap(r);await setDoc(doc(db,"config","roadmap"),{data:r});};
  const addUser=async()=>{
    setUserErr("");setUserOk("");
    if(!newUser.username.trim()||!newUser.email.trim()||!newUser.password.trim()){setUserErr("All fields required.");return;}
    try{
      const res=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAEuLDpruLyfYB1sm9lifPVgP4os6JIvS8`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:newUser.email.trim(),password:newUser.password,returnSecureToken:true})});
      const data=await res.json();
      if(data.error&&data.error.message!=="EMAIL_EXISTS"){setUserErr("Error: "+data.error.message);return;}
      let uid=data.localId;
      if(!uid){
        const sr=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAEuLDpruLyfYB1sm9lifPVgP4os6JIvS8`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:newUser.email.trim(),password:newUser.password,returnSecureToken:true})});
        const sd=await sr.json();
        if(sd.error){setUserErr("Email already exists with a different password.");return;}
        uid=sd.localId;
      }
      await setDoc(doc(db,"users",uid),{username:newUser.username.trim(),email:newUser.email.trim(),role:"student",progress:{},joinedAt:new Date().toISOString()});
      setNewUser({username:"",email:"",password:""});
      setUserOk("✅ Student added successfully!");
    }catch(e){setUserErr("Error: "+e.message);}
  };
  const removeUser=async(id)=>{if(!window.confirm("Remove this student?"))return;await setDoc(doc(db,"users",id),{disabled:true},{merge:true});};
  const sendMessage=async()=>{if(!newMsg.text.trim())return;await addDoc(collection(db,"messages"),{from:currentUser.email,to:newMsg.to,text:newMsg.text.trim(),time:new Date().toISOString()});setNewMsg({to:"all",text:""});};
  const updateTask=(pi,si,ti,value)=>{const r=JSON.parse(JSON.stringify(roadmap));r[pi].sections[si].tasks[ti]=value;saveRoadmap(r);setEditingTask(null);};
  const deleteTask=(pi,si,ti)=>{if(!window.confirm("Delete this task?"))return;const r=JSON.parse(JSON.stringify(roadmap));r[pi].sections[si].tasks.splice(ti,1);saveRoadmap(r);};
  const addTask=(pi,si)=>{if(!newTaskText.trim())return;const r=JSON.parse(JSON.stringify(roadmap));r[pi].sections[si].tasks.push(newTaskText.trim());saveRoadmap(r);setAddingTask(null);setNewTaskText("");};

  const inp={background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:7,padding:"8px 12px",color:T.text,fontSize:12,outline:"none"};
  const tabs=[{id:"overview",label:"📈 Overview"},{id:"students",label:"👥 Students"},{id:"messages",label:"💬 Messages"},{id:"roadmap",label:"✅ Edit Roadmap"}];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:T.bgDeep,borderBottom:`1px solid ${T.border}`,padding:"14px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.12em"}}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{fontSize:18,fontWeight:700}}>Admin Dashboard</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:12,color:T.textDim}}>👤 {currentUser.email}</div>
            <Btn onClick={()=>signOut(auth)} color={T.warn} style={{padding:"5px 12px",fontSize:11}}>Logout</Btn>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 14px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?T.p1:"transparent"}`,color:tab===t.id?T.p1:T.textDim,cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400}}>{t.label}</button>)}
        </div>
      </div>
      <div style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>
        {tab==="overview"&&(
          <div>
            <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
              {[{label:"Total Students",value:students.length,color:T.p1},{label:"Avg Progress",value:students.length?Math.round(students.reduce((s,u)=>s+getTotalProgress(u.progress||{},roadmap).pct,0)/students.length)+"%":"0%",color:T.good},{label:"Messages Sent",value:messages.length,color:T.p4}].map(stat=>(
                <div key={stat.label} style={{flex:1,minWidth:140,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px"}}>
                  <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.1em",marginBottom:6}}>{stat.label.toUpperCase()}</div>
                  <div style={{fontSize:28,fontWeight:700,color:stat.color}}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:600}}>Student Progress</div></div>
              {students.length===0&&<div style={{padding:"24px 20px",color:T.textFade,fontSize:12}}>No students yet.</div>}
              {[...students].sort((a,b)=>getTotalProgress(b.progress||{},roadmap).pct-getTotalProgress(a.progress||{},roadmap).pct).map((u,i)=>{
                const prog=getTotalProgress(u.progress||{},roadmap);
                const color=phaseColors[Math.min(3,Math.floor(prog.pct/25))];
                return(
                  <div key={u.id} style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>{u.username}</div><ProgressBar pct={prog.pct} color={color}/></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color}}>{prog.pct}%</div><div style={{fontSize:10,color:T.textFade}}>{prog.done}/{prog.total}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab==="students"&&(
          <div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Add New Student</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <input style={{...inp,flex:1,minWidth:120}} placeholder="Name" value={newUser.username} onChange={e=>setNewUser(p=>({...p,username:e.target.value}))}/>
                <input style={{...inp,flex:1,minWidth:160}} placeholder="Email" value={newUser.email} onChange={e=>setNewUser(p=>({...p,email:e.target.value}))}/>
                <input style={{...inp,flex:1,minWidth:120}} placeholder="Password" type="password" value={newUser.password} onChange={e=>setNewUser(p=>({...p,password:e.target.value}))}/>
                <Btn onClick={addUser} color={T.good}>+ Add Student</Btn>
              </div>
              {userErr&&<div style={{fontSize:11,color:T.warn,marginTop:8}}>{userErr}</div>}
              {userOk&&<div style={{fontSize:11,color:T.good,marginTop:8}}>{userOk}</div>}
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:600}}>All Students ({students.length})</div></div>
              {students.length===0&&<div style={{padding:"24px 20px",color:T.textFade,fontSize:12}}>No students added yet.</div>}
              {students.map(u=>{
                const prog=getTotalProgress(u.progress||{},roadmap);
                const color=phaseColors[Math.min(3,Math.floor(prog.pct/25))];
                return(
                  <div key={u.id} style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color,flexShrink:0}}>{u.username[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:160}}><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{u.username}</div><div style={{fontSize:10,color:T.textFade}}>{u.email}</div></div>
                    <div style={{flex:2,minWidth:160}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:T.textFade}}>Progress</span><span style={{fontSize:10,color}}>{prog.pct}% ({prog.done}/{prog.total})</span></div>
                      <ProgressBar pct={prog.pct} color={color}/>
                    </div>
                    <button onClick={()=>removeUser(u.id)} style={{background:T.warn+"15",border:`1px solid ${T.warn}44`,color:T.warn,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Remove</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab==="messages"&&(
          <div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Send Message</div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>TO</div>
                <select value={newMsg.to} onChange={e=>setNewMsg(p=>({...p,to:e.target.value}))} style={{...inp,width:"100%",boxSizing:"border-box"}}>
                  <option value="all">📢 All Students</option>
                  {students.map(u=><option key={u.id} value={u.id}>👤 {u.username}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}><textarea value={newMsg.text} onChange={e=>setNewMsg(p=>({...p,text:e.target.value}))} placeholder="Write your message..." rows={4} style={{...inp,width:"100%",boxSizing:"border-box",resize:"vertical"}}/></div>
              <Btn onClick={sendMessage} color={T.p4}>Send Message</Btn>
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:600}}>Sent Messages ({messages.length})</div></div>
              {messages.length===0&&<div style={{padding:"24px 20px",color:T.textFade,fontSize:12}}>No messages sent yet.</div>}
              {messages.map(m=>{
                const toName=m.to==="all"?"All Students":students.find(u=>u.id===m.to)?.username||"Unknown";
                return(
                  <div key={m.id} style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:11,color:T.p4,background:T.p4+"15",padding:"2px 8px",borderRadius:4}}>To: {toName}</span>
                      <span style={{fontSize:10,color:T.textFade}}>{new Date(m.time).toLocaleString()}</span>
                    </div>
                    <div style={{fontSize:12,color:T.textDim,lineHeight:1.6}}>{m.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab==="roadmap"&&(
          <div>
            <div style={{fontSize:13,color:T.textDim,marginBottom:20,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 16px"}}>✅ Changes here apply to all students immediately.</div>
            {roadmap.map((ph,pi)=>(
              <div key={pi} style={{marginBottom:12,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                <div onClick={()=>setExpandedPhase(expandedPhase===pi?null:pi)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:10,height:10,borderRadius:"50%",background:ph.color}}/><span style={{fontSize:14,fontWeight:600,color:ph.color}}>Phase {ph.phase} — {ph.title}</span></div>
                  <span style={{color:T.textFade}}>▾</span>
                </div>
                {expandedPhase===pi&&ph.sections.map((sec,si)=>{
                  const secKey=`${pi}-${si}`;
                  return(
                    <div key={si} style={{borderTop:`1px solid ${T.border}`}}>
                      <div onClick={()=>setExpandedSection(expandedSection===secKey?null:secKey)} style={{padding:"11px 18px 11px 28px",cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:12,fontWeight:600,color:T.textDim}}>{sec.title}</span>
                        <span style={{fontSize:10,color:T.textFade}}>{sec.tasks.length} tasks ▾</span>
                      </div>
                      {expandedSection===secKey&&(
                        <div style={{padding:"0 18px 14px 28px"}}>
                          {sec.tasks.map((task,ti)=>(
                            <div key={ti} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                              {editingTask===`${pi}-${si}-${ti}`?(
                                <>
                                  <input defaultValue={task} id={`task-inp-${pi}-${si}-${ti}`} style={{...inp,flex:1,fontSize:11}} autoFocus/>
                                  <Btn onClick={()=>updateTask(pi,si,ti,document.getElementById(`task-inp-${pi}-${si}-${ti}`).value)} color={T.good} style={{padding:"4px 10px",fontSize:11}}>Save</Btn>
                                  <Btn onClick={()=>setEditingTask(null)} color={T.textFade} style={{padding:"4px 10px",fontSize:11}}>Cancel</Btn>
                                </>
                              ):(
                                <>
                                  <span style={{flex:1,fontSize:11,color:T.textDim}}>{task}</span>
                                  <button onClick={()=>setEditingTask(`${pi}-${si}-${ti}`)} style={{background:"none",border:"none",color:T.info,cursor:"pointer",fontSize:11}}>Edit</button>
                                  <button onClick={()=>deleteTask(pi,si,ti)} style={{background:"none",border:"none",color:T.warn,cursor:"pointer",fontSize:11}}>✕</button>
                                </>
                              )}
                            </div>
                          ))}
                          {addingTask===`${pi}-${si}`?(
                            <div style={{display:"flex",gap:8,marginTop:8}}>
                              <input style={{...inp,flex:1,fontSize:11}} placeholder="New task..." value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} autoFocus/>
                              <Btn onClick={()=>addTask(pi,si)} color={T.good} style={{padding:"4px 10px",fontSize:11}}>Add</Btn>
                              <Btn onClick={()=>{setAddingTask(null);setNewTaskText("");}} color={T.textFade} style={{padding:"4px 10px",fontSize:11}}>Cancel</Btn>
                            </div>
                          ):(
                            <button onClick={()=>{setAddingTask(`${pi}-${si}`);setNewTaskText("");}} style={{marginTop:8,background:"none",border:`1px dashed ${T.borderHi}`,color:T.textFade,padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11,width:"100%"}}>+ Add Task</button>
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

// ── STUDENT DASHBOARD
function StudentDashboard({currentUser,userDoc}){
  const [tab,setTab]=useState("motivation");
  const [expandedSection,setExpandedSection]=useState(null);
  const [activePhase,setActivePhase]=useState(0);
  const [roadmap,setRoadmap]=useState(DEFAULT_ROADMAP);
  const [students,setStudents]=useState([]);
  const [messages,setMessages]=useState([]);
  const [progress,setProgress]=useState(userDoc.progress||{});
  const [streak,setStreak]=useState(userDoc.streak||0);
  const [checkins,setCheckins]=useState(userDoc.checkins||[]);
  const [checkinForm,setCheckinForm]=useState({learned:"",difficult:"",goal:""});
  const [showCheckin,setShowCheckin]=useState(false);
  const [activeLearnId,setActiveLearnId]=useState("numpy");

  // Called by LearnTab when a lesson is completed — checks off matching roadmap task
  const onLessonComplete = (lessonId) => {
    const mapping = LESSON_COMPLETES_TASK[lessonId];
    if(!mapping) return;
    const key = `${mapping.section}-${mapping.task}`;
    if(!progress[key]) {
      saveProgress({...progress,[key]:true});
    }
  };

  const navigateToLesson = (lessonId) => {
    setActiveLearnId(lessonId);
    setTab("learn");
  };

  useEffect(()=>{
    const updateStreak=async()=>{
      const today=new Date().toISOString().split("T")[0];
      const lastActive=userDoc.lastActive||"";
      const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
      if(lastActive===today)return;
      let newStreak=userDoc.streak||0;
      if(lastActive===yesterday)newStreak+=1;
      else newStreak=1;
      setStreak(newStreak);
      await updateDoc(doc(db,"users",currentUser.uid),{streak:newStreak,lastActive:today});
    };
    updateStreak();
  },[]);

  const getWeekNumber=()=>{const d=new Date();const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);};

  const submitCheckin=async()=>{
    if(!checkinForm.learned.trim())return;
    const entry={...checkinForm,date:new Date().toISOString(),week:getWeekNumber()};
    const newCheckins=[entry,...(userDoc.checkins||[])];
    setCheckins(newCheckins);setShowCheckin(false);setCheckinForm({learned:"",difficult:"",goal:""});
    await updateDoc(doc(db,"users",currentUser.uid),{checkins:newCheckins});
  };
  const thisWeekCheckin=checkins.find(c=>c.week===getWeekNumber());

  useEffect(()=>{const load=async()=>{const snap=await getDoc(doc(db,"config","roadmap"));if(snap.exists())setRoadmap(snap.data().data);};load();},[]);
  useEffect(()=>{const unsub=onSnapshot(collection(db,"users"),snap=>{setStudents(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role==="student"&&!u.disabled));});return unsub;},[]);
  useEffect(()=>{
    const q=query(collection(db,"messages"),orderBy("time","desc"));
    const unsub=onSnapshot(q,snap=>{setMessages(snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.to==="all"||m.to===currentUser.uid));});
    return unsub;
  },[currentUser.uid]);

  const saveProgress=async(p)=>{setProgress(p);await updateDoc(doc(db,"users",currentUser.uid),{progress:p});};
  const toggle=(sid,i)=>{const key=`${sid}-${i}`;saveProgress({...progress,[key]:!progress[key]});};

  const total=getTotalProgress(progress,roadmap);
  const phase=roadmap[activePhase];
  const C=phase.color;
  const getSP=s=>{const d=s.tasks.filter((_,i)=>progress[`${s.id}-${i}`]).length;return{done:d,total:s.tasks.length,pct:s.tasks.length?Math.round(d/s.tasks.length*100):0};};
  const getPP=ph=>{const keys=ph.sections.flatMap(s=>s.tasks.map((_,i)=>`${s.id}-${i}`));const d=keys.filter(k=>progress[k]).length;return{done:d,total:keys.length,pct:keys.length?Math.round(d/keys.length*100):0};};
  const todayQuote=quotes[new Date().getDay()%quotes.length];
  const milestones=[5,10,25,50,75,100];
  const nextMilestone=milestones.find(m=>m>total.pct)||100;

  const tabs=[
    {id:"motivation",label:"🏠 Home"},
    {id:"roadmap",label:"📋 Roadmap"},
    {id:"learn",label:"📚 Learn"},
    {id:"projects",label:"🚀 Projects"},
    {id:"leaderboard",label:"🏅 Leaderboard"},
    {id:"messages",label:`💬 Messages${messages.length>0?` (${messages.length})`:""}`},
  ];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.bgDeep,borderBottom:`1px solid ${T.border}`,padding:"14px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.12em"}}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{fontSize:18,fontWeight:700}}>Zero → Competitive Candidate</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <ProgressRing pct={total.pct} color={T.p1} size={48} stroke={4}/>
            <div><div style={{fontSize:20,fontWeight:700,color:T.p1}}>{total.pct}%</div><div style={{fontSize:9,color:T.textFade}}>{total.done}/{total.total} tasks</div></div>
            <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:12}}>
              <div style={{fontSize:12,color:T.textDim,marginBottom:4}}>👤 {userDoc.username}</div>
              <button onClick={()=>signOut(auth)} style={{fontSize:10,color:T.textFade,background:"none",border:"none",cursor:"pointer"}}>Logout</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:4,overflowX:"auto"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 14px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?T.p1:"transparent"}`,color:tab===t.id?T.p1:T.textDim,cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
        </div>
      </div>

      <div style={{flex:1}}>
        {/* LEARN TAB */}
        {tab==="learn"&&<LearnTab currentUser={currentUser} activeId={activeLearnId} setActiveId={setActiveLearnId} onLessonComplete={onLessonComplete}/>}

        {/* HOME */}
        {tab==="motivation"&&(
          <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"24px",marginBottom:20}}>
              <div style={{fontSize:9,color:T.gold,letterSpacing:"0.15em",fontWeight:700,marginBottom:12}}>✦ DAILY MOTIVATION</div>
              <div style={{fontSize:16,color:T.text,fontStyle:"italic",marginBottom:8}}>"{todayQuote.text}"</div>
              <div style={{fontSize:11,color:T.textDim}}>— {todayQuote.author}</div>
              <div style={{marginTop:20,padding:"14px",background:T.bgDeep,borderRadius:10,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.info,letterSpacing:"0.1em",marginBottom:6}}>NEXT MILESTONE — {nextMilestone}%</div>
                <div style={{fontSize:12,color:T.textDim,marginBottom:10}}>
                  {total.pct===0?"You started. Most people never do. That already puts you ahead.":total.pct<25?"Solid foundations. Keep going — it gets more exciting from here.":total.pct<50?"You're in the core ML phase. This is where it clicks.":total.pct<75?"Past the halfway mark. You're building real skills now.":total.pct<100?"Final stretch. You're almost there!":"🎉 You've completed the roadmap!"}
                </div>
                <ProgressBar pct={(total.pct/nextMilestone)*100} color={T.info}/>
                <div style={{fontSize:9,color:T.textFade,marginTop:4}}>{total.pct}% → {nextMilestone}% ({nextMilestone-total.pct}% to go)</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:12,marginBottom:20}}>
              {[{label:"Tasks Done",value:total.done,sub:`of ${total.total}`,color:T.p1},{label:"Overall %",value:total.pct+"%",sub:"completed",color:T.good},{label:"Lessons Done",value:Object.values(userDoc.lessonsDone||{}).filter(Boolean).length,sub:`of ${LESSONS.length}`,color:T.p3},{label:"Remaining",value:total.total-total.done,sub:"tasks left",color:T.p4}].map(stat=>(
                <div key={stat.label} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px"}}>
                  <div style={{fontSize:10,color:T.textFade,marginBottom:6}}>{stat.label.toUpperCase()}</div>
                  <div style={{fontSize:28,fontWeight:700,color:stat.color}}>{stat.value}</div>
                  <div style={{fontSize:10,color:T.textFade}}>{stat.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:14}}>PHASE BREAKDOWN</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:10}}>
                {roadmap.map((ph,i)=>{const pp=getPP(ph);return(
                  <div key={i} style={{padding:"12px",background:T.bgDeep,borderRadius:10,border:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:ph.color,fontWeight:600}}>Phase {ph.phase}</span><span style={{fontSize:11,color:ph.color}}>{pp.pct}%</span></div>
                    <ProgressBar pct={pp.pct} color={ph.color}/>
                    <div style={{fontSize:9,color:T.textFade,marginTop:4}}>{pp.done}/{pp.total} tasks</div>
                  </div>
                );})}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div style={{background:T.bgCard,border:`1px solid ${streak>=7?T.gold+"88":T.border}`,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:9,color:T.gold,letterSpacing:"0.15em",fontWeight:700,marginBottom:10}}>🔥 DAILY STREAK</div>
                <div style={{fontSize:40,fontWeight:700,color:streak>=7?T.gold:streak>=3?T.p3:T.textDim,lineHeight:1}}>{streak}</div>
                <div style={{fontSize:11,color:T.textFade,marginTop:4}}>days in a row</div>
                <div style={{fontSize:10,color:T.textDim,marginTop:8}}>{streak===0?"Complete a task today to start your streak!":streak<3?"Good start! Keep going 💪":streak<7?"You're on a roll! Don't break it!":streak<14?"🔥 One week streak! Impressive!":"🏅 You're unstoppable!"}</div>
              </div>
              <div style={{background:T.bgCard,border:`1px solid ${thisWeekCheckin?T.good+"88":T.border}`,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:9,color:T.good,letterSpacing:"0.15em",fontWeight:700,marginBottom:10}}>📝 WEEKLY CHECK-IN</div>
                {thisWeekCheckin?(
                  <div>
                    <div style={{fontSize:11,color:T.good,marginBottom:6}}>✅ Done this week!</div>
                    <div style={{fontSize:10,color:T.textDim,lineHeight:1.6}}>"{thisWeekCheckin.learned.slice(0,80)}{thisWeekCheckin.learned.length>80?"...":""}"</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:11,color:T.textDim,marginBottom:12,lineHeight:1.6}}>You haven't checked in this week yet.</div>
                    <button onClick={()=>setShowCheckin(true)} style={{width:"100%",padding:"8px",background:T.good+"18",border:`1px solid ${T.good}55`,color:T.good,borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600}}>+ Check In Now</button>
                  </div>
                )}
              </div>
            </div>
            {showCheckin&&(
              <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
                <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:"32px",width:480,maxWidth:"90vw"}}>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>📝 Weekly Check-in</div>
                  <div style={{fontSize:11,color:T.textDim,marginBottom:20}}>Take 2 minutes to reflect on your week.</div>
                  {[{key:"learned",label:"What did you learn this week?",placeholder:"e.g. I finally understood how backpropagation works..."},{key:"difficult",label:"What was difficult?",placeholder:"e.g. Window functions in SQL were confusing..."},{key:"goal",label:"What's your goal for next week?",placeholder:"e.g. Finish the ML pipeline project..."}].map(q=>(
                    <div key={q.key} style={{marginBottom:14}}>
                      <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>{q.label}</div>
                      <textarea value={checkinForm[q.key]} onChange={e=>setCheckinForm(p=>({...p,[q.key]:e.target.value}))} placeholder={q.placeholder} rows={2} style={{width:"100%",background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:8,padding:"8px 12px",color:T.text,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={submitCheckin} style={{flex:1,padding:"10px",background:T.good+"18",border:`1px solid ${T.good}55`,color:T.good,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Submit</button>
                    <button onClick={()=>setShowCheckin(false)} style={{padding:"10px 16px",background:"none",border:`1px solid ${T.border}`,color:T.textDim,borderRadius:8,cursor:"pointer",fontSize:13}}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {checkins.length>0&&(
              <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:600,marginBottom:14}}>📋 Past Check-ins</div>
                {checkins.slice(0,3).map((c,i)=>(
                  <div key={i} style={{padding:"12px",background:T.bgDeep,borderRadius:10,marginBottom:8}}>
                    <div style={{fontSize:9,color:T.textFade,marginBottom:6}}>Week {c.week} — {new Date(c.date).toLocaleDateString()}</div>
                    <div style={{fontSize:11,color:T.good,marginBottom:4}}>✅ {c.learned}</div>
                    {c.difficult&&<div style={{fontSize:11,color:T.warn,marginBottom:4}}>⚠ {c.difficult}</div>}
                    {c.goal&&<div style={{fontSize:11,color:T.info}}>🎯 {c.goal}</div>}
                  </div>
                ))}
              </div>
            )}
            {messages.length>0&&(
              <div style={{background:T.bgCard,border:`1px solid ${T.p4}33`,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:9,color:T.p4,letterSpacing:"0.15em",fontWeight:700,marginBottom:8}}>💬 MESSAGE FROM YOUR INSTRUCTOR</div>
                <div style={{fontSize:12,color:T.textDim,lineHeight:1.7}}>{messages[0].text}</div>
                <div style={{fontSize:10,color:T.textFade,marginTop:6}}>{new Date(messages[0].time).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* ROADMAP */}
        {tab==="roadmap"&&(
          <div style={{display:"flex",height:"calc(100vh - 120px)"}}>
            <div style={{width:210,borderRight:`1px solid ${T.border}`,padding:"16px 12px",overflowY:"auto",background:T.bgDeep,flexShrink:0}}>
              {roadmap.map((ph,i)=>{const p2=getPP(ph);const a=i===activePhase;return(
                <button key={i} onClick={()=>{setActivePhase(i);setExpandedSection(null);}} style={{width:"100%",background:a?ph.color+"15":"transparent",border:`1px solid ${a?ph.color+"55":"transparent"}`,color:a?ph.color:T.textDim,padding:"8px 12px",borderRadius:7,cursor:"pointer",fontSize:11,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,textAlign:"left"}}>
                  <span>{ph.title}</span>
                  <span style={{fontSize:10,background:ph.color+"18",color:ph.color,padding:"1px 5px",borderRadius:3}}>{p2.pct}%</span>
                </button>
              );})}
              <div style={{borderTop:`1px solid ${T.border}`,marginTop:8,paddingTop:12}}>
                {phase.sections.map(s=>{const sp=getSP(s);const a=expandedSection===s.id;return(
                  <div key={s.id} onClick={()=>setExpandedSection(a?null:s.id)} style={{marginBottom:6,cursor:"pointer",padding:"7px 9px",borderRadius:6,background:a?C+"0e":"transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:sp.done===sp.total?C:T.textDim}}>{s.title}</span><span style={{fontSize:9,color:T.textFade}}>{sp.done}/{sp.total}</span></div>
                    <ProgressBar pct={sp.pct} color={C+"66"} height={2}/>
                  </div>
                );})}
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <ProgressRing pct={getPP(phase).pct} color={C} size={40} stroke={4}/>
                <div><div style={{fontSize:15,fontWeight:700,color:C}}>{phase.title}</div><div style={{fontSize:11,color:T.textDim}}>{phase.duration} · {getPP(phase).done}/{getPP(phase).total} tasks</div></div>
              </div>
              {phase.sections.map(section=>{
                const sp=getSP(section);const isDone=sp.done===sp.total;const isExp=expandedSection===section.id;
                return(
                  <div key={section.id} style={{marginBottom:10,background:T.bgCard,border:`1px solid ${isDone?C+"55":isExp?C+"33":T.border}`,borderRadius:12,overflow:"hidden"}}>
                    <div onClick={()=>setExpandedSection(isExp?null:section.id)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{fontSize:13,fontWeight:600,color:isDone?C:T.text}}>{section.title}</span><span style={{fontSize:10,color:T.textFade}}>{section.weeks}</span></div>
                        <ProgressBar pct={sp.pct} color={isDone?C:C+"77"} height={2}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,color:isDone?C:T.textDim,marginLeft:12}}>{sp.pct}%</span>
                    </div>
                    {isExp&&(
                      <div>
                        {(section.why||section.warning)&&(
                          <div style={{padding:"0 16px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                            {section.why&&<div style={{background:T.bgDeep,border:`1px solid ${C}22`,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:C,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>WHY THIS MATTERS</div><div style={{fontSize:11,color:T.textDim,lineHeight:1.7}}>{section.why}</div></div>}
                            {section.warning&&<div style={{background:T.bgDeep,border:`1px solid ${T.warn}22`,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:T.warn,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>⚠ COMMON MISTAKE</div><div style={{fontSize:11,color:T.textDim,lineHeight:1.7}}>{section.warning}</div></div>}
                          </div>
                        )}
                        {section.goldAdvice&&<div style={{margin:"0 16px 12px",background:T.gold+"0d",border:`1px solid ${T.gold}33`,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:T.gold,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>✦ GOLD ADVICE</div><div style={{fontSize:11,color:"#cfc9a0",lineHeight:1.7}}>{section.goldAdvice}</div></div>}
                        {SECTION_TO_FIRST_LESSON[section.id]&&(
                          <div style={{margin:"0 16px 12px"}}>
                            <button onClick={()=>navigateToLesson(SECTION_TO_FIRST_LESSON[section.id])} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",background:C+"12",border:`1px solid ${C}44`,borderRadius:8,cursor:"pointer",color:C,fontSize:12,fontWeight:600}}>
                              <span style={{fontSize:16}}>📚</span>
                              <span>Study this section — open interactive lesson</span>
                              <span style={{marginLeft:"auto",fontSize:10,opacity:0.7}}>→</span>
                            </button>
                          </div>
                        )}
                        {section.resources&&section.resources.length>0&&(
                          <div style={{margin:"0 16px 12px"}}>
                            <div style={{fontSize:8,color:T.textFade,letterSpacing:"0.15em",fontWeight:700,marginBottom:8}}>RESOURCES</div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                              {section.resources.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noreferrer" style={{background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:7,padding:"6px 11px",textDecoration:"none"}}><div style={{fontSize:11,color:C,marginBottom:2}}>{r.name}</div><div style={{fontSize:9,color:T.textFade}}>{r.type}</div></a>)}
                            </div>
                          </div>
                        )}
                        <div style={{borderTop:`1px solid ${T.border}`}}>
                          <div style={{fontSize:8,color:T.textFade,letterSpacing:"0.15em",padding:"10px 16px 4px"}}>TASKS — CLICK TO COMPLETE</div>
                          <div style={{paddingBottom:6}}>
                            {section.tasks.map((task,i)=>{
                              const key=`${section.id}-${i}`;const ck=!!progress[key];
                              return(
                                <div key={i} onClick={()=>toggle(section.id,i)} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"8px 16px",cursor:"pointer",background:ck?C+"0a":"transparent"}}>
                                  <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${ck?C:T.borderHi}`,background:ck?C+"25":"transparent",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    {ck&&<svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke={C} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                                  </div>
                                  <span style={{fontSize:12,color:ck?T.textFade:T.textDim,textDecoration:ck?"line-through":"none",lineHeight:1.6}}>{task}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {sectionProjects[section.id]&&sectionProjects[section.id].length>0&&(
                          <div>
                            <div style={{borderTop:`1px solid ${T.border}`}}/>
                            <div style={{fontSize:8,color:T.info,letterSpacing:"0.15em",padding:"10px 16px 8px"}}>HANDS-ON EXERCISES</div>
                            <div style={{padding:"0 16px 14px",display:"flex",flexDirection:"column",gap:8}}>
                              {sectionProjects[section.id].map((mp,i)=>(
                                <div key={i} style={{background:T.bgDeep,border:`1px solid ${typeColors[mp.type]}22`,borderRadius:8,padding:"11px 13px"}}>
                                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:typeColors[mp.type],background:typeColors[mp.type]+"18",padding:"2px 7px",borderRadius:3}}>{typeLabels[mp.type]}</span><span style={{fontSize:12,fontWeight:600,color:T.text}}>{mp.title}</span></div>
                                    {mp.url&&<a href={mp.url} target="_blank" rel="noreferrer" style={{fontSize:9,color:T.info,textDecoration:"none",flexShrink:0}}>dataset →</a>}
                                  </div>
                                  <div style={{fontSize:11,color:T.textDim,lineHeight:1.6}}>{mp.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {tab==="projects"&&(
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>All Projects & Challenges</div>
            <div style={{fontSize:11,color:T.textDim,marginBottom:20}}>Build these to prove your skills — not just complete courses.</div>
            {[1,2,3,4].map(phaseNum=>{
              const phProjects=portfolioProjects.filter(p=>p.phase===phaseNum);
              if(phProjects.length===0)return null;
              const phColor=phaseColors[phaseNum-1];
              const phaseNames=["Foundations","Core ML","Modern Skills","Portfolio & Jobs"];
              return(
                <div key={phaseNum} style={{marginBottom:32}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:10,height:10,borderRadius:"50%",background:phColor}}/><span style={{fontSize:14,fontWeight:700,color:phColor}}>Phase {phaseNum} — {phaseNames[phaseNum-1]}</span></div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))",gap:14}}>
                    {phProjects.map(proj=>{
                      const pColor=phaseColors[proj.phase-1];
                      return(
                        <div key={proj.id} style={{background:T.bgCard,border:`1px solid ${proj.portfolioWorthy?pColor+"55":T.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                          <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${T.border}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                <span style={{fontSize:9,color:typeColors[proj.type],background:typeColors[proj.type]+"15",padding:"2px 7px",borderRadius:3}}>{typeLabels[proj.type]}</span>
                                <span style={{fontSize:9,color:proj.difficulty==="Advanced"?T.warn:proj.difficulty==="Intermediate"?T.gold:T.info,background:(proj.difficulty==="Advanced"?T.warn:proj.difficulty==="Intermediate"?T.gold:T.info)+"15",padding:"2px 7px",borderRadius:3}}>{proj.difficulty}</span>
                                {proj.portfolioWorthy&&<span style={{fontSize:9,color:T.gold,background:T.gold+"15",padding:"2px 7px",borderRadius:3}}>★ Must-Build</span>}
                              </div>
                              <span style={{fontSize:9,color:pColor,background:pColor+"15",padding:"2px 7px",borderRadius:3,flexShrink:0}}>Phase {proj.phase}</span>
                            </div>
                            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>{proj.title}</div>
                            <div style={{fontSize:11,color:T.textDim,lineHeight:1.65}}>{proj.description}</div>
                            {proj.dataset?.url&&<a href={proj.dataset.url} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:8,fontSize:10,color:T.info,textDecoration:"none"}}>📈 {proj.dataset.name} →</a>}
                          </div>
                          <div style={{padding:"12px 16px",flex:1}}>
                            <div style={{fontSize:8,color:T.textFade,letterSpacing:"0.15em",marginBottom:10}}>STEPS</div>
                            {proj.steps.map((step,i)=>(
                              <div key={i} style={{display:"flex",gap:9,marginBottom:7}}>
                                <span style={{fontSize:9,color:pColor,background:pColor+"18",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{i+1}</span>
                                <span style={{fontSize:11,color:T.textDim,lineHeight:1.6}}>{step}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{padding:"10px 16px 14px",borderTop:`1px solid ${T.border}`}}>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              {proj.skills.map((sk,i)=><span key={i} style={{fontSize:9,color:T.textFade,background:T.bgDeep,border:`1px solid ${T.border}`,padding:"2px 7px",borderRadius:3}}>{sk}</span>)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LEADERBOARD */}
        {tab==="leaderboard"&&(
          <div style={{padding:"24px"}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:15,fontWeight:700}}>🏅 Student Leaderboard</div></div>
              {[...students].sort((a,b)=>getTotalProgress(b.progress||{},roadmap).pct-getTotalProgress(a.progress||{},roadmap).pct).map((u,i)=>{
                const prog=getTotalProgress(u.progress||{},roadmap);const isMe=u.id===currentUser.uid;
                const medals=["🥇","🥈","🥉"];const color=phaseColors[Math.min(3,Math.floor(prog.pct/25))];
                return(
                  <div key={u.id} style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:14,background:isMe?color+"08":"transparent"}}>
                    <div style={{width:30,fontSize:i<3?20:13,textAlign:"center"}}>{i<3?medals[i]:`#${i+1}`}</div>
                    <div style={{width:36,height:36,borderRadius:"50%",background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color}}>{u.username[0].toUpperCase()}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:isMe?700:500,color:isMe?color:T.text,marginBottom:4}}>{u.username}{isMe?" (you)":""}</div><ProgressBar pct={prog.pct} color={color}/></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,color}}>{prog.pct}%</div><div style={{fontSize:10,color:T.textFade}}>{prog.done}/{prog.total}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages"&&(
          <div style={{padding:"24px"}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:15,fontWeight:700}}>💬 Messages from your Instructor</div></div>
              {messages.length===0&&<div style={{padding:"24px",color:T.textFade,fontSize:12}}>No messages yet.</div>}
              {messages.map(m=>(
                <div key={m.id} style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:T.p4,background:T.p4+"15",padding:"2px 8px",borderRadius:4}}>{m.to==="all"?"📢 To everyone":"📨 To you"}</span><span style={{fontSize:10,color:T.textFade}}>{new Date(m.time).toLocaleString()}</span></div>
                  <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT APP
export default function App(){
  const [authUser,setAuthUser]=useState(null);
  const [userDoc,setUserDoc]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(user)=>{
      if(user){
        setAuthUser(user);
        const snap=await getDoc(doc(db,"users",user.uid));
        if(snap.exists()){
          const data=snap.data();
          if(data.disabled){await signOut(auth);setAuthUser(null);setUserDoc(null);setLoading(false);return;}
          setUserDoc(data);
        }else{
          setUserDoc({role:"admin",username:"Admin",email:user.email});
        }
      }else{setAuthUser(null);setUserDoc(null);}
      setLoading(false);
    });
    return unsub;
  },[]);

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#13111a",display:"flex",alignItems:"center",justifyContent:"center",color:"#e2dff0",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>🎓</div><div style={{fontSize:14,color:"#8b87a8"}}>Loading...</div></div>
    </div>
  );

  if(!authUser)return <LoginPage/>;
  if(userDoc?.role==="admin"||authUser.email===ADMIN_EMAIL)return <AdminDashboard currentUser={authUser}/>;
  return <StudentDashboard currentUser={authUser} userDoc={userDoc}/>;
}