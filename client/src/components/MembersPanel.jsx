import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeMember, updateMemberRole } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import { Crown, Shield, User, Trash2, UserPlus, Users, Mail, Search, CheckCircle2, Briefcase, Calendar } from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import { useThemeColors } from "../hooks/useTheme";

const ROLES = {
  owner:  { label:"Owner",  icon:Crown,  color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.22)"  },
  admin:  { label:"Admin",  icon:Shield, color:"#818cf8", bg:"rgba(99,102,241,0.12)",  border:"rgba(99,102,241,0.22)"  },
  member: { label:"Member", icon:User,   color:"#94a3b8", bg:"rgba(148,163,184,0.10)", border:"rgba(148,163,184,0.18)" },
};
const PALETTE = [
  {bg:"rgba(99,102,241,0.20)",color:"#818cf8",glow:"rgba(99,102,241,0.30)"},
  {bg:"rgba(16,185,129,0.20)",color:"#34d399",glow:"rgba(16,185,129,0.30)"},
  {bg:"rgba(245,158,11,0.20)",color:"#fbbf24",glow:"rgba(245,158,11,0.30)"},
  {bg:"rgba(168,85,247,0.20)",color:"#c084fc",glow:"rgba(168,85,247,0.30)"},
  {bg:"rgba(239,68,68,0.20)", color:"#f87171",glow:"rgba(239,68,68,0.30)" },
  {bg:"rgba(6,182,212,0.20)", color:"#22d3ee",glow:"rgba(6,182,212,0.30)" },
];
const avatarColor=(name="",id="")=>{const h=(name+id).split("").reduce((a,c)=>a+c.charCodeAt(0),0);return PALETTE[h%PALETTE.length];};
const initials=(name="")=>name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const joinedText=(d)=>{if(!d)return null;const days=Math.floor((Date.now()-new Date(d).getTime())/86400000);if(days===0)return"Joined today";if(days===1)return"Joined yesterday";if(days<30)return`Joined ${days}d ago`;return`Joined ${Math.floor(days/30)}mo ago`;};

