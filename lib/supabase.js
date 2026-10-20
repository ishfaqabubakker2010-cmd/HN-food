import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'http://localhost', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'x');
export const CATS=['Karahi','BBQ','Kababs','Handi','Rice & Pulao','Tandoor','Drinks'];
export const DEFAULTS={name:'HN Foods',address:'F6, Plot 19, Agha Khan Road, behind Kaspas Desserts, Sector F-6 Markaz, Islamabad, 04403, Pakistan',phone:'',whatsapp:'',hours:'',instagram:'',facebook:'',hero_url:'',about:'HN Foods serves traditional desi cooking: slow-cooked karahi, charcoal BBQ and tandoor breads, prepared with fresh ingredients.'};
export async function uploadImage(file){
  if(!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if(file.size>5*1024*1024) throw new Error('Image must be under 5 MB.');
  const path=`${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi,'_')}`;
  const {error}=await supabase.storage.from('images').upload(path,file);
  if(error) throw error;
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
}
