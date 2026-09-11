import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const dataDir=path.join(path.dirname(root),'data'); fs.mkdirSync(dataDir,{recursive:true});
const dbFile=path.join(dataDir,'players.json');
let players={}; try{players=JSON.parse(fs.readFileSync(dbFile,'utf8'))||{}}catch{}
function save(){fs.writeFileSync(dbFile,JSON.stringify(players,null,2))}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});res.end(JSON.stringify(obj))}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})})}
function safeUser(u){const {password,...x}=u;return x}
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 const url=new URL(req.url,`http://${req.headers.host}`), p=url.pathname;
 try{
  if(p==='/api/health')return send(res,200,{ok:true,game:'The Billionaire',players:Object.keys(players).length});
  if(p==='/api/register'&&req.method==='POST'){const b=await body(req);const username=String(b.username||'').trim();const password=String(b.password||'');if(username.length<3||password.length<6)return send(res,400,{error:'Username must be 3+ characters and password 6+.'});if(players[username])return send(res,409,{error:'Username already exists.'});players[username]={id:crypto.randomUUID(),username,password,cash:25000,gems:120,net:25000,level:1,xp:0,owned:[],country:'Nigeria',staff:0,stocks:{},properties:0,createdAt:new Date().toISOString()};save();return send(res,201,{player:safeUser(players[username])})}
  if(p==='/api/login'&&req.method==='POST'){const b=await body(req);const u=players[String(b.username||'')];if(!u||u.password!==String(b.password||''))return send(res,401,{error:'Invalid username or password.'});return send(res,200,{player:safeUser(u)})}
  if(p==='/api/save'&&req.method==='POST'){const b=await body(req);const username=String(b.username||'');if(!players[username])return send(res,404,{error:'Player not found.'});const allowed=['cash','gems','net','level','xp','owned','country','staff','stocks','properties'];for(const k of allowed)if(b[k]!==undefined)players[username][k]=b[k];players[username].updatedAt=new Date().toISOString();save();return send(res,200,{player:safeUser(players[username])})}
  if(p==='/api/leaderboard'){const list=Object.values(players).map(safeUser).sort((a,b)=>b.net-a.net).slice(0,100).map((x,i)=>({...x,rank:i+1}));return send(res,200,{leaderboard:list})}
  if(p==='/api/player'&&req.method==='GET'){const u=players[url.searchParams.get('username')];if(!u)return send(res,404,{error:'Player not found.'});return send(res,200,{player:safeUser(u)})}
  if(p==='/'||!path.extname(p)){
   const file=path.join(root,'index.html');return fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':'text/html'});res.end(d)})}
  const file=path.join(root,p);if(!file.startsWith(root))return res.writeHead(403).end();fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(d)})
 }catch(e){console.error(e);send(res,500,{error:'Server error'})}
});
const port=process.env.PORT||3000;server.listen(port,()=>console.log(`The Billionaire server running on ${port}`));