export default function MembersPanel(){
  const T=useThemeColors();
  const dispatch=useDispatch();
  const {currentWorkspace}=useSelector(s=>s.workspace);
  const {user}=useSelector(s=>s.auth);
  const {tasks}=useSelector(s=>s.tasks);
  const [showInviteModal,setShowInviteModal]=useState(false);
  const [removingId,setRemovingId]=useState(null);
  const [updatingRoleId,setUpdatingRoleId]=useState(null);
  const [search,setSearch]=useState("");
  const [hoveredId,setHoveredId]=useState(null);

  const taskCountByUser=useMemo(()=>{
    const map={};
    [...(tasks?.todo||[]),...(tasks?.["in-progress"]||[]),...(tasks?.done||[])].forEach(t=>{
      const uid=t.assignee?._id||t.assignee?.id;if(uid)map[uid]=(map[uid]||0)+1;
    });return map;
  },[tasks]);

  const panel={background:T.surfaceCard,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 6px 28px rgba(0,0,0,0.08)"};

  if(!currentWorkspace)return(
    <div style={{...panel,padding:"72px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center"}}>
      <div style={{width:60,height:60,borderRadius:16,background:"rgba(99,102,241,0.10)",border:"1px solid rgba(99,102,241,0.20)",display:"flex",alignItems:"center",justifyContent:"center"}}><Users size={26} color="#818cf8"/></div>
      <h3 style={{fontSize:18,fontWeight:800,color:T.text}}>No workspace selected</h3>
      <p style={{fontSize:13.5,color:T.muted}}>Select a workspace from the sidebar.</p>
    </div>
  );

  const members=currentWorkspace.members||[];
  const myId=user?.id||user?._id;
  const currentMember=members.find(m=>m.user._id===myId);
  const isAdminOrOwner=currentMember?.role==="admin"||currentMember?.role==="owner";
  const isOwner=currentMember?.role==="owner";
  const roleOrder={owner:0,admin:1,member:2};
  const filtered=members.filter(m=>m.user.name.toLowerCase().includes(search.toLowerCase())||m.user.email.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>(roleOrder[a.role]??3)-(roleOrder[b.role]??3));
  const ownerCount=members.filter(m=>m.role==="owner").length;
  const adminCount=members.filter(m=>m.role==="admin").length;
  const memberCount=members.filter(m=>m.role==="member").length;

  const handleRemove=async(memberId)=>{
    if(!window.confirm("Remove this member?"))return;
    setRemovingId(memberId);
    const res=await dispatch(removeMember({workspaceId:currentWorkspace._id,memberId}));
    setRemovingId(null);
    if(res.type==="workspace/removeMember/fulfilled")toast.success("Member removed");
    else toast.error(res.payload||"Failed to remove member");
  };
  const handleRoleChange=async(memberId,newRole)=>{
    setUpdatingRoleId(memberId);
    const res=await dispatch(updateMemberRole({workspaceId:currentWorkspace._id,memberId,role:newRole}));
    setUpdatingRoleId(null);
    if(res.type==="workspace/updateMemberRole/fulfilled")toast.success(`Role updated to ${newRole}`);
    else toast.error(res.payload||"Failed to update role");
  };

  return(
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .role-select{appearance:none;-webkit-appearance:none;background-color:var(--surface2,#1e2130);border:1px solid rgba(99,102,241,0.30);border-radius:8px;padding:4px 26px 4px 10px;font-size:12px;font-weight:600;cursor:pointer;color:#818cf8;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23818cf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;transition:border-color 0.15s}
        .role-select:hover{border-color:rgba(99,102,241,0.55)}
        .role-select:focus{outline:none;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
        .role-select:disabled{opacity:0.5;cursor:not-allowed}
        .role-select option{background-color:var(--surface2,#1e2130);color:#c7d2fe}
        .member-row{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:14px;transition:all 0.15s}
        @media(max-width:500px){.member-row{flex-wrap:wrap;gap:10px}}
        @media(max-width:400px){.member-meta{display:none!important}}
      `}</style>

      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:22,letterSpacing:"-0.03em",color:T.text,lineHeight:1.2,margin:0}}>Team Members</h1>
            <p style={{fontSize:13,color:T.muted,marginTop:4}}>{members.length} member{members.length!==1?"s":""} in <span style={{color:T.text2,fontWeight:600}}>{currentWorkspace.name}</span></p>
          </div>
          {isAdminOrOwner&&(
            <button onClick={()=>setShowInviteModal(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Inter',sans-serif",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",boxShadow:"0 4px 18px rgba(99,102,241,0.35)",transition:"all 0.15s",flexShrink:0}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 26px rgba(99,102,241,0.50)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(99,102,241,0.35)"}}>
              <UserPlus size={14} strokeWidth={2.5}/>Invite Member
            </button>
          )}
        </div>

        {/* FIX: Stat cards — auto-fit responsive grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:12}}>
          {[
            {label:"Owners",value:ownerCount,sub:"Full control",color:"#f59e0b",bg:"rgba(245,158,11,0.10)",icon:<Crown size={16}/>},
            {label:"Admins",value:adminCount,sub:"Can manage",color:"#818cf8",bg:"rgba(99,102,241,0.10)",icon:<Shield size={16}/>},
            {label:"Members",value:memberCount,sub:"Standard access",color:T.dim,bg:"rgba(148,163,184,0.10)",icon:<User size={16}/>},
          ].map((s,i)=>(
            <div key={i} style={{...panel,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",color:s.color}}>{s.icon}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
                <div style={{fontSize:26,fontWeight:800,color:s.color,letterSpacing:"-0.04em",lineHeight:1.15}}>{s.value}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Members list */}
        <div style={{...panel,overflow:"hidden"}}>
          {/* List header */}
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:T.text,letterSpacing:"-0.02em"}}>Workspace Members</div>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>{filtered.length} member{filtered.length!==1?"s":""}{search?` matching "${search}"`:""}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border2}`,borderRadius:10,padding:"7px 12px",width:"min(230px,100%)",transition:"border-color 0.15s,box-shadow 0.15s"}}
              onFocusCapture={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.40)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(99,102,241,0.08)"}}
              onBlurCapture={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.boxShadow="none"}}>
              <Search size={13} color={T.muted} style={{flexShrink:0}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members…" style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,width:"100%",fontFamily:"'Inter',sans-serif"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16,padding:"0 2px",lineHeight:1}}>×</button>}
            </div>
          </div>

          {/* Rows */}
          <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {filtered.length===0?(
              <div style={{padding:"40px 20px",textAlign:"center",color:T.muted,fontSize:13}}>No members match "{search}"</div>
            ):filtered.map((member)=>{
              const role=ROLES[member.role]||ROLES.member;
              const RoleIcon=role.icon;
              const av=avatarColor(member.user.name,member.user._id);
              const isMe=member.user._id===myId;
              const isRemoving=removingId===member.user._id;
              const isUpdating=updatingRoleId===member.user._id;
              const isHov=hoveredId===member.user._id;
              const taskCount=taskCountByUser[member.user._id]||0;
              const joined=joinedText(member.joinedAt||member.createdAt||currentWorkspace.createdAt);
              const isThisOwner=member.role==="owner";
              return(
                <div key={member.user._id} className="member-row"
                  onMouseEnter={()=>setHoveredId(member.user._id)}
                  onMouseLeave={()=>setHoveredId(null)}
                  style={{background:isHov?T.s3:T.s2,border:`1px solid ${isHov?T.border2:T.border}`,boxShadow:isHov?"0 4px 18px rgba(0,0,0,0.10)":"none"}}>
                  {/* Avatar */}
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:av.bg,border:`2px solid ${av.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:av.color,fontSize:14,boxShadow:isHov?`0 0 18px ${av.glow}`:"none",transition:"box-shadow 0.15s"}}>{initials(member.user.name)}</div>
                    <span style={{position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:"#10b981",border:`2px solid ${T.surface}`}}/>
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:T.text}}>{member.user.name}</span>
                      {isMe&&<span style={{fontSize:10.5,padding:"2px 8px",borderRadius:999,background:"rgba(99,102,241,0.14)",border:"1px solid rgba(99,102,241,0.24)",color:"#818cf8",fontWeight:700}}>You</span>}
                      <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:999,background:role.bg,border:`1px solid ${role.border}`,color:role.color,fontSize:11,fontWeight:700}}>
                        <RoleIcon size={10}/>{role.label}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
                      <Mail size={11} color={T.muted} style={{flexShrink:0}}/>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member.user.email}</span>
                    </div>
                    <div className="member-meta" style={{display:"flex",alignItems:"center",gap:12,marginTop:6,flexWrap:"wrap"}}>
                      {joined&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.muted}}><Calendar size={10} color={T.muted}/>{joined}</div>}
                      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.muted}}><Briefcase size={10} color={T.muted}/>{taskCount} task{taskCount!==1?"s":""} assigned</div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:"auto"}}>
                    {isOwner&&!isThisOwner&&!isMe&&(
                      isUpdating?(
                        <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid #818cf8",borderTopColor:"transparent",animation:"spin 0.7s linear infinite"}}/>
                      ):(
                        <select className="role-select" value={member.role} onChange={e=>handleRoleChange(member.user._id,e.target.value)} disabled={isUpdating} title="Change role">
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )
                    )}
                    {isAdminOrOwner&&!isThisOwner&&!isMe&&(
                      <button onClick={()=>handleRemove(member.user._id)} disabled={isRemoving}
                        style={{width:34,height:34,borderRadius:10,flexShrink:0,border:`1px solid ${T.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:isRemoving?"not-allowed":"pointer",opacity:isRemoving?0.5:1,transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.10)";e.currentTarget.style.borderColor="rgba(220,38,38,0.35)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=T.border}}>
                        {isRemoving?<div style={{width:12,height:12,borderRadius:"50%",border:"2px solid #ef4444",borderTopColor:"transparent",animation:"spin 0.7s linear infinite"}}/>:<Trash2 size={13} color={T.red}/>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {members.length>0&&(
            <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.muted}}>
                <CheckCircle2 size={13} color={T.green}/>{members.length} total member{members.length!==1?"s":""}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{key:"owner",cfg:ROLES.owner,count:ownerCount},{key:"admin",cfg:ROLES.admin,count:adminCount},{key:"member",cfg:ROLES.member,count:memberCount}].filter(r=>r.count>0).map(({key,cfg,count})=>{
                  const Icon=cfg.icon;
                  return(<div key={key} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:999,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:11.5,color:cfg.color,fontWeight:600}}><Icon size={10}/>{count} {cfg.label}{count!==1?"s":""}</div>);
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {showInviteModal&&<InviteMemberModal onClose={()=>setShowInviteModal(false)}/>}
    </>
  );
}