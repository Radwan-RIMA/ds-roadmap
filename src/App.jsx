// ── AI JOB CALCULATOR
function AIJobCalculator(){
  const [job,setJob]=useState("");
  const [result,setResult]=useState(null);
  const [calculating,setCalculating]=useState(false);
  const [aiPowered,setAiPowered]=useState(false);

  const callGroq=async(jobTitle)=>{
    try{
      const key=import.meta.env.VITE_GROQ_API_KEY||"";
      if(!key)return null;
      const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body:JSON.stringify({
          model:"llama-3.3-70b-versatile",
          messages:[{role:"user",content:`You are an AI automation expert. Analyze this job: "${jobTitle}". Return ONLY raw JSON no markdown: {"risk":<0-100>,"label":"<Very Low Risk|Lower Risk|Moderate Risk|High Risk|Very High Risk>","reason":"<2 sentences specific to this job>","skills":["<skill1>","<skill2>","<skill3>","<skill4>"],"months":<4-12>}`}],
          max_tokens:300
        })
      });
      const data=await res.json();
      const text=data.choices[0].message.content.trim().replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(text);
      const risk=Number(parsed.risk);
      const color=risk>=80?"#f28b82":risk>=60?"#f7c96e":risk>=40?"#a78bfa":"#6dd6a0";
      return{...parsed,risk,color};
    }catch(e){console.log("Groq error:",e);return null;}
  };

  const jobData={
    "data entry":{risk:92,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","Data Analysis","Automation"],months:4,reason:"Repetitive data tasks are among the first to be automated by AI systems."},
    "accountant":{risk:78,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Financial Analytics","Data Visualization"],months:6,reason:"Rule-based financial processing is highly automatable. DS skills shift you to strategic analysis."},
    "data analyst":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["ML","Advanced SQL","Storytelling","Python"],months:8,reason:"Basic analysis is at risk but strategic data scientists who drive decisions are in high demand."},
    "journalist":{risk:55,color:"#f7c96e",label:"Moderate Risk",skills:["NLP","Text Analysis","Python","Data Journalism"],months:7,reason:"AI can generate routine content. Data journalists who find stories in numbers are thriving."},
    "teacher":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["EdTech Analytics","Python","Learning Data","NLP"],months:9,reason:"Human connection in education is hard to replace, but AI tools are changing how teaching works."},
    "professor":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["Research Analytics","Python","NLP","Statistical Modeling"],months:9,reason:"Academic research is being supercharged by AI tools. Professors who use data methods publish faster and better."},
    "lecturer":{risk:26,color:"#6dd6a0",label:"Lower Risk",skills:["EdTech Analytics","Python","Learning Data","NLP"],months:9,reason:"Teaching roles are resilient but AI is transforming how content is delivered. Data skills open ed-tech opportunities."},
    "software engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["ML Engineering","MLOps","LLM APIs","Python"],months:6,reason:"Engineers who can build AI systems are more valuable than ever. Adapt, don't fear."},
    "developer":{risk:24,color:"#6dd6a0",label:"Lower Risk",skills:["ML Engineering","Python","LLM APIs","MLOps"],months:6,reason:"AI generates boilerplate but developers who build intelligent systems are commanding higher salaries."},
    "web developer":{risk:38,color:"#a78bfa",label:"Moderate Risk",skills:["Python","Analytics","A/B Testing","Data-Driven UI"],months:6,reason:"AI tools are automating front-end code. Web devs who use data to drive UX decisions stay ahead."},
    "doctor":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Medical ML","Clinical Analytics","Python","Research"],months:10,reason:"Medical diagnosis AI assists doctors but the human judgment and responsibility remain essential."},
    "physician":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Medical ML","Clinical Analytics","Python","Health Data"],months:10,reason:"AI assists diagnosis but clinical judgment, patient relationships and liability remain human."},
    "surgeon":{risk:10,color:"#6dd6a0",label:"Very Low Risk",skills:["Surgical Robotics Data","Python","Clinical Analytics","Imaging ML"],months:12,reason:"Surgical precision requires human hands. AI assists with imaging and planning but cannot replace surgeons."},
    "marketer":{risk:61,color:"#f7c96e",label:"Moderate Risk",skills:["Marketing Analytics","SQL","A/B Testing","Python"],months:5,reason:"Generic marketing is being automated. Data-driven marketers who optimize with numbers are safe."},
    "digital marketer":{risk:63,color:"#f7c96e",label:"Moderate Risk",skills:["Marketing Analytics","Python","A/B Testing","SQL"],months:5,reason:"AI handles ad copy and targeting automation. Marketers who measure ROI with data and run experiments thrive."},
    "lawyer":{risk:44,color:"#a78bfa",label:"Moderate Risk",skills:["Legal Analytics","NLP","Python","Document AI"],months:8,reason:"Document review is automating fast. Strategic legal work requires human judgment."},
    "attorney":{risk:44,color:"#a78bfa",label:"Moderate Risk",skills:["Legal Analytics","NLP","Python","Document AI"],months:8,reason:"Contract review and legal research are automating. Litigators and strategic advisors remain valuable."},
    "hr":{risk:57,color:"#f7c96e",label:"Moderate Risk",skills:["People Analytics","Python","SQL","Predictive Hiring"],months:6,reason:"Screening and scheduling are automating. HR analytics is growing."},
    "human resources":{risk:57,color:"#f7c96e",label:"Moderate Risk",skills:["People Analytics","Python","SQL","Predictive Hiring"],months:6,reason:"Screening and scheduling are automating fast. Data-driven HR who predict retention and performance are safe."},
    "graphic designer":{risk:69,color:"#f7c96e",label:"High Risk",skills:["AI Tools","Data Visualization","UX Analytics","Python"],months:5,reason:"AI image generation is transforming design. Data visualization and UX analytics offer a safe pivot."},
    "ui designer":{risk:65,color:"#f7c96e",label:"High Risk",skills:["UX Analytics","Python","A/B Testing","Data Visualization"],months:5,reason:"AI generates UI mockups fast. Designers who validate choices with user data and run experiments are protected."},
    "ux designer":{risk:52,color:"#f7c96e",label:"Moderate Risk",skills:["UX Analytics","Python","A/B Testing","Behavioral Data"],months:6,reason:"UX research and user testing are hard to automate. Data-driven UX designers who quantify experience are thriving."},
    "customer service":{risk:85,color:"#f28b82",label:"Very High Risk",skills:["Python","NLP","Chatbot Analytics","SQL"],months:4,reason:"Chatbots are replacing tier-1 support rapidly. Building and managing those systems is the opportunity."},
    "call center agent":{risk:90,color:"#f28b82",label:"Very High Risk",skills:["Python","NLP","Chatbot Analytics","SQL"],months:4,reason:"Voice AI and chatbots are replacing call centers at scale. The opportunity is building the systems that replace the role."},
    "researcher":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["ML Research","Python","Statistics","Data Science"],months:7,reason:"Research that uses AI as a tool is accelerating. Your analytical skills translate directly to DS."},
    "banker":{risk:67,color:"#f7c96e",label:"High Risk",skills:["FinTech Analytics","Python","Risk Modeling","SQL"],months:6,reason:"Routine banking is automating fast. Quantitative finance and risk modeling are growing fields."},
    "bank teller":{risk:94,color:"#f28b82",label:"Very High Risk",skills:["Python","SQL","Financial Analytics","Automation"],months:4,reason:"ATMs and banking apps have already automated most teller functions. Full automation is imminent."},
    "translator":{risk:82,color:"#f28b82",label:"Very High Risk",skills:["NLP","Python","Language Models","Text Analytics"],months:5,reason:"Machine translation is rapidly improving. NLP engineering and localization analytics offer a pivot."},
    "interpreter":{risk:70,color:"#f7c96e",label:"High Risk",skills:["NLP","Python","Language Models","Speech Analytics"],months:6,reason:"Real-time AI translation is improving fast. Human interpreters for sensitive negotiations still hold value."},
    "civil engineer":{risk:25,color:"#6dd6a0",label:"Lower Risk",skills:["GIS Analytics","Python","Structural Data","Simulation"],months:8,reason:"Physical engineering judgment is hard to automate. Data-driven design and simulation are growing fast."},
    "mechanical engineer":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["Predictive Maintenance","Python","IoT Data","Simulation"],months:8,reason:"Physical design requires deep expertise. Engineers who use ML for simulation and predictive maintenance are in demand."},
    "electrical engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["IoT Analytics","Python","Smart Grid Data","Signal Processing"],months:8,reason:"Hardware design is safe. Electrical engineers who analyze sensor and grid data with ML are commanding premium salaries."},
    "industrial engineer":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["Operations Analytics","Python","Process Mining","Simulation"],months:7,reason:"Process optimization is increasingly data-driven. Industrial engineers who use ML to model workflows are thriving."},
    "architect":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Computational Design","Python","GIS","Data Visualization"],months:8,reason:"Creative design is safe but AI is transforming how architects analyze sites and optimize buildings."},
    "pharmacist":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["Health Analytics","Python","Drug Data","Clinical ML"],months:7,reason:"Dispensing is automating but clinical pharmacists who analyze patient data are in growing demand."},
    "social media manager":{risk:64,color:"#f7c96e",label:"High Risk",skills:["Social Analytics","Python","NLP","Marketing Data"],months:5,reason:"AI tools generate content fast. Data-driven social strategists who measure ROI stand out."},
    "financial analyst":{risk:70,color:"#f7c96e",label:"High Risk",skills:["Python","Financial Modeling","SQL","Quantitative Analysis"],months:5,reason:"Routine financial modeling is automating. Analysts who build ML-powered forecasts are thriving."},
    "auditor":{risk:72,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Fraud Analytics","Financial Data"],months:5,reason:"Rule-based audit checks are automating fast. Auditors who use ML for anomaly detection add real value."},
    "tax consultant":{risk:76,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Financial Analytics","Regulatory Data"],months:5,reason:"Tax filing automation is accelerating. Complex advisory and cross-border tax strategy still requires human expertise."},
    "sales representative":{risk:58,color:"#f7c96e",label:"Moderate Risk",skills:["CRM Analytics","Python","Sales Forecasting","SQL"],months:5,reason:"Cold outreach is automating but data-driven sales people who analyze pipelines are more valuable."},
    "sales manager":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["CRM Analytics","Python","Sales Forecasting","SQL"],months:6,reason:"Pipeline management is automating. Sales leaders who use predictive analytics to coach teams are essential."},
    "project manager":{risk:38,color:"#a78bfa",label:"Moderate Risk",skills:["Project Analytics","Python","Resource Optimization","Data"],months:6,reason:"Human coordination is hard to replace but PMs who use data to predict delays and risks are essential."},
    "product manager":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["Product Analytics","SQL","Python","A/B Testing"],months:6,reason:"AI generates feature ideas but PMs who use data to prioritize and measure impact are more valuable than ever."},
    "economist":{risk:32,color:"#6dd6a0",label:"Lower Risk",skills:["Econometrics","Python","R","Statistical Modeling"],months:6,reason:"Economic analysis requires deep domain knowledge. Data skills amplify rather than replace economists."},
    "logistics coordinator":{risk:72,color:"#f7c96e",label:"High Risk",skills:["Supply Chain Analytics","Python","SQL","Optimization"],months:5,reason:"Routing and scheduling are rapidly automating. Supply chain data analysts are in high demand."},
    "content writer":{risk:75,color:"#f7c96e",label:"High Risk",skills:["NLP","Python","Content Analytics","SEO Data"],months:5,reason:"AI writes generic content fast. Writers who use data to find angles and measure performance survive."},
    "administrative assistant":{risk:88,color:"#f28b82",label:"Very High Risk",skills:["Python","Automation","SQL","Data Entry Tools"],months:4,reason:"Scheduling, email management and document handling are being automated rapidly by AI agents."},
    "secretary":{risk:88,color:"#f28b82",label:"Very High Risk",skills:["Python","Automation","SQL","Data Entry Tools"],months:4,reason:"Calendar management, email drafting and document handling are being fully automated by AI agents."},
    "real estate agent":{risk:42,color:"#a78bfa",label:"Moderate Risk",skills:["Real Estate Analytics","Python","Market Data","SQL"],months:6,reason:"Property search is automating but agents who use market data to advise clients add real value."},
    "nurse":{risk:15,color:"#6dd6a0",label:"Lower Risk",skills:["Health Analytics","Python","Clinical Data","Patient ML"],months:9,reason:"Human care is irreplaceable. Nurses who understand clinical data and patient analytics are future-proof."},
    "business analyst":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["SQL","Python","BI Tools","Data Visualization"],months:6,reason:"Basic reporting is automating. BAs who translate data into strategy are more valuable than ever."},
    "supply chain manager":{risk:60,color:"#f7c96e",label:"Moderate Risk",skills:["Supply Chain Analytics","Python","Forecasting","SQL"],months:6,reason:"AI is transforming logistics. Managers who use predictive analytics for inventory are in demand."},
    "dentist":{risk:12,color:"#6dd6a0",label:"Very Low Risk",skills:["Medical Imaging ML","Python","Clinical Analytics","Health Data"],months:10,reason:"Physical dental procedures require human precision. AI assists with imaging but cannot replace dentists."},
    "psychologist":{risk:16,color:"#6dd6a0",label:"Lower Risk",skills:["Mental Health Analytics","NLP","Python","Behavioral Data"],months:9,reason:"Human empathy and therapeutic relationships are hard to automate. Data skills open research roles."},
    "therapist":{risk:16,color:"#6dd6a0",label:"Lower Risk",skills:["Mental Health Analytics","NLP","Python","Behavioral Data"],months:9,reason:"Therapeutic relationships are deeply human. Data skills help therapists track outcomes and identify at-risk patients."},
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
    "data scientist":{risk:15,color:"#6dd6a0",label:"Very Low Risk",skills:["Advanced ML","Deep Learning","Python","MLOps"],months:4,reason:"Data scientists who build AI are the ones replacing other jobs — not the ones being replaced."},
    "machine learning engineer":{risk:12,color:"#6dd6a0",label:"Very Low Risk",skills:["MLOps","Python","Deep Learning","LLM APIs"],months:4,reason:"ML engineers are the architects of AI automation. Demand is growing faster than supply globally."},
    "data engineer":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["Python","SQL","Spark","Pipeline Engineering"],months:6,reason:"Data pipelines are the backbone of every AI product. Data engineers who build reliable infrastructure are essential."},
    "business intelligence analyst":{risk:55,color:"#f7c96e",label:"Moderate Risk",skills:["SQL","Python","BI Tools","Predictive Analytics"],months:6,reason:"Static dashboards are being automated. BI analysts who add ML-powered forecasting and insights stand out."},
    "statistician":{risk:25,color:"#6dd6a0",label:"Lower Risk",skills:["Python","R","Statistical Modeling","ML"],months:7,reason:"Statistical expertise underpins all of AI. Statisticians who code are among the most valuable people in data."},
    "consultant":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["Data Analytics","Python","SQL","Visualization"],months:6,reason:"Generic consulting is at risk. Consultants who back recommendations with data and ML models are differentiating fast."},
    "management consultant":{risk:42,color:"#a78bfa",label:"Moderate Risk",skills:["Data Analytics","Python","SQL","Financial Modeling"],months:6,reason:"AI handles research and deck-building. Consultants who lead with data-driven insight and stakeholder trust are safe."},
    "it manager":{risk:35,color:"#a78bfa",label:"Moderate Risk",skills:["Python","Cloud Analytics","Security Data","Automation"],months:7,reason:"Routine IT tasks are automating. IT leaders who manage AI infrastructure and data systems are in high demand."},
    "network engineer":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Network Analytics","Python","Security ML","IoT Data"],months:8,reason:"Physical network management remains essential. Engineers who add ML-based anomaly detection are leading the field."},
    "cybersecurity analyst":{risk:18,color:"#6dd6a0",label:"Lower Risk",skills:["Security ML","Python","Anomaly Detection","Threat Analytics"],months:8,reason:"Cyber threats are growing and AI is the weapon on both sides. Security analysts who use ML are indispensable."},
    "marketing manager":{risk:50,color:"#a78bfa",label:"Moderate Risk",skills:["Marketing Analytics","Python","SQL","A/B Testing"],months:5,reason:"AI runs campaigns but marketing leaders who define strategy using data and measure ROI precisely are thriving."},
    "brand manager":{risk:45,color:"#a78bfa",label:"Moderate Risk",skills:["Brand Analytics","Python","NLP","Social Data"],months:6,reason:"Brand intuition stays human. Managers who track sentiment, measure brand equity with data, and run experiments stand out."},
    "supply chain analyst":{risk:65,color:"#f7c96e",label:"High Risk",skills:["Supply Chain Analytics","Python","SQL","Forecasting"],months:5,reason:"Demand forecasting and inventory optimization are rapidly being taken over by ML models."},
    "procurement officer":{risk:68,color:"#f7c96e",label:"High Risk",skills:["Python","SQL","Supply Chain Analytics","Vendor Data"],months:5,reason:"Vendor comparison and purchase order management are automating. Data-driven procurement adds strategic value."},
    "warehouse manager":{risk:70,color:"#f7c96e",label:"High Risk",skills:["Operations Analytics","Python","IoT Data","Optimization"],months:5,reason:"Robotics and AI are transforming warehouses. Managers who use data to optimize workflows stay ahead of automation."},
    "event planner":{risk:40,color:"#a78bfa",label:"Moderate Risk",skills:["Python","Data Analytics","CRM Analytics","Marketing Data"],months:7,reason:"Logistics coordination is automating but creative event design and client relationships remain human."},
    "financial advisor":{risk:60,color:"#f7c96e",label:"Moderate Risk",skills:["FinTech Analytics","Python","Risk Modeling","Financial ML"],months:6,reason:"Robo-advisors handle routine portfolios. Advisors who combine human trust with data-driven strategy are safe."},
    "investment analyst":{risk:65,color:"#f7c96e",label:"High Risk",skills:["Python","Quantitative Analysis","Financial ML","SQL"],months:5,reason:"Quantitative analysis is increasingly automated. Analysts who build ML-powered models for alternative data stand out."},
    "biomedical engineer":{risk:20,color:"#6dd6a0",label:"Lower Risk",skills:["Medical ML","Python","Signal Processing","Clinical Analytics"],months:9,reason:"Medical device engineering requires deep domain knowledge. Data skills in clinical signal processing are a major advantage."},
    "environmental engineer":{risk:22,color:"#6dd6a0",label:"Lower Risk",skills:["GIS Analytics","Python","Environmental Data","Simulation"],months:8,reason:"Environmental monitoring and impact assessment are increasingly data-driven. ML skills amplify impact significantly."},
    "petroleum engineer":{risk:30,color:"#6dd6a0",label:"Lower Risk",skills:["Geospatial Analytics","Python","Drilling Data","Simulation"],months:8,reason:"Oil and gas exploration is being transformed by ML and sensor data. Data-skilled engineers are commanding premiums."},
    "chemical engineer":{risk:28,color:"#6dd6a0",label:"Lower Risk",skills:["Process Analytics","Python","Simulation","IoT Data"],months:8,reason:"Chemical process optimization is increasingly driven by ML. Engineers who model reactions with data add enormous value."},
    "student":{risk:5,color:"#6dd6a0",label:"Very Low Risk",skills:["Python","SQL","Machine Learning","Data Analysis"],months:6,reason:"You're at the perfect moment. Learning data science now puts you ahead of the entire workforce — start today."},
    "fresh graduate":{risk:5,color:"#6dd6a0",label:"Very Low Risk",skills:["Python","SQL","Machine Learning","Data Visualization"],months:6,reason:"You have zero bad habits to unlearn. Adding data skills now makes you one of the most hireable graduates in MENA."},
    "intern":{risk:8,color:"#6dd6a0",label:"Very Low Risk",skills:["Python","SQL","Data Analysis","Visualization"],months:5,reason:"Internship experience plus data skills is a rare combination. You're perfectly positioned to pivot into data roles."},
  };

  const calculate=async()=>{
    if(!job.trim())return;
    setCalculating(true);
    setAiPowered(false);
    const k=job.toLowerCase().trim();
    let match=null;
    for(const j of Object.keys(jobData)){if(k.includes(j)||j.includes(k)){match=jobData[j];break;}}
    if(!match){
      const aiResult=await callGroq(job);
      if(aiResult){match=aiResult;setAiPowered(true);}
      else{const risk=Math.floor(Math.random()*30)+40;match={risk,color:risk>60?"#f7c96e":"#a78bfa",label:risk>60?"Moderate-High Risk":"Moderate Risk",skills:["Python","SQL","Data Analysis","Machine Learning"],months:6,reason:"Most knowledge work roles are being transformed by AI. Data skills future-proof any career."};}
    }
    setResult(match);
    setCalculating(false);
  };

  return(
    <div style={{padding:"50px 20px",background:"#0b0a12"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// career risk scanner</div>
        <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:10}}>Will AI replace your job?</h2>
        <p style={{color:"#7b78a0",fontSize:15,marginBottom:20,maxWidth:520}}>Enter your current job title and find out your AI replacement risk — and exactly what data skills would make you safe.</p>
        <div style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:16,padding:"24px"}}>
          {!result&&!calculating&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                <input value={job} onChange={e=>setJob(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calculate()} placeholder="e.g. Accountant, Marketer, Teacher..." style={{flex:1,minWidth:200,background:"#0b0a12",border:"1px solid #2a2845",borderRadius:8,padding:"12px 16px",color:"#e8e4ff",fontSize:14,outline:"none"}}/>
                <button onClick={calculate} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"12px 24px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,whiteSpace:"nowrap"}}>Scan My Job →</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Accountant","Engineer","Doctor","Lawyer","Teacher","Student","Developer","Marketer"].map(j=>(
                  <button key={j} onClick={()=>setJob(j)} style={{background:"#17162a",border:"1px solid #2a2845",color:"#7b78a0",padding:"5px 12px",borderRadius:100,cursor:"pointer",fontSize:12}}>{j}</button>
                ))}
              </div>
            </div>
          )}
          {calculating&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <style>{`@keyframes spin2{to{transform:rotate(360deg);}}`}</style>
              <div style={{width:32,height:32,border:"2px solid #1e1c35",borderTop:"2px solid #8b7cf6",borderRadius:"50%",animation:"spin2 0.8s linear infinite",margin:"0 auto 16px"}}/>
              <div style={{fontSize:13,color:"#7b78a0",fontFamily:"monospace"}}>Scanning job market data...</div>
            </div>
          )}
          {result&&!calculating&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
                <div><div style={{fontSize:13,color:"#7b78a0",marginBottom:4}}>Risk assessment for</div><div style={{fontSize:18,fontWeight:700,color:"#e8e4ff"}}>{job}</div></div>
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
                <div style={{fontSize:13,color:"#e8e4ff",marginBottom:4}}>🎯 ZeroToDS can make you safe in <strong style={{color:"#8b7cf6"}}>{result.months} months</strong></div>
                <div style={{fontSize:12,color:"#7b78a0"}}>The curriculum covers all the skills above — starting from Python with zero experience required.</div>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <a href="#apply" style={{flex:1,minWidth:140,background:"#8b7cf6",color:"#fff",border:"none",padding:"11px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Apply for Access →</a>
                <button onClick={()=>{
                  const text=`🤖 AI will replace ${result.risk}% of ${job} jobs.\n\nSkills that protect you: ${result.skills.slice(0,3).join(", ")}.\n\nI checked mine on ZeroToDS → zerotods.com`;
                  if(navigator.share){navigator.share({title:"My AI Job Risk Score",text});}
                  else{navigator.clipboard.writeText(text).then(()=>alert("Copied to clipboard! Paste it on LinkedIn or Twitter."));}
                }} style={{padding:"11px 14px",background:"none",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:8,cursor:"pointer",fontSize:13}}>📤 Share</button>
                <button onClick={()=>{setResult(null);setJob("");}} style={{padding:"11px 16px",background:"none",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:8,cursor:"pointer",fontSize:13}}>Try another</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection,
  onSnapshot, addDoc, query, orderBy, deleteDoc, where
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

// ── XP SYSTEM
const XP_LEVELS = [
  { label: "Rookie",         min: 0,    color: "#7b78a0", icon: "🌱" },
  { label: "Junior Analyst", min: 500,  color: "#7eb8f7", icon: "📊" },
  { label: "Data Analyst",   min: 1500, color: "#6dd6a0", icon: "🤖" },
  { label: "Data Scientist", min: 3000, color: "#a78bfa", icon: "🧠" },
  { label: "Expert",         min: 6000, color: "#f7c96e", icon: "🏆" },
];
function getLevel(xp){
  let lvl=XP_LEVELS[0];
  for(const l of XP_LEVELS){ if(xp>=l.min) lvl=l; }
  return lvl;
}
function getNextLevel(xp){
  return XP_LEVELS.find(l=>l.min>xp)||null;
}
function XPToast({amount,onDone,isLesson=false}){
  useEffect(()=>{ const t=setTimeout(onDone,isLesson?3000:2200); return ()=>clearTimeout(t); },[]);
  if(isLesson){
    return(
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,pointerEvents:"none"}}>
        <style>{`
          @keyframes xpSlideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes lessonPop{0%{opacity:0;transform:scale(0.7)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
          @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(80px) rotate(360deg);opacity:0}}
        `}</style>
        <div style={{background:"#11101c",border:"2px solid #a78bfa",borderRadius:20,padding:"32px 40px",textAlign:"center",animation:"lessonPop 0.4s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#8b7cf6,#f472b6,#6ee7b7)"}}/>
          {["🎉","⭐","✨","🚀","💫"].map((e,i)=>(
            <div key={i} style={{position:"absolute",top:0,left:`${10+i*18}%`,fontSize:16,animation:`confettiFall ${0.8+i*0.2}s ease ${i*0.1}s both`}}>{e}</div>
          ))}
          <div style={{fontSize:44,marginBottom:8}}>🎓</div>
          <div style={{fontSize:18,fontWeight:800,color:"#e8e4ff",marginBottom:4}}>Lesson Complete!</div>
          <div style={{fontSize:28,fontWeight:800,color:"#a78bfa",marginBottom:4}}>+{amount} XP</div>
          <div style={{fontSize:12,color:"#7b78a0"}}>Keep the momentum going 🔥</div>
        </div>
      </div>
    );
  }
  return(
    <div style={{position:"fixed",bottom:28,right:28,zIndex:999,background:"#1c1927",border:"1px solid #a78bfa55",borderRadius:12,padding:"12px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"xpSlideIn 0.35s ease"}}>
      <style>{`@keyframes xpSlideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{fontSize:20}}>⚡</span>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>+{amount} XP</div>
        <div style={{fontSize:10,color:"#7b78a0"}}>Keep going!</div>
      </div>
    </div>
  );
}

import { LearnTab, LESSONS, LEARN_PHASES, SECTION_TO_FIRST_LESSON, LESSON_COMPLETES_TASK } from "./lessons";
import { sectionProjects, typeColors, typeLabels, portfolioProjects, DEFAULT_ROADMAP, quotes, getTotalProgress } from "./constants";
import { QUIZ_DATA, CAREER_PATHS } from "./quiz_data.js";

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

// ── LANDING PAGE (shown to logged-out visitors)
// ── TESTIMONIALS CAROUSEL
const TESTIMONIALS = [
  {name:"Yasmine",role:"University Student",source:"whatsapp",color:"#6dd6a0",avatar:"Y",text:"I had no idea about my major, even after three years at university. YouTube and ChatGPT didn't help, the ideas felt tangled and unclear. Then I found this site: organized, structured, teaching us projects the university never did. It completely transforms us, from someone who doesn't know what data science means to someone ready to compete in the job market."},
  {name:"Anastasia Al Rassi",role:"Machine Learning Engineer",source:"linkedin",color:"#7eb8f7",avatar:"A",text:"I found your Roadmap so impactful 😍 Fully recommend 💪"},
  {name:"Rebecca Rayess",role:"Junior Data Analyst, Suyool SAL",source:"linkedin",color:"#a78bfa",avatar:"R",text:"This roadmap is really impressive and exactly what our current market needs! Well done! 👏"},
  {name:"Ahmad Sayour",role:"Student at Arab Open University",source:"linkedin",color:"#f7c96e",avatar:"A",text:"Your effort now will turn into success soon 🔥"},
  {name:"Joanna Ahmad",role:"Financial Accountant",source:"whatsapp",color:"#f472b6",avatar:"J",text:"As a financial accountant, I never thought data science was for me. This platform completely changed that, it gave me real skills that directly apply to my work and open doors I didn't know existed."},
];

function TestimonialsCarousel(){
  const [idx,setIdx]=useState(0);
  const [anim,setAnim]=useState("in");
  const t=TESTIMONIALS[idx];

  const go=(dir)=>{
    setAnim("out");
    setTimeout(()=>{
      setIdx(i=>(i+dir+TESTIMONIALS.length)%TESTIMONIALS.length);
      setAnim("in");
    },200);
  };

  // Auto-advance every 5s
  useEffect(()=>{
    const timer=setInterval(()=>go(1),5000);
    return()=>clearInterval(timer);
  },[idx]);

  return(
    <div style={{padding:"50px 20px",background:"#0d0c18"}}>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-30px)}}
        .t-in{animation:slideIn 0.25s ease forwards;}
        .t-out{animation:slideOut 0.2s ease forwards;}
      `}</style>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// student voices</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,4vw,34px)",letterSpacing:"-0.02em",margin:0}}>Real people. Real feedback.</h2>
          <div style={{display:"flex",gap:6}}>
            <span style={{fontSize:11,background:"#7eb8f720",color:"#7eb8f7",padding:"3px 10px",borderRadius:100,fontFamily:"monospace"}}>LinkedIn</span>
            <span style={{fontSize:11,background:"#25D36620",color:"#25D366",padding:"3px 10px",borderRadius:100,fontFamily:"monospace"}}>WhatsApp</span>
          </div>
        </div>

        {/* Card */}
        <div className={anim==="in"?"t-in":"t-out"} style={{background:"#11101c",border:`2px solid ${t.color}33`,borderRadius:16,padding:"32px",position:"relative",minHeight:200}}>
          {/* Source badge */}
          <div style={{position:"absolute",top:16,right:16,fontSize:10,padding:"3px 10px",borderRadius:100,background:t.source==="linkedin"?"#7eb8f720":"#25D36620",color:t.source==="linkedin"?"#7eb8f7":"#25D366",fontFamily:"monospace",fontWeight:700}}>
            {t.source==="linkedin"?"LinkedIn":"WhatsApp"}
          </div>
          {/* Accent bar */}
          <div style={{width:40,height:3,borderRadius:100,background:`linear-gradient(90deg,${t.color},${t.color}44)`,marginBottom:20}}/>
          <div style={{fontSize:15,color:"#d8d4f0",lineHeight:1.8,marginBottom:24}}>
            {t.text}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,borderTop:"1px solid #1e1c35",paddingTop:18}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${t.color}44,${t.color}11)`,border:`2px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:t.color,flexShrink:0}}>
              {t.avatar}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#e8e4ff"}}>{t.name}</div>
              <div style={{fontSize:11,color:"#4a4665",marginTop:2}}>{t.role}</div>
            </div>
            <div style={{display:"flex",gap:1}}>
              {[1,2,3,4,5].map(s=><span key={s} style={{fontSize:13,color:"#f7c96e"}}>★</span>)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20}}>
          {/* Dots */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>{setAnim("out");setTimeout(()=>{setIdx(i);setAnim("in");},200);}} style={{width:i===idx?24:8,height:8,borderRadius:100,background:i===idx?t.color:"#2a2845",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>
            ))}
          </div>
          {/* Arrows */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>go(-1)} style={{width:40,height:40,borderRadius:"50%",background:"#17162a",border:"1px solid #2a2845",color:"#7b78a0",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.color=t.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2845";e.currentTarget.style.color="#7b78a0";}}>
              ←
            </button>
            <button onClick={()=>go(1)} style={{width:40,height:40,borderRadius:"50%",background:"#17162a",border:"1px solid #2a2845",color:"#7b78a0",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.color=t.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2845";e.currentTarget.style.color="#7b78a0";}}>
              →
            </button>
          </div>
        </div>
        <div style={{marginTop:12,fontSize:11,color:"#3a3860",textAlign:"center"}}>
          {idx+1} of {TESTIMONIALS.length} — unsolicited feedback from real users
        </div>
      </div>
    </div>
  );
}

// ── VISITOR COUNTER (stat box style)
function VisitorCounter(){
  const [count,setCount]=useState(null);
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"users"),snap=>{
      const c=snap.docs.filter(d=>d.data().role!=="admin"&&!d.data().disabled).length;
      setCount(c);
    });
    return unsub;
  },[]);
  if(!count)return null;
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,color:"#4a4665",fontFamily:"monospace"}}>
      <div style={{width:5,height:5,borderRadius:"50%",background:"#6dd6a0",boxShadow:"0 0 5px #6dd6a0",animation:"pulse 2s infinite",flexShrink:0}}/>
      <span><span style={{color:"#7b78a0",fontWeight:600}}>{count} students</span> already enrolled</span>
    </div>
  );
}

