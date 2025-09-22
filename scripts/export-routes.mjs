import routes from '../src/routes.js'; // adjust if different
const flatten = (rs, base='') => rs.flatMap(r=>{
  const path=(base+'/'+(r.path||'')).replace(/\/+/g,'/');
  const node={path,name:r.name||null,role:r.role||null};
  return r.children?[node,...flatten(r.children,path)]:[node];
});
console.log(JSON.stringify({generatedAt:new Date().toISOString(),routes:flatten(routes)},null,2));
