import { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedTask } from '../redux/slices/taskSlice';
import {
  ChevronLeft, ChevronRight, CalendarDays, CalendarCheck,
  Plus, AlertTriangle, Circle, Zap, CheckCircle2, Clock,
  ChevronDown, X, SlidersHorizontal
} from 'lucide-react';

const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
const TaskDetailModal  = lazy(() => import('./TaskDetailModal'));

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_MINI  = ['S','M','T','W','T','F','S'];

const STATUS_CFG = {
  todo:        { bg:'rgba(59,130,246,0.12)',  text:'#3b82f6', Icon: Circle,       label:'To Do'       },
  in_progress: { bg:'rgba(245,158,11,0.12)', text:'#f59e0b', Icon: Zap,          label:'In Progress' },
  done:        { bg:'rgba(16,185,129,0.12)', text:'#10b981', Icon: CheckCircle2, label:'Done'        },
};
const PRIORITY_DOT = {
  urgent:'#f43f5e', high:'#ef4444', medium:'#3b82f6', low:'#94a3b8',
};

const VIEW_BTNS = [
  { k: 'month', Comp: CalendarDays  },
  { k: 'week',  Comp: CalendarCheck },
];

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 1024, isDesktop: width >= 1024, width };
}

const sameDay  = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const todayDate = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const isToday   = d => sameDay(d, new Date());
const isPastDay = d => { const t=todayDate(); const x=new Date(d); x.setHours(0,0,0,0); return x < t; };
const dateKey   = d => new Date(d).toDateString();

const buildMonthGrid = (y, m) => {
  const first=new Date(y,m,1), lastDate=new Date(y,m+1,0).getDate(), startDay=first.getDay();
  const total=Math.ceil((startDay+lastDate)/7)*7;
  return Array.from({length:total},(_,i)=>{const day=i-startDay+1;return(day<1||day>lastDate)?null:new Date(y,m,day);});
};
const buildWeekGrid = refDate => {
  const start=new Date(refDate); start.setDate(refDate.getDate()-refDate.getDay());
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
};