// ── CONFETTI
function Confetti(){
  useEffect(()=>{
    window.triggerConfetti=()=>{
      const colors=["#8b7cf6","#f472b6","#6ee7b7","#f7c96e","#7eb8f7","#fff"];
      const canvas=document.createElement("canvas");
      canvas.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;";
      canvas.width=window.innerWidth;
      canvas.height=window.innerHeight;
      document.body.appendChild(canvas);
      const ctx=canvas.getContext("2d");
      const pieces=Array.from({length:200},()=>({
        x:Math.random()*canvas.width,
        y:-20,
        r:Math.random()*7+3,
        color:colors[Math.floor(Math.random()*colors.length)],
        vx:(Math.random()-0.5)*5,
        vy:Math.random()*4+2,
        angle:Math.random()*360,
        spin:(Math.random()-0.5)*12,
        opacity:1,
      }));
      let frame=0;
      const animate=()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let alive=false;
        pieces.forEach(p=>{
          p.x+=p.vx; p.y+=p.vy; p.angle+=p.spin;
          if(frame>80) p.opacity=Math.max(0,p.opacity-0.012);
          if(p.opacity>0) alive=true;
          ctx.save();
          ctx.globalAlpha=p.opacity;
          ctx.translate(p.x,p.y);
          ctx.rotate(p.angle*Math.PI/180);
          ctx.fillStyle=p.color;
          ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
          ctx.restore();
        });
        frame++;
        if(alive) requestAnimationFrame(animate);
        else if(document.body.contains(canvas)) document.body.removeChild(canvas);
      };
      requestAnimationFrame(animate);
    };
    return()=>{ delete window.triggerConfetti; };
  },[]);
  return null;
}

// ── EMAIL CAPTURE
function EmailCapture(){
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    if(!email.trim()||!email.includes("@"))return;
    setLoading(true);
    try{
      await addDoc(collection(db,"waitlist"),{email:email.trim(),source:"roadmap_pdf",joinedAt:Date.now()});
      setDone(true);
    }catch(e){console.log(e);}
    setLoading(false);
  };

  return(
    <div style={{padding:"50px 20px",background:"#0d0c18",borderTop:"1px solid #1e1c35"}}>
      <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#8b7cf618",border:"1px solid #8b7cf633",borderRadius:100,padding:"5px 14px",marginBottom:16}}>
          <span style={{fontSize:14}}>🗺️</span>
          <span style={{fontSize:11,color:"#8b7cf6",fontFamily:"monospace",fontWeight:700,letterSpacing:"0.08em"}}>FREE RESOURCE</span>
        </div>
        <h3 style={{fontWeight:800,fontSize:"clamp(18px,3vw,26px)",marginBottom:10,color:"#e8e4ff",lineHeight:1.2}}>Get the DS Roadmap PDF — free.</h3>
        <p style={{fontSize:13,color:"#7b78a0",marginBottom:8,lineHeight:1.7}}>The exact path I wish I had when I started. Every phase, every skill, every tool — laid out in one visual roadmap you can pin on your wall.</p>
        <p style={{fontSize:12,color:"#4a4665",marginBottom:24}}>No spam. I'll send it + notify you when the next cohort opens.</p>
        {done?(
          <div style={{background:"#6dd6a011",border:"1px solid #6dd6a033",borderRadius:12,padding:"20px",color:"#6dd6a0",fontSize:14,fontWeight:600,lineHeight:1.6}}>
            ✓ Sent! Check your inbox for the roadmap PDF.<br/>
            <span style={{fontSize:12,color:"#4a9970",fontWeight:400}}>I'll also message you when the next cohort opens.</span>
          </div>
        ):(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="your@email.com" style={{flex:1,minWidth:200,background:"#11101c",border:"1px solid #2a2845",borderRadius:8,padding:"12px 14px",color:"#e8e4ff",fontSize:13,outline:"none"}}/>
            <button onClick={submit} disabled={loading} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"12px 22px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,whiteSpace:"nowrap",opacity:loading?0.7:1}}>
              {loading?"Sending...":"Send Me the PDF →"}
            </button>
          </div>
        )}
        <div style={{marginTop:14,fontSize:11,color:"#3a3860"}}>📍 Built for Arab students in MENA · Response within 24h</div>
      </div>
    </div>
  );
}

// ── FAQ ITEM
// ── WHATSAPP FLOAT
function WhatsAppFloat(){
  const [pulse,setPulse]=useState(true);
  useEffect(()=>{
    const t=setTimeout(()=>setPulse(false),3000);
    return()=>clearTimeout(t);
  },[]);
  return(
    <a
      href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20found%20DS%20Academy%20and%20I%20have%20a%20question."
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position:"fixed",right:20,bottom:80,zIndex:200,
        width:54,height:54,borderRadius:"50%",
        background:"#25D366",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 4px 20px rgba(37,211,102,0.4)",
        textDecoration:"none",
        transition:"transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 28px rgba(37,211,102,0.6)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(37,211,102,0.4)";}}
    >
      <style>{`
        @keyframes waPulse {
          0%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}
          70%{box-shadow:0 0 0 14px rgba(37,211,102,0)}
          100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}
        }
        .wa-pulse { animation: waPulse 1.5s ease-out 3; }
        .wa-tooltip { opacity:0; pointer-events:none; transition: opacity 0.2s; }
        .wa-btn:hover .wa-tooltip { opacity:1; }
      `}</style>
      <div className={`wa-btn ${pulse?"wa-pulse":""}`} style={{position:"relative",width:"100%",height:"100%",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.851L.057 23.714a.5.5 0 00.63.63l5.862-1.476A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.876 9.876 0 01-5.031-1.375l-.36-.214-3.733.979.997-3.642-.235-.374A9.862 9.862 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.421 0 9.894 4.474 9.894 9.894 0 5.421-4.473 9.894-9.894 9.894z"/>
        </svg>
        {/* Tooltip */}
        <div className="wa-tooltip" style={{position:"absolute",right:64,top:"50%",transform:"translateY(-50%)",background:"#11101c",border:"1px solid #2a2845",borderRadius:8,padding:"8px 12px",whiteSpace:"nowrap",fontSize:12,color:"#e8e4ff"}}>
          Ask Radwan anything 💬
          <div style={{position:"absolute",right:-5,top:"50%",transform:"translateY(-50%)",width:8,height:8,background:"#11101c",border:"1px solid #2a2845",borderRight:"none",borderBottom:"none",rotate:"135deg"}}/>
        </div>
      </div>
    </a>
  );
}

function FAQItem({q,a}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:10,overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:12}}>
        <span style={{fontSize:14,fontWeight:600,color:"#e8e4ff",lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:18,color:"#8b7cf6",flexShrink:0,transition:"transform 0.2s",transform:open?"rotate(45deg)":"rotate(0deg)"}}>+</span>
      </button>
      {open&&<div style={{padding:"0 20px 16px",fontSize:13,color:"#7b78a0",lineHeight:1.7,borderTop:"1px solid #1e1c35",paddingTop:14}}>{a}</div>}
    </div>
  );
}

// ── SCROLL PROGRESS BAR
function ScrollProgress(){
  const [pct,setPct]=useState(0);
  useEffect(()=>{
    const onScroll=()=>{
      const el=document.documentElement;
      const scrolled=el.scrollTop||document.body.scrollTop;
      const total=el.scrollHeight-el.clientHeight;
      setPct(total>0?Math.min(100,(scrolled/total)*100):0);
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:3,background:"transparent",pointerEvents:"none"}}>
      <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#8b7cf6,#f472b6,#6ee7b7)",transition:"width 0.1s linear",borderRadius:"0 2px 2px 0"}}/>
    </div>
  );
}

