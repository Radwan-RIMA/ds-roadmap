// DS Academy — Quiz Questions & Career Paths
// Mixed format: mc = multiple choice (auto-graded), open = open-ended (self-assessed)

const QUIZ_DATA = {
  "python-core": [
    {type:"mc",q:"What does this print?\n\nx = [1, 2, 3]\nprint(x[-1])",options:["A) 1","B) 3","C) -1","D) Error"],answer:1,explanation:"Negative indexing: -1 refers to the last element. x[-1] = 3."},
    {type:"mc",q:"Which creates a dictionary?",options:["A) x = [1,2,3]","B) x = (1,2,3)","C) x = {1,2,3}","D) x = {'a':1,'b':2}"],answer:3,explanation:"{key:value} syntax creates a dictionary. {1,2,3} creates a set."},
    {type:"mc",q:"List comprehension to square numbers 1–5?",options:["A) [x^2 for x in range(5)]","B) [x**2 for x in range(1,6)]","C) [x*x for x in 1..5]","D) list(x**2, range(1,6))"],answer:1,explanation:"range(1,6) gives 1-5. Python uses ** for exponents."},
    {type:"open",q:"Explain what a try/except block does and write an example that catches a ZeroDivisionError.",hint:"What happens without try/except when you divide by zero?",model:"try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\n\n# Without try/except the program crashes. try/except lets you\n# handle specific errors gracefully and keep the program running."},
    {type:"mc",q:"Correct way to open and read a file safely?",options:["A) open('f.txt').read()","B) with open('f.txt','r') as f: data=f.read()","C) file.read('f.txt')","D) read_file('f.txt')"],answer:1,explanation:"The 'with' statement automatically closes the file even if an error occurs inside the block."},
  ],
  "python-ds": [
    {type:"mc",q:"Filter rows where column 'Age' > 25 in DataFrame df?",options:["A) df.where('Age>25')","B) df[df['Age']>25]","C) df.filter(Age>25)","D) df.select(df.Age>25)"],answer:1,explanation:"Boolean indexing: df[boolean_series] returns rows where the condition is True."},
    {type:"mc",q:"What does df.groupby('City')['Sales'].sum() return?",options:["A) Total sales as one number","B) Sales summed per City","C) Unique cities only","D) Error"],answer:1,explanation:"groupby splits by City, then .sum() aggregates Sales within each group."},
    {type:"open",q:"What is the difference between df.loc[] and df.iloc[]? Give an example of each.",hint:"One uses labels, the other uses integer positions.",model:"df.loc[] uses labels:\n  df.loc[0, 'Name']  # row label 0, column 'Name'\n\ndf.iloc[] uses integer positions:\n  df.iloc[0, 1]  # first row (0-indexed), second column\n\nKey: if your index has non-integer labels, .loc uses those labels. .iloc always uses 0-based positions regardless of index."},
    {type:"mc",q:"What does np.array([1,2,3]) * 2 produce?",options:["A) [1,2,3,1,2,3]","B) Error","C) [2,4,6]","D) 12"],answer:2,explanation:"NumPy applies operations element-wise. Every element gets multiplied by 2."},
    {type:"mc",q:"Which function gives a statistical summary of a DataFrame?",options:["A) df.info()","B) df.summary()","C) df.describe()","D) df.stats()"],answer:2,explanation:"df.describe() shows count, mean, std, min, quartiles, max. df.info() shows dtypes and null counts."},
  ],
  "sql": [
    {type:"mc",q:"What does SELECT DISTINCT do?",options:["A) Selects the first row","B) Returns only unique values removing duplicates","C) Sorts results","D) Joins two tables"],answer:1,explanation:"DISTINCT removes duplicate rows from the result set."},
    {type:"mc",q:"Difference between WHERE and HAVING?",options:["A) No difference","B) WHERE filters before grouping, HAVING filters aggregated groups","C) HAVING runs first","D) WHERE is for strings, HAVING for numbers"],answer:1,explanation:"WHERE filters raw rows before GROUP BY. HAVING filters the aggregated result — used with GROUP BY."},
    {type:"open",q:"Write SQL to find the top 3 customers by total order value from table 'orders' with columns: customer_id, amount.",hint:"You need GROUP BY, SUM, ORDER BY, and LIMIT.",model:"SELECT customer_id, SUM(amount) AS total_value\nFROM orders\nGROUP BY customer_id\nORDER BY total_value DESC\nLIMIT 3;"},
    {type:"mc",q:"Which JOIN returns all rows from both tables, NULLs where no match?",options:["A) INNER JOIN","B) LEFT JOIN","C) RIGHT JOIN","D) FULL OUTER JOIN"],answer:3,explanation:"FULL OUTER JOIN returns all rows from both tables. Non-matching sides get NULL values."},
    {type:"mc",q:"Window functions like ROW_NUMBER() always require?",options:["A) GROUP BY","B) HAVING","C) OVER()","D) DISTINCT"],answer:2,explanation:"Window functions need OVER() to define their partition and ordering. It's what makes them window functions."},
  ],
  "stats-prob": [
    {type:"mc",q:"What does P(A|B) mean?",options:["A) P(A) × P(B)","B) Probability of A given B has occurred","C) Probability of A or B","D) Probability of A and B together"],answer:1,explanation:"P(A|B) is conditional probability — the probability of A given that B has already happened."},
    {type:"open",q:"Explain Bayes' theorem in plain English with a real-world example (e.g. medical testing).",hint:"Prior belief → see evidence → update to posterior belief.",model:"Bayes' theorem: your updated belief = prior belief × how likely the evidence is if your belief is correct.\n\nExample — disease testing:\nA disease affects 1% of people. A test is 95% accurate.\nYou test positive. What's the real chance you have it?\n\nIntuition: Most positives are FALSE positives because the disease is rare.\nBayes forces you to account for the base rate (prior = 1%), not just test accuracy.\n\nResult: Even with a 95% accurate test on a 1% prevalence disease, a positive result means ~16% chance you actually have it — not 95%."},
    {type:"mc",q:"P(A)=0.3, P(B)=0.4, independent. What is P(A and B)?",options:["A) 0.7","B) 0.12","C) 0.1","D) 0.58"],answer:1,explanation:"For independent events: P(A∩B) = P(A) × P(B) = 0.3 × 0.4 = 0.12."},
    {type:"mc",q:"Which theorem says sample means approach normal distribution regardless of population?",options:["A) Law of Large Numbers","B) Bayes' Theorem","C) Central Limit Theorem","D) Chebyshev's Theorem"],answer:2,explanation:"The Central Limit Theorem: as sample size grows, the distribution of sample means approaches normal — regardless of the underlying population distribution."},
  ],
  "stats-inf": [
    {type:"mc",q:"What does a p-value of 0.03 mean?",options:["A) 3% chance the hypothesis is true","B) 3% chance of seeing this result if null hypothesis is true","C) Effect size is 3%","D) 97% confidence"],answer:1,explanation:"The p-value is the probability of observing results at least as extreme as yours, assuming the null hypothesis is true. It does NOT mean the hypothesis has a 3% chance of being true."},
    {type:"open",q:"Your A/B test p-value is 0.04. Your boss says 'ship it, it's significant!' What questions should you ask before acting on this?",hint:"Think beyond p-value: effect size, practical significance, multiple testing, sample size...",model:"Key questions before acting:\n1. What is the effect size? p<0.05 can be statistically significant but practically meaningless (e.g. 0.001% lift in conversion)\n2. What was the sample size? Very large samples make tiny, meaningless effects significant\n3. Did we pre-specify this hypothesis, or test many things? Multiple comparisons inflate false positives\n4. What is the confidence interval? Is the entire range of plausible effects still worth acting on?\n5. Is this result practically significant? Would this lift actually matter for the business?\n6. Have we checked for data quality issues (bots, seasonality, novelty effect)?"},
    {type:"mc",q:"What is a Type I error?",options:["A) Failing to reject a false null hypothesis","B) Rejecting a true null hypothesis (false positive)","C) Using the wrong test","D) Insufficient sample size"],answer:1,explanation:"Type I error = false positive. You conclude there's an effect when there isn't one. Rate is controlled by α (your significance threshold)."},
    {type:"mc",q:"In A/B testing, what is the control group?",options:["A) Group receiving the new feature","B) Group seeing the current version (baseline)","C) A random holdout set","D) The larger group"],answer:1,explanation:"The control group is your baseline — the current version. The treatment group receives the change being tested."},
  ],
  "linalg": [
    {type:"mc",q:"Dot product of [1,2,3] and [4,5,6]?",options:["A) [4,10,18]","B) 32","C) [5,7,9]","D) 9"],answer:1,explanation:"1×4 + 2×5 + 3×6 = 4+10+18 = 32. The dot product is a scalar, not a vector."},
    {type:"open",q:"Explain eigenvectors and eigenvalues in plain English, and why they matter for PCA.",hint:"Think geometrically: what happens to a vector under a matrix transformation?",model:"Matrix transformation: typically rotates AND stretches vectors.\nEigenvector: special direction that the transformation ONLY stretches (never rotates).\nEigenvalue: how much it stretches — Av = λv\n\nFor PCA:\n- Compute the covariance matrix of your data\n- Its eigenvectors = principal components (directions of maximum variance)\n- Its eigenvalues = how much variance each direction captures\n- Sort by eigenvalue (largest first) and pick the top k\n- Project data onto those k directions to reduce dimensions while keeping the most information"},
    {type:"mc",q:"What is PCA primarily used for?",options:["A) Classification","B) Reducing dimensionality while preserving maximum variance","C) Clustering","D) Feature scaling"],answer:1,explanation:"PCA finds directions of maximum variance and projects data onto fewer dimensions — reducing features while keeping the most information."},
  ],
  "ml-core": [
    {type:"mc",q:"What is the bias-variance tradeoff?",options:["A) Tradeoff between train/test split size","B) High bias=underfitting, high variance=overfitting — minimizing both is the goal","C) Tradeoff between precision and recall","D) Tradeoff between model speed and accuracy"],answer:1,explanation:"Bias = systematic error from wrong assumptions (underfitting). Variance = sensitivity to training data noise (overfitting). Complex models have low bias/high variance; simple models the opposite."},
    {type:"open",q:"You train a Random Forest: 98% train accuracy, 72% test accuracy. What is happening and give 3 concrete fixes.",hint:"Name the problem first, then give specific solutions with why they work.",model:"Problem: Overfitting. The model memorized training data instead of learning generalizable patterns.\n\n3 concrete fixes:\n1. Reduce max_depth — shallower trees can't memorize as many specific patterns. Start at 5-10.\n2. Increase min_samples_leaf — require more samples to create a leaf, smoothing the decision boundaries\n3. Add more training data — more diverse examples make patterns harder to memorize\n4. Bonus: Use cross-validation to diagnose — if the gap persists across folds, the model is genuinely overfitting"},
    {type:"mc",q:"When to use ROC-AUC instead of accuracy?",options:["A) Regression problems","B) Imbalanced classes","C) More than 10 features","D) Very large datasets"],answer:1,explanation:"With imbalanced classes, a model predicting all-negative gets high accuracy but is useless. ROC-AUC measures discriminative ability regardless of class balance."},
    {type:"mc",q:"Which metric to maximize when false negatives are very costly (e.g. cancer detection)?",options:["A) Precision","B) Accuracy","C) Recall","D) Specificity"],answer:2,explanation:"Recall = TP/(TP+FN). Maximizing recall minimizes missed positives (false negatives) — the costly outcome in medical screening."},
    {type:"open",q:"Explain cross-validation. Why is it better than a single train/test split?",hint:"Think about the variance in estimating model performance.",model:"K-fold cross-validation:\n- Split data into k groups (e.g. 5)\n- For each fold: train on k-1 groups, test on the remaining 1\n- Repeat k times, average the results\n\nWhy better than one split:\n1. More reliable — averaged over k evaluations, not just one lucky/unlucky split\n2. Uses all data for both training and testing (just not simultaneously)\n3. Lower variance estimate — your performance metric is more stable\n4. Detects overfitting more reliably than a single holdout\n\nPractical note: Use StratifiedKFold for classification to preserve class proportions in each fold."},
  ],
  "ml-advanced": [
    {type:"mc",q:"What makes XGBoost different from Random Forest?",options:["A) XGBoost uses bagging, RF uses boosting","B) XGBoost builds trees sequentially correcting errors; RF builds them in parallel","C) XGBoost only works on classification","D) RF is always faster"],answer:1,explanation:"XGBoost is boosting — each tree corrects residual errors of all previous trees. RF is bagging — trees built independently, results averaged."},
    {type:"open",q:"What does a SHAP waterfall plot tell you, and why is it more useful than standard feature importance?",hint:"Global explanation vs local explanation. What can you tell a regulator about one specific decision?",model:"SHAP waterfall shows how each feature pushed ONE SPECIFIC PREDICTION higher or lower from the baseline.\n\nExample: Loan model predicts 82% default probability for customer X.\nSHAP waterfall:\n  Base rate: 45% (average prediction)\n  + Debt ratio: +31% (high debt, major risk driver)\n  + Monthly income: -18% (decent income, reduces risk)\n  + Age: +24% (young borrower, increases risk)\n  = Final: 82%\n\nWhy better than regular feature importance:\n- Feature importance = GLOBAL: 'income matters across all predictions'\n- SHAP = LOCAL: 'for THIS customer, income contributed -18% to the prediction'\n- You can explain individual decisions to customers and regulators\n- Critical for compliance (why was this loan rejected?)\n- Useful for debugging: find which features cause wrong predictions"},
    {type:"mc",q:"Main risk of target encoding?",options:["A) Too many features","B) Data leakage if full dataset encoded before split","C) Only works on numeric targets","D) Slows training significantly"],answer:1,explanation:"Encoding categories using target mean on full data before train/test split causes information from the test set to leak into training. Always encode using only training fold data."},
    {type:"mc",q:"What does early stopping in gradient boosting prevent?",options:["A) Learning rate getting too high","B) Overfitting by halting when validation performance stops improving","C) Trees from growing too deep","D) Training accuracy reaching 100%"],answer:1,explanation:"Early stopping monitors validation loss. When it stops improving for N rounds, training halts — preventing overfitting from adding too many trees."},
  ],
  "dl-nn": [
    {type:"mc",q:"What is the vanishing gradient problem?",options:["A) Gradients exploding to huge values","B) Gradients shrinking to near-zero, making early layers learn very slowly","C) Loss reaching zero too fast","D) Network ignoring neurons"],answer:1,explanation:"In deep networks, gradients are multiplied through many layers during backprop. With sigmoid/tanh, they shrink rapidly — early layers learn almost nothing."},
    {type:"open",q:"Explain backpropagation in plain English — no math needed. Just the intuition of how a neural network learns from mistakes.",hint:"Think: prediction → error → who is to blame → adjust.",model:"Backpropagation = how a neural network learns from mistakes:\n\n1. Forward pass: input flows through layers → produces a prediction\n2. Calculate error: compare prediction to true answer (the loss)\n3. Backward pass: 'who caused this error?'\n   - The chain rule traces backwards: how much did each weight contribute to the loss?\n   - Weights that caused more error get bigger gradient signals\n4. Update weights: nudge each weight slightly in the direction that reduces error (gradient descent)\n5. Repeat thousands of times — network gradually improves\n\nAnalogy: like tuning a recipe after tasting it. You identify which ingredients made it taste bad and adjust them — more of this, less of that — then taste again."},
    {type:"mc",q:"Purpose of dropout during training?",options:["A) Remove low-importance neurons permanently","B) Randomly zero out neurons to prevent co-adaptation and reduce overfitting","C) Speed up inference","D) Automatically reduce learning rate"],answer:1,explanation:"Dropout randomly deactivates neurons each training step, forcing the network to learn redundant representations — preventing overfitting and making it more robust."},
    {type:"mc",q:"What does ReLU(x) output?",options:["A) Values between 0 and 1","B) max(0,x) — input if positive, else 0","C) Normalized output","D) x multiplied by a learned weight"],answer:1,explanation:"ReLU(x) = max(0,x). Simple, effective, avoids vanishing gradients for positive inputs, introduces non-linearity."},
  ],
  "dl-nlp": [
    {type:"mc",q:"What is attention in transformers?",options:["A) Memory that stores training data","B) Mechanism that weighs relevance of each token relative to every other token","C) A filter that removes stop words","D) A positional encoding scheme"],answer:1,explanation:"Attention computes a weighted sum over all positions, letting each token 'attend' to the most relevant parts of the sequence."},
    {type:"open",q:"What is the difference between BERT and GPT? When would you choose each?",hint:"Think about direction of context: bidirectional vs left-to-right.",model:"BERT (encoder-only):\n- Reads full context in BOTH directions simultaneously\n- Best for: classification, NER, question answering, sentence similarity\n- Choose when: you need to UNDERSTAND text\n\nGPT (decoder-only):\n- Generates text LEFT-TO-RIGHT (can only see what came before)\n- Best for: text generation, completion, summarization, chat\n- Choose when: you need to GENERATE text\n\nSimple rule: Understand? → BERT. Generate? → GPT.\n\nModern practice: GPT-4 class models are very large decoders. For production classification on small datasets, fine-tuning BERT-style models is often cheaper and better."},
    {type:"mc",q:"What is RAG (Retrieval-Augmented Generation)?",options:["A) A type of GAN for text","B) Combining document retrieval with LLM generation to answer specific questions","C) A training technique for small models","D) Reducing hallucinations by limiting output length"],answer:1,explanation:"RAG retrieves relevant context from a document database (using embeddings + vector search) and passes it to the LLM, enabling accurate answers about specific knowledge without retraining."},
    {type:"mc",q:"What is fine-tuning a pre-trained model?",options:["A) Training from scratch on your data","B) Continuing training on a specific task, adapting the pre-trained weights","C) Reducing parameter count","D) Changing the tokenizer"],answer:1,explanation:"Fine-tuning starts from a large pre-trained model and continues training on your specific task — adapting learned representations with much less data and compute than training from scratch."},
  ],
};

