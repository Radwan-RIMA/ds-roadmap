// ── AI JOB CALCULATOR
function AIJobCalculator(){
  const [job,setJob]=useState("");
  const [result,setResult]=useState(null);
  const [calculating,setCalculating]=useState(false);
  const [aiPowered,setAiPowered]=useState(false);

  const callDeepSeek=async(jobTitle)=>{
    try{
      const key=import.meta.env.VITE_DS_AI_TOKEN||"";
      console.log("DeepSeek key available:", !!key, key ? key.slice(-4) : "none");
      if(!key){console.log("No key found");return null;}
      const res=await fetch("https://api.deepseek.com/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body:JSON.stringify({
          model:"deepseek-chat",
          messages:[{
            role:"user",
            content:`You are an AI automation expert. Analyze this job: "${jobTitle}". Return ONLY raw JSON no markdown: {"risk":<0-100>,"label":"<Very Low Risk|Lower Risk|Moderate Risk|High Risk|Very High Risk>","reason":"<2 sentences>","skills":["s1","s2","s3","s4"],"months":<4-12>}`
          }],
          max_tokens:250
        })
      });
      const data=await res.json();
      const text=data.choices[0].message.content.trim().replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(text);
      const risk=Number(parsed.risk);
      const color=risk>=80?"#f28b82":risk>=60?"#f7c96e":risk>=40?"#a78bfa":"#6dd6a0";
      return{...parsed,risk,color};
    }catch(e){return null;}
  };

  const jobData={
    "data entry":{risk:92,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","Data Analysis","Automation"],months:4,reason:"Repetitive data tasks are among the first to be automated by AI systems."},
    "accountant":{risk:78,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Financial Analytics","Data Visualization"],months:6,reason:"Rule-based financial processing is highly automatable. DS skills shift you to strategic analysis."},
    "data analyst":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["ML","Advanced SQL","Storytelling","Python"],months:8,reason:"Basic analysis is at risk but strategic data scientists who drive decisions are in high demand."},
    "journalist":{risk:55,color:"#f7c96e",label:"Moderate Risk",skills:["NLP","Text Analysis","Python","Data Journalism"],months:7,reason:"AI can generate routine content. Data journalists who find stories in numbers are thriving."},
    "teacher":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["EdTech Analytics","Python","Learning Data","NLP"],months:9,reason:"Human connection in education is hard to replace, but AI tools are changing how teaching works."},
    "software engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["ML Engineering","MLOps","LLM APIs","Python"],months:6,reason:"Engineers who can build AI systems are more valuable than ever. Adapt, don't fear."},
    "doctor":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Medical ML","Clinical Analytics","Python","Research"],months:10,reason:"Medical diagnosis AI assists doctors but the human judgment and responsibility remain essential."},
    "marketer":{risk:61,color:"#f7c96e",label:"Moderate Risk",skills:["Marketing Analytics","SQL","A/B Testing","Python"],months:5,reason:"Generic marketing is being automated. Data-driven marketers who optimize with numbers are safe."},
    "lawyer":{risk:44,color:"#a78bfa",label:"Moderate Risk",skills:["Legal Analytics","NLP","Python","Document AI"],months:8,reason:"Document review is automating fast. Strategic legal work requires human judgment."},
    "hr":{risk:57,color:"#f7c96e",label:"Moderate Risk",skills:["People Analytics","Python","SQL","Predictive Hiring"],months:6,reason:"Screening and scheduling are automating. HR analytics is growing."},
    "graphic designer":{risk:69,color:"#f7c96e",label:"High Risk",skills:["AI Tools","Data Visualization","UX Analytics","Python"],months:5,reason:"AI image generation is transforming design. Data visualization and UX analytics offer a safe pivot."},
    "customer service":{risk:85,color:"#f28b82",label:"Very High Risk",skills:["Python","NLP","Chatbot Analytics","SQL"],months:4,reason:"Chatbots are replacing tier-1 support rapidly. Building and managing those systems is the opportunity."},
    "researcher":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["ML Research","Python","Statistics","Data Science"],months:7,reason:"Research that uses AI as a tool is accelerating. Your analytical skills translate directly to DS."},
    "banker":{risk:67,color:"#f7c96e",label:"High Risk",skills:["FinTech Analytics","Python","Risk Modeling","SQL"],months:6,reason:"Routine banking is automating fast. Quantitative finance and risk modeling are growing fields."},
    "translator":{risk:82,color:"#f28b82",label:"Very High Risk",skills:["NLP","Python","Language Models","Text Analytics"],months:5,reason:"Machine translation is rapidly improving. NLP engineering and localization analytics offer a pivot."},
    "civil engineer":{risk:25,color:"#6dd6a0",label:"Lower Risk",skills:["GIS Analytics","Python","Structural Data","Simulation"],months:8,reason:"Physical engineering judgment is hard to automate. Data-driven design and simulation are growing fast."},
    "architect":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Computational Design","Python","GIS","Data Visualization"],months:8,reason:"Creative design is safe but AI is transforming how architects analyze sites and optimize buildings."},
    "pharmacist":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["Health Analytics","Python","Drug Data","Clinical ML"],months:7,reason:"Dispensing is automating but clinical pharmacists who analyze patient data are in growing demand."},
    "social media manager":{risk:64,color:"#f7c96e",label:"High Risk",skills:["Social Analytics","Python","NLP","Marketing Data"],months:5,reason:"AI tools generate content fast. Data-driven social strategists who measure ROI stand out."},
    "financial analyst":{risk:70,color:"#f7c96e",label:"High Risk",skills:["Python","Financial Modeling","SQL","Quantitative Analysis"],months:5,reason:"Routine financial modeling is automating. Analysts who build ML-powered forecasts are thriving."},
    "sales representative":{risk:58,color:"#f7c96e",label:"Moderate Risk",skills:["CRM Analytics","Python","Sales Forecasting","SQL"],months:5,reason:"Cold outreach is automating but data-driven sales people who analyze pipelines are more valuable."},
    "project manager":{risk:38,color:"#a78bfa",label:"Moderate Risk",skills:["Project Analytics","Python","Resource Optimization","Data"],months:6,reason:"Human coordination is hard to replace but PMs who use data to predict delays and risks are essential."},
    "economist":{risk:32,color:"#6dd6a0",label:"Lower Risk",skills:["Econometrics","Python","R","Statistical Modeling"],months:6,reason:"Economic analysis requires deep domain knowledge. Data skills amplify rather than replace economists."},
    "logistics coordinator":{risk:72,color:"#f7c96e",label:"High Risk",skills:["Supply Chain Analytics","Python","SQL","Optimization"],months:5,reason:"Routing and scheduling are rapidly automating. Supply chain data analysts are in high demand."},
    "content writer":{risk:75,color:"#f7c96e",label:"High Risk",skills:["NLP","Python","Content Analytics","SEO Data"],months:5,reason:"AI writes generic content fast. Writers who use data to find angles and measure performance survive."},
    "administrative assistant":{risk:88,color:"#f28b82",label:"Very High Risk",skills:["Python","Automation","SQL","Data Entry Tools"],months:4,reason:"Scheduling, email management and document handling are being automated rapidly by AI agents."},
    "real estate agent":{risk:42,color:"#a78bfa",label:"Moderate Risk",skills:["Real Estate Analytics","Python","Market Data","SQL"],months:6,reason:"Property search is automating but agents who use market data to advise clients add real value."},
    "nurse":{risk:15,color:"#6dd6a0",label:"Lower Risk",skills:["Health Analytics","Python","Clinical Data","Patient ML"],months:9,reason:"Human care is irreplaceable. Nurses who understand clinical data and patient analytics are future-proof."},
    "business analyst":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["SQL","Python","BI Tools","Data Visualization"],months:6,reason:"Basic reporting is automating. BAs who translate data into strategy are more valuable than ever."},
    "supply chain manager":{risk:60,color:"#f7c96e",label:"Moderate Risk",skills:["Supply Chain Analytics","Python","Forecasting","SQL"],months:6,reason:"AI is transforming logistics. Managers who use predictive analytics for inventory are in demand."},
    "accountant":{risk:78,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Financial Analytics","Data Visualization"],months:6,reason:"Rule-based financial processing is highly automatable. DS skills shift you to strategic analysis."},
    "dentist":{risk:12,color:"#6dd6a0",label:"Very Low Risk",skills:["Medical Imaging ML","Python","Clinical Analytics","Health Data"],months:10,reason:"Physical dental procedures require human precision. AI assists with imaging but cannot replace dentists."},
    "psychologist":{risk:16,color:"#6dd6a0",label:"Lower Risk",skills:["Mental Health Analytics","NLP","Python","Behavioral Data"],months:9,reason:"Human empathy and therapeutic relationships are hard to automate. Data skills open research roles."},
    "operations manager":{risk:48,color:"#a78bfa",label:"Moderate Risk",skills:["Operations Analytics","Python","Process Mining","SQL"],months:6,reason:"Routine operations are automating. Managers who optimize with data and ML are highly valued."},
    "recruiter":{risk:62,color:"#f7c96e",label:"Moderate Risk",skills:["People Analytics","Python","SQL","Predictive Hiring"],months:5,reason:"CV screening is almost fully automated. Data-driven recruiters who predict candidate success stand out."},
    "photographer":{risk:55,color:"#f7c96e",label:"Moderate Risk",skills:["Computer Vision","Python","Image Analytics","AI Tools"],months:6,reason:"AI generates images but photographers who combine creativity with data analytics thrive in advertising."},
    "electrician":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["IoT Analytics","Python","Smart Grid Data","Automation"],months:8,reason:"Physical electrical work requires human presence. Smart building analytics is a growing specialization."},
    "chef":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["Food Analytics","Python","Supply Chain Data","Recipe ML"],months:9,reason:"Culinary creativity is uniquely human. Data skills help optimize menus, reduce waste, and forecast demand."},
    "social worker":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Social Impact Analytics","Python","Case Data","NLP"],months:9,reason:"Human connection and advocacy are irreplaceable. Data skills help identify at-risk populations earlier."},
    "actuary":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["ML","Python","Risk Modeling","Statistics"],months:6,reason:"Traditional actuarial work is evolving. Actuaries who use ML for risk modeling are highly sought after."},
    "urban planner":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["GIS Analytics","Python","Urban Data","Simulation"],months:8,reason:"City planning requires human judgment. Data-driven planners who model population and traffic trends excel."},
    "mechanic":{risk:24,color:"#6dd6a0",label:"Lower Risk",skills:["Predictive Maintenance","Python","IoT Data","Diagnostics ML"],months:8,reason:"Physical repair needs human hands. Mechanics who use predictive analytics prevent failures before they happen."},
    "insurance agent":{risk:74,color:"#f7c96e",label:"High Risk",skills:["Actuarial ML","Python","Risk Analytics","SQL"],months:5,reason:"Policy comparison and quoting are automating fast. Risk analysts who model claims with ML are safe."},
    "copywriter":{risk:78,color:"#f7c96e",label:"High Risk",skills:["NLP","Python","Content Analytics","A/B Testing"],months:5,reason:"AI writes copy fast. Copywriters who test with data and optimize conversion rates are irreplaceable."},
    "economist":{risk:32,color:"#6dd6a0",label:"Lower Risk",skills:["Econometrics","Python","R","Statistical Modeling"],months:6,reason:"Economic analysis requires deep domain knowledge. Data skills amplify rather than replace economists."},
    // EDUCATION
    "professor":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["EdTech Analytics","Python","Research Data","NLP"],months:9,reason:"Deep expertise and mentorship are hard to automate. Professors who use data in research are thriving."},
    "tutor":{risk:60,color:"#f7c96e",label:"Moderate Risk",skills:["EdTech Analytics","Python","Learning Data","NLP"],months:6,reason:"AI tutoring tools are improving fast. Human tutors who specialize in complex subjects and motivation survive."},
    "school principal":{risk:15,color:"#6dd6a0",label:"Lower Risk",skills:["Education Analytics","Python","Student Data","Reporting"],months:10,reason:"Leadership and community trust are irreplaceable. Data skills help principals make better school decisions."},
    "librarian":{risk:72,color:"#f7c96e",label:"High Risk",skills:["Information Science","Python","NLP","Search Analytics"],months:5,reason:"Search and cataloging are automating fast. Data librarians who manage knowledge systems are still needed."},
    // HEALTHCARE
    "surgeon":{risk:10,color:"#6dd6a0",label:"Very Low Risk",skills:["Surgical Robotics Data","Python","Medical Imaging","Clinical ML"],months:12,reason:"Physical surgical precision requires human hands. Surgeons who understand AI-assisted tools are future-proof."},
    "radiologist":{risk:55,color:"#f7c96e",label:"Moderate Risk",skills:["Medical Imaging ML","Python","Diagnostic AI","Clinical Data"],months:7,reason:"AI is very good at reading scans but radiologists who supervise and validate AI findings are still essential."},
    "veterinarian":{risk:14,color:"#6dd6a0",label:"Lower Risk",skills:["Animal Health Analytics","Python","Clinical Data","ML"],months:10,reason:"Physical animal care requires human presence. Vets who use diagnostic data tools are more effective."},
    "physical therapist":{risk:16,color:"#6dd6a0",label:"Lower Risk",skills:["Health Analytics","Python","Movement Data","Wearables"],months:10,reason:"Human touch in rehabilitation is irreplaceable. Data from wearables is creating new opportunities."},
    "paramedic":{risk:12,color:"#6dd6a0",label:"Lower Risk",skills:["Emergency Analytics","Python","Clinical Data","IoT"],months:10,reason:"Emergency response requires human judgment under pressure. Data skills help optimize dispatch and outcomes."},
    // FINANCE
    "auditor":{risk:76,color:"#f7c96e",label:"High Risk",skills:["Audit Analytics","Python","SQL","Fraud Detection"],months:5,reason:"Rule-based audit checks are automating fast. Auditors who use data analytics to find anomalies are safe."},
    "tax consultant":{risk:80,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","Financial Analytics","Tax ML"],months:4,reason:"Tax calculations are highly automatable. Consultants who do strategic planning and data analysis survive."},
    "investment banker":{risk:52,color:"#a78bfa",label:"Moderate Risk",skills:["Python","Financial Modeling","SQL","Quantitative Analysis"],months:6,reason:"Relationship-driven deals are safe but analysts who can't model with code are being replaced fast."},
    "stock trader":{risk:78,color:"#f7c96e",label:"High Risk",skills:["Algorithmic Trading","Python","Statistics","Time Series"],months:5,reason:"Algorithmic trading dominates markets. Traders who build and monitor quant models are thriving."},
    "credit analyst":{risk:74,color:"#f7c96e",label:"High Risk",skills:["Credit ML","Python","SQL","Risk Modeling"],months:5,reason:"Credit scoring models are almost fully automated. Analysts who build those models are in demand."},
    // TECH
    "web developer":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["ML APIs","Python","Data Visualization","Backend Analytics"],months:6,reason:"AI writes basic code fast. Developers who build data-driven products and ML features are very safe."},
    "cybersecurity analyst":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["Security Analytics","Python","Anomaly Detection","ML"],months:7,reason:"Cyber threats evolve constantly requiring human creativity. ML-powered threat detection is a growing skill."},
    "data engineer":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Pipeline Engineering","Python","SQL","Cloud Data"],months:6,reason:"Data engineers who build robust pipelines are more in demand than ever as data volumes explode."},
    "product manager":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Product Analytics","Python","SQL","A/B Testing"],months:7,reason:"Product intuition and stakeholder management are hard to automate. Data-driven PMs are gold."},
    "ui ux designer":{risk:48,color:"#a78bfa",label:"Moderate Risk",skills:["UX Analytics","Python","A/B Testing","User Data"],months:6,reason:"AI generates UI mockups but designers who use data to understand user behavior and optimize flows are safe."},
    "devops engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["MLOps","Python","Infrastructure Analytics","Monitoring"],months:7,reason:"Infrastructure complexity is growing. DevOps engineers who automate with data and ML are highly valued."},
    "game developer":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["Game Analytics","Python","Player Data","ML"],months:7,reason:"AI generates game assets but developers who use player behavior data to design better experiences stand out."},
    // MEDIA & CREATIVE
    "video editor":{risk:70,color:"#f7c96e",label:"High Risk",skills:["Media Analytics","Python","Computer Vision","Content Data"],months:5,reason:"AI video editing tools are advancing rapidly. Editors who combine storytelling with data analytics survive."},
    "animator":{risk:65,color:"#f7c96e",label:"High Risk",skills:["Computer Vision","Python","Creative Analytics","AI Tools"],months:5,reason:"AI animation tools are improving fast. Animators who direct AI tools and analyze audience data thrive."},
    "musician":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["Music Analytics","Python","Audio ML","Streaming Data"],months:7,reason:"AI composes music but human creativity and performance are still valued. Music data analytics is emerging."},
    "actor":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["Media Analytics","Python","Audience Data","NLP"],months:7,reason:"Digital actors and deepfakes are rising but authentic human performance is still in demand."},
    "radio presenter":{risk:68,color:"#f7c96e",label:"High Risk",skills:["Audio Analytics","Python","NLP","Audience Data"],months:5,reason:"AI voices are improving fast. Presenters who use audience data to personalize content stand out."},
    "podcaster":{risk:42,color:"#a78bfa",label:"Moderate Risk",skills:["Audio Analytics","Python","NLP","Audience Data"],months:6,reason:"AI generates podcast content but authentic human voices and niche expertise retain loyal audiences."},
    // LEGAL
    "judge":{risk:8,color:"#6dd6a0",label:"Very Low Risk",skills:["Legal Analytics","Python","NLP","Case Data"],months:12,reason:"Judicial decisions require human accountability and ethical judgment. AI assists but cannot replace judges."},
    "paralegal":{risk:75,color:"#f7c96e",label:"High Risk",skills:["Legal NLP","Python","Document AI","SQL"],months:5,reason:"Document review and legal research are automating fast. Paralegals who manage AI legal tools are safe."},
    "notary":{risk:82,color:"#f28b82",label:"Very High Risk",skills:["Document AI","Python","Blockchain","Legal Analytics"],months:4,reason:"Document verification is highly automatable. Digital notarization and blockchain are replacing traditional roles."},
    // MENA SPECIFIC
    "bank teller":{risk:90,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","FinTech Analytics","Automation"],months:4,reason:"ATMs and mobile banking have already replaced most teller work. FinTech analytics is the pivot."},
    "call center agent":{risk:88,color:"#f28b82",label:"Very High Risk",skills:["NLP","Python","Chatbot Analytics","SQL"],months:4,reason:"AI call centers are already live in major companies. Building and managing those systems is the opportunity."},
    "telecom engineer":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Network Analytics","Python","IoT Data","Predictive Maintenance"],months:7,reason:"Network infrastructure needs human oversight. Telecom engineers who use data to optimize networks are safe."},
    "oil engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["Geospatial Analytics","Python","IoT Sensors","Predictive ML"],months:8,reason:"Physical energy work requires human presence. Engineers who use sensor data and ML to optimize drilling thrive."},
    "hotel manager":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["Hospitality Analytics","Python","Revenue Management","SQL"],months:7,reason:"Guest experience needs human touch. Managers who use data to optimize pricing and operations stand out."},
    "flight attendant":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Operations Analytics","Python","Safety Data","Customer ML"],months:9,reason:"Human safety and service are irreplaceable in aviation. Data skills help optimize routes and passenger experience."},
    "pilot":{risk:14,color:"#6dd6a0",label:"Lower Risk",skills:["Aviation Analytics","Python","Safety ML","Simulation Data"],months:10,reason:"Pilots are required by law and passenger trust. AI assists navigation but full automation is decades away."},
    "immigration officer":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["Document AI","Python","Pattern Recognition","SQL"],months:6,reason:"Document checks are automating but judgment calls require human officers. Data skills boost efficiency."},
    "customs officer":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["Risk Analytics","Python","Pattern Detection","SQL"],months:6,reason:"AI flags suspicious shipments but human judgment is still required. Data-driven officers are more effective."},
    // RETAIL & SERVICE
    "retail manager":{risk:52,color:"#a78bfa",label:"Moderate Risk",skills:["Retail Analytics","Python","SQL","Demand Forecasting"],months:6,reason:"Inventory and pricing are automating. Managers who use sales data to make decisions are more valuable."},
    "cashier":{risk:95,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","Retail Analytics","Automation"],months:4,reason:"Self-checkout and automated payment are replacing cashiers rapidly. A pivot to data skills is urgent."},
    "delivery driver":{risk:70,color:"#f7c96e",label:"High Risk",skills:["Logistics Analytics","Python","Route Optimization","SQL"],months:5,reason:"Autonomous delivery is coming. Drivers who move into logistics data and route optimization are safe."},
    "warehouse worker":{risk:85,color:"#f28b82",label:"Very High Risk",skills:["Supply Chain Analytics","Python","Robotics Data","SQL"],months:4,reason:"Warehouse automation is accelerating. Workers who manage and optimize automated systems have a future."},
    "barista":{risk:50,color:"#a78bfa",label:"Moderate Risk",skills:["Business Analytics","Python","Customer Data","SQL"],months:6,reason:"Automated coffee machines exist but premium cafe experience still needs humans. Data skills open management roles."},
    "hairdresser":{risk:10,color:"#6dd6a0",label:"Very Low Risk",skills:["Business Analytics","Python","Customer Data","Marketing"],months:10,reason:"Physical styling is uniquely human. Data skills help salon owners optimize bookings and customer retention."},
    "plumber":{risk:12,color:"#6dd6a0",label:"Very Low Risk",skills:["IoT Analytics","Python","Predictive Maintenance","Smart Home Data"],months:10,reason:"Physical plumbing requires human hands. Smart building systems are creating new data opportunities for plumbers."},
    "carpenter":{risk:14,color:"#6dd6a0",label:"Very Low Risk",skills:["Manufacturing Analytics","Python","CAD Data","Supply Chain"],months:10,reason:"Skilled craftsmanship is hard to automate. CNC and digital fabrication data skills add significant value."},
    // SCIENCE & RESEARCH
    "biologist":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["Bioinformatics","Python","R","Genomics Data"],months:8,reason:"AI accelerates biological research. Biologists who combine domain expertise with Python and data analysis thrive."},
    "chemist":{risk:25,color:"#6dd6a0",label:"Lower Risk",skills:["Cheminformatics","Python","Lab Data","ML"],months:8,reason:"AI is transforming drug discovery but chemists who combine lab skills with data analysis are in high demand."},
    "geologist":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["GIS Analytics","Python","Geospatial Data","Remote Sensing"],months:8,reason:"Field geology requires human judgment. Geologists who use satellite data and ML for analysis are thriving."},
    "environmental scientist":{risk:24,color:"#6dd6a0",label:"Lower Risk",skills:["Environmental Analytics","Python","GIS","Climate Data"],months:8,reason:"Climate monitoring uses AI but environmental scientists who interpret data and drive policy are essential."},
    "astronomer":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Astrophysics Data","Python","ML","Big Data"],months:9,reason:"Modern astronomy is already data-driven. Astronomers who code and analyze telescope data are future-proof."},
  };

  const calculate=async()=>{
    if(!job.trim())return;
    setCalculating(true);
    setAiPowered(false);
    const k=job.toLowerCase().trim();
    let match=null;
    for(const j of Object.keys(jobData)){if(k.includes(j)||j.includes(k)){match=jobData[j];break;}}
    if(!match){
      const aiResult=await callDeepSeek(job);
      if(aiResult){match=aiResult;setAiPowered(true);}
      else{const risk=Math.floor(Math.random()*30)+40;match={risk,color:risk>60?"#f7c96e":"#a78bfa",label:risk>60?"Moderate-High Risk":"Moderate Risk",skills:["Python","SQL","Data Analysis","Machine Learning"],months:6,reason:"Most knowledge work roles are being transformed by AI. Data skills future-proof any career."};}
    }
    setResult(match);
    setCalculating(false);
  };

  return(
    <div style={{padding:"80px 20px",background:"#0b0a12"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// career risk scanner</div>
        <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>Will AI replace your job?</h2>
        <p style={{color:"#7b78a0",fontSize:15,marginBottom:40,maxWidth:520}}>Enter your current job title and find out your AI replacement risk — and exactly what data skills would make you safe.</p>
        <div style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:16,padding:"32px"}}>
          {!result&&!calculating&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                <input value={job} onChange={e=>setJob(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calculate()} placeholder="e.g. Accountant, Marketer, Teacher..." style={{flex:1,minWidth:200,background:"#0b0a12",border:"1px solid #2a2845",borderRadius:8,padding:"12px 16px",color:"#e8e4ff",fontSize:14,outline:"none"}}/>
                <button onClick={calculate} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"12px 24px",borderRadius:8,cursor:"pointer",fontSize:15,fontWeight:600,whiteSpace:"nowrap"}}>Scan My Job →</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Accountant","Marketer","Teacher","Lawyer","Designer","Researcher","Cashier","Pilot","Surgeon","Banker"].map(j=>(
                  <button key={j} onClick={()=>setJob(j)} style={{background:"#17162a",border:"1px solid #2a2845",color:"#7b78a0",padding:"5px 12px",borderRadius:100,cursor:"pointer",fontSize:12}}>{j}</button>
                ))}
              </div>
            </div>
          )}
          {calculating&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <style>{`@keyframes spin2{to{transform:rotate(360deg);}}`}</style>
              <div style={{width:32,height:32,border:"2px solid #1e1c35",borderTop:"2px solid #8b7cf6",borderRadius:"50%",animation:"spin2 0.8s linear infinite",margin:"0 auto 16px"}}/>
              <div style={{fontSize:13,color:"#7b78a0",fontFamily:"monospace"}}>🤖 AI is analyzing your job...</div>
            </div>
          )}
          {result&&!calculating&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
                <div><div style={{fontSize:13,color:"#7b78a0",marginBottom:4}}>Risk assessment for{aiPowered&&<span style={{marginLeft:8,fontSize:10,background:"#8b7cf615",color:"#8b7cf6",border:"1px solid #8b7cf633",padding:"2px 8px",borderRadius:100,fontFamily:"monospace"}}>🤖 AI</span>}</div><div style={{fontSize:18,fontWeight:700,color:"#e8e4ff"}}>{job}</div></div>
                <span style={{fontSize:11,fontFamily:"monospace",padding:"4px 12px",borderRadius:100,background:result.color+"18",color:result.color,border:`1px solid ${result.color}44`}}>{result.label}</span>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:"#7b78a0"}}>AI Replacement Risk</span><span style={{fontSize:22,fontWeight:800,color:result.color}}>{result.risk}%</span></div>
                <div style={{height:8,background:"#1e1c35",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${result.risk}%`,background:`linear-gradient(90deg, #6dd6a0, ${result.color})`,borderRadius:4,transition:"width 1s ease"}}/></div>
              </div>
              <div style={{background:"#0b0a12",border:"1px solid #1e1c35",borderRadius:10,padding:"14px 16px",marginBottom:20}}><div style={{fontSize:12,color:"#7b78a0",lineHeight:1.7}}>{result.reason}</div></div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:12}}>SKILLS THAT PROTECT YOU</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{result.skills.map(s=><span key={s} style={{fontSize:12,padding:"5px 12px",borderRadius:100,background:"#6dd6a011",color:"#6dd6a0",border:"1px solid #6dd6a033"}}>{s}</span>)}</div>
              </div>
              <div style={{background:"linear-gradient(135deg, #8b7cf611, #f472b611)",border:"1px solid #8b7cf633",borderRadius:10,padding:"16px",marginBottom:16}}>
                <div style={{fontSize:13,color:"#e8e4ff",marginBottom:4}}>🎯 DS Academy can make you safe in <strong style={{color:"#8b7cf6"}}>{result.months} months</strong></div>
                <div style={{fontSize:12,color:"#7b78a0"}}>The curriculum covers all the skills above — starting from Python with zero experience required.</div>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <a href="#apply" style={{flex:1,minWidth:140,background:"#8b7cf6",color:"#fff",border:"none",padding:"11px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Apply for Access →</a>
                <button onClick={()=>{setResult(null);setJob("");}} style={{padding:"11px 16px",background:"none",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:8,cursor:"pointer",fontSize:13}}>Try another job</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
const phaseColors = ["#7eb8f7","#a78bfa","#6dd6a0","#f7c96e","#c792ea"];
const ADMIN_EMAIL = "radwanrima0@gmail.com";

import { LearnTab, LESSONS, LEARN_PHASES, SECTION_TO_FIRST_LESSON, LESSON_COMPLETES_TASK } from "./lessons";
import { sectionProjects, typeColors, typeLabels, portfolioProjects, DEFAULT_ROADMAP, quotes, getTotalProgress } from "./constants";

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

// ── PLATFORM PREVIEW
function PlatformPreview(){
  const [active,setActive]=useState(0);
  const tabs=[
    {
      label:"📋 Roadmap",
      desc:"Your complete learning path — every phase, every section, every task. Always know exactly where you are and what's next.",
      preview:(
        <div style={{background:"#0d0c18",borderRadius:12,padding:"20px",fontFamily:"monospace"}}>
          {[
            {phase:"Phase 1",title:"Python & Data Tools",icon:"🐍",color:"#7eb8f7",time:"Months 1–2",progress:100,done:["Python Basics","Git & GitHub","NumPy Arrays","Pandas Basics","Pandas Advanced","EDA","Data Visualization"]},
            {phase:"Phase 2",title:"Machine Learning",icon:"🤖",color:"#a78bfa",time:"Months 2–4",progress:60,done:["ML Workflow","Linear & Logistic Regression","Decision Trees & Random Forests"],pending:["Model Evaluation","Overfitting & Regularization","Scikit-learn Pipelines"]},
            {phase:"Phase 3",title:"Advanced ML",icon:"📊",color:"#6dd6a0",time:"Months 3–7",progress:0,pending:["XGBoost & Gradient Boosting","LightGBM & CatBoost","SHAP Explainability","Feature Engineering","ML Pipelines","Hyperparameter Tuning"]},
            {phase:"Phase 4",title:"Deep Learning & LLMs",icon:"🧠",color:"#f7c96e",time:"Months 7–12",progress:0,pending:["Neural Networks","NLP & Transformers","LLMs & RAG Systems"]},
            {phase:"Phase 5",title:"Portfolio & Jobs",icon:"🚀",color:"#c792ea",time:"Months 12–18",progress:0,pending:["Streamlit Deployment","Interview Prep","Kaggle Competitions","LinkedIn Optimization","Salary Negotiation"]},
          ].map((ph,i)=>(
            <div key={i} style={{marginBottom:10,background:"#13111a",border:`1px solid ${ph.color}20`,borderRadius:12,overflow:"hidden"}}>
              {/* Phase header */}
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(90deg,${ph.color}08,transparent)`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{ph.icon}</span>
                  <div>
                    <div style={{fontSize:11,color:ph.color,fontFamily:"monospace",marginBottom:2}}>{ph.phase} · {ph.time}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#e2dff0"}}>{ph.title}</div>
                  </div>
                </div>
                <span style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:ph.color+"12",color:ph.color,border:`1px solid ${ph.color}25`,fontFamily:"monospace"}}>{(ph.done||[]).length+(ph.pending||[]).length} lessons</span>
              </div>
              {/* Tasks */}
              <div style={{padding:"10px 16px 14px",display:"flex",flexWrap:"wrap",gap:5}}>
                {[...(ph.done||[]),...(ph.pending||[])].map((s,j)=>(
                  <span key={j} style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:ph.color+"10",color:ph.color,border:`1px solid ${ph.color}20`}}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      label:"📚 Lessons",
      desc:"Interactive lessons with real code, quizzes, and exercises that run Python directly in your browser. No setup needed.",
      preview:(
        <div style={{background:"#0d0c18",borderRadius:12,overflow:"hidden"}}>
          <div style={{background:"#0a0914",padding:"10px 16px",borderBottom:"1px solid #1a1830",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>🐼</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#e2dff0"}}>Pandas: Loading & Exploring Data</div>
              <div style={{fontSize:10,color:"#3a3660",fontFamily:"monospace"}}>Python for DS · Lesson 2 of 5</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:11,background:"#6dd6a015",color:"#6dd6a0",border:"1px solid #6dd6a033",padding:"3px 10px",borderRadius:100}}>✓ Done</span>
          </div>
          <div style={{padding:"16px",fontSize:13,color:"#8b87a8",lineHeight:1.8}}>
            <p style={{marginBottom:12}}>Pandas is the tool you will use <strong style={{color:"#e2dff0"}}>every single day</strong> as a data scientist. It's built on NumPy and adds the DataFrame — a table structure that makes working with real data natural.</p>
            <div style={{background:"#060d18",border:"1px solid #1e2a3a",borderRadius:8,padding:"12px",fontFamily:"monospace",fontSize:12,color:"#e2e8f0",lineHeight:1.8,marginBottom:12}}>
              <div style={{color:"#475569",fontSize:10,marginBottom:8}}>▶ main.py</div>
              <div><span style={{color:"#a78bfa"}}>import</span> <span style={{color:"#7eb8f7"}}>pandas</span> <span style={{color:"#a78bfa"}}>as</span> <span style={{color:"#7eb8f7"}}>pd</span></div>
              <div style={{marginTop:4}}><span style={{color:"#7eb8f7"}}>df</span> = pd.<span style={{color:"#6dd6a0"}}>read_csv</span>(<span style={{color:"#f7c96e"}}>'data.csv'</span>)</div>
              <div style={{marginTop:4}}><span style={{color:"#7b78a0"}}>print</span>(df.<span style={{color:"#6dd6a0"}}>head</span>())</div>
              <div style={{marginTop:4}}><span style={{color:"#7b78a0"}}>print</span>(df.<span style={{color:"#6dd6a0"}}>describe</span>())</div>
            </div>
            <div style={{background:"#6dd6a010",border:"1px solid #6dd6a033",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#6dd6a0"}}>
              ★ df.head() shows the first 5 rows. Always run this first when you load a new dataset.
            </div>
          </div>
        </div>
      )
    },
    {
      label:"🤖 AI Coach",
      desc:"Your personal AI tutor available 24/7. Ask anything about Python, ML, your career — get instant expert answers.",
      preview:(
        <div style={{background:"#0d0c18",borderRadius:12,overflow:"hidden"}}>
          <div style={{background:"#0a0914",padding:"12px 16px",borderBottom:"1px solid #1a1830",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#6dd6a0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#e2dff0"}}>AI Career Coach</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:"#6dd6a0"}}/><span style={{fontSize:10,color:"#6dd6a0"}}>Online 24/7</span></div>
            </div>
          </div>
          <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <div style={{background:"rgba(126,184,247,0.1)",border:"1px solid rgba(126,184,247,0.2)",borderRadius:"14px 4px 14px 14px",padding:"10px 14px",fontSize:13,color:"#e2dff0",maxWidth:"80%"}}>
                What's the difference between overfitting and underfitting?
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#6dd6a0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🤖</div>
              <div style={{background:"#13111a",border:"1px solid #1a1830",borderRadius:"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:"#8b87a8",maxWidth:"80%",lineHeight:1.7}}>
                <strong style={{color:"#e2dff0"}}>Overfitting</strong> = your model memorizes the training data but fails on new data. Like a student who memorizes answers without understanding.<br/><br/>
                <strong style={{color:"#e2dff0"}}>Underfitting</strong> = your model is too simple and can't even learn the training data. The goal is the sweet spot between both 🎯
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      label:"🏅 Leaderboard",
      desc:"See where you stand among all students. Friendly competition keeps you motivated and consistent.",
      preview:(
        <div style={{background:"#0d0c18",borderRadius:12,overflow:"hidden"}}>
          <div style={{background:"#0a0914",padding:"12px 16px",borderBottom:"1px solid #1a1830"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#e2dff0"}}>🏅 Student Leaderboard</div>
          </div>
          <div style={{padding:"12px"}}>
            {[
              {rank:1,name:"Ahmed K.",progress:78,streak:14,color:"#f7c96e",medal:"🥇"},
              {rank:2,name:"Sara M.",progress:65,streak:9,color:"#8b87a8",medal:"🥈"},
              {rank:3,name:"Omar T.",progress:52,streak:6,color:"#cd7f32",medal:"🥉"},
              {rank:4,name:"You",progress:38,streak:3,color:"#8b7cf6",medal:"4"},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,marginBottom:6,background:s.name==="You"?"rgba(139,124,246,0.08)":"transparent",border:s.name==="You"?"1px solid rgba(139,124,246,0.2)":"1px solid transparent"}}>
                <span style={{fontSize:16,width:24,textAlign:"center"}}>{s.medal}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:s.name==="You"?700:500,color:s.name==="You"?"#8b7cf6":"#e2dff0",marginBottom:4}}>{s.name}</div>
                  <div style={{height:4,background:"#1a1830",borderRadius:2}}><div style={{height:"100%",width:`${s.progress}%`,background:s.color,borderRadius:2}}/></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:700,color:s.color}}>{s.progress}%</div>
                  <div style={{fontSize:10,color:"#3a3660"}}>🔥 {s.streak} days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ];

  return(
    <div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setActive(i)}
            style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s",
              background:active===i?"#8b7cf6":"rgba(255,255,255,0.04)",
              color:active===i?"#fff":"#6b6880",
              boxShadow:active===i?"0 4px 16px rgba(139,124,246,0.3)":"none"}}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Description */}
      <p style={{fontSize:14,color:"#6b6880",marginBottom:20,lineHeight:1.7}}>{tabs[active].desc}</p>
      {/* Preview */}
      {tabs[active].preview}
      {/* CTA */}
      <div style={{textAlign:"center",marginTop:24}}>
        <a href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20join%20DS%20Academy!" target="_blank" rel="noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25d366",color:"#fff",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 20px rgba(37,211,102,0.25)"}}>
          💬 Join Now — $29/month
        </a>
      </div>
    </div>
  );
}

// ── LIVE CODE DEMO (landing page)
function LiveCodeDemo(){
  const ex1 = [
    '# Python is like a calculator that remembers',
    'name = "Sara"',
    'salary = 2500',
    'bonus = salary * 0.15',
    '',
    'print("Hello, " + name + "!")',
    'print("Your bonus: " + str(round(bonus, 2)))',
    'print("Total: " + str(salary + bonus))',
  ].join('\n');

  const ex2 = [
    '# Analyze a list of salaries',
    'salaries = [1800, 2400, 3200, 1600, 2900]',
    '',
    'total = sum(salaries)',
    'average = total / len(salaries)',
    'highest = max(salaries)',
    '',
    'print("Team size:", len(salaries))',
    'print("Average salary:", round(average, 0))',
    'print("Highest salary:", highest)',
  ].join('\n');

  const ex3 = [
    'import numpy as np',
    '',
    '# NumPy processes millions of rows instantly',
    'scores = np.array([85, 92, 78, 96, 88, 74, 91, 83])',
    '',
    'print("Average:", round(float(np.mean(scores)), 1))',
    'print("Std dev:", round(float(np.std(scores)), 1))',
    'print("Above 85:", scores[scores > 85])',
    'print("Top score:", np.max(scores), "at index", np.argmax(scores))',
  ].join('\n');

  const ex4 = [
    'import pandas as pd',
    '',
    "data = {",
    "    'name':   ['Ahmed','Sara','Omar','Lara'],",
    "    'score':  [88, 95, 72, 91],",
    "    'passed': [True, True, False, True]",
    "}",
    '',
    'df = pd.DataFrame(data)',
    "print(df[df['passed'] == True][['name','score']])",
    'print("\nAverage score:", round(df["score"].mean(), 1))',
  ].join('\n');

  const exercises=[
    {label:"01 · Variables & Math", code:ex1},
    {label:"02 · Lists & Loops",    code:ex2},
    {label:"03 · NumPy Power",      code:ex3},
    {label:"04 · Pandas Data",      code:ex4},
  ];

  const [active,setActive]=useState(0);
  const [code,setCode]=useState(exercises[0].code);
  const [output,setOutput]=useState(null);
  const [status,setStatus]=useState(null);
  const [loading,setLoading]=useState(false);
  const pyRef=React.useRef(null);

  React.useEffect(()=>{
    setCode(exercises[active].code);
    setOutput(null);
    setStatus(null);
  },[active]);

  const loadPy=async()=>{
    if(pyRef.current)return pyRef.current;
    if(!window._pyodideInstance){
      const py=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"});
      await py.loadPackage(["numpy","pandas"]);
      window._pyodideInstance=py;
    }
    pyRef.current=window._pyodideInstance;
    return pyRef.current;
  };

  const run=async()=>{
    setLoading(true);setOutput(null);setStatus(null);
    try{
      const py=await loadPy();
      let out="";
      py.setStdout({batched:s=>{out+=s+"\n";}});
      py.setStderr({batched:s=>{out+="Error: "+s+"\n";}});
      await py.runPythonAsync(code);
      setOutput(out.trim()||"(no output)");
      setStatus("pass");
    }catch(e){
      setOutput(e.message);
      setStatus("error");
    }
    setLoading(false);
  };

  return(
    <div style={{background:"#0d0c18",border:"1px solid #1a1830",borderRadius:20,overflow:"hidden"}}>
      {/* Header with tabs */}
      <div style={{background:"#0a0914",borderBottom:"1px solid #1a1830",padding:"0 20px",display:"flex",alignItems:"center",gap:0,overflowX:"auto"}}>
        <div style={{display:"flex",gap:6,padding:"12px 0",flex:1}}>
          {exercises.map((ex,i)=>(
            <button key={i} onClick={()=>setActive(i)}
              style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontFamily:"monospace",fontWeight:600,whiteSpace:"nowrap",
                background:active===i?"#8b7cf6":"transparent",
                color:active===i?"#fff":"#3a3660",
                transition:"all 0.2s"}}>
              {ex.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,marginLeft:16,alignItems:"center"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#f28b82"}}/>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#f7c96e"}}/>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#6dd6a0"}}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}} className="code-demo-grid">
        {/* Editor side */}
        <div style={{borderRight:"1px solid #1a1830"}}>
          <div style={{padding:"10px 18px",borderBottom:"1px solid #1a1830",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:"#3a3660",fontFamily:"monospace"}}>main.py</span>
            <button onClick={run} disabled={loading}
              style={{background:"#6dd6a0",color:"#000",border:"none",padding:"6px 16px",borderRadius:7,cursor:loading?"not-allowed":"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:loading?0.7:1}}>
              {loading?<>⏳ Loading Python...</>:<>▶ Run Code</>}
            </button>
          </div>
          <textarea
            value={code}
            onChange={e=>setCode(e.target.value)}
            onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart;setCode(c=>c.substring(0,s)+"    "+c.substring(s));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+4;},0);}}}
            style={{width:"100%",height:260,background:"#060d18",border:"none",padding:"16px 18px",color:"#e2e8f0",fontFamily:"'Fira Code',monospace",fontSize:13,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",whiteSpace:"pre"}}
            spellCheck={false}
          />
        </div>

        {/* Output side */}
        <div>
          <div style={{padding:"10px 18px",borderBottom:"1px solid #1a1830"}}>
            <span style={{fontSize:11,color:"#3a3660",fontFamily:"monospace"}}>output</span>
          </div>
          <div style={{height:260,padding:"16px 18px",background:"#04080f",overflow:"auto"}}>
            {!output&&!loading&&(
              <div style={{color:"#1e1c30",fontFamily:"monospace",fontSize:13,lineHeight:1.8}}>
                <div style={{marginBottom:8}}>// Click "Run Code" to execute</div>
                <div>// Python runs directly in your browser</div>
                <div>// No installation needed</div>
              </div>
            )}
            {loading&&(
              <div style={{color:"#7b78a0",fontFamily:"monospace",fontSize:13}}>
                {output===null&&"⏳ First run loads Python (~5s)..."}
              </div>
            )}
            {output&&(
              <pre style={{margin:0,color:status==="error"?"#f28b82":"#6dd6a0",fontFamily:"'Fira Code',monospace",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{output}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{background:"#0a0914",borderTop:"1px solid #1a1830",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:13,color:"#e2dff0",fontWeight:600,marginBottom:3}}>Every DS Academy lesson works like this.</div>
          <div style={{fontSize:12,color:"#3a3660"}}>Real code. Real output. Real learning. No setup required.</div>
        </div>
        <a href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20tried%20the%20live%20demo%20and%20want%20to%20join%20DS%20Academy!" target="_blank" rel="noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:8,background:"#8b7cf6",color:"#fff",padding:"10px 22px",borderRadius:10,fontSize:14,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 20px rgba(139,124,246,0.3)"}}>
          🔓 Unlock All Lessons →
        </a>
      </div>
      <style>{`.code-demo-grid{grid-template-columns:1fr 1fr}@media(max-width:640px){.code-demo-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

// ── LANDING PAGE (shown to logged-out visitors)
function LoginPage(){
  const [showLogin,setShowLogin]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [openFaq,setOpenFaq]=useState(null);

  const handleLogin=async()=>{
    setError("");
    if(!email.trim()||!password.trim()){setError("Please enter email and password.");return;}
    setLoading(true);
    try{await signInWithEmailAndPassword(auth,email.trim(),password);}
    catch(e){setError("Invalid email or password.");}
    setLoading(false);
  };

  const inp={background:"#0d0c18",border:"1px solid #1e1c35",borderRadius:10,padding:"12px 16px",color:"#e2dff0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"};
  const WA="https://wa.me/96181590474";

  return(
    <div style={{minHeight:"100vh",background:"#0b0a14",color:"#e2dff0",fontFamily:"'Segoe UI',system-ui,sans-serif",overflowX:"hidden"}}>
    <style>{`
      *{box-sizing:border-box;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      .f1{animation:fadeUp 0.6s ease 0.05s both}
      .f2{animation:fadeUp 0.6s ease 0.15s both}
      .f3{animation:fadeUp 0.6s ease 0.25s both}
      .f4{animation:fadeUp 0.6s ease 0.35s both}
      .f5{animation:fadeUp 0.6s ease 0.45s both}
      .card{transition:transform 0.35s cubic-bezier(.16,1,.3,1),border-color 0.35s ease,box-shadow 0.35s ease,background 0.35s ease}
      .card:hover{transform:translateY(-7px) scale(1.015);border-color:rgba(139,124,246,0.4)!important;box-shadow:0 24px 64px rgba(0,0,0,0.5),0 0 0 1px rgba(139,124,246,0.12),0 0 40px rgba(139,124,246,0.06);background:rgba(139,124,246,0.04)!important}
      .card:hover .card-emoji{transform:scale(1.2) translateY(-2px);filter:drop-shadow(0 0 8px rgba(139,124,246,0.5))}
      .card-emoji{transition:transform 0.35s cubic-bezier(.16,1,.3,1),filter 0.35s ease;display:inline-block}
      .phase-card{transition:transform 0.35s cubic-bezier(.16,1,.3,1),border-color 0.35s ease,box-shadow 0.35s ease}
      .phase-card:hover{transform:translateY(-7px) scale(1.015);box-shadow:0 24px 64px rgba(0,0,0,0.5),0 0 0 1px rgba(139,124,246,0.15)}
      .phase-card:hover .card-emoji{transform:scale(1.25) translateY(-3px)}
      .stat-item{transition:transform 0.25s ease,background 0.25s ease}
      .stat-item:hover{background:rgba(139,124,246,0.06)!important;transform:scale(1.05)}
      .nav-a{color:#6b6880;text-decoration:none;font-size:14px;transition:color 0.2s}
      .nav-a:hover{color:#e2dff0}
      .btn-ghost{transition:all 0.25s cubic-bezier(.16,1,.3,1)}
      .btn-ghost:hover{background:rgba(255,255,255,0.08)!important;border-color:rgba(255,255,255,0.2)!important;transform:translateY(-2px)}
      .btn-wa{transition:all 0.25s cubic-bezier(.16,1,.3,1)}
      .btn-wa:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 8px 40px rgba(37,211,102,0.5)!important}
      .btn-purple{transition:all 0.25s cubic-bezier(.16,1,.3,1)}
      .btn-purple:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 8px 40px rgba(139,124,246,0.6)!important}
      .faq-item{transition:border-color 0.25s,transform 0.25s,box-shadow 0.25s}
      .faq-item:hover{transform:translateX(4px);box-shadow:0 4px 24px rgba(0,0,0,0.2)}
      input:focus{border-color:#8b7cf6!important}
      @media(max-width:768px){
        .hide-mob{display:none!important}
        .phases{grid-template-columns:1fr 1fr!important}
        .feats{grid-template-columns:1fr!important}
        .testi{grid-template-columns:1fr!important}
        .price-grid{grid-template-columns:1fr!important}
        .steps{flex-direction:column!important}
        .step-div{border-right:none!important;border-bottom:1px solid rgba(139,124,246,0.07)!important}
      }
      @media(max-width:480px){
        .phases{grid-template-columns:1fr!important}
      }
    `}</style>

    {/* LOGIN MODAL */}
    {showLogin&&(
      <div onClick={e=>{if(e.target===e.currentTarget)setShowLogin(false)}}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}}>
        <div style={{background:"#0f0e1c",border:"1px solid #2a2740",borderRadius:20,padding:"40px",width:380,maxWidth:"92vw",position:"relative",boxShadow:"0 32px 80px rgba(0,0,0,0.5)"}}>
          <div style={{position:"absolute",top:0,left:"25%",right:"25%",height:1,background:"linear-gradient(90deg,transparent,#8b7cf6,transparent)"}}/>
          <button onClick={()=>setShowLogin(false)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#4a4665",cursor:"pointer",fontSize:20,lineHeight:1,padding:4}}>×</button>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:32,marginBottom:10,display:"inline-block",animation:"float 3s ease-in-out infinite"}}>🎓</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4,letterSpacing:"-0.02em"}}>Welcome back</div>
            <div style={{fontSize:13,color:"#6b6880"}}>Sign in to your DS Academy account</div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"#6b6880",marginBottom:6,letterSpacing:"0.08em",fontFamily:"monospace"}}>EMAIL</div>
            <input style={inp} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="your@email.com"/>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:11,color:"#6b6880",marginBottom:6,letterSpacing:"0.08em",fontFamily:"monospace"}}>PASSWORD</div>
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••"/>
          </div>
          {error&&<div style={{fontSize:13,color:"#f28b82",marginBottom:16,background:"rgba(242,139,130,0.07)",border:"1px solid rgba(242,139,130,0.2)",padding:"10px 14px",borderRadius:8}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} className="btn-purple"
            style={{width:"100%",padding:"13px",background:"#8b7cf6",border:"none",color:"#fff",borderRadius:10,cursor:"pointer",fontSize:15,fontWeight:700,opacity:loading?0.7:1,boxShadow:"0 4px 20px rgba(139,124,246,0.3)"}}>
            {loading?"Signing in...":"Sign In →"}
          </button>
          <div style={{marginTop:16,fontSize:12,color:"#2a2740",textAlign:"center"}}>No account? Message Radwan on WhatsApp.</div>
        </div>
      </div>
    )}

    {/* ── NAV */}
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",background:"rgba(11,10,20,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 8px rgba(139,124,246,0.8)"}}/>
        <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em"}}>DS Academy</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:32}} className="hide-mob">
        <a href="#curriculum" className="nav-a">Curriculum</a>
        <a href="#pricing" className="nav-a">Pricing</a>
        <a href="#faq" className="nav-a">FAQ</a>
        <a href={WA} target="_blank" rel="noreferrer" style={{fontSize:14,color:"#25d366",textDecoration:"none",fontWeight:600}}>💬 WhatsApp</a>
      </div>
      <button onClick={()=>setShowLogin(true)} className="btn-purple"
        style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(139,124,246,0.25)"}}>
        Login →
      </button>
    </nav>

    {/* ── HERO */}
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"100px 24px 40px",position:"relative",overflow:"hidden"}}>
      {/* subtle radial */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(139,124,246,0.1),transparent)",pointerEvents:"none"}}/>
      {/* fine grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(139,124,246,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(139,124,246,0.035) 1px,transparent 1px)",backgroundSize:"72px 72px",WebkitMaskImage:"radial-gradient(ellipse 70% 60% at 50% 0%,black,transparent)",maskImage:"radial-gradient(ellipse 70% 60% at 50% 0%,black,transparent)",pointerEvents:"none"}}/>

      <div style={{position:"relative",maxWidth:760}}>
        {/* badge */}
        <div className="f1" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(247,201,110,0.06)",border:"1px solid rgba(247,201,110,0.2)",borderRadius:100,padding:"6px 16px",fontSize:11,color:"#f7c96e",letterSpacing:"0.08em",marginBottom:32,fontFamily:"monospace"}}>
          <div style={{width:5,height:5,background:"#f7c96e",borderRadius:"50%",animation:"pulse 1.5s infinite",boxShadow:"0 0 6px #f7c96e"}}/>
          🔥 COHORT 2 — MAY 1ST — 4 SPOTS LEFT
        </div>

        {/* headline */}
        <h1 className="f2" style={{fontWeight:800,fontSize:"clamp(44px,7vw,76px)",lineHeight:1.02,letterSpacing:"-0.04em",marginBottom:22}}>
          From Zero<br/>
          <span style={{background:"linear-gradient(135deg,#a78bfa,#f472b6 50%,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            to Data Scientist
          </span>
        </h1>

        {/* sub */}
        <p className="f3" style={{fontSize:18,color:"#6b6880",lineHeight:1.75,marginBottom:40,maxWidth:520,margin:"0 auto 40px"}}>
          A structured, hands-on platform that takes you from <strong style={{color:"#c4c0e0",fontWeight:600}}>complete beginner</strong> to job-ready. Built for Lebanon & MENA.
        </p>

        {/* CTAs */}
        <div className="f4" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:56}}>
          <a href={WA+"?text=Hi%20Radwan!%20I%27m%20interested%20in%20joining%20DS%20Academy!"} target="_blank" rel="noreferrer" className="btn-wa"
            style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25d366",color:"#fff",padding:"13px 28px",borderRadius:10,fontSize:15,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 24px rgba(37,211,102,0.25)"}}>
            💬 Join on WhatsApp
          </a>
          <a href="#curriculum" className="btn-ghost"
            style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.03)",color:"#8b87a8",border:"1px solid rgba(255,255,255,0.08)",padding:"13px 24px",borderRadius:10,fontSize:15,textDecoration:"none"}}>
            See curriculum ↓
          </a>
        </div>

        {/* stats */}
        <div className="f5" style={{display:"inline-flex",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,overflow:"hidden",background:"rgba(255,255,255,0.02)"}}>
          {[{n:"18+",l:"Lessons"},{n:"11",l:"Real Projects"},{n:"100+",l:"Jobs Analyzed"},{n:"$29",l:"/ Month"},{n:"0→Job",l:"The Goal"}].map((s,i)=>(
            <div key={i} style={{padding:"16px 26px",textAlign:"center",borderRight:i<4?"1px solid rgba(255,255,255,0.05)":"none",transition:"background 0.2s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,124,246,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{fontWeight:800,fontSize:20,color:"#e2dff0",letterSpacing:"-0.02em"}}>{s.n}</div>
              <div style={{fontSize:10,color:"#2e2c45",letterSpacing:"0.08em",marginTop:3,fontFamily:"monospace"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS STRIP */}
    <div style={{background:"linear-gradient(180deg,#0b0a14,#0c0b16)"}}>
      <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"stretch"}} className="steps">
        {[
          {n:"01",icon:"💬",title:"Message on WhatsApp",desc:"Tell us your background and which plan you want"},
          {n:"02",icon:"💳",title:"Pay & Get Access",desc:"OMT, Western Union, or cash — account ready in 24h"},
          {n:"03",icon:"🚀",title:"Start Learning",desc:"Follow the roadmap, message Radwan when stuck"},
        ].map((s,i)=>(
          <div key={i} className="step-div" style={{flex:1,padding:"28px 24px",display:"flex",alignItems:"center",gap:14,borderRight:i<2?"1px solid rgba(255,255,255,0.04)":"none"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(139,124,246,0.07)",border:"1px solid rgba(139,124,246,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#8b7cf6",marginBottom:3,letterSpacing:"0.1em"}}>{s.n}</div>
              <div style={{fontWeight:700,fontSize:13,color:"#e2dff0",marginBottom:2}}>{s.title}</div>
              <div style={{fontSize:12,color:"#3a3660",lineHeight:1.5}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── CURRICULUM */}
    <section id="curriculum" style={{padding:"64px 24px",background:"#0b0a14"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// 5 phases · 18 months</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em",marginBottom:10}}>A clear path. No guessing.</h2>
          <p style={{color:"#6b6880",fontSize:16,maxWidth:460,margin:"0 auto",lineHeight:1.7}}>Every phase builds on the last. No tutorial hell — just what employers hire for.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}} className="phases">
          {[
            {n:"01",icon:"🐍",title:"Python & Data",skills:["Python","Pandas","SQL","NumPy","Stats"],color:"#7eb8f7",time:"Months 1–2"},
            {n:"02",icon:"🤖",title:"Machine Learning",skills:["sklearn","Random Forest","Linear Models","Eval"],color:"#a78bfa",time:"Months 2–4"},
            {n:"03",icon:"📊",title:"Advanced ML",skills:["XGBoost","SHAP","Feature Eng","Pipelines"],color:"#6dd6a0",time:"Months 3–7"},
            {n:"04",icon:"🧠",title:"Deep Learning",skills:["Neural Nets","NLP","Transformers","RAG"],color:"#f7c96e",time:"Months 7–12"},
            {n:"05",icon:"🚀",title:"Portfolio & Jobs",skills:["Projects","Interview Prep","LinkedIn","Kaggle"],color:"#c792ea",time:"Months 12–18"},
          ].map((p,i)=>(
            <div key={i} className="card" style={{background:"#0f0e1c",border:"1px solid #1a1830",borderRadius:16,padding:"24px 18px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${p.color}88,${p.color}22)`}}/>
              <div style={{fontFamily:"monospace",fontSize:9,color:p.color+"99",marginBottom:12,letterSpacing:"0.1em"}}>{p.n} · {p.time}</div>
              <div className="card-emoji" style={{fontSize:30,marginBottom:14}}>{p.icon}</div>
              <div style={{fontWeight:700,fontSize:14,color:"#e2dff0",marginBottom:12,lineHeight:1.3}}>{p.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {p.skills.map(s=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#6b6880"}}>
                    <div style={{width:3,height:3,borderRadius:"50%",background:p.color+"88",flexShrink:0}}/>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:32,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",background:"#0d0c18",border:"1px solid #1a1830",borderRadius:12,flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:13,color:"#3a3660"}}>Prepares you for →</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{t:"Data Scientist",c:"#a78bfa"},{t:"Data Analyst",c:"#7eb8f7"},{t:"ML Engineer",c:"#6dd6a0"},{t:"Python Developer",c:"#f7c96e"}].map((j,i)=>(
              <span key={i} style={{fontSize:12,padding:"5px 14px",borderRadius:100,background:j.c+"0f",color:j.c,border:`1px solid ${j.c}22`,fontWeight:500}}>{j.t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── FEATURES */}
    <section style={{padding:"64px 24px",background:"#0c0b16"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// platform</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em",marginBottom:10}}>Built differently.</h2>
          <p style={{color:"#6b6880",fontSize:16,maxWidth:460,margin:"0 auto",lineHeight:1.7}}>No passive videos. No random tutorials. Everything connected and designed to get you hired.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}} className="feats">
          {[
            {icon:"📚",title:"Interactive Lessons",desc:"Code examples, quizzes, and explanations — all inside the platform. No jumping to YouTube.",color:"#7eb8f7"},
            {icon:"🗺️",title:"Connected Roadmap",desc:"Complete a lesson and your roadmap updates automatically. Everything is linked.",color:"#a78bfa"},
            {icon:"🔥",title:"Streak Tracking",desc:"Daily streaks and weekly check-ins keep you consistent when motivation dips.",color:"#f7c96e"},
            {icon:"🚀",title:"11 Real Projects",desc:"Portfolio projects with real datasets. Deploy them live and share in interviews.",color:"#6dd6a0"},
            {icon:"🤖",title:"AI Career Coach",desc:"Ask anything 24/7. Python help, ML theory, code review, career advice. Never get stuck.",color:"#c792ea"},
            {icon:"💬",title:"Direct Instructor Access",desc:"WhatsApp Radwan directly. Small cohorts mean real guidance — not ticket numbers.",color:"#f472b6"},
          ].map((f,i)=>(
            <div key={i} className="card" style={{background:"#0b0a14",border:"1px solid #1a1830",borderRadius:14,padding:"26px 22px"}}>
              <div className="card-emoji" style={{fontSize:24,marginBottom:14}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:15,color:"#e2dff0",marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:"#6b6880",lineHeight:1.75}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── PLATFORM PREVIEW */}
    <section style={{padding:"72px 24px",background:"#0c0b16"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// inside the platform</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em",marginBottom:14}}>See exactly what you're getting.</h2>
          <p style={{color:"#6b6880",fontSize:16,maxWidth:480,margin:"0 auto",lineHeight:1.7}}>No surprises. Here's what the platform looks like from the inside.</p>
        </div>

        {/* Tab switcher */}
        <PlatformPreview/>
      </div>
    </section>

    {/* ── AI JOB CALCULATOR */}
    <div style={{background:"linear-gradient(180deg,#0c0b16,#0b0a14)"}}><AIJobCalculator/></div>

    {/* ── LIVE CODE DEMO */}
    <section style={{padding:"72px 24px",background:"#0b0a14"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// try it yourself</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em",marginBottom:14}}>Write real Python. Right now.</h2>
          <p style={{color:"#6b6880",fontSize:16,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Every lesson has a live coding exercise. No setup, no installation. Python runs in your browser.</p>
        </div>
        <LiveCodeDemo/>
      </div>
    </section>

    {/* ── TESTIMONIALS */}
    <section style={{padding:"64px 24px",background:"#0c0b16"}}>
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// students</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em"}}>Why they joined.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}} className="testi">
          {[
            {quote:"I tried YouTube tutorials before and always got lost after week 2. Here there's a real path — you know exactly what's next. 2 weeks in and I actually understand what I'm doing.",name:"Ahmed K.",role:"Accountant → learning DS",color:"#a78bfa"},
            {quote:"I scored 78% risk on the AI calculator lol. I messaged Radwan the same day. The roadmap makes sense — it's not random topics thrown together like every other course.",name:"Sara M.",role:"Fresh graduate",color:"#6dd6a0"},
            {quote:"I spent more than $29 on a Udemy course I never finished. At least here someone actually checks on you. First week was hard but Radwan helped me get unstuck fast.",name:"Omar T.",role:"Marketing manager → learning DS",color:"#f7c96e"},
          ].map((t,i)=>(
            <div key={i} className="card" style={{background:"#0b0a14",border:"1px solid #1a1830",borderRadius:14,padding:"26px 22px",position:"relative"}}>
              <div style={{fontSize:36,color:t.color,opacity:0.15,fontFamily:"Georgia,serif",lineHeight:1,marginBottom:12}}>"</div>
              <p style={{fontSize:13,color:"#8b87a8",lineHeight:1.85,marginBottom:20,fontStyle:"italic"}}>{t.quote}</p>
              <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:16,borderTop:"1px solid #1a1830"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:t.color+"15",border:`1px solid ${t.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t.color,flexShrink:0}}>{t.name[0]}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2dff0"}}>{t.name}</div>
                  <div style={{fontSize:11,color:"#3a3660",marginTop:2}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#1e1c30",fontFamily:"monospace"}}>* Placeholder quotes — real student testimonials coming soon</div>
      </div>
    </section>

    {/* ── PRICING */}
    <section id="pricing" style={{padding:"64px 24px",background:"#0b0a14"}}>
      <div style={{maxWidth:740,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// pricing</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em",marginBottom:10}}>Simple pricing.</h2>
          <p style={{color:"#6b6880",fontSize:16,maxWidth:380,margin:"0 auto",lineHeight:1.7}}>Pay via OMT, Western Union, or cash. Account activated in 24h.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="price-grid">
          <div className="card" style={{background:"#0f0e1c",border:"1px solid #1a1830",borderRadius:18,padding:"32px 26px"}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:"#7eb8f7",letterSpacing:"0.12em",marginBottom:20}}>FULL ACCESS</div>
            <div style={{marginBottom:6}}><span style={{fontWeight:800,fontSize:48,color:"#e2dff0",letterSpacing:"-0.03em"}}>$29</span><span style={{fontSize:14,color:"#3a3660",marginLeft:4}}>/month</span></div>
            <div style={{fontSize:13,color:"#3a3660",marginBottom:28,lineHeight:1.6}}>Full platform. Cancel anytime.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
              {["All 18+ lessons","11 real projects","AI Career Coach 24/7","Progress tracking","Instructor messaging","All future updates"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#c4c0e0"}}>
                  <span style={{color:"#6dd6a0",fontSize:11,fontWeight:700}}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href={WA+"?text=Hi%20Radwan!%20I%27m%20interested%20in%20DS%20Academy%20Full%20Access%20($29%2Fmonth).%20How%20do%20I%20enroll%3F"} target="_blank" rel="noreferrer" className="btn-ghost"
              style={{display:"block",textAlign:"center",background:"rgba(255,255,255,0.04)",color:"#e2dff0",border:"1px solid rgba(255,255,255,0.08)",padding:"13px",borderRadius:10,fontSize:14,fontWeight:600,textDecoration:"none"}}>
              💬 Enroll via WhatsApp
            </a>
          </div>
          <div className="card" style={{background:"#0f0e1c",border:"1px solid rgba(139,124,246,0.25)",borderRadius:18,padding:"32px 26px",position:"relative",boxShadow:"0 0 40px rgba(139,124,246,0.07)"}}>
            <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,#8b7cf6,transparent)"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:"#a78bfa",letterSpacing:"0.12em"}}>GUIDED COHORT</div>
              <span style={{fontSize:10,fontFamily:"monospace",padding:"3px 10px",borderRadius:100,background:"rgba(247,201,110,0.08)",color:"#f7c96e",border:"1px solid rgba(247,201,110,0.2)"}}>BEST VALUE</span>
            </div>
            <div style={{marginBottom:6}}><span style={{fontWeight:800,fontSize:48,color:"#e2dff0",letterSpacing:"-0.03em"}}>$99</span><span style={{fontSize:14,color:"#3a3660",marginLeft:4}}>one-time</span></div>
            <div style={{fontSize:13,color:"#3a3660",marginBottom:28,lineHeight:1.6}}>Live sessions + mentorship. Max 10 students.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
              {["Everything in Full Access","Weekly live sessions","1-on-1 coaching call","CV & LinkedIn review","Job application support","Private WhatsApp group"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#c4c0e0"}}>
                  <span style={{color:"#8b7cf6",fontSize:11,fontWeight:700}}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href={WA+"?text=Hi%20Radwan!%20I%27m%20interested%20in%20the%20DS%20Academy%20Guided%20Cohort%20($99).%20How%20do%20I%20enroll%3F"} target="_blank" rel="noreferrer" className="btn-purple"
              style={{display:"block",textAlign:"center",background:"#8b7cf6",color:"#fff",padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 20px rgba(139,124,246,0.25)"}}>
              💬 Apply via WhatsApp
            </a>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:"#1e1c30",fontFamily:"monospace"}}>
          💬 All enrollments via WhatsApp · OMT, Western Union or cash · Account in 24h
        </div>
      </div>
    </section>

    {/* ── FAQ */}
    <section id="faq" style={{padding:"64px 24px",background:"#0c0b16"}}>
      <div style={{maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// faq</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-0.03em"}}>Common questions.</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {q:"Do I need coding experience?",a:"Zero. We start with Python from absolute scratch. If you can use WhatsApp, you can start. Every concept is explained with analogies before any code."},
            {q:"How does payment work in Lebanon?",a:"Message on WhatsApp, agree on a plan, pay via OMT, Western Union, or cash. Account activated within 24 hours. No credit card needed."},
            {q:"What if I get stuck?",a:"Message Radwan directly. Small cohorts mean a real response — not a ticket number. Most questions answered the same day."},
            {q:"How is this different from YouTube or Udemy?",a:"YouTube is random. Udemy is isolated courses. DS Academy is a connected path — lessons link to your roadmap, projects build your portfolio, a real person checks on you."},
            {q:"Can I cancel anytime?",a:"Yes. The $29/month plan cancels with one WhatsApp message. No contracts, no forms, no hidden fees."},
          ].map((item,i)=>(
            <div key={i} className="faq-item card" style={{background:"#0b0a14",border:"1px solid",borderColor:openFaq===i?"rgba(139,124,246,0.2)":"#1a1830",borderRadius:12,overflow:"hidden"}}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                style={{width:"100%",padding:"18px 20px",background:"none",border:"none",color:"#e2dff0",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,textAlign:"left"}}>
                <span style={{fontSize:14,fontWeight:600,lineHeight:1.3}}>{item.q}</span>
                <span style={{color:openFaq===i?"#8b7cf6":"#3a3660",fontSize:20,flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:openFaq===i?"rotate(45deg)":"none",lineHeight:1}}>+</span>
              </button>
              {openFaq===i&&(
                <div style={{padding:"0 20px 18px",fontSize:13,color:"#6b6880",lineHeight:1.85,borderTop:"1px solid #1a1830",paddingTop:14}}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── FINAL CTA */}
    <section style={{padding:"80px 24px",background:"linear-gradient(180deg,#0c0b16,#0b0a14)",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 60% at 50% 100%,rgba(139,124,246,0.07),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative",maxWidth:560,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#f7c96e",letterSpacing:"0.12em",marginBottom:20}}>// cohort 2 · may 1st · 4 spots left</div>
        <h2 style={{fontWeight:800,fontSize:"clamp(36px,5vw,60px)",letterSpacing:"-0.04em",marginBottom:16,lineHeight:1.05}}>
          Start your DS journey<br/>
          <span style={{background:"linear-gradient(135deg,#a78bfa,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>today.</span>
        </h2>
        <p style={{color:"#6b6880",fontSize:16,marginBottom:40,lineHeight:1.7,maxWidth:400,margin:"0 auto 40px"}}>One WhatsApp message is all it takes.</p>
        <a href={WA+"?text=Hi%20Radwan!%20I%27m%20ready%20to%20join%20DS%20Academy.%20What%20are%20the%20next%20steps%3F"} target="_blank" rel="noreferrer" className="btn-wa"
          style={{display:"inline-flex",alignItems:"center",gap:10,background:"#25d366",color:"#fff",padding:"16px 36px",borderRadius:12,fontSize:16,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 28px rgba(37,211,102,0.25)",marginBottom:16}}>
          <span style={{fontSize:22}}>💬</span> Message Radwan on WhatsApp
        </a>
        <div style={{fontSize:12,color:"#1e1c30",fontFamily:"monospace",marginTop:14}}>Usually replies within 1 hour</div>
      </div>
    </section>

    {/* ── FOOTER */}
    <footer style={{background:"#0d0c18",borderTop:"1px solid #14132a"}}>
      {/* Main footer content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"56px 40px 40px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,flexWrap:"wrap"}}>

        {/* Brand column */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
            <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 8px rgba(139,124,246,0.7)"}}/>
            <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em"}}>DS Academy</span>
          </div>
          <p style={{fontSize:13,color:"#5a5475",lineHeight:1.8,marginBottom:20,maxWidth:260}}>
            A structured, practical path from zero to job-ready Data Scientist. No tutorial hell — just what employers actually hire for.
          </p>
          <div style={{fontFamily:"monospace",fontSize:10,color:"#3a3660",marginBottom:20}}>Zero → Competitive Candidate</div>
          {/* Social/contact */}
          <div style={{display:"flex",gap:10}}>
            <a href={WA} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(37,211,102,0.07)",border:"1px solid rgba(37,211,102,0.15)",color:"#25d366",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
              💬 WhatsApp
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(126,184,247,0.07)",border:"1px solid rgba(126,184,247,0.15)",color:"#7eb8f7",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
              in LinkedIn
            </a>
          </div>
        </div>

        {/* Platform links */}
        <div>
          <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:20}}>PLATFORM</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {label:"Curriculum",href:"#curriculum"},
              {label:"Pricing",href:"#pricing"},
              {label:"FAQ",href:"#faq"},
              {label:"AI Job Calculator",href:"#"},
              {label:"Student Login",href:"#",onClick:true},
            ].map((l,i)=>(
              l.onClick
                ? <button key={i} onClick={()=>setShowLogin(true)} style={{background:"none",border:"none",color:"#5a5475",fontSize:13,cursor:"pointer",textAlign:"left",padding:0,transition:"color 0.2s"}}
                    onMouseEnter={e=>e.target.style.color="#e2dff0"} onMouseLeave={e=>e.target.style.color="#3a3660"}>
                    {l.label}
                  </button>
                : <a key={i} href={l.href} style={{color:"#5a5475",fontSize:13,textDecoration:"none",transition:"color 0.2s"}}
                    onMouseEnter={e=>e.target.style.color="#e2dff0"} onMouseLeave={e=>e.target.style.color="#3a3660"}>
                    {l.label}
                  </a>
            ))}
          </div>
        </div>

        {/* Curriculum links */}
        <div>
          <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:20}}>CURRICULUM</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {["Python & Data Tools","Machine Learning","Advanced ML","Deep Learning & LLMs","Portfolio & Jobs"].map((l,i)=>(
              <span key={i} style={{color:"#5a5475",fontSize:13}}>→ {l}</span>
            ))}
          </div>
        </div>

        {/* Built by */}
        <div>
          <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:20}}>BUILT BY</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#f472b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👨‍💻</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#e2dff0"}}>Radwan</div>
              <div style={{fontSize:11,color:"#5a5475"}}>Researcher → Data Scientist</div>
            </div>
          </div>
          <p style={{fontSize:13,color:"#6b6880",lineHeight:1.7,marginBottom:16}}>
            I built DS Academy because I couldn't find a structured path that actually prepares you for the job market.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:12,color:"#3a3660",fontFamily:"monospace"}}>📍 Beirut, Lebanon</div>
            <div style={{fontSize:12,color:"#3a3660",fontFamily:"monospace"}}>⚡ Usually replies in 1 hour</div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{borderTop:"1px solid #14132a",padding:"18px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:11,color:"#3a3660",fontFamily:"monospace"}}>© 2025 DS Academy · Built with ❤️ in Lebanon 🇱🇧</div>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#3a3660",fontFamily:"monospace"}}>zerotods.netlify.app</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:5,height:5,background:"#6dd6a0",borderRadius:"50%",boxShadow:"0 0 4px #6dd6a0"}}/>
            <span style={{fontSize:11,color:"#3a3660",fontFamily:"monospace"}}>All systems live</span>
          </div>
        </div>
      </div>
    </footer>

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
  const [managingStudent,setManagingStudent]=useState(null);
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
const unlockPhase=async(studentId,phaseIndex)=>{
  const studentRef=doc(db,"users",studentId);
  const snap=await getDoc(studentRef);
  if(!snap.exists())return;
  const current=snap.data().unlockedPhases||[0];
  if(current.includes(phaseIndex))return;
  await updateDoc(studentRef,{unlockedPhases:[...current,phaseIndex]});
};
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
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {[1,2,3,4].map(pi=>{
                        const sub=(u.projectSubmissions||{})[pi-1];
                        if(sub&&sub.status==="pending") return(
                          <div key={pi} style={{background:T.gold+"15",border:`1px solid ${T.gold}44`,borderRadius:7,padding:"5px 10px",fontSize:10,display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{color:T.gold}}>⏳ Phase {pi+1} pending</span>
                            <button onClick={()=>unlockPhase(u.id,pi)} style={{background:T.good+"25",border:`1px solid ${T.good}55`,color:T.good,padding:"2px 8px",borderRadius:4,cursor:"pointer",fontSize:10,fontWeight:600}}>✓ Approve</button>
                            {sub.link&&<a href={sub.link} target="_blank" rel="noreferrer" style={{color:T.info,fontSize:10}}>view →</a>}
                          </div>
                        );
                        return null;
                      })}
                      <button onClick={()=>setManagingStudent(u)} style={{background:T.p1+"18",border:`1px solid ${T.p1}44`,color:T.p1,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Manage</button>
                      <button onClick={()=>removeUser(u.id)} style={{background:T.warn+"15",border:`1px solid ${T.warn}44`,color:T.warn,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MANAGE STUDENT MODAL */}
        {managingStudent&&(
          <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:"28px",width:420,maxWidth:"90vw"}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Manage — {managingStudent.username}</div>
              <div style={{fontSize:11,color:T.textFade,marginBottom:20}}>{managingStudent.email}</div>
              <div style={{fontSize:11,color:T.textDim,marginBottom:12,letterSpacing:"0.1em"}}>UNLOCK PHASES</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {roadmap.map((ph,i)=>{
                  const unlocked=(managingStudent.unlockedPhases||[0]).includes(i);
                  return(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:T.bgDeep,borderRadius:8,border:`1px solid ${unlocked?ph.color+"44":T.border}`}}>
                      <span style={{fontSize:12,color:unlocked?ph.color:T.textDim}}>{unlocked?"✓":""} {ph.title}</span>
                      {unlocked?(
                        <span style={{fontSize:10,color:T.good,fontFamily:"monospace"}}>Unlocked</span>
                      ):(
                        <button onClick={async()=>{
                          await unlockPhase(managingStudent.id,i);
                          setManagingStudent(s=>({...s,unlockedPhases:[...(s.unlockedPhases||[0]),i]}));
                        }} style={{background:ph.color+"18",border:`1px solid ${ph.color}44`,color:ph.color,padding:"4px 12px",borderRadius:5,cursor:"pointer",fontSize:11,fontWeight:600}}>
                          Unlock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>setManagingStudent(null)} style={{width:"100%",padding:"10px",background:"none",border:`1px solid ${T.border}`,color:T.textDim,borderRadius:8,cursor:"pointer",fontSize:13}}>Close</button>
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
                  <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:10,height:10,borderRadius:"50%",background:ph.color}}/><span style={{fontSize:15,fontWeight:600,color:ph.color}}>Phase {ph.phase} — {ph.title}</span></div>
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

// ── AI COACH CHATBOT
function AIChatbot({userDoc}){
  const [messages,setMessages]=useState([
    {role:"assistant",content:"👋 Hi "+( userDoc?.username||"there")+"! I'm your DS Academy AI Coach. Ask me anything about Data Science, Python, SQL, Machine Learning, or your career path. I'm here 24/7!"}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const messagesEndRef=React.useRef(null);

  const scrollToBottom=()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});};
  React.useEffect(()=>{scrollToBottom();},[messages]);

  const sendMessage=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    const newMessages=[...messages,userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try{
      const key=(typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_DS_AI_TOKEN) ? import.meta.env.VITE_DS_AI_TOKEN : "";
      const res=await fetch("https://api.deepseek.com/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body:JSON.stringify({
          model:"deepseek-chat",
          messages:[
            {role:"system",content:`You are an expert Data Science tutor and career coach for DS Academy, an online platform teaching Data Science to students in Lebanon and the MENA region. The student's name is ${userDoc?.username||"the student"}. Be encouraging, concise, and practical. Focus on Python, SQL, Machine Learning, Statistics, and career advice. Keep responses under 200 words. Use simple language since some students are beginners.`},
            ...newMessages.map(m=>({role:m.role,content:m.content}))
          ],
          max_tokens:400
        })
      });
      const data=await res.json();
      const reply=data.choices[0].message.content;
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:"Sorry, I'm having trouble connecting right now. Try again in a moment!"}]);
    }
    setLoading(false);
  };

  const suggestions=["Explain Python lists vs dictionaries","What is overfitting?","How do I start with SQL?","What jobs can I get after DS Academy?","Explain gradient descent simply"];

  return(
    <div style={{maxWidth:760,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#6dd6a0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>AI Career Coach</div>
          <div style={{fontSize:11,color:T.good,display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:T.good}}/> Online 24/7 · Powered by DeepSeek AI</div>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:12}}>
        <div style={{height:420,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:m.role==="user"?T.p1+"33":"linear-gradient(135deg,#8b7cf6,#6dd6a0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                {m.role==="user"?(userDoc?.username?.[0]?.toUpperCase()||"U"):"🤖"}
              </div>
              <div style={{maxWidth:"80%",background:m.role==="user"?T.p1+"18":T.bgDeep,border:`1px solid ${m.role==="user"?T.p1+"33":T.border}`,borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#6dd6a0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
              <div style={{background:T.bgDeep,border:`1px solid ${T.border}`,borderRadius:"4px 14px 14px 14px",padding:"10px 14px"}}>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.p4,animation:`bounce 1s infinite ${i*0.2}s`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Suggestions */}
        {messages.length<=1&&(
          <div style={{padding:"0 16px 16px",display:"flex",flexWrap:"wrap",gap:8}}>
            {suggestions.map((s,i)=>(
              <button key={i} onClick={()=>setInput(s)} style={{background:T.bgDeep,border:`1px solid ${T.borderHi}`,color:T.textDim,padding:"6px 12px",borderRadius:100,cursor:"pointer",fontSize:11,transition:"all 0.2s"}}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{display:"flex",gap:10}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
          placeholder="Ask anything about Data Science, Python, ML, career..."
          style={{flex:1,background:T.bgCard,border:`1px solid ${T.borderHi}`,borderRadius:10,padding:"12px 16px",color:T.text,fontSize:13,outline:"none"}}
        />
        <button onClick={sendMessage} disabled={loading||!input.trim()} style={{background:T.p4,border:"none",color:"#fff",padding:"12px 20px",borderRadius:10,cursor:"pointer",fontSize:15,fontWeight:600,opacity:loading||!input.trim()?0.5:1}}>
          {loading?"...":"Send"}
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
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
  const [unlockedPhases,setUnlockedPhases]=useState(userDoc.unlockedPhases||[0]);
  const [showProjectModal,setShowProjectModal]=useState(false);
  const [projectPhaseIdx,setProjectPhaseIdx]=useState(null);
  const [projectSubmission,setProjectSubmission]=useState({link:"",notes:""});
  const [projectSubmitted,setProjectSubmitted]=useState(userDoc.projectSubmissions||{});

  const onLessonComplete = (lessonId) => {
    const mapping = LESSON_COMPLETES_TASK[lessonId];
    if(!mapping) return;
    const key = `${mapping.section}-${mapping.task}`;
    if(!progress[key]) saveProgress({...progress,[key]:true});
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

  const isPhaseUnlocked=(idx)=>unlockedPhases.includes(idx);

  const isPhaseComplete=(idx)=>{
    const ph=roadmap[idx];
    if(!ph) return false;
    const pp=getPP(ph);
    return pp.pct===100;
  };

  const submitProject=async()=>{
    if(!projectSubmission.link.trim()&&!projectSubmission.notes.trim()) return;
    const newSubs={...projectSubmitted,[projectPhaseIdx]:{...projectSubmission,date:new Date().toISOString(),status:"pending"}};
    setProjectSubmitted(newSubs);
    await updateDoc(doc(db,"users",currentUser.uid),{projectSubmissions:newSubs});
    setShowProjectModal(false);
    setProjectSubmission({link:"",notes:""});
  };
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
    {id:"ai",label:"🤖 AI Coach"},
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
              {roadmap.map((ph,i)=>{const p2=getPP(ph);const a=i===activePhase;const locked=!isPhaseUnlocked(i);return(
                <button key={i} onClick={()=>{if(!locked){setActivePhase(i);setExpandedSection(null);}}} style={{width:"100%",background:a?ph.color+"15":locked?"#0f0e1a":"transparent",border:`1px solid ${a?ph.color+"55":locked?T.border:"transparent"}`,color:locked?T.textFade:a?ph.color:T.textDim,padding:"8px 12px",borderRadius:7,cursor:locked?"not-allowed":"pointer",fontSize:11,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,textAlign:"left",opacity:locked?0.5:1}}>
                  <span>{locked?"🔒 ":""}{ph.title}</span>
                  <span style={{fontSize:10,background:ph.color+"18",color:ph.color,padding:"1px 5px",borderRadius:3}}>{locked?"locked":p2.pct+"%"}</span>
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
              {!isPhaseUnlocked(activePhase)?(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",textAlign:"center",padding:40}}>
                  <div style={{fontSize:48,marginBottom:16}}>🔒</div>
                  <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>{phase.title} is Locked</div>
                  <div style={{fontSize:13,color:T.textDim,maxWidth:380,lineHeight:1.7,marginBottom:24}}>
                    Complete all tasks in the previous phase and submit your project to unlock this phase.
                  </div>
                  {activePhase>0&&isPhaseComplete(activePhase-1)&&(
                    projectSubmitted[activePhase-1]?.status==="pending"?(
                      <div style={{background:T.gold+"15",border:`1px solid ${T.gold}44`,borderRadius:10,padding:"14px 20px",color:T.gold,fontSize:13}}>
                        ⏳ Project submitted — waiting for instructor approval
                      </div>
                    ):(
                      <button onClick={()=>{setProjectPhaseIdx(activePhase-1);setShowProjectModal(true);}} style={{background:C,color:"#000",border:"none",padding:"12px 28px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>
                        Submit Phase {activePhase} Project to Unlock →
                      </button>
                    )
                  )}
                  {activePhase>0&&!isPhaseComplete(activePhase-1)&&(
                    <div style={{background:T.warn+"15",border:`1px solid ${T.warn}44`,borderRadius:10,padding:"14px 20px",color:T.warn,fontSize:13}}>
                      ⚠ Finish Phase {activePhase} (100%) first
                    </div>
                  )}
                </div>
              ):(
                <div>
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
              )}
            </div>
          </div>
        )}

        {/* PROJECT SUBMISSION MODAL */}
        {showProjectModal&&(
          <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:"32px",width:480,maxWidth:"90vw"}}>
              <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>🚀 Submit Phase {projectPhaseIdx!==null?projectPhaseIdx+1:""} Project</div>
              <div style={{fontSize:11,color:T.textDim,marginBottom:20}}>Share your project link and a short note. Your instructor will review and unlock the next phase.</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>PROJECT LINK (GitHub, Colab, Streamlit, etc.)</div>
                <input value={projectSubmission.link} onChange={e=>setProjectSubmission(p=>({...p,link:e.target.value}))} placeholder="https://github.com/yourproject" style={{width:"100%",background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:8,padding:"9px 12px",color:T.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:T.textDim,marginBottom:6}}>NOTES (what you built, what you learned)</div>
                <textarea value={projectSubmission.notes} onChange={e=>setProjectSubmission(p=>({...p,notes:e.target.value}))} placeholder="I built a churn predictor using XGBoost..." rows={3} style={{width:"100%",background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:8,padding:"9px 12px",color:T.text,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={submitProject} style={{flex:1,padding:"10px",background:T.good+"18",border:`1px solid ${T.good}55`,color:T.good,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Submit Project</button>
                <button onClick={()=>setShowProjectModal(false)} style={{padding:"10px 16px",background:"none",border:`1px solid ${T.border}`,color:T.textDim,borderRadius:8,cursor:"pointer",fontSize:13}}>Cancel</button>
              </div>
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
                            <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>{proj.title}</div>
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

        {/* AI COACH CHATBOT */}
        {tab==="ai"&&(
          <div style={{padding:"24px"}}>
            <AIChatbot userDoc={userDoc}/>
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
    <div style={{minHeight:"100vh",background:"#0b0a12",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20}}>
          <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
          <div style={{fontWeight:800,fontSize:18,color:"#e8e4ff"}}>DS Academy</div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{width:28,height:28,border:"2px solid #1e1c35",borderTop:"2px solid #8b7cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
      </div>
    </div>
  );

  if(!authUser)return <LoginPage/>;
  if(!userDoc)return(
    <div style={{minHeight:"100vh",background:"#0b0a12",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20}}>
          <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
          <div style={{fontWeight:800,fontSize:18,color:"#e8e4ff"}}>DS Academy</div>
        </div>
        <div style={{width:28,height:28,border:"2px solid #1e1c35",borderTop:"2px solid #8b7cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
      </div>
    </div>
  );
  if(userDoc?.role==="admin"||authUser.email===ADMIN_EMAIL)return <AdminDashboard currentUser={authUser}/>;
  return <StudentDashboard currentUser={authUser} userDoc={userDoc}/>;
}