const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{
  if(q.url==='/favicon.ico'){r.writeHead(204);return r.end()}
  r.writeHead(200,{'content-type':'text/html;charset=utf-8'});r.end(fs.readFileSync(path.join(__dirname,'index.html')))});
const wss=new WebSocketServer({server:srv,maxPayload:8192}),rooms={};
const tx=(w,m)=>w&&w.readyState===1&&w.send(JSON.stringify(m));
const lobby=R=>({t:'lobby',started:!!R.s,host:R.host,players:R.p.map(p=>({n:p.n,c:p.c,on:!!p.w}))});
const all=(R,m)=>R.p.forEach(p=>tx(p.w,m));
wss.on('connection',w=>{
  let R,me;
  w.on('message',d=>{
    let m;try{m=JSON.parse(d)}catch{return}
    if(m.t==='join'&&!R){
      const id=String(m.room||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6),n=String(m.name||'').trim().slice(0,12)||'Player';
      if(!id)return;
      const Q=rooms[id]=rooms[id]||{id,p:[],s:null,host:null};
      clearTimeout(Q.k);
      let p=Q.p.find(x=>x.n.toLowerCase()===n.toLowerCase());
      if(!p){
        const live=Q.s&&Q.s.win<0;
        if(live||Q.p.length>=4)return tx(w,{t:'err',m:live?'Game already started':'Room is full'});
        const free=[0,1,2,3].filter(c=>!Q.p.some(x=>x.c===c));
        p={n,c:free.includes(+m.color)?+m.color:free[0]};Q.p.push(p);Q.host=Q.host||n;
      }
      const old=p.w;p.w=w;if(old&&old!==w)old.terminate();
      R=Q;me=p;
      tx(w,{t:'hi',c:p.c,n:p.n,room:id});all(R,lobby(R));if(R.s)tx(w,{t:'state',s:R.s});
      return}
    if(!R)return;
    if(m.t==='start'&&me.n===R.host&&(!R.s||R.s.win>=0)&&R.p.length>1){
      const on=[0,0,0,0];R.p.forEach(p=>on[p.c]=1);
      R.s={on,turn:on.indexOf(1),pos:[0,1,2,3].map(()=>[-1,-1,-1,-1]),dice:0,win:-1,v:0};
      all(R,lobby(R));all(R,{t:'state',s:R.s})}
    else if(m.t==='state'&&R.s&&R.s.win<0&&me.c===R.s.turn&&m.s&&m.s.v===R.s.v+1&&Array.isArray(m.s.pos)){
      R.s=m.s;all(R,{t:'state',s:R.s})}
  });
  w.on('close',()=>{if(!R||me.w!==w)return;me.w=null;all(R,lobby(R));
    if(!R.p.some(p=>p.w))R.k=setTimeout(()=>delete rooms[R.id],6e5)});
});
const PORT=process.env.PORT||3000;
srv.listen(PORT,()=>console.log('Ludo running on port '+PORT));
