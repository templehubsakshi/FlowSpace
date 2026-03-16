import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateWorkspace, deleteWorkspace } from '../redux/slices/workspaceSlice';
import toast from 'react-hot-toast';
import { X, Trash2, Download, AlertTriangle, CheckCircle2, Save, ChevronRight, FileJson, FileText, Settings } from 'lucide-react';
import { useThemeColors } from '../hooks/useTheme';

const WS_COLORS = [
  { from:'#6366f1',to:'#4f46e5',label:'Indigo'  },
  { from:'#8b5cf6',to:'#7c3aed',label:'Violet'  },
  { from:'#ec4899',to:'#db2777',label:'Pink'    },
  { from:'#14b8a6',to:'#0d9488',label:'Teal'    },
  { from:'#f59e0b',to:'#d97706',label:'Amber'   },
  { from:'#3b82f6',to:'#2563eb',label:'Blue'    },
  { from:'#10b981',to:'#059669',label:'Emerald' },
  { from:'#ef4444',to:'#dc2626',label:'Red'     },
];
const TABS = [
  { key:'general', label:'General',     icon:Settings },
  { key:'export',  label:'Export',      icon:Download },
  { key:'danger',  label:'Danger Zone', icon:Trash2   },
];

function WorkspacePreview({ name, color }) {
  const letter = name?.trim() ? name.trim()[0].toUpperCase() : '?';
  return (
    <div style={{ width:42,height:42,borderRadius:11,flexShrink:0,background:color?.from?`linear-gradient(135deg,${color.from},${color.to})`:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff',boxShadow:`0 4px 18px ${color?.from??'#6366f1'}55`,transition:'all .25s cubic-bezier(.34,1.56,.64,1)',letterSpacing:'-.5px' }}>
      {letter}
    </div>
  );
}

export default function WorkspaceSettingsModal({ onClose }) {
  const T = useThemeColors();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentWorkspace, workspaces } = useSelector(s => s.workspace);
  const { user } = useSelector(s => s.auth);

  const myMember = currentWorkspace?.members?.find(m => (m.user?._id??m.user)===(user?._id??user?.id));
  const isOwner  = currentWorkspace?.owner?._id===(user?._id??user?.id) || currentWorkspace?.owner===(user?._id??user?.id);
  const isAdmin  = isOwner || myMember?.role==='admin';

  const [activeTab,    setActiveTab]    = useState('general');
  const [name,         setName]         = useState(currentWorkspace?.name??'');
  const [description,  setDescription]  = useState(currentWorkspace?.description??'');
  const [color,        setColor]        = useState(WS_COLORS[0]);
  const [nameError,    setNameError]    = useState('');
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [deleteStep,   setDeleteStep]   = useState(0);
  const [deleteInput,  setDeleteInput]  = useState('');
  const [visible,      setVisible]      = useState(false);
  const modalRef = useRef(null);

  const deleteMatch = deleteInput.trim()===currentWorkspace?.name?.trim();

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const handleClose = useCallback(() => {
    if (isSaving) return;
    setVisible(false);
    setTimeout(onClose, 220);
  }, [isSaving, onClose]);

  useEffect(() => {
    const fn = e => { if (e.key==='Escape' && !isSaving) handleClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isSaving, handleClose]);

  const handleSave = async e => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Workspace name is required.'); return; }
    if (name.trim().length<2) { setNameError('Name must be at least 2 characters.'); return; }
    setIsSaving(true);
    const result = await dispatch(updateWorkspace({ workspaceId:currentWorkspace._id, data:{ name:name.trim(), description:description.trim() } }));
    setIsSaving(false);
    if (result.type==='workspace/update/fulfilled') {
      setSaveSuccess(true); toast.success('Workspace updated!');
      setTimeout(() => setSaveSuccess(false), 2500);
    } else toast.error(result.payload||'Failed to update workspace');
  };

  const handleDelete = async () => {
    if (!deleteMatch) return;
    setDeleteStep(3);
    const result = await dispatch(deleteWorkspace(currentWorkspace._id));
    if (result.type==='workspace/delete/fulfilled') {
      toast.success('Workspace deleted.');
      handleClose();
      if (workspaces.length<=1) navigate('/dashboard');
    } else { setDeleteStep(2); toast.error(result.payload||'Failed to delete workspace'); }
  };

  const taskBuckets = useSelector(s => s.tasks?.tasks??{ todo:[],in_progress:[],done:[] });
  const tasks = [...(taskBuckets.todo||[]),...(taskBuckets.in_progress||[]),...(taskBuckets.done||[])];

  const exportJSON = () => {
    const data = { workspace:{ name:currentWorkspace.name, description:currentWorkspace.description, members:currentWorkspace.members?.map(m=>({ name:m.user?.name, email:m.user?.email, role:m.role })), exportedAt:new Date().toISOString() }, tasks:tasks.map(t=>({ title:t.title,description:t.description,status:t.status,priority:t.priority,assignee:t.assignee?.name??null,dueDate:t.dueDate??null,tags:t.tags??[],createdAt:t.createdAt })) };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'),{ href:url, download:`${currentWorkspace.name.replace(/\s+/g,'_')}_export.json` });
    a.click(); URL.revokeObjectURL(url); toast.success('Exported as JSON');
  };
  const exportCSV = () => {
    const headers = ['Title','Description','Status','Priority','Assignee','Due Date','Tags','Created At'];
    const rows = tasks.map(t => [`"${(t.title??'').replace(/"/g,'""')}"`,`"${(t.description??'').replace(/"/g,'""')}"`,t.status??'',t.priority??'',t.assignee?.name??'',t.dueDate?new Date(t.dueDate).toLocaleDateString():'',`"${(t.tags??[]).join(', ')}"`,t.createdAt?new Date(t.createdAt).toLocaleDateString():'']).map(r=>r.join(','));
    const csv  = [headers.join(','),...rows].join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'),{ href:url, download:`${currentWorkspace.name.replace(/\s+/g,'_')}_tasks.csv` });
    a.click(); URL.revokeObjectURL(url); toast.success('Exported as CSV');
  };

  return (
    <>
      <style>{`
        .wsm-overlay{transition:opacity .22s ease}
        .wsm-card{transition:opacity .22s cubic-bezier(.22,1,.36,1),transform .22s cubic-bezier(.22,1,.36,1)}
        .wsm-card.in{opacity:1!important;transform:scale(1) translateY(0)!important}
        .wsm-card.out{opacity:0!important;transform:scale(.96) translateY(10px)!important}
        .wsm-input{transition:border-color .15s,box-shadow .15s,background .15s;background:${T.s2};border:1px solid ${T.border2};color:${T.text}}
        .wsm-input::placeholder{color:${T.muted}}
        .wsm-input:focus{outline:none;background:${T.s3};border-color:rgba(99,102,241,.7);box-shadow:0 0 0 4px rgba(99,102,241,.12)}
        .wsm-input.error{border-color:rgba(239,68,68,.6)!important;box-shadow:0 0 0 3px rgba(239,68,68,.15)!important}
        .wsm-input.danger-focus:focus{border-color:rgba(239,68,68,.7)!important;box-shadow:0 0 0 4px rgba(239,68,68,.18)!important}
        .wsm-tab{display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:9px;border:none;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;background:transparent;color:${T.muted}}
        .wsm-tab:hover{background:${T.s2};color:${T.text}}
        .wsm-tab.active{background:rgba(99,102,241,.12);color:#818cf8}
        .wsm-tab.danger.active{background:rgba(239,68,68,.10);color:#f87171}
        .wsm-tab.danger:hover{color:#fca5a5}
        .wsm-color-dot{cursor:pointer;transition:transform .15s,box-shadow .15s,outline .15s;border-radius:50%;border:none}
        .wsm-color-dot:hover{transform:scale(1.18)}
        .wsm-color-dot.active{outline:2px solid rgba(255,255,255,.7);outline-offset:2px;transform:scale(1.15)}
        .wsm-save-btn{border:none;color:#fff;cursor:pointer;transition:opacity .15s,box-shadow .15s,transform .1s}
        .wsm-save-btn:hover:not(:disabled){opacity:.91;transform:translateY(-1px)}
        .wsm-save-btn:disabled{opacity:.35;cursor:not-allowed}
        .wsm-cancel-btn{background:transparent;border:1px solid ${T.border2};color:${T.muted};cursor:pointer;transition:all .15s}
        .wsm-cancel-btn:hover{background:${T.s2};color:${T.text}}
        .wsm-export-card{background:${T.s2};border:1px solid ${T.border2};border-radius:13px;padding:16px 18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .18s}
        .wsm-export-card:hover{background:${T.s3};border-color:${T.border3};transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.10)}
        .wsm-delete-step-btn{cursor:pointer;border:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;border-radius:9px;transition:all .15s;padding:10px 18px}
        .wsm-close{transition:background .15s,color .15s;background:transparent;border:1px solid ${T.border2};color:${T.muted};cursor:pointer}
        .wsm-close:hover{background:${T.s2};color:${T.text}}
        @keyframes wsm-spin{to{transform:rotate(360deg)}}
        .wsm-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;animation:wsm-spin .65s linear infinite;display:inline-block}
        @keyframes wsm-check-pop{0%{transform:scale(.5);opacity:0}65%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        .wsm-check{animation:wsm-check-pop .35s cubic-bezier(.34,1.56,.64,1) both}
        .wsm-char-bar{height:2px;border-radius:2px;transition:width .2s,background .2s}
        select option{background:${T.s2};color:${T.text}}
      `}</style>

      {/* Overlay */}
      <div className="wsm-overlay fixed inset-0 flex items-center justify-center px-4"
        style={{ background:'rgba(0,0,0,0.50)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)', opacity:visible?1:0, zIndex:9999, pointerEvents:visible?'auto':'none' }}
        onClick={e => e.target===e.currentTarget && handleClose()}>

        {/* Gradient border */}
        <div style={{ position:'relative',borderRadius:22,padding:1,width:'100%',maxWidth:580,background:'linear-gradient(145deg,rgba(99,102,241,.5),rgba(139,92,246,.3) 50%,rgba(255,255,255,.06))' }}>
          <div ref={modalRef} role="dialog" aria-modal="true" className={`wsm-card ${visible?'in':'out'}`}
            style={{ borderRadius:21, background:T.surface, overflow:'hidden', position:'relative', opacity:0, transform:'scale(.95) translateY(14px)', maxHeight:'90vh', display:'flex', flexDirection:'column' }}>

            {/* Shimmer top */}
            <div style={{ height:1, flexShrink:0, background:'linear-gradient(90deg,transparent,rgba(99,102,241,.9) 40%,rgba(139,92,246,.9) 60%,transparent)' }} />

            {/* Header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 18px',borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                <WorkspacePreview name={name} color={color} />
                <div>
                  <h2 style={{ fontSize:16,fontWeight:700,color:T.text,margin:0,letterSpacing:'-.3px' }}>Workspace Settings</h2>
                  <p style={{ fontSize:12.5,margin:'3px 0 0',color:T.muted }}>{name.trim()||currentWorkspace?.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="wsm-close" aria-label="Close" style={{ width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>

              {/* Tabs sidebar */}
              <div style={{ width:150,flexShrink:0,borderRight:`1px solid ${T.border}`,padding:'14px 10px',display:'flex',flexDirection:'column',gap:3 }}>
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
                {TABS.map(({ key, label, icon: IconComp }) => (
                  <button key={key} onClick={() => setActiveTab(key)} className={`wsm-tab${key==='danger'?' danger':''}${activeTab===key?' active':''}`}>
                    <IconComp size={13} strokeWidth={2} />{label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex:1,overflowY:'auto',padding:'20px 22px' }}>

                {/* ── GENERAL ── */}
                {activeTab==='general' && (
                  <form onSubmit={handleSave} noValidate>
                    <div style={{ marginBottom:18 }}>
                      <label className="wsm-section-label" htmlFor="wsm-name" style={{ display:'block',fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:9 }}>Workspace Name</label>
                      <input id="wsm-name" type="text" value={name} onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }} placeholder="e.g., Marketing Team" maxLength={50} disabled={!isAdmin||isSaving} className={`wsm-input${nameError?' error':''}`}
                        style={{ width:'100%',boxSizing:'border-box',padding:'11px 13px',borderRadius:10,fontSize:13.5 }} />
                      <div style={{ marginTop:6,display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ flex:1,height:2,borderRadius:2,background:T.border2 }}>
                          <div className="wsm-char-bar" style={{ width:`${(name.length/50)*100}%`,background:name.length>45?'#f59e0b':name.length>0?'#6366f1':'transparent' }} />
                        </div>
                        <span style={{ fontSize:11,color:name.length>45?'#f59e0b':T.muted,flexShrink:0 }}>{name.length}/50</span>
                      </div>
                      {nameError && <p style={{ fontSize:12,color:'#f87171',margin:'5px 0 0 2px',display:'flex',alignItems:'center',gap:5 }}><AlertTriangle size={11} color="#f87171" />{nameError}</p>}
                    </div>

                    <div style={{ marginBottom:18 }}>
                      <label htmlFor="wsm-desc" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:9 }}>
                        <span>Description</span>
                        <span style={{ fontSize:10,color:T.muted,textTransform:'none',letterSpacing:0,fontWeight:400 }}>Optional</span>
                      </label>
                      <textarea id="wsm-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this workspace for?" rows={3} maxLength={200} disabled={!isAdmin||isSaving} className="wsm-input"
                        style={{ width:'100%',boxSizing:'border-box',padding:'11px 13px',borderRadius:10,fontSize:13.5,resize:'none',lineHeight:1.6 }} />
                      <div style={{ marginTop:6,display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ flex:1,height:2,borderRadius:2,background:T.border2 }}>
                          <div className="wsm-char-bar" style={{ width:`${(description.length/200)*100}%`,background:description.length>185?'#f59e0b':description.length>0?'#6366f1':'transparent' }} />
                        </div>
                        <span style={{ fontSize:11,color:description.length>185?'#f59e0b':T.muted,flexShrink:0 }}>{description.length}/200</span>
                      </div>
                    </div>

                    <div style={{ marginBottom:22 }}>
                      <label style={{ display:'block',fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:11 }}>Workspace Color</label>
                      <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
                        {WS_COLORS.map(c => (
                          <button key={c.label} type="button" aria-label={`Color: ${c.label}`} aria-pressed={color.label===c.label} onClick={() => setColor(c)} disabled={!isAdmin||isSaving}
                            className={`wsm-color-dot${color.label===c.label?' active':''}`}
                            style={{ width:24,height:24,background:`linear-gradient(135deg,${c.from},${c.to})`,boxShadow:color.label===c.label?`0 0 10px ${c.from}90`:'none' }} />
                        ))}
                        <span style={{ fontSize:12,color:T.muted,marginLeft:4 }}>{color.label}</span>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div style={{ background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',marginBottom:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 0' }}>
                      {[
                        { l:'Members', v:currentWorkspace?.members?.length??0 },
                        { l:'Your Role', v:isOwner?'Owner':(myMember?.role??'Member'), cap:true },
                        { l:'Created', v:currentWorkspace?.createdAt?new Date(currentWorkspace.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—' },
                        { l:'Owner', v:currentWorkspace?.owner?.name??'—' },
                      ].map(({ l, v, cap }) => (
                        <div key={l}>
                          <div style={{ fontSize:11,color:T.muted,marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:13,color:T.dim,fontWeight:600,textTransform:cap?'capitalize':'none' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {isAdmin ? (
                      <div style={{ display:'flex',gap:10 }}>
                        <button type="button" onClick={handleClose} disabled={isSaving} className="wsm-cancel-btn" style={{ flex:1,padding:'11px 0',borderRadius:10,fontSize:13,fontWeight:500 }}>Cancel</button>
                        <button type="submit" disabled={isSaving||saveSuccess||!name.trim()} className="wsm-save-btn"
                          style={{ flex:1.4,padding:'11px 0',borderRadius:10,fontSize:13.5,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:7,background:saveSuccess?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:saveSuccess?'0 4px 20px rgba(16,185,129,.38)':'0 4px 20px rgba(99,102,241,.38)',transition:'background .3s,box-shadow .3s' }}>
                          {isSaving?(<><span className="wsm-spin"/>Saving…</>):saveSuccess?(<><CheckCircle2 size={14} className="wsm-check"/>Saved!</>):(<><Save size={14}/>Save Changes</>)}
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize:12.5,color:T.muted,textAlign:'center',padding:'8px 0' }}>Only admins and owners can edit workspace settings.</p>
                    )}
                  </form>
                )}

                {/* ── EXPORT ── */}
                {activeTab==='export' && (
                  <div>
                    <p style={{ fontSize:13,color:T.muted,marginBottom:20,lineHeight:1.65 }}>Download all tasks and workspace data. Useful for backups, reporting, or migrating to another tool.</p>
                    <div className="wsm-export-card" onClick={exportJSON} style={{ marginBottom:12 }}>
                      <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.2)',display:'flex',alignItems:'center',justifyContent:'center' }}><FileJson size={18} color="#818cf8"/></div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13.5,fontWeight:600,color:T.text,marginBottom:3 }}>Export as JSON</div>
                        <div style={{ fontSize:12,color:T.muted }}>Full workspace data — tasks, members, metadata</div>
                      </div>
                      <ChevronRight size={14} color={T.muted} />
                    </div>
                    <div className="wsm-export-card" onClick={exportCSV}>
                      <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,background:'rgba(16,185,129,.10)',border:'1px solid rgba(16,185,129,.2)',display:'flex',alignItems:'center',justifyContent:'center' }}><FileText size={18} color="#34d399"/></div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13.5,fontWeight:600,color:T.text,marginBottom:3 }}>Export Tasks as CSV</div>
                        <div style={{ fontSize:12,color:T.muted }}>Spreadsheet-ready — open in Excel or Google Sheets</div>
                      </div>
                      <ChevronRight size={14} color={T.muted} />
                    </div>
                    <div style={{ marginTop:20,background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',display:'flex',gap:20 }}>
                      {[{ l:'Total tasks',v:tasks.length },{ l:'Members',v:currentWorkspace?.members?.length??0 },{ l:'Done',v:tasks.filter(t=>t.status==='done').length }].map(({ l, v }) => (
                        <div key={l} style={{ textAlign:'center',flex:1 }}>
                          <div style={{ fontSize:18,fontWeight:700,color:'#818cf8' }}>{v}</div>
                          <div style={{ fontSize:11,color:T.muted,marginTop:2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── DANGER ── */}
                {activeTab==='danger' && (
                  <div>
                    {!isOwner ? (
                      <div style={{ background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.14)',borderRadius:12,padding:'16px 18px',display:'flex',alignItems:'center',gap:12 }}>
                        <AlertTriangle size={18} color="#f87171" style={{ flexShrink:0 }} />
                        <p style={{ fontSize:13,color:'#f87171',lineHeight:1.55,margin:0 }}>Only the workspace <strong>owner</strong> can delete this workspace.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.16)',borderRadius:12,padding:'14px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'flex-start' }}>
                          <AlertTriangle size={16} color="#f87171" style={{ flexShrink:0,marginTop:1 }} />
                          <div>
                            <p style={{ fontSize:13,fontWeight:600,color:'#fca5a5',marginBottom:4 }}>This action is irreversible</p>
                            <p style={{ fontSize:12.5,color:T.dim,lineHeight:1.6,margin:0 }}>Deleting <strong style={{ color:T.text }}>{currentWorkspace?.name}</strong> will permanently remove all tasks, comments, and member associations.</p>
                          </div>
                        </div>

                        {deleteStep===0 && (
                          <button className="wsm-delete-step-btn" onClick={() => setDeleteStep(1)} style={{ width:'100%',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.15)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,.08)'}>
                            Delete this workspace…
                          </button>
                        )}

                        {deleteStep===1 && (
                          <div style={{ background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.2)',borderRadius:12,padding:'16px' }}>
                            <p style={{ fontSize:13,color:'#fca5a5',marginBottom:14,fontWeight:600 }}>Are you sure you want to delete this workspace?</p>
                            <div style={{ display:'flex',gap:10 }}>
                              <button className="wsm-delete-step-btn" onClick={() => setDeleteStep(0)} style={{ flex:1,background:T.s2,border:`1px solid ${T.border2}`,color:T.muted }}>Cancel</button>
                              <button className="wsm-delete-step-btn" onClick={() => setDeleteStep(2)} style={{ flex:1,background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171' }}
                                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.22)'}
                                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,.12)'}>
                                Yes, continue →
                              </button>
                            </div>
                          </div>
                        )}

                        {deleteStep===2 && (
                          <div style={{ background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.2)',borderRadius:12,padding:'16px' }}>
                            <p style={{ fontSize:13,color:T.dim,marginBottom:12,lineHeight:1.6 }}>Type <strong style={{ color:'#fca5a5' }}>{currentWorkspace?.name}</strong> to confirm deletion:</p>
                            <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder={currentWorkspace?.name} autoFocus className="wsm-input danger-focus"
                              style={{ width:'100%',boxSizing:'border-box',padding:'10px 13px',borderRadius:9,fontSize:13.5,marginBottom:12 }} />
                            <div style={{ display:'flex',gap:10 }}>
                              <button className="wsm-delete-step-btn" onClick={() => { setDeleteStep(0); setDeleteInput(''); }} style={{ flex:1,background:T.s2,border:`1px solid ${T.border2}`,color:T.muted }}>Cancel</button>
                              <button className="wsm-delete-step-btn" onClick={handleDelete} disabled={!deleteMatch||deleteStep===3}
                                style={{ flex:1,background:deleteMatch?'#ef4444':'rgba(239,68,68,.07)',border:`1px solid ${deleteMatch?'#ef4444':'rgba(239,68,68,.2)'}`,color:deleteMatch?'#fff':T.muted,cursor:deleteMatch?'pointer':'not-allowed',boxShadow:deleteMatch?'0 4px 18px rgba(239,68,68,.4)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
                                {deleteStep===3?<><span className="wsm-spin" style={{ borderTopColor:'#fff' }}/>Deleting…</>:<><Trash2 size={13}/>Delete Workspace</>}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
