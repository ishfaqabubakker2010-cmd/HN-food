'use client';
import { useEffect, useState } from 'react';
import { supabase, CATS, DEFAULTS } from '../lib/supabase';
const bgi=(u,o=.85)=>({backgroundImage:`linear-gradient(rgba(20,20,20,${o}),rgba(20,20,20,${o})),url(${u})`,backgroundSize:'cover',backgroundPosition:'center'});
const PHOTOS=[['/images/hero.jpg','HN Foods restaurant at night'],['/images/interior.jpg','HN Foods dining area'],['/images/platter.jpg','Roasted meat on rice platter'],['/images/halwapuri.jpg','Halwa puri with chana'],['/images/kabab.png','Seekh kababs']];
const digits=s=>(s||'').replace(/\D/g,'');
export default function Home(){
  const [s,setS]=useState(DEFAULTS),[items,setItems]=useState([]),[gal,setGal]=useState([]),[loading,setLoading]=useState(true);
  const [cat,setCat]=useState('All'),[q,setQ]=useState(''),[cart,setCart]=useState({}),[open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'',phone:'',message:''}),[sent,setSent]=useState('');
  useEffect(()=>{(async()=>{
    const [a,b,c]=await Promise.all([supabase.from('settings').select('*').eq('id',1).maybeSingle(),supabase.from('menu_items').select('*').order('name'),supabase.from('gallery').select('*').order('id',{ascending:false})]);
    if(a.data) setS({...DEFAULTS,...Object.fromEntries(Object.entries(a.data).filter(([,v])=>v))});
    setItems(b.data||[]);setGal(c.data||[]);setLoading(false);})()},[]);
  const shown=items.filter(i=>i.available&&(cat==='All'||i.category===cat)&&((i.name||'')+(i.description||'')).toLowerCase().includes(q.toLowerCase()));
  const add=(id,d=1)=>setCart(c=>{const n=Math.max(0,(c[id]||0)+d);const x={...c,[id]:n};if(!n)delete x[id];return x});
  const lines=Object.entries(cart).map(([id,n])=>({i:items.find(x=>x.id==id),n})).filter(l=>l.i);
  const total=lines.reduce((t,l)=>t+l.i.price*l.n,0);
  const waMsg=`Hello ${s.name}, I would like to order:\n`+lines.map(l=>`• ${l.n} x ${l.i.name} — PKR ${l.i.price*l.n}`).join('\n')+`\nEstimated total: PKR ${total}`;
  const wa=digits(s.whatsapp)?`https://wa.me/${digits(s.whatsapp)}?text=${encodeURIComponent(waMsg)}`:null;
  const mapQ=encodeURIComponent(s.address);
  const send=async e=>{e.preventDefault();setSent('...');const {error}=await supabase.from('messages').insert(form);setSent(error?'Could not send. Please try again.':'Thank you! We will get back to you.');if(!error)setForm({name:'',phone:'',message:''})};
  const Card=({i})=>(<div className="overflow-hidden rounded-2xl bg-card">
    {i.image_url?<img src={i.image_url} alt={i.name} loading="lazy" className="h-44 w-full object-cover"/>:<div className="h-44 bg-gradient-to-br from-ember/40 to-gold/20"/>}
    <div className="p-4"><div className="flex justify-between gap-2"><h3 className="font-serif text-lg">{i.name}</h3><span className="text-gold">PKR {i.price}</span></div>
    <p className="mt-1 text-sm text-cream/70">{i.description}</p><button onClick={()=>add(i.id)} className="btn mt-3 text-sm">Add to order</button></div></div>);
  const nav=['Home','Menu','About','Gallery','Location','Contact'];
  return(<main>
  <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="#home" aria-label={s.name}><img src="/logo.png" alt={s.name} className="h-11 w-auto"/></a>
    <nav className="hidden gap-6 md:flex">{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} className="hover:text-gold">{n==='About'?'About Us':n}</a>)}</nav>
    <div className="flex items-center gap-2"><a href="#order" className="btn text-sm">Order Now</a><button aria-label="Menu" onClick={()=>setOpen(!open)} className="text-2xl md:hidden">☰</button></div></div>
    {open&&<div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 md:hidden">{nav.map(n=><a key={n} onClick={()=>setOpen(false)} href={`#${n.toLowerCase()}`}>{n}</a>)}</div>}</header>
  <section id="home" className="relative flex min-h-[80vh] items-center justify-center bg-cover bg-center px-4 text-center" style={bgi(s.hero_url||'/images/hero.jpg',.62)}>
    <div className="max-w-2xl"><h1 className="font-serif text-4xl text-cream md:text-6xl">Authentic Taste. <span className="text-gold">Unforgettable Flavour.</span></h1>
    <p className="mt-4 text-cream/80">{s.about}</p><div className="mt-6 flex justify-center gap-3"><a href="#menu" className="btn">Explore Menu</a><a href="#order" className="btn2">Order Now</a></div></div></section>
  <section style={bgi('/images/platter.jpg',.9)}><div className="mx-auto max-w-6xl px-4 py-16"><h2 className="mb-6 font-serif text-3xl text-gold">Popular Dishes</h2>
    {loading?<p>Loading…</p>:items.filter(i=>i.popular&&i.available).length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.filter(i=>i.popular&&i.available).map(i=><Card key={i.id} i={i}/>)}</div>:<p className="text-cream/60">Popular dishes will appear here once added from the admin dashboard.</p>}</div></section>
  <section id="menu" className="mx-auto max-w-6xl px-4 py-16"><div className="mb-6 flex items-center justify-between"><h2 className="font-serif text-3xl text-gold">Our Menu</h2><img src="/images/kabab.png" alt="Seekh kababs" className="h-24 w-auto"/></div>
    <input className="inp mb-4" placeholder="Search dishes…" value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="mb-6 flex flex-wrap gap-2">{['All',...CATS].map(c=><button key={c} onClick={()=>setCat(c)} className={c===cat?'btn text-sm':'btn2 text-sm'}>{c}</button>)}</div>
    {shown.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map(i=><Card key={i.id} i={i}/>)}</div>:<p className="text-cream/60">{loading?'Loading…':'No dishes found.'}</p>}</section>
  <section id="order" className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-2xl bg-card p-6"><h2 className="font-serif text-2xl text-gold">Your Order</h2>
    {lines.length?<>{lines.map(l=><div key={l.i.id} className="mt-3 flex items-center justify-between"><span>{l.i.name}</span><span className="flex items-center gap-3"><button onClick={()=>add(l.i.id,-1)} className="btn2 !px-3 !py-0">−</button>{l.n}<button onClick={()=>add(l.i.id)} className="btn2 !px-3 !py-0">+</button><b className="w-24 text-right text-gold">PKR {l.i.price*l.n}</b></span></div>)}
    <p className="mt-4 text-right text-lg">Estimated total: <b className="text-gold">PKR {total}</b></p>
    {wa?<a href={wa} target="_blank" rel="noreferrer" className="btn mt-4">Send order on WhatsApp</a>:<p className="mt-4 text-sm text-cream/60">WhatsApp ordering will be available once the restaurant adds its WhatsApp number.</p>}</>:<p className="mt-2 text-cream/60">Add dishes from the menu to prepare your order.</p>}
    <p className="mt-4 text-xs text-cream/50">Orders are not final until confirmed by the restaurant. Prices are estimates.</p></div></section>
  <section id="about" style={bgi('/images/interior.jpg',.8)}><div className="mx-auto max-w-3xl px-4 py-24 text-center"><h2 className="font-serif text-3xl text-gold">About Us</h2><p className="mt-4 text-cream/90">{s.about}</p></div></section>
  <section id="gallery" className="mx-auto max-w-6xl px-4 py-16"><h2 className="mb-6 font-serif text-3xl text-gold">Gallery</h2>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[...gal.map(g=>[g.image_url,g.caption||'HN Foods']),...PHOTOS.slice(1)].map(([u,c],n)=><img key={n} src={u} alt={c} loading="lazy" className="aspect-square w-full rounded-xl bg-card object-cover"/>)}</div></section>
  <section id="location" className="mx-auto max-w-6xl px-4 py-16"><h2 className="mb-6 font-serif text-3xl text-gold">Find Us</h2><div className="grid gap-6 md:grid-cols-2">
    <div className="rounded-2xl bg-card p-6"><p>{s.address}</p><h3 className="mt-5 text-gold">Opening Hours</h3><p className="whitespace-pre-line text-cream/80">{s.hours||'Opening hours will be updated soon.'}</p>
    <a className="btn mt-5" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}>Get Directions</a></div>
    <iframe title="Map" loading="lazy" className="h-72 w-full rounded-2xl border-0" src={`https://www.google.com/maps?q=${mapQ}&output=embed`}/></div></section>
  <section id="contact" style={bgi('/images/halwapuri.jpg',.9)}><div className="mx-auto max-w-3xl px-4 py-16"><h2 className="mb-6 font-serif text-3xl text-gold">Contact</h2>
    <p className="mb-4 text-cream/80">{s.phone?<>Phone: <a className="text-gold" href={`tel:${s.phone}`}>{s.phone}</a></>:'Phone number coming soon.'} {digits(s.whatsapp)&&<a className="btn2 ml-3 text-sm" href={`https://wa.me/${digits(s.whatsapp)}`}>WhatsApp</a>}</p>
    <form onSubmit={send} className="space-y-3"><input required className="inp" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="inp" placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><textarea required rows={4} className="inp" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><button className="btn">Send</button> <span className="text-sm">{sent}</span></form></div></section>
  <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-cream/60"><img src="/logo-full.png" alt={s.name} className="mx-auto h-16 w-auto"/><p className="mt-2">{s.address}</p>
    <p className="mt-2 space-x-4">{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`}>{n}</a>)}{s.instagram&&<a href={s.instagram}>Instagram</a>}{s.facebook&&<a href={s.facebook}>Facebook</a>}</p><p className="mt-3">© {new Date().getFullYear()} {s.name}. All rights reserved.</p></footer></main>);
}
