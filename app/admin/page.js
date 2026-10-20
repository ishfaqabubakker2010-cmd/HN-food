'use client';
import { useEffect, useState } from 'react';
import { supabase, CATS, DEFAULTS, uploadImage } from '../../lib/supabase';
const blank={name:'',description:'',price:'',category:CATS[0],image_url:'',available:true,popular:false};
export default function Admin(){
  const [user,setUser]=useState(null),[cred,setCred]=useState({email:'',password:''}),[msg,setMsg]=useState('');
  const [s,setS]=useState(DEFAULTS),[items,setItems]=useState([]),[gal,setGal]=useState([]),[f,setF]=useState(blank),[busy,setBusy]=useState(false);
  const load=async()=>{const [a,b,c]=await Promise.all([supabase.from('settings').select('*').eq('id',1).maybeSingle(),supabase.from('menu_items').select('*').order('category').order('name'),supabase.from('gallery').select('*').order('id',{ascending:false})]);
    if(a.data)setS({...DEFAULTS,...Object.fromEntries(Object.entries(a.data).map(([k,v])=>[k,v||'']))});setItems(b.data||[]);setGal(c.data||[])};
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data:l}=supabase.auth.onAuthStateChange((_,x)=>setUser(x?.user||null));return()=>l.subscription.unsubscribe()},[]);
  useEffect(()=>{if(user)load()},[user]);
  const run=async fn=>{setBusy(true);setMsg('');try{await fn();setMsg('Saved ✔');await load()}catch(e){setMsg('Error: '+(e.message||e))}setBusy(false)};
  const login=async e=>{e.preventDefault();const {error}=await supabase.auth.signInWithPassword(cred);setMsg(error?error.message:'')};
  if(!user)return(<main className="mx-auto max-w-sm p-6"><h1 className="mb-4 font-serif text-2xl text-gold">HN Foods Admin</h1><form onSubmit={login} className="space-y-3"><input className="inp" type="email" placeholder="Email" onChange={e=>setCred({...cred,email:e.target.value})}/><input className="inp" type="password" placeholder="Password" onChange={e=>setCred({...cred,password:e.target.value})}/><button className="btn">Log in</button><p className="text-sm text-red-400">{msg}</p></form></main>);
  const img=(cb)=><input type="file" accept="image/*" className="text-sm" onChange={e=>{const x=e.target.files[0];if(x)run(async()=>cb(await uploadImage(x)))}}/>;
  const saveItem=e=>{e.preventDefault();run(async()=>{const row={...f,price:Number(f.price)};const {error}=f.id?await supabase.from('menu_items').update(row).eq('id',f.id):await supabase.from('menu_items').insert(row);if(error)throw error;setF(blank)})};
  const upd=(id,p)=>run(async()=>{const {error}=await supabase.from('menu_items').update(p).eq('id',id);if(error)throw error});
  const fld=(k,l,area)=><label className="block text-sm">{l}{area?<textarea rows={4} className="inp" value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})}/>:<input className="inp" value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})}/>}</label>;
  return(<main className="mx-auto max-w-4xl space-y-10 p-6">
    <div className="flex items-center justify-between"><h1 className="font-serif text-2xl text-gold">HN Foods Admin</h1><span>{busy?'Working…':msg} <button className="btn2 ml-3 text-sm" onClick={()=>supabase.auth.signOut()}>Log out</button> <a className="btn2 text-sm" href="/">View site</a></span></div>
    <section className="space-y-3 rounded-2xl bg-card p-5"><h2 className="text-xl text-gold">Restaurant details</h2>
      {fld('name','Name')}{fld('address','Address')}{fld('phone','Phone')}{fld('whatsapp','WhatsApp number (digits with country code, e.g. 923001234567)')}{fld('hours','Opening hours (one line per day)',true)}{fld('instagram','Instagram URL')}{fld('facebook','Facebook URL')}{fld('about','About text',true)}
      <div>Hero image: {img(u=>setS(x=>({...x,hero_url:u})))} {s.hero_url&&<span className="text-xs text-gold">uploaded — click Save</span>}</div>
      <button className="btn" onClick={()=>run(async()=>{const {error}=await supabase.from('settings').upsert({...s,id:1});if(error)throw error})}>Save details</button></section>
    <section className="rounded-2xl bg-card p-5"><h2 className="mb-3 text-xl text-gold">{f.id?'Edit dish':'Add dish'}</h2>
      <form onSubmit={saveItem} className="grid gap-3 md:grid-cols-2"><input required className="inp" placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><input required type="number" min="0" className="inp" placeholder="Price (PKR)" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/>
      <select className="inp" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
      <input className="inp" placeholder="Description" value={f.description||''} onChange={e=>setF({...f,description:e.target.value})}/>
      <div>Image: {img(u=>setF(x=>({...x,image_url:u})))} {f.image_url&&<img src={f.image_url} alt="" className="mt-2 h-16 rounded"/>}</div>
      <div className="space-x-4"><label><input type="checkbox" checked={f.available} onChange={e=>setF({...f,available:e.target.checked})}/> Available</label><label><input type="checkbox" checked={f.popular} onChange={e=>setF({...f,popular:e.target.checked})}/> Popular</label></div>
      <div className="space-x-2"><button className="btn" disabled={busy}>{f.id?'Update':'Add'} dish</button>{f.id&&<button type="button" className="btn2" onClick={()=>setF(blank)}>Cancel</button>}</div></form></section>
    <section className="rounded-2xl bg-card p-5"><h2 className="mb-3 text-xl text-gold">Menu items ({items.length})</h2>{items.map(i=><div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 py-2 text-sm"><span>{i.name} <span className="text-cream/50">· {i.category} · PKR {i.price}</span></span><span className="space-x-2"><button className="btn2 !py-0.5 text-xs" onClick={()=>upd(i.id,{available:!i.available})}>{i.available?'Available':'Hidden'}</button><button className="btn2 !py-0.5 text-xs" onClick={()=>upd(i.id,{popular:!i.popular})}>{i.popular?'★ Popular':'☆ Popular'}</button><button className="btn2 !py-0.5 text-xs" onClick={()=>{setF(i);scrollTo(0,500)}}>Edit</button><button className="btn2 !py-0.5 text-xs" onClick={()=>confirm('Delete '+i.name+'?')&&run(async()=>{const {error}=await supabase.from('menu_items').delete().eq('id',i.id);if(error)throw error})}>Delete</button></span></div>)}</section>
    <section className="rounded-2xl bg-card p-5"><h2 className="mb-3 text-xl text-gold">Gallery</h2>{img(u=>supabase.from('gallery').insert({image_url:u}).then(({error})=>{if(error)throw error}))}
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">{gal.map(g=><div key={g.id}><img src={g.image_url} alt="" className="aspect-square w-full rounded object-cover"/><button className="btn2 mt-1 !py-0 text-xs" onClick={()=>run(async()=>{const {error}=await supabase.from('gallery').delete().eq('id',g.id);if(error)throw error})}>Remove</button></div>)}</div></section></main>);
}