// ── STICKY BAR
function StickyBar({onSignup}){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setVisible(window.scrollY>400);
    window.addEventListener("scroll",onScroll);
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  if(!visible)return null;
  return(
    <div className="sticky-bar" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:99,background:"rgba(17,16,28,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid #2a2845",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
      <div className="sticky-bar-text" style={{fontSize:13,color:"#7b78a0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
        <span style={{color:"#e8e4ff",fontWeight:600}}>ZeroToDS</span><span> — Free Python phase. No card.</span>
      </div>
      <button onClick={onSignup} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"10px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>
        Start Free →
      </button>
    </div>
  );
}

function LoginPage(){
  const [showLogin,setShowLogin]=useState(false);
  const [showBlog,setShowBlog]=useState(false);
  const [showCourses,setShowCourses]=useState(false);
  const [authTab,setAuthTab]=useState("signup");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [username,setUsername]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [studentCount,setStudentCount]=useState(null);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"users"),snap=>{
      const count=snap.docs.filter(d=>d.data().role!=="admin"&&!d.data().disabled).length;
      setStudentCount(count);
    });
    return unsub;
  },[]);

  const openModal=(tab="signup")=>{setAuthTab(tab);setEmail("");setPassword("");setUsername("");setError("");setShowLogin(true);};

  const handleLogin=async()=>{
    setError("");
    if(!email.trim()||!password.trim()){setError("Please enter email and password.");return;}
    setLoading(true);
    try{await signInWithEmailAndPassword(auth,email.trim(),password);}
    catch(e){setError("Invalid email or password.");}
    setLoading(false);
  };

  const handleSignup=async()=>{
    setError("");
    if(!username.trim()){setError("Please enter your name.");return;}
    if(!email.trim()||!password.trim()){setError("Please enter email and password.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    setLoading(true);
    try{
      const cred=await createUserWithEmailAndPassword(auth,email.trim(),password);
      const refCode=new URLSearchParams(window.location.search).get("ref")||null;
      const userData={
        uid:cred.user.uid,
        email:email.trim(),
        username:username.trim(),
        role:"free",
        joinedAt:Date.now(),
        disabled:false,
        lessonsDone:{},
        streak:0,
        progress:{},
        xp:0,
        completedProjects:{},
        onboarded:false,
        lastLessonId:"numpy",
        referralCode:cred.user.uid.slice(0,6).toUpperCase(),
        referredBy:refCode,
        referralCount:0,
      };
      // 🎉 Confetti - fire immediately before anything else
      if(window.triggerConfetti) window.triggerConfetti();
      await setDoc(doc(db,"users",cred.user.uid),userData);
      // Notify admin of new signup
      await addDoc(collection(db,"notifications"),{
        type:"new_signup",
        username:username.trim(),
        email:email.trim(),
        joinedAt:Date.now(),
        read:false,
      });
    }catch(e){
      if(e.code==="auth/email-already-in-use")setError("An account with this email already exists.");
      else setError("Signup failed. Please try again.");
    }
    setLoading(false);
  };

  const inp={background:"#0f0e1a",border:"1px solid #2a2845",borderRadius:8,padding:"10px 14px",color:"#e8e4ff",fontSize:13,width:"100%",outline:"none",boxSizing:"border-box"};

  const phases=[
    {num:"01",icon:"🐍",title:"Python & Data Tools",desc:"NumPy, Pandas, SQL, Statistics, EDA",color:"#7eb8f7",time:"Months 1–2",lessons:["Python Core","NumPy & Arrays","Pandas","SQL","Statistics","EDA"]},
    {num:"02",icon:"🤖",title:"Machine Learning",desc:"Linear models, Random Forests, sklearn",color:"#a78bfa",time:"Months 2–4",lessons:["Linear Regression","Logistic Regression","Decision Trees","Random Forests","Cross-Validation"]},
    {num:"03",icon:"📊",title:"Advanced ML",desc:"XGBoost, feature engineering, SHAP",color:"#6dd6a0",time:"Months 3–7",lessons:["XGBoost","Feature Engineering","SHAP","ML Pipelines","Hyperparameter Tuning"]},
    {num:"04",icon:"🧠",title:"Deep Learning & LLMs",desc:"Neural nets, NLP, transformers, RAG",color:"#f7c96e",time:"Months 7–12",lessons:["Neural Networks","PyTorch","NLP","Transformers","RAG & LLMs"]},
    {num:"05",icon:"🚀",title:"Portfolio & Jobs",desc:"Projects, interview prep, networking",color:"#c792ea",time:"Months 12–18",lessons:["Portfolio Projects","Streamlit Apps","GitHub Profile","Interview Prep","Networking"]},
  ];

  const features=[
    {icon:"📚",title:"Interactive Lessons",desc:"Code examples, quizzes, and explanations — all inside the platform. No external links."},
    {icon:"🗺️",title:"Connected Roadmap",desc:"Lessons link directly to your roadmap. Complete a lesson → task gets checked off automatically."},
    {icon:"🔥",title:"Streak Tracking",desc:"Daily streaks and weekly check-ins keep you consistent when motivation dips."},
    {icon:"🚀",title:"Real Projects",desc:"11 portfolio-worthy projects built into the curriculum with real datasets and deployment."},
    {icon:"🏅",title:"Leaderboard",desc:"See where you stand. Friendly competition keeps the energy high."},
    {icon:"💬",title:"Instructor Access",desc:"Direct messaging with your instructor. Small cohorts, personal guidance."},
  ];

  return(
    <div style={{minHeight:"100vh",background:"#0b0a12",color:"#e8e4ff",fontFamily:"'Segoe UI',system-ui,sans-serif",overflowX:"hidden"}}>

      {showBlog&&<PublicBlogPage onBack={()=>setShowBlog(false)}/>}
      {showCourses&&<CoursesPage onBack={()=>setShowCourses(false)} onSignup={()=>{setShowCourses(false);openModal("signup");}}/>}
      {!showBlog&&!showCourses&&<>

      {/* STICKY CTA BAR */}
      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .sticky-bar { animation: fadeDown 0.3s ease; }
        @media(max-width:768px){
          .phase-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
        }
        @media(max-width:480px){
          .phase-grid { grid-template-columns: 1fr !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a, .hero-btns button { text-align: center !important; justify-content: center !important; }
          .jobs-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .paths-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
          .stat-box { flex: 1 1 55px !important; padding: 10px 8px !important; }
          .stat-box .stat-n { font-size: 14px !important; }
          .nav-start-btn { padding: 8px 14px !important; font-size: 12px !important; }
          .sticky-bar-text { font-size: 11px !important; }
          .sticky-bar-text span { display: none !important; }
          .founder-pill { flex-direction: column !important; text-align: center !important; border-radius: 12px !important; }
          .hero-section { padding: 80px 16px 40px !important; }
          .section-pad { padding: 40px 16px !important; }
          .pricing-note { flex-direction: column !important; text-align: center !important; }
        }
      `}</style>
      <ScrollProgress />
      <Confetti />
      <StickyBar onSignup={()=>openModal("signup")} />
      <WhatsAppFloat />

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",background:"rgba(11,10,18,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35",flexWrap:"wrap",gap:8}}>
        <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
          ZeroToDS
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setShowCourses(true)} className="nav-links" style={{background:"none",border:"none",color:"#7b78a0",cursor:"pointer",fontSize:13,fontWeight:500}}>Courses</button>
          <button onClick={()=>setShowBlog(true)} className="nav-links" style={{background:"none",border:"none",color:"#7b78a0",cursor:"pointer",fontSize:13,fontWeight:500}}>Blog</button>
          <a href="#apply" className="nav-links" style={{background:"none",border:"none",color:"#7b78a0",cursor:"pointer",fontSize:13,fontWeight:500,textDecoration:"none"}}>Pricing</a>
          <button onClick={()=>openModal("login")} className="nav-links" style={{background:"none",border:"1px solid #2a2845",color:"#7b78a0",padding:"9px 16px",borderRadius:6,cursor:"pointer",fontSize:13}}>Login</button>
          <button onClick={()=>openModal("signup")} className="nav-start-btn" style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"9px 20px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600}}>Start Free →</button>
        </div>
      </nav>

      {/* AUTH MODAL */}
      {showLogin&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(6px)"}}>
          <div style={{background:"#11101c",border:"1px solid #2a2845",borderRadius:16,padding:"36px",width:360,maxWidth:"90vw",position:"relative"}}>
            <button onClick={()=>setShowLogin(false)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#4a4665",cursor:"pointer",fontSize:18}}>✕</button>
            {/* Tabs */}
            <div style={{display:"flex",gap:0,background:"#0b0a12",borderRadius:10,padding:4,marginBottom:24}}>
              {["signup","login"].map(t=>(
                <button key={t} onClick={()=>{setAuthTab(t);setError("");}} style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:authTab===t?"#8b7cf6":"transparent",color:authTab===t?"#fff":"#7b78a0",transition:"all 0.2s"}}>
                  {t==="signup"?"Start Free":"Sign In"}
                </button>
              ))}
            </div>
            {authTab==="signup"&&(
              <div>
                <div style={{fontSize:12,color:"#7b78a0",textAlign:"center",marginBottom:20,lineHeight:1.6}}>Free access to the full <strong style={{color:"#8b7cf6"}}>Python for DS</strong> phase — no card needed.</div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#7b78a0",marginBottom:5}}>YOUR NAME</div>
                  <input style={inp} value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. Ahmad"/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#7b78a0",marginBottom:5}}>EMAIL</div>
                  <input style={inp} value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
                </div>
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:"#7b78a0",marginBottom:5}}>PASSWORD</div>
                  <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} placeholder="At least 6 characters"/>
                </div>
                {error&&<div style={{fontSize:11,color:"#f28b82",marginBottom:12,background:"rgba(242,139,130,0.1)",padding:"8px 12px",borderRadius:6}}>{error}</div>}
                <button onClick={handleSignup} disabled={loading} style={{width:"100%",padding:"11px",background:"#8b7cf6",border:"none",color:"#fff",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,opacity:loading?0.7:1}}>
                  {loading?"Creating account...":"Create Free Account →"}
                </button>
                <div style={{marginTop:12,fontSize:11,color:"#3a3860",textAlign:"center"}}>Already enrolled? <span onClick={()=>setAuthTab("login")} style={{color:"#8b7cf6",cursor:"pointer"}}>Sign in</span></div>
              </div>
            )}
            {authTab==="login"&&(
              <div>
                <div style={{textAlign:"center",marginBottom:24}}>
                  <div style={{fontSize:26,marginBottom:8}}>🎓</div>
                  <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>Welcome back</div>
                  <div style={{fontSize:12,color:"#7b78a0"}}>Sign in to your ZeroToDS account</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#7b78a0",marginBottom:5}}>EMAIL</div>
                  <input style={inp} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your email"/>
                </div>
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:"#7b78a0",marginBottom:5}}>PASSWORD</div>
                  <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your password"/>
                </div>
                {error&&<div style={{fontSize:11,color:"#f28b82",marginBottom:12,background:"rgba(242,139,130,0.1)",padding:"8px 12px",borderRadius:6}}>{error}</div>}
                <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"11px",background:"#8b7cf6",border:"none",color:"#fff",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,opacity:loading?0.7:1}}>
                  {loading?"Signing in...":"Sign In"}
                </button>
                <div style={{marginTop:14,fontSize:11,color:"#3a3860",textAlign:"center"}}>No account? <span onClick={()=>setAuthTab("signup")} style={{color:"#8b7cf6",cursor:"pointer"}}>Start free</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="hero-section" style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"100px 20px 50px",position:"relative",overflow:"hidden"}}>
        {/* grid bg */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#1e1c35 1px, transparent 1px),linear-gradient(90deg, #1e1c35 1px, transparent 1px)",backgroundSize:"50px 50px",WebkitMaskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",maskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",opacity:0.4}}/>
        {/* glow */}
        <div style={{position:"absolute",width:500,height:500,background:"rgba(139,124,246,0.1)",borderRadius:"50%",filter:"blur(80px)",top:-100,left:-100,zIndex:0}}/>
        <div style={{position:"absolute",width:400,height:400,background:"rgba(110,231,183,0.06)",borderRadius:"50%",filter:"blur(80px)",bottom:-50,right:-50,zIndex:0}}/>

        <div style={{position:"relative",zIndex:1,maxWidth:720}}>

          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#8b7cf615",border:"1px solid #8b7cf630",borderRadius:100,padding:"5px 16px",marginBottom:16,fontSize:13}}>
            <span style={{direction:"rtl",fontFamily:"serif",color:"#a78bfa",letterSpacing:"0.02em"}}>طريقك لعلم البيانات — من الصفر للاحتراف</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(32px, 6vw, 58px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:14}}>
            Still lost after months of tutorials?<br/>
            <span style={{background:"linear-gradient(135deg, #8b7cf6, #f472b6, #6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              This roadmap fixes it.
            </span>
          </h1>

          <p style={{fontSize:15,color:"#7b78a0",maxWidth:500,margin:"0 auto 10px",lineHeight:1.6}}>
            I'm Radwan — I wasted years in tutorial hell before I built a structured path out. Now I help Arab students go from confused beginner → first real project and job-ready portfolio.
          </p>

          {/* FOUNDER ATTRIBUTION */}
          <div className="founder-pill" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#17162a",border:"1px solid #1e1c35",borderRadius:100,padding:"6px 14px",marginBottom:20}}>
            <img src="/radwan.jpg" alt="Radwan" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",flexShrink:0,border:"1px solid #2a2845"}}/>
            <div style={{fontSize:12,color:"#7b78a0",fontStyle:"italic"}}>28 y/o · wasted years in tutorial hell · built this to help you skip my mistakes</div>
            <div style={{fontSize:11,color:"#8b7cf6",fontFamily:"monospace",whiteSpace:"nowrap"}}>— Radwan</div>
          </div>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:8}} className="hero-btns">
            <button onClick={()=>openModal("signup")} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"14px 32px",borderRadius:8,cursor:"pointer",fontSize:15,fontWeight:700,display:"inline-flex",alignItems:"center",gap:6,boxShadow:"0 0 30px rgba(139,124,246,0.3)"}}>
              Start Free — No Card Needed →
            </button>
          </div>
          <div style={{fontSize:12,color:"#4a4665",marginBottom:20,textAlign:"center"}}>
            Instant access to the full Python phase — 12 lessons, no card required · <a href="#curriculum" style={{color:"#8b7cf6",textDecoration:"none"}}>See curriculum ↓</a>
          </div>

          {/* Stats */}
          <style>{`
            @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
            .stat-box { transition: background 0.2s; }
            .stat-box:hover { background: #1a1830 !important; }
            .lp-card { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
            .lp-card:hover { transform: translateY(-5px); box-shadow: 0 8px 24px rgba(139,124,246,0.15); border-color: #8b7cf644 !important; }
            .lp-card-green:hover { box-shadow: 0 8px 24px rgba(110,214,160,0.15); border-color: #6dd6a044 !important; }
            .lp-card-blue:hover { box-shadow: 0 8px 24px rgba(126,184,247,0.15); border-color: #7eb8f744 !important; }
          `}</style>
          <div style={{display:"flex",justifyContent:"center",gap:0,border:"1px solid #1e1c35",borderRadius:12,overflow:"hidden",background:"#11101c",flexWrap:"wrap"}}>
            {[{n:"18+",l:"Lessons"},{n:"5",l:"Phases"},{n:"11",l:"Projects"},{n:"MENA",l:"Region Focus"},{n:"0 → Job",l:"The Goal"}].map((s,i)=>(
              <div key={i} className="stat-box" style={{padding:"12px 20px",textAlign:"center",borderRight:"1px solid #1e1c35",flex:"1 1 80px",cursor:"default"}}>
                <div style={{fontWeight:800,fontSize:18,letterSpacing:"-0.02em",color:"#e8e4ff"}}>{s.n}</div>
                <div style={{fontSize:10,color:"#3a3860",letterSpacing:"0.08em",marginTop:2,fontFamily:"monospace"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,textAlign:"center"}}>
            <VisitorCounter/>
          </div>
        </div>

        {/* PLATFORM MOCKUP - hidden to keep hero compact */}

        {/* Bottom gradient fade */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to bottom, transparent, #0b0a12)",pointerEvents:"none",zIndex:2}}/>

      </div>

      {/* CURRICULUM */}
      <div id="curriculum" className="section-pad" style={{padding:"50px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// curriculum</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>A clear path. No guessing.</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:28,maxWidth:480}}>Every phase builds on the last. No tutorial hell — just a structured sequence designed around what employers hire for.</p>
          <style>{`
            @keyframes fadeUp2 { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            .pc { animation: fadeUp2 0.5s ease forwards; opacity:0; }
            .pc:nth-child(1){animation-delay:0.1s}
            .pc:nth-child(2){animation-delay:0.25s}
            .pc:nth-child(3){animation-delay:0.4s}
            .pc:nth-child(4){animation-delay:0.55s}
            .pc:nth-child(5){animation-delay:0.7s}
            .pc:hover{transform:translateY(-6px)!important;transition:transform 0.2s ease;}
          `}</style>
          <div className="phase-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14}}>
            {phases.map((p,i)=>(
              <div key={p.num} className="pc" style={{background:"#11101c",border:`1px solid ${p.color}33`,borderTop:`4px solid ${p.color}`,borderRadius:14,padding:"24px 18px",cursor:"default",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:p.color+"08",borderRadius:"0 0 0 80px"}}/>
                <div style={{fontSize:32,marginBottom:12}}>{p.icon}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:p.color,marginBottom:6,letterSpacing:"0.1em",fontWeight:700}}>{p.num}</div>
                <div style={{fontWeight:800,fontSize:15,color:"#e8e4ff",marginBottom:6,lineHeight:1.3}}>{p.title}</div>
                <div style={{marginBottom:14,display:"flex",flexDirection:"column",gap:4}}>
                  {p.lessons.map((l,li)=>(
                    <div key={li} style={{fontSize:11,color:"#7b78a0",display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:p.color,flexShrink:0,opacity:0.6}}/>
                      {l}
                    </div>
                  ))}
                </div>
                <span style={{fontSize:11,fontFamily:"monospace",padding:"4px 10px",borderRadius:100,background:p.color+"18",color:p.color,fontWeight:600}}>{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JOBS — hidden to reduce page length */}
      <div style={{display:"none"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// career outcomes</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>What jobs can you land?</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:24,maxWidth:520}}>The curriculum is designed around real job requirements. Here's what graduates are prepared to apply for:</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16}} className="jobs-grid">
            {[
              {icon:"📊",title:"Data Analyst",skills:["SQL","Python","Pandas","Visualization","Statistics"],color:"#7eb8f7",desc:"Turn raw data into business insights. Most in-demand DS role in the market."},
              {icon:"🤖",title:"Data Scientist",skills:["ML","sklearn","Statistics","Python","Communication"],color:"#8b7cf6",desc:"Build predictive models and drive data-informed decisions across the company."},
              {icon:"⚙️",title:"ML Engineer",skills:["sklearn","Pipelines","Docker","APIs","Python"],color:"#6dd6a0",desc:"Deploy and maintain ML models in production. Bridge between DS and engineering."},
              {icon:"🐍",title:"Python Developer (Data)",skills:["Python","Pandas","APIs","Automation","SQL"],color:"#f7c96e",desc:"Automate data workflows, build internal tools, and work with data pipelines."},
            ].map((job,i)=>(
              <div key={i} className="lp-card" style={{background:"#0b0a12",border:"1px solid #1e1c35",borderRadius:12,padding:"22px"}}>
                <div style={{fontSize:28,marginBottom:12}}>{job.icon}</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6,color:job.color}}>{job.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.6,marginBottom:14}}>{job.desc}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {job.skills.map(s=>(
                    <span key={s} style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:100,background:job.color+"15",color:job.color}}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:24,padding:"16px 20px",background:"#11101c",border:"1px solid #1e1c35",borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20}}>🐍</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#e8e4ff",marginBottom:3}}>Never coded before? That's fine.</div>
              <div style={{fontSize:12,color:"#7b78a0"}}>The curriculum starts with Python from absolute zero. Every concept is explained with analogies, code examples, and quizzes before moving on.</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT YOU'LL BUILD */}
      <div className="section-pad" style={{padding:"50px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// projects</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>What you'll actually build.</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:24,maxWidth:520}}>Not toy exercises. Real projects you can show in interviews and deploy live. Every project has a business context, real data, and a deployed demo.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16}} className="projects-grid">
            {[
              {
                icon:"📉",title:"Customer Churn Predictor",
                desc:"Predict which customers will leave before they do. Calculate the dollar value of retention. Deploy as a live Streamlit app.",
                stack:["Python","XGBoost","Streamlit","Pandas"],
                color:"#7eb8f7",
                outcome:"Live demo URL you can share in interviews",
                colab:"https://colab.research.google.com/github/topics/customer-churn"
              },
              {
                icon:"🔍",title:"Fraud Detection Model",
                desc:"Handle 99.8% class imbalance on real credit card data. Optimize for recall. Build a pipeline that works in production.",
                stack:["sklearn","SMOTE","Random Forest","Pipelines"],
                color:"#f472b6",
                outcome:"Kaggle dataset, real business framing",
                colab:"https://colab.research.google.com/github/topics/fraud-detection"
              },
              {
                icon:"📊",title:"Full A/B Test Analysis",
                desc:"Go beyond the p-value. Calculate confidence intervals, practical significance, and write a recommendation memo to a PM.",
                stack:["Python","NumPy","Statistics","scipy"],
                color:"#6dd6a0",
                outcome:"Business memo + technical notebook",
                colab:"https://colab.research.google.com/github/topics/ab-testing"
              },
              {
                icon:"🗄️",title:"Business KPI Dashboard in SQL",
                desc:"Answer 10 real business questions using CTEs, window functions, and joins on a real music store database.",
                stack:["SQL","CTEs","Window Functions","Chinook DB"],
                color:"#f7c96e",
                outcome:"Portfolio-ready SQL showcase",
                colab:"https://colab.research.google.com/github/topics/sql"
              },
              {
                icon:"🤖",title:"RAG-Powered Document Q&A",
                desc:"Build a system that lets users ask questions about any document. Uses embeddings, vector search, and an LLM API.",
                stack:["LangChain","FAISS","OpenAI API","Streamlit"],
                color:"#a78bfa",
                outcome:"Deployed on Hugging Face Spaces",
                colab:"https://colab.research.google.com/github/topics/rag"
              },
              {
                icon:"🧠",title:"Fine-tuned BERT Classifier",
                desc:"Fine-tune a pretrained BERT model on real domain text. Wrap in FastAPI and deploy to Hugging Face Spaces.",
                stack:["Hugging Face","BERT","FastAPI","NLP"],
                color:"#34d399",
                outcome:"Live API endpoint + model card",
                colab:"https://colab.research.google.com/github/topics/bert"
              },
            ].map((p,i)=>(
              <div key={i} className="lp-card" style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:12,padding:"22px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:p.color+"66"}}/>
                <div style={{fontSize:28,marginBottom:12}}>{p.icon}</div>
                <div style={{fontWeight:700,fontSize:15,color:"#e8e4ff",marginBottom:6}}>{p.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.6,marginBottom:14}}>{p.desc}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                  {p.stack.map(s=>(
                    <span key={s} style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:100,background:p.color+"15",color:p.color}}>{s}</span>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #1e1c35",paddingTop:10,gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace"}}>✓ {p.outcome}</div>
                  <a href={p.colab} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:p.color,background:p.color+"12",border:`1px solid ${p.color}33`,borderRadius:6,padding:"3px 10px",textDecoration:"none",fontWeight:600,whiteSpace:"nowrap"}}>▶ Open in Colab</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CAREER PATHS — hidden to reduce page length */}
      <div style={{display:"none"}}>
        <div style={{padding:"50px 20px",background:"#0d0c18"}}>
          <div style={{maxWidth:1000,margin:"0 auto"}}>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:24,maxWidth:520}}>Three distinct career paths — the same curriculum, different focus. Unlock the full path breakdown inside your dashboard.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}} className="paths-grid">
            {[
              {icon:"📊",title:"Data Analyst",tagline:"Turn data into decisions",color:"#7eb8f7",time:"6–9 months",salary:"$45k–$80k",demand:"Very High",skills:["SQL","Python","Statistics","Visualization"]},
              {icon:"🧠",title:"Data Scientist",tagline:"Build models that predict",color:"#a78bfa",time:"10–14 months",salary:"$60k–$120k",demand:"High",skills:["ML","XGBoost","SHAP","Statistics"]},
              {icon:"⚙️",title:"ML Engineer",tagline:"Deploy ML to production",color:"#6dd6a0",time:"12–18 months",salary:"$80k–$150k",demand:"Growing fast",skills:["MLOps","Docker","FastAPI","LLMs"]},
            ].map((path,i)=>(
              <div key={i} className="lp-card" style={{background:"#11101c",border:`1px solid ${path.color}22`,borderTop:`3px solid ${path.color}`,borderRadius:12,padding:"22px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:path.color+"08",borderRadius:"0 0 0 60px"}}/>
                <div style={{fontSize:30,marginBottom:12}}>{path.icon}</div>
                <div style={{fontSize:17,fontWeight:700,color:path.color,marginBottom:4}}>{path.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",marginBottom:14}}>{path.tagline}</div>
                <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                  <div><div style={{fontSize:9,color:"#4a4665",letterSpacing:"0.1em"}}>TIMELINE</div><div style={{fontSize:12,fontWeight:600,color:path.color}}>{path.time}</div></div>
                  <div><div style={{fontSize:9,color:"#4a4665",letterSpacing:"0.1em"}}>SALARY</div><div style={{fontSize:12,fontWeight:600,color:path.color}}>{path.salary}</div></div>
                  <div><div style={{fontSize:9,color:"#4a4665",letterSpacing:"0.1em"}}>DEMAND</div><div style={{fontSize:12,fontWeight:600,color:path.color}}>{path.demand}</div></div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {path.skills.map(s=><span key={s} style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:100,background:path.color+"15",color:path.color}}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:20,textAlign:"center"}}>
            <div style={{fontSize:12,color:"#4a4665",marginBottom:8}}>Full path breakdown — which phases to focus on, interview prep, MENA companies hiring — available inside your dashboard.</div>
          </div>
        </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="apply" style={{padding:"50px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12,textAlign:"center"}}>// pricing</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:8,textAlign:"center"}}>Simple, honest pricing.</h2>
          <p style={{color:"#7b78a0",fontSize:15,margin:"0 auto 12px",maxWidth:480,textAlign:"center"}}>Start completely free. No credit card. No tricks. Upgrade only when you're ready.</p>
          {/* Value context */}
          <div style={{textAlign:"center",marginBottom:24}}>
            <span style={{fontSize:12,color:"#4a4665"}}>Coursera charges $49/month for less. </span>
            <span style={{fontSize:12,color:"#6dd6a0",fontWeight:600}}>We start at $0. Forever.</span>
          </div>
          {/* Social proof anchor */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"#17162a",border:"1px solid #8b7cf633",borderRadius:100,padding:"8px 20px"}}>
              <div style={{display:"flex",gap:-4}}>
                {["🇱🇧","🇯🇴","🇸🇦","🇪🇬"].map((f,i)=>(
                  <span key={i} style={{fontSize:14,marginLeft:i>0?-4:0}}>{f}</span>
                ))}
              </div>
              <span style={{fontSize:12,color:"#8b7cf6",fontWeight:600}}>Students from across MENA already enrolled</span>
              <span style={{fontSize:11,color:"#4a4665"}}>— Phase 1 cohort filling up</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:32}} className="pricing-grid">

            {/* FREE */}
            <div style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:16,padding:"28px",position:"relative",overflow:"hidden"}}>
              <div style={{fontSize:11,color:"#7b78a0",letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:12}}>FREE</div>
              <div style={{fontSize:34,fontWeight:800,color:"#e8e4ff",marginBottom:2}}>$0</div>
              <div style={{fontSize:12,color:"#4a4665",marginBottom:22}}>forever</div>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                {["Python for Data Science (all lessons)","Full SQL — SELECT through window functions","Probability & Bayes","Section quizzes","Roadmap & XP tracking"].map(f=>(
                  <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#7b78a0"}}><span style={{color:"#6dd6a0",flexShrink:0}}>✓</span>{f}</div>
                ))}
                {["Statistics, ML & Deep Learning","Portfolio projects","Certificates"].map(f=>(
                  <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#2a2845"}}><span style={{flexShrink:0}}>–</span>{f}</div>
                ))}
              </div>
              <button onClick={()=>openModal("signup")} style={{width:"100%",padding:"11px",background:"transparent",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Start Free →</button>
            </div>

            {/* MONTHLY - demoted */}
            <div style={{background:"#0e0d1a",border:"1px solid #1e1c35",borderRadius:16,padding:"24px",position:"relative",overflow:"hidden",opacity:0.85}}>
              <div style={{fontSize:11,color:"#6dd6a0",letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:12}}>SELF-PACED</div>
              <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                <span style={{fontSize:34,fontWeight:800,color:"#e8e4ff"}}>$19</span>
                <span style={{fontSize:13,color:"#4a4665"}}>/month</span>
              </div>
              <div style={{fontSize:12,color:"#4a4665",marginBottom:22}}>cancel anytime</div>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                {["Everything in Free","Full access to all 5 phases","All ML, Deep Learning & MLOps lessons","11 portfolio projects with datasets","Phase completion certificates","Leaderboard & community"].map(f=>(
                  <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#c8c3e0"}}><span style={{color:"#6dd6a0",flexShrink:0}}>✓</span>{f}</div>
                ))}
                {["Weekly Zoom sessions","Private WhatsApp group"].map(f=>(
                  <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#2a2845"}}><span style={{flexShrink:0}}>–</span>{f}</div>
                ))}
              </div>
              <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20the%20DS%20Academy%20monthly%20plan%20($19/mo).%20Please%20send%20payment%20details."} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"11px",background:"#6dd6a018",border:"1px solid #6dd6a055",color:"#6dd6a0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center",boxSizing:"border-box"}}>
                Get Monthly Access →
              </a>
            </div>

            {/* COHORT */}
            <div style={{background:"#11101c",border:"2px solid #8b7cf6",borderRadius:16,padding:"28px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-1,left:"15%",right:"15%",height:2,background:"linear-gradient(90deg,transparent,#8b7cf6,#f472b6,transparent)"}}/>
              <div style={{position:"absolute",top:14,right:14,background:"#8b7cf620",border:"1px solid #8b7cf644",borderRadius:100,padding:"3px 10px",fontSize:9,color:"#8b7cf6",fontWeight:700,fontFamily:"monospace"}}>MOST POPULAR</div>
              <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:12}}>PHASE 1 COHORT</div>
              {/* SPOTS COUNTER */}
              <div style={{background:"#f28b8211",border:"1px solid #f28b8233",borderRadius:8,padding:"8px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#f28b82",boxShadow:"0 0 6px #f28b82",flexShrink:0}}/>
                <span style={{fontSize:12,color:"#f28b82",fontWeight:600}}>Only 3 spots remaining</span>
                <span style={{fontSize:11,color:"#4a4665",marginLeft:"auto"}}>10 max per cohort</span>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                <span style={{fontSize:34,fontWeight:800,color:"#e8e4ff"}}>$99</span>
                <span style={{fontSize:13,color:"#4a4665"}}>one-time</span>
              </div>
              <div style={{fontSize:12,color:"#4a4665",marginBottom:22}}>3 months · Phase 1 only</div>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                {["Everything in Self-Paced","Weekly live Zoom sessions with Radwan","Private WhatsApp group","Direct instructor messaging","Phase 1 certificate on completion","Small cohort — max 10 students"].map(f=>(
                  <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#c8c3e0"}}><span style={{color:"#8b7cf6",flexShrink:0}}>✓</span>{f}</div>
                ))}
              </div>
              {/* INSTRUCTOR */}
              <div style={{display:"flex",alignItems:"center",gap:12,background:"#0b0a12",border:"1px solid #2a2845",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <img src="/radwan.jpg" alt="Radwan" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",border:"2px solid #8b7cf644",flexShrink:0}}/>
                <div>
                  <div style={{fontSize:12,color:"#7b78a0",marginBottom:2}}>You'll work directly with</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#e8e4ff"}}>Radwan</div>
                  <div style={{fontSize:11,color:"#8b7cf6",fontFamily:"monospace"}}>Founder · Researcher → DS</div>
                </div>
                <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#6dd6a0",boxShadow:"0 0 8px #6dd6a0",flexShrink:0}}/>
              </div>
              <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20join%20the%20DS%20Academy%20Phase%201%20Cohort%20($99).%20Please%20send%20payment%20details."} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"11px",background:"#8b7cf6",border:"none",color:"#fff",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center",boxSizing:"border-box"}}>
                Enroll via WhatsApp →
              </a>
              <div style={{fontSize:11,color:"#4a4665",textAlign:"center",marginTop:8}}>Wise · local transfer · cash</div>
            </div>
          </div>

          <div className="pricing-note" style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:12,padding:"18px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",justifyContent:"center",textAlign:"center"}}>
            <span style={{fontSize:18}}>🤝</span>
            <div style={{fontSize:13,color:"#7b78a0",lineHeight:1.7}}>
              <strong style={{color:"#e8e4ff"}}>No automated checkout.</strong> Message on WhatsApp → confirm payment → account activated within 24h. Simple.
            </div>
          </div>
        </div>
      </div>

      {/* FOUNDER STORY */}
      <div className="section-pad" style={{padding:"60px 20px",background:"#0b0a12",borderTop:"1px solid #1e1c35"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// why this exists</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,4vw,32px)",letterSpacing:"-0.02em",marginBottom:28,lineHeight:1.2}}>
            I was you. Stuck, confused,<br/>convinced I was doing it wrong.
          </h2>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {label:"The Problem", color:"#f472b6", text:"At 28, I spent months jumping between YouTube tutorials, Udemy courses, and random blog posts. I felt busy but I wasn't building anything. No projects, no direction, no idea if I was even learning the right things."},
              {label:"The Breaking Point", color:"#f7c96e", text:"I realized tutorial hell is a trap — you feel like you're learning because you're watching, but you're not practicing. Every new course felt like the answer. None of them were."},
              {label:"What I Built", color:"#8b7cf6", text:"So I mapped out the exact sequence a data scientist needs. Python → SQL → Stats → ML → Projects. One connected path, not 40 disconnected courses. I added real coding exercises, portfolio projects, and a roadmap so you always know where you are."},
              {label:"Why MENA", color:"#6dd6a0", text:"Resources exist in English for Western students. But Arab students in Lebanon, Egypt, Jordan — they deserve a platform built around their reality: Arabic support, local context, affordable pricing, and an instructor who responds on WhatsApp."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:3,borderRadius:10,background:s.color,flexShrink:0,minHeight:60,marginTop:4}}/>
                <div>
                  <div style={{fontSize:10,color:s.color,fontFamily:"monospace",letterSpacing:"0.1em",fontWeight:700,marginBottom:4}}>{s.label}</div>
                  <p style={{margin:0,color:"#9b98b8",fontSize:14,lineHeight:1.75}}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:32,display:"flex",alignItems:"center",gap:14,background:"#11101c",border:"1px solid #1e1c35",borderRadius:12,padding:"16px 20px"}}>
            <img src="/radwan.jpg" alt="Radwan" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",border:"2px solid #8b7cf644",flexShrink:0}}/>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#e8e4ff"}}>Radwan Rima</div>
              <div style={{fontSize:12,color:"#4a4665",marginTop:2}}>Founder, ZeroToDS · Data Scientist · Based in Lebanon</div>
            </div>
            <a href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20read%20your%20story%20and%20want%20to%20learn%20more." target="_blank" rel="noopener noreferrer" style={{marginLeft:"auto",background:"#25D36618",border:"1px solid #25D36644",color:"#25D366",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>
              💬 Talk to me
            </a>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <TestimonialsCarousel />

      {/* FAQ */}
      <div style={{padding:"50px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// faq</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,4vw,34px)",letterSpacing:"-0.02em",marginBottom:28}}>Questions we always get.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {q:"Is this in Arabic or English?",a:"The platform is in English — but Radwan speaks Arabic and all live Zoom sessions in the cohort are conducted in Arabic (Lebanese/Levantine). You can message him in Arabic on WhatsApp anytime."},
              {q:"Do I need a powerful laptop?",a:"No. All interactive lessons run in the browser using Pyodide — no installation needed. Any laptop from the last 5 years works fine. Even a basic phone can access the content."},
              {q:"How much time per day do I need?",a:"Around 1–2 hours per day is ideal. The curriculum is designed for students and working professionals. There are no live deadlines on the self-paced plan."},
              {q:"What if I have zero coding experience?",a:"Perfect — that's exactly who this is built for. Phase 1 starts from Python absolute zero. If you can use WhatsApp, you can start this."},
              {q:"How is this different from Coursera or YouTube?",a:"Coursera gives you disconnected courses. YouTube gives you tutorials with no structure. DS Academy gives you one connected path with projects, XP tracking, a roadmap, and direct access to a real instructor."},
              {q:"What happens after I sign up for free?",a:"You get instant access to the full Python phase — 12 lessons covering Python Core, NumPy, Pandas, SQL, EDA, Visualization, and Probability — with interactive code exercises, quizzes, and a portfolio project. No credit card, no trial period."},
            ].map((f,i)=>(
              <FAQItem key={i} q={f.q} a={f.a}/>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{padding:"60px 20px",background:"linear-gradient(135deg, #13111e 0%, #1a1530 50%, #13111e 100%)",borderTop:"1px solid #2a2845",textAlign:"center",position:"relative",overflow:"hidden"}}>
        {/* glow */}
        <div style={{position:"absolute",width:400,height:400,background:"rgba(139,124,246,0.08)",borderRadius:"50%",filter:"blur(80px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:600,margin:"0 auto"}}>
          <div style={{fontSize:13,color:"#8b7cf6",fontFamily:"monospace",letterSpacing:"0.15em",marginBottom:16}}>// ready to start?</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(28px,5vw,48px)",lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:16}}>
            Your first real DS project<br/>
            <span style={{background:"linear-gradient(135deg,#8b7cf6,#f472b6,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              starts today. For free.
            </span>
          </h2>
          <p style={{fontSize:15,color:"#7b78a0",marginBottom:28,lineHeight:1.6}}>
            Skip the tutorial hell I went through. Get the structured path,<br/>real projects, and a roadmap that tells you exactly what to do next.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
            <button onClick={()=>openModal("signup")} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"14px 32px",borderRadius:8,cursor:"pointer",fontSize:15,fontWeight:700,display:"inline-flex",alignItems:"center",gap:8}}>
              Start Free — No Card Needed →
            </button>
            <a href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20learn%20more%20about%20DS%20Academy." target="_blank" rel="noopener noreferrer" style={{background:"#25D36618",border:"1px solid #25D36644",color:"#25D366",padding:"14px 24px",borderRadius:8,cursor:"pointer",fontSize:15,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8}}>
              💬 Ask Radwan first
            </a>
          </div>
          <div style={{fontSize:12,color:"#3a3860"}}>
            Or message on WhatsApp · response within 24h · built in Lebanon 🇱🇧
          </div>
        </div>
      </div>

      <EmailCapture/>

      {/* FOOTER */}
      <div style={{borderTop:"1px solid #1e1c35",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto",padding:"48px 32px 32px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:40}}>
          {/* Brand */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
              <div style={{fontWeight:800,fontSize:16,color:"#e8e4ff"}}>ZeroToDS</div>
            </div>
            <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.8,marginBottom:16}}>A structured, practical path from zero to job-ready data scientist. No tutorial hell — just what employers hire for.</div>
            <div style={{fontFamily:"monospace",fontSize:10,color:"#3a3860",marginBottom:20}}>Zero → Competitive Candidate</div>
            {/* Social links */}
            <div style={{display:"flex",gap:10}}>
              {[
                {label:"LinkedIn",icon:"in",url:"https://www.linkedin.com/in/radwan-rima/",color:"#7eb8f7"},
                {label:"TikTok",icon:"♪",url:"https://www.tiktok.com/@zero_to_ds",color:"#f472b6"},
                {label:"WhatsApp",icon:"💬",url:"https://wa.me/96181590474",color:"#25D366"},
              ].map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noreferrer"
                  style={{width:34,height:34,borderRadius:8,background:s.color+"15",border:`1px solid ${s.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:s.color,textDecoration:"none",fontWeight:700,transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=s.color+"30";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=s.color+"15";e.currentTarget.style.transform="translateY(0)";}}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Built by */}
          <div>
            <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:14}}>BUILT BY</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid #8b7cf633"}}>
                <img src="/radwan.jpg" alt="Radwan" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#e8e4ff"}}>Radwan Rima</div>
                <div style={{fontSize:11,color:"#7b78a0"}}>Researcher → Data Scientist</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.6,marginBottom:14}}>I built DS Academy because I couldn't find a structured path that actually prepares you for the job market.</div>
            <a href="https://wa.me/96181590474?text=Hi%20Radwan!%20I%20have%20a%20question%20about%20DS%20Academy." target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",color:"#25d366",padding:"7px 14px",borderRadius:7,fontSize:12,fontWeight:600,textDecoration:"none"}}>
              💬 Message Radwan
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:14}}>PLATFORM</div>
            {[
              {label:"View Curriculum",href:"#curriculum"},
              {label:"Pricing & Plans",href:"#apply"},
              {label:"Blog",href:"#blog"},
              {label:"Free Python Phase",href:"#"},
              {label:"AI Job Scanner",href:"#"},
            ].map((l,i)=>(
              <a key={i} href={l.href} style={{display:"block",fontSize:12,color:"#7b78a0",textDecoration:"none",marginBottom:9,transition:"color 0.2s"}}
                onMouseEnter={e=>e.target.style.color="#e8e4ff"}
                onMouseLeave={e=>e.target.style.color="#7b78a0"}>
                → {l.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:14}}>CONTACT</div>
            <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.8,marginBottom:16}}>
              Questions? Message Radwan directly — response within 24 hours.
            </div>
            {[
              {label:"radwanrima0@gmail.com",icon:"✉",href:"mailto:radwanrima0@gmail.com",color:"#8b7cf6"},
              {label:"WhatsApp",icon:"💬",href:"https://wa.me/96181590474",color:"#25D366"},
              {label:"LinkedIn",icon:"in",href:"https://www.linkedin.com/in/radwan-rima/",color:"#7eb8f7"},
            ].map((c,i)=>(
              <a key={i} href={c.href} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#7b78a0",textDecoration:"none",marginBottom:10,transition:"color 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.color=c.color;}}
                onMouseLeave={e=>{e.currentTarget.style.color="#7b78a0";}}>
                <span style={{fontSize:13}}>{c.icon}</span>{c.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{borderTop:"1px solid #1e1c35",padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace"}}>© 2026 ZeroToDS — All rights reserved</div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace"}}>Built in Lebanon 🇱🇧</div>
            <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace"}}>·</div>
            <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace"}}>Powered by Firebase + Netlify</div>
          </div>
        </div>
      </div>

      </>}
    </div>
  );
}

// ── BLOG HELPERS
function slugify(str){return str.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

function renderContent(text){
  // Very simple renderer: ## heading, **bold**, > blockquote, ``` code, ![alt](url) image, bare URL image
  const lines=text.split("\n");
  const out=[];
  let i=0;
  while(i<lines.length){
    const l=lines[i];
    if(l.startsWith("## ")){
      out.push(<h3 key={i} style={{fontSize:18,fontWeight:700,color:"#e2dff0",margin:"28px 0 10px",borderBottom:"1px solid #2a2540",paddingBottom:8}}>{l.slice(3)}</h3>);
    } else if(l.startsWith("# ")){
      out.push(<h2 key={i} style={{fontSize:22,fontWeight:800,color:"#e2dff0",margin:"32px 0 12px"}}>{l.slice(2)}</h2>);
    } else if(l.startsWith("> ")){
      out.push(<blockquote key={i} style={{borderLeft:"3px solid #8b7cf6",margin:"16px 0",padding:"10px 16px",background:"#8b7cf608",color:"#8b87a8",fontSize:14,borderRadius:"0 8px 8px 0"}}>{l.slice(2)}</blockquote>);
    } else if(l.startsWith("```")){
      const codeLines=[];i++;
      while(i<lines.length&&!lines[i].startsWith("```")){codeLines.push(lines[i]);i++;}
      out.push(<pre key={i} style={{background:"#0b0a12",border:"1px solid #2a2540",borderRadius:8,padding:"16px",overflowX:"auto",fontSize:12,lineHeight:1.7,color:"#6dd6a0",margin:"16px 0"}}><code>{codeLines.join("\n")}</code></pre>);
    } else if(/!\[.*?\]\(.*?\)/.test(l)){
      const m=l.match(/!\[(.*?)\]\((.*?)\)/);
      if(m)out.push(<img key={i} src={m[2]} alt={m[1]} style={{width:"100%",maxWidth:700,borderRadius:10,margin:"16px 0",display:"block",border:"1px solid #2a2540"}}/>);
    } else if(/^https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(l.trim())){
      out.push(<img key={i} src={l.trim()} alt="post image" style={{width:"100%",maxWidth:700,borderRadius:10,margin:"16px 0",display:"block",border:"1px solid #2a2540"}}/>);
    } else if(l.trim()===""){
      out.push(<div key={i} style={{height:8}}/>);
    } else {
      // inline bold **text**
      const parts=l.split(/(\*\*.*?\*\*)/g);
      out.push(<p key={i} style={{fontSize:14,lineHeight:1.8,color:"#8b87a8",margin:"6px 0"}}>{parts.map((p,j)=>p.startsWith("**")&&p.endsWith("**")?<strong key={j} style={{color:"#e2dff0"}}>{p.slice(2,-2)}</strong>:p)}</p>);
    }
    i++;
  }
  return out;
}


// ── COURSES PAGE
function CoursesPage({onBack, onSignup}){
  const courses=[
    {
      id:"sql-business",
      emoji:"🗄️",
      tag:"AVAILABLE NOW",
      tagColor:"#6dd6a0",
      title:"SQL for Business",
      subtitle:"Query databases like a data analyst — no coding background needed",
      price:29,
      duration:"4 weeks",
      level:"Beginner",
      audience:"Accountants, finance teams, operations, HR managers",
      color:"#7eb8f7",
      outcomes:["Write SELECT, WHERE, GROUP BY, JOIN queries from scratch","Build a real business KPI dashboard in SQL","Answer 10 real business questions using the Chinook database","Use CTEs and window functions — the skills interviewers test"],
      modules:["Week 1 — SQL Foundations: SELECT, WHERE, ORDER BY","Week 2 — Aggregations: GROUP BY, HAVING, COUNT, SUM","Week 3 — JOINs: combine tables, INNER/LEFT/RIGHT","Week 4 — Advanced: CTEs, window functions, real project"],
      available:true,
    },
    {
      id:"excel-python",
      emoji:"🐍",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Excel to Python",
      subtitle:"Automate everything you do in Excel — in half the time",
      price:29,
      duration:"4 weeks",
      level:"Beginner",
      audience:"Finance professionals, business analysts, admin teams",
      color:"#6dd6a0",
      outcomes:["Load, clean, and analyze Excel files in Python","Replace VLOOKUP, pivot tables, and macros with pandas","Automate repetitive Excel tasks with one script","Build charts and reports that update automatically"],
      modules:["Week 1 — Python Basics for non-programmers","Week 2 — pandas: the Excel replacement","Week 3 — Automation: loops, functions, file handling","Week 4 — Real project: automate a monthly report"],
      available:false,
    },
    {
      id:"stats-business",
      emoji:"📐",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Statistics for Business Decisions",
      subtitle:"Stop guessing. Make decisions with data confidence",
      price:39,
      duration:"3 weeks",
      level:"Beginner",
      audience:"Managers, consultants, MBAs, marketing teams",
      color:"#a78bfa",
      outcomes:["Understand p-values, confidence intervals, and significance","Design and interpret A/B tests for real business decisions","Spot misleading statistics in reports and presentations","Apply statistical thinking without heavy math"],
      modules:["Week 1 — Descriptive statistics and data intuition","Week 2 — Hypothesis testing: A/B tests, p-values","Week 3 — Real cases: marketing, finance, HR decisions"],
      available:false,
    },
    {
      id:"python-finance",
      emoji:"💹",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Python for Finance",
      subtitle:"Automate financial models, analysis, and reporting",
      price:59,
      duration:"6 weeks",
      level:"Intermediate",
      audience:"Bankers, accountants, financial analysts, CFOs",
      color:"#f7c96e",
      outcomes:["Build financial models in Python instead of Excel","Automate P&L, balance sheet, and cash flow analysis","Pull live market data and build dashboards","Create professional PDF reports automatically"],
      modules:["Week 1–2 — Python and pandas for financial data","Week 3 — Financial modeling: DCF, ratios, forecasting","Week 4 — Market data: APIs, live prices, portfolio analysis","Week 5–6 — Automation and reporting project"],
      available:false,
    },
    {
      id:"power-bi",
      emoji:"📊",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Power BI for Business",
      subtitle:"Build professional dashboards without writing a single line of code",
      price:49,
      duration:"4 weeks",
      level:"Beginner",
      audience:"Business analysts, finance teams, managers, consultants",
      color:"#f59e0b",
      outcomes:["Build interactive dashboards from scratch in Power BI","Connect to Excel, SQL databases, and live data sources","Create calculated columns and measures with DAX basics","Share dashboards with your team and management"],
      modules:["Week 1 — Power BI interface, loading data, basic visuals","Week 2 — Relationships, filters, slicers, and drill-through","Week 3 — DAX basics: calculated columns, measures, KPIs","Week 4 — Real project: full business dashboard, published online"],
      available:false,
    },
    {
      id:"arabic-ds",
      emoji:"🌍",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Arabic Data Science Fundamentals",
      subtitle:"تعلم علم البيانات بالعربي — المنهج الوحيد المنظم باللغة العربية",
      price:49,
      duration:"6 weeks",
      level:"Beginner",
      audience:"Arabic speakers across MENA who prefer learning in their native language",
      color:"#6dd6a0",
      outcomes:["Learn Python and data analysis fully in Arabic","Understand statistics and ML concepts in your native language","Build a real data project with Arabic-language guidance","Join a community of Arabic-speaking data professionals"],
      modules:["Week 1–2 — Python basics explained in Arabic","Week 3 — Data analysis with pandas (Arabic)","Week 4 — Statistics and visualization (Arabic)","Week 5–6 — Mini project: real dataset, full analysis in Arabic"],
      available:false,
    },
    {
      id:"freelancing-data",
      emoji:"💼",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Freelancing with Data Skills",
      subtitle:"Earn USD from Upwork and Fiverr using the data skills you already have",
      price:39,
      duration:"3 weeks",
      level:"Beginner",
      audience:"Graduates and career switchers in Lebanon, Syria, Egypt wanting USD income",
      color:"#a78bfa",
      outcomes:["Set up a winning Upwork/Fiverr profile as a data freelancer","Find and close your first 3 data clients","Price your services correctly for MENA and international markets","Deliver SQL, Excel, and Python projects professionally"],
      modules:["Week 1 — Setting up your freelance profile and positioning","Week 2 — Finding clients: proposals, niches, pricing strategies","Week 3 — Delivering projects: communication, revisions, reviews"],
      available:false,
    },
    {
      id:"cv-portfolio",
      emoji:"🎯",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"CV & Portfolio for Data Jobs",
      subtitle:"Land your first data job — resume, LinkedIn, GitHub, and interview prep",
      price:29,
      duration:"2 weeks",
      level:"Beginner",
      audience:"DS Academy graduates and self-taught data learners ready to apply for jobs",
      color:"#7eb8f7",
      outcomes:["Write a data science resume that passes ATS filters","Build a GitHub portfolio that impresses hiring managers","Optimize your LinkedIn profile for data recruiters in MENA","Present your projects confidently in interviews"],
      modules:["Week 1 — Resume writing, LinkedIn optimization, GitHub setup","Week 2 — Portfolio projects: how to present, what to say, mock interview"],
      available:false,
    },
    {
      id:"sheets-automation",
      emoji:"⚡",
      tag:"COMING SOON",
      tagColor:"#f7c96e",
      title:"Google Sheets + Python Automation",
      subtitle:"Automate everything you do manually in Google Sheets — in minutes",
      price:29,
      duration:"3 weeks",
      level:"Beginner",
      audience:"Small business owners, executive assistants, operations teams in MENA",
      color:"#34d399",
      outcomes:["Connect Python to Google Sheets and automate updates","Build reports that refresh automatically every day","Send automated email summaries from your spreadsheet data","Eliminate 5+ hours of manual work per week"],
      modules:["Week 1 — Google Sheets API setup and reading/writing data with Python","Week 2 — Automation: scheduled scripts, conditional updates, alerts","Week 3 — Real project: fully automated weekly business report"],
      available:false,
    },
  ];

  const [selected,setSelected]=useState(null);

  if(selected){
    const c=courses.find(x=>x.id===selected);
    return(
      <div style={{minHeight:"100vh",background:"#0b0a12",color:"#e8e4ff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",background:"rgba(11,10,18,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35"}}>
          <div style={{fontWeight:800,fontSize:16,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 8px #8b7cf6"}}/>ZeroToDS
          </div>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"1px solid #2a2845",color:"#7b78a0",padding:"7px 16px",borderRadius:6,cursor:"pointer",fontSize:13}}>← All Courses</button>
        </nav>
        <div style={{maxWidth:760,margin:"0 auto",padding:"100px 20px 60px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{fontSize:10,padding:"3px 10px",borderRadius:100,background:c.tagColor+"20",color:c.tagColor,fontFamily:"monospace",fontWeight:700}}>{c.tag}</span>
            <span style={{fontSize:10,color:"#4a4665"}}>{c.level} · {c.duration}</span>
          </div>
          <h1 style={{fontSize:"clamp(26px,5vw,42px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:8,lineHeight:1.15}}>{c.emoji} {c.title}</h1>
          <p style={{fontSize:16,color:"#7b78a0",marginBottom:32,lineHeight:1.7}}>{c.subtitle}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:32}}>
            <div style={{background:"#11101c",border:`1px solid ${c.color}33`,borderRadius:14,padding:"24px"}}>
              <div style={{fontSize:10,color:c.color,letterSpacing:"0.12em",marginBottom:14,fontFamily:"monospace"}}>WHAT YOU'LL BE ABLE TO DO</div>
              {c.outcomes.map((o,i)=><div key={i} style={{display:"flex",gap:10,fontSize:13,color:"#c8c3e0",marginBottom:10}}><span style={{color:c.color,flexShrink:0}}>✓</span>{o}</div>)}
            </div>
            <div style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:14,padding:"24px"}}>
              <div style={{fontSize:10,color:"#7b78a0",letterSpacing:"0.12em",marginBottom:14,fontFamily:"monospace"}}>CURRICULUM</div>
              {c.modules.map((m,i)=><div key={i} style={{fontSize:12,color:"#7b78a0",marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e1c35"}}>{m}</div>)}
              <div style={{fontSize:11,color:"#4a4665",marginTop:4}}>👥 For: {c.audience}</div>
            </div>
          </div>
          <div style={{background:"#11101c",border:`1px solid ${c.color}44`,borderRadius:14,padding:"28px",textAlign:"center"}}>
            <div style={{fontSize:36,fontWeight:800,color:"#e8e4ff",marginBottom:4}}>${c.price} <span style={{fontSize:14,color:"#4a4665",fontWeight:400}}>one-time</span></div>
            <div style={{fontSize:12,color:"#4a4665",marginBottom:20}}>Lifetime access · No subscription</div>
            {c.available?(
              <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20buy%20the%20'"+encodeURIComponent(c.title)+"'%20course%20($"+c.price+").%20Please%20send%20payment%20details."} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"13px 40px",background:"#8b7cf6",color:"#fff",borderRadius:9,fontSize:14,fontWeight:700,textDecoration:"none"}}>
                Buy via WhatsApp →
              </a>
            ):(
              <div>
                <div style={{fontSize:13,color:"#7b78a0",marginBottom:16}}>This course is in development. Join the waitlist and get notified + early bird discount.</div>
                <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20be%20on%20the%20waitlist%20for%20'"+encodeURIComponent(c.title)+"'.%20Please%20notify%20me%20when%20it%20launches."} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"13px 40px",background:"#1e1c35",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:9,fontSize:13,fontWeight:600,textDecoration:"none"}}>
                  Join Waitlist →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#0b0a12",color:"#e8e4ff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",background:"rgba(11,10,18,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35",flexWrap:"wrap",gap:8}}>
        <div style={{fontWeight:800,fontSize:16,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 8px #8b7cf6"}}/>ZeroToDS
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#7b78a0",cursor:"pointer",fontSize:13}}>← Home</button>
          <button onClick={onSignup} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"8px 18px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600}}>Start Free →</button>
        </div>
      </nav>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"100px 20px 60px"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// standalone courses</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(28px,5vw,46px)",letterSpacing:"-0.02em",marginBottom:12}}>Courses</h1>
        <p style={{color:"#7b78a0",fontSize:15,marginBottom:24,maxWidth:520,lineHeight:1.7}}>Focused, practical courses on specific skills. No fluff, no filler — just the exact skills you need for your job. Buy once, keep forever.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
          {courses.map(c=>(
            <div key={c.id} onClick={()=>setSelected(c.id)} style={{background:"#11101c",border:`1px solid ${c.available?c.color+"33":"#1e1c35"}`,borderRadius:16,overflow:"hidden",cursor:"pointer",position:"relative",transition:"transform 0.2s,border-color 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=c.color+"66";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=c.available?c.color+"33":"#1e1c35";}}>
              <div style={{height:96,background:`linear-gradient(135deg,${c.color}20,${c.color}08)`,borderBottom:`1px solid ${c.color}20`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:-16,top:-16,width:90,height:90,background:c.color+"10",borderRadius:"50%"}}/>
                <span style={{fontSize:40,position:"relative",zIndex:1}}>{c.emoji}</span>
                <div style={{textAlign:"right",position:"relative",zIndex:1}}>
                  <div style={{fontSize:22,fontWeight:800,color:c.color}}>${c.price}</div>
                  <div style={{fontSize:9,color:c.color+"88"}}>{c.duration}</div>
                </div>
              </div>
              <div style={{padding:"16px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:9,padding:"3px 9px",borderRadius:100,background:c.tagColor+"20",color:c.tagColor,fontFamily:"monospace",fontWeight:700}}>{c.tag}</span>
                <span style={{fontSize:9,color:"#4a4665",background:"#17162a",padding:"2px 7px",borderRadius:4}}>{c.level}</span>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:"#e8e4ff",marginBottom:5,lineHeight:1.3}}>{c.title}</div>
              <div style={{fontSize:11,color:"#7b78a0",lineHeight:1.6,marginBottom:14}}>{c.subtitle}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #1e1c35",paddingTop:12,marginTop:12}}>
                <span style={{fontSize:10,color:"#4a4665"}}>{c.audience.split(",")[0]}</span>
                <span style={{fontSize:10,color:c.color,fontWeight:600}}>{c.available?"Available →":"Waitlist →"}</span>
              </div>
              </div>{/* end padding div */}
            </div>
          ))}
        </div>
        <div style={{marginTop:48,background:"#11101c",border:"1px solid #1e1c35",borderRadius:12,padding:"24px",textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#e8e4ff",marginBottom:8}}>Part of the DS Academy ecosystem</div>
          <div style={{fontSize:13,color:"#7b78a0",marginBottom:16,lineHeight:1.7}}>These courses are standalone — but they also connect to the full DS Academy roadmap. Complete SQL for Business and continue into the full data science curriculum.</div>
          <button onClick={onSignup} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"11px 28px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Start Free on ZeroToDS →</button>
        </div>
      </div>
    </div>
  );
}

// ── PUBLIC BLOG PAGE (shown on landing page)
function PublicBlogPage({onBack}){
  const [posts,setPosts]=useState([]);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const q=query(collection(db,"blog"),orderBy("publishedAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      setPosts(snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.published));
      setLoading(false);
    });
    return unsub;
  },[]);

  if(selected){
    return(
      <div style={{minHeight:"100vh",background:"#0b0a12",color:"#e8e4ff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",background:"rgba(11,10,18,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35"}}>
          <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
            ZeroToDS
          </div>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"1px solid #2a2845",color:"#7b78a0",padding:"7px 16px",borderRadius:6,cursor:"pointer",fontSize:13}}>← Blog</button>
        </nav>
        <div style={{maxWidth:760,margin:"0 auto",padding:"100px 20px 60px"}}>
          {selected.coverImage&&<img src={selected.coverImage} alt="cover" style={{width:"100%",maxHeight:380,objectFit:"cover",borderRadius:12,marginBottom:28,border:"1px solid #2a2540"}}/>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            {(selected.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:"3px 10px",borderRadius:100,background:"#8b7cf615",color:"#8b7cf6",border:"1px solid #8b7cf630",fontFamily:"monospace"}}>{t}</span>)}
          </div>
          <h1 style={{fontSize:"clamp(24px,5vw,42px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:12,lineHeight:1.15}}>{selected.title}</h1>
          <div style={{fontSize:11,color:"#4a4665",fontFamily:"monospace",marginBottom:32}}>{new Date(selected.publishedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
          <div>{renderContent(selected.content||"")}</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#0b0a12",color:"#e8e4ff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",background:"rgba(11,10,18,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35"}}>
        <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
          ZeroToDS
        </div>
        <button onClick={onBack} style={{background:"none",border:"1px solid #2a2845",color:"#7b78a0",padding:"7px 16px",borderRadius:6,cursor:"pointer",fontSize:13}}>← Home</button>
      </nav>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"100px 20px 60px"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// blog</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(28px,5vw,46px)",letterSpacing:"-0.02em",marginBottom:8}}>The DS Academy Blog</h1>
        <p style={{color:"#7b78a0",fontSize:15,marginBottom:24,maxWidth:480}}>Data science tutorials, career tips, and insights from the field.</p>
        {loading&&<div style={{color:"#4a4665",fontSize:13,fontFamily:"monospace"}}>Loading posts...</div>}
        {!loading&&posts.length===0&&<div style={{color:"#4a4665",fontSize:13,fontFamily:"monospace"}}>No posts published yet. Check back soon.</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
          {posts.map(p=>(
            <div key={p.id} onClick={()=>setSelected(p)} style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s,border-color 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="#8b7cf644";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="#1e1c35";}}>
              {p.coverImage
                ?<img src={p.coverImage} alt="cover" style={{width:"100%",height:180,objectFit:"cover"}}/>
                :<div style={{height:100,background:"linear-gradient(135deg,#8b7cf615,#f472b610)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{p.coverEmoji||"📝"}</div>}
              <div style={{padding:"18px"}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  {(p.tags||[]).slice(0,3).map(t=><span key={t} style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"#8b7cf615",color:"#8b7cf6",border:"1px solid #8b7cf625",fontFamily:"monospace"}}>{t}</span>)}
                </div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:8,lineHeight:1.3,color:"#e2dff0"}}>{p.title}</div>
                <div style={{fontSize:12,color:"#4a4665",lineHeight:1.6,marginBottom:12}}>{p.excerpt}</div>
                <div style={{fontSize:10,color:"#3a3860",fontFamily:"monospace"}}>{new Date(p.publishedAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── STUDENT BLOG TAB (read-only)
const SEO_POSTS=[
  {id:"seo-1",title:"How to Become a Data Scientist in Saudi Arabia (2025 Guide)",excerpt:"A step-by-step roadmap for Saudi students and professionals who want to break into data science — from zero to first job.",coverEmoji:"🇸🇦",tags:["Career","Saudi Arabia","Roadmap"],publishedAt:"2025-01-15T00:00:00Z",published:true,
   content:`## Why Data Science in Saudi Arabia?\n\nSaudi Arabia's Vision 2030 is creating massive demand for data professionals. Banks, telecom companies, oil firms, and government agencies are all hiring — and paying well.\n\n**Average salaries:** SAR 12,000–30,000/month for mid-level roles.\n\n## The Roadmap\n\n**Phase 1 (Months 1–3): Foundations**\n- Python basics (variables, loops, functions)\n- NumPy and Pandas for data manipulation\n- SQL for querying databases\n- Basic statistics and probability\n\n**Phase 2 (Months 3–6): Machine Learning**\n- Scikit-learn for ML models\n- Linear/logistic regression, decision trees\n- Model evaluation and cross-validation\n\n**Phase 3 (Months 6–12): Advanced + Portfolio**\n- XGBoost, feature engineering\n- Build 3 portfolio projects with real datasets\n- Deploy a Streamlit app live\n\n## Top Companies Hiring in KSA\n- Saudi Aramco (data & AI team)\n- STC (telecom analytics)\n- ZATCA (tax authority)\n- Noon.com (e-commerce)\n- Saudi National Bank\n\n## Where to Start\n\nStart with Python. No prior experience needed. The entire roadmap above is exactly what ZeroToDS covers — built specifically for Arab students starting from zero.`},
  {id:"seo-2",title:"Data Science Salaries in UAE: What You Can Earn in 2025",excerpt:"Realistic salary ranges for data analysts, data scientists, and ML engineers in Dubai, Abu Dhabi, and across the UAE.",coverEmoji:"🇦🇪",tags:["Career","UAE","Salary"],publishedAt:"2025-02-01T00:00:00Z",published:true,
   content:`## Data Science Salaries in UAE (2025)\n\nThe UAE has one of the highest-paying tech markets in the MENA region — and data science roles are in high demand.\n\n### Salary Ranges (AED/month)\n\n| Role | Junior | Mid | Senior |\n|------|--------|-----|--------|\n| Data Analyst | 8,000–12,000 | 14,000–22,000 | 25,000–35,000 |\n| Data Scientist | 12,000–18,000 | 20,000–32,000 | 35,000–55,000 |\n| ML Engineer | 15,000–22,000 | 25,000–40,000 | 45,000–70,000 |\n\n*Note: UAE has 0% income tax — these are take-home figures.*\n\n## Top Employers in UAE\n- Emirates Group (aviation analytics)\n- ADNOC (oil & gas AI)\n- Careem / Uber MENA\n- G42 (AI company in Abu Dhabi)\n- Dubai government entities (Smart Dubai)\n\n## Skills That Command Premium Salaries\n1. **Python + SQL** — non-negotiable baseline\n2. **Machine learning** (XGBoost, scikit-learn)\n3. **LLMs and RAG** — huge demand in 2025\n4. **MLOps** — deploying models to production\n5. **Arabic NLP** — rare and very well compensated\n\n## How Long Does It Take?\n\nWith a structured curriculum and 1–2 hours/day, most people reach an employable level in 6–12 months. The key is structure — not more tutorials.`},
  {id:"seo-3",title:"Learn Python for Data Science in Arabic — Full Roadmap",excerpt:"Everything you need to learn Python for data science, explained in a way that works for Arabic speakers. No prior experience needed.",coverEmoji:"🐍",tags:["Python","Arabic","Beginners"],publishedAt:"2025-02-15T00:00:00Z",published:true,
   content:`## لماذا Python لعلم البيانات؟\n\nPython هي اللغة الأكثر استخداماً في مجال علم البيانات. إذا كنت تريد العمل في هذا المجال، Python هي نقطة البداية.\n\n## الخطوات\n\n### المرحلة الأولى: أساسيات Python\n- المتغيرات والأنواع (Variables & Types)\n- الحلقات والشروط (Loops & Conditions)\n- الدوال (Functions)\n- القوائم والقواميس (Lists & Dicts)\n\n### المرحلة الثانية: Python لعلم البيانات\n- NumPy: العمليات على المصفوفات\n- Pandas: تحليل البيانات\n- Matplotlib/Seaborn: الرسوم البيانية\n\n### المرحلة الثالثة: Machine Learning\n- Scikit-learn\n- نماذج التصنيف والانحدار\n- تقييم النماذج\n\n## Common Mistakes Arabic Learners Make\n\n1. **Watching too many tutorials without coding** — you must type the code yourself\n2. **Skipping math** — basic statistics matters for ML\n3. **No projects** — employers want to see code, not certificates\n4. **Translating everything to Arabic mentally** — think in Python\n\n## الموارد المتاحة\n\nمنصة ZeroToDS مبنية خصيصاً للطلاب العرب — المحتوى بالإنجليزية لكن الشرح والدعم بالعربية.`},
  {id:"seo-4",title:"How Long Does It Take to Learn Data Science from Zero?",excerpt:"An honest, realistic breakdown of how long it takes to go from complete beginner to job-ready data scientist.",coverEmoji:"⏱️",tags:["Beginners","Career","Roadmap"],publishedAt:"2025-03-01T00:00:00Z",published:true,
   content:`## The Honest Answer: 6–18 Months\n\nDepending on your time investment and approach, here's what's realistic:\n\n| Hours/week | Time to job-ready |\n|------------|-------------------|\n| 2–4 hours | 12–18 months |\n| 5–10 hours | 8–12 months |\n| 10–20 hours | 5–8 months |\n| 20+ hours | 3–5 months |\n\n## What "Job-Ready" Actually Means\n\nYou're job-ready when you can:\n- Write Python code without Googling basic syntax\n- Clean and analyze a dataset independently\n- Build and evaluate a machine learning model\n- Explain your work clearly to a non-technical person\n- Show 2–3 portfolio projects with deployed demos\n\n## Phase Breakdown\n\n**Month 1–2: Python + Data Tools**\nLearn Python, NumPy, Pandas, and SQL. This is the foundation everything else builds on.\n\n**Month 2–5: Machine Learning**\nClassification, regression, model evaluation, cross-validation. Scikit-learn is your main tool.\n\n**Month 5–8: Advanced + Deployment**\nXGBoost, feature engineering, Streamlit apps, ML pipelines.\n\n**Month 8+: Portfolio + Job Search**\nBuild real projects. Polish GitHub. Start applying.\n\n## The #1 Reason People Take Longer\n\n**Tutorial hell.** Watching video after video without building anything real. The students who get hired fastest are the ones who spend 70% of their time coding and 30% learning theory.`},
  {id:"seo-5",title:"Data Science vs Machine Learning: What's the Difference?",excerpt:"A clear, practical explanation of the difference between data science and machine learning — and which path is right for you.",coverEmoji:"🤖",tags:["Career","ML","Data Science"],publishedAt:"2025-03-15T00:00:00Z",published:true,
   content:`## The Short Answer\n\n**Data Science** is the broad field of extracting insights from data. **Machine Learning** is one technique used within data science.\n\nThink of it this way:\n- Data Science = the job\n- Machine Learning = one of the tools\n\n## What Data Scientists Actually Do\n\n- Clean and explore messy datasets\n- Build dashboards and visualizations\n- Run statistical analyses (A/B tests, forecasting)\n- Build ML models when needed\n- Communicate findings to business stakeholders\n\n## What ML Engineers Actually Do\n\n- Take ML models from notebooks to production\n- Build data pipelines and model serving infrastructure\n- Optimize model performance and latency\n- Monitor models in production (MLOps)\n\n## Which Path Should You Choose?\n\n**Choose Data Scientist if you:**\n- Like working with business problems\n- Enjoy communicating insights and telling stories with data\n- Want to work across many industries\n\n**Choose ML Engineer if you:**\n- Have a software engineering background\n- Enjoy building systems and infrastructure\n- Want to specialize deeply in AI/ML\n\n## In MENA: Start with Data Science\n\nIn the Arab market, pure ML Engineer roles are rare outside of a few large tech companies. Most job postings are looking for Data Scientists or Data Analysts who understand ML. Start there, then specialize.`},
];

function StudentBlogTab(){
  const [posts,setPosts]=useState([]);
  const [selected,setSelected]=useState(null);
  useEffect(()=>{
    const q=query(collection(db,"blog"),orderBy("publishedAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      const live=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.published);
      setPosts(live.length>0?live:SEO_POSTS);
    });
    return unsub;
  },[]);

  if(selected){
    return(
      <div style={{padding:"24px",maxWidth:760,margin:"0 auto"}}>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.p1,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back to Blog</button>
        {selected.coverImage&&<img src={selected.coverImage} alt="cover" style={{width:"100%",maxHeight:340,objectFit:"cover",borderRadius:12,marginBottom:24,border:`1px solid ${T.border}`}}/>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {(selected.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:"3px 10px",borderRadius:100,background:T.p1+"15",color:T.p1,border:`1px solid ${T.p1}30`,fontFamily:"monospace"}}>{t}</span>)}
        </div>
        <h2 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:10,lineHeight:1.2,color:T.text}}>{selected.title}</h2>
        <div style={{fontSize:11,color:T.textFade,fontFamily:"monospace",marginBottom:28}}>{new Date(selected.publishedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
        <div>{renderContent(selected.content||"")}</div>
      </div>
    );
  }

  return(
    <div className="ds-admin-content" style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>
      <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:8}}>// blog</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4,color:T.text}}>Blog</div>
      <div style={{fontSize:12,color:T.textDim,marginBottom:24}}>Tutorials, tips, and insights.</div>
      {posts.length===0&&<div style={{fontSize:12,color:T.textFade,fontFamily:"monospace"}}>No posts yet.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {posts.map(p=>(
          <div key={p.id} onClick={()=>setSelected(p)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s,border-color 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=T.borderHi;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=T.border;}}>
            {p.coverImage
              ?<img src={p.coverImage} alt="cover" style={{width:"100%",height:160,objectFit:"cover"}}/>
              :<div style={{height:80,background:`linear-gradient(135deg,${T.p1}12,${T.p4}10)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{p.coverEmoji||"📝"}</div>}
            <div style={{padding:"14px"}}>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                {(p.tags||[]).slice(0,3).map(t=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:100,background:T.p1+"15",color:T.p1,fontFamily:"monospace"}}>{t}</span>)}
              </div>
              <div style={{fontWeight:700,fontSize:13,marginBottom:6,lineHeight:1.3,color:T.text}}>{p.title}</div>
              <div style={{fontSize:11,color:T.textFade,lineHeight:1.5,marginBottom:10}}>{p.excerpt}</div>
              <div style={{fontSize:10,color:T.textFade,fontFamily:"monospace"}}>{new Date(p.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN BLOG TAB
function AdminBlogTab(){
  const [posts,setPosts]=useState([]);
  const [view,setView]=useState("list"); // list | new | edit
  const [editing,setEditing]=useState(null);
  const blank={title:"",slug:"",excerpt:"",content:"",tags:"",coverEmoji:"📝",coverImage:"",published:false};
  const [form,setForm]=useState(blank);
  const [preview,setPreview]=useState(false);
  const [saving,setSaving]=useState(false);
  const [ok,setOk]=useState("");

  useEffect(()=>{
    const q=query(collection(db,"blog"),orderBy("publishedAt","desc"));
    const unsub=onSnapshot(q,snap=>{setPosts(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return unsub;
  },[]);

  const openNew=()=>{setForm(blank);setEditing(null);setView("new");setPreview(false);setOk("");};
  const openEdit=(p)=>{setForm({title:p.title,slug:p.slug,excerpt:p.excerpt||"",content:p.content||"",tags:(p.tags||[]).join(", "),coverEmoji:p.coverEmoji||"📝",coverImage:p.coverImage||"",published:p.published||false});setEditing(p);setView("edit");setPreview(false);setOk("");};

  const save=async()=>{
    if(!form.title.trim()){alert("Title is required.");return;}
    setSaving(true);
    const slug=form.slug.trim()||slugify(form.title);
    const tags=form.tags.split(",").map(t=>t.trim()).filter(Boolean);
    const data={title:form.title.trim(),slug,excerpt:form.excerpt.trim(),content:form.content,tags,coverEmoji:form.coverEmoji,coverImage:form.coverImage.trim(),published:form.published,publishedAt:editing?.publishedAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(editing){await updateDoc(doc(db,"blog",editing.id),data);}
    else{await addDoc(collection(db,"blog"),data);}
    setSaving(false);setOk("✅ Saved!");setView("list");
  };

  const togglePublish=async(p)=>{await updateDoc(doc(db,"blog",p.id),{published:!p.published});};
  const deletePost=async(p)=>{if(!window.confirm("Delete this post?"))return;await deleteDoc(doc(db,"blog",p.id));};

  const inp={background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:7,padding:"9px 12px",color:T.text,fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"};

  if(view==="list"){
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text}}>Blog Posts ({posts.length})</div>
          <Btn onClick={openNew} color={T.good}>+ New Post</Btn>
        </div>
        {ok&&<div style={{fontSize:11,color:T.good,marginBottom:12,background:T.good+"10",padding:"8px 12px",borderRadius:6}}>{ok}</div>}
        {posts.length===0&&<div style={{fontSize:12,color:T.textFade,fontFamily:"monospace"}}>No posts yet. Create your first one!</div>}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {posts.map(p=>(
            <div key={p.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{fontSize:28,flexShrink:0}}>{p.coverEmoji||"📝"}</div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:11,color:T.textFade,marginBottom:4}}>{p.excerpt?.slice(0,80)}{p.excerpt?.length>80?"...":""}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(p.tags||[]).map(t=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:100,background:T.p1+"15",color:T.p1,fontFamily:"monospace"}}>{t}</span>)}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <span style={{fontSize:10,padding:"3px 10px",borderRadius:100,background:p.published?T.good+"20":"#3a3860",color:p.published?T.good:T.textFade,border:`1px solid ${p.published?T.good+"40":"#3a3860"}`,fontFamily:"monospace"}}>
                  {p.published?"● Published":"○ Draft"}
                </span>
                <div style={{display:"flex",gap:6}}>
                  <Btn onClick={()=>togglePublish(p)} color={p.published?T.warn:T.good} style={{fontSize:10,padding:"4px 10px"}}>{p.published?"Unpublish":"Publish"}</Btn>
                  <Btn onClick={()=>openEdit(p)} color={T.info} style={{fontSize:10,padding:"4px 10px"}}>Edit</Btn>
                  <Btn onClick={()=>deletePost(p)} color={T.warn} style={{fontSize:10,padding:"4px 10px"}}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // new / edit form
  return(
    <div style={{maxWidth:760}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:T.p1,cursor:"pointer",fontSize:13}}>← Back</button>
        <div style={{fontSize:14,fontWeight:600,color:T.text}}>{editing?"Edit Post":"New Post"}</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn onClick={()=>setPreview(!preview)} color={T.p4} style={{fontSize:11,padding:"5px 12px"}}>{preview?"✏️ Edit":"👁 Preview"}</Btn>
          <Btn onClick={save} color={T.good} style={{fontSize:11,padding:"5px 14px"}}>{saving?"Saving...":"💾 Save"}</Btn>
        </div>
      </div>

      {preview?(
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"28px"}}>
          {form.coverImage&&<img src={form.coverImage} alt="cover" style={{width:"100%",maxHeight:320,objectFit:"cover",borderRadius:10,marginBottom:20,border:`1px solid ${T.border}`}}/>}
          <h2 style={{fontSize:28,fontWeight:800,color:T.text,marginBottom:8,letterSpacing:"-0.02em"}}>{form.title||"Untitled"}</h2>
          <div style={{fontSize:12,color:T.textFade,marginBottom:20}}>{form.excerpt}</div>
          <div>{renderContent(form.content)}</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10}}>
            <div>
              <div style={{fontSize:10,color:T.textFade,marginBottom:5,letterSpacing:"0.1em"}}>TITLE *</div>
              <input style={inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value,slug:slugify(e.target.value)}))} placeholder="Post title..."/>
            </div>
            <div>
              <div style={{fontSize:10,color:T.textFade,marginBottom:5,letterSpacing:"0.1em"}}>EMOJI</div>
              <input style={{...inp,width:60,textAlign:"center",fontSize:22}} value={form.coverEmoji} onChange={e=>setForm(p=>({...p,coverEmoji:e.target.value}))}/>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:T.textFade,marginBottom:5,letterSpacing:"0.1em"}}>COVER IMAGE URL (optional)</div>
            <input style={inp} value={form.coverImage} onChange={e=>setForm(p=>({...p,coverImage:e.target.value}))} placeholder="https://images.unsplash.com/..."/>
            {form.coverImage&&<img src={form.coverImage} alt="preview" style={{marginTop:8,width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8,border:`1px solid ${T.border}`}} onError={e=>e.target.style.display="none"}/>}
          </div>
          <div>
            <div style={{fontSize:10,color:T.textFade,marginBottom:5,letterSpacing:"0.1em"}}>EXCERPT (shown on blog card)</div>
            <input style={inp} value={form.excerpt} onChange={e=>setForm(p=>({...p,excerpt:e.target.value}))} placeholder="One-line summary of the post..."/>
          </div>
          <div>
            <div style={{fontSize:10,color:T.textFade,marginBottom:5,letterSpacing:"0.1em"}}>TAGS (comma-separated)</div>
            <input style={inp} value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="Python, Machine Learning, Career..."/>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.1em"}}>CONTENT</div>
              <div style={{fontSize:9,color:T.textFade,fontFamily:"monospace"}}>## Heading · **bold** · {'>'} quote · ``` code · ![alt](url) img</div>
            </div>
            <textarea style={{...inp,minHeight:320,resize:"vertical",lineHeight:1.7,fontFamily:"monospace"}} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder={"## Introduction\n\nWrite your post here...\n\n```python\nprint('Hello, world!')\n```\n\nhttps://your-image-url.jpg"}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:T.textDim}}>
              <input type="checkbox" checked={form.published} onChange={e=>setForm(p=>({...p,published:e.target.checked}))} style={{accentColor:T.good}}/>
              Publish immediately
            </label>
            <div style={{fontSize:10,color:T.textFade}}>(unchecked = save as draft)</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN ANALYTICS TAB
function AdminAnalyticsTab(){
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    const q=query(collection(db,"analytics"),orderBy("timestamp","desc"));
    const unsub=onSnapshot(q,snap=>{
      setEvents(snap.docs.map(d=>d.data()));
      setLoading(false);
    });
    return unsub;
  },[]);

  const LESSON_ORDER=["pycore-basics","pycore-advanced","pycore-ds-patterns","numpy","pandas-basics","pandas-advanced","eda","visualization","sql-basics","sql-joins","sql-window","probability"];
  const LESSON_NAMES={"pycore-basics":"Python Basics","pycore-advanced":"Python Intermediate","pycore-ds-patterns":"Python Patterns","numpy":"NumPy Arrays","pandas-basics":"Pandas Basics","pandas-advanced":"Pandas Advanced","eda":"EDA","visualization":"Visualization","sql-basics":"SQL Foundations","sql-joins":"SQL JOINs","sql-window":"Window Functions","probability":"Probability"};

  const funnel=LESSON_ORDER.map(id=>({
    id,
    name:LESSON_NAMES[id]||id,
    opens:events.filter(e=>e.lessonId===id&&e.event==="open").length,
    completes:events.filter(e=>e.lessonId===id&&e.event==="complete").length,
  }));
  const maxOpens=Math.max(...funnel.map(f=>f.opens),1);

  return(
    <div className="ds-admin-content">
      <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:6}}>// lesson funnel</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4,color:T.text}}>Lesson Drop-off Analysis</div>
      <div style={{fontSize:12,color:T.textDim,marginBottom:20}}>See where students open vs complete each lesson.</div>
      {loading?<div style={{color:T.textFade,fontSize:12}}>Loading...</div>:(
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"180px 1fr 60px 80px",gap:0,padding:"10px 20px",borderBottom:`1px solid ${T.border}`,fontSize:10,color:T.textFade,letterSpacing:"0.1em"}}>
            <div>LESSON</div><div>OPENS</div><div style={{textAlign:"right"}}>OPENS</div><div style={{textAlign:"right"}}>DONE</div>
          </div>
          {funnel.map(f=>{
            const dropPct=f.opens>0?Math.round((1-f.completes/f.opens)*100):0;
            const barW=Math.round((f.opens/maxOpens)*100);
            const completePct=f.opens>0?Math.round((f.completes/f.opens)*100):0;
            return(
              <div key={f.id} style={{display:"grid",gridTemplateColumns:"180px 1fr 60px 80px",gap:0,padding:"12px 20px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
                <div style={{fontSize:12,fontWeight:500,color:T.text}}>{f.name}</div>
                <div style={{paddingRight:16}}>
                  <div style={{height:8,background:T.bgDeep,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${barW}%`,background:dropPct>60?"#f472b6":dropPct>30?"#f7c96e":"#6dd6a0",borderRadius:4,transition:"width 0.5s"}}/>
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.text,textAlign:"right"}}>{f.opens}</div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:11,color:completePct>=50?"#6dd6a0":completePct>=25?"#f7c96e":"#f472b6",fontWeight:600}}>{completePct}%</span>
                  <span style={{fontSize:10,color:T.textFade}}> ({f.completes})</span>
                </div>
              </div>
            );
          })}
          <div style={{padding:"12px 20px",fontSize:11,color:T.textFade}}>Total events tracked: {events.length}</div>
        </div>
      )}
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
  const [notifications,setNotifications]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"users"),snap=>{setStudents(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role!=="admin"&&!u.disabled));});
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
  useEffect(()=>{
    const q=query(collection(db,"notifications"),orderBy("joinedAt","desc"));
    const unsub=onSnapshot(q,snap=>{setNotifications(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return unsub;
  },[]);

  const unreadCount=notifications.filter(n=>!n.read).length;
  const markAllRead=async()=>{
    const unread=notifications.filter(n=>!n.read);
    await Promise.all(unread.map(n=>updateDoc(doc(db,"notifications",n.id),{read:true})));
  };

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
  const upgradeStudent=async(id,plan="monthly")=>{
    const label=plan==="student"?"Phase 1 Cohort ($99)":"Monthly Plan ($19/mo)";
    if(!window.confirm(`Confirm payment received — upgrade to ${label}?`))return;
    await updateDoc(doc(db,"users",id),{role:plan,upgradedAt:new Date().toISOString(),plan});
    setUserOk(`✅ Student upgraded to ${label}!`);
    setTimeout(()=>setUserOk(""),3000);
  };
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
  const tabs=[{id:"overview",label:"📈 Overview"},{id:"students",label:"👥 Students"},{id:"analytics",label:"🔍 Lesson Funnel"},{id:"messages",label:"💬 Messages"},{id:"roadmap",label:"✅ Edit Roadmap"},{id:"blog",label:"📝 Blog"}];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`
        @media (max-width: 768px) {
          .ds-admin-header { padding: 12px 16px 0 !important; }
          .ds-admin-tabs { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
          .ds-admin-tabs button { flex-shrink: 0; padding: 8px 10px !important; font-size: 11px !important; white-space: nowrap; }
          .ds-admin-content { padding: 16px !important; }
          .ds-admin-content .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="ds-admin-header" style={{background:T.bgDeep,borderBottom:`1px solid ${T.border}`,padding:"14px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.12em"}}>DATA SCIENCE LEARNING ROADMAP</div>
            <div style={{fontSize:18,fontWeight:700}}>Admin Dashboard</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:12,color:T.textDim}}>👤 {currentUser.email}</div>
            <div style={{position:"relative",display:"inline-block"}}>
              <Btn onClick={()=>{setShowNotifs(s=>!s);if(!showNotifs)markAllRead();}} color={T.gold} style={{padding:"5px 12px",fontSize:11}}>
                🔔{unreadCount>0?` (${unreadCount})`:""}
              </Btn>
              {showNotifs&&(
                <div style={{position:"absolute",right:0,top:"110%",width:300,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,zIndex:999,maxHeight:340,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
                  <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,fontSize:12,fontWeight:700,color:T.text}}>🔔 New Signups</div>
                  {notifications.length===0&&<div style={{padding:"16px",fontSize:12,color:T.textFade}}>No signups yet.</div>}
                  {notifications.map(n=>(
                    <div key={n.id} style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:n.read?"transparent":T.p1+"10"}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{n.username}</div>
                      <div style={{fontSize:11,color:T.textDim}}>{n.email}</div>
                      <div style={{fontSize:10,color:T.textFade,marginTop:3}}>{new Date(n.joinedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Btn onClick={()=>signOut(auth)} color={T.warn} style={{padding:"5px 12px",fontSize:11}}>Logout</Btn>
          </div>
        </div>
        <div className="ds-admin-tabs" style={{display:"flex",gap:4}}>
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
                    <div style={{flex:1,minWidth:160}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                        <span style={{fontSize:13,fontWeight:600}}>{u.username}</span>
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:3,fontWeight:700,background:u.role==="free"?T.p4+"20":T.good+"20",color:u.role==="free"?T.p4:T.good}}>{u.role==="free"?"FREE":u.role==="student"?"COHORT":"$19/MO"}</span>
                      </div>
                      <div style={{fontSize:10,color:T.textFade}}>{u.email}</div>
                    </div>
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
                      {u.role==="free"&&<>
                        <button onClick={()=>upgradeStudent(u.id,"monthly")} style={{background:T.p1+"18",border:`1px solid ${T.p1}44`,color:T.p1,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>⬆ $19/mo</button>
                        <button onClick={()=>upgradeStudent(u.id,"student")} style={{background:T.good+"18",border:`1px solid ${T.good}44`,color:T.good,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>⬆ $99 Cohort</button>
                      </>}
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
        {tab==="blog"&&<AdminBlogTab/>}
        {tab==="analytics"&&<AdminAnalyticsTab/>}
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


// ── QUIZ TAB ─────────────────────────────────────────────────────────────────
function QuizTab({roadmap,progress,userDoc}){
  const [activeSec,setActiveSec]=useState(null);
  const [qIndex,setQIndex]=useState(0);
  const [selected,setSelected]=useState(null);
  const [showResult,setShowResult]=useState(false);
  const [sessionScore,setSessionScore]=useState({correct:0,total:0});
  const [done,setDone]=useState(false);
  const [openAnswer,setOpenAnswer]=useState("");
  const [showModel,setShowModel]=useState(false);

  const freeSectionIds=["python-core","python-ds","sql","stats-prob","stats-dist"];
  const isFree=userDoc?.role==="free";
  const allSections=roadmap.flatMap(ph=>
    ph.sections
      .filter(s=>QUIZ_DATA[s.id]&&QUIZ_DATA[s.id].length>0)
      .filter(s=>!isFree||freeSectionIds.includes(s.id))
      .map(s=>({...s,phaseColor:ph.color,phaseTitle:ph.title}))
  );

  const startQuiz=(sec)=>{setActiveSec(sec);setQIndex(0);setSelected(null);setShowResult(false);setSessionScore({correct:0,total:0});setDone(false);setOpenAnswer("");setShowModel(false);};

  const handleMCAnswer=(idx)=>{
    if(selected!==null)return;
    setSelected(idx);setShowResult(true);
  };

  const nextQuestion=()=>{
    const questions=QUIZ_DATA[activeSec.id];
    const q=questions[qIndex];
    const isCorrect=q.type==="mc"?selected===q.answer:true; // open-ended always counts
    const newScore={correct:sessionScore.correct+(isCorrect?1:0),total:sessionScore.total+1};
    setSessionScore(newScore);
    if(qIndex+1>=questions.length){setDone(true);}
    else{setQIndex(i=>i+1);setSelected(null);setShowResult(false);setOpenAnswer("");setShowModel(false);}
  };

  if(activeSec){
    const questions=QUIZ_DATA[activeSec.id];
    if(done){
      const mcQs=questions.filter(q=>q.type==="mc");
      const pct=mcQs.length?Math.round((sessionScore.correct/mcQs.length)*100):100;
      const grade=pct>=80?"🏆 Excellent!":pct>=60?"👍 Good work":"📚 Keep studying";
      return(
        <div style={{padding:"24px",maxWidth:600,margin:"0 auto"}}>
          <button onClick={()=>setActiveSec(null)} style={{background:"none",border:"none",color:T.p1,cursor:"pointer",fontSize:13,marginBottom:24,padding:0}}>← All sections</button>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:"36px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>{grade.split(" ")[0]}</div>
            <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:8}}>{grade.slice(grade.indexOf(" ")+1)}</div>
            {mcQs.length>0&&<div style={{fontSize:14,color:T.textDim,marginBottom:24}}>Multiple choice: <span style={{color:pct>=80?T.good:pct>=60?T.p3:T.warn,fontWeight:700}}>{sessionScore.correct}/{mcQs.length}</span> — {pct}%</div>}
            {mcQs.length>0&&<div style={{height:8,background:T.bgDeep,borderRadius:4,overflow:"hidden",marginBottom:24}}><div style={{height:"100%",width:`${pct}%`,background:pct>=80?T.good:pct>=60?T.p3:T.warn,borderRadius:4,transition:"width 0.6s"}}/></div>}
            <div style={{fontSize:12,color:T.textDim,marginBottom:24}}>Open-ended questions: {questions.filter(q=>q.type==="open").length} — check your answers against the model answers shown.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>startQuiz(activeSec)} style={{background:T.p1+"18",border:`1px solid ${T.p1}44`,color:T.p1,padding:"10px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Retry</button>
              <button onClick={()=>setActiveSec(null)} style={{background:"none",border:`1px solid ${T.border}`,color:T.textDim,padding:"10px 20px",borderRadius:8,cursor:"pointer",fontSize:13}}>All Sections</button>
            </div>
          </div>
        </div>
      );
    }

    const q=questions[qIndex];
    const isCorrect=q.type==="mc"&&selected===q.answer;
    return(
      <div style={{padding:"24px",maxWidth:640,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <button onClick={()=>setActiveSec(null)} style={{background:"none",border:"none",color:T.p1,cursor:"pointer",fontSize:13,padding:0}}>← {activeSec.title}</button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:10,color:activeSec.phaseColor,background:activeSec.phaseColor+"15",padding:"2px 8px",borderRadius:4}}>{q.type==="mc"?"Multiple Choice":"Open-Ended"}</span>
            <span style={{fontSize:12,color:T.textDim,fontFamily:"monospace"}}>{qIndex+1} / {questions.length}</span>
          </div>
        </div>
        <div style={{height:4,background:T.border,borderRadius:4,marginBottom:20,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(qIndex/questions.length)*100}%`,background:activeSec.phaseColor,borderRadius:4,transition:"width 0.3s"}}/>
        </div>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"22px",marginBottom:14}}>
          <pre style={{fontSize:14,color:T.text,lineHeight:1.75,margin:"0 0 18px",fontFamily:"'Segoe UI',system-ui,sans-serif",whiteSpace:"pre-wrap"}}>{q.q}</pre>

          {q.type==="mc"&&(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {q.options.map((opt,i)=>{
                let bg=T.bgDeep,border=T.border,color=T.textDim,fw=400;
                if(selected!==null){
                  if(i===q.answer){bg=T.good+"15";border=T.good+"55";color=T.good;fw=600;}
                  else if(i===selected&&selected!==q.answer){bg=T.warn+"15";border=T.warn+"55";color=T.warn;}
                }
                return(
                  <button key={i} onClick={()=>handleMCAnswer(i)} style={{background:bg,border:`1px solid ${border}`,color,padding:"11px 15px",borderRadius:9,cursor:selected!==null?"default":"pointer",fontSize:13,textAlign:"left",transition:"all 0.15s",fontWeight:fw}}>
                    {opt}
                  </button>
                );
              })}
              {showResult&&(
                <div style={{marginTop:8,padding:"12px 15px",borderRadius:9,background:isCorrect?T.good+"12":T.warn+"12",border:`1px solid ${isCorrect?T.good+"44":T.warn+"44"}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:isCorrect?T.good:T.warn,marginBottom:4}}>{isCorrect?"✓ Correct!":"✗ Incorrect"}</div>
                  <div style={{fontSize:12,color:T.textDim,lineHeight:1.65}}>{q.explanation}</div>
                </div>
              )}
            </div>
          )}

          {q.type==="open"&&(
            <div>
              {q.hint&&<div style={{fontSize:11,color:T.p3,background:T.p3+"10",border:`1px solid ${T.p3}22`,borderRadius:7,padding:"9px 13px",marginBottom:12}}>💡 Hint: {q.hint}</div>}
              <textarea value={openAnswer} onChange={e=>setOpenAnswer(e.target.value)} placeholder="Write your answer here..." rows={5} style={{width:"100%",background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:9,padding:"11px 14px",color:T.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.7,fontFamily:"'Segoe UI',system-ui,sans-serif"}}/>
              <button onClick={()=>setShowModel(!showModel)} style={{marginTop:10,background:"none",border:`1px solid ${T.borderHi}`,color:T.textDim,padding:"8px 14px",borderRadius:7,cursor:"pointer",fontSize:12,width:"100%"}}>
                {showModel?"Hide model answer":"Show model answer"}
              </button>
              {showModel&&(
                <div style={{marginTop:10,background:T.bgDeep,border:`1px solid ${T.good}33`,borderRadius:9,padding:"14px"}}>
                  <div style={{fontSize:10,color:T.good,letterSpacing:"0.12em",fontWeight:700,marginBottom:8}}>MODEL ANSWER</div>
                  <pre style={{fontSize:12,color:T.textDim,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>{q.model}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {(q.type==="mc"?showResult:true)&&(
          <button onClick={nextQuestion} style={{width:"100%",padding:"12px",background:activeSec.phaseColor,border:"none",color:"#fff",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700,opacity:q.type==="open"?1:1}}>
            {qIndex+1>=questions.length?"See Results →":"Next Question →"}
          </button>
        )}
      </div>
    );
  }

  return(
    <div style={{padding:"24px",maxWidth:800,margin:"0 auto"}}>
      <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:8}}>// quiz</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Section Quizzes</div>
      <div style={{fontSize:12,color:T.textDim,marginBottom:6}}>Multiple choice questions are auto-graded. Open-ended questions show model answers to self-assess.</div>
      <div style={{fontSize:11,color:T.textFade,marginBottom:24,fontFamily:"monospace"}}>Complete a section's roadmap tasks before attempting its quiz.</div>
      {roadmap.map((ph,pi)=>{
        const secWithQuiz=ph.sections.filter(s=>QUIZ_DATA[s.id]);
        if(!secWithQuiz.length)return null;
        return(
          <div key={pi} style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:ph.color}}/>
              <span style={{fontSize:13,fontWeight:700,color:ph.color}}>Phase {ph.phase} — {ph.title}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:9}}>
              {secWithQuiz.map(s=>{
                const qs=QUIZ_DATA[s.id];
                const mcCount=qs.filter(q=>q.type==="mc").length;
                const openCount=qs.filter(q=>q.type==="open").length;
                const done=s.tasks.filter((_,i)=>progress[`${s.id}-${i}`]).length;
                const pct=s.tasks.length?Math.round(done/s.tasks.length*100):0;
                return(
                  <div key={s.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:11,padding:"15px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.3,flex:1}}>{s.title}</div>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:10}}>
                      {mcCount>0&&<span style={{fontSize:9,color:T.p1,background:T.p1+"15",padding:"2px 7px",borderRadius:4}}>{mcCount} MC</span>}
                      {openCount>0&&<span style={{fontSize:9,color:T.p3,background:T.p3+"15",padding:"2px 7px",borderRadius:4}}>{openCount} Open</span>}
                    </div>
                    <div style={{height:3,background:T.border,borderRadius:3,marginBottom:10,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:ph.color+"88",borderRadius:3}}/>
                    </div>
                    <button onClick={()=>startQuiz({...s,phaseColor:ph.color,phaseTitle:ph.title})} style={{width:"100%",padding:"8px",background:ph.color+"18",border:`1px solid ${ph.color}44`,color:ph.color,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600}}>
                      Start Quiz →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CAREER PATHS TAB ──────────────────────────────────────────────────────────
function PathsTab({roadmap,progress}){
  const [activePath,setActivePath]=useState(null);

  const getPathPct=(focusSections)=>{
    const keys=roadmap.flatMap(ph=>ph.sections.filter(s=>focusSections.includes(s.id)).flatMap(s=>s.tasks.map((_,i)=>`${s.id}-${i}`)));
    if(!keys.length)return 0;
    return Math.round(keys.filter(k=>progress[k]).length/keys.length*100);
  };

  if(activePath){
    const path=CAREER_PATHS.find(p=>p.id===activePath);
    const pct=getPathPct(path.focusSections);
    const emphColors={high:T.good,partial:T.p3,skip:T.textFade};
    const emphLabels={high:"MUST DO",partial:"PARTIAL",skip:"OPTIONAL"};
    return(
      <div style={{padding:"24px",maxWidth:820,margin:"0 auto"}}>
        <button onClick={()=>setActivePath(null)} style={{background:"none",border:"none",color:T.p1,cursor:"pointer",fontSize:13,marginBottom:20,padding:0}}>← All Paths</button>
        <div style={{background:T.bgCard,border:`1px solid ${path.color}44`,borderRadius:16,padding:"26px",marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,right:0,width:100,height:100,background:path.color+"08",borderRadius:"0 0 0 100px"}}/>
          <div style={{fontSize:38,marginBottom:10}}>{path.icon}</div>
          <div style={{fontSize:20,fontWeight:800,color:path.color,marginBottom:4}}>{path.title}</div>
          <div style={{fontSize:13,color:T.textDim,marginBottom:16,maxWidth:600}}>{path.description}</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:16}}>
            {[{l:"Timeline",v:path.timeframe},{l:"Avg Salary",v:path.avgSalary},{l:"Demand",v:path.demand}].map((s,i)=>(
              <div key={i}><div style={{fontSize:9,color:T.textFade,letterSpacing:"0.1em",marginBottom:3}}>{s.l.toUpperCase()}</div><div style={{fontSize:13,fontWeight:700,color:path.color}}>{s.v}</div></div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:T.textDim}}>Your progress on this path</span><span style={{fontSize:13,fontWeight:700,color:path.color}}>{pct}%</span></div>
          <div style={{height:7,background:T.bgDeep,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:path.color,borderRadius:4,transition:"width 0.6s"}}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Phase Priorities</div>
            {path.phases.map((p,i)=>{
              const ph=roadmap[p.phase-1];if(!ph)return null;
              const ec=emphColors[p.emphasis];const el=emphLabels[p.emphasis];
              return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:ph.color,flexShrink:0,marginTop:5}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,color:T.text}}>Phase {p.phase} — {ph.title}</span>
                      <span style={{fontSize:9,color:ec,background:ec+"18",padding:"1px 7px",borderRadius:4,fontWeight:700}}>{el}</span>
                    </div>
                    <div style={{fontSize:10,color:T.textFade}}>{p.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px",flex:1}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>Key Skills</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {path.keySkills.map((sk,i)=><span key={i} style={{fontSize:10,color:path.color,background:path.color+"15",border:`1px solid ${path.color}33`,padding:"3px 9px",borderRadius:5}}>{sk}</span>)}
              </div>
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px",flex:1}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>Must-Build Projects</div>
              {path.projects.map((p,i)=><div key={i} style={{fontSize:11,color:T.textDim,marginBottom:5,display:"flex",gap:6}}><span style={{color:path.color}}>→</span>{p}</div>)}
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>Interview Focus</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {path.interviewFocus.map((t,i)=><span key={i} style={{fontSize:10,color:T.textDim,background:T.bgDeep,border:`1px solid ${T.border}`,padding:"4px 9px",borderRadius:5}}>{t}</span>)}
            </div>
          </div>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>Companies Hiring in MENA</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {path.companies.map((c,i)=><span key={i} style={{fontSize:10,color:T.textDim,background:T.bgDeep,padding:"4px 9px",borderRadius:5}}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"24px",maxWidth:800,margin:"0 auto"}}>
      <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:8}}>// career paths</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Choose Your Path</div>
      <div style={{fontSize:12,color:T.textDim,marginBottom:24}}>Each path shows which phases matter most, what to focus on, and what companies hire for in MENA.</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {CAREER_PATHS.map(path=>{
          const pct=getPathPct(path.focusSections);
          return(
            <div key={path.id} onClick={()=>setActivePath(path.id)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px",cursor:"pointer",transition:"border-color 0.2s,transform 0.15s",position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=path.color+"55";e.currentTarget.style.transform="translateX(3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="";}}>
              <div style={{position:"absolute",left:0,top:0,width:3,height:"100%",background:path.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:26}}>{path.icon}</span>
                    <div><div style={{fontSize:15,fontWeight:700,color:path.color}}>{path.title}</div><div style={{fontSize:11,color:T.textDim}}>{path.tagline}</div></div>
                  </div>
                  <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10}}>
                    {[{l:"Timeline",v:path.timeframe},{l:"Salary",v:path.avgSalary},{l:"Demand",v:path.demand}].map((s,i)=>(
                      <span key={i}><span style={{fontSize:9,color:T.textFade}}>{s.l}: </span><span style={{fontSize:11,fontWeight:600,color:T.text}}>{s.v}</span></span>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:T.textDim}}>Your progress</span><span style={{fontSize:11,fontWeight:700,color:path.color}}>{pct}%</span></div>
                  <div style={{height:4,background:T.bgDeep,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:path.color,borderRadius:4,transition:"width 0.6s"}}/></div>
                </div>
                <span style={{fontSize:11,color:path.color,background:path.color+"15",border:`1px solid ${path.color}33`,padding:"6px 14px",borderRadius:6}}>View Path →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CERTIFICATE TAB ───────────────────────────────────────────────────────────
function CertificateTab({userDoc,roadmap,progress,xp}){
  const [generating,setGenerating]=useState(null);

  const getPhasePct=(ph)=>{
    const keys=ph.sections.flatMap(s=>s.tasks.map((_,i)=>`${s.id}-${i}`));
    if(!keys.length)return 0;
    return Math.round(keys.filter(k=>progress[k]).length/keys.length*100);
  };

  const totalPct=roadmap.length?Math.round(roadmap.reduce((s,ph)=>s+getPhasePct(ph),0)/roadmap.length):0;

  const downloadCert=(title,subtitle,color,unlocked)=>{
    if(!unlocked)return;
    setGenerating(title);
    const name=userDoc.username||"Student";
    const date=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f0e1a"/><stop offset="100%" stop-color="#13111a"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${color}" stop-opacity="0"/><stop offset="50%" stop-color="${color}"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="900" height="620" fill="url(#bg)"/>
  <rect x="2" y="2" width="896" height="616" fill="none" stroke="${color}" stroke-width="1.5" rx="10" opacity="0.6"/>
  <rect x="14" y="14" width="872" height="592" fill="none" stroke="${color}" stroke-width="0.5" rx="8" opacity="0.25"/>
  <rect x="0" y="0" width="900" height="3" fill="url(#ac)"/>
  <rect x="0" y="617" width="900" height="3" fill="url(#ac)"/>
  <text x="450" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="${color}" letter-spacing="8" opacity="0.85">DS ACADEMY · ZEROTODS.NETLIFY.APP</text>
  <line x1="180" y1="88" x2="340" y2="88" stroke="${color}" stroke-width="0.5" opacity="0.4"/>
  <text x="450" y="91" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${color}" opacity="0.5">✦</text>
  <line x1="560" y1="88" x2="720" y2="88" stroke="${color}" stroke-width="0.5" opacity="0.4"/>
  <text x="450" y="148" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#6b6880" letter-spacing="5">CERTIFICATE OF COMPLETION</text>
  <text x="450" y="205" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#4a4665">This certifies that</text>
  <text x="450" y="268" text-anchor="middle" font-family="Georgia,serif" font-size="46" fill="#e2dff0" font-weight="bold">${name}</text>
  <line x1="210" y1="282" x2="690" y2="282" stroke="${color}" stroke-width="0.4" opacity="0.5"/>
  <text x="450" y="325" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#4a4665">has successfully completed</text>
  <text x="450" y="378" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="${color}" font-weight="bold">${title}</text>
  <text x="450" y="412" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#6b6880">${subtitle}</text>
  <text x="450" y="455" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#3a3860">earning a total of ${xp.toLocaleString()} XP on the ZeroToDS learning platform</text>
  <line x1="120" y1="502" x2="360" y2="502" stroke="${color}" stroke-width="0.4" opacity="0.3"/>
  <line x1="540" y1="502" x2="780" y2="502" stroke="${color}" stroke-width="0.4" opacity="0.3"/>
  <text x="240" y="524" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#4a4665">${date}</text>
  <text x="660" y="524" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${color}" font-weight="bold">Radwan</text>
  <text x="240" y="544" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#2a2540" letter-spacing="2">DATE ISSUED</text>
  <text x="660" y="544" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#2a2540" letter-spacing="2">INSTRUCTOR · DS ACADEMY</text>
  <text x="450" y="590" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#2a2540" letter-spacing="3">VERIFIED · zerotods.netlify.app · ${date}</text>
</svg>`;
    const blob=new Blob([svg],{type:"image/svg+xml"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`DSAcademy_${title.replace(/[\s—]+/g,"_")}_${name.replace(/\s+/g,"_")}.svg`;
    a.click();URL.revokeObjectURL(url);
    setTimeout(()=>setGenerating(null),800);
  };

  const phaseCerts=roadmap.map((ph)=>({
    title:`Phase ${ph.phase} — ${ph.title}`,subtitle:ph.duration,
    color:ph.color,pct:getPhasePct(ph),unlocked:getPhasePct(ph)===100,
  }));

  const finalCert={title:"Full ZeroToDS Roadmap",subtitle:"18-Month Data Science Program · All 5 Phases Completed",color:"#f7c96e",pct:totalPct,unlocked:totalPct===100};

  return(
    <div style={{padding:"24px",maxWidth:760,margin:"0 auto"}}>
      <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:8}}>// certificates</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Your Certificates</div>
      <div style={{fontSize:12,color:T.textDim,marginBottom:24}}>Complete a phase at 100% to unlock its certificate. Finish all 5 phases for the final certificate. Downloads as SVG — open in browser and print as PDF.</div>

      {/* Final */}
      <div style={{marginBottom:22}}>
        <div style={{fontSize:10,color:T.gold,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:10}}>✦ GRAND CERTIFICATE</div>
        <div style={{background:finalCert.unlocked?"linear-gradient(135deg,#f7c96e0a,#f7c96e05)":T.bgCard,border:`1px solid ${finalCert.unlocked?T.gold+"55":T.border}`,borderRadius:14,padding:"20px",display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{fontSize:36}}>{finalCert.unlocked?"🏆":"🔒"}</div>
          <div style={{flex:1,minWidth:180}}>
            <div style={{fontSize:14,fontWeight:700,color:finalCert.unlocked?T.gold:T.text,marginBottom:3}}>{finalCert.title}</div>
            <div style={{fontSize:10,color:T.textFade,marginBottom:8}}>{finalCert.subtitle}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:T.textDim}}>Overall progress</span><span style={{fontSize:11,fontWeight:700,color:T.gold}}>{finalCert.pct}%</span></div>
            <div style={{height:5,background:T.bgDeep,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${finalCert.pct}%`,background:"linear-gradient(90deg,#f7c96e88,#f7c96e)",borderRadius:4,transition:"width 0.6s"}}/></div>
            {!finalCert.unlocked&&<div style={{fontSize:10,color:T.textFade,marginTop:5}}>Complete all 5 phases to unlock</div>}
          </div>
          <button onClick={()=>downloadCert(finalCert.title,finalCert.subtitle,finalCert.color,finalCert.unlocked)} disabled={!finalCert.unlocked||generating===finalCert.title} style={{background:finalCert.unlocked?T.gold+"20":"transparent",border:`1px solid ${finalCert.unlocked?T.gold+"55":T.border}`,color:finalCert.unlocked?T.gold:T.textFade,padding:"9px 16px",borderRadius:7,cursor:finalCert.unlocked?"pointer":"not-allowed",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
            {generating===finalCert.title?"Generating...":finalCert.unlocked?"⬇ Download":"Locked"}
          </button>
        </div>
      </div>

      {/* Phase certs */}
      <div style={{fontSize:10,color:T.textDim,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:10}}>PHASE CERTIFICATES</div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {phaseCerts.map((cert,i)=>(
          <div key={i} style={{background:cert.unlocked?cert.color+"08":T.bgCard,border:`1px solid ${cert.unlocked?cert.color+"44":T.border}`,borderRadius:11,padding:"15px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{fontSize:22}}>{cert.unlocked?"🎓":"🔒"}</div>
            <div style={{flex:1,minWidth:150}}>
              <div style={{fontSize:13,fontWeight:600,color:cert.unlocked?cert.color:T.text,marginBottom:2}}>{cert.title}</div>
              <div style={{fontSize:9,color:T.textFade,marginBottom:7}}>{cert.subtitle}</div>
              <div style={{height:3,background:T.bgDeep,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${cert.pct}%`,background:cert.color,borderRadius:3,transition:"width 0.5s"}}/></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,fontWeight:700,color:cert.unlocked?cert.color:T.textFade}}>{cert.pct}%</span>
              <button onClick={()=>downloadCert(cert.title,cert.subtitle,cert.color,cert.unlocked)} disabled={!cert.unlocked||generating===cert.title} style={{background:cert.unlocked?cert.color+"18":"transparent",border:`1px solid ${cert.unlocked?cert.color+"44":T.border}`,color:cert.unlocked?cert.color:T.textFade,padding:"6px 13px",borderRadius:6,cursor:cert.unlocked?"pointer":"not-allowed",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
                {generating===cert.title?"...":cert.unlocked?"⬇ Download":"Locked"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



// ── ONBOARDING QUIZ
function OnboardingQuiz({currentUser, userDoc, onComplete}){
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const questions = [
    {
      id: "background",
      emoji: "👋",
      question: `Nice to meet you, ${userDoc.username}! What's your coding background?`,
      subtitle: "This helps us set the right starting point for you.",
      options: [
        {value:"none",    label:"Complete beginner", sub:"Never written a line of code"},
        {value:"some",    label:"A little coding",    sub:"Learned some basics, nothing serious"},
        {value:"python",  label:"I know Python",      sub:"Comfortable with the language"},
        {value:"dev",     label:"Developer / engineer", sub:"Professional coding experience"},
      ]
    },
    {
      id: "goal",
      emoji: "🎯",
      question: "What's your main career goal?",
      subtitle: "We'll highlight the path and phases that matter most for you.",
      options: [
        {value:"data-analyst",   label:"Data Analyst",    sub:"SQL, Python, dashboards, business insights"},
        {value:"data-scientist", label:"Data Scientist",  sub:"ML models, statistics, predictions"},
        {value:"ml-engineer",    label:"ML Engineer",     sub:"Deploy models, MLOps, production systems"},
        {value:"explore",        label:"Still exploring", sub:"I want to learn and see where it leads"},
      ]
    },
    {
      id: "hours",
      emoji: "⏰",
      question: "How many hours per week can you dedicate?",
      subtitle: "Be honest — consistency beats intensity every time.",
      options: [
        {value:"2-4",  label:"2–4 hours/week",  sub:"Weekend learner"},
        {value:"5-10", label:"5–10 hours/week", sub:"Part-time serious"},
        {value:"10-20",label:"10–20 hours/week",sub:"Full commitment"},
        {value:"20+",  label:"20+ hours/week",  sub:"All in"},
      ]
    },
    {
      id: "fear",
      emoji: "😅",
      question: "What worries you most about learning data science?",
      subtitle: "You're not alone — everyone struggles with something.",
      options: [
        {value:"math",    label:"The math & statistics", sub:"Feels like it requires a PhD"},
        {value:"code",    label:"The coding",            sub:"Programming is intimidating"},
        {value:"time",    label:"Staying consistent",    sub:"Starting strong but losing momentum"},
        {value:"jobs",    label:"Getting a job after",   sub:"Will this actually lead somewhere?"},
      ]
    },
  ];

  const pathRecommendations = {
    "data-analyst":   {id:"data-analyst",   color:"#7eb8f7", icon:"📊", label:"Data Analyst",    why:"Perfect match — SQL, Python, and business analytics are exactly this path."},
    "data-scientist": {id:"data-scientist", color:"#a78bfa", icon:"🧠", label:"Data Scientist",  why:"Great choice — statistics and ML are the core of this curriculum."},
    "ml-engineer":    {id:"ml-engineer",    color:"#6dd6a0", icon:"⚙️", label:"ML Engineer",     why:"Ambitious and achievable — you'll build deployed systems by Phase 3."},
    "explore":        {id:"data-analyst",   color:"#7eb8f7", icon:"📊", label:"Data Analyst",    why:"Best starting point — most in-demand role in MENA, great foundation for everything else."},
  };

  const startLessons = {
    "none":   "pycore-basics",
    "some":   "numpy",
    "python": "pandas-basics",
    "dev":    "pandas-advanced",
  };

  const isLastQuestion = step === questions.length - 1;
  const isDone = step === questions.length;
  const q = questions[step];
  const recommendation = pathRecommendations[answers.goal] || pathRecommendations["explore"];
  const startLesson = startLessons[answers.background] || "numpy";

  const selectAnswer = (value) => {
    setAnswers(a => ({...a, [q.id]: value}));
  };

  const next = async () => {
    if(!answers[q.id]) return;
    if(isLastQuestion){
      setSaving(true);
      const finalAnswers = {...answers};
      const rec = pathRecommendations[finalAnswers.goal] || pathRecommendations["explore"];
      const sl = startLessons[finalAnswers.background] || "numpy";
      await updateDoc(doc(db,"users",currentUser.uid),{
        onboarded: true,
        onboardingAnswers: finalAnswers,
        recommendedPath: rec.id,
        recommendedStartLesson: sl,
      });
      setSaving(false);
      setStep(s => s+1);
    } else {
      setStep(s => s+1);
    }
  };

  const progressPct = Math.round((step / questions.length) * 100);

  // Result screen
  if(isDone){
    return(
      <div style={{position:"fixed",inset:0,background:"#0b0a12",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:"20px"}}>
        <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🎉</div>
          <div style={{fontSize:9,color:T.p2,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:12}}>// you're all set</div>
          <div style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:"-0.02em",marginBottom:8}}>Your path is ready.</div>
          <div style={{fontSize:14,color:T.textDim,marginBottom:32,lineHeight:1.7}}>
            Based on your answers, here's where we recommend you start.
          </div>
          <div style={{background:T.bgCard,border:`2px solid ${recommendation.color}44`,borderRadius:16,padding:"24px",marginBottom:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:recommendation.color}}/>
            <div style={{fontSize:32,marginBottom:10}}>{recommendation.icon}</div>
            <div style={{fontSize:11,color:recommendation.color,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:6}}>RECOMMENDED PATH</div>
            <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:8}}>{recommendation.label}</div>
            <div style={{fontSize:13,color:T.textDim,lineHeight:1.7,marginBottom:16}}>{recommendation.why}</div>
            <div style={{background:T.bgDeep,borderRadius:8,padding:"12px 16px",textAlign:"left"}}>
              <div style={{fontSize:10,color:T.textFade,letterSpacing:"0.1em",marginBottom:8}}>YOUR PERSONALISED START</div>
              {answers.background==="none"&&<div style={{fontSize:12,color:T.textDim}}>📍 Starting from Python Basics — no prior experience needed</div>}
              {answers.background==="some"&&<div style={{fontSize:12,color:T.textDim}}>📍 Starting from NumPy — skipping the very basics</div>}
              {answers.background==="python"&&<div style={{fontSize:12,color:T.textDim}}>📍 Starting from Pandas — your Python is ready</div>}
              {answers.background==="dev"&&<div style={{fontSize:12,color:T.textDim}}>📍 Starting from Pandas Advanced — you move fast</div>}
              {answers.hours==="2-4"&&<div style={{fontSize:12,color:T.textDim,marginTop:6}}>⏱ At your pace, Phase 1 takes about 3–4 months</div>}
              {answers.hours==="5-10"&&<div style={{fontSize:12,color:T.textDim,marginTop:6}}>⏱ At your pace, Phase 1 takes about 6–8 weeks</div>}
              {answers.hours==="10-20"&&<div style={{fontSize:12,color:T.textDim,marginTop:6}}>⏱ At your pace, Phase 1 takes about 3–4 weeks</div>}
              {answers.hours==="20+"&&<div style={{fontSize:12,color:T.textDim,marginTop:6}}>⏱ At your pace, you could finish Phase 1 in 2 weeks</div>}
            </div>
          </div>
          <button onClick={()=>onComplete(startLesson)} style={{width:"100%",padding:"14px",background:"#8b7cf6",border:"none",color:"#fff",borderRadius:10,cursor:"pointer",fontSize:15,fontWeight:700,letterSpacing:"-0.01em"}}>
            Start Learning →
          </button>
          <div style={{fontSize:11,color:T.textFade,marginTop:12}}>You can always change your path later from the Progress tab</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{position:"fixed",inset:0,background:"#0b0a12",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:"20px"}}>
      <div style={{maxWidth:520,width:"100%"}}>
        {/* Progress bar */}
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:10,color:T.textFade,fontFamily:"monospace"}}>{step+1} of {questions.length}</div>
            <div style={{fontSize:10,color:T.textFade,fontFamily:"monospace"}}>{progressPct}%</div>
          </div>
          <div style={{height:3,background:T.bgCard,borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progressPct}%`,background:"#8b7cf6",borderRadius:3,transition:"width 0.4s ease"}}/>
          </div>
        </div>
        {/* Question */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:16}}>{q.emoji}</div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:"-0.02em",marginBottom:8,lineHeight:1.3}}>{q.question}</div>
          <div style={{fontSize:13,color:T.textDim}}>{q.subtitle}</div>
        </div>
        {/* Options */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {q.options.map(opt=>{
            const selected = answers[q.id]===opt.value;
            return(
              <button key={opt.value} onClick={()=>selectAnswer(opt.value)} style={{background:selected?"#8b7cf618":T.bgCard,border:`1.5px solid ${selected?"#8b7cf6":T.border}`,borderRadius:12,padding:"14px 18px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${selected?"#8b7cf6":T.borderHi}`,background:selected?"#8b7cf6":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selected&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:selected?T.text:T.textDim,marginBottom:2}}>{opt.label}</div>
                  <div style={{fontSize:11,color:T.textFade}}>{opt.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
        {/* Next button */}
        <button onClick={next} disabled={!answers[q.id]||saving} style={{width:"100%",padding:"13px",background:answers[q.id]?"#8b7cf6":"#1e1c35",border:"none",color:answers[q.id]?"#fff":T.textFade,borderRadius:10,cursor:answers[q.id]?"pointer":"not-allowed",fontSize:14,fontWeight:700,transition:"all 0.2s"}}>
          {saving?"Saving...":isLastQuestion?"See My Path →":"Continue →"}
        </button>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{width:"100%",padding:"10px",background:"none",border:"none",color:T.textFade,cursor:"pointer",fontSize:12,marginTop:8}}>← Back</button>}
      </div>
    </div>
  );
}

// ── DS TUTOR CHATBOT
function DSTutorTab({userDoc, activeLessonId}){
  const lessonTitles={"pycore-basics":"Python Basics","pycore-advanced":"Python Intermediate","pycore-ds-patterns":"Python Patterns for DS","numpy":"NumPy Arrays","pandas-basics":"Pandas: Loading & Exploring Data","pandas-advanced":"Pandas: Cleaning, Merging & Transforming","eda":"Exploratory Data Analysis","visualization":"Data Visualization","sql-basics":"SQL Foundations","sql-joins":"SQL JOINs & Subqueries","sql-window":"Window Functions","probability":"Probability & Bayes"};
  const currentLesson=activeLessonId&&lessonTitles[activeLessonId]?lessonTitles[activeLessonId]:null;
  const welcomeMsg=currentLesson
    ?`Hey! I'm your ZeroToDS AI tutor 👋\n\nI can see you're working on **${currentLesson}**. Ask me anything about it — or any other data science concept you're stuck on.`
    :"Hey! I'm your ZeroToDS AI tutor 👋\n\nAsk me anything about Python, pandas, SQL, machine learning, statistics, or any concept you're stuck on. I'll explain it simply and clearly.";
  const [messages,setMessages]=useState([{role:"assistant",content:welcomeMsg}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  const SUGGESTIONS=currentLesson
    ?[`Explain the key concept in ${currentLesson}`,`What's the most common mistake in ${currentLesson}?`,"Explain what a p-value is","What's overfitting and how do I fix it?"]
    :["Explain what a p-value is","How does gradient descent work?","What's overfitting and how do I fix it?","Difference between precision and recall"];

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage=async(text)=>{
    const userMsg=text||input.trim();
    if(!userMsg||loading)return;
    setInput("");
    const newMessages=[...messages,{role:"user",content:userMsg}];
    setMessages(newMessages);
    setLoading(true);
    try{
      const key=import.meta.env.VITE_GROQ_API_KEY||"";
      if(!key){
        setMessages(m=>[...m,{role:"assistant",content:"⚠️ AI Tutor is not configured yet. Ask Radwan on WhatsApp for help!"}]);
        setLoading(false);
        return;
      }
      const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body:JSON.stringify({
          model:"llama-3.3-70b-versatile",
          max_tokens:1024,
          messages:[
            {role:"system",content:`You are a friendly, expert data science tutor for ZeroToDS — a platform helping Arab students in MENA learn data science from zero. The student's name is ${userDoc.username||"there"}.${currentLesson?`\n\nThe student is currently working on the lesson: "${currentLesson}". If their question is about this lesson or related concepts, prioritize explaining it in that context.`:""}

Your teaching style:
- Explain concepts simply and clearly, like a patient friend
- Use short code examples when helpful (Python/SQL)
- Break complex things into steps
- Use analogies to make abstract concepts concrete
- Keep responses concise — not too long
- Encourage the student when they're stuck
- If asked about unrelated topics, gently redirect to data science

Topics you cover: Python, NumPy, Pandas, SQL, Statistics, Probability, Machine Learning, Deep Learning, NLP, Data Visualization, Feature Engineering, Model Evaluation, Career advice in DS.`},
            ...newMessages.map(m=>({role:m.role,content:m.content}))
          ]
        })
      });
      const data=await res.json();
      const reply=data.choices?.[0]?.message?.content||"Sorry, I couldn't get a response. Try again!";
      setMessages(m=>[...m,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(m=>[...m,{role:"assistant",content:"Something went wrong. Check your connection and try again."}]);
    }
    setLoading(false);
  };

  const formatMsg=(text)=>{
    // Simple code block detection
    const parts=text.split(/(```[\s\S]*?```)/g);
    return parts.map((part,i)=>{
      if(part.startsWith("```")){
        const code=part.replace(/```\w*/,"").replace(/^[\r\n]+/,"").replace(/```$/,"");
        return <pre key={i} style={{background:T.bgDeep,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px",fontSize:11,color:"#6dd6a0",overflowX:"auto",margin:"8px 0",fontFamily:"monospace",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{code}</pre>;
      }
      return <span key={i} style={{whiteSpace:"pre-wrap"}}>{part}</span>;
    });
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 60px)",background:T.bg}}>
      {/* Header */}
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0,background:T.bgDeep}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#f472b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:T.text}}>ZeroToDS AI Tutor</div>
          <div style={{fontSize:11,color:T.textDim,display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#6dd6a0",boxShadow:"0 0 5px #6dd6a0"}}/>
            powered by Groq · llama-3.3-70b
          </div>
        </div>
        <button onClick={()=>setMessages([{role:"assistant",content:"Hey! I'm your ZeroToDS AI tutor 👋\n\nAsk me anything about Python, pandas, SQL, machine learning, statistics, or any concept you're stuck on."}])} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,color:T.textDim,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,
              background:m.role==="user"?"#8b7cf620":"linear-gradient(135deg,#8b7cf6,#f472b6)",
              color:m.role==="user"?T.p1:"#fff",border:`1px solid ${m.role==="user"?T.p1+"44":T.border}`}}>
              {m.role==="user"?(userDoc.username||"U")[0].toUpperCase():"🤖"}
            </div>
            <div style={{maxWidth:"75%",background:m.role==="user"?T.p1+"18":T.bgCard,border:`1px solid ${m.role==="user"?T.p1+"33":T.border}`,borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",padding:"10px 14px",fontSize:13,color:T.text,lineHeight:1.7}}>
              {formatMsg(m.content)}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#f472b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"4px 16px 16px 16px",padding:"10px 16px",display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.p1,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions - only show at start */}
      {messages.length<=1&&(
        <div style={{padding:"0 16px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {SUGGESTIONS.map((s,i)=>(
            <button key={i} onClick={()=>sendMessage(s)} style={{background:T.bgCard,border:`1px solid ${T.border}`,color:T.textDim,padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:11,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p1;e.currentTarget.style.color=T.p1;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textDim;}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,flexShrink:0,background:T.bgDeep}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
          placeholder="Ask anything about data science..."
          style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
        />
        <button onClick={()=>sendMessage()} disabled={!input.trim()||loading} style={{background:T.p1,border:"none",color:"#fff",padding:"10px 16px",borderRadius:10,cursor:input.trim()&&!loading?"pointer":"default",fontSize:13,fontWeight:600,opacity:input.trim()&&!loading?1:0.5,transition:"opacity 0.2s"}}>
          Send →
        </button>
      </div>
    </div>
  );
}

// ── STUDENT DASHBOARD
function StudentDashboard({currentUser,userDoc}){
  const [tab,setTab]=useState("roadmap");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [progressSubTab,setProgressSubTab]=useState("paths");
  const [expandedSection,setExpandedSection]=useState(null);
  const [activePhase,setActivePhase]=useState(0);
  const [roadmap,setRoadmap]=useState(DEFAULT_ROADMAP);
  const [students,setStudents]=useState([]);
  const [messages,setMessages]=useState([]);
  const [progress,setProgress]=useState(userDoc.progress||{});
  const [streak,setStreak]=useState(userDoc.streak||0);
  const [xp,setXp]=useState(userDoc.xp||0);
  const [xpToast,setXpToast]=useState(null);
  const [checkins,setCheckins]=useState(userDoc.checkins||[]);
  const [checkinForm,setCheckinForm]=useState({learned:"",difficult:"",goal:""});
  const [showCheckin,setShowCheckin]=useState(false);
  const [activeLearnId,setActiveLearnId]=useState("numpy");
  const [unlockedPhases,setUnlockedPhases]=useState(userDoc.unlockedPhases||[0]);
  const [showProjectModal,setShowProjectModal]=useState(false);
  const [showPaywall,setShowPaywall]=useState(false);
  const [projectPhaseIdx,setProjectPhaseIdx]=useState(null);
  const [projectSubmission,setProjectSubmission]=useState({link:"",notes:""});
  const [projectSubmitted,setProjectSubmitted]=useState(userDoc.projectSubmissions||{});
  const [expandedProj,setExpandedProj]=useState(null);
  const [completedProjects,setCompletedProjects]=useState(userDoc.completedProjects||{});
  const [readMsgIds,setReadMsgIds]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("dsReadMsgs")||"[]"));}catch{return new Set();}});
  const [showOnboarding,setShowOnboarding]=useState(!userDoc.onboarded);
  const [startLessonOverride,setStartLessonOverride]=useState(userDoc.recommendedStartLesson||null);

  const handleOnboardingComplete=(startLesson)=>{
    setShowOnboarding(false);
    if(startLesson){
      setStartLessonOverride(startLesson);
      setActiveLearnId(startLesson);
    }
    setTab("roadmap");
  };

  const xpRef=React.useRef(xp);
  useEffect(()=>{xpRef.current=xp;},[xp]);
  const awardXP=async(amount,isLesson=false)=>{
    const newXp=xpRef.current+amount;
    xpRef.current=newXp;
    setXp(newXp);
    setXpToast({amount,isLesson});
    await updateDoc(doc(db,"users",currentUser.uid),{xp:newXp});
  };

  const onLessonComplete = (lessonId) => {
    const mapping = LESSON_COMPLETES_TASK[lessonId];
    if(!mapping) return;
    const key = `${mapping.section}-${mapping.task}`;
    if(!progress[key]){
      saveProgress({...progress,[key]:true});
      awardXP(25,true);
      addDoc(collection(db,"analytics"),{uid:currentUser.uid,lessonId,event:"complete",timestamp:Date.now()}).catch(()=>{});
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
    awardXP(50);
  };
  const thisWeekCheckin=checkins.find(c=>c.week===getWeekNumber());

  useEffect(()=>{const load=async()=>{const snap=await getDoc(doc(db,"config","roadmap"));if(snap.exists())setRoadmap(snap.data().data);};load();},[]);
  useEffect(()=>{const unsub=onSnapshot(collection(db,"users"),snap=>{setStudents(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role!=="admin"&&!u.disabled));});return unsub;},[]);
  useEffect(()=>{
    const q=query(collection(db,"messages"),orderBy("time","desc"));
    const unsub=onSnapshot(q,snap=>{setMessages(snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.to==="all"||m.to===currentUser.uid));});
    return unsub;
  },[currentUser.uid]);

  const unreadCount=messages.filter(m=>!readMsgIds.has(m.id)).length;
  const markMessagesRead=()=>{
    const allIds=messages.map(m=>m.id);
    const newSet=new Set([...readMsgIds,...allIds]);
    setReadMsgIds(newSet);
    try{localStorage.setItem("dsReadMsgs",JSON.stringify([...newSet]));}catch{}
  };
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
  const toggle=(sid,i)=>{
    const key=`${sid}-${i}`;
    const wasChecked=!!progress[key];
    saveProgress({...progress,[key]:!wasChecked});
    if(!wasChecked) awardXP(10);
  };

  const total=getTotalProgress(progress,roadmap);
  const phase=roadmap[activePhase];
  const C=phase.color;
  const getSP=s=>{const d=s.tasks.filter((_,i)=>progress[`${s.id}-${i}`]).length;return{done:d,total:s.tasks.length,pct:s.tasks.length?Math.round(d/s.tasks.length*100):0};};
  const getPP=ph=>{const keys=ph.sections.flatMap(s=>s.tasks.map((_,i)=>`${s.id}-${i}`));const d=keys.filter(k=>progress[k]).length;return{done:d,total:keys.length,pct:keys.length?Math.round(d/keys.length*100):0};};
  const todayQuote=quotes[new Date().getDay()%quotes.length];
  const milestones=[5,10,25,50,75,100];
  const nextMilestone=milestones.find(m=>m>total.pct)||100;

  const tabs=[
    {id:"motivation",  icon:"🏠", label:"Home"},
    {id:"roadmap",     icon:"📋", label:"Roadmap"},
    {id:"learn",       icon:"📚", label:"Learn"},
    {id:"tutor",       icon:"🤖", label:"AI Tutor"},
    {id:"projects",    icon:"🚀", label:"Projects"},
    {id:"progress",    icon:"📈", label:"Progress"},
    {id:"leaderboard", icon:"🏅", label:"Leaderboard"},
    {id:"messages",    icon:"💬", label:`Messages${unreadCount>0?" ("+unreadCount+")":""}`},
    {id:"blog",        icon:"📝", label:"Blog"},
  ];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"row"}}>
      <style>{`
        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .ds-sidebar {
            display: none !important;
          }
          .ds-main {
            height: 100vh !important;
            padding-bottom: 64px !important;
          }
          .ds-bottom-nav {
            display: flex !important;
          }
          .ds-roadmap-panel {
            width: 100% !important;
            height: auto !important;
            flex-direction: column !important;
          }
          .ds-roadmap-inner {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #2a2540 !important;
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 6px !important;
            padding: 10px 12px !important;
            height: auto !important;
          }
          .ds-roadmap-inner button {
            flex-shrink: 0 !important;
            width: auto !important;
          }
          .ds-roadmap-inner-sections {
            display: none !important;
          }
          .ds-roadmap-content {
            overflow-y: auto !important;
            flex: 1 !important;
          }
          .ds-admin-header {
            padding: 12px 16px 0 !important;
          }
          .ds-admin-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .ds-admin-tabs button {
            flex-shrink: 0 !important;
            padding: 8px 10px !important;
            font-size: 11px !important;
          }
          .ds-admin-content {
            padding: 16px !important;
          }
        }
        @media (min-width: 769px) {
          .ds-bottom-nav { display: none !important; }
        }
        .ds-bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 64px;
          background: #111020;
          border-top: 1px solid #2a2540;
          display: none;
          align-items: center;
          justify-content: space-around;
          z-index: 100;
          padding: 0 4px;
        }
        .ds-bottom-nav button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 4px;
          border-radius: 8px;
          min-width: 0;
          transition: opacity 0.15s;
        }
        .ds-bottom-nav button.nav-learn {
          flex: 0 0 64px;
          position: relative;
          top: -14px;
          background: #8b7cf6;
          border-radius: 50%;
          width: 52px;
          height: 52px;
          box-shadow: 0 4px 20px rgba(139,124,246,0.5);
          flex-direction: column;
          gap: 0;
          padding: 0;
        }
        .ds-bottom-nav button.nav-learn .nav-icon { font-size: 22px; }
        .ds-bottom-nav button.nav-learn .nav-label { display: none; }
        .ds-bottom-nav button .nav-icon { font-size: 18px; line-height: 1; }
        .ds-bottom-nav button .nav-label { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52px; }
      `}</style>

      {/* ONBOARDING QUIZ */}
      {showOnboarding&&<OnboardingQuiz currentUser={currentUser} userDoc={userDoc} onComplete={handleOnboardingComplete}/>}

      {/* XP TOAST */}
      {xpToast&&<XPToast amount={xpToast.amount} isLesson={xpToast.isLesson} onDone={()=>setXpToast(null)}/>}

      {/* PAYWALL MODAL */}
      {showPaywall&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(8px)"}}>
          <div style={{background:"#11101c",border:"1px solid #2a2845",borderRadius:18,padding:"36px",width:420,maxWidth:"92vw",position:"relative"}}>
            <button onClick={()=>setShowPaywall(false)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#4a4665",cursor:"pointer",fontSize:18}}>✕</button>
            <div style={{position:"absolute",top:-1,left:"20%",right:"20%",height:2,background:"linear-gradient(90deg,transparent,#8b7cf6,#f472b6,transparent)"}}/>
            <div style={{fontSize:11,color:"#8b7cf6",letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:12}}>// upgrade to full access</div>
            <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:6,letterSpacing:"-0.02em"}}>Unlock the full roadmap</div>
            <div style={{fontSize:13,color:"#7b78a0",lineHeight:1.7,marginBottom:20}}>This lesson is part of the paid plan. Upgrade to unlock Statistics, ML, Deep Learning, and 11 real projects.</div>
            <div style={{background:"#0d0c18",border:"1px solid #1e1c35",borderRadius:10,padding:"16px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:T.text}}>Guided Cohort</div>
                <div style={{fontSize:22,fontWeight:800,color:"#8b7cf6"}}>$99 <span style={{fontSize:12,color:"#4a4665",fontWeight:400}}>one-time</span></div>
              </div>
              {["Full access to all 5 phases & lessons","11 portfolio projects with real datasets","Weekly live Zoom sessions with Radwan","Private WhatsApp group","Direct instructor messaging","Phase completion certificates"].map(f=>(
                <div key={f} style={{display:"flex",gap:10,fontSize:12,color:"#c8c3e0",marginBottom:7}}><span style={{color:"#8b7cf6",flexShrink:0}}>✓</span>{f}</div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(90deg,#8b7cf6,#f472b6)",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:100,whiteSpace:"nowrap",letterSpacing:"0.08em"}}>MOST POPULAR</div>
                <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20to%20join%20the%20Phase%201%20Cohort%20($99).%20My%20email%20is%20"+encodeURIComponent(currentUser?.email||"")} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"13px",background:"#8b7cf6",border:"2px solid #8b7cf6",color:"#fff",borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:700,textDecoration:"none",textAlign:"center",boxSizing:"border-box",boxShadow:"0 0 24px rgba(139,124,246,0.35)"}}>
                  💬 Join Phase 1 Cohort — $99 one-time →
                </a>
              </div>
              <a href={"https://wa.me/96181590474?text=Hi%20Radwan!%20I%20want%20the%20DS%20Academy%20monthly%20plan%20($19/mo).%20My%20email%20is%20"+encodeURIComponent(currentUser?.email||"")} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"11px",background:"transparent",border:"1px solid #2a2845",color:"#7b78a0",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center",boxSizing:"border-box"}}>
                Or try monthly — $19/mo, cancel anytime
              </a>
              <div style={{fontSize:11,color:"#4a4665",textAlign:"center",lineHeight:1.6}}>
                Message Radwan on WhatsApp → confirm payment → activated within 24h
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="ds-sidebar" style={{width:tab==="learn"?0:sidebarOpen?220:60,flexShrink:0,background:T.bgDeep,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,transition:"width 0.25s",overflow:"hidden",zIndex:50}}>
        <div style={{padding:"16px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          {sidebarOpen&&<div style={{display:"flex",alignItems:"center",gap:7,overflow:"hidden"}}><div style={{width:7,height:7,background:"#8b7cf6",borderRadius:"50%",flexShrink:0,boxShadow:"0 0 8px #8b7cf6"}}/><span style={{fontSize:13,fontWeight:800,color:T.text,whiteSpace:"nowrap",letterSpacing:"-0.02em"}}>ZeroToDS</span></div>}
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${T.border}`,color:T.textFade,borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:12,flexShrink:0,lineHeight:1}}>{sidebarOpen?"←":"→"}</button>
        </div>
        <div style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {tabs.map(t=>{
            const active=tab===t.id;
            const badge=t.id==="messages"&&unreadCount>0?unreadCount:0;
            return(
              <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="messages")markMessagesRead();}} title={!sidebarOpen?t.label:""} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:sidebarOpen?"9px 12px":"9px 4px 18px",borderRadius:8,border:"none",background:active?T.p1+"18":"transparent",color:active?T.p1:T.textDim,cursor:"pointer",marginBottom:2,textAlign:"left",transition:"background 0.15s,color 0.15s",position:"relative"}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background=T.border;e.currentTarget.style.color=T.text;}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textDim;}}}>
                <span style={{fontSize:16,flexShrink:0,lineHeight:1}}>{t.icon}</span>
                {sidebarOpen&&<span style={{fontSize:13,fontWeight:active?600:400,whiteSpace:"nowrap",flex:1}}>{t.label}</span>}
                {!sidebarOpen&&<span style={{position:"absolute",bottom:2,left:0,right:0,fontSize:7,color:active?T.p1:T.textFade,textAlign:"center",letterSpacing:"0.02em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 2px"}}>{t.label.replace(/\s*\(.*\)/,"").slice(0,6)}</span>}
                {badge>0&&<span style={{position:"absolute",top:6,right:sidebarOpen?10:4,background:T.warn,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px",fontWeight:700,minWidth:14,textAlign:"center"}}>{badge}</span>}
                {active&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:T.p1,borderRadius:"0 2px 2px 0"}}/>}
              </button>
            );
          })}
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,padding:"12px 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px",marginBottom:6}}>
            <ProgressRing pct={total.pct} color={T.p1} size={32} stroke={3}/>
            {sidebarOpen&&<div><div style={{fontSize:11,fontWeight:700,color:T.p1}}>{total.pct}%</div><div style={{fontSize:9,color:T.textFade}}>{total.done}/{total.total} tasks</div></div>}
          </div>
          {sidebarOpen&&(()=>{
            const lvl=getLevel(xp);const next=getNextLevel(xp);
            const pct=next?Math.round(((xp-lvl.min)/(next.min-lvl.min))*100):100;
            return(<div style={{padding:"0 4px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:lvl.color,fontWeight:600}}>{lvl.icon} {lvl.label}</span><span style={{fontSize:9,color:T.textFade}}>{xp.toLocaleString()} XP</span></div>
              <div style={{height:3,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:lvl.color,borderRadius:3,transition:"width 0.5s"}}/></div>
              {next&&<div style={{fontSize:9,color:T.textFade,marginTop:3}}>{next.min-xp} XP to {next.label}</div>}
            </div>);
          })()}
          <div style={{padding:"0 4px"}}>
            {sidebarOpen&&<div style={{fontSize:11,color:T.textDim,marginBottom:6,display:"flex",alignItems:"center",gap:6}}><span>👤</span><span style={{fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userDoc.username}</span>{userDoc.role==="free"&&<span style={{fontSize:8,background:"#8b7cf620",color:"#8b7cf6",border:"1px solid #8b7cf633",borderRadius:3,padding:"1px 5px",flexShrink:0}}>FREE</span>}</div>}
            {userDoc.role==="free"&&sidebarOpen&&(
              <div style={{marginBottom:6,display:"flex",flexDirection:"column",gap:4}}>
                <button onClick={()=>setShowPaywall(true)} style={{fontSize:10,color:"#6dd6a0",background:"#6dd6a010",border:"1px solid #6dd6a030",borderRadius:5,cursor:"pointer",padding:"4px 8px",textAlign:"left"}}>⬆ $19/mo — Full Access</button>
                <button onClick={()=>setShowPaywall(true)} style={{fontSize:10,color:"#8b7cf6",background:"#8b7cf610",border:"1px solid #8b7cf630",borderRadius:5,cursor:"pointer",padding:"4px 8px",textAlign:"left"}}>⬆ $99 — Phase 1 Cohort</button>
              </div>
            )}
            <button onClick={()=>signOut(auth)} style={{fontSize:10,color:T.textFade,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"4px 0"}}>
              <span style={{fontSize:13}}>⎋</span>{sidebarOpen&&<span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ds-main" style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",height:"100vh",overflowY:tab==="learn"?"hidden":"auto"}}>
      <div style={{flex:1}}>
        {/* LEARN TAB */}
        {tab==="learn"&&(()=>{
          const isFree=userDoc.role==="free"; // monthly + student + cohort = full access
          const freeIds=["pycore-basics","pycore-advanced","pycore-ds-patterns","numpy","pandas-basics","pandas-advanced","eda","visualization","sql-basics","sql-joins","sql-window","probability"];
          const handleSetActiveId=(id)=>{
            const isFullAccess=userDoc.role==="student"||userDoc.role==="monthly";
            if(isFree&&!isFullAccess&&!freeIds.includes(id)){setShowPaywall(true);return;}
            setActiveLearnId(id);
            updateDoc(doc(db,"users",currentUser.uid),{lastLessonId:id}).catch(()=>{});
            addDoc(collection(db,"analytics"),{uid:currentUser.uid,lessonId:id,event:"open",timestamp:Date.now()}).catch(()=>{});
          };
          const defaultId=startLessonOverride&&(freeIds.includes(startLessonOverride)||!isFree)?startLessonOverride:"pycore-basics";
          return <LearnTab currentUser={currentUser} activeId={freeIds.includes(activeLearnId)||!isFree?activeLearnId:defaultId} setActiveId={handleSetActiveId} onLessonComplete={onLessonComplete} onBack={()=>setTab("roadmap")}/>;
        })()}

        {/* HOME */}
        {tab==="motivation"&&(
          <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}}>
            {(()=>{
              const lastId=userDoc.lastLessonId;
              const lastLesson=lastId?LESSONS.find(l=>l.id===lastId):null;
              const nextUndone=LESSONS.find(l=>!Object.values(userDoc.lessonsDone||{}).length||(userDoc.lessonsDone||{})[l.id]!==true);
              const target=lastLesson||nextUndone||LESSONS[0];
              if(!target)return null;
              return(
                <div style={{background:T.bgCard,border:`1px solid ${target.color}44`,borderRadius:14,padding:"18px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}
                  onClick={()=>{setActiveLearnId(target.id);setTab("learn");}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=target.color+"88"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=target.color+"44"}
                  style={{background:T.bgCard,border:`1px solid ${target.color}44`,borderRadius:14,padding:"18px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",cursor:"pointer",transition:"border-color 0.15s"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:target.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{target.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:9,color:target.color,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:3}}>{lastLesson?"CONTINUE WHERE YOU LEFT OFF":"START HERE"}</div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{target.title}</div>
                    <div style={{fontSize:11,color:T.textDim}}>{target.phase}</div>
                  </div>
                  <div style={{background:target.color,color:"#000",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,flexShrink:0}}>Continue →</div>
                </div>
              );
            {/* XP LEVEL CARD — TOP */}
            {(()=>{
              const lvl=getLevel(xp);const next=getNextLevel(xp);
              const pct=next?Math.round(((xp-lvl.min)/(next.min-lvl.min))*100):100;
              return(
                <div style={{background:T.bgCard,border:`1px solid ${lvl.color}44`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:28}}>{lvl.icon}</span>
                      <div>
                        <div style={{fontSize:9,color:lvl.color,letterSpacing:"0.15em",fontWeight:700}}>⚡ YOUR LEVEL</div>
                        <div style={{fontSize:18,fontWeight:700,color:lvl.color}}>{lvl.label}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:22,fontWeight:700,color:lvl.color}}>{xp.toLocaleString()}</div>
                      <div style={{fontSize:9,color:T.textFade}}>total XP</div>
                    </div>
                  </div>
                  <div style={{height:6,background:T.bgDeep,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${lvl.color}88,${lvl.color})`,borderRadius:4,transition:"width 0.6s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textFade,marginBottom:10}}>
                    <span>{lvl.label} · {(xp-lvl.min).toLocaleString()} XP earned</span>
                    {next?<span>{(next.min-xp).toLocaleString()} XP to {next.icon} {next.label}</span>:<span style={{color:lvl.color}}>Max Level! 🎉</span>}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:9,color:T.textFade,padding:"3px 9px",borderRadius:4,background:T.bgDeep,border:`1px solid ${T.border}`}}>⚡ Task = 10 XP</span>
                    <span style={{fontSize:9,color:T.textFade,padding:"3px 9px",borderRadius:4,background:T.bgDeep,border:`1px solid ${T.border}`}}>📚 Lesson = 25 XP</span>
                    <span style={{fontSize:9,color:T.textFade,padding:"3px 9px",borderRadius:4,background:T.bgDeep,border:`1px solid ${T.border}`}}>📝 Check-in = 50 XP</span>
                    <span style={{fontSize:9,color:T.textFade,padding:"3px 9px",borderRadius:4,background:T.bgDeep,border:`1px solid ${T.border}`}}>🚀 Project = 100 XP</span>
                  </div>
                </div>
              );
            })()}
            {userDoc.onboarded&&userDoc.recommendedPath&&(()=>{
              const pathInfo={
                "data-analyst":{color:"#7eb8f7",icon:"📊",label:"Data Analyst"},
                "data-scientist":{color:"#a78bfa",icon:"🧠",label:"Data Scientist"},
                "ml-engineer":{color:"#6dd6a0",icon:"⚙️",label:"ML Engineer"},
              }[userDoc.recommendedPath]||{color:"#8b7cf6",icon:"🎯",label:"Your Path"};
              return(
                <div style={{background:T.bgCard,border:`1px solid ${pathInfo.color}33`,borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <span style={{fontSize:24}}>{pathInfo.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:pathInfo.color,letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:3}}>YOUR RECOMMENDED PATH</div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>{pathInfo.label}</div>
                  </div>
                  <button onClick={()=>{setTab("progress");setProgressSubTab("paths");}} style={{background:pathInfo.color+"18",border:`1px solid ${pathInfo.color}44`,color:pathInfo.color,padding:"6px 14px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>View Path →</button>
                </div>
              );
            })()}
            })()}
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
          <div className="ds-roadmap-panel" style={{display:"flex",height:"calc(100vh - 120px)"}}>
            <div className="ds-roadmap-inner" style={{width:210,borderRight:`1px solid ${T.border}`,padding:"16px 12px",overflowY:"auto",background:T.bgDeep,flexShrink:0}}>
              {roadmap.map((ph,i)=>{const p2=getPP(ph);const a=i===activePhase;const locked=!isPhaseUnlocked(i);return(
                <button key={i} onClick={()=>{if(!locked){setActivePhase(i);setExpandedSection(null);}}} style={{width:"100%",background:a?ph.color+"15":locked?"#0f0e1a":"transparent",border:`1px solid ${a?ph.color+"55":locked?T.border:"transparent"}`,color:locked?T.textFade:a?ph.color:T.textDim,padding:"8px 12px",borderRadius:7,cursor:locked?"not-allowed":"pointer",fontSize:11,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,textAlign:"left",opacity:locked?0.5:1}}>
                  <span>{locked?"🔒 ":""}{ph.title}</span>
                  {locked?<span style={{fontSize:9,color:T.textFade}}>locked</span>:<ProgressRing pct={p2.pct} color={ph.color} size={26} stroke={3}/>}
                </button>
              );})}
              <div className="ds-roadmap-inner-sections" style={{borderTop:`1px solid ${T.border}`,marginTop:8,paddingTop:12}}>
                {phase.sections.map(s=>{const sp=getSP(s);const a=expandedSection===s.id;return(
                  <div key={s.id} onClick={()=>setExpandedSection(a?null:s.id)} style={{marginBottom:6,cursor:"pointer",padding:"7px 9px",borderRadius:6,background:a?C+"0e":"transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:sp.done===sp.total?C:T.textDim}}>{s.title}</span><span style={{fontSize:9,color:T.textFade}}>{sp.done}/{sp.total}</span></div>
                    <ProgressBar pct={sp.pct} color={C+"66"} height={2}/>
                  </div>
                );})}
              </div>
            </div>
            <div className="ds-roadmap-content" style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
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
        {tab==="projects"&&(()=>{
          const totalPortfolio=portfolioProjects.filter(p=>p.portfolioWorthy).length;
          const donePortfolio=portfolioProjects.filter(p=>p.portfolioWorthy&&completedProjects[p.id]).length;

          const markComplete=async(projId)=>{
            const already=completedProjects[projId];
            const updated={...completedProjects,[projId]:!already};
            setCompletedProjects(updated);
            await updateDoc(doc(db,"users",currentUser.uid),{completedProjects:updated});
            if(!already){
              awardXP(100);
            }else{
              const newXp=Math.max(0,xpRef.current-100);
              xpRef.current=newXp;setXp(newXp);
              await updateDoc(doc(db,"users",currentUser.uid),{xp:newXp});
            }
          };

          const phaseNames=["Foundations","Core ML","Modern Skills","Portfolio & Jobs"];

          return(
            <div className="ds-roadmap-content" style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              <style>{`
                @keyframes projUnlock{0%{transform:scale(0.92);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
                .proj-card-done{animation:projUnlock 0.4s ease forwards;}
              `}</style>

              {/* PORTFOLIO PROGRESS BANNER */}
              <div style={{background:T.bgCard,border:`1px solid ${T.gold}33`,borderRadius:14,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                <div style={{fontSize:32}}>🗂️</div>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:9,color:T.gold,letterSpacing:"0.15em",fontWeight:700,marginBottom:6}}>YOUR PORTFOLIO</div>
                  <div style={{height:8,background:T.bgDeep,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                    <div style={{height:"100%",width:`${totalPortfolio?Math.round(donePortfolio/totalPortfolio*100):0}%`,background:`linear-gradient(90deg,${T.gold}88,${T.gold})`,borderRadius:4,transition:"width 0.6s"}}/>
                  </div>
                  <div style={{fontSize:11,color:T.textDim}}><span style={{color:T.gold,fontWeight:700}}>{donePortfolio}</span> of {totalPortfolio} must-build projects completed</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:28,fontWeight:800,color:T.gold}}>{totalPortfolio?Math.round(donePortfolio/totalPortfolio*100):0}%</div>
                  <div style={{fontSize:9,color:T.textFade}}>portfolio ready</div>
                </div>
              </div>

              {[1,2,3,4].map(phaseNum=>{
                const phProjects=portfolioProjects.filter(p=>p.phase===phaseNum);
                if(phProjects.length===0)return null;
                const phColor=phaseColors[phaseNum-1];
                const phaseDone=phProjects.filter(p=>completedProjects[p.id]).length;
                return(
                  <div key={phaseNum} style={{marginBottom:32}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:phColor}}/>
                        <span style={{fontSize:14,fontWeight:700,color:phColor}}>Phase {phaseNum} — {phaseNames[phaseNum-1]}</span>
                      </div>
                      <span style={{fontSize:10,color:phColor,background:phColor+"18",padding:"2px 10px",borderRadius:100,border:`1px solid ${phColor}33`}}>{phaseDone}/{phProjects.length} done</span>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))",gap:14}}>
                      {phProjects.map(proj=>{
                        const pColor=phaseColors[proj.phase-1];
                        const isDone=!!completedProjects[proj.id];
                        const isExpanded=expandedProj===proj.id;
                        const diffColor=proj.difficulty==="Advanced"?T.warn:proj.difficulty==="Intermediate"?T.gold:T.info;

                        return(
                          <div key={proj.id}
                            className={isDone?"proj-card-done":""}
                            style={{
                              background:isDone?`linear-gradient(135deg,${pColor}12,${pColor}06)`:T.bgCard,
                              border:`1px solid ${isDone?pColor+"66":proj.portfolioWorthy?pColor+"33":T.border}`,
                              borderRadius:14,
                              overflow:"hidden",
                              display:"flex",
                              flexDirection:"column",
                              position:"relative",
                              transition:"box-shadow 0.2s,border-color 0.2s",
                              boxShadow:isDone?`0 0 20px ${pColor}18`:"none",
                            }}>

                            {/* Done glow top bar */}
                            {isDone&&<div style={{height:3,background:`linear-gradient(90deg,transparent,${pColor},transparent)`}}/>}

                            {/* HEADER */}
                            <div style={{padding:"14px 16px 12px"}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                  <span style={{fontSize:9,color:typeColors[proj.type],background:typeColors[proj.type]+"18",padding:"2px 7px",borderRadius:3}}>{typeLabels[proj.type]}</span>
                                  <span style={{fontSize:9,color:diffColor,background:diffColor+"18",padding:"2px 7px",borderRadius:3}}>{proj.difficulty}</span>
                                  {proj.portfolioWorthy&&<span style={{fontSize:9,color:T.gold,background:T.gold+"18",padding:"2px 7px",borderRadius:3,border:`1px solid ${T.gold}33`}}>★ Must-Build</span>}
                                </div>
                                {isDone&&<span style={{fontSize:16}}>✅</span>}
                              </div>

                              <div style={{fontSize:14,fontWeight:700,color:isDone?pColor:T.text,marginBottom:6}}>{proj.title}</div>
                              <div style={{fontSize:11,color:T.textDim,lineHeight:1.65,marginBottom:10}}>{proj.description}</div>

                              {proj.dataset?.url&&(
                                <a href={proj.dataset.url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:T.info,textDecoration:"none",background:T.info+"10",border:`1px solid ${T.info}22`,padding:"3px 9px",borderRadius:5}}>
                                  📈 {proj.dataset.name} →
                                </a>
                              )}
                            </div>

                            {/* SKILLS */}
                            <div style={{padding:"0 16px 10px",display:"flex",gap:5,flexWrap:"wrap"}}>
                              {proj.skills.map((sk,i)=>(
                                <span key={i} style={{fontSize:9,color:isDone?pColor:T.textFade,background:isDone?pColor+"12":T.bgDeep,border:`1px solid ${isDone?pColor+"33":T.border}`,padding:"2px 7px",borderRadius:3}}>{sk}</span>
                              ))}
                            </div>

                            {/* EXPAND TOGGLE */}
                            <button
                              onClick={()=>setExpandedProj(isExpanded?null:proj.id)}
                              style={{margin:"0 16px 12px",padding:"6px 0",background:"none",border:`1px solid ${T.borderHi}`,borderRadius:7,color:T.textFade,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                              {isExpanded?"▲ Hide steps":"▼ Show steps"}
                            </button>

                            {/* STEPS (expandable) */}
                            {isExpanded&&(
                              <div style={{padding:"0 16px 14px",borderTop:`1px solid ${T.border}`}}>
                                <div style={{fontSize:8,color:T.textFade,letterSpacing:"0.15em",margin:"12px 0 10px"}}>STEPS</div>
                                {proj.steps.map((step,i)=>(
                                  <div key={i} style={{display:"flex",gap:9,marginBottom:8}}>
                                    <span style={{fontSize:9,color:pColor,background:pColor+"18",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{i+1}</span>
                                    <span style={{fontSize:11,color:T.textDim,lineHeight:1.6}}>{step}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* MARK COMPLETE BUTTON */}
                            <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`,marginTop:"auto"}}>
                              <button
                                onClick={()=>markComplete(proj.id)}
                                style={{
                                  width:"100%",padding:"9px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                                  background:isDone?T.bgDeep:`linear-gradient(135deg,${pColor}22,${pColor}11)`,
                                  border:`1px solid ${isDone?T.border:pColor+"55"}`,
                                  color:isDone?T.textFade:pColor,
                                  transition:"all 0.2s",
                                }}>
                                {isDone?"✓ Completed — Mark Incomplete":"Mark as Complete +100 XP"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* LEADERBOARD */}
        {tab==="leaderboard"&&(
          <div style={{padding:"24px"}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:15,fontWeight:700}}>🏅 Student Leaderboard</div></div>
              {(()=>{
                const sorted=[...students].sort((a,b)=>(b.xp||0)-(a.xp||0));
                const activeStudents=sorted.filter(u=>(u.xp||0)>0);
                if(activeStudents.length<3){
                  return(
                    <div style={{padding:"40px 24px",textAlign:"center"}}>
                      <div style={{fontSize:36,marginBottom:12}}>🏆</div>
                      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:8}}>The leaderboard is just getting started.</div>
                      <div style={{fontSize:13,color:T.textDim,lineHeight:1.7,maxWidth:320,margin:"0 auto 20px"}}>Complete your first lesson to claim a top spot. Early students will be here forever.</div>
                      <div style={{display:"inline-flex",gap:8,alignItems:"center",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:100,padding:"8px 18px",fontSize:12,color:T.textDim}}>
                        <span>👥</span> {sorted.length} student{sorted.length!==1?"s":""} enrolled so far
                      </div>
                    </div>
                  );
                }
                return sorted.map((u,i)=>{
                  const prog=getTotalProgress(u.progress||{},roadmap);const isMe=u.id===currentUser.uid;
                  const medals=["🥇","🥈","🥉"];const uLvl=getLevel(u.xp||0);
                  return(
                    <div key={u.id} style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:14,background:isMe?uLvl.color+"08":"transparent"}}>
                      <div style={{width:30,fontSize:i<3?20:13,textAlign:"center"}}>{i<3?medals[i]:`#${i+1}`}</div>
                      <div style={{width:36,height:36,borderRadius:"50%",background:uLvl.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:uLvl.color}}>{u.username[0].toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:isMe?700:500,color:isMe?uLvl.color:T.text}}>{u.username}{isMe?" (you)":""}</span>
                          <span style={{fontSize:9,color:uLvl.color,background:uLvl.color+"18",padding:"1px 6px",borderRadius:3,border:`1px solid ${uLvl.color}33`}}>{uLvl.icon} {uLvl.label}</span>
                        </div>
                        <ProgressBar pct={prog.pct} color={uLvl.color}/>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:18,fontWeight:700,color:uLvl.color}}>{(u.xp||0).toLocaleString()}</div>
                        <div style={{fontSize:10,color:T.textFade}}>XP · {prog.pct}%</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* BLOG */}
        {tab==="blog"&&<StudentBlogTab/>}

        {/* AI TUTOR */}
        {tab==="tutor"&&<DSTutorTab userDoc={userDoc} activeLessonId={activeLearnId}/>}

        {/* PROGRESS HUB */}
        {tab==="progress"&&(
          <div style={{padding:"24px",maxWidth:860,margin:"0 auto",width:"100%"}}>
            <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:6}}>// progress hub</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Progress Hub</div>
            <div style={{display:"flex",gap:0,background:T.bgDeep,borderRadius:10,padding:4,marginBottom:24,flexWrap:"wrap"}}>
              {[{id:"paths",label:"🗺 Career Paths"},{id:"quiz",label:"❓ Quizzes"},{id:"certs",label:"🎓 Certificates"},{id:"checkin",label:"📝 Check-in"},{id:"refer",label:"🔗 Refer & Earn"},{id:"inbox",label:`💬 Inbox${unreadCount>0?" ("+unreadCount+")":""}`}].map(t=>(
                <button key={t.id} onClick={()=>{setProgressSubTab(t.id);if(t.id==="inbox")markMessagesRead();}} style={{padding:"8px 16px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:progressSubTab===t.id?T.bgCard:"transparent",color:progressSubTab===t.id?T.text:T.textDim,transition:"all 0.15s"}}>
                  {t.label}
                </button>
              ))}
            </div>
            {progressSubTab==="paths"&&<PathsTab roadmap={roadmap} progress={progress} onSignup={()=>{}}/>}
            {progressSubTab==="quiz"&&<QuizTab roadmap={roadmap} progress={progress} userDoc={userDoc}/>}
            {progressSubTab==="certs"&&<CertificateTab userDoc={userDoc} roadmap={roadmap} progress={progress} xp={xp}/>}
            {progressSubTab==="checkin"&&(
              <div style={{maxWidth:600}}>
                <div style={{background:T.bgCard,border:`1px solid ${thisWeekCheckin?T.good+"55":T.border}`,borderRadius:14,padding:"20px",marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.good,marginBottom:12}}>📝 Weekly Check-in</div>
                  {thisWeekCheckin?(<div><div style={{fontSize:11,color:T.good,marginBottom:8}}>✅ Done this week!</div><div style={{fontSize:10,color:T.textDim,lineHeight:1.6,fontStyle:"italic"}}>"{thisWeekCheckin.learned.slice(0,120)}{thisWeekCheckin.learned.length>120?"...":""}"</div></div>):(<div><div style={{fontSize:12,color:T.textDim,marginBottom:14,lineHeight:1.6}}>Reflect on your week. Each check-in earns <span style={{color:T.good,fontWeight:700}}>+50 XP</span>.</div><button onClick={()=>setShowCheckin(true)} style={{background:T.good+"18",border:`1px solid ${T.good}55`,color:T.good,padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>+ Check In Now</button></div>)}
                </div>
                {checkins.length>0&&(<div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}><div style={{fontSize:11,fontWeight:600,marginBottom:14}}>📋 Past Check-ins</div>{checkins.slice(0,5).map((c,i)=>(<div key={i} style={{padding:"12px",background:T.bgDeep,borderRadius:10,marginBottom:8}}><div style={{fontSize:9,color:T.textFade,marginBottom:6}}>Week {c.week} — {new Date(c.date).toLocaleDateString()}</div><div style={{fontSize:11,color:T.good,marginBottom:4}}>✅ {c.learned}</div>{c.difficult&&<div style={{fontSize:11,color:T.warn,marginBottom:4}}>⚠ {c.difficult}</div>}{c.goal&&<div style={{fontSize:11,color:T.info}}>🎯 {c.goal}</div>}</div>))}</div>)}
              </div>
            )}
            {progressSubTab==="refer"&&(
              <div style={{maxWidth:560}}>
                <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"24px",marginBottom:16}}>
                  <div style={{fontSize:9,color:T.p1,letterSpacing:"0.15em",fontFamily:"monospace",marginBottom:8}}>// refer & earn</div>
                  <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Get 1 month free for every friend you refer</div>
                  <div style={{fontSize:13,color:T.textDim,lineHeight:1.7,marginBottom:20}}>Share your personal link. When a friend signs up and upgrades, you both get 1 month of full access free.</div>
                  <div style={{background:T.bgDeep,border:`1px solid ${T.borderHi}`,borderRadius:10,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{flex:1,fontSize:13,fontFamily:"monospace",color:T.p1,wordBreak:"break-all"}}>zerotods.com?ref={userDoc.referralCode||currentUser.uid.slice(0,6).toUpperCase()}</div>
                    <button onClick={()=>{
                      navigator.clipboard.writeText(`https://zerotods.com?ref=${userDoc.referralCode||currentUser.uid.slice(0,6).toUpperCase()}`);
                      alert("Referral link copied!");
                    }} style={{background:T.p1,color:"#fff",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>Copy Link</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div style={{background:T.bgDeep,borderRadius:10,padding:"16px",textAlign:"center"}}>
                      <div style={{fontSize:28,fontWeight:800,color:T.p1}}>{userDoc.referralCount||0}</div>
                      <div style={{fontSize:11,color:T.textDim,marginTop:4}}>friends referred</div>
                    </div>
                    <div style={{background:T.bgDeep,borderRadius:10,padding:"16px",textAlign:"center"}}>
                      <div style={{fontSize:28,fontWeight:800,color:T.good}}>{userDoc.referralCount>0?`${userDoc.referralCount} mo`:"0 mo"}</div>
                      <div style={{fontSize:11,color:T.textDim,marginTop:4}}>free months earned</div>
                    </div>
                  </div>
                </div>
                <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 20px"}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:12,color:T.text}}>How it works</div>
                  {[["Share your link","Send it to anyone learning data science or switching careers"],["They sign up","They use your link — no code needed, the link tracks it automatically"],["They upgrade","When they pay for any plan, you both get 1 month free added instantly"]].map(([title,desc],i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:T.p1+"22",color:T.p1,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                      <div><div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:T.textDim,lineHeight:1.5}}>{desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {progressSubTab==="inbox"&&(
              <div style={{maxWidth:600}}>
                <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
                  <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:14,fontWeight:700}}>💬 Messages from your Instructor</div></div>
                  {messages.length===0&&<div style={{padding:"24px",color:T.textFade,fontSize:12}}>No messages yet.</div>}
                  {messages.map(m=>{const isUnread=!readMsgIds.has(m.id);return(<div key={m.id} style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,background:isUnread?T.p4+"08":"transparent"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}><div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:10,color:T.p4,background:T.p4+"15",padding:"2px 8px",borderRadius:4}}>{m.to==="all"?"📢 To everyone":"📨 To you"}</span>{isUnread&&<span style={{fontSize:9,color:T.p4,background:T.p4+"25",padding:"1px 6px",borderRadius:4,fontWeight:700}}>NEW</span>}</div><span style={{fontSize:10,color:T.textFade}}>{new Date(m.time).toLocaleString()}</span></div><div style={{fontSize:12,color:T.text,lineHeight:1.7}}>{m.text}</div></div>);})}
                </div>
              </div>
            )}
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

      {/* MOBILE BOTTOM NAV */}
      <div className="ds-bottom-nav">
        {tabs.map(t=>{
          const active=tab===t.id;
          const badge=t.id==="messages"&&unreadCount>0?unreadCount:0;
          const isLearn=t.id==="learn";
          return(
            <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="messages")markMessagesRead();}}
              className={isLearn?"nav-learn":""}
              style={{color:isLearn?"#fff":active?T.p1:T.textFade}}>
              <span className="nav-icon">{t.icon}</span>
              {!isLearn&&<span className="nav-label">{t.label.replace(/\s*\(.*\)/,"")}</span>}
              {badge>0&&<span style={{position:"absolute",top:4,background:T.warn,color:"#fff",borderRadius:10,fontSize:8,padding:"1px 4px",fontWeight:700}}>{badge}</span>}
            </button>
          );
        })}
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
          // Retry once after delay — handles signup race condition where Firestore doc isn't written yet
          setTimeout(async()=>{
            const snap2=await getDoc(doc(db,"users",user.uid));
            if(snap2.exists()){
              const data2=snap2.data();
              if(data2.disabled){await signOut(auth);setAuthUser(null);setUserDoc(null);}
              else setUserDoc(data2);
            }else{
              // Only fallback to admin if truly no doc exists after retry
              setUserDoc({role:"admin",username:"Admin",email:user.email});
            }
            setLoading(false);
          },1500);
          return;
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
          <div style={{fontWeight:800,fontSize:18,color:"#e8e4ff"}}>ZeroToDS</div>
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
          <div style={{fontWeight:800,fontSize:18,color:"#e8e4ff"}}>ZeroToDS</div>
        </div>
        <div style={{width:28,height:28,border:"2px solid #1e1c35",borderTop:"2px solid #8b7cf6",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
      </div>
    </div>
  );
  if(userDoc?.role==="admin"||authUser.email===ADMIN_EMAIL)return <AdminDashboard currentUser={authUser}/>;
  return <StudentDashboard currentUser={authUser} userDoc={userDoc}/>;
}
