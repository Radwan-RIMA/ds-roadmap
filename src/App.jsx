import React, { useState, useEffect } from "react";

const STORAGE_KEY = "ds-roadmap-v5-local";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:       "#13111a",
  bgCard:   "#1c1927",
  bgDeep:   "#161320",
  border:   "#2a2540",
  borderHi: "#3d3660",
  text:     "#e2dff0",
  textDim:  "#8b87a8",
  textFade: "#4a4665",
  // Phase accent colors — warm, easy on eyes
  p1: "#7eb8f7",   // soft blue
  p2: "#6dd6a0",   // mint green
  p3: "#f7c96e",   // warm gold
  p4: "#c792ea",   // lavender
  // UI colors
  gold:    "#f7c96e",
  warn:    "#f28b82",
  good:    "#6dd6a0",
  info:    "#7eb8f7",
};

const phaseColors = ["#7eb8f7", "#6dd6a0", "#f7c96e", "#c792ea"];

const quotes = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Data is the new oil. But like oil, it needs to be refined.", author: "Clive Humby" },
  { text: "The more I practice, the luckier I get.", author: "Gary Player" },
  { text: "Every master was once a disaster.", author: "T. Harv Eker" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
];

const milestones = [
  { pct: 5,  msg: "You started. Most people never do. That already puts you ahead." },
  { pct: 10, msg: "10% in. The foundation is being built — brick by brick." },
  { pct: 20, msg: "Phase 1 is within reach. SQL and Python are becoming second nature." },
  { pct: 25, msg: "A quarter done. You now know more than most people who call themselves 'curious about data science'." },
  { pct: 33, msg: "One third complete. The fundamentals are solid. The real journey begins now." },
  { pct: 50, msg: "Halfway there. This is where most people quit. You didn't. Remember that." },
  { pct: 60, msg: "60% done. You're deep into ML now. This is the hard part — and you're doing it." },
  { pct: 75, msg: "Three quarters done. You can build, deploy, and explain models. That's rare." },
  { pct: 90, msg: "Almost there. The job is closer than it's ever been. Don't stop now." },
  { pct: 100, msg: "You did it. Every task, every project, every late night. You're ready. Go get that job." },
];

// ─── DATA ────────────────────────────────────────────────────────────────────

