const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'skillhub.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}'); } catch { return {}; }
}
function writeDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8'); }
function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function getPath(obj, key) { return key.split('.').reduce((v, k) => v == null ? undefined : v[k], obj); }
function setPath(obj, key, value) {
  const parts = key.split('.'); let cur = obj;
  parts.slice(0,-1).forEach(k => { if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; });
  cur[parts[parts.length-1]] = value;
}
function eq(a,b) { return String(a) === String(b); }
function matches(doc, filter={}) {
  if (!filter || !Object.keys(filter).length) return true;
  if (filter.$or && !filter.$or.some(f => matches(doc,f))) return false;
  if (filter.$and && !filter.$and.every(f => matches(doc,f))) return false;
  for (const [key, cond] of Object.entries(filter)) {
    if (key.startsWith('$')) continue;
    const val = getPath(doc,key);
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$regex' in cond) {
        const re = new RegExp(cond.$regex, cond.$options || '');
        if (Array.isArray(val) ? !val.some(x => re.test(String(x))) : !re.test(String(val ?? ''))) return false;
      } else if ('$gte' in cond || '$lte' in cond || '$gt' in cond || '$lt' in cond) {
        if ('$gte' in cond && !(val >= cond.$gte)) return false;
        if ('$lte' in cond && !(val <= cond.$lte)) return false;
        if ('$gt' in cond && !(val > cond.$gt)) return false;
        if ('$lt' in cond && !(val < cond.$lt)) return false;
      } else if ('$in' in cond) {
        if (!cond.$in.some(x => Array.isArray(val) ? val.some(y=>eq(y,x)) : eq(val,x))) return false;
      } else if ('$ne' in cond) { if (eq(val,cond.$ne)) return false; }
      else if ('$exists' in cond) { if ((val !== undefined) !== cond.$exists) return false; }
      else if (!eq(val,cond)) return false;
    } else if (Array.isArray(val)) {
      if (!val.some(x => eq(x,cond))) return false;
    } else if (!eq(val,cond)) return false;
  }
  if (filter.$text) {
    const q = String(filter.$text.$search || '').toLowerCase();
    const hay = ['title','description','skills','instructor'].map(k=>getPath(doc,k)).flat().join(' ').toLowerCase();
    if (!q.split(/\s+/).every(w=>hay.includes(w))) return false;
  }
  return true;
}
function project(doc, spec) {
  if (!spec) return doc;
  const keys = Object.keys(spec);
  const excludes = keys.filter(k => spec[k] === 0 || spec[k] === false || spec[k] === '-passwordHash');
  const includes = keys.filter(k => spec[k] === 1 || spec[k] === true || typeof spec[k] === 'string');
  if (keys.some(k => spec[k] && typeof spec[k] === 'object')) { return clone(doc); }
  if (includes.length && !excludes.length) {
    const out = {};
    if (doc._id != null) out._id = doc._id;
    for (const k of includes) { const v=getPath(doc,k); if(v!==undefined) setPath(out,k,v); }
    return out;
  }
  const out = clone(doc);
  excludes.forEach(k => { const parts=k.split('.'); let cur=out; for(let i=0;i<parts.length-1;i++){if(!cur)break;cur=cur[parts[i]];} if(cur) delete cur[parts.at(-1)]; });
  return out;
}

const refs = {
  Course: { category: ['Category','one'] },
  User: { savedCourses: ['Course','many'] },
  LearningProgress: { course: ['Course','one'] },
  Certificate: { relatedCourse: ['Course','one'] },
  Resume: { user: ['User','one'] },
};