const CAREER_PATHS = [
  {
    id:"data-analyst",title:"Data Analyst",icon:"📊",color:"#7eb8f7",
    tagline:"Turn raw data into business decisions",
    timeframe:"6–9 months",avgSalary:"$45k–$80k/yr",demand:"Very High",
    description:"The most accessible DS role and highest-demand in MENA. Data Analysts bridge data and business decisions — using SQL, Python, and visualization to answer 'what happened and why'.",
    keySkills:["SQL","Python","Pandas","Data Visualization","Statistics","Tableau or Power BI","Communication"],
    focusSections:["python-core","python-ds","sql","stats-prob","stats-inf","stats-dist","dataviz","eda-tools"],
    phases:[
      {phase:1,emphasis:"high",note:"Core foundation — master all of Phase 1"},
      {phase:2,emphasis:"partial",note:"Focus on: ML basics and Feature Engineering"},
      {phase:3,emphasis:"skip",note:"Deep learning not required for analysts"},
      {phase:4,emphasis:"skip",note:"Optional at this stage"},
      {phase:5,emphasis:"high",note:"Portfolio + SQL/Stats interview prep are critical"},
    ],
    projects:["Business KPI Dashboard in SQL","Full A/B Test Analysis","Customer Churn Predictor"],
    companies:["Aramex","Careem","Majid Al Futtaim","Banks & Telecoms","Consulting firms"],
    interviewFocus:["SQL window functions","A/B test design","Explaining p-values","Tableau/Power BI","Python Pandas scenarios"],
  },
  {
    id:"data-scientist",title:"Data Scientist",icon:"🧠",color:"#a78bfa",
    tagline:"Build predictive models that drive strategy",
    timeframe:"10–14 months",avgSalary:"$60k–$120k/yr",demand:"High",
    description:"The full DS role — combining statistical rigor, ML modeling, and business communication. Data Scientists build systems that predict, segment, and recommend.",
    keySkills:["Python","SQL","Pandas","Scikit-learn","XGBoost","Statistics","Feature Engineering","SHAP","Communication"],
    focusSections:["python-core","python-ds","sql","stats-prob","stats-inf","linalg","ml-core","ml-unsupervised","ml-pipeline","feature-eng","ml-advanced","eda-tools"],
    phases:[
      {phase:1,emphasis:"high",note:"Non-negotiable foundation"},
      {phase:2,emphasis:"high",note:"Core of the role — master every section"},
      {phase:3,emphasis:"high",note:"Advanced ML separates good from great"},
      {phase:4,emphasis:"partial",note:"LLM basics helpful; deep DL optional unless NLP-focused"},
      {phase:5,emphasis:"high",note:"Portfolio + all interview prep tracks"},
    ],
    projects:["Customer Churn Predictor","Fraud Detection Model","End-to-End Deployed ML System","Capstone Domain Project"],
    companies:["Noon","Talabat","Banks","Regional startups","Tech companies"],
    interviewFocus:["ML theory","Feature engineering","Model evaluation","Statistics","Case studies"],
  },
  {
    id:"ml-engineer",title:"ML Engineer",icon:"⚙️",color:"#6dd6a0",
    tagline:"Deploy and scale ML systems in production",
    timeframe:"12–18 months",avgSalary:"$80k–$150k/yr",demand:"Growing fast",
    description:"The highest-paying DS-adjacent role. ML Engineers bridge data science and software engineering — taking models and deploying them as reliable, scalable production systems.",
    keySkills:["Python","ML (sklearn, PyTorch)","FastAPI","Docker","MLflow","Git","SQL","Cloud (AWS/GCP)","LLM APIs"],
    focusSections:["python-core","python-ds","ml-core","ml-advanced","ml-pipeline","mlops","cloud","streamlit","llm","dl-nn"],
    phases:[
      {phase:1,emphasis:"high",note:"Strong Python fundamentals are critical"},
      {phase:2,emphasis:"high",note:"Must understand ML deeply to engineer it"},
      {phase:3,emphasis:"high",note:"MLOps, deployment, and cloud are the heart of this role"},
      {phase:4,emphasis:"high",note:"LLMs and deep learning are becoming core MLE skills"},
      {phase:5,emphasis:"partial",note:"Portfolio should emphasize deployed, live systems"},
    ],
    projects:["End-to-End Deployed ML System","RAG-Powered Document Q&A","Fine-tuned BERT Classifier"],
    companies:["AWS","Google","Microsoft","Anghami","Careem Tech","AI startups"],
    interviewFocus:["System design for ML","MLOps pipelines","Docker + FastAPI","LLM API integration","Python engineering"],
  },
];

export { QUIZ_DATA, CAREER_PATHS };