const portfolioProjects = [
  { id: "proj-eda", phase: 1, type: "dataset", difficulty: "Beginner", title: "Deep EDA on Real Data", description: "Pick the Titanic or Airbnb NYC dataset. Write a full exploratory analysis answering 10 self-generated questions. No tutorials — your own questions, your own answers.", dataset: { name: "Titanic Dataset", url: "https://www.kaggle.com/c/titanic/data" }, steps: ["Load dataset, inspect shape, dtypes, nulls", "Generate 10 questions you're genuinely curious about", "Answer each with a chart and 2-sentence interpretation", "Write a 3-paragraph summary of findings", "Publish on Kaggle with a clean README"], skills: ["Pandas", "Matplotlib", "Seaborn", "Storytelling"], portfolioWorthy: false },
  { id: "proj-sql", phase: 1, type: "dataset", difficulty: "Beginner", title: "SQL Business Analysis", description: "Use the Chinook database to answer 8 business questions using only SQL. Present findings as if reporting to a manager.", dataset: { name: "Chinook Database", url: "https://github.com/lerocha/chinook-database" }, steps: ["Set up SQLite with Chinook database", "Answer: top 5 customers by revenue, monthly sales trend, best-selling categories", "Write a window function query: rank employees by sales per month", "Write a CTE: find customers who haven't bought in 6 months", "Write a 1-page summary of your 3 most interesting findings"], skills: ["SQL", "CTEs", "Window Functions", "Business Thinking"], portfolioWorthy: false },
  { id: "proj-churn", phase: 2, type: "portfolio", difficulty: "Intermediate", title: "Customer Churn Predictor", description: "Build a full end-to-end churn prediction system with business framing. Estimate how much money the company could save by acting on your predictions.", dataset: { name: "Telco Customer Churn", url: "https://www.kaggle.com/datasets/blastchar/telco-customer-churn" }, steps: ["EDA: understand churn rate and correlated features", "Feature engineering: create at least 3 new features", "Train Logistic Regression, Random Forest, XGBoost", "Tune best model, optimize for recall", "Use SHAP to explain which features drive churn", "Calculate business impact: estimated savings from acting on predictions", "Write a 5-slide business summary", "Push to GitHub with clean README + Medium article"], skills: ["Pandas", "sklearn", "XGBoost", "SHAP", "Business Framing"], portfolioWorthy: true },
  { id: "proj-abtest", phase: 2, type: "dataset", difficulty: "Intermediate", title: "A/B Test Full Analysis", description: "Analyze a real A/B test end-to-end. Go beyond the p-value — discuss sample size, power, practical significance, and give a real business recommendation.", dataset: { name: "A/B Test Dataset", url: "https://www.kaggle.com/datasets/zhangluyuan/ab-testing" }, steps: ["Calculate conversion rates for control vs treatment", "Check sample size — was the test adequately powered?", "Run the hypothesis test and compute p-value correctly", "Calculate the confidence interval for the difference", "Discuss practical significance: is the effect size worth the cost?", "Write a 1-page recommendation memo to a product manager"], skills: ["Statistics", "Hypothesis Testing", "Python", "Business Communication"], portfolioWorthy: false },
  { id: "proj-pipeline", phase: 2, type: "coding", difficulty: "Intermediate", title: "ML Pipeline from Scratch", description: "Build a complete, reproducible sklearn Pipeline — no ad-hoc notebooks. Clean, importable Python code with preprocessing, training, and evaluation.", dataset: { name: "House Prices Dataset", url: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques" }, steps: ["Write a data loading module (real function, not inline code)", "Build a sklearn ColumnTransformer for numerical and categorical features", "Wrap everything in a Pipeline: preprocessor + model", "Use GridSearchCV for tuning", "Evaluate with cross-validation, plot learning curves", "Save the pipeline with joblib", "Write a predict.py script: load pipeline, take raw input, return prediction"], skills: ["sklearn Pipelines", "Feature Engineering", "Clean Code", "joblib"], portfolioWorthy: false },
  { id: "proj-nn", phase: 3, type: "coding", difficulty: "Intermediate", title: "Neural Network from Scratch (NumPy)", description: "Build a 2-layer neural network using only NumPy. Implement forward pass, backpropagation, and gradient descent manually.", dataset: { name: "MNIST digits (via sklearn)", url: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html" }, steps: ["Initialize weights and biases randomly", "Implement forward pass: linear + ReLU + softmax", "Implement cross-entropy loss", "Implement backpropagation manually — derive gradients on paper first", "Implement gradient descent update", "Train on MNIST, reach >90% accuracy", "Plot loss curve over epochs", "Comment every function with the math"], skills: ["NumPy", "Backpropagation", "Linear Algebra", "Deep Learning Math"], portfolioWorthy: false },
  { id: "proj-bert", phase: 3, type: "portfolio", difficulty: "Intermediate", title: "NLP Sentiment Classifier — Fine-tuned BERT", description: "Fine-tune a pretrained BERT model on real domain-specific text. Deploy it as a simple API and keep it live.", dataset: { name: "IMDb Movie Reviews", url: "https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" }, steps: ["Load and preprocess dataset using Hugging Face tokenizer", "Fine-tune DistilBERT using Hugging Face Trainer API", "Evaluate: accuracy, F1, confusion matrix", "Compare fine-tuned vs zero-shot baseline", "Wrap model in FastAPI: POST /predict → sentiment + confidence", "Deploy to Hugging Face Spaces — keep it live", "Write README explaining model, training, and API usage"], skills: ["Hugging Face", "BERT", "FastAPI", "NLP", "Deployment"], portfolioWorthy: true },
  { id: "proj-rag", phase: 3, type: "portfolio", difficulty: "Advanced", title: "RAG-Powered Document Q&A System", description: "Build a system that lets users ask questions about documents using RAG. The most in-demand LLM pattern in 2025-2026.", dataset: { name: "Any PDF corpus (research papers, reports)", url: "https://arxiv.org" }, steps: ["Load and chunk documents", "Embed chunks using an embedding model", "Store in a vector database (FAISS or ChromaDB)", "On query: embed question, retrieve top-k chunks", "Pass context + question to LLM for grounded answer", "Add a Streamlit or Gradio UI", "Deploy to Hugging Face Spaces — keep it live", "Write a blog post explaining how RAG works using your project"], skills: ["LangChain", "Vector Databases", "Embeddings", "LLMs", "Streamlit"], portfolioWorthy: true },
  { id: "proj-mlops", phase: 3, type: "portfolio", difficulty: "Advanced", title: "End-to-End Deployed ML System", description: "Make any model production-ready: Docker, FastAPI endpoint, experiment tracking, live URL. This separates you from 90% of candidates.", dataset: { name: "Use your churn model or any existing model", url: "" }, steps: ["Refactor model into clean Python modules", "Track experiments with MLflow", "Wrap in FastAPI with input validation (Pydantic)", "Write unit tests for your prediction function", "Containerize with Docker", "Deploy to Railway or Render — get a live URL", "Add /health endpoint and basic logging", "Document the API with FastAPI's auto-generated docs"], skills: ["FastAPI", "Docker", "MLflow", "Testing", "Cloud Deployment"], portfolioWorthy: true },
  { id: "proj-capstone", phase: 4, type: "portfolio", difficulty: "Advanced", title: "Capstone: Domain-Specific DS Project", description: "Your magnum opus. Pick a domain you care about, find a real problem, build a complete solution, deploy it, write a detailed article. This is what you lead with in interviews.", dataset: { name: "Find your own — that's part of the exercise", url: "https://datasetsearch.research.google.com" }, steps: ["Identify a real unsolved problem in your chosen domain", "Find or collect relevant data", "Full EDA with domain-specific insights", "Feature engineering using domain knowledge", "Model selection, training, thorough evaluation", "SHAP or LIME explanations", "Deploy with Streamlit or Gradio — keep it live", "Calculate and articulate the real-world business impact", "Write a detailed Medium article", "Post on LinkedIn and tag relevant people in your domain"], skills: ["Everything — this is your proof of readiness"], portfolioWorthy: true },
];

const sectionProjects = {
  "python-core": [{ type: "coding", title: "Data Cleaner Script", desc: "Write a Python script that takes a messy CSV, cleans it (handle nulls, fix types, remove duplicates), and outputs a clean version. No pandas yet — base Python only." }, { type: "coding", title: "File Organizer", desc: "Build a script that reads a folder and sorts files into subfolders by extension, date, or size. Practice loops, functions, file I/O, and error handling." }],
  "python-ds": [{ type: "dataset", title: "Pandas 30-Question Challenge", desc: "Load the NYC Airbnb dataset. Answer 30 progressively harder questions using only Pandas. Work up to month-over-month price change by neighborhood.", url: "https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data" }, { type: "coding", title: "NumPy Matrix Operations", desc: "Implement matrix multiplication, dot product, and cosine similarity from scratch using NumPy. Verify results match sklearn's output." }],
  "sql": [{ type: "dataset", title: "Business KPI Dashboard in SQL", desc: "Using Chinook, write 10 SQL queries answering real business questions. Use CTEs and window functions.", url: "https://github.com/lerocha/chinook-database" }, { type: "coding", title: "SQL Murder Mystery", desc: "Solve a detective story entirely using SQL queries. Great for practicing joins, subqueries, and thinking in sets.", url: "https://mystery.knightlab.com" }],
  "stats-prob": [{ type: "coding", title: "Bayes Spam Filter", desc: "Build a Naive Bayes spam classifier using only Python and probability math. No sklearn. Calculate prior probabilities and likelihoods manually." }, { type: "coding", title: "Monte Carlo Simulations", desc: "Use random simulation to estimate π value, birthday paradox probability, and expected value of a dice game." }],
  "stats-dist": [{ type: "coding", title: "Distribution Fitting", desc: "Take 3 real datasets (wait times, stock returns, word frequencies). Plot histogram, identify best-fit distribution, fit with scipy, verify with Q-Q plot." }, { type: "coding", title: "CLT Visualizer", desc: "Demonstrate the CLT: sample from non-normal distributions in increasing sample sizes and plot how the sampling distribution becomes normal." }],
  "stats-inf": [{ type: "dataset", title: "A/B Test from Scratch", desc: "Calculate test statistic, p-value, and confidence interval using only numpy — no scipy. Then verify with scipy.", url: "https://www.kaggle.com/datasets/zhangluyuan/ab-testing" }, { type: "coding", title: "Stats Verbal Drill", desc: "Record yourself explaining p-values, confidence intervals, and Type I/II errors to an imaginary PM. Listen back. Re-record until fluent." }],
  "linalg": [{ type: "coding", title: "PCA from Scratch", desc: "Implement PCA using NumPy: center data, compute covariance matrix, find eigenvectors, project data. Verify matches sklearn." }, { type: "coding", title: "Recommender with Dot Products", desc: "Build a simple item-based recommender using dot product similarity on movie ratings data." }],
  "ml-framework": [{ type: "coding", title: "Overfit Then Fix", desc: "Deliberately overfit a decision tree. Then apply regularization, cross-validation, early stopping. Document what changed each step." }, { type: "coding", title: "Learning Curve Analysis", desc: "Plot learning curves (train vs validation error vs training set size). Write a paragraph diagnosing: high bias, high variance, or neither?" }],
  "ml-regression": [{ type: "coding", title: "Linear Regression from Scratch", desc: "Implement OLS and gradient descent, compare both against sklearn. Use the House Prices dataset.", url: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques" }, { type: "dataset", title: "Price Predictor with Feature Engineering", desc: "Engineer 5+ new features, apply Lasso for feature selection, beat baseline R² by 5+ points." }],
  "ml-classification": [{ type: "dataset", title: "Fraud Detection Challenge", desc: "Build a fraud detection model. Handle 99.8% class imbalance. Optimize for recall. Calculate fraud caught at different thresholds.", url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud" }, { type: "coding", title: "XGBoost Tuning Exercise", desc: "Train baseline XGBoost. Systematically tune n_estimators, max_depth, learning_rate, subsample. Document each parameter's effect." }],
  "ml-unsupervised": [{ type: "dataset", title: "Customer Segmentation", desc: "Use KMeans on e-commerce data. Interpret each cluster in business terms. Name each segment and recommend a strategy.", url: "https://www.kaggle.com/datasets/carrie1/ecommerce-data" }, { type: "coding", title: "Dimensionality Reduction Comparison", desc: "Apply PCA, t-SNE, and UMAP to the same dataset. Compare what each preserves and distorts." }],
  "ml-pipeline": [{ type: "coding", title: "Reproducible Pipeline", desc: "Refactor a messy notebook into clean Python: separate modules for data loading, preprocessing, training, evaluation. One command to run all." }],
  "feature-eng": [{ type: "dataset", title: "Kaggle Feature Engineering Sprint", desc: "Enter a Kaggle tabular competition. Spend 3 days ONLY on feature engineering — no model tuning. See how much features alone move your rank.", url: "https://www.kaggle.com/competitions" }],
  "dl-nn": [{ type: "coding", title: "Neural Net from Scratch", desc: "2-layer NN in NumPy only. Forward pass, backprop, gradient descent. Train on MNIST, reach >90% accuracy. Comment every line of backprop math." }, { type: "coding", title: "PyTorch MNIST Classifier", desc: "Re-implement in PyTorch. Add batch normalization and dropout and measure the improvement." }],
  "dl-cnn": [{ type: "dataset", title: "Transfer Learning Fine-tune", desc: "Fine-tune pretrained ResNet18 on a dataset of your choice. Achieve >85% accuracy. Visualize first layer filters.", url: "https://www.kaggle.com/datasets" }],
  "dl-nlp": [{ type: "dataset", title: "Fine-tune BERT", desc: "Fine-tune DistilBERT on text classification. Compare vs TF-IDF + Logistic Regression baseline.", url: "https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" }],
  "llm": [{ type: "coding", title: "Build a RAG System", desc: "Document Q&A: load PDFs, chunk, embed, store in FAISS, retrieve on query, generate answers with LLM API. Deploy on Hugging Face Spaces." }, { type: "coding", title: "Prompt Engineering Experiments", desc: "Write 5 different prompts for one task: zero-shot, few-shot, chain-of-thought, with/without system prompt. Measure and document which performs best." }],
  "mlops": [{ type: "coding", title: "Containerize & Deploy", desc: "Wrap your best model in FastAPI, containerize with Docker, deploy to Railway or Render. Get a live public URL." }, { type: "coding", title: "MLflow Experiment Tracking", desc: "Re-run any past model training tracking everything with MLflow. Compare 5 runs in the UI." }],
  "dataviz": [{ type: "coding", title: "Remake a Bad Chart", desc: "Find a confusing chart online (r/dataisugly). Identify what's wrong. Rebuild it as a clear, honest visualization using Plotly.", url: "https://www.reddit.com/r/dataisugly/" }],
  "portfolio": [{ type: "portfolio", title: "5-Slide Business Deck per Project", desc: "For each project: Problem → Data → Approach → Results in business terms → Recommendation. Present as if to a VP." }],
  "interview-sql": [{ type: "coding", title: "Timed SQL Sprint", desc: "30-minute timer. 3 hard StrataScratch problems, no autocomplete, no looking things up. Do this every 3 days.", url: "https://www.stratascratch.com" }],
  "interview-stats": [{ type: "coding", title: "Stats Verbal Drill", desc: "Record yourself answering 5 questions out loud (90 seconds each): p-values, A/B test design, CLT, Type I/II errors, confidence intervals. Re-record until confident." }],
  "interview-ml": [{ type: "coding", title: "Algorithm Explainer Cards", desc: "For each algorithm: write a 150-word explanation covering intuition, assumptions, failure modes, tuning. Say each out loud under 2 minutes." }],
  "interview-case": [{ type: "coding", title: "Case Study Mock", desc: "20-minute timer. Design a recommendation system for Netflix out loud. Framework: clarify → data → metric → model → limits. Record yourself." }],
  "networking": [{ type: "portfolio", title: "LinkedIn Content Plan", desc: "4 posts over 4 weeks: something interesting you learned, a project, a mistake and fix, a concept explained simply. Engage with 3 comments per day." }],
};

const roadmap = [
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
    { id: "ml-classification", title: "Supervised — Classification", weeks: "Week 5–6", why: "Classification is the most common ML task. Churn, fraud, spam, disease — all classification. XGBoost is what industry actually uses.", warning: "Accuracy is a trap in imbalanced datasets. Know when to use recall vs precision with a real example.", goldAdvice: "For every algorithm: how does it work, assumptions, when does it fail, how do you tune it. Answer all four without looking anything up.", resources: [{ name: "XGBoost docs", type: "Docs", url: "https://xgboost.readthedocs.io" }, { name: "StatQuest Random Forest & XGBoost", type: "YouTube", url: "https://www.youtube.com/@statquest" }], tasks: ["Logistic regression — understand log-odds, not just sigmoid", "Decision Trees — splitting criteria, depth, pruning", "Random Forests — why bagging reduces variance", "XGBoost — spend extra time here", "Metrics: precision, recall, F1, ROC-AUC", "Class imbalance: SMOTE, class weights, threshold tuning", "Know when recall > precision — give a real example"] },
    { id: "ml-unsupervised", title: "Unsupervised Learning", weeks: "Week 7", why: "Clustering and dimensionality reduction are everywhere: customer segmentation, anomaly detection, feature reduction.", warning: "Understand PCA geometrically. 'It reduces dimensions' is not enough.", goldAdvice: "Apply PCA to a real dataset and visualize the explained variance plot. Then explain why the first component captures the most variance.", resources: [{ name: "StatQuest PCA", type: "YouTube (free)", url: "https://www.youtube.com/@statquest" }], tasks: ["KMeans — algorithm, choosing k (elbow, silhouette)", "Hierarchical clustering — dendrograms", "PCA — geometric understanding", "Explained variance ratio — how to choose n components"] },
    { id: "ml-pipeline", title: "Full ML Pipeline", weeks: "Week 8", why: "This week is where you find out what you actually understand vs what you just watched someone else do.", warning: "Do this from scratch, no tutorial, real dataset. Notebooks with cells run out of order don't count.", goldAdvice: "Spend as much time on interpretation as on training. What features matter? What would the business do with this?", resources: [{ name: "Kaggle datasets", type: "Free real datasets", url: "https://www.kaggle.com/datasets" }], tasks: ["Raw data → cleaning → EDA → feature engineering", "Model selection → tuning → evaluation", "Feature importance and SHAP values", "Build from scratch alone, real dataset", "Write up findings as if presenting to a stakeholder"] },
    { id: "feature-eng", title: "Feature Engineering", weeks: "Week 9–10", why: "Good feature engineering beats fancy algorithms. Kaggle winners win because of better features, not better models.", warning: "Target encoding trap: data leakage. Apply it wrong and you'll get great validation scores and terrible production results.", goldAdvice: "Read winning solution writeups of past Kaggle tabular competitions. Worth more than any course.", resources: [{ name: "Kaggle competition forums", type: "Free (winning solutions)", url: "https://www.kaggle.com/competitions" }], tasks: ["Missing data: impute vs drop", "Label vs one-hot vs target encoding + their traps", "Interaction features and polynomial features", "Binning and log transforms", "Datetime features: hour, day of week, time since event", "Read 3 Kaggle winning solution writeups"] },
  ]},
  { phase: 3, title: "Modern Skills", duration: "Months 7–12", color: "#f7c96e", sections: [
    { id: "dl-nn", title: "Neural Networks", weeks: "Week 1–2", why: "Deep learning is in 20%+ of DS job postings and growing. You need to understand, apply, and discuss it confidently.", warning: "Don't touch PyTorch yet. Build a NN from scratch in NumPy first. Everyone who skips this regrets it.", goldAdvice: "The learning rate is the most important hyperparameter. Plot loss curves when it's too high vs too low.", resources: [{ name: "Andrej Karpathy — Neural Networks: Zero to Hero", type: "YouTube (exceptional)", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" }, { name: "fast.ai", type: "Free course", url: "https://course.fast.ai" }], tasks: ["Backpropagation — understand chain rule intuitively", "Activation functions: ReLU, sigmoid, tanh", "Batch size, learning rate, epochs", "Dropout and batch normalization", "Build NN from scratch in NumPy", "Rebuild it in PyTorch"] },
    { id: "dl-cnn", title: "CNNs & Transfer Learning", weeks: "Week 3–4", why: "Transfer learning is how 90% of real computer vision work is done. Fine-tuning pretrained models is a practical, hirable skill.", warning: "Don't get lost in architecture details. Focus on the concept of transfer learning.", goldAdvice: "Pick a domain and fine-tune on a real dataset from that domain. Domain-specific projects stand out.", resources: [{ name: "fast.ai Part 1", type: "Free course", url: "https://course.fast.ai" }, { name: "PyTorch Transfer Learning tutorial", type: "Docs", url: "https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html" }], tasks: ["Convolutional layers and pooling", "How CNNs see images intuitively", "Transfer learning — why pretrained weights help", "Fine-tune ResNet or EfficientNet on custom data", "Data augmentation"] },
    { id: "dl-nlp", title: "NLP & Transformers", weeks: "Week 5–6", why: "NLP is the hottest sub-field. Companies are integrating text understanding into every product.", warning: "You don't need to build a transformer from scratch. Fine-tune one and explain attention conceptually.", goldAdvice: "Pick NLP or Vision and go deeper in one. NLP is the higher-value choice right now.", resources: [{ name: "Hugging Face NLP course", type: "Free", url: "https://huggingface.co/learn/nlp-course" }, { name: "Andrej Karpathy — Let's build GPT", type: "YouTube", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY" }], tasks: ["Text preprocessing, tokenization, embeddings", "Attention mechanism — conceptual understanding", "BERT and variants", "Hugging Face: load and fine-tune a model", "NLP metrics: F1, BLEU, perplexity", "Pick NLP or Vision — go deeper in one"] },
    { id: "llm", title: "LLMs & Generative AI", weeks: "Week 7–9", why: "No longer optional. Companies are integrating LLMs into every data product. RAG is the most used pattern right now.", warning: "Don't just play with ChatGPT. Build something with LLM APIs. 'I built X with RAG' vs 'I've used LLMs' is enormous.", goldAdvice: "Build one project using an LLM API + real data. This alone impresses most interviewers in 2025-2026.", resources: [{ name: "LangChain docs", type: "Docs", url: "https://docs.langchain.com" }, { name: "OpenAI API docs", type: "Docs", url: "https://platform.openai.com/docs" }, { name: "Hugging Face", type: "Open source models", url: "https://huggingface.co" }], tasks: ["How LLMs work: transformers, attention, tokenization", "Prompt engineering — system prompts, few-shot, chain of thought", "RAG — the key pattern", "Fine-tuning vs RAG", "LangChain or LlamaIndex basics", "Build one project: LLM API + real data, keep it live"] },
    { id: "mlops", title: "MLOps", weeks: "Week 10–12", why: "Most candidates can train a model. Almost none can deploy one. This is your single biggest competitive edge.", warning: "Most DS candidates are bad at Git. Fix this first — it signals professionalism before anyone sees your code.", goldAdvice: "'I built this, you can use it right now at this URL' in an interview is a conversation-changer.", resources: [{ name: "FastAPI docs", type: "Docs", url: "https://fastapi.tiangolo.com" }, { name: "Docker getting started", type: "Docs", url: "https://docs.docker.com/get-started/" }, { name: "MLflow", type: "Free, open source", url: "https://mlflow.org" }], tasks: ["Git: branching, PRs, meaningful commit messages", "Virtual environments, clean code", "Docker: containerize your model", "FastAPI: serve model as live API", "MLflow or W&B: experiment tracking", "Deploy to AWS or GCP — live public URL", "Understand concept drift and data drift"] },
    { id: "dataviz", title: "Viz & Storytelling", weeks: "Ongoing (parallel)", why: "Being right means nothing if you can't communicate it. A DS who tells stories with data is 10x more influential.", warning: "Don't confuse pretty charts with storytelling. Storytelling: here's the problem, here's the data, here's what we should do.", goldAdvice: "After every project, make a 5-slide summary as if presenting to a VP who only cares about business outcomes.", resources: [{ name: "Storytelling with Data — Cole Nussbaumer Knaflic", type: "Book (read the whole thing)", url: "https://www.storytellingwithdata.com/book" }, { name: "Tableau Public", type: "Free", url: "https://public.tableau.com" }], tasks: ["Matplotlib & Seaborn for EDA", "Plotly for interactive charts", "Tableau or Power BI — learn one", "Read Storytelling with Data (full book)", "5-slide business summary for every project"] },
  ]},
  { phase: 4, title: "Portfolio & Jobs", duration: "Months 12–18", color: "#c792ea", sections: [
    { id: "portfolio", title: "Portfolio Projects", weeks: "Month 12–15", why: "Three exceptional projects beat ten mediocre ones. Every project needs a real business problem, deployed demo, and write-up.", warning: "'I trained a model on Titanic' is not a project. 'I built a churn predictor that could save $2M/year' is a project.", goldAdvice: "Write a Medium article per project. Most candidates have GitHub repos with no README. Be different — be findable.", resources: [{ name: "Kaggle Datasets", type: "Free", url: "https://www.kaggle.com/datasets" }, { name: "Medium", type: "Write articles here", url: "https://medium.com" }], tasks: ["Churn prediction with dollar-value business framing", "Full A/B test analysis beyond p-value", "NLP project on a real domain dataset", "Recommendation system deployed as API", "LLM-powered tool — keep it live", "Each project: clean README, write-up, deployed demo", "Write a Medium/LinkedIn article per project"] },
    { id: "interview-sql", title: "Interview Prep — SQL", weeks: "Month 13–16", why: "SQL is the first filter in almost every DS interview. Be fast, accurate, fluent.", warning: "Practicing with autocomplete is not the same as interview SQL. Practice from memory, timed.", goldAdvice: "StrataScratch has questions from real companies. 50 medium/hard problems minimum. After 50, interviews feel slow.", resources: [{ name: "StrataScratch", type: "DS-specific SQL practice", url: "https://www.stratascratch.com" }], tasks: ["50 StrataScratch problems — medium and hard", "Time yourself — 15 minutes max per problem", "Practice without autocomplete", "Review every wrong answer"] },
    { id: "interview-stats", title: "Interview Prep — Statistics", weeks: "Month 13–16", why: "Statistics is the second major filter in DS interviews.", warning: "Most common mistake: getting p-values wrong. Practice the correct definition until automatic.", goldAdvice: "Practice ALL statistics explanations spoken out loud. Record yourself. Sounding fluent matters as much as being correct.", resources: [{ name: "Ace the Data Science Interview", type: "Book — use as workbook", url: "https://www.acethedatascienceinterview.com" }], tasks: ["p-value: correct definition out loud without notes", "Design an A/B test for a product out loud", "Correlation vs causation with real example", "Confidence interval: what it actually means", "Statistical power and sample size"] },
    { id: "interview-ml", title: "Interview Prep — ML Theory", weeks: "Month 13–16", why: "ML theory tests whether you understand your tools or just use them.", warning: "Don't memorize answers. Understand so you can handle unexpected follow-ups.", goldAdvice: "For every algorithm: 2-minute verbal explanation — how it works, assumptions, failure modes, tuning. Record and listen back.", resources: [{ name: "Ace the Data Science Interview", type: "Book", url: "https://www.acethedatascienceinterview.com" }], tasks: ["Explain gradient boosting from scratch — 2 min verbal", "How does random forest reduce variance? Why not bias?", "Class imbalance: 3 ways to handle it", "Regularization: L1 vs L2 intuitively", "Handle a feature with 60% missing", "Explain the curse of dimensionality"] },
    { id: "interview-case", title: "Interview Prep — Case Studies", weeks: "Month 14–17", why: "Case studies test whether you think like a DS. Spend 30% of time clarifying the problem first.", warning: "Most candidates jump to the model immediately. The best candidates ask 'what does success look like?' first.", goldAdvice: "Framework: clarify → data → metric → model → limitations. Practice until automatic.", resources: [{ name: "Pramp", type: "Free mock interviews", url: "https://www.pramp.com" }], tasks: ["Master the framework: clarify → data → metric → model → limits", "Design a recommendation system out loud", "Design a fraud detection pipeline out loud", "Design a churn system out loud", "Do mock interviews on Pramp or with a friend"] },
    { id: "networking", title: "Networking", weeks: "Start Month 1 — never stop", why: "Most jobs at good companies are found through referrals. One warm referral is worth 50 cold applications.", warning: "Don't send cold 'can you refer me?' messages. Build relationships before asking for anything.", goldAdvice: "Pick a domain you care about. Domain expertise is the shortcut most generalists ignore.", resources: [{ name: "DataTalks.Club", type: "Free community & events", url: "https://datatalks.club" }, { name: "PyData", type: "Free events", url: "https://pydata.org" }], tasks: ["Post on LinkedIn weekly — insights, not 'finished a course'", "Comment thoughtfully on senior DS posts", "Attend PyData or DataTalks.Club events", "Pick a domain and go deep in it", "Send 1 specific question to 1 relevant person per week", "Start applying Month 9 — first 10 apps are practice"] },
  ]},
];

const typeColors = { coding: T.info, dataset: T.good, portfolio: T.p4 };
const typeLabels = { coding: "⌨ Coding", dataset: "📊 Dataset", portfolio: "🚀 Portfolio" };
const diffColors = { Beginner: T.info, Intermediate: T.gold, Advanced: T.warn };

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ProgressRing({ pct, color, size = 48, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease", strokeLinecap: "round" }} />
    </svg>
  );
}

function QuoteCard({ total }) {
  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const milestone = [...milestones].reverse().find(m => total.pct >= m.pct);
  const nextMilestone = milestones.find(m => m.pct > total.pct);

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.borderHi}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 12 }}>★ DAILY MOTIVATION</div>
      <div style={{ fontSize: 15, color: T.text, lineHeight: 1.6, fontStyle: "italic", marginBottom: 6 }}>
        "{todayQuote.text}"
      </div>
      <div style={{ fontSize: 11, color: T.textDim, marginBottom: 20 }}>— {todayQuote.author}</div>

      {milestone && (
        <div style={{ background: `${T.good}12`, border: `1px solid ${T.good}33`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: T.good, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>YOUR PROGRESS</div>
          <div style={{ fontSize: 12, color: "#b8e6cc", lineHeight: 1.6 }}>{milestone.msg}</div>
        </div>
      )}

      {nextMilestone && total.pct < 100 && (
        <div style={{ background: `${T.info}0d`, border: `1px solid ${T.info}22`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 9, color: T.info, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>NEXT MILESTONE — {nextMilestone.pct}%</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>{nextMilestone.msg}</div>
          <div style={{ marginTop: 8, height: 3, background: T.border, borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${((total.pct) / nextMilestone.pct) * 100}%`, background: T.info, borderRadius: 2, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 9, color: T.textFade, marginTop: 4 }}>{total.pct}% → {nextMilestone.pct}% ({nextMilestone.pct - total.pct}% to go)</div>
        </div>
      )}
    </div>
  );
}

function StatsRow({ total, projTotal }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
      {[
        { label: "Tasks Done", value: `${total.done}`, sub: `of ${total.total}`, color: T.info },
        { label: "Overall %", value: `${total.pct}%`, sub: "completed", color: T.gold },
        { label: "Projects", value: `${projTotal.done}`, sub: `of ${projTotal.total}`, color: T.p4 },
        { label: "Remaining", value: `${total.total - total.done}`, sub: "tasks left", color: T.textDim },
      ].map((s, i) => (
        <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, color: T.textFade, letterSpacing: "0.12em", marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 10, color: T.textFade, marginTop: 2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [checked, setChecked] = useState({});
  const [projDone, setProjDone] = useState({});
  const [activeTab, setActiveTab] = useState("motivation");
  const [activePhase, setActivePhase] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [projFilter, setProjFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const d = JSON.parse(saved); setChecked(d.checked || {}); setProjDone(d.projDone || {}); }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked, projDone })); } catch {}
  }, [checked, projDone, loaded]);

  const toggle = (sid, i) => setChecked(p => ({ ...p, [`${sid}-${i}`]: !p[`${sid}-${i}`] }));
  const toggleProj = (id) => setProjDone(p => ({ ...p, [id]: !p[id] }));
  const getSP = s => { const d = s.tasks.filter((_, i) => checked[`${s.id}-${i}`]).length; return { done: d, total: s.tasks.length, pct: Math.round(d / s.tasks.length * 100) }; };
  const getPP = ph => { const keys = ph.sections.flatMap(s => s.tasks.map((_, i) => `${s.id}-${i}`)); const d = keys.filter(k => checked[k]).length; return { done: d, total: keys.length, pct: Math.round(d / keys.length * 100) }; };
  const getTotal = () => { const keys = roadmap.flatMap(ph => ph.sections.flatMap(s => s.tasks.map((_, i) => `${s.id}-${i}`))); const d = keys.filter(k => checked[k]).length; return { done: d, total: keys.length, pct: Math.round(d / keys.length * 100) }; };
  const getProjTotal = () => { const d = portfolioProjects.filter(p => projDone[p.id]).length; return { done: d, total: portfolioProjects.length }; };

  const total = getTotal();
  const projTotal = getProjTotal();
  const phase = roadmap[activePhase];
  const pp = getPP(phase);
  const C = phase.color;
  const filteredProjs = portfolioProjects.filter(p => projFilter === "all" || p.type === projFilter || (projFilter === "must" && p.portfolioWorthy));

  const tabs = [
    { id: "motivation", label: "🌟 Motivation" },
    { id: "roadmap",    label: "📚 Roadmap" },
    { id: "projects",   label: "🚀 Projects" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ── */}
      <div style={{ background: T.bgDeep, borderBottom: `1px solid ${T.border}`, padding: "16px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: T.textFade, letterSpacing: "0.18em", marginBottom: 4 }}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>Zero → Competitive Candidate</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProgressRing pct={total.pct} color={total.pct >= 75 ? T.good : total.pct >= 40 ? T.gold : T.info} size={52} stroke={4} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: total.pct >= 75 ? T.good : total.pct >= 40 ? T.gold : T.info, lineHeight: 1 }}>{total.pct}%</div>
              <div style={{ fontSize: 10, color: T.textFade }}>{total.done}/{total.total} tasks</div>
            </div>
          </div>
        </div>

        {/* Global progress bar */}
        <div style={{ height: 3, background: T.border, borderRadius: 2, marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${total.pct}%`, background: `linear-gradient(90deg, ${T.p1}, ${T.p2}, ${T.p3}, ${T.p4})`, borderRadius: 2, transition: "width 0.6s" }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: activeTab === tab.id ? T.bgCard : "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? T.gold : "transparent"}`, color: activeTab === tab.id ? T.text : T.textDim, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, transition: "all 0.2s", borderRadius: "6px 6px 0 0" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MOTIVATION TAB ── */}
      {activeTab === "motivation" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <QuoteCard total={total} />
          <StatsRow total={total} projTotal={projTotal} />

          {/* Phase overview rings */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: T.textFade, letterSpacing: "0.18em", fontWeight: 700, marginBottom: 16 }}>PHASE BREAKDOWN</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {roadmap.map((ph, i) => {
                const p = getPP(ph);
                return (
                  <div key={i} onClick={() => { setActivePhase(i); setActiveTab("roadmap"); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", padding: "12px 8px", borderRadius: 10, background: T.bgDeep, border: `1px solid ${T.border}`, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ph.color + "66"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                    <div style={{ position: "relative" }}>
                      <ProgressRing pct={p.pct} color={ph.color} size={60} stroke={5} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, fontWeight: 700, color: ph.color }}>{p.pct}%</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.text, textAlign: "center" }}>Phase {ph.phase}</div>
                    <div style={{ fontSize: 10, color: T.textDim, textAlign: "center" }}>{ph.title}</div>
                    <div style={{ fontSize: 9, color: T.textFade }}>{p.done}/{p.total} tasks</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job targets */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ fontSize: 9, color: T.textFade, letterSpacing: "0.18em", fontWeight: 700, marginBottom: 16 }}>🎯 YOUR JOB TARGETS AFTER THIS ROADMAP</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { title: "Data Analyst", when: "Month 7+", desc: "Easiest entry point. SQL + Python + visualization. Apply here first while building toward DS.", color: T.p1 },
                { title: "Junior Data Scientist", when: "Month 12+", desc: "What this whole roadmap prepares you for. Competitive after Phase 1–3 + 3 solid portfolio projects.", color: T.p2 },
                { title: "ML Engineer (Junior)", when: "Month 12+", desc: "If you go deep on MLOps and deployment. More engineering-focused, usually pays more.", color: T.p3 },
                { title: "DS Internship", when: "Month 9+", desc: "Apply even before you're ready. Internships are the fastest way into full-time roles.", color: T.p4 },
              ].map((j, i) => (
                <div key={i} style={{ background: T.bgDeep, border: `1px solid ${j.color}22`, borderRadius: 10, padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: j.color }}>{j.title}</div>
                    <span style={{ fontSize: 9, color: j.color, background: j.color + "18", padding: "2px 7px", borderRadius: 3, flexShrink: 0, marginLeft: 8 }}>{j.when}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>{j.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", background: `${T.gold}0d`, border: `1px solid ${T.gold}33`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#e8d5a3", lineHeight: 1.7 }}>
                ★ <strong>Don't wait until you feel ready.</strong> You never will. Start applying at Month 9. The first 10–15 applications are practice. You learn more from one real interview than from a month of studying.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP TAB ── */}
      {activeTab === "roadmap" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Phase tabs left sidebar */}
          <div style={{ width: 220, borderRight: `1px solid ${T.border}`, padding: "16px 12px", overflowY: "auto", background: T.bgDeep, flexShrink: 0 }}>
            <div style={{ marginBottom: 16 }}>
              {roadmap.map((ph, i) => {
                const p2 = getPP(ph); const a = i === activePhase;
                return (
                  <button key={i} onClick={() => { setActivePhase(i); setExpanded(null); }}
                    style={{ width: "100%", background: a ? ph.color + "15" : "transparent", border: `1px solid ${a ? ph.color + "66" : "transparent"}`, color: a ? ph.color : T.textDim, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: a ? 600 : 400, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, transition: "all 0.2s", textAlign: "left" }}>
                    <span>Phase {ph.phase} — {ph.title}</span>
                    <span style={{ fontSize: 10, color: ph.color, background: ph.color + "18", padding: "1px 6px", borderRadius: 3 }}>{p2.pct}%</span>
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
              <div style={{ fontSize: 9, color: T.textFade, letterSpacing: "0.12em", marginBottom: 10 }}>SECTIONS</div>
              {phase.sections.map(s => {
                const sp = getSP(s); const a = expanded === s.id;
                const mps = sectionProjects[s.id] || [];
                return (
                  <div key={s.id} onClick={() => setExpanded(a ? null : s.id)}
                    style={{ marginBottom: 6, cursor: "pointer", padding: "7px 10px", borderRadius: 7, border: `1px solid ${a ? C + "44" : "transparent"}`, background: a ? C + "0e" : "transparent", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: sp.done === sp.total ? C : a ? T.text : T.textDim, fontWeight: a ? 600 : 400 }}>{s.title}</span>
                      <span style={{ fontSize: 9, color: T.textFade }}>{sp.done}/{sp.total}</span>
                    </div>
                    <div style={{ height: 2, background: T.border, borderRadius: 1 }}>
                      <div style={{ height: "100%", width: `${sp.pct}%`, background: sp.done === sp.total ? C : C + "66", borderRadius: 1, transition: "width 0.3s" }} />
                    </div>
                    {mps.length > 0 && <div style={{ fontSize: 8, color: T.textFade, marginTop: 3 }}>+ {mps.length} exercise{mps.length > 1 ? "s" : ""}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {/* Phase header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <ProgressRing pct={pp.pct} color={C} size={44} stroke={4} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C }}>{phase.title}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>{phase.duration} · {pp.done}/{pp.total} tasks</div>
              </div>
            </div>

            {phase.sections.map(section => {
              const sp = getSP(section);
              const isDone = sp.done === sp.total;
              const isExp = expanded === section.id;
              const miniPs = sectionProjects[section.id] || [];

              return (
                <div key={section.id} style={{ marginBottom: 12, background: T.bgCard, border: `1px solid ${isDone ? C + "55" : isExp ? C + "33" : T.border}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.3s" }}>

                  <div onClick={() => setExpanded(isExp ? null : section.id)}
                    style={{ padding: "13px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: isDone ? C + "08" : "transparent" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                        {isDone && <div style={{ width: 16, height: 16, borderRadius: "50%", background: C + "25", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke={C} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg></div>}
                        <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? C : T.text }}>{section.title}</span>
                        <span style={{ fontSize: 10, color: T.textFade }}>{section.weeks}</span>
                        {miniPs.length > 0 && <span style={{ fontSize: 9, color: T.info, background: T.info + "15", padding: "1px 6px", borderRadius: 3 }}>{miniPs.length} exercise{miniPs.length > 1 ? "s" : ""}</span>}
                      </div>
                      <div style={{ height: 2, background: T.border, borderRadius: 1, width: 180 }}>
                        <div style={{ height: "100%", width: `${sp.pct}%`, background: isDone ? C : C + "77", borderRadius: 1, transition: "width 0.4s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? C : T.textDim, background: isDone ? C + "18" : T.bgDeep, padding: "3px 9px", borderRadius: 5 }}>{sp.pct}%</span>
                      <span style={{ color: T.textFade, fontSize: 12, transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "block" }}>▾</span>
                    </div>
                  </div>

                  {isExp && (
                    <div>
                      <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: T.bgDeep, border: `1px solid ${C}22`, borderRadius: 8, padding: "11px 13px" }}>
                          <div style={{ fontSize: 8, color: C, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>WHY THIS MATTERS</div>
                          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.7 }}>{section.why}</div>
                        </div>
                        <div style={{ background: T.bgDeep, border: `1px solid ${T.warn}22`, borderRadius: 8, padding: "11px 13px" }}>
                          <div style={{ fontSize: 8, color: T.warn, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>⚠ COMMON MISTAKE</div>
                          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.7 }}>{section.warning}</div>
                        </div>
                      </div>
                      <div style={{ margin: "0 16px 14px", background: `${T.gold}0d`, border: `1px solid ${T.gold}33`, borderRadius: 8, padding: "11px 13px" }}>
                        <div style={{ fontSize: 8, color: T.gold, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 5 }}>★ GOLD ADVICE</div>
                        <div style={{ fontSize: 11, color: "#cfc9a0", lineHeight: 1.7 }}>{section.goldAdvice}</div>
                      </div>
                      <div style={{ margin: "0 16px 14px" }}>
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

                      <div style={{ borderTop: `1px solid ${T.border}` }} />
                      <div style={{ fontSize: 8, color: T.textFade, letterSpacing: "0.15em", padding: "10px 16px 4px" }}>TASKS — CLICK TO COMPLETE</div>
                      <div style={{ paddingBottom: miniPs.length > 0 ? 0 : 8 }}>
                        {section.tasks.map((task, i) => {
                          const key = `${section.id}-${i}`; const ck = !!checked[key];
                          return (
                            <div key={i} onClick={() => toggle(section.id, i)}
                              style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "8px 16px", cursor: "pointer", background: ck ? C + "0a" : "transparent", transition: "background 0.15s" }}
                              onMouseEnter={e => { if (!ck) e.currentTarget.style.background = T.bgDeep; }}
                              onMouseLeave={e => { e.currentTarget.style.background = ck ? C + "0a" : "transparent"; }}>
                              <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${ck ? C : T.borderHi}`, background: ck ? C + "25" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                {ck && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke={C} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                              </div>
                              <span style={{ fontSize: 12, color: ck ? T.textFade : T.textDim, textDecoration: ck ? "line-through" : "none", lineHeight: 1.6, transition: "all 0.2s" }}>{task}</span>
                            </div>
                          );
                        })}
                      </div>

                      {miniPs.length > 0 && (
                        <div>
                          <div style={{ borderTop: `1px solid ${T.border}` }} />
                          <div style={{ fontSize: 8, color: T.info, letterSpacing: "0.15em", padding: "10px 16px 8px" }}>HANDS-ON EXERCISES</div>
                          <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {miniPs.map((mp, i) => (
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

      {/* ── PROJECTS TAB ── */}
      {activeTab === "projects" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 2 }}>All Projects & Challenges</div>
              <div style={{ fontSize: 11, color: T.textDim }}>{projTotal.done} of {projTotal.total} completed</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["all","All","#888"],["coding","⌨ Coding",T.info],["dataset","📊 Dataset",T.good],["portfolio","🚀 Portfolio",T.p4],["must","⭐ Must-Build",T.gold]].map(([val, label, color]) => (
                <button key={val} onClick={() => setProjFilter(val)}
                  style={{ background: projFilter === val ? color + "18" : "transparent", border: `1px solid ${projFilter === val ? color : T.border}`, color: projFilter === val ? color : T.textDim, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filteredProjs.map(proj => {
              const done = !!projDone[proj.id];
              const phColor = phaseColors[proj.phase - 1];
              return (
                <div key={proj.id} style={{ background: T.bgCard, border: `1px solid ${done ? phColor + "55" : T.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color 0.3s" }}>
                  <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${T.border}`, background: done ? phColor + "08" : "transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 9, color: typeColors[proj.type], background: typeColors[proj.type] + "15", padding: "2px 7px", borderRadius: 3 }}>{typeLabels[proj.type]}</span>
                        <span style={{ fontSize: 9, color: diffColors[proj.difficulty], background: diffColors[proj.difficulty] + "15", padding: "2px 7px", borderRadius: 3 }}>{proj.difficulty}</span>
                        {proj.portfolioWorthy && <span style={{ fontSize: 9, color: T.gold, background: T.gold + "15", padding: "2px 7px", borderRadius: 3 }}>⭐ Must-Build</span>}
                      </div>
                      <span style={{ fontSize: 9, color: phColor, background: phColor + "15", padding: "2px 7px", borderRadius: 3, flexShrink: 0 }}>Phase {proj.phase}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: done ? phColor : T.text, marginBottom: 6 }}>{proj.title}</div>
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
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {proj.skills.map((sk, i) => <span key={i} style={{ fontSize: 9, color: T.textFade, background: T.bgDeep, border: `1px solid ${T.border}`, padding: "2px 7px", borderRadius: 3 }}>{sk}</span>)}
                    </div>
                    <button onClick={() => toggleProj(proj.id)}
                      style={{ width: "100%", padding: "9px", borderRadius: 7, border: `1px solid ${done ? phColor : T.borderHi}`, background: done ? phColor + "18" : T.bgDeep, color: done ? phColor : T.textDim, cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s" }}>
                      {done ? "✓ Completed" : "Mark as Complete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "8px 24px", background: T.bgDeep, display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textFade }}>
        <span style={{ color: T.good + "88" }}>● Progress saved locally</span>
        <span>{total.done} tasks · {projTotal.done}/{projTotal.total} projects</span>
      </div>
    </div>
  );
}
