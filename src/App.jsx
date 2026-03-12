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

// ── LANDING PAGE (shown to logged-out visitors)
function LoginPage(){
  const [showLogin,setShowLogin]=useState(false);
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

  const inp={background:"#0f0e1a",border:"1px solid #2a2845",borderRadius:8,padding:"10px 14px",color:"#e8e4ff",fontSize:13,width:"100%",outline:"none",boxSizing:"border-box"};

  const phases=[
    {num:"01",icon:"🐍",title:"Python & Data Tools",desc:"NumPy, Pandas, SQL, Statistics, EDA",color:"#7eb8f7",time:"Months 1–2"},
    {num:"02",icon:"🤖",title:"Machine Learning",desc:"Linear models, Random Forests, sklearn",color:"#a78bfa",time:"Months 2–4"},
    {num:"03",icon:"📊",title:"Advanced ML",desc:"XGBoost, feature engineering, SHAP",color:"#6dd6a0",time:"Months 3–7"},
    {num:"04",icon:"🧠",title:"Deep Learning & LLMs",desc:"Neural nets, NLP, transformers, RAG",color:"#f7c96e",time:"Months 7–12"},
    {num:"05",icon:"🚀",title:"Portfolio & Jobs",desc:"Projects, interview prep, networking",color:"#c792ea",time:"Months 12–18"},
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

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",background:"rgba(11,10,18,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1c35"}}>
        <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,background:"#8b7cf6",borderRadius:"50%",boxShadow:"0 0 10px #8b7cf6"}}/>
          DS Academy
        </div>
        <button onClick={()=>setShowLogin(true)} style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"9px 20px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600}}>
          Student Login →
        </button>
      </nav>

      {/* LOGIN MODAL */}
      {showLogin&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(6px)"}}>
          <div style={{background:"#11101c",border:"1px solid #2a2845",borderRadius:16,padding:"36px",width:340,maxWidth:"90vw",position:"relative"}}>
            <button onClick={()=>setShowLogin(false)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#4a4665",cursor:"pointer",fontSize:18}}>✕</button>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:26,marginBottom:8}}>🎓</div>
              <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>Welcome back</div>
              <div style={{fontSize:12,color:"#7b78a0"}}>Sign in to your DS Academy account</div>
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
            <div style={{marginTop:14,fontSize:11,color:"#3a3860",textAlign:"center"}}>Contact your instructor to get credentials.</div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 20px 80px",position:"relative",overflow:"hidden"}}>
        {/* grid bg */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#1e1c35 1px, transparent 1px),linear-gradient(90deg, #1e1c35 1px, transparent 1px)",backgroundSize:"50px 50px",WebkitMaskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",maskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",opacity:0.4}}/>
        {/* glow */}
        <div style={{position:"absolute",width:500,height:500,background:"rgba(139,124,246,0.1)",borderRadius:"50%",filter:"blur(80px)",top:-100,left:-100,zIndex:0}}/>
        <div style={{position:"absolute",width:400,height:400,background:"rgba(110,231,183,0.06)",borderRadius:"50%",filter:"blur(80px)",bottom:-50,right:-50,zIndex:0}}/>

        <div style={{position:"relative",zIndex:1,maxWidth:720}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#17162a",border:"1px solid #2a2845",borderRadius:100,padding:"5px 14px",fontSize:11,color:"#8b7cf6",letterSpacing:"0.08em",marginBottom:28,fontFamily:"monospace"}}>
            <div style={{width:5,height:5,background:"#6ee7b7",borderRadius:"50%",boxShadow:"0 0 6px #6ee7b7"}}/>
            STRUCTURED · PRACTICAL · JOB-FOCUSED
          </div>

          <h1 style={{fontWeight:800,fontSize:"clamp(36px, 7vw, 68px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:20}}>
            From Zero<br/>
            <span style={{background:"linear-gradient(135deg, #8b7cf6, #f472b6, #6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              to Data Scientist
            </span>
          </h1>

          <p style={{fontSize:16,color:"#7b78a0",maxWidth:500,margin:"0 auto 12px",lineHeight:1.7}}>
            A structured, hands-on platform that takes you from <strong style={{color:"#e8e4ff"}}>complete beginner</strong> to job-ready — starting with Python from scratch. No prior coding experience needed.
          </p>
          <p style={{fontSize:13,color:"#3a3860",maxWidth:480,margin:"0 auto 36px",fontFamily:"monospace"}}>
            → Data Scientist &nbsp;·&nbsp; Data Analyst &nbsp;·&nbsp; ML Engineer &nbsp;·&nbsp; Python Developer
          </p>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:56}}>
            <a href="#apply" style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"13px 28px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>
              Apply for Access →
            </a>
            <a href="#curriculum" style={{background:"transparent",color:"#7b78a0",border:"1px solid #2a2845",padding:"13px 24px",borderRadius:8,cursor:"pointer",fontSize:14,textDecoration:"none"}}>
              See the curriculum
            </a>
          </div>

          {/* Stats */}
          <div style={{display:"flex",justifyContent:"center",gap:0,border:"1px solid #1e1c35",borderRadius:12,overflow:"hidden",background:"#11101c",flexWrap:"wrap"}}>
            {[{n:"18+",l:"Lessons"},{n:"5",l:"Phases"},{n:"11",l:"Projects"},{n:"0 → Job",l:"The Goal"}].map((s,i)=>(
              <div key={i} style={{padding:"16px 28px",textAlign:"center",borderRight:"1px solid #1e1c35",flex:"1 1 80px"}}>
                <div style={{fontWeight:800,fontSize:22,letterSpacing:"-0.02em",color:"#e8e4ff"}}>{s.n}</div>
                <div style={{fontSize:10,color:"#3a3860",letterSpacing:"0.08em",marginTop:2,fontFamily:"monospace"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CURRICULUM */}
      <div id="curriculum" style={{padding:"80px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// curriculum</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>A clear path. No guessing.</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:44,maxWidth:480}}>Every phase builds on the last. No tutorial hell — just a structured sequence designed around what employers hire for.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:2,border:"1px solid #1e1c35",borderRadius:12,overflow:"hidden"}}>
            {phases.map(p=>(
              <div key={p.num} style={{background:"#11101c",padding:"22px 18px",transition:"background 0.2s"}}>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#3a3860",marginBottom:12,letterSpacing:"0.08em"}}>{p.num}</div>
                <div style={{fontSize:22,marginBottom:10}}>{p.icon}</div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:"#e8e4ff"}}>{p.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.5,marginBottom:12}}>{p.desc}</div>
                <span style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:100,background:p.color+"18",color:p.color}}>{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JOBS */}
      <div style={{padding:"80px 20px",background:"#0d0c18"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// career outcomes</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>What jobs can you land?</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:44,maxWidth:520}}>The curriculum is designed around real job requirements. Here's what graduates are prepared to apply for:</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16}}>
            {[
              {icon:"📊",title:"Data Analyst",skills:["SQL","Python","Pandas","Visualization","Statistics"],color:"#7eb8f7",desc:"Turn raw data into business insights. Most in-demand DS role in the market."},
              {icon:"🤖",title:"Data Scientist",skills:["ML","sklearn","Statistics","Python","Communication"],color:"#8b7cf6",desc:"Build predictive models and drive data-informed decisions across the company."},
              {icon:"⚙️",title:"ML Engineer",skills:["sklearn","Pipelines","Docker","APIs","Python"],color:"#6dd6a0",desc:"Deploy and maintain ML models in production. Bridge between DS and engineering."},
              {icon:"🐍",title:"Python Developer (Data)",skills:["Python","Pandas","APIs","Automation","SQL"],color:"#f7c96e",desc:"Automate data workflows, build internal tools, and work with data pipelines."},
            ].map((job,i)=>(
              <div key={i} style={{background:"#0b0a12",border:"1px solid #1e1c35",borderRadius:12,padding:"22px",transition:"all 0.2s"}}>
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

      {/* FEATURES */}
      <div style={{padding:"80px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// platform</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>Built differently.</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:44,maxWidth:480}}>No passive videos. No disconnected tutorials. Everything is connected, tracked, and designed to get you hired.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16}}>
            {features.map((f,i)=>(
              <div key={i} style={{background:"#0b0a12",border:"1px solid #1e1c35",borderRadius:12,padding:"22px",transition:"all 0.2s"}}>
                <div style={{fontSize:22,marginBottom:12}}>{f.icon}</div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT YOU'LL BUILD */}
      <div style={{padding:"80px 20px",background:"#0b0a12"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:12}}>// projects</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px, 4vw, 38px)",letterSpacing:"-0.02em",marginBottom:12}}>What you'll actually build.</h2>
          <p style={{color:"#7b78a0",fontSize:15,marginBottom:44,maxWidth:520}}>Not toy exercises. Real projects you can show in interviews and deploy live. Every project has a business context, real data, and a deployed demo.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16}}>
            {[
              {
                icon:"📉",title:"Customer Churn Predictor",
                desc:"Predict which customers will leave before they do. Calculate the dollar value of retention. Deploy as a live Streamlit app.",
                stack:["Python","XGBoost","Streamlit","Pandas"],
                color:"#7eb8f7",
                outcome:"Live demo URL you can share in interviews"
              },
              {
                icon:"🔍",title:"Fraud Detection Model",
                desc:"Handle 99.8% class imbalance on real credit card data. Optimize for recall. Build a pipeline that works in production.",
                stack:["sklearn","SMOTE","Random Forest","Pipelines"],
                color:"#f472b6",
                outcome:"Kaggle dataset, real business framing"
              },
              {
                icon:"📊",title:"Full A/B Test Analysis",
                desc:"Go beyond the p-value. Calculate confidence intervals, practical significance, and write a recommendation memo to a PM.",
                stack:["Python","NumPy","Statistics","scipy"],
                color:"#6dd6a0",
                outcome:"Business memo + technical notebook"
              },
              {
                icon:"🗄️",title:"Business KPI Dashboard in SQL",
                desc:"Answer 10 real business questions using CTEs, window functions, and joins on a real music store database.",
                stack:["SQL","CTEs","Window Functions","Chinook DB"],
                color:"#f7c96e",
                outcome:"Portfolio-ready SQL showcase"
              },
              {
                icon:"🤖",title:"RAG-Powered Document Q&A",
                desc:"Build a system that lets users ask questions about any document. Uses embeddings, vector search, and an LLM API.",
                stack:["LangChain","FAISS","OpenAI API","Streamlit"],
                color:"#a78bfa",
                outcome:"Deployed on Hugging Face Spaces"
              },
              {
                icon:"🧠",title:"Fine-tuned BERT Classifier",
                desc:"Fine-tune a pretrained BERT model on real domain text. Wrap in FastAPI and deploy to Hugging Face Spaces.",
                stack:["Hugging Face","BERT","FastAPI","NLP"],
                color:"#34d399",
                outcome:"Live API endpoint + model card"
              },
            ].map((p,i)=>(
              <div key={i} style={{background:"#11101c",border:"1px solid #1e1c35",borderRadius:12,padding:"22px",position:"relative",overflow:"hidden",transition:"all 0.2s"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:p.color+"66"}}/>
                <div style={{fontSize:28,marginBottom:12}}>{p.icon}</div>
                <div style={{fontWeight:700,fontSize:15,color:"#e8e4ff",marginBottom:6}}>{p.title}</div>
                <div style={{fontSize:12,color:"#7b78a0",lineHeight:1.6,marginBottom:14}}>{p.desc}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                  {p.stack.map(s=>(
                    <span key={s} style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:100,background:p.color+"15",color:p.color}}>{s}</span>
                  ))}
                </div>
                <div style={{fontSize:11,color:"#3a3860",fontFamily:"monospace",borderTop:"1px solid #1e1c35",paddingTop:10}}>
                  ✓ {p.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div style={{padding:"60px 20px",background:"#0d0c18"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",alignItems:"center",gap:28,flexWrap:"wrap",justifyContent:"center"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#8b7cf6,#f472b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>
            👨‍💻
          </div>
          <div style={{flex:1,minWidth:220}}>
            <div style={{fontWeight:700,fontSize:16,color:"#e8e4ff",marginBottom:6}}>Built by Radwan</div>
            <div style={{fontSize:13,color:"#7b78a0",lineHeight:1.7,marginBottom:12}}>
              A researcher transitioning into data science — I built DS Academy because I couldn't find a structured, practical path that actually prepares you for the job market. Everything in this curriculum is what I wish I had from day one.
            </div>
            <a href="https://wa.me/96181590474" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none"}}>
              <span>💬</span> WhatsApp me with any questions
            </a>
          </div>
        </div>
      </div>

      {/* APPLY */}
      <div id="apply" style={{padding:"80px 20px",background:"#0b0a12",textAlign:"center"}}>
        <div style={{maxWidth:500,margin:"0 auto",background:"#11101c",border:"1px solid #2a2845",borderRadius:18,padding:"52px 36px",position:"relative"}}>
          <div style={{position:"absolute",top:-1,left:"20%",right:"20%",height:2,background:"linear-gradient(90deg, transparent, #8b7cf6, #f472b6, transparent)"}}/>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#8b7cf6",letterSpacing:"0.15em",marginBottom:16}}>// apply for access</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px, 4vw, 34px)",letterSpacing:"-0.02em",marginBottom:12}}>Ready to start?</h2>
          <p style={{color:"#7b78a0",fontSize:14,marginBottom:32,lineHeight:1.7}}>DS Academy runs in small cohorts. Drop your info and we'll reach out with next steps within 48 hours.</p>
          <div id="lp-form"><div style={{display:"flex",flexDirection:"column",gap:12,textAlign:"left"}}>
            <input id="lp-name" style={inp} placeholder="Your name"/>
            <input id="lp-email" style={{...inp,marginBottom:0}} type="email" placeholder="Your email"/>
            <select id="lp-bg" style={{...inp,color:"#7b78a0",cursor:"pointer",appearance:"none"}}>
              <option value="" disabled selected>Your background</option>
              <option>Complete beginner — no coding experience</option>
              <option>Some Python, want to learn DS</option>
              <option>University student / fresh graduate</option>
              <option>Career switcher from another field</option>
            </select>
            <button
              onClick={async()=>{
                const n=document.getElementById("lp-name").value.trim();
                const e=document.getElementById("lp-email").value.trim();
                const b=document.getElementById("lp-bg").value;
                if(!n||!e||!b){alert("Please fill in all fields.");return;}
                try{
                  await fetch("https://formspree.io/f/xreykgey",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({name:n,email:e,background:b})
                  });
                }catch(err){console.log("Form error",err);}
                document.getElementById("lp-form").style.display="none";
                document.getElementById("lp-success").style.display="block";
              }}
              style={{background:"#8b7cf6",color:"#fff",border:"none",padding:"13px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,marginTop:4}}
            >
              Apply for Access →
            </button>
            <div style={{fontSize:11,color:"#3a3860",textAlign:"center",fontFamily:"monospace"}}>No payment required yet.</div>
          </div>
          </div><div id="lp-success" style={{display:"none",background:"rgba(110,231,183,0.08)",border:"1px solid rgba(110,231,183,0.2)",borderRadius:10,padding:"20px",color:"#6ee7b7",fontSize:13,lineHeight:1.7,marginTop:16}}>
            ✅ Application received! We'll reach out within 48 hours.
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{padding:"24px 32px",borderTop:"1px solid #1e1c35",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontWeight:800,fontSize:14,color:"#3a3860"}}>DS Academy</div>
        <div style={{fontFamily:"monospace",fontSize:11,color:"#3a3860"}}>Zero → Competitive Candidate</div>
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