class Query {
  constructor(model, docs, single=false) { this.model=model; this.docs=docs; this.single=single; this.ops=[]; }
  sort(spec){ this.ops.push(['sort',spec]); return this; }
  skip(n){ this.ops.push(['skip',Number(n)||0]); return this; }
  limit(n){ this.ops.push(['limit',Number(n)||0]); return this; }
  select(spec){ this.ops.push(['select',spec]); return this; }
  populate(pathOrOpts, select){ this.ops.push(['populate',pathOrOpts,select]); return this; }
  lean(){ this.ops.push(['lean']); return this; }
  async exec(){
    let docs=this.docs.map(d=>clone(d));
    for(const op of this.ops){
      if(op[0]==='sort') docs.sort(makeComparator(op[1]));
      if(op[0]==='skip') docs=docs.slice(op[1]);
      if(op[0]==='limit') docs=docs.slice(0,op[1]);
      if(op[0]==='select') docs=docs.map(d=>project(d,op[1]));
      if(op[0]==='populate') docs=docs.map(d=>this.model._populate(d,op[1],op[2]));
    }
    docs=docs.map(d=>this.model._attach(d));
    return this.single ? (docs[0] || null) : docs;
  }
  then(resolve,reject){ return this.exec().then(resolve,reject); }
  catch(reject){ return this.exec().catch(reject); }
}
function makeComparator(spec){
  return (a,b)=>{ for(const [k,dir] of Object.entries(spec||{})){ let av=getPath(a,k), bv=getPath(b,k); if(av instanceof Date)av=av.getTime(); if(bv instanceof Date)bv=bv.getTime(); if(k==='score' && av===undefined) av=0; if(k==='score' && bv===undefined) bv=0; if(av==null)av=''; if(bv==null)bv=''; if(av<bv)return -1*dir; if(av>bv)return 1*dir; } return 0; };
}

