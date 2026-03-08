import { useState, useRef } from "react";

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const FIRM_NAME = "S N Jain & Associates";
const FIRM_ADDRESS = "Nandurbar, Maharashtra";
const FIRM_PHONE = "+91 98765 43210";

const SERVICES = [
  { id:"itr",   label:"Income Tax / ITR",  icon:"📄", color:"#3b82f6", desc:"ITR filing, tax planning, salary/business income" },
  { id:"gst",   label:"GST",               icon:"🧾", color:"#8b5cf6", desc:"GST registration, monthly returns, compliance" },
  { id:"audit", label:"Audit",             icon:"🔍", color:"#f59e0b", desc:"Statutory audit, tax audit, internal audit" },
  { id:"sip",   label:"SIP / Investment",  icon:"📈", color:"#10b981", desc:"Mutual funds, SIP planning, wealth management" },
  { id:"other", label:"Other Services",    icon:"⚖️", color:"#ec4899", desc:"Company registration, TDS, notices, other work" },
];

const STAFF = ["Rahul Sharma","Priya Patil","Amit Joshi","Sneha More"];

const ADMIN_USERS = [
  { username:"admin",  password:"admin123", name:"S N Jain",     role:"admin" },
  { username:"rahul",  password:"staff123", name:"Rahul Sharma", role:"staff" },
  { username:"priya",  password:"staff123", name:"Priya Patil",  role:"staff" },
  { username:"amit",   password:"staff123", name:"Amit Joshi",   role:"staff" },
];

const INIT_CLIENTS = [
  { id:"C001", name:"Ramesh Agarwal",     pan:"ABCPA1234D", phone:"9876543210", email:"ramesh@email.com",
    service:"itr", status:"pending", payment:"paid", password:"ram123",
    assignedTo:"Rahul Sharma", date:"2025-03-01", notes:"Salary income only",
    clientDocs:[{id:"d1",name:"PAN Card.pdf",size:"245 KB",date:"2025-03-02"},{id:"d2",name:"Form 16.pdf",size:"1.1 MB",date:"2025-03-03"}],
    firmDocs:[{id:"f1",name:"ITR Acknowledgement.pdf",size:"380 KB",date:"2025-03-10"}] },
  { id:"C002", name:"Sunita Enterprises", pan:"BCDES5678F", phone:"9812345678", email:"sunita@biz.com",
    service:"gst", status:"new", payment:"unpaid", password:"sun456",
    assignedTo:"", date:"2025-03-05", notes:"Monthly GST filer",
    clientDocs:[], firmDocs:[] },
  { id:"C003", name:"Mahesh Patel",        pan:"CDEFM9012G", phone:"9900112233", email:"mahesh@email.com",
    service:"audit", status:"completed", payment:"paid", password:"mah789",
    assignedTo:"Priya Patil", date:"2025-02-20", notes:"",
    clientDocs:[{id:"d3",name:"Balance Sheet.xlsx",size:"890 KB",date:"2025-02-22"}],
    firmDocs:[{id:"f2",name:"Audit Report Final.pdf",size:"1.8 MB",date:"2025-02-28"}] },
];

const INIT_QUERIES = [
  { id:"Q001", name:"Lata Devi",    phone:"9988776655", service:"sip",   message:"SIP mein invest karna hai", date:"2025-03-08", seen:false },
  { id:"Q002", name:"Vijay Shah",   phone:"9001122334", service:"itr",   message:"2 saal ka ITR pending hai",  date:"2025-03-07", seen:true  },
];

// ═══════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════
const T = {
  bg:"#050b14", card:"#0c1422", card2:"#111d2e", border:"#1a2d45",
  gold:"#c9a84c", goldD:"#a07830", text:"#e8eef8", muted:"#566a85",
  green:"#22c55e", red:"#ef4444", blue:"#3b82f6", amber:"#f59e0b",
};

const STATUS_MAP = {
  new:       { label:"New Query",   c:"#a78bfa", bg:"rgba(167,139,250,0.1)" },
  pending:   { label:"Pending",     c:T.amber,   bg:"rgba(245,158,11,0.1)"  },
  progress:  { label:"In Progress", c:T.blue,    bg:"rgba(59,130,246,0.1)"  },
  completed: { label:"Completed",   c:T.green,   bg:"rgba(34,197,94,0.1)"   },
  hold:      { label:"On Hold",     c:T.red,     bg:"rgba(239,68,68,0.1)"   },
};
const PAY_MAP = {
  paid:    { label:"Paid",    c:T.green, bg:"rgba(34,197,94,0.1)"   },
  unpaid:  { label:"Unpaid",  c:T.red,   bg:"rgba(239,68,68,0.1)"   },
  partial: { label:"Partial", c:T.amber, bg:"rgba(245,158,11,0.1)"  },
};

// ═══════════════════════════════════════════
//  SHARED UI COMPONENTS
// ═══════════════════════════════════════════
const inp = {
  width:"100%", padding:"10px 13px", background:"#08101c",
  border:`1.5px solid ${T.border}`, borderRadius:9, color:T.text,
  fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:11, fontWeight:700, color:T.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>}
      {children}
    </div>
  );
}

function Tag({ map, val }) {
  const m = map[val] || { label:val, c:T.muted, bg:"rgba(86,106,133,0.1)" };
  return <span style={{ background:m.bg, color:m.c, border:`1px solid ${m.c}33`, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700 }}>{m.label}</span>;
}

function Card({ children, style }) {
  return <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, ...style }}>{children}</div>;
}