function TaskChip({ task, onClick, compact }) {
  const s = STATUS_CFG[task.status] || STATUS_CFG.todo;
  const { Icon: StatusIcon } = s;
  const overdue = task.dueDate && task.status !== 'done' && isPastDay(new Date(task.dueDate));
  if (compact) {
    return (
      <button onClick={e=>{e.stopPropagation();onClick(task);}} title={task.title}
        style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:overdue?'#ef4444':s.text,border:'none',cursor:'pointer',padding:0}}/>
    );
  }
  return (
    <button onClick={e=>{e.stopPropagation();onClick(task);}} title={task.title}
      style={{width:'100%',display:'flex',alignItems:'center',gap:4,padding:'3px 6px',borderRadius:5,background:overdue?'rgba(239,68,68,0.1)':s.bg,border:`1px solid ${overdue?'rgba(239,68,68,0.25)':'transparent'}`,cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all 0.12s ease',marginBottom:2,minWidth:0}}
      onMouseEnter={e=>{e.currentTarget.style.filter='brightness(0.88)';e.currentTarget.style.transform='translateX(2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.filter='none';e.currentTarget.style.transform='none';}}>
      <StatusIcon style={{width:9,height:9,color:overdue?'#ef4444':s.text,flexShrink:0}}/>
      <span style={{fontSize:10,fontWeight:600,lineHeight:1.3,color:overdue?'#ef4444':s.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{task.title}</span>
      {overdue && <AlertTriangle style={{width:8,height:8,color:'#ef4444',flexShrink:0}}/>}
      <span style={{width:5,height:5,borderRadius:'50%',flexShrink:0,background:PRIORITY_DOT[task.priority]||'#94a3b8'}}/>
    </button>
  );
}

function MonthCell({ date, tasks, onTaskClick, onAddClick, inMonth, compact }) {
  const today=isToday(date), past=isPastDay(date);
  const hasOverdue=tasks.some(t=>t.status!=='done'&&t.dueDate&&isPastDay(new Date(t.dueDate)));
  if (compact) {
    return (
      <div onClick={()=>inMonth&&onAddClick(date)}
        style={{padding:'4px 2px',background:today?'rgba(37,99,235,0.05)':'transparent',border:today?'1px solid rgba(37,99,235,0.2)':'1px solid transparent',borderRadius:6,cursor:inMonth?'pointer':'default',opacity:inMonth?1:0.28,display:'flex',flexDirection:'column',alignItems:'center',gap:2,minHeight:52}}>
        <span style={{width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',fontSize:11,fontWeight:today?800:500,background:today?'var(--brand-primary)':'transparent',color:today?'white':past&&inMonth?'var(--text-disabled)':'var(--text-primary)'}}>
          {date.getDate()}
        </span>
        {tasks.length>0&&(<div style={{display:'flex',gap:2,flexWrap:'wrap',justifyContent:'center',padding:'0 2px'}}>
          {tasks.slice(0,3).map(t=><TaskChip key={t._id} task={t} onClick={onTaskClick} compact/>)}
          {tasks.length>3&&<span style={{fontSize:8,color:'var(--text-tertiary)',fontWeight:700}}>+{tasks.length-3}</span>}
        </div>)}
      </div>
    );
  }
  const visible=tasks.slice(0,3), extra=tasks.length-3;
  return (
    <div onClick={()=>inMonth&&onAddClick(date)}
      style={{minHeight:100,padding:'6px 5px 4px',background:today?'rgba(37,99,235,0.05)':'transparent',border:today?'1px solid rgba(37,99,235,0.2)':'1px solid transparent',borderRadius:8,cursor:inMonth?'pointer':'default',opacity:inMonth?1:0.28,transition:'background 0.12s ease'}}
      onMouseEnter={e=>{if(inMonth&&!today)e.currentTarget.style.background='var(--surface-hover)';}}
      onMouseLeave={e=>{if(!today)e.currentTarget.style.background=today?'rgba(37,99,235,0.05)':'transparent';}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
        <span style={{width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',fontSize:11.5,fontWeight:today?800:500,background:today?'var(--brand-primary)':'transparent',color:today?'white':past&&inMonth?'var(--text-disabled)':'var(--text-primary)'}}>{date.getDate()}</span>
        {hasOverdue&&<div style={{width:6,height:6,borderRadius:'50%',background:'#ef4444'}}/>}
      </div>
      {visible.map(t=><TaskChip key={t._id} task={t} onClick={onTaskClick}/>)}
      {extra>0&&<span style={{fontSize:9.5,color:'var(--text-tertiary)',fontWeight:600,paddingLeft:4}}>+{extra} more</span>}
    </div>
  );
}

function UpcomingPanel({ tasks, onTaskClick, asDrawer, onClose }) {
  const upcoming=tasks.filter(t=>t.dueDate&&t.status!=='done').sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,8);
  const panelStyle=asDrawer?{position:'fixed',inset:0,zIndex:60,display:'flex',flexDirection:'column'}:{width:220,flexShrink:0,background:'var(--surface-base)',border:'1.5px solid var(--border-subtle)',borderRadius:12,padding:'14px 12px',boxShadow:'var(--shadow-sm)',display:'flex',flexDirection:'column',gap:10,maxHeight:460,overflowY:'auto'};
  const content=(
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <p style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-tertiary)',margin:0}}>Upcoming</p>
        {asDrawer&&<button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',padding:4}}><X style={{width:18,height:18}}/></button>}
      </div>
      {upcoming.length===0?(<div style={{textAlign:'center',padding:'20px 0'}}><CheckCircle2 style={{width:28,height:28,color:'var(--text-disabled)',margin:'0 auto 8px'}}/><p style={{fontSize:11.5,color:'var(--text-tertiary)'}}>All clear!</p></div>)
      :upcoming.map(task=>{
        const due=new Date(task.dueDate),overdue=isPastDay(due),daysLeft=Math.ceil((due-todayDate())/86400000),s=STATUS_CFG[task.status]||STATUS_CFG.todo;
        return(
          <button key={task._id} onClick={()=>{onTaskClick(task);if(onClose)onClose();}}
            style={{width:'100%',textAlign:'left',background:'var(--surface-sunken)',border:`1px solid ${overdue?'rgba(239,68,68,0.25)':'var(--border-subtle)'}`,borderRadius:8,padding:'8px 10px',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s ease'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-primary)';e.currentTarget.style.background='var(--surface-hover)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=overdue?'rgba(239,68,68,0.25)':'var(--border-subtle)';e.currentTarget.style.background='var(--surface-sunken)';}}>
            <p style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',marginBottom:4,lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:9.5,fontWeight:700,padding:'1px 6px',borderRadius:20,background:s.bg,color:s.text}}>{s.label}</span>
              <span style={{fontSize:10,fontWeight:600,color:overdue?'#ef4444':daysLeft<=2?'#f59e0b':'var(--text-tertiary)'}}>{overdue?`${Math.abs(daysLeft)}d overdue`:daysLeft===0?'Today':`${daysLeft}d left`}</span>
            </div>
          </button>
        );
      })}
    </>
  );
  if(asDrawer){return(<><div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:59}}/><div style={{position:'fixed',right:0,top:0,bottom:0,width:280,zIndex:60,background:'var(--surface-base)',borderLeft:'1.5px solid var(--border-subtle)',boxShadow:'var(--shadow-xl)',padding:'16px 14px',display:'flex',flexDirection:'column',gap:10,overflowY:'auto',animation:'slideInRight 0.22s ease-out'}}>{content}</div><style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style></>);}
  return <div style={panelStyle}>{content}</div>;
}

export default function CalendarView() {
  const dispatch=useDispatch();
  const {tasks,selectedTask}=useSelector(s=>s.tasks);
  const {currentWorkspace}=useSelector(s=>s.workspace);
  const {isMobile,isTablet,isDesktop}=useBreakpoint();
  const now=new Date();

  const [view,setView]=useState('month');
  const [year,setYear]=useState(now.getFullYear());
  const [month,setMonth]=useState(now.getMonth());
  const [weekRef,setWeekRef]=useState(now);
  const [filterStatus,setFilterStatus]=useState('all');
  const [showCreate,setShowCreate]=useState(false);
  const [createDate,setCreateDate]=useState(null);
  const [showUpcoming,setShowUpcoming]=useState(false);
  const [showFilter,setShowFilter]=useState(false);

  const allTasks=useMemo(()=>[...(tasks.todo||[]),...(tasks.in_progress||[]),...(tasks.done||[])],[tasks]);
  const visibleTasks=useMemo(()=>filterStatus==='all'?allTasks:allTasks.filter(t=>t.status===filterStatus),[allTasks,filterStatus]);
  const tasksByDate=useMemo(()=>{const map={};visibleTasks.forEach(t=>{if(!t.dueDate)return;const k=dateKey(new Date(t.dueDate));(map[k]=map[k]||[]).push(t);});return map;},[visibleTasks]);
  const stats=useMemo(()=>{const mt=allTasks.filter(t=>{if(!t.dueDate)return false;const d=new Date(t.dueDate);return d.getFullYear()===year&&d.getMonth()===month;});return{total:mt.length,done:mt.filter(t=>t.status==='done').length,active:mt.filter(t=>t.status==='in_progress').length,overdue:mt.filter(t=>t.status!=='done'&&isPastDay(new Date(t.dueDate))).length};},[allTasks,year,month]);

  const prevPeriod=()=>{if(view==='month'){if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}else{const d=new Date(weekRef);d.setDate(d.getDate()-7);setWeekRef(d);}};
  const nextPeriod=()=>{if(view==='month'){if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}else{const d=new Date(weekRef);d.setDate(d.getDate()+7);setWeekRef(d);}};
  const goToday=()=>{setYear(now.getFullYear());setMonth(now.getMonth());setWeekRef(now);};

  const monthGrid=useMemo(()=>buildMonthGrid(year,month),[year,month]);
  const weekGrid=useMemo(()=>buildWeekGrid(weekRef),[weekRef]);
  const handleTaskClick=useCallback(t=>dispatch(setSelectedTask(t)),[dispatch]);
  const handleAddClick=useCallback(d=>{setCreateDate(d);setShowCreate(true);},[]);

  const weekTitle=useMemo(()=>{const w=buildWeekGrid(weekRef);const s=w[0],e=w[6];if(isMobile)return`${MONTHS_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;if(s.getMonth()===e.getMonth())return`${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;return`${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;},[weekRef,isMobile]);

  const navBtn={width:isMobile?32:28,height:isMobile?32:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:7,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',cursor:'pointer',color:'var(--text-secondary)'};
  const segBtn=active=>({padding:isMobile?'5px 10px':'4px 11px',borderRadius:6,border:'none',cursor:'pointer',fontSize:isMobile?12:11.5,fontWeight:600,fontFamily:'inherit',background:active?'var(--surface-base)':'transparent',color:active?'var(--text-primary)':'var(--text-tertiary)',boxShadow:active?'var(--shadow-xs)':'none',transition:'all 0.15s ease'});
  const headerTitle=view==='month'?(isMobile?`${MONTHS_SHORT[month]} ${year}`:`${MONTHS[month]} ${year}`):weekTitle;
  const statItems=isMobile?[{label:'Total',value:stats.total,color:'var(--brand-primary)'},{label:'Done',value:stats.done,color:'#10b981'},{label:'Overdue',value:stats.overdue,color:'#ef4444'}]:[{label:'This Month',value:stats.total,color:'var(--brand-primary)'},{label:'Completed',value:stats.done,color:'#10b981'},{label:'In Progress',value:stats.active,color:'#f59e0b'},{label:'Overdue',value:stats.overdue,color:'#ef4444'}];
  const dayLabels=isMobile?DAYS_MINI:DAYS_SHORT;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:isMobile?10:14,height:'100%',minHeight:0,position:'relative',padding:isMobile?'0 0 16px':0}}>

      {/* ── HEADER ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:isMobile?8:10,flexWrap:isTablet?'wrap':'nowrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:isMobile?8:10,minWidth:0}}>
          {!isMobile&&(<div style={{width:32,height:32,borderRadius:9,background:'var(--brand-muted)',border:'1px solid rgba(37,99,235,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CalendarDays style={{width:16,height:16,color:'var(--brand-primary)'}}/></div>)}
          <h2 style={{fontSize:isMobile?16:18,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.5px',margin:0,whiteSpace:'nowrap'}}>{headerTitle}</h2>
          <div style={{display:'flex',alignItems:'center',gap:isMobile?3:4}}>
            <button style={navBtn} onClick={prevPeriod} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface-sunken)'}><ChevronLeft style={{width:14,height:14}}/></button>
            {!isMobile&&(<button onClick={goToday} style={{height:28,padding:'0 12px',borderRadius:7,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',cursor:'pointer',fontSize:12,fontWeight:600,color:'var(--text-secondary)',fontFamily:'inherit'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface-sunken)'}>Today</button>)}
            <button style={navBtn} onClick={nextPeriod} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface-sunken)'}><ChevronRight style={{width:14,height:14}}/></button>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:isMobile?6:8,flexShrink:0}}>
          {isMobile?(
            <>
              <button onClick={goToday} style={{height:32,padding:'0 10px',borderRadius:7,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',cursor:'pointer',fontSize:11,fontWeight:600,color:'var(--text-secondary)',fontFamily:'inherit'}}>Today</button>
              <button onClick={()=>setShowFilter(v=>!v)} style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:7,background:showFilter?'var(--brand-muted)':'var(--surface-sunken)',border:`1px solid ${showFilter?'rgba(37,99,235,0.3)':'var(--border-default)'}`,cursor:'pointer',color:showFilter?'var(--brand-primary)':'var(--text-secondary)',position:'relative'}}><SlidersHorizontal style={{width:14,height:14}}/>{filterStatus!=='all'&&<span style={{position:'absolute',top:5,right:5,width:5,height:5,borderRadius:'50%',background:'var(--brand-primary)'}}/>}</button>
              <button onClick={()=>setShowUpcoming(true)} style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:7,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',cursor:'pointer',color:'var(--text-secondary)',position:'relative'}}><Clock style={{width:14,height:14}}/>{stats.overdue>0&&<span style={{position:'absolute',top:5,right:5,width:5,height:5,borderRadius:'50%',background:'#ef4444'}}/>}</button>
              {/* View toggle */}
              <div style={{display:'flex',gap:2,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',borderRadius:8,padding:2}}>

                {VIEW_BTNS.map(({k,Comp})=>(
                  <button key={k} onClick={()=>setView(k)} style={{width:30,height:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,border:'none',cursor:'pointer',background:view===k?'var(--surface-base)':'transparent',color:view===k?'var(--brand-primary)':'var(--text-tertiary)',boxShadow:view===k?'var(--shadow-xs)':'none',transition:'all 0.15s ease'}}>
                    <Comp style={{width:13,height:13}}/>
                  </button>
                ))}
              </div>
              <button onClick={()=>handleAddClick(now)} className="fs-btn-primary" style={{width:32,height:32,padding:0,borderRadius:8,flexShrink:0}}><Plus style={{width:16,height:16}}/></button>
            </>
          ):(
            <>
              <div style={{display:'flex',gap:2,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',borderRadius:8,padding:2}}>
                {[{k:'all',l:'All'},{k:'todo',l:'To Do'},{k:'in_progress',l:'Active'},{k:'done',l:'Done'}].map(({k,l})=>(
                  <button key={k} onClick={()=>setFilterStatus(k)} style={segBtn(filterStatus===k)}>{l}</button>
                ))}
              </div>
              {/* View toggle */}
              <div style={{display:'flex',gap:2,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',borderRadius:8,padding:2}}>

                {VIEW_BTNS.map(({k,Comp})=>(
                  <button key={k} onClick={()=>setView(k)} style={{width:32,height:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,border:'none',cursor:'pointer',background:view===k?'var(--surface-base)':'transparent',color:view===k?'var(--brand-primary)':'var(--text-tertiary)',boxShadow:view===k?'var(--shadow-xs)':'none',transition:'all 0.15s ease'}}>
                    <Comp style={{width:14,height:14}}/>
                  </button>
                ))}
              </div>
              <button onClick={()=>handleAddClick(now)} className="fs-btn-primary" style={{padding:'7px 14px',fontSize:12.5,whiteSpace:'nowrap'}}><Plus style={{width:14,height:14}}/> New Task</button>
            </>
          )}
        </div>
      </div>

      {isMobile&&showFilter&&(
        <div style={{display:'flex',gap:2,background:'var(--surface-sunken)',border:'1px solid var(--border-default)',borderRadius:8,padding:2,animation:'fadeIn 0.15s ease-out'}}>
          {[{k:'all',l:'All'},{k:'todo',l:'To Do'},{k:'in_progress',l:'Active'},{k:'done',l:'Done'}].map(({k,l})=>(
            <button key={k} onClick={()=>{setFilterStatus(k);setShowFilter(false);}} style={{...segBtn(filterStatus===k),flex:1}}>{l}</button>
          ))}
        </div>
      )}

      {/* ── STATS ── */}
      <div style={{display:'flex',gap:isMobile?6:10,flexWrap:'nowrap',overflowX:isMobile?'auto':'visible'}}>
        {statItems.map(({label,value,color})=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:isMobile?6:10,flex:isMobile?'0 0 auto':1,padding:isMobile?'8px 10px':'10px 14px',borderRadius:10,background:'var(--surface-base)',border:'1px solid var(--border-subtle)',boxShadow:'var(--shadow-xs)',minWidth:isMobile?80:120}}>
            <div style={{width:isMobile?8:10,height:isMobile?8:10,borderRadius:'50%',background:color,flexShrink:0}}/>
            <div><p style={{fontSize:isMobile?17:20,fontWeight:800,color:'var(--text-primary)',lineHeight:1,margin:0}}>{value}</p><p style={{fontSize:isMobile?9:10.5,color:'var(--text-tertiary)',fontWeight:500,margin:'2px 0 0',whiteSpace:'nowrap'}}>{label}</p></div>
          </div>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{flex:1,minHeight:0,display:'flex',gap:14,overflow:'hidden'}}>
        <div style={{flex:1,minWidth:0,background:'var(--surface-base)',border:'1.5px solid var(--border-subtle)',borderRadius:isMobile?10:14,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid var(--border-subtle)',background:'var(--surface-sunken)'}}>
            {dayLabels.map((d,i)=>(
              <div key={i} style={{padding:isMobile?'6px 2px':'9px 6px',textAlign:'center',fontSize:isMobile?9:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-tertiary)'}}>{d}</div>
            ))}
          </div>

          {view==='month'&&(
            <div style={{flex:1,overflowY:'auto',display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridAutoRows:isMobile?'minmax(52px,1fr)':'minmax(100px,1fr)',gap:1,background:'var(--border-subtle)'}}>
              {monthGrid.map((date,i)=>{
                if(!date)return<div key={`e-${i}`} style={{background:'var(--surface-bg)'}}/>;
                const inMonth=date.getMonth()===month;
                return(<div key={date.toISOString()} style={{background:'var(--surface-base)'}}><MonthCell date={date} tasks={tasksByDate[dateKey(date)]||[]} onTaskClick={handleTaskClick} onAddClick={handleAddClick} inMonth={inMonth} compact={isMobile}/></div>);
              })}
            </div>
          )}

          {view==='week'&&(
            <div style={{flex:1,overflowY:'auto',display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,background:'var(--border-subtle)'}}>
              {weekGrid.map(date=>{
                const today_=isToday(date), dayTasks=tasksByDate[dateKey(date)]||[];
                return(
                  <div key={date.toISOString()} style={{background:'var(--surface-base)',padding:isMobile?'6px 3px':'10px 8px',minHeight:isMobile?120:280}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,marginBottom:isMobile?6:10}}>
                      <span style={{fontSize:isMobile?8:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:today_?'var(--brand-primary)':'var(--text-tertiary)'}}>{isMobile?DAYS_MINI[date.getDay()]:DAYS_SHORT[date.getDay()]}</span>
                      <span style={{width:isMobile?22:28,height:isMobile?22:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:isMobile?11:13,fontWeight:today_?800:500,background:today_?'var(--brand-primary)':'transparent',color:today_?'white':'var(--text-primary)'}}>{date.getDate()}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:2}}>
                      {dayTasks.length>0
                        ?isMobile
                          ?dayTasks.slice(0,2).map(t=><TaskChip key={t._id} task={t} onClick={handleTaskClick} compact/>).concat(dayTasks.length>2?[<span key="more" style={{fontSize:8,color:'var(--text-tertiary)',fontWeight:700,paddingLeft:2}}>+{dayTasks.length-2}</span>]:[])
                          :dayTasks.map(t=><TaskChip key={t._id} task={t} onClick={handleTaskClick}/>)
                        :<p style={{fontSize:isMobile?8:10,color:'var(--text-disabled)',textAlign:'center',marginTop:isMobile?8:20}}>—</p>
                      }
                    </div>
                    {!isMobile&&(
                      <button onClick={()=>handleAddClick(date)} style={{width:'100%',marginTop:10,display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'5px 0',borderRadius:6,border:'1px dashed var(--border-default)',background:'transparent',cursor:'pointer',fontSize:10.5,color:'var(--text-tertiary)',fontFamily:'inherit',transition:'all 0.15s ease'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-primary)';e.currentTarget.style.color='var(--brand-primary)';e.currentTarget.style.background='var(--brand-muted)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-default)';e.currentTarget.style.color='var(--text-tertiary)';e.currentTarget.style.background='transparent';}}>
                        <Plus style={{width:10,height:10}}/> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isDesktop&&<UpcomingPanel tasks={allTasks} onTaskClick={handleTaskClick}/>}
      </div>

      {(isMobile||isTablet)&&showUpcoming&&(
        <UpcomingPanel tasks={allTasks} onTaskClick={handleTaskClick} asDrawer onClose={()=>setShowUpcoming(false)}/>
      )}

      {allTasks.filter(t=>t.dueDate).length===0&&(
        <div style={{position:'absolute',top:'55%',left:isMobile?'50%':'42%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none',zIndex:2,width:isMobile?'80%':'auto'}}>
          <div style={{width:56,height:56,borderRadius:16,background:'var(--brand-muted)',border:'1px solid rgba(37,99,235,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><CalendarDays style={{width:26,height:26,color:'var(--brand-primary)',opacity:0.5}}/></div>
          <p style={{fontSize:isMobile?13:15,fontWeight:700,color:'var(--text-secondary)',marginBottom:6}}>No tasks with due dates</p>
          <p style={{fontSize:isMobile?11:12.5,color:'var(--text-tertiary)'}}>Set due dates on tasks to see them here</p>
        </div>
      )}

      <Suspense fallback={null}>
        {showCreate&&(<CreateTaskModal initialStatus="todo" initialDueDate={createDate?createDate.toISOString().split('T')[0]:undefined} onClose={()=>{setShowCreate(false);setCreateDate(null);}}/>)}
        {selectedTask&&(<TaskDetailModal task={selectedTask} onClose={()=>dispatch(setSelectedTask(null))} onAddComment={()=>{}} workspaceMembers={currentWorkspace?.members?.map(m=>({_id:m.user?._id,name:m.user?.name}))||[]}/>)}
      </Suspense>
    </div>
  );
}