class JsonModel {
  constructor(name){ this.name=name; }
  _db(){ const db=readDB(); db[this.name] ||= []; return db; }
  _save(db){ writeDB(db); }
  _attach(doc){ if(!doc)return doc; const model=this; Object.defineProperty(doc,'save',{enumerable:false, value:async function(){
      const db=model._db(); const arr=db[model.name]||[]; const idx=arr.findIndex(x=>eq(x._id,this._id));
      if(idx<0) throw new Error('Document not found'); const clean=clone(this); model._normalizeRefs(clean); arr[idx]=clean; model._save(db); return model._attach(clean);
    }}); return doc; }
  _normalizeRefs(doc){
    const map=refs[this.name]||{}; for(const [field,[target,type]] of Object.entries(map)){ const v=doc[field]; if(type==='one'&&v&&typeof v==='object')doc[field]=v._id; if(type==='many'&&Array.isArray(v))doc[field]=v.map(x=>x&&typeof x==='object'?x._id:x); }
  }
  _populate(doc, pathOrOpts, select){
    const opts=typeof pathOrOpts==='string'?{path:pathOrOpts,select}:pathOrOpts||{}; const pathName=opts.path; const ref=(refs[this.name]||{})[pathName]; if(!ref)return doc;
    let targetModel=registry[ref[0]]; if(!targetModel){ try { targetModel=require('./'+ref[0]); } catch {} } if(!targetModel)return doc; const raw=getPath(doc,pathName);
    if(ref[1]==='many') setPath(doc,pathName,(raw||[]).map(id=>{const x=targetModel._rawById(id); return x?project(x,opts.select):null;}).filter(Boolean));
    else { const x=targetModel._rawById(raw); if(x){ let p=project(x,opts.select); if(opts.populate) p=targetModel._populate(p,opts.populate.path||opts.populate,opts.populate.select); setPath(doc,pathName,p); } }
    return doc;
  }
  _rawById(id){ return (this._db()[this.name]||[]).find(x=>eq(x._id,id)); }
  find(filter={}, projection){ return new Query(this,(this._db()[this.name]||[]).filter(d=>matches(d,filter)).map(d=>projection?project(d,projection):d)); }
  findOne(filter={}){ return new Query(this,(this._db()[this.name]||[]).filter(d=>matches(d,filter)).slice(0,1),true); }
  findById(id){ return this.findOne({_id:id}); }
  async create(data){ const db=this._db(); const now=new Date().toISOString(); const doc=this._prepare({...clone(data),_id: data._id || crypto.randomUUID(),createdAt:data.createdAt||now,updatedAt:now}); db[this.name].push(doc); this._save(db); return this._attach(clone(doc)); }
  async insertMany(items){ const out=[]; for(const item of items)out.push(await this.create(item)); return out; }
  async deleteMany(filter={}){ const db=this._db(); const before=db[this.name].length; db[this.name]=db[this.name].filter(d=>!matches(d,filter)); this._save(db); return {deletedCount:before-db[this.name].length}; }
  async countDocuments(filter={}){ return (this._db()[this.name]||[]).filter(d=>matches(d,filter)).length; }
  async findByIdAndUpdate(id, update, options={}){ return this._update({_id:id},update,options); }
  async findOneAndUpdate(filter, update, options={}){ return this._update(filter,update,options); }
  async findOneAndDelete(filter){ const db=this._db(); const idx=db[this.name].findIndex(d=>matches(d,filter)); if(idx<0)return null; const old=db[this.name].splice(idx,1)[0]; this._save(db); return this._attach(clone(old)); }
  async _update(filter, update, options={}){
    const db=this._db(); let idx=db[this.name].findIndex(d=>matches(d,filter)); let inserted=false;
    if(idx<0){ if(!options.upsert)return null; const base={}; Object.entries(filter).forEach(([k,v])=>{if(!k.startsWith('$')&&!(v&&typeof v==='object'))setPath(base,k,v);}); const u=clone(update)||{}; Object.assign(base,u.$setOnInsert||{},u.$set||{}); idx=db[this.name].length; db[this.name].push(this._prepare({...base,_id:crypto.randomUUID()})); inserted=true; }
    const doc=db[this.name][idx]; const u=clone(update)||{};
    if(u.$setOnInsert&&!inserted)delete u.$setOnInsert;
    if(u.$set)Object.assign(doc,u.$set); delete u.$set;
    if(u.$inc){for(const[k,v]of Object.entries(u.$inc))setPath(doc,k,(Number(getPath(doc,k))||0)+v);delete u.$inc;}
    if(u.$unset){for(const k of Object.keys(u.$unset))setPath(doc,k,undefined);delete u.$unset;}
    Object.assign(doc,u); this._prepare(doc); doc.updatedAt=new Date().toISOString(); this._normalizeRefs(doc); this._save(db); return this._attach(clone(doc));
  }
  async aggregate(pipeline){
    let docs=clone(this._db()[this.name]||[]);
    for(const stage of pipeline){
      if(stage.$match)docs=docs.filter(d=>matches(d,stage.$match));
      if(stage.$group){const g=stage.$group;const map=new Map();for(const d of docs){const id=g._id==null?null:getPath(d,String(g._id).replace(/^\$/,''));if(!map.has(String(id)))map.set(String(id),{_id:id});const o=map.get(String(id));for(const[k,v]of Object.entries(g)){if(k==='_id')continue;if(v.$sum!==undefined)o[k]=(o[k]||0)+Number(v.$sum===1?1:getPath(d,String(v.$sum).replace(/^\$/,''))||0);}}docs=[...map.values()];}
      if(stage.$lookup){const l=stage.$lookup;const tm=registryByCollection(l.from);docs=docs.map(d=>({...d,[l.as]:tm?tm._rawFind({[l.foreignField]:getPath(d,l.localField)}):[]}));}
      if(stage.$unwind){const p=typeof stage.$unwind==='string'?stage.$unwind:stage.$unwind.path;const key=p.replace(/^\$/,'');const preserve=typeof stage.$unwind==='object'&&stage.$unwind.preserveNullAndEmptyArrays;const out=[];for(const d of docs){const a=getPath(d,key);if(Array.isArray(a)&&a.length)a.forEach(x=>{const n=clone(d);setPath(n,key,x);out.push(n);});else if(preserve)out.push(d);}docs=out;}
      if(stage.$project){docs=docs.map(d=>{const o={};for(const[k,v]of Object.entries(stage.$project)){if(v===1)o[k]=d[k];else if(typeof v==='string'&&v.startsWith('$'))o[k]=getPath(d,v.slice(1));}if(d._id!==undefined&&!('_id'in o)&&stage.$project._id!==0)o._id=d._id;return o;});}
    } return docs;
  }
  _rawFind(filter){return (this._db()[this.name]||[]).filter(d=>matches(d,filter));}
  _prepare(doc){ return doc; }
}
const registry={}; function register(model){registry[model.name]=model;return model;} function registryByCollection(name){const map={categories:'Category',courses:'Course',users:'User',certificates:'Certificate',learningprogresses:'LearningProgress',resumes:'Resume'};return registry[map[name]];}
module.exports={JsonModel,register,readDB,writeDB,DATA_DIR,DB_FILE,getPath,setPath,clone};