function Popup({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:12 }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, width:"100%", maxWidth:wide?780:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 40px 100px #000" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontWeight:800, fontSize:16, color:T.text }}>{title}</div>
          <button onClick={onClose} style={{ background:T.border, border:"none", borderRadius:7, width:28, height:28, color:T.muted, cursor:"pointer", fontSize:16 }}>×</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

function GoldBtn({ children, onClick, small, outline, full, danger }) {
  const bg = danger ? T.red : outline ? "transparent" : `linear-gradient(135deg,${T.gold},${T.goldD})`;
  const clr = outline ? T.gold : danger ? "#fff" : "#0a0500";
  const brd = outline ? `1.5px solid ${T.gold}` : danger ? "none" : "none";
  return (
    <button onClick={onClick} style={{ background:bg, color:clr, border:brd, padding:small?"6px 14px":"10px 20px", borderRadius:9, fontWeight:700, fontSize:small?12:13, cursor:"pointer", fontFamily:"inherit", width:full?"100%":"auto" }}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════
//  PUBLIC PAGE — Query Rise
// ═══════════════════════════════════════════
function PublicPage({ onNewQuery, onLoginClick }) {
  const [step, setStep] = useState("services"); // services | form | done
  const [chosen, setChosen] = useState(null);
  const [form, setForm] = useState({ name:"", phone:"", message:"" });
  const [err, setErr] = useState("");

  function submit() {
    if (!form.name.trim()) return setErr("Naam likhna zaroori hai.");
    if (form.phone.length < 10) return setErr("Sahi phone number dalein (10 digit).");
    setErr("");
    onNewQuery({ ...form, service: chosen.id, id:"Q"+Date.now(), date: new Date().toISOString().slice(0,10), seen: false });
    setStep("done");
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Georgia',serif", color:T.text }}>
      {/* Top bar */}
      <div style={{ background:T.card, borderBottom:`1px solid ${T.border}`, padding:"13px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <span style={{ color:T.gold, fontSize:19, fontWeight:700 }}>⚖ {FIRM_NAME}</span>
          <span style={{ color:T.muted, fontSize:11, marginLeft:10, fontFamily:"sans-serif" }}>{FIRM_ADDRESS}</span>
        </div>
        <GoldBtn small outline onClick={onLoginClick}>Staff / Client Login →</GoldBtn>
      </div>

      {/* Hero banner */}
      <div style={{ background:"linear-gradient(160deg,#0c1a2e 0%,#050b14 60%)", padding:"44px 20px 32px", textAlign:"center", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:11, color:T.gold, letterSpacing:3, fontFamily:"sans-serif", marginBottom:10, textTransform:"uppercase" }}>Aapka Bharosa, Hamari Zimmedari</div>
        <h1 style={{ fontSize:"clamp(20px,3.5vw,36px)", fontWeight:700, margin:"0 0 10px", lineHeight:1.3 }}>
          Tax, GST, Audit & Investment<br/><span style={{ color:T.gold }}>Sab Ek Jagah</span>
        </h1>
        <p style={{ color:T.muted, fontSize:14, maxWidth:460, margin:"0 auto", fontFamily:"sans-serif", lineHeight:1.7 }}>
          Apni query abhi bhejein — hum 24 ghante mein contact karenge. Bilkul free consultation.
        </p>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 16px 48px" }}>

        {/* STEP — Choose Service */}
        {step === "services" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ fontSize:17, fontWeight:700, color:T.text }}>Aapko kya chahiye?</div>
              <div style={{ color:T.muted, fontSize:13, marginTop:4, fontFamily:"sans-serif" }}>Service chunein, phir apna naam aur number bhejein</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:11 }}>
              {SERVICES.map(s => (
                <div key={s.id} onClick={() => { setChosen(s); setStep("form"); }}
                  style={{ background:T.card, border:`1.5px solid ${T.border}`, borderRadius:14, padding:"20px 14px", cursor:"pointer", textAlign:"center" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=s.color; e.currentTarget.style.background=T.card2; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.card; }}>
                  <div style={{ fontSize:30, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:T.text, marginBottom:5 }}>{s.label}</div>
                  <div style={{ color:T.muted, fontSize:12, lineHeight:1.5, fontFamily:"sans-serif" }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center", marginTop:24, padding:"14px", background:T.card, border:`1px solid ${T.border}`, borderRadius:12 }}>
              <span style={{ color:T.muted, fontSize:13, fontFamily:"sans-serif" }}>📞 Direct call karein: </span>
              <span style={{ color:T.gold, fontWeight:700, fontSize:14 }}>{FIRM_PHONE}</span>
            </div>
          </div>
        )}

        {/* STEP — Fill Form */}
        {step === "form" && (
          <div style={{ maxWidth:440, margin:"0 auto" }}>
            <button onClick={() => setStep("services")} style={{ background:"transparent", border:"none", color:T.muted, cursor:"pointer", marginBottom:14, fontSize:13, fontFamily:"sans-serif" }}>← Wapas</button>
            <Card style={{ padding:24 }}>
              {/* Service badge */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:46, height:46, borderRadius:12, background:`${chosen.color}18`, border:`1px solid ${chosen.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{chosen.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:T.gold, fontSize:15 }}>{chosen.label}</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:"sans-serif" }}>Apni details bharein</div>
                </div>
              </div>
              <Field label="Aapka Naam *">
                <input style={inp} placeholder="Poora naam" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
              </Field>
              <Field label="Phone Number *">
                <input style={inp} placeholder="10 digit mobile number" value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))} maxLength={10} />
              </Field>
              <Field label="Kuch aur batana chahte ho? (Optional)">
                <textarea style={{ ...inp, height:72, resize:"none" }} placeholder="Jaise: 2 saal ka ITR pending hai, business income hai..." value={form.message} onChange={e => setForm(f => ({...f, message:e.target.value}))} />
              </Field>
              {err && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"8px 12px", color:"#f87171", fontSize:12, marginBottom:12, fontFamily:"sans-serif" }}>⚠ {err}</div>}
              <GoldBtn full onClick={submit}>Query Bhejein →</GoldBtn>
            </Card>
          </div>
        )}

        {/* STEP — Done */}
        {step === "done" && (
          <div style={{ maxWidth:420, margin:"0 auto", textAlign:"center" }}>
            <Card style={{ padding:32 }}>
              <div style={{ fontSize:50, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:20, fontWeight:700, color:T.green, marginBottom:8 }}>Query Bhej Di Gayi!</div>
              <div style={{ color:T.muted, fontSize:14, lineHeight:1.7, fontFamily:"sans-serif", marginBottom:20 }}>
                <strong style={{ color:T.text }}>{form.name}</strong> ji, aapki <strong style={{ color:T.gold }}>{chosen?.label}</strong> query humein mil gayi.<br/>
                Hum <strong style={{ color:T.text }}>24 ghante</strong> mein <strong style={{ color:T.text }}>{form.phone}</strong> pe contact karenge.
              </div>
              <div style={{ background:`rgba(201,168,76,0.07)`, border:`1px solid ${T.gold}33`, borderRadius:10, padding:"12px 14px", marginBottom:20, fontFamily:"sans-serif", textAlign:"left" }}>
                <div style={{ color:T.muted, fontSize:11, marginBottom:4 }}>Kya aap pehle se client hain?</div>
                <div style={{ color:T.text, fontSize:13 }}>PAN number aur password se login karein aur documents upload karein.</div>
              </div>
              <GoldBtn full onClick={onLoginClick}>Client Login Karein →</GoldBtn>
              <button onClick={() => { setStep("services"); setForm({name:"",phone:"",message:""}); }} style={{ background:"transparent", border:"none", color:T.muted, cursor:"pointer", marginTop:12, fontSize:13, fontFamily:"sans-serif", display:"block", width:"100%" }}>Nai Query Bhejein</button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════
function LoginPage({ onAdminLogin, onClientLogin, onBack, clients }) {
  const [tab, setTab] = useState("staff");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function doLogin() {
    setErr("");
    if (tab === "staff") {
      const found = ADMIN_USERS.find(u => u.username === user.toLowerCase() && u.password === pass);
      if (found) return onAdminLogin(found);
      setErr("Galat username ya password. Try: admin / admin123");
    } else {
      const c = clients.find(c => (c.pan.toUpperCase() === user.toUpperCase() || c.phone === user) && c.password === pass);
      if (c) return onClientLogin(c);
      setErr("PAN/Phone ya password galat hai.");
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"Georgia,serif", color:T.text, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${T.gold},${T.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:24 }}>⚖</div>
          <div style={{ color:T.gold, fontSize:20, fontWeight:700 }}>{FIRM_NAME}</div>
          <div style={{ color:T.muted, fontSize:11, fontFamily:"sans-serif", marginTop:2 }}>Secure Login</div>
        </div>
        <Card style={{ padding:0, overflow:"hidden" }}>
          {/* Tab bar */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:"#080f1a" }}>
            {[["staff","🏢 Staff Login"],["client","👤 Client Portal"]].map(([t,l]) => (
              <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{ padding:"13px 0", background:tab===t?T.card:"transparent", border:"none", borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent", color:tab===t?T.gold:T.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
            ))}
          </div>
          <div style={{ padding:22 }}>
            <Field label={tab==="staff" ? "Username" : "PAN Number ya Phone"}>
              <input style={inp} value={user} onChange={e => setUser(e.target.value)} placeholder={tab==="staff" ? "admin" : "ABCPA1234D ya 9876543210"} />
            </Field>
            <Field label="Password">
              <input type="password" style={inp} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && doLogin()} placeholder="••••••••" />
            </Field>
            {err && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"8px 12px", color:"#f87171", fontSize:12, marginBottom:12, fontFamily:"sans-serif" }}>⚠ {err}</div>}
            <GoldBtn full onClick={doLogin}>Login Karein →</GoldBtn>
            <div style={{ marginTop:12, background:`rgba(201,168,76,0.05)`, border:`1px solid ${T.gold}22`, borderRadius:8, padding:"10px 12px", fontFamily:"sans-serif" }}>
              <div style={{ color:T.muted, fontSize:11, marginBottom:3 }}>Demo login:</div>
              <div style={{ color:T.text, fontSize:12 }}>Staff → admin / admin123</div>
              <div style={{ color:T.text, fontSize:12 }}>Client → ABCPA1234D / ram123</div>
            </div>
          </div>
        </Card>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:T.muted, cursor:"pointer", marginTop:14, fontSize:13, fontFamily:"sans-serif", display:"block", margin:"14px auto 0" }}>← Wapas Main Page</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  CLIENT PORTAL
// ═══════════════════════════════════════════
function ClientPortal({ client, allClients, setClients, onLogout }) {
  const live = allClients.find(c => c.id === client.id) || client;
  const [tab, setTab] = useState("home");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const svc = SERVICES.find(s => s.id === live.service);

  function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowed = ["pdf","xlsx","xls","doc","docx","jpg","jpeg","png"];
    const invalid = files.filter(f => !allowed.includes(f.name.split(".").pop().toLowerCase()));
    if (invalid.length) return alert("Sirf PDF, Excel, Word ya Image files allowed hain.");
    setUploading(true);
    setTimeout(() => {
      const newDocs = files.map((f, i) => ({
        id:"cd"+Date.now()+i, name:f.name,
        size:(f.size/1024 > 1024 ? (f.size/1048576).toFixed(1)+" MB" : (f.size/1024).toFixed(0)+" KB"),
        date:new Date().toISOString().slice(0,10),
      }));
      setClients(cs => cs.map(c => c.id===live.id ? {...c, clientDocs:[...c.clientDocs, ...newDocs]} : c));
      setUploaded(newDocs.length);
      setUploading(false);
    }, 1200);
  }

  const canDownload = live.payment === "paid";

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"Georgia,serif", color:T.text }}>
      {/* Header */}
      <div style={{ background:T.card, borderBottom:`1px solid ${T.border}`, padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ color:T.gold, fontSize:17, fontWeight:700 }}>⚖ {FIRM_NAME}</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{live.name}</div>
            <div style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>{live.id} · {live.pan}</div>
          </div>
          <GoldBtn small outline onClick={onLogout}>Logout</GoldBtn>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"22px 14px" }}>
        {/* Status card */}
        <Card style={{ padding:"16px 20px", marginBottom:16, borderLeft:`4px solid ${svc?.color || T.gold}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif", marginBottom:3 }}>Aapki Service</div>
              <div style={{ fontSize:18, fontWeight:700 }}>{svc?.icon} {svc?.label}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <Tag map={STATUS_MAP} val={live.status} />
              <Tag map={PAY_MAP} val={live.payment} />
              {live.assignedTo && (
                <span style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.2)", padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700 }}>
                  👤 {live.assignedTo.split(" ")[0]}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Payment warning */}
        {!canDownload && (
          <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:12, padding:"12px 16px", marginBottom:16, fontFamily:"sans-serif" }}>
            <span style={{ color:T.amber, fontWeight:700 }}>⚠ Payment Pending: </span>
            <span style={{ color:T.muted, fontSize:13 }}>Payment ke baad hi processed documents download honge. Contact: </span>
            <span style={{ color:T.gold, fontWeight:700 }}>{FIRM_PHONE}</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:3, marginBottom:16, background:T.card, borderRadius:11, padding:4, border:`1px solid ${T.border}` }}>
          {[["home","🏠 Home"],["upload","📤 Documents Upload"],["download","📥 Download"]].map(([t,l]) => (
            <button key={t} onClick={() => { setTab(t); setUploaded(null); }} style={{ flex:1, padding:"9px 4px", background:tab===t?`rgba(201,168,76,0.1)`:"transparent", border:tab===t?`1px solid ${T.gold}33`:"1px solid transparent", borderRadius:9, color:tab===t?T.gold:T.muted, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>{l}</button>
          ))}
        </div>

        {/* HOME */}
        {tab === "home" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:14 }}>
              {[["🪪 PAN",live.pan],["📞 Phone",live.phone],["📧 Email",live.email||"—"],["💰 Fees","₹"+(live.fees||"—")],["👤 Assigned To",live.assignedTo||"Assign ho raha hai"],["📅 Date",live.date]].map(([k,v]) => (
                <Card key={k} style={{ padding:"11px 13px" }}>
                  <div style={{ fontSize:10, color:T.muted, fontFamily:"sans-serif", marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                </Card>
              ))}
            </div>
            {live.notes && (
              <Card style={{ padding:"12px 14px", background:"rgba(201,168,76,0.04)", borderColor:`${T.gold}22` }}>
                <div style={{ fontSize:10, color:T.muted, fontFamily:"sans-serif", marginBottom:3 }}>📝 HAMARE TEAM KA NOTE</div>
                <div style={{ fontSize:13, fontFamily:"sans-serif" }}>{live.notes}</div>
              </Card>
            )}
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:10 }}>📋 Humari Services</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:9 }}>
                {SERVICES.map(s => (
                  <Card key={s.id} style={{ padding:"12px 14px", borderTop:`3px solid ${s.color}` }}>
                    <div style={{ fontSize:18, marginBottom:5 }}>{s.icon}</div>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{s.label}</div>
                    <div style={{ color:T.muted, fontSize:11, fontFamily:"sans-serif", lineHeight:1.5 }}>{s.desc}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {tab === "upload" && (
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📤 Apne Documents Upload Karein</div>
            <div style={{ color:T.muted, fontSize:12, fontFamily:"sans-serif", marginBottom:16 }}>Bank statement, PAN card, Form 16, Balance sheet — koi bhi document yahan upload karein</div>

            <label style={{ display:"block", border:`2px dashed ${T.border}`, borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.gold}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <input type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png" onChange={handleUpload} style={{ display:"none" }} />
              {uploading ? (
                <div style={{ color:T.amber, fontWeight:700, fontFamily:"sans-serif" }}>⏳ Upload ho raha hai...</div>
              ) : (
                <>
                  <div style={{ fontSize:36, marginBottom:8 }}>📂</div>
                  <div style={{ color:T.gold, fontWeight:700, fontSize:14 }}>Files Chunein ya Yahan Drop Karein</div>
                  <div style={{ color:T.muted, fontSize:12, marginTop:4, fontFamily:"sans-serif" }}>Allowed: PDF, Excel (.xlsx), Word (.docx), Images</div>
                </>
              )}
            </label>

            {uploaded && (
              <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:9, padding:"10px 14px", marginTop:12, color:T.green, fontWeight:700, fontFamily:"sans-serif", fontSize:13 }}>
                ✅ {uploaded} file(s) successfully upload ho gayi!
              </div>
            )}

            {live.clientDocs.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:8, fontFamily:"sans-serif" }}>AAPKE UPLOADED DOCUMENTS ({live.clientDocs.length})</div>
                {live.clientDocs.map(doc => (
                  <div key={doc.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:T.card2, borderRadius:8, marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <span style={{ fontSize:18 }}>{doc.name.endsWith(".pdf")?"📄":doc.name.match(/xlsx?/)?"📊":"📁"}</span>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{doc.name}</div>
                        <div style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>{doc.size} · {doc.date}</div>
                      </div>
                    </div>
                    <span style={{ background:"rgba(34,197,94,0.1)", color:T.green, padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>✓ Done</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* DOWNLOAD */}
        {tab === "download" && (
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📥 Processed Documents</div>
            <div style={{ color:T.muted, fontSize:12, fontFamily:"sans-serif", marginBottom:16 }}>Hamare taraf se ready ki gayi files — payment ke baad download karein</div>

            {!canDownload && (
              <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"14px 16px", textAlign:"center", marginBottom:16 }}>
                <div style={{ fontSize:24, marginBottom:6 }}>🔒</div>
                <div style={{ color:"#f87171", fontWeight:700, marginBottom:4 }}>Payment Pending</div>
                <div style={{ color:T.muted, fontSize:13, fontFamily:"sans-serif" }}>Payment complete hone ke baad yahan se ITR aur documents download kar sakenge.</div>
                <div style={{ color:T.gold, fontWeight:700, marginTop:8 }}>📞 {FIRM_PHONE}</div>
              </div>
            )}

            {live.firmDocs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:T.muted, fontFamily:"sans-serif", fontSize:13 }}>
                Abhi koi processed document ready nahi hai.<br/>Hum aapko inform karenge jab ready hoga.
              </div>
            ) : (
              live.firmDocs.map(doc => (
                <div key={doc.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:T.card2, borderRadius:10, marginBottom:8, border:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>📄</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{doc.name}</div>
                      <div style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>Ready: {doc.date} · {doc.size}</div>
                    </div>
                  </div>
                  {canDownload ? (
                    <GoldBtn small onClick={() => alert(`"${doc.name}" download shuru ho gayi!\n\n(Real app mein actual file download hogi)`)}>⬇ Download</GoldBtn>
                  ) : (
                    <span style={{ background:"rgba(239,68,68,0.08)", color:"#f87171", border:"1px solid rgba(239,68,68,0.2)", padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:700 }}>🔒 Locked</span>
                  )}
                </div>
              ))
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  ADMIN / STAFF PANEL
// ═══════════════════════════════════════════
function AdminPanel({ user, clients, setClients, queries, setQueries, onLogout }) {
  const [view, setView] = useState("queries");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [nextId, setNextId] = useState(200);
  const isAdmin = user.role === "admin";

  const unseen = queries.filter(q => !q.seen).length;

  // Filter clients
  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.pan.toLowerCase().includes(q) || c.phone.includes(q);
  }).filter(c => !isAdmin ? c.assignedTo === user.name : true);

  function markQuerySeen(id) {
    setQueries(qs => qs.map(q => q.id===id ? {...q, seen:true} : q));
  }

  function convertToClient(query) {
    const newClient = {
      id:"C"+String(nextId).padStart(3,"0"),
      name:query.name, phone:query.phone, pan:"", email:"",
      service:query.service, status:"new", payment:"unpaid",
      password:query.phone.slice(-4),
      assignedTo:"", date:query.date, notes:query.message,
      clientDocs:[], firmDocs:[],
    };
    setClients(cs => [...cs, newClient]);
    setNextId(n => n+1);
    setQueries(qs => qs.filter(q => q.id !== query.id));
    setModal({ type:"client_added", client:newClient });
  }

  function saveClient(data) {
    if (modal?.existing) {
      setClients(cs => cs.map(c => c.id===modal.existing.id ? {...c, ...data} : c));
    } else {
      const id = "C"+String(nextId).padStart(3,"0");
      setClients(cs => [...cs, { id, ...data, clientDocs:[], firmDocs:[], password:data.phone.slice(-4) }]);
      setNextId(n => n+1);
    }
    setModal(null);
  }

  function uploadFirmDoc(clientId, e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newDocs = files.map((f,i) => ({
      id:"fd"+Date.now()+i, name:f.name,
      size:(f.size/1024 > 1024 ? (f.size/1048576).toFixed(1)+" MB" : (f.size/1024).toFixed(0)+" KB"),
      date:new Date().toISOString().slice(0,10),
    }));
    setClients(cs => cs.map(c => c.id===clientId ? {...c, firmDocs:[...c.firmDocs, ...newDocs]} : c));
  }

  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        let data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) data = [data];
        const imported = data.map((row, i) => ({
          id:"IMP"+Date.now()+i,
          name:row.name||row.Name||row.CLIENT||"",
          phone:row.phone||row.Phone||row.MOBILE||"",
          pan:row.pan||row.PAN||row.Pan||"",
          email:row.email||row.Email||"",
          service:row.service||"itr",
          status:"new", payment:"unpaid",
          password:(row.phone||"0000").slice(-4),
          assignedTo:"", date:new Date().toISOString().slice(0,10),
          notes:row.notes||row.Notes||"",
          clientDocs:[], firmDocs:[],
        })).filter(r => r.name);
        setClients(cs => [...cs, ...imported]);
        setModal({ type:"import_done", count:imported.length });
      } catch {
        alert("JSON file sahi format mein nahi hai.");
      }
    };
    reader.readAsText(file);
  }

  function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.trim().split("\n").filter(Boolean);
      if (lines.length < 2) return alert("CSV file mein data nahi hai.");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g,""));
      const imported = lines.slice(1).map((line, i) => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g,""));
        const row = {};
        headers.forEach((h, idx) => row[h] = vals[idx] || "");
        return {
          id:"IMP"+Date.now()+i,
          name:row.name||row.clientname||row.client||"",
          phone:row.phone||row.mobile||"",
          pan:row.pan||row.pannumber||"",
          email:row.email||"",
          service:row.service||row.querytype||"itr",
          status:"new", payment:"unpaid",
          password:(row.phone||"0000").slice(-4),
          assignedTo:row.assignedto||"",
          date:new Date().toISOString().slice(0,10),
          notes:row.notes||"",
          clientDocs:[], firmDocs:[],
        };
      }).filter(r => r.name);
      setClients(cs => [...cs, ...imported]);
      setModal({ type:"import_done", count:imported.length });
    };
    reader.readAsText(file);
  }

  const NAV = [
    { id:"queries",  label:"Queries", icon:"🔔", badge:unseen },
    { id:"clients",  label:"Clients", icon:"👥" },
    { id:"staff",    label:"Staff",   icon:"🧑‍💼" },
    { id:"import",   label:"Import",  icon:"⬆" },
  ];

  const th = { textAlign:"left", fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.6, padding:"9px 12px", borderBottom:`1px solid ${T.border}` };
  const td = { padding:"11px 12px", borderBottom:`1px solid ${T.card2}`, fontSize:13, color:"#c8d5e5" };

  // ── Queries View ──
  const QueriesView = () => (
    <div>
      <h2 style={{ margin:"0 0 5px", fontSize:20, fontWeight:800, color:T.text }}>🔔 Incoming Queries</h2>
      <p style={{ color:T.muted, margin:"0 0 18px", fontSize:13, fontFamily:"sans-serif" }}>Clients ki nayi inquiries yahan dikhti hain</p>
      {queries.length === 0 ? (
        <Card style={{ padding:"40px 20px", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
          <div style={{ color:T.muted, fontFamily:"sans-serif" }}>Abhi koi nayi query nahi hai</div>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {queries.map(q => {
            const svc = SERVICES.find(s => s.id===q.service);
            return (
              <Card key={q.id} style={{ padding:"14px 18px", borderLeft:`4px solid ${q.seen ? T.border : svc?.color || T.gold}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      {!q.seen && <span style={{ background:"rgba(239,68,68,0.15)", color:T.red, border:`1px solid ${T.red}44`, padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700 }}>NEW</span>}
                      <span style={{ fontSize:15, fontWeight:700, color:T.text }}>{q.name}</span>
                      <span style={{ color:T.muted, fontSize:13, fontFamily:"sans-serif" }}>· {q.phone}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ background:`${svc?.color||T.gold}18`, color:svc?.color||T.gold, border:`1px solid ${svc?.color||T.gold}33`, padding:"2px 9px", borderRadius:6, fontSize:11, fontWeight:700 }}>{svc?.icon} {svc?.label}</span>
                      <span style={{ color:T.muted, fontSize:12, fontFamily:"sans-serif" }}>{q.date}</span>
                    </div>
                    {q.message && <div style={{ color:T.muted, fontSize:12, marginTop:6, fontFamily:"sans-serif", fontStyle:"italic" }}>"{q.message}"</div>}
                  </div>
                  <div style={{ display:"flex", gap:7 }}>
                    {!q.seen && <GoldBtn small onClick={() => markQuerySeen(q.id)}>✓ Dekha</GoldBtn>}
                    <GoldBtn small onClick={() => convertToClient(q)}>Client Banao →</GoldBtn>
                    <GoldBtn small outline onClick={() => setQueries(qs => qs.filter(x => x.id!==q.id))}>🗑</GoldBtn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Clients View ──
  const ClientsView = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <h2 style={{ margin:"0 0 3px", fontSize:20, fontWeight:800, color:T.text }}>👥 Clients ({filteredClients.length})</h2>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {isAdmin && <GoldBtn small onClick={() => setModal({ type:"add_client" })}>+ New Client</GoldBtn>}
        </div>
      </div>
      <div style={{ marginBottom:13 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Name, PAN, phone se search karein..." style={{ ...inp, maxWidth:320 }} />
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["Client","Service","Staff","Status","Payment","Docs","Action"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredClients.map(c => (
              <tr key={c.id} style={{ cursor:"pointer" }} onClick={() => setModal({ type:"view_client", client:c })}>
                <td style={td}>
                  <div style={{ fontWeight:700, color:T.text }}>{c.name}</div>
                  <div style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>{c.pan || c.id} · {c.phone}</div>
                </td>
                <td style={td}><span style={{ fontSize:12 }}>{SERVICES.find(s=>s.id===c.service)?.icon} {SERVICES.find(s=>s.id===c.service)?.label}</span></td>
                <td style={td}>{c.assignedTo ? <span style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>{c.assignedTo.split(" ")[0]}</span> : <span style={{ color:T.red, fontSize:11 }}>—</span>}</td>
                <td style={td}><Tag map={STATUS_MAP} val={c.status}/></td>
                <td style={td}><Tag map={PAY_MAP} val={c.payment}/></td>
                <td style={td}>
                  <span style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>
                    📁 {c.clientDocs.length + c.firmDocs.length}
                  </span>
                </td>
                <td style={td} onClick={e => e.stopPropagation()}>
                  <div style={{ display:"flex", gap:5 }}>
                    <GoldBtn small onClick={() => setModal({ type:"edit_client", existing:c })}>✏</GoldBtn>
                    {isAdmin && <GoldBtn small danger onClick={() => setClients(cs => cs.filter(x => x.id!==c.id))}>🗑</GoldBtn>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && <div style={{ textAlign:"center", padding:"32px", color:T.muted, fontFamily:"sans-serif" }}>Koi client nahi mila</div>}
      </Card>
    </div>
  );

  // ── Staff View ──
  const StaffView = () => (
    <div>
      <h2 style={{ margin:"0 0 18px", fontSize:20, fontWeight:800, color:T.text }}>🧑‍💼 Staff Work Board</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
        {STAFF.map(s => {
          const tasks = clients.filter(c => c.assignedTo===s && c.status!=="completed");
          const done  = clients.filter(c => c.assignedTo===s && c.status==="completed").length;
          return (
            <Card key={s} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#0d1f3a,#1a3460)", padding:"13px 15px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:99, background:`linear-gradient(135deg,${T.gold},${T.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0500", fontWeight:900, fontSize:15 }}>{s[0]}</div>
                <div>
                  <div style={{ color:T.text, fontWeight:700, fontSize:13 }}>{s}</div>
                  <div style={{ color:T.muted, fontSize:11, fontFamily:"sans-serif" }}>{tasks.length} pending · {done} done</div>
                </div>
              </div>
              <div style={{ padding:10 }}>
                {tasks.length === 0
                  ? <div style={{ textAlign:"center", color:T.green, padding:"12px 0", fontFamily:"sans-serif", fontSize:12 }}>✓ Sab kaam done!</div>
                  : tasks.map(t => (
                      <div key={t.id} onClick={() => setModal({type:"view_client", client:t})} style={{ background:T.card2, borderRadius:8, padding:"9px 10px", marginBottom:5, borderLeft:`3px solid ${STATUS_MAP[t.status]?.c||T.gold}`, cursor:"pointer" }}>
                        <div style={{ fontWeight:600, fontSize:12, color:T.text, marginBottom:2 }}>{t.name}</div>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>{SERVICES.find(s=>s.id===t.service)?.icon} {SERVICES.find(s=>s.id===t.service)?.label}</span>
                          <Tag map={STATUS_MAP} val={t.status}/>
                        </div>
                      </div>
                    ))
                }
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ── Import View ──
  const ImportView = () => {
    const csvRef = useRef();
    const jsonRef = useRef();
    const sample = `name,phone,pan,service,notes
Suresh Gupta,9876500001,AGRRG1234X,itr,Salary income
Geeta Traders,9876500002,GTRS5678Y,gst,Monthly filer`;
    return (
      <div>
        <h2 style={{ margin:"0 0 5px", fontSize:20, fontWeight:800, color:T.text }}>⬆ Client Import</h2>
        <p style={{ color:T.muted, margin:"0 0 20px", fontSize:13, fontFamily:"sans-serif" }}>Vyapar, Computax, Excel ya JSON se clients import karein</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <Card style={{ padding:18 }}>
            <div style={{ fontWeight:700, color:T.gold, marginBottom:4 }}>📊 CSV / Excel Import</div>
            <div style={{ color:T.muted, fontSize:12, fontFamily:"sans-serif", marginBottom:12, lineHeight:1.5 }}>Vyapar ya Computax se CSV export karo, yahan upload karo</div>
            <input ref={csvRef} type="file" accept=".csv,.txt" onChange={importCSV} style={{ display:"none" }} />
            <GoldBtn full onClick={() => csvRef.current.click()}>📂 CSV File Upload</GoldBtn>
          </Card>
          <Card style={{ padding:18 }}>
            <div style={{ fontWeight:700, color:"#60a5fa", marginBottom:4 }}>🔗 JSON Import</div>
            <div style={{ color:T.muted, fontSize:12, fontFamily:"sans-serif", marginBottom:12, lineHeight:1.5 }}>JSON format mein bulk clients add karein</div>
            <input ref={jsonRef} type="file" accept=".json" onChange={importJSON} style={{ display:"none" }} />
            <GoldBtn full outline onClick={() => jsonRef.current.click()}>📂 JSON File Upload</GoldBtn>
          </Card>
        </div>
        <Card style={{ padding:18 }}>
          <div style={{ fontWeight:700, color:T.text, marginBottom:10 }}>📋 CSV Format Example (Vyapar/Computax export format)</div>
          <pre style={{ background:"#08101c", border:`1px solid ${T.border}`, borderRadius:9, padding:"12px 14px", fontSize:12, color:"#60a5fa", overflowX:"auto", fontFamily:"monospace", lineHeight:1.6 }}>{sample}</pre>
          <div style={{ marginTop:10, color:T.muted, fontSize:12, fontFamily:"sans-serif" }}>
            💡 <strong style={{ color:T.text }}>Tip:</strong> Computax → Reports → Client Master → Export CSV · Vyapar → Reports → Export
          </div>
        </Card>
        <Card style={{ padding:14, marginTop:12, background:"rgba(201,168,76,0.04)", borderColor:`${T.gold}22` }}>
          <div style={{ color:T.gold, fontWeight:700, marginBottom:6 }}>🔗 Software Integration Status</div>
          {[["Computax","CSV export se auto import ✅"],["Vyapar","CSV/Excel export se import ✅"],["Winman","PDF/Excel export → upload ✅"],["Razorpay","Payment link integration possible ✅ (developer needed)"]].map(([s,v]) => (
            <div key={s} style={{ display:"flex", gap:10, marginBottom:5, fontFamily:"sans-serif", fontSize:13 }}>
              <span style={{ color:T.muted, minWidth:90 }}>{s}</span>
              <span style={{ color:T.text }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  // ── View Client Modal ──
  const ViewClientModal = ({ c }) => {
    const live = clients.find(x => x.id===c.id) || c;
    const fRef = useRef();
    return (
      <div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
          <Tag map={STATUS_MAP} val={live.status}/>
          <Tag map={PAY_MAP} val={live.payment}/>
          <span style={{ background:"rgba(201,168,76,0.08)", color:T.gold, border:`1px solid ${T.gold}33`, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700 }}>
            {SERVICES.find(s=>s.id===live.service)?.icon} {SERVICES.find(s=>s.id===live.service)?.label}
          </span>
        </div>

        {/* Info grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          {[["PAN",live.pan||"—"],["Phone",live.phone],["Email",live.email||"—"],["Fees","₹"+(live.fees||"—")],["Assigned",live.assignedTo||"Unassigned"],["Login Password",live.password]].map(([k,v]) => (
            <div key={k} style={{ background:T.card2, borderRadius:8, padding:"8px 11px" }}>
              <div style={{ fontSize:10, color:T.muted, fontFamily:"sans-serif", marginBottom:1 }}>{k}</div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Quick status update */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, marginBottom:7, fontFamily:"sans-serif" }}>🔄 STATUS UPDATE KAREIN</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.entries(STATUS_MAP).map(([k,v]) => (
              <button key={k} onClick={() => setClients(cs => cs.map(c => c.id===live.id ? {...c, status:k} : c))}
                style={{ padding:"4px 10px", borderRadius:7, border:live.status===k?`2px solid ${v.c}`:`1px solid ${T.border}`, background:live.status===k?v.bg:"transparent", color:v.c, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment update */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, marginBottom:7, fontFamily:"sans-serif" }}>💰 PAYMENT STATUS (ye change karne ke baad client download kar sakta hai)</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.entries(PAY_MAP).map(([k,v]) => (
              <button key={k} onClick={() => setClients(cs => cs.map(c => c.id===live.id ? {...c, payment:k} : c))}
                style={{ padding:"4px 10px", borderRadius:7, border:live.payment===k?`2px solid ${v.c}`:`1px solid ${T.border}`, background:live.payment===k?v.bg:"transparent", color:v.c, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assign staff */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, marginBottom:7, fontFamily:"sans-serif" }}>👤 STAFF ASSIGN KAREIN</div>
          <select value={live.assignedTo} onChange={e => setClients(cs => cs.map(c => c.id===live.id ? {...c, assignedTo:e.target.value} : c))}
            style={{ ...inp, width:"auto", minWidth:200 }}>
            <option value="">-- Unassigned --</option>
            {STAFF.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Client docs */}
        {live.clientDocs.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.muted, marginBottom:6, fontFamily:"sans-serif" }}>📁 CLIENT KE DOCUMENTS ({live.clientDocs.length})</div>
            {live.clientDocs.map(doc => (
              <div key={doc.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 10px", background:T.card2, borderRadius:7, marginBottom:4 }}>
                <span style={{ fontSize:12 }}>📄 {doc.name}</span>
                <span style={{ fontSize:11, color:T.muted, fontFamily:"sans-serif" }}>{doc.size} · {doc.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload processed doc */}
        <div style={{ background:`rgba(201,168,76,0.04)`, border:`1px solid ${T.gold}22`, borderRadius:11, padding:13 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.gold, marginBottom:7, fontFamily:"sans-serif" }}>
            📤 PROCESSED FILE UPLOAD KAREIN (Client yahan se download karega — payment ke baad)
          </div>
          {live.firmDocs.map(doc => (
            <div key={doc.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 10px", background:T.card2, borderRadius:7, marginBottom:4 }}>
              <span style={{ fontSize:12 }}>📄 {doc.name}</span>
              <span style={{ fontSize:11, color:T.green, fontFamily:"sans-serif" }}>✓ Uploaded · {doc.date}</span>
            </div>
          ))}
          <input ref={fRef} type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={e => uploadFirmDoc(live.id, e)} style={{ display:"none" }} />
          <label onClick={() => fRef.current.click()} style={{ display:"block", border:`1.5px dashed ${T.border}`, borderRadius:8, padding:"10px", textAlign:"center", cursor:"pointer", marginTop:8 }}>
            <span style={{ color:T.gold, fontSize:13, fontWeight:700 }}>+ ITR / File Upload Karein → Client Ko Milegi</span>
          </label>
        </div>

        {live.notes && <div style={{ marginTop:12, background:`rgba(201,168,76,0.04)`, border:`1px solid ${T.gold}22`, borderRadius:9, padding:"10px 12px", color:T.muted, fontSize:12, fontFamily:"sans-serif" }}>📝 {live.notes}</div>}
      </div>
    );
  };

  // ── Client Form Modal ──
  const ClientFormModal = ({ existing }) => {
    const blank = { name:"", phone:"", pan:"", email:"", service:"itr", status:"new", payment:"unpaid", assignedTo:"", fees:"", notes:"" };
    const [f, setF] = useState(existing ? { name:existing.name, phone:existing.phone, pan:existing.pan, email:existing.email||"", service:existing.service, status:existing.status, payment:existing.payment, assignedTo:existing.assignedTo, fees:existing.fees||"", notes:existing.notes } : blank);
    const s = (k,v) => setF(x => ({...x, [k]:v}));
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="Client Name *"><input style={inp} value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Poora naam"/></Field>
          <Field label="Phone *"><input style={inp} value={f.phone} onChange={e=>s("phone",e.target.value)} maxLength={10}/></Field>
          <Field label="PAN Number"><input style={inp} value={f.pan} onChange={e=>s("pan",e.target.value.toUpperCase())} placeholder="ABCDE1234F"/></Field>
          <Field label="Email"><input style={inp} value={f.email} onChange={e=>s("email",e.target.value)}/></Field>
          <Field label="Service">
            <select style={inp} value={f.service} onChange={e=>s("service",e.target.value)}>
              {SERVICES.map(sv => <option key={sv.id} value={sv.id}>{sv.icon} {sv.label}</option>)}
            </select>
          </Field>
          <Field label="Assign To">
            <select style={inp} value={f.assignedTo} onChange={e=>s("assignedTo",e.target.value)}>
              <option value="">-- Unassigned --</option>
              {STAFF.map(st => <option key={st}>{st}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select style={inp} value={f.status} onChange={e=>s("status",e.target.value)}>
              {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Payment">
            <select style={inp} value={f.payment} onChange={e=>s("payment",e.target.value)}>
              {Object.entries(PAY_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Fees (₹)"><input style={inp} type="number" value={f.fees} onChange={e=>s("fees",e.target.value)}/></Field>
        </div>
        <Field label="Notes"><textarea style={{ ...inp, height:60, resize:"none" }} value={f.notes} onChange={e=>s("notes",e.target.value)} placeholder="Koi bhi note..."/></Field>
        <GoldBtn full onClick={() => saveClient(f)}>💾 Save Karein</GoldBtn>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"Georgia,serif", color:T.text, display:"flex" }}>
      {/* Sidebar */}
      <div style={{ width:195, background:T.card, borderRight:`1px solid ${T.border}`, minHeight:"100vh", position:"fixed", top:0, left:0, zIndex:10, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 14px 13px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ color:T.gold, fontSize:14, fontWeight:700, lineHeight:1.3 }}>⚖ {FIRM_NAME}</div>
          <div style={{ color:T.muted, fontSize:10, fontFamily:"sans-serif", marginTop:2 }}>{isAdmin ? "Admin Panel" : "Staff Panel"}</div>
        </div>
        <nav style={{ padding:"8px 0", flex:1 }}>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setView(n.id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 13px", margin:"1px 7px", borderRadius:8, cursor:"pointer", background:view===n.id?"rgba(201,168,76,0.1)":"transparent", borderLeft:view===n.id?`2px solid ${T.gold}`:"2px solid transparent" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, color:view===n.id?T.gold:T.muted, fontWeight:view===n.id?700:400, fontSize:13 }}>
                <span>{n.icon}</span>{n.label}
              </div>
              {n.badge > 0 && <span style={{ background:T.red, color:"#fff", borderRadius:99, fontSize:10, fontWeight:700, padding:"1px 7px" }}>{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding:"0 7px 14px" }}>
          <div style={{ background:`rgba(201,168,76,0.05)`, border:`1px solid ${T.gold}22`, borderRadius:9, padding:"9px 11px", marginBottom:7 }}>
            <div style={{ color:T.muted, fontSize:9, fontFamily:"sans-serif", fontWeight:700 }}>LOGGED IN</div>
            <div style={{ color:T.text, fontSize:12, fontWeight:700, marginTop:1 }}>{user.name}</div>
            <div style={{ color:T.muted, fontSize:10, fontFamily:"sans-serif" }}>{user.role}</div>
          </div>
          <GoldBtn full small outline onClick={onLogout}>Logout</GoldBtn>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft:195, padding:"26px 24px", flex:1 }}>
        {view === "queries"  && <QueriesView/>}
        {view === "clients"  && <ClientsView/>}
        {view === "staff"    && <StaffView/>}
        {view === "import"   && <ImportView/>}
      </div>

      {/* Modals */}
      {modal?.type === "view_client"  && <Popup title={modal.client.name} onClose={() => setModal(null)} wide><ViewClientModal c={modal.client}/></Popup>}
      {modal?.type === "add_client"   && <Popup title="➕ New Client Add Karein" onClose={() => setModal(null)}><ClientFormModal/></Popup>}
      {modal?.type === "edit_client"  && <Popup title="✏ Client Edit Karein" onClose={() => setModal(null)}><ClientFormModal existing={modal.existing}/></Popup>}
      {modal?.type === "client_added" && (
        <Popup title="✅ Client Folder Bana Diya!" onClose={() => setModal(null)}>
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>📁</div>
            <div style={{ fontWeight:700, fontSize:16, color:T.green, marginBottom:8 }}>{modal.client.name} ka folder ready hai!</div>
            <div style={{ color:T.muted, fontSize:13, fontFamily:"sans-serif", marginBottom:16, lineHeight:1.6 }}>
              Client login kar sakta hai:<br/>
              <strong style={{ color:T.text }}>PAN ya Phone</strong> + Password: <strong style={{ color:T.gold }}>{modal.client.password}</strong>
            </div>
            <GoldBtn onClick={() => { setModal(null); setView("clients"); }}>Clients Dekhein →</GoldBtn>
          </div>
        </Popup>
      )}
      {modal?.type === "import_done" && (
        <Popup title="✅ Import Successful!" onClose={() => setModal(null)}>
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:10 }}>🎉</div>
            <div style={{ color:T.green, fontSize:20, fontWeight:700 }}>{modal.count} Clients Import Ho Gaye!</div>
            <div style={{ color:T.muted, fontSize:13, fontFamily:"sans-serif", marginTop:8, marginBottom:20 }}>Saare clients Clients tab mein dikh rahe hain</div>
            <GoldBtn onClick={() => { setModal(null); setView("clients"); }}>Clients Dekhein →</GoldBtn>
          </div>
        </Popup>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("public");
  const [authUser, setAuthUser] = useState(null);
  const [clients, setClients] = useState(INIT_CLIENTS);
  const [queries, setQueries] = useState(INIT_QUERIES);

  function handleNewQuery(q) {
    setQueries(qs => [q, ...qs]);
  }

  function handleAdminLogin(u) {
    setAuthUser(u);
    setScreen("admin");
  }

  function handleClientLogin(c) {
    setAuthUser(c);
    setScreen("client");
  }

  function handleLogout() {
    setAuthUser(null);
    setScreen("public");
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap" rel="stylesheet"/>
      {screen === "public" && (
        <PublicPage
          onNewQuery={handleNewQuery}
          onLoginClick={() => setScreen("login")}
        />
      )}
      {screen === "login" && (
        <LoginPage
          clients={clients}
          onAdminLogin={handleAdminLogin}
          onClientLogin={handleClientLogin}
          onBack={() => setScreen("public")}
        />
      )}
      {screen === "admin" && authUser && (
        <AdminPanel
          user={authUser}
          clients={clients}
          setClients={setClients}
          queries={queries}
          setQueries={setQueries}
          onLogout={handleLogout}
        />
      )}
      {screen === "client" && authUser && (
        <ClientPortal
          client={authUser}
          allClients={clients}
          setClients={setClients}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
