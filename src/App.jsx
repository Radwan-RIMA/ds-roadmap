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

// ─── SECTION PROJECTS ────────────────────────────────────────────────────────
const sectionProjects = {
  "python-core": [{ type: "coding", title: "Data Cleaner Script", desc: "Write a Python script that takes a messy CSV, cleans it (handle nulls, fix types, remove duplicates), and outputs a clean version. No pandas yet — base Python only." }, { type: "coding", title: "File Organizer", desc: "Build a script that reads a folder and sorts files into subfolders by extension, date, or size." }],
  "python-ds": [{ type: "dataset", title: "Pandas 30-Question Challenge", desc: "Load the NYC Airbnb dataset. Answer 30 progressively harder questions using only Pandas.", url: "https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data" }, { type: "coding", title: "NumPy Matrix Operations", desc: "Implement matrix multiplication, dot product, and cosine similarity from scratch using NumPy." }],
  "sql": [{ type: "dataset", title: "Business KPI Dashboard in SQL", desc: "Using Chinook, write 10 SQL queries answering real business questions. Use CTEs and window functions.", url: "https://github.com/lerocha/chinook-database" }, { type: "coding", title: "SQL Murder Mystery", desc: "Solve a detective story entirely using SQL queries.", url: "https://mystery.knightlab.com" }],
  "stats-prob": [{ type: "coding", title: "Bayes Spam Filter", desc: "Build a Naive Bayes spam classifier using only Python and probability math. No sklearn." }, { type: "coding", title: "Monte Carlo Simulations", desc: "Use random simulation to estimate π, birthday paradox probability, and expected value of a dice game." }],
  "stats-dist": [{ type: "coding", title: "Distribution Fitting", desc: "Take 3 real datasets. Plot histogram, identify best-fit distribution, fit with scipy, verify with Q-Q plot." }, { type: "coding", title: "CLT Visualizer", desc: "Demonstrate the CLT: sample from non-normal distributions in increasing sample sizes and visualize." }],
  "stats-inf": [{ type: "dataset", title: "A/B Test from Scratch", desc: "Calculate test statistic, p-value, and CI using only numpy — no scipy. Then verify with scipy.", url: "https://www.kaggle.com/datasets/zhangluyuan/ab-testing" }],
  "linalg": [{ type: "coding", title: "PCA from Scratch", desc: "Implement PCA using NumPy: center data, compute covariance matrix, find eigenvectors, project data." }],
  "ml-framework": [{ type: "coding", title: "Overfit Then Fix", desc: "Deliberately overfit a decision tree. Then apply regularization, cross-validation, early stopping." }],
  "ml-regression": [{ type: "coding", title: "Linear Regression from Scratch", desc: "Implement OLS and gradient descent, compare both against sklearn.", url: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques" }],
  "ml-class": [{ type: "dataset", title: "Fraud Detection Challenge", desc: "Handle 99.8% class imbalance. Optimize for recall.", url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud" }],
  "ml-unsupervised": [{ type: "dataset", title: "Customer Segmentation", desc: "Use KMeans on e-commerce data. Interpret each cluster in business terms.", url: "https://www.kaggle.com/datasets/carrie1/ecommerce-data" }],
  "ml-pipeline": [{ type: "coding", title: "Reproducible Pipeline", desc: "Refactor a messy notebook into clean Python modules. One command to run all." }],
  "feature-eng": [{ type: "dataset", title: "Kaggle Feature Engineering Sprint", desc: "Enter a Kaggle tabular competition. Spend 3 days ONLY on feature engineering.", url: "https://www.kaggle.com/competitions" }],
  "dl-nn": [{ type: "coding", title: "Neural Net from Scratch", desc: "2-layer NN in NumPy only. Forward pass, backprop, gradient descent. Train on MNIST, reach >90%." }],
  "dl-cnn": [{ type: "dataset", title: "Transfer Learning Fine-tune", desc: "Fine-tune pretrained ResNet18 on a dataset of your choice.", url: "https://www.kaggle.com/datasets" }],
  "dl-nlp": [{ type: "dataset", title: "Fine-tune BERT", desc: "Fine-tune DistilBERT on text classification. Compare vs TF-IDF + Logistic Regression baseline.", url: "https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" }],
  "llm": [{ type: "coding", title: "Build a RAG System", desc: "Document Q&A: load PDFs, chunk, embed, store in FAISS, retrieve on query, generate answers with LLM." }],
  "mlops": [{ type: "coding", title: "Containerize & Deploy", desc: "Wrap your best model in FastAPI, containerize with Docker, deploy to Railway or Render." }],
  "dataviz": [{ type: "coding", title: "Remake a Bad Chart", desc: "Find a confusing chart online. Identify what's wrong. Rebuild as clear visualization.", url: "https://www.reddit.com/r/dataisugly/" }],
  "portfolio": [{ type: "portfolio", title: "5-Slide Business Deck per Project", desc: "For each project: Problem → Data → Approach → Results → Recommendation. Present as if to a VP." }],
  "int-sql": [{ type: "coding", title: "Timed SQL Sprint", desc: "30-minute timer. 3 hard StrataScratch problems, no autocomplete.", url: "https://www.stratascratch.com" }],
  "int-stats": [{ type: "coding", title: "Stats Verbal Drill", desc: "Record yourself answering 5 questions out loud: p-values, A/B test design, CLT, Type I/II errors." }],
  "int-ml": [{ type: "coding", title: "Algorithm Explainer Cards", desc: "For each algorithm: 150-word explanation covering intuition, assumptions, failure modes, tuning." }],
  "int-case": [{ type: "coding", title: "Case Study Mock", desc: "20-minute timer. Design a recommendation system for Netflix out loud. Record yourself." }],
  "networking": [{ type: "portfolio", title: "LinkedIn Content Plan", desc: "4 posts over 4 weeks: something learned, a project, a mistake and fix, a concept explained simply." }],
};

const typeColors = { coding: "#7eb8f7", dataset: "#6dd6a0", portfolio: "#c792ea" };
const typeLabels = { coding: "⌨ Coding", dataset: "📊 Dataset", portfolio: "🚀 Portfolio" };

// ─── PORTFOLIO PROJECTS ───────────────────────────────────────────────────────
const portfolioProjects = [
  { id: "proj-python", phase: 1, type: "coding", difficulty: "Beginner", title: "Data Cleaner & EDA Tool", description: "Build a Python script that takes any messy CSV, cleans it, and outputs a full EDA report. Your first real Python project.", dataset: { name: "NYC Airbnb Dataset", url: "https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data" }, steps: ["Load CSV with pandas and inspect: shape, dtypes, nulls", "Handle missing values: drop or impute with justification", "Fix data types (dates, categories, numerics)", "Remove duplicates", "Generate 10 insights using groupby and aggregations", "Plot 5 charts: distributions, correlations, outliers", "Export clean CSV and a summary text file"], skills: ["Python", "Pandas", "Matplotlib", "File I/O"], portfolioWorthy: false },
  { id: "proj-sql-kpi", phase: 1, type: "dataset", difficulty: "Beginner", title: "Business KPI Dashboard in SQL", description: "Answer 10 real business questions using SQL on a real database. Practice JOINs, CTEs, and window functions.", dataset: { name: "Chinook Music Database", url: "https://github.com/lerocha/chinook-database" }, steps: ["Set up the Chinook database locally", "Write queries for: top 10 customers by revenue, monthly sales trend, best-selling genres", "Use CTEs for multi-step logic", "Use window functions: rank artists by sales, month-over-month growth", "Write one query using all of: JOIN, GROUP BY, HAVING, CTE, window function", "Export results and write a 1-page business summary"], skills: ["SQL", "CTEs", "Window Functions", "Business Thinking"], portfolioWorthy: false },
  { id: "proj-stats", phase: 1, type: "coding", difficulty: "Beginner", title: "A/B Test from Scratch (Stats Only)", description: "Run a complete A/B test using only NumPy — no scipy shortcuts. Prove you understand the math, not just the library.", dataset: { name: "A/B Test Dataset", url: "https://www.kaggle.com/datasets/zhangluyuan/ab-testing" }, steps: ["Load and explore the dataset", "Calculate conversion rates for control and treatment", "Compute test statistic manually using NumPy", "Calculate p-value from scratch", "Compute 95% confidence interval manually", "Verify all results match scipy output", "Write a recommendation memo: should we ship the change?"], skills: ["Statistics", "NumPy", "Hypothesis Testing", "Python"], portfolioWorthy: false },
  { id: "proj-churn", phase: 2, type: "portfolio", difficulty: "Beginner", title: "Customer Churn Predictor", description: "Build an end-to-end churn prediction model with full business framing — dollar value of predictions, not just accuracy.", dataset: { name: "Telco Customer Churn", url: "https://www.kaggle.com/datasets/blastchar/telco-customer-churn" }, steps: ["EDA: visualize churn rate by contract type, tenure, and monthly charges", "Feature engineering: encode categoricals, create tenure buckets", "Train Logistic Regression, Random Forest, XGBoost", "Optimize for recall (missing a churner costs more than a false alarm)", "Calculate: if we retain 20% of predicted churners at $500/year, what's the ROI?", "Deploy as a Streamlit app — keep it live", "Write a 5-slide business summary"], skills: ["Python", "Pandas", "sklearn", "XGBoost", "Streamlit"], portfolioWorthy: true },
  { id: "proj-abtest", phase: 2, type: "dataset", difficulty: "Intermediate", title: "A/B Test Full Analysis", description: "Analyze a real A/B test end-to-end. Go beyond the p-value.", dataset: { name: "A/B Test Dataset", url: "https://www.kaggle.com/datasets/zhangluyuan/ab-testing" }, steps: ["Calculate conversion rates for control vs treatment", "Check sample size — was the test adequately powered?", "Run the hypothesis test and compute p-value correctly", "Calculate the confidence interval for the difference", "Discuss practical significance: is the effect size worth the cost?", "Write a 1-page recommendation memo to a product manager"], skills: ["Statistics", "Hypothesis Testing", "Python", "Business Communication"], portfolioWorthy: false },
  { id: "proj-pipeline", phase: 2, type: "coding", difficulty: "Intermediate", title: "ML Pipeline from Scratch", description: "Build a complete, reproducible sklearn Pipeline — no ad-hoc notebooks.", dataset: { name: "House Prices Dataset", url: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques" }, steps: ["Write a data loading module", "Build a sklearn ColumnTransformer for numerical and categorical features", "Wrap everything in a Pipeline: preprocessor + model", "Use GridSearchCV for tuning", "Evaluate with cross-validation, plot learning curves", "Save the pipeline with joblib", "Write a predict.py script"], skills: ["sklearn Pipelines", "Feature Engineering", "Clean Code", "joblib"], portfolioWorthy: false },
  { id: "proj-nn", phase: 3, type: "coding", difficulty: "Intermediate", title: "Neural Network from Scratch (NumPy)", description: "Build a 2-layer neural network using only NumPy.", dataset: { name: "MNIST digits (via sklearn)", url: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html" }, steps: ["Initialize weights and biases randomly", "Implement forward pass: linear + ReLU + softmax", "Implement cross-entropy loss", "Implement backpropagation manually", "Implement gradient descent update", "Train on MNIST, reach >90% accuracy", "Plot loss curve over epochs"], skills: ["NumPy", "Backpropagation", "Linear Algebra", "Deep Learning Math"], portfolioWorthy: false },
  { id: "proj-bert", phase: 3, type: "portfolio", difficulty: "Intermediate", title: "NLP Sentiment Classifier — Fine-tuned BERT", description: "Fine-tune a pretrained BERT model on real domain-specific text. Deploy it as a simple API.", dataset: { name: "IMDb Movie Reviews", url: "https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" }, steps: ["Load and preprocess dataset using Hugging Face tokenizer", "Fine-tune DistilBERT using Hugging Face Trainer API", "Evaluate: accuracy, F1, confusion matrix", "Wrap model in FastAPI: POST /predict → sentiment + confidence", "Deploy to Hugging Face Spaces — keep it live", "Write README explaining model, training, and API usage"], skills: ["Hugging Face", "BERT", "FastAPI", "NLP", "Deployment"], portfolioWorthy: true },
  { id: "proj-rag", phase: 3, type: "portfolio", difficulty: "Advanced", title: "RAG-Powered Document Q&A System", description: "Build a system that lets users ask questions about documents using RAG.", dataset: { name: "Any PDF corpus (research papers, reports)", url: "https://arxiv.org" }, steps: ["Load and chunk documents", "Embed chunks using an embedding model", "Store in FAISS or ChromaDB", "On query: embed question, retrieve top-k chunks", "Pass context + question to LLM for grounded answer", "Add a Streamlit or Gradio UI", "Deploy to Hugging Face Spaces — keep it live"], skills: ["LangChain", "Vector Databases", "Embeddings", "LLMs", "Streamlit"], portfolioWorthy: true },
  { id: "proj-mlops", phase: 3, type: "portfolio", difficulty: "Advanced", title: "End-to-End Deployed ML System", description: "Make any model production-ready: Docker, FastAPI endpoint, experiment tracking, live URL.", dataset: { name: "Use your churn model or any existing model", url: "" }, steps: ["Refactor model into clean Python modules", "Track experiments with MLflow", "Wrap in FastAPI with input validation (Pydantic)", "Write unit tests for your prediction function", "Containerize with Docker", "Deploy to Railway or Render — get a live URL", "Add /health endpoint and basic logging"], skills: ["FastAPI", "Docker", "MLflow", "Testing", "Cloud Deployment"], portfolioWorthy: true },
  { id: "proj-capstone", phase: 4, type: "portfolio", difficulty: "Advanced", title: "Capstone: Domain-Specific DS Project", description: "Your magnum opus. Pick a domain you care about, find a real problem, build a complete solution.", dataset: { name: "Find your own — that's part of the exercise", url: "https://datasetsearch.research.google.com" }, steps: ["Identify a real unsolved problem in your chosen domain", "Find or collect relevant data", "Full EDA with domain-specific insights", "Feature engineering using domain knowledge", "Model selection, training, thorough evaluation", "Deploy with Streamlit or Gradio — keep it live", "Write a detailed Medium article", "Post on LinkedIn and tag relevant people"], skills: ["Everything — this is your proof of readiness"], portfolioWorthy: true },
];

// ─── ROADMAP DATA ─────────────────────────────────────────────────────────────
const DEFAULT_ROADMAP = [
  { phase: 1, title: "Foundations", duration: "Months 1–3", color: "#7eb8f7", sections: [
    { id: "python-core", title: "Python Core", weeks: "Week 1–2", why: "Python is the language of data science. Everything you build — models, pipelines, analyses — will be in Python. Get this wrong and every future step is harder.", warning: "Don't go deep into advanced Python features like decorators, async, or metaclasses. Know enough to write clean, readable code and move on.", goldAdvice: "Every day, open a real dataset from Kaggle and answer 5 questions using code you write yourself. Don't follow tutorials — ask your own questions.", resources: [{ name: "Automate the Boring Stuff with Python", type: "Book (free online)", url: "https://automatetheboringstuff.com" }, { name: "Python for Everybody — Coursera", type: "Course (free to audit)", url: "https://www.coursera.org/specializations/python" }], tasks: ["Variables, loops, functions", "List comprehensions & dictionaries", "Classes (basics only), file I/O, error handling", "Complete Automate the Boring Stuff Ch. 1–8"] },
    { id: "python-ds", title: "Python for Data Science", weeks: "Week 3–4", why: "NumPy and Pandas are what you'll use 40% of your actual job. Sloppy Pandas code is the #1 thing that exposes junior candidates.", warning: "Most people spend 3 days on NumPy and call it done. Spend a full week. Thinking in arrays instead of loops is the key insight.", goldAdvice: "After learning each Pandas method, immediately use it on a real dataset. Never practice on fake toy data.", resources: [{ name: "Pandas documentation", type: "Docs", url: "https://pandas.pydata.org/docs/" }, { name: "Kaggle Learn — Pandas", type: "Free mini-course", url: "https://www.kaggle.com/learn/pandas" }], tasks: ["NumPy: arrays, indexing, slicing, broadcasting", "NumPy: vectorized operations (arrays, not loops)", "Pandas: Series, DataFrames, groupby, merge, pivot tables", "Pandas: handling nulls, apply, method chaining", "Daily EDA on real Kaggle dataset — 5 self-asked questions"] },
    { id: "sql", title: "SQL", weeks: "Week 5–7", why: "SQL is tested before ML in almost every DS interview. People who fail DS interviews usually fail SQL first — not models.", warning: "Window functions are where most people give up. Don't. ROW_NUMBER, LAG, LEAD, SUM OVER come up in every hard SQL interview.", goldAdvice: "Solve 2 SQL problems every single morning before you do anything else. 45 days of this and you'll be dangerous.", resources: [{ name: "Mode Analytics SQL Tutorial", type: "Free tutorial", url: "https://mode.com/sql-tutorial/" }, { name: "StrataScratch", type: "DS-specific practice", url: "https://www.stratascratch.com" }], tasks: ["SELECT, WHERE, GROUP BY, ORDER BY, HAVING, DISTINCT", "CASE WHEN statements", "INNER, LEFT, RIGHT, FULL JOINs", "Subqueries & CTEs (WITH statements)", "Window functions: ROW_NUMBER, RANK, LAG, LEAD, SUM OVER", "2 StrataScratch problems every morning — timed"] },
    { id: "stats-prob", title: "Probability", weeks: "Week 5–9 (parallel)", why: "Probability is the mathematical language of uncertainty. Every ML model makes probabilistic predictions.", warning: "Most people memorize formulas. You need intuition. If you can't explain Bayes theorem with a real example without notes, you don't know it.", goldAdvice: "After each topic, write a 1-paragraph explanation as if talking to someone with no math background.", resources: [{ name: "StatQuest with Josh Starmer", type: "YouTube (free, exceptional)", url: "https://www.youtube.com/@statquest" }, { name: "Seeing Theory", type: "Free interactive visual", url: "https://seeing-theory.brown.edu" }], tasks: ["Events, conditional probability, independence", "Bayes theorem — explain with a real example, no notes", "Watch StatQuest probability series fully"] },
    { id: "stats-dist", title: "Distributions", weeks: "Week 6–9 (parallel)", why: "Distributions describe how data behaves in the real world. They tell you what model assumptions are valid.", warning: "Don't just learn the formulas. Learn when each distribution appears in real life with concrete examples.", goldAdvice: "The Central Limit Theorem is the foundation of almost all statistical inference. Learn it so well you can explain it three different ways.", resources: [{ name: "StatQuest distributions playlist", type: "YouTube (free)", url: "https://www.youtube.com/@statquest" }], tasks: ["Normal, Binomial, Poisson, Uniform distributions", "Central Limit Theorem — know it cold, explain 3 ways", "5 real-life examples for each distribution"] },
    { id: "stats-inf", title: "Statistical Inference", weeks: "Week 7–10 (parallel)", why: "A/B testing is 80% of what a DS does at a product company — and it's entirely statistical inference.", warning: "'The probability the null hypothesis is true' is WRONG for p-values and will cost you an offer.", goldAdvice: "Practice all statistics explanations spoken out loud, not written. Record yourself. The interview is verbal.", resources: [{ name: "StatQuest hypothesis testing", type: "YouTube (free)", url: "https://www.youtube.com/@statquest" }], tasks: ["Hypothesis testing — explain to a PM out loud without notes", "p-value — correct definition, out loud, without notes", "Confidence intervals — what they actually mean", "Type I and Type II errors with real examples", "Practical vs statistical significance", "A/B testing end-to-end: design, run, interpret"] },
    { id: "linalg", title: "Linear Algebra", weeks: "Week 10–11 (parallel)", why: "Linear algebra is the math behind PCA, neural networks, and recommendation systems.", warning: "Don't start with a textbook. Watch 3Blue1Brown's visual series first.", goldAdvice: "Focus on intuition: a matrix is a transformation of space. Dot products measure similarity. If you can picture these, the math follows.", resources: [{ name: "3Blue1Brown — Essence of Linear Algebra", type: "YouTube (free, irreplaceable)", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" }], tasks: ["Vectors, matrices, matrix multiplication — visual intuition", "Dot product — what it measures", "Eigenvalues and eigenvectors at conceptual level", "Watch all of 3Blue1Brown Essence of Linear Algebra"] },
  ]},
  { phase: 2, title: "Core ML", duration: "Months 3–7", color: "#6dd6a0", sections: [
    { id: "ml-framework", title: "The ML Framework", weeks: "Week 1–2", why: "These concepts apply to every single algorithm. If you understand bias-variance deeply, you can debug any model problem.", warning: "Most skipped, most costly to skip. Most bootcamp grads jump straight to algorithms. Two weeks here saves months of confusion.", goldAdvice: "For every model you build: is this overfitting? How do I know? What would I do if it were? If you can't answer instantly, come back here.", resources: [{ name: "Hands-On ML — Aurélien Géron", type: "Book (the bible)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/" }, { name: "Andrew Ng ML Specialization", type: "Course (free to audit)", url: "https://www.coursera.org/specializations/machine-learning-introduction" }], tasks: ["Train / validation / test split — why each exists", "Overfitting vs underfitting — diagnose from learning curves", "Bias-variance tradeoff — explain intuitively", "Cross-validation: k-fold, stratified k-fold", "Regularization L1 and L2 — intuition"] },
    { id: "ml-regression", title: "Supervised — Regression", weeks: "Week 3–4", why: "Linear regression is the foundation. If you truly understand it including the math, every other algorithm becomes easier.", warning: "Most people learn regression in sklearn without touching the math. Understand what coefficients mean and when the model breaks.", goldAdvice: "For each metric, ask: what business question does this answer? RMSE penalizes large errors more than MAE — when does that matter?", resources: [{ name: "StatQuest regression playlist", type: "YouTube (free)", url: "https://www.youtube.com/@statquest" }], tasks: ["Linear regression with math — understand what OLS does", "Ridge (L2) and Lasso (L1) regression", "Polynomial regression — when to use, overfitting risk", "Metrics: MAE, MSE, RMSE, R² — when to prefer each"] },
    { id: "ml-class", title: "Supervised — Classification", weeks: "Week 5–6", why: "Classification is the most common ML task. Churn, fraud, spam, disease — all classification. XGBoost is what industry actually uses.", warning: "Accuracy is a trap in imbalanced datasets. Know when to use recall vs precision with a real example.", goldAdvice: "For every algorithm: how does it work, assumptions, when does it fail, how do you tune it. Answer all four without looking anything up.", resources: [{ name: "XGBoost docs", type: "Docs", url: "https://xgboost.readthedocs.io" }, { name: "StatQuest Random Forest & XGBoost", type: "YouTube", url: "https://www.youtube.com/@statquest" }], tasks: ["Logistic regression — understand log-odds, not just sigmoid", "Decision Trees — splitting criteria, depth, pruning", "Random Forests — why bagging reduces variance", "XGBoost — spend extra time here", "Metrics: precision, recall, F1, ROC-AUC", "Class imbalance: SMOTE, class weights, threshold tuning", "Know when recall > precision — give a real example"] },
    { id: "ml-unsupervised", title: "Unsupervised Learning", weeks: "Week 7", why: "Clustering and dimensionality reduction are everywhere: customer segmentation, anomaly detection, feature reduction.", warning: "Understand PCA geometrically. 'It reduces dimensions' is not enough.", goldAdvice: "Apply PCA to a real dataset and visualize the explained variance plot. Then explain why the first component captures the most variance.", resources: [{ name: "StatQuest PCA", type: "YouTube (free)", url: "https://www.youtube.com/@statquest" }], tasks: ["KMeans — algorithm, choosing k (elbow, silhouette)", "Hierarchical clustering — dendrograms", "PCA — geometric understanding", "Explained variance ratio — how to choose n components"] },
    { id: "ml-pipeline", title: "Full ML Pipeline", weeks: "Week 8", why: "This week is where you find out what you actually understand vs what you just watched someone else do.", warning: "Do this from scratch, no tutorial, real dataset. Notebooks with cells run out of order don't count.", goldAdvice: "Spend as much time on interpretation as on training. What features matter? What would the business do with this?", resources: [{ name: "Kaggle datasets", type: "Free real datasets", url: "https://www.kaggle.com/datasets" }], tasks: ["Raw data → cleaning → EDA → feature engineering", "Model selection → tuning → evaluation", "Feature importance and SHAP values", "Build from scratch alone, real dataset", "Write up findings as if presenting to a stakeholder"] },
    { id: "feature-eng", title: "Feature Engineering", weeks: "Week 9–10", why: "Good feature engineering beats fancy algorithms. Kaggle winners win because of better features, not better models.", warning: "Target encoding trap: data leakage. Apply it wrong and you'll get great validation scores and terrible production results.", goldAdvice: "Read winning solution writeups of past Kaggle tabular competitions. Worth more than any course.", resources: [{ name: "Kaggle competition forums", type: "Free (winning solutions)", url: "https://www.kaggle.com/competitions" }], tasks: ["Missing data: impute vs drop", "Label vs one-hot vs target encoding + their traps", "Interaction features and polynomial features", "Binning and log transforms", "Datetime features: hour, day of week, time since event", "Read 3 Kaggle winning solution writeups"] },
  ]},
  { phase: 3, title: "Modern Skills", duration: "Months 7–12", color: "#f7c96e", sections: [
    { id: "dl-nn", title: "Neural Networks", weeks: "Week 1–2", why: "Deep learning is in 20%+ of DS job postings and growing. You need to understand, apply, and discuss it confidently.", warning: "Don't touch PyTorch yet. Build a NN from scratch in NumPy first. Everyone who skips this regrets it.", goldAdvice: "The learning rate is the most important hyperparameter. Plot loss curves when it's too high vs too low.", resources: [{ name: "Andrej Karpathy — Neural Networks: Zero to Hero", type: "YouTube (exceptional)", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" }, { name: "fast.ai", type: "Free course", url: "https://course.fast.ai" }], tasks: ["Backpropagation — understand chain rule intuitively", "Activation functions: ReLU, sigmoid, tanh", "Batch size, learning rate, epochs", "Dropout and batch normalization", "Build NN from scratch in NumPy", "Rebuild it in PyTorch"] },
    { id: "dl-cnn", title: "CNNs & Transfer Learning", weeks: "Week 3–4", why: "Transfer learning is how 90% of real computer vision work is done.", warning: "Don't get lost in architecture details. Focus on the concept of transfer learning.", goldAdvice: "Pick a domain and fine-tune on a real dataset from that domain. Domain-specific projects stand out.", resources: [{ name: "fast.ai Part 1", type: "Free course", url: "https://course.fast.ai" }, { name: "PyTorch Transfer Learning tutorial", type: "Docs", url: "https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html" }], tasks: ["Convolutional layers and pooling", "How CNNs see images intuitively", "Transfer learning — why pretrained weights help", "Fine-tune ResNet or EfficientNet on custom data", "Data augmentation"] },
    { id: "dl-nlp", title: "NLP & Transformers", weeks: "Week 5–6", why: "NLP is the hottest sub-field. Companies are integrating text understanding into every product.", warning: "You don't need to build a transformer from scratch. Fine-tune one and explain attention conceptually.", goldAdvice: "Pick NLP or Vision and go deeper in one. NLP is the higher-value choice right now.", resources: [{ name: "Hugging Face NLP course", type: "Free", url: "https://huggingface.co/learn/nlp-course" }, { name: "Andrej Karpathy — Let's build GPT", type: "YouTube", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY" }], tasks: ["Text preprocessing, tokenization, embeddings", "Attention mechanism — conceptual understanding", "BERT and variants", "Hugging Face: load and fine-tune a model", "NLP metrics: F1, BLEU, perplexity"] },
    { id: "llm", title: "LLMs & Generative AI", weeks: "Week 7–9", why: "No longer optional. Companies are integrating LLMs into every data product. RAG is the most used pattern right now.", warning: "Don't just play with ChatGPT. Build something with LLM APIs. 'I built X with RAG' vs 'I've used LLMs' is enormous.", goldAdvice: "Build one project using an LLM API + real data. This alone impresses most interviewers in 2025-2026.", resources: [{ name: "LangChain docs", type: "Docs", url: "https://docs.langchain.com" }, { name: "OpenAI API docs", type: "Docs", url: "https://platform.openai.com/docs" }], tasks: ["How LLMs work: transformers, attention, tokenization", "Prompt engineering — system prompts, few-shot, chain of thought", "RAG — the key pattern", "Fine-tuning vs RAG", "LangChain or LlamaIndex basics", "Build one project: LLM API + real data, keep it live"] },
    { id: "mlops", title: "MLOps", weeks: "Week 10–12", why: "Most candidates can train a model. Almost none can deploy one. This is your single biggest competitive edge.", warning: "Most DS candidates are bad at Git. Fix this first — it signals professionalism before anyone sees your code.", goldAdvice: "'I built this, you can use it right now at this URL' in an interview is a conversation-changer.", resources: [{ name: "FastAPI docs", type: "Docs", url: "https://fastapi.tiangolo.com" }, { name: "Docker getting started", type: "Docs", url: "https://docs.docker.com/get-started/" }, { name: "MLflow", type: "Free, open source", url: "https://mlflow.org" }], tasks: ["Git: branching, PRs, meaningful commit messages", "Docker: containerize your model", "FastAPI: serve model as live API", "MLflow or W&B: experiment tracking", "Deploy to cloud — live public URL", "Understand concept drift and data drift"] },
    { id: "dataviz", title: "Viz & Storytelling", weeks: "Ongoing (parallel)", why: "Being right means nothing if you can't communicate it. A DS who tells stories with data is 10x more influential.", warning: "Don't confuse pretty charts with storytelling. Storytelling: here's the problem, here's the data, here's what we should do.", goldAdvice: "After every project, make a 5-slide summary as if presenting to a VP who only cares about business outcomes.", resources: [{ name: "Storytelling with Data — Cole Nussbaumer Knaflic", type: "Book", url: "https://www.storytellingwithdata.com/book" }, { name: "Tableau Public", type: "Free", url: "https://public.tableau.com" }], tasks: ["Matplotlib & Seaborn for EDA", "Plotly for interactive charts", "Tableau or Power BI — learn one", "Read Storytelling with Data (full book)", "5-slide business summary for every project"] },
  ]},
  { phase: 4, title: "Portfolio & Jobs", duration: "Months 12–18", color: "#c792ea", sections: [
    { id: "portfolio", title: "Portfolio Projects", weeks: "Month 12–15", why: "Three exceptional projects beat ten mediocre ones. Every project needs a real business problem, deployed demo, and write-up.", warning: "'I trained a model on Titanic' is not a project. 'I built a churn predictor that could save $2M/year' is a project.", goldAdvice: "Write a Medium article per project. Most candidates have GitHub repos with no README. Be different — be findable.", resources: [{ name: "Kaggle Datasets", type: "Free", url: "https://www.kaggle.com/datasets" }, { name: "Medium", type: "Write articles here", url: "https://medium.com" }], tasks: ["Churn prediction with dollar-value business framing", "Full A/B test analysis beyond p-value", "NLP project on a real domain dataset", "Recommendation system deployed as API", "LLM-powered tool — keep it live", "Each project: clean README, write-up, deployed demo", "Write a Medium/LinkedIn article per project"] },
    { id: "int-sql", title: "Interview Prep — SQL", weeks: "Month 13–16", why: "SQL is the first filter in almost every DS interview. Be fast, accurate, fluent.", warning: "Practicing with autocomplete is not the same as interview SQL. Practice from memory, timed.", goldAdvice: "StrataScratch has questions from real companies. 50 medium/hard problems minimum. After 50, interviews feel slow.", resources: [{ name: "StrataScratch", type: "DS-specific SQL practice", url: "https://www.stratascratch.com" }], tasks: ["50 StrataScratch problems — medium and hard", "Time yourself — 15 minutes max per problem", "Practice without autocomplete", "Review every wrong answer"] },
    { id: "int-stats", title: "Interview Prep — Statistics", weeks: "Month 13–16", why: "Statistics is the second major filter in DS interviews.", warning: "Most common mistake: getting p-values wrong. Practice the correct definition until automatic.", goldAdvice: "Practice ALL statistics explanations spoken out loud. Record yourself. Sounding fluent matters as much as being correct.", resources: [{ name: "Ace the Data Science Interview", type: "Book — use as workbook", url: "https://www.acethedatascienceinterview.com" }], tasks: ["p-value: correct definition out loud without notes", "Design an A/B test for a product out loud", "Correlation vs causation with real example", "Confidence interval: what it actually means", "Statistical power and sample size"] },
    { id: "int-ml", title: "Interview Prep — ML Theory", weeks: "Month 13–16", why: "ML theory tests whether you understand your tools or just use them.", warning: "Don't memorize answers. Understand so you can handle unexpected follow-ups.", goldAdvice: "For every algorithm: 2-minute verbal explanation — how it works, assumptions, failure modes, tuning.", resources: [{ name: "Ace the Data Science Interview", type: "Book", url: "https://www.acethedatascienceinterview.com" }], tasks: ["Explain gradient boosting from scratch — 2 min verbal", "How does random forest reduce variance? Why not bias?", "Class imbalance: 3 ways to handle it", "Regularization: L1 vs L2 intuitively", "Handle a feature with 60% missing", "Explain the curse of dimensionality"] },
    { id: "int-case", title: "Interview Prep — Case Studies", weeks: "Month 14–17", why: "Case studies test whether you think like a DS. Spend 30% of time clarifying the problem first.", warning: "Most candidates jump to the model immediately. The best candidates ask 'what does success look like?' first.", goldAdvice: "Framework: clarify → data → metric → model → limitations. Practice until automatic.", resources: [{ name: "Pramp", type: "Free mock interviews", url: "https://www.pramp.com" }], tasks: ["Master the framework: clarify → data → metric → model → limits", "Design a recommendation system out loud", "Design a fraud detection pipeline out loud", "Design a churn system out loud", "Do mock interviews on Pramp or with a friend"] },
    { id: "networking", title: "Networking", weeks: "Start Month 1 — never stop", why: "Most jobs at good companies are found through referrals. One warm referral is worth 50 cold applications.", warning: "Don't send cold 'can you refer me?' messages. Build relationships before asking for anything.", goldAdvice: "Pick a domain you care about. Domain expertise is the shortcut most generalists ignore.", resources: [{ name: "DataTalks.Club", type: "Free community & events", url: "https://datatalks.club" }, { name: "PyData", type: "Free events", url: "https://pydata.org" }], tasks: ["Post on LinkedIn weekly — insights, not 'finished a course'", "Comment thoughtfully on senior DS posts", "Attend PyData or DataTalks.Club events", "Pick a domain and go deep in it", "Send 1 specific question to 1 relevant person per week", "Start applying Month 9 — first 10 apps are practice"] },
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
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAEuLDpruLyfYB1sm9lifPVgP4os6JIvS8`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newUser.email.trim(), password: newUser.password, returnSecureToken: true }) }
      );
      const data = await res.json();
      if (data.error && data.error.message !== "EMAIL_EXISTS") {
        setUserErr("Error: " + data.error.message); return;
      }
      // If email exists in Auth, find their UID via sign-in
      let uid = data.localId;
      if (!uid) {
        const signInRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAEuLDpruLyfYB1sm9lifPVgP4os6JIvS8`,
          { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newUser.email.trim(), password: newUser.password, returnSecureToken: true }) }
        );
        const signInData = await signInRes.json();
        if (signInData.error) { setUserErr("Email already exists with a different password. Use a different email."); return; }
        uid = signInData.localId;
      }
      await setDoc(doc(db, "users", uid), {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        role: "student",
        progress: {},
        joinedAt: new Date().toISOString(),
      });
      setNewUser({ username: "", email: "", password: "" });
      setUserOk("✅ Student added successfully!");
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
    { id: "projects",   label: "🚀 Projects" },
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
                      <div>
                        {(section.why || section.warning) && (
                          <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {section.why && (
                              <div style={{ background: T.bgDeep, border: `1px solid ${C}22`, borderRadius: 8, padding: "10px 12px" }}>
                                <div style={{ fontSize: 8, color: C, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>WHY THIS MATTERS</div>
                                <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.7 }}>{section.why}</div>
                              </div>
                            )}
                            {section.warning && (
                              <div style={{ background: T.bgDeep, border: `1px solid ${T.warn}22`, borderRadius: 8, padding: "10px 12px" }}>
                                <div style={{ fontSize: 8, color: T.warn, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>⚠ COMMON MISTAKE</div>
                                <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.7 }}>{section.warning}</div>
                              </div>
                            )}
                          </div>
                        )}
                        {section.goldAdvice && (
                          <div style={{ margin: "0 16px 12px", background: T.gold + "0d", border: `1px solid ${T.gold}33`, borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 8, color: T.gold, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>★ GOLD ADVICE</div>
                            <div style={{ fontSize: 11, color: "#cfc9a0", lineHeight: 1.7 }}>{section.goldAdvice}</div>
                          </div>
                        )}
                        {section.resources && section.resources.length > 0 && (
                          <div style={{ margin: "0 16px 12px" }}>
                            <div style={{ fontSize: 8, color: T.textFade, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 8 }}>RESOURCES</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {section.resources.map((r, i) => (
                                <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ background: T.bgDeep, border: `1px solid ${T.borderHi}`, borderRadius: 7, padding: "6px 11px", textDecoration: "none" }}>
                                  <div style={{ fontSize: 11, color: C, marginBottom: 2 }}>{r.name}</div>
                                  <div style={{ fontSize: 9, color: T.textFade }}>{r.type}</div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <div style={{ borderTop: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 8, color: T.textFade, letterSpacing: "0.15em", padding: "10px 16px 4px" }}>TASKS — CLICK TO COMPLETE</div>
                          <div style={{ paddingBottom: 6 }}>
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
                        </div>
                        {sectionProjects[section.id] && sectionProjects[section.id].length > 0 && (
                          <div>
                            <div style={{ borderTop: `1px solid ${T.border}` }} />
                            <div style={{ fontSize: 8, color: T.info, letterSpacing: "0.15em", padding: "10px 16px 8px" }}>HANDS-ON EXERCISES</div>
                            <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                              {sectionProjects[section.id].map((mp, i) => (
                                <div key={i} style={{ background: T.bgDeep, border: `1px solid ${typeColors[mp.type]}22`, borderRadius: 8, padding: "11px 13px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 9, color: typeColors[mp.type], background: typeColors[mp.type] + "18", padding: "2px 7px", borderRadius: 3 }}>{typeLabels[mp.type]}</span>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{mp.title}</span>
                                    </div>
                                    {mp.url && <a href={mp.url} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: T.info, textDecoration: "none", flexShrink: 0 }}>dataset →</a>}
                                  </div>
                                  <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>{mp.desc}</div>
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

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>All Projects & Challenges</div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 20 }}>Build these to prove your skills — not just complete courses.</div>
            {[1,2,3,4].map(phaseNum => {
              const phProjects = portfolioProjects.filter(p => p.phase === phaseNum);
              if (phProjects.length === 0) return null;
              const phColor = phaseColors[phaseNum - 1];
              const phaseNames = ["Foundations", "Core ML", "Modern Skills", "Portfolio & Jobs"];
              return (
                <div key={phaseNum} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: phColor }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: phColor }}>Phase {phaseNum} — {phaseNames[phaseNum-1]}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {phProjects.map(proj => {
                const phColor = phaseColors[proj.phase - 1];
                return (
                  <div key={proj.id} style={{ background: T.bgCard, border: `1px solid ${proj.portfolioWorthy ? phColor + "55" : T.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9, color: typeColors[proj.type], background: typeColors[proj.type] + "15", padding: "2px 7px", borderRadius: 3 }}>{typeLabels[proj.type]}</span>
                          <span style={{ fontSize: 9, color: proj.difficulty === "Advanced" ? T.warn : proj.difficulty === "Intermediate" ? T.gold : T.info, background: (proj.difficulty === "Advanced" ? T.warn : proj.difficulty === "Intermediate" ? T.gold : T.info) + "15", padding: "2px 7px", borderRadius: 3 }}>{proj.difficulty}</span>
                          {proj.portfolioWorthy && <span style={{ fontSize: 9, color: T.gold, background: T.gold + "15", padding: "2px 7px", borderRadius: 3 }}>⭐ Must-Build</span>}
                        </div>
                        <span style={{ fontSize: 9, color: phColor, background: phColor + "15", padding: "2px 7px", borderRadius: 3, flexShrink: 0 }}>Phase {proj.phase}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{proj.title}</div>
                      <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.65 }}>{proj.description}</div>
                      {proj.dataset?.url && <a href={proj.dataset.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 10, color: T.info, textDecoration: "none" }}>📊 {proj.dataset.name} →</a>}
                    </div>
                    <div style={{ padding: "12px 16px", flex: 1 }}>
                      <div style={{ fontSize: 8, color: T.textFade, letterSpacing: "0.15em", marginBottom: 10 }}>STEPS</div>
                      {proj.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                          <span style={{ fontSize: 9, color: phColor, background: phColor + "18", borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }}>{i+1}</span>
                          <span style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "10px 16px 14px", borderTop: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {proj.skills.map((sk, i) => <span key={i} style={{ fontSize: 9, color: T.textFade, background: T.bgDeep, border: `1px solid ${T.border}`, padding: "2px 7px", borderRadius: 3 }}>{sk}</span>)}
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