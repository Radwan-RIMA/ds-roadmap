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


// ── ML LESSONS ────────────────────────────────────────────────────────────────
const ML_LESSONS = [
  {
    id:"ml-workflow", title:"The ML Workflow", subtitle:"How every ML project is structured",
    emoji:"🔄", color:"#a78bfa", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Machine learning isn't magic — it's a repeatable process. Every project, from predicting house prices to detecting fraud, follows the same 6 steps.</LP>
        <LH>The 6-Step ML Workflow</LH>
        <Callout icon="1️⃣" color="#7eb8f7" title="Define the Problem">
          What are you predicting? What's the target variable? Is it regression (number) or classification (category)? Bad problem definition kills projects before they start.
        </Callout>
        <Callout icon="2️⃣" color="#6dd6a0" title="Get & Explore Data">
          Load your data, run EDA. Check for nulls, outliers, class imbalance. Understand what each feature means.
        </Callout>
        <Callout icon="3️⃣" color="#f7c96e" title="Prepare Data">
          Split into train/test. Encode categoricals. Scale features. Handle nulls. Never touch test data during preparation.
        </Callout>
        <Callout icon="4️⃣" color="#f28b82" title="Train a Model">
          Pick an algorithm. Fit it on training data. Start simple — always try linear regression or logistic regression first.
        </Callout>
        <Callout icon="5️⃣" color="#c792ea" title="Evaluate">
          Score on test data. Use the right metric (accuracy, RMSE, F1, AUC — depends on the problem).
        </Callout>
        <Callout icon="6️⃣" color="#7eb8f7" title="Improve & Deploy">
          Tune hyperparameters, try different algorithms, engineer new features. Then deploy.
        </Callout>
        <LH>Train / Test Split — The Golden Rule</LH>
        <LP>You split your data so you can measure how well the model generalizes to unseen data. If you evaluate on training data, you're cheating — the model already saw those answers.</LP>
        <Block label="python">{`from sklearn.model_selection import train_test_split

X = df.drop("price", axis=1)   # features
y = df["price"]                 # target

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,    # 20% for testing
    random_state=42   # reproducibility
)

print(f"Train: {len(X_train)} rows")
print(f"Test:  {len(X_test)} rows")`}</Block>
        <Callout icon="⚠️" color="#f28b82" title="Never do this">
          Don't fit scalers or encoders on the full dataset before splitting. That leaks test information into training. Always split first, then fit transformers on train only.
        </Callout>
        <LH>The Scikit-learn Pattern</LH>
        <LP>Every algorithm in scikit-learn uses the same 3 methods. Learn this once, it works for all models:</LP>
        <Block label="python">{`model = SomeAlgorithm()     # 1. Create
model.fit(X_train, y_train) # 2. Train
preds = model.predict(X_test) # 3. Predict`}</Block>
        <Quiz questions={[
          {q:"Why do we split data into train and test sets?",options:["To have more data","To measure how the model performs on unseen data","To speed up training","To reduce overfitting"],answer:"To measure how the model performs on unseen data",explanation:"If you evaluate on training data, the model already saw those examples. Test set simulates real-world unseen data."},
          {q:"You fit a StandardScaler on the full dataset before splitting. What's wrong?",options:["Nothing, scaling is just math","It leaks test statistics into training — data leakage","It makes the model worse","Scaling should come after training"],answer:"It leaks test statistics into training — data leakage",explanation:"The scaler computes mean/std from all data including test. That's information the model shouldn't have. Always fit transformers on train only."},
          {q:"What's the correct order?",options:["Train model → Split data → Evaluate","Split data → Train model → Evaluate on test","Evaluate → Train → Split","Split → Evaluate → Train"],answer:"Split data → Train model → Evaluate on test",explanation:"Split first, train on train set only, then evaluate on the held-out test set. This simulates real-world deployment."},
        ]}/>
      </div>
    )
  },
  {
    id:"ml-regression", title:"Linear & Logistic Regression", subtitle:"The two models every DS must know cold",
    emoji:"📈", color:"#34d399", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>These two algorithms are the foundation of ML. They're simple, interpretable, fast, and often good enough. Master them before touching anything else.</LP>
        <LH>Linear Regression — predicting numbers</LH>
        <LP>Linear regression finds the best straight line (or hyperplane) through your data. The output is a continuous number — price, temperature, salary.</LP>
        <Block label="python">{`from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

model = LinearRegression()
model.fit(X_train, y_train)

preds = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, preds))
r2   = r2_score(y_test, preds)

print(f"RMSE: {rmse:.2f}")   # lower is better
print(f"R²:   {r2:.3f}")     # 1.0 = perfect, 0 = useless

# Inspect what the model learned
for feat, coef in zip(X_train.columns, model.coef_):
    print(f"{feat}: {coef:.3f}")`}</Block>
        <Callout icon="💡" color="#34d399" title="What does R² mean?">
          R² = 0.85 means the model explains 85% of the variance in the target. The remaining 15% is noise or missing features. R² above 0.7 is usually decent for real-world data.
        </Callout>
        <LH>Logistic Regression — predicting categories</LH>
        <LP>Despite the name, logistic regression is a classification algorithm. It predicts the probability of a class (0 or 1, spam or not, churn or not). The output is between 0 and 1.</LP>
        <Block label="python">{`from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

preds = model.predict(X_test)
probs = model.predict_proba(X_test)[:, 1]  # probability of class 1

print(classification_report(y_test, preds))
# Shows precision, recall, F1 for each class`}</Block>
        <Callout icon="⚠️" color="#f28b82" title="Common mistake">
          Using accuracy on imbalanced data. If 95% of emails are not spam, a model that always predicts "not spam" gets 95% accuracy but is useless. Use precision, recall, and F1 instead.
        </Callout>
        <LH>When to use which?</LH>
        <Block>{`Target is a number (price, score, count)  → Linear Regression
Target is a category (yes/no, A/B/C)     → Logistic Regression`}</Block>
        <Quiz questions={[
          {q:"You're predicting house prices. Which algorithm?",options:["Logistic Regression","Linear Regression","Both work the same","Neither"],answer:"Linear Regression",explanation:"House price is a continuous number — that's regression. Logistic regression outputs class probabilities, not numbers."},
          {q:"Your model gets 99% accuracy on fraud detection. Is it good?",options:["Yes, 99% is excellent","Maybe not — check if dataset is imbalanced","Only if R² is also high","Yes if RMSE is low"],answer:"Maybe not — check if dataset is imbalanced",explanation:"If only 1% of transactions are fraud, predicting 'not fraud' always gives 99% accuracy. Always check class distribution and use F1/precision/recall for imbalanced problems."},
          {q:"model.predict_proba(X_test)[:,1] gives you:",options:["The predicted class label","The probability of the positive class","The R² score","The feature importances"],answer:"The probability of the positive class",explanation:"predict_proba returns probabilities for each class. [:,1] selects the probability of class 1 (the positive class). Useful for ranking or setting custom thresholds."},
        ]}/>
      </div>
    )
  },
  {
    id:"ml-trees", title:"Decision Trees & Random Forests", subtitle:"The most used algorithms in industry",
    emoji:"🌳", color:"#f59e0b", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Random Forest is the most commonly used algorithm in data science competitions and industry projects. It works well on most tabular data with almost no tuning.</LP>
        <LH>Decision Trees — how they work</LH>
        <LP>A decision tree splits data by asking yes/no questions on features, like a flowchart. At each node it picks the split that best separates the classes or minimizes error.</LP>
        <Block label="python">{`from sklearn.tree import DecisionTreeClassifier

tree = DecisionTreeClassifier(max_depth=5)  # limit depth to avoid overfitting
tree.fit(X_train, y_train)

print(f"Train accuracy: {tree.score(X_train, y_train):.3f}")
print(f"Test accuracy:  {tree.score(X_test, y_test):.3f}")

# Feature importances — which features the tree used most
import pandas as pd
importances = pd.Series(tree.feature_importances_, index=X_train.columns)
print(importances.sort_values(ascending=False).head(10))`}</Block>
        <Callout icon="⚠️" color="#f28b82" title="Decision trees overfit badly">
          A single deep tree memorizes training data. Train accuracy = 100%, test accuracy = 60%. That's overfitting. The fix is Random Forest.
        </Callout>
        <LH>Random Forest — the fix for overfitting</LH>
        <LP>Random Forest builds hundreds of trees, each on a random subset of data and features, then averages their predictions. The randomness prevents any single tree from overfitting.</LP>
        <Block label="python">{`from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=100,   # number of trees
    max_depth=None,     # let trees grow fully
    random_state=42
)
rf.fit(X_train, y_train)

print(f"Train: {rf.score(X_train, y_train):.3f}")
print(f"Test:  {rf.score(X_test, y_test):.3f}")

# Feature importances work the same way
importances = pd.Series(rf.feature_importances_, index=X_train.columns)
importances.sort_values(ascending=False).head(10)`}</Block>
        <Callout icon="✦" color="#f59e0b" title="Gold advice">
          In any new project, run Random Forest first. It handles mixed data types, doesn't need feature scaling, rarely overfits badly, and gives you feature importances for free. Use it as your baseline.
        </Callout>
        <LH>For regression problems</LH>
        <Block label="python">{`from sklearn.ensemble import RandomForestRegressor

rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
preds = rf.predict(X_test)`}</Block>
        <Quiz questions={[
          {q:"A decision tree gets 100% train accuracy and 58% test accuracy. What happened?",options:["Good model","Underfitting","Overfitting — the tree memorized training data","Data leakage"],answer:"Overfitting — the tree memorized training data",explanation:"Huge gap between train and test accuracy = overfitting. The tree learned the training data perfectly including noise, and can't generalize."},
          {q:"Why does Random Forest outperform a single Decision Tree?",options:["It uses more memory","It averages many diverse trees, reducing overfitting","It trains faster","It requires less data"],answer:"It averages many diverse trees, reducing overfitting",explanation:"Each tree sees random data and features. Their errors are different, so they cancel out when averaged. This is called ensemble learning."},
          {q:"Does Random Forest need feature scaling?",options:["Yes, always scale first","No — tree-based models are scale-invariant","Only for large datasets","Only for classification"],answer:"No — tree-based models are scale-invariant",explanation:"Trees split on thresholds, not distances. Whether age is 25 or 0.25 after scaling doesn't change where the split goes. Unlike linear models or KNN, no scaling needed."},
        ]}/>
      </div>
    )
  },
  {
    id:"ml-evaluation", title:"Model Evaluation", subtitle:"Choosing the right metric for the right problem",
    emoji:"📊", color:"#38bdf8", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Picking the wrong metric is one of the most common mistakes in DS. Accuracy sounds good but often misleads. You need to know which metric matches your problem.</LP>
        <LH>Regression Metrics</LH>
        <Block label="python">{`from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

rmse = np.sqrt(mean_squared_error(y_test, preds))
mae  = mean_absolute_error(y_test, preds)
r2   = r2_score(y_test, preds)

# RMSE: penalizes large errors heavily (good if big errors are costly)
# MAE:  average absolute error (more robust to outliers)
# R²:   % of variance explained (1.0 = perfect)`}</Block>
        <LH>Classification Metrics</LH>
        <Block label="python">{`from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score,
    confusion_matrix, roc_auc_score
)

# Confusion matrix
cm = confusion_matrix(y_test, preds)
# [[TN, FP],
#  [FN, TP]]

precision = precision_score(y_test, preds)  # of predicted positives, how many right?
recall    = recall_score(y_test, preds)     # of actual positives, how many caught?
f1        = f1_score(y_test, preds)         # harmonic mean of precision & recall
auc       = roc_auc_score(y_test, probs)    # ranking quality (use predict_proba)`}</Block>
        <Callout icon="💡" color="#38bdf8" title="Precision vs Recall trade-off">
          High precision = when you say positive, you're usually right (few false alarms). High recall = you catch most real positives (few misses). You usually can't maximize both. Choose based on what's costlier — a false alarm or a miss.
        </Callout>
        <LH>Which metric for which problem?</LH>
        <Block>{`House price prediction          → RMSE, MAE, R²
Spam detection                  → Precision (false alarms are annoying)
Cancer screening                → Recall (missing a case is catastrophic)
Fraud detection                 → F1 or AUC (imbalanced + both errors matter)
Balanced binary classification  → Accuracy is fine`}</Block>
        <Callout icon="✦" color="#f7c96e" title="Gold advice">
          Always look at the confusion matrix first. It shows you exactly where your model fails — which classes it confuses. A single number metric hides this.
        </Callout>
        <Quiz questions={[
          {q:"For cancer screening, which metric matters most?",options:["Precision","Accuracy","Recall","R²"],answer:"Recall",explanation:"Missing a cancer case (false negative) is catastrophic. Recall measures how many actual positives you catch. You'd rather have some false alarms than miss real cases."},
          {q:"Your fraud model: precision=0.90, recall=0.20. What does this mean?",options:["Great model","When it flags fraud it's usually right, but it misses 80% of actual fraud","It misses 90% of fraud","Accuracy is 90%"],answer:"When it flags fraud it's usually right, but it misses 80% of actual fraud",explanation:"High precision = few false alarms. Low recall = misses most real fraud. This model is too conservative — it only flags cases it's very sure about."},
          {q:"AUC-ROC = 0.5 means:",options:["Perfect model","Good model","Model is no better than random guessing","Model needs more data"],answer:"Model is no better than random guessing",explanation:"AUC of 0.5 = random. AUC of 1.0 = perfect. AUC measures how well the model ranks positives above negatives across all thresholds."},
        ]}/>
      </div>
    )
  },
  {
    id:"ml-overfitting", title:"Overfitting & Regularization", subtitle:"Why models fail in production and how to fix it",
    emoji:"🎯", color:"#f87171", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>Overfitting is the #1 reason ML models fail in production. Understanding it — and how to fix it — separates good data scientists from beginners.</LP>
        <LH>What is Overfitting?</LH>
        <LP>A model overfits when it learns the training data too well — including noise and random patterns that don't generalize. It performs great on training data but poorly on new data.</LP>
        <Block>{`Underfitting:  Train=60%  Test=58%   → model too simple, not learning enough
Good fit:      Train=88%  Test=85%   → generalizes well
Overfitting:   Train=99%  Test=62%   → memorized training data`}</Block>
        <LH>How to Detect It</LH>
        <Block label="python">{`# Always compare train vs test performance
train_score = model.score(X_train, y_train)
test_score  = model.score(X_test, y_test)

gap = train_score - test_score
if gap > 0.1:
    print("⚠ Likely overfitting — large train/test gap")
elif train_score < 0.7:
    print("⚠ Likely underfitting — model too simple")
else:
    print("✓ Looks good")`}</Block>
        <LH>Fix 1: Regularization (for linear models)</LH>
        <LP>Regularization adds a penalty for large coefficients, forcing the model to stay simple. Ridge (L2) and Lasso (L1) are the two main types.</LP>
        <Block label="python">{`from sklearn.linear_model import Ridge, Lasso

# Ridge: shrinks all coefficients toward zero
ridge = Ridge(alpha=1.0)  # higher alpha = more regularization
ridge.fit(X_train, y_train)

# Lasso: can zero out coefficients entirely (feature selection)
lasso = Lasso(alpha=0.1)
lasso.fit(X_train, y_train)

# Check which features Lasso eliminated
import pandas as pd
coefs = pd.Series(lasso.coef_, index=X_train.columns)
print("Features kept:", (coefs != 0).sum())
print(coefs[coefs != 0])`}</Block>
        <LH>Fix 2: Cross-Validation</LH>
        <LP>Instead of one train/test split, cross-validation tests your model on multiple splits and averages the results. More reliable estimate of real performance.</LP>
        <Block label="python">{`from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring="r2")
print(f"CV scores: {scores}")
print(f"Mean: {scores.mean():.3f} ± {scores.std():.3f}")
# High std = model is unstable (overfitting to specific splits)`}</Block>
        <LH>Fix 3: More Data, Simpler Model, Dropout</LH>
        <Block>{`More training data         → reduces overfitting most reliably
Reduce model complexity    → smaller max_depth, fewer layers
Feature selection          → remove noisy irrelevant features
Early stopping             → stop training when test loss increases`}</Block>
        <Quiz questions={[
          {q:"Train accuracy = 98%, test accuracy = 61%. What's the problem?",options:["Underfitting","Overfitting","Data leakage","Wrong metric"],answer:"Overfitting",explanation:"Huge gap between train and test = overfitting. The model memorized training data including noise and doesn't generalize."},
          {q:"What does Lasso regularization do that Ridge doesn't?",options:["It's faster","It can zero out coefficients entirely (feature selection)","It works for classification","It needs less data"],answer:"It can zero out coefficients entirely (feature selection)",explanation:"Lasso (L1) penalty can shrink coefficients all the way to zero, effectively removing features. Ridge (L2) only shrinks them toward zero but rarely to exactly zero."},
          {q:"Cross-validation with cv=5 means:",options:["5 random train/test splits kept","Data split into 5 folds, model trained 5 times each time tested on a different fold","5 different models trained","5% used for testing"],answer:"Data split into 5 folds, model trained 5 times each time tested on a different fold",explanation:"5-fold CV: split data into 5 equal parts. Train on 4, test on 1. Repeat 5 times. Average the 5 scores. More reliable than a single split."},
        ]}/>
      </div>
    )
  },
  {
    id:"ml-sklearn", title:"Scikit-learn in Practice", subtitle:"End-to-end ML pipeline you can use on any project",
    emoji:"⚙️", color:"#818cf8", phase:"🤖 Machine Learning",
    body: () => (
      <div>
        <LP>This lesson puts everything together. You'll see a complete ML pipeline from raw data to final evaluation — the template you'll reuse on every project.</LP>
        <LH>The Full Pipeline</LH>
        <Block label="python">{`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# ── 1. LOAD DATA
df = pd.read_csv("data.csv")
print(df.shape, df.dtypes)

# ── 2. EDA (quick)
print(df.isnull().sum())
print(df.describe())

# ── 3. PREPARE
# Drop rows with too many nulls, fill the rest
df = df.dropna(thresh=len(df.columns)*0.5)
df["age"] = df["age"].fillna(df["age"].median())

# Encode categoricals
for col in df.select_dtypes("object").columns:
    if col != "target":
        df[col] = LabelEncoder().fit_transform(df[col])

# ── 4. SPLIT
X = df.drop("target", axis=1)
y = df["target"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── 5. SCALE (for linear models — not needed for RF)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)   # transform only, not fit!

# ── 6. TRAIN
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)  # RF doesn't need scaling

# ── 7. EVALUATE
preds = rf.predict(X_test)
print(classification_report(y_test, preds))
print(confusion_matrix(y_test, preds))

# ── 8. CROSS-VALIDATE
cv_scores = cross_val_score(rf, X, y, cv=5)
print(f"CV: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")`}</Block>
        <LH>Scikit-learn Pipelines — the clean way</LH>
        <LP>Pipelines chain preprocessing and modeling steps together. This prevents data leakage and makes deployment much easier.</LP>
        <Block label="python">{`from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler",  StandardScaler()),
    ("model",   RandomForestClassifier(n_estimators=100))
])

pipe.fit(X_train, y_train)
preds = pipe.predict(X_test)

# Now you can cross-validate the whole pipeline safely
cv = cross_val_score(pipe, X, y, cv=5)
print(f"Pipeline CV: {cv.mean():.3f}")`}</Block>
        <Callout icon="✦" color="#818cf8" title="Your project checklist">
          1) EDA first — understand your data before modeling. 2) Start with Random Forest as baseline. 3) Always cross-validate. 4) Use Pipeline to prevent leakage. 5) Report the right metric for your problem type.
        </Callout>
        <LH>Hyperparameter Tuning</LH>
        <Block label="python">{`from sklearn.model_selection import GridSearchCV

params = {
    "n_estimators": [50, 100, 200],
    "max_depth":    [None, 10, 20],
    "min_samples_split": [2, 5],
}

grid = GridSearchCV(RandomForestClassifier(), params, cv=5, scoring="f1")
grid.fit(X_train, y_train)

print("Best params:", grid.best_params_)
print("Best CV F1:", grid.best_score_)`}</Block>
        <Quiz questions={[
          {q:"Why use scaler.transform(X_test) instead of scaler.fit_transform(X_test)?",options:["It's faster","fit_transform would compute new stats from test data — data leakage","They do the same thing","transform is more accurate"],answer:"fit_transform would compute new stats from test data — data leakage",explanation:"The scaler was fitted on training data (learned mean/std from train). Test data must be transformed using those same train statistics. Re-fitting on test leaks test info."},
          {q:"What's the main benefit of sklearn Pipeline?",options:["Faster training","Prevents data leakage and makes cross-validation safe","Uses less memory","Automatic feature selection"],answer:"Prevents data leakage and makes cross-validation safe",explanation:"Pipeline ensures that in each CV fold, preprocessing is fitted only on training fold data. Without Pipeline, you'd accidentally fit the scaler on all data before splitting."},
          {q:"GridSearchCV with cv=5 and 12 param combinations trains how many models?",options:["12","5","60","17"],answer:"60",explanation:"For each of the 12 param combinations, 5-fold CV trains 5 models. 12 × 5 = 60 models total. This is why hyperparameter tuning is slow on large datasets."},
        ]}/>
      </div>
    )
  },
];

// Merge ML lessons into LESSONS array
LESSONS.push(...ML_LESSONS);

const LEARN_PHASES = [
  {label:"🐍 Python for DS", ids:["numpy","pandas-basics","pandas-advanced","eda","visualization"]},
  {label:"🗄️ SQL",           ids:["sql-basics","sql-joins","sql-window"]},
  {label:"📐 Statistics",    ids:["probability","distributions","correlation","inference"]},
  {label:"🤖 Machine Learning", ids:["ml-workflow","ml-regression","ml-trees","ml-evaluation","ml-overfitting","ml-sklearn"]},
];


// Maps roadmap section id → first lesson to open when "Study this" is clicked
const SECTION_TO_FIRST_LESSON = {
  "python-ds":  "numpy",
  "sql":        "sql-basics",
  "stats-prob": "probability",
  "stats-dist": "distributions",
  "stats-inf":  "inference",
  "ml-core":    "ml-workflow",
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
