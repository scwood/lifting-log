import{V as e,W as i,B as l,X as d,Y as m}from"./index-65e88226.js";import{C as a,T as c,d as u,m as x,b as h}from"./workoutUtils-474d0123.js";function j(n){const{workout:r}=n;return e.jsxs(a,{withBorder:!0,shadow:"sm",fz:"sm",children:[e.jsx(a.Section,{withBorder:!0,inheritPadding:!0,py:"xs",mb:"xs",children:e.jsxs(c,{c:"dimmed",size:"sm",children:["Completed on"," ",new Date(r.completedTimestamp||0).toLocaleString(void 0,{dateStyle:"long",timeStyle:"short"})]})}),e.jsxs(i,{direction:"column",gap:"xs",children:[r.days.map(o=>e.jsxs("div",{children:[e.jsx("u",{children:o.name}),e.jsx(i,{direction:"column",children:o.exercises.map(s=>e.jsxs("span",{children:[s.name,": ",u(s)," (",Object.values(s.workingSets).map(t=>t.reps).join(","),")"]},s.id))})]},o.id)),r.notes&&e.jsxs(l,{children:["Notes: ",r.notes]})]})]})}function g(){const{data:n,isLoading:r,isError:o}=x();if(r)return e.jsx(d,{children:e.jsx(m,{})});if(o||!n)return e.jsx(d,{children:"Failed to load workout history"});{const s=n.filter(t=>t.completedTimestamp);return e.jsxs(e.Fragment,{children:[e.jsx(h,{order:3,mb:"xs",children:"History"}),e.jsx(i,{gap:"sm",direction:"column",children:s.map(t=>e.jsx(j,{workout:t},t.id))})]})}}export{g as default};
