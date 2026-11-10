import {el,button} from './components.js';
import {icon} from './icons.js';

export async function openImageViewer(item,gallery,getURL){
 const items=gallery?.length?gallery:[item];let index=Math.max(0,items.findIndex(a=>a.id===item.id)),scale=1,fitScale=1,fitted=true,request=0,swipe=null;
 const opener=document.activeElement,dialog=el('dialog','image-modal image-inspector'),header=el('header','image-toolbar'),name=el('strong','image-title'),counter=el('span','image-counter'),pane=el('div','image-viewport'),canvas=el('div','image-canvas'),image=el('img'),footer=el('div','image-tools');
 function control(label,glyph,fn){const b=button('',fn,'icon-button');b.setAttribute('aria-label',label);b.title=label;b.append(icon(glyph));return b;}
 const close=control('Close screenshot','close',()=>dialog.close()),previous=control('Previous screenshot','back',()=>load(index-1)),next=control('Next screenshot','forward',()=>load(index+1));
 const minus=control('Zoom out','minus',()=>zoom(scale/1.25)),plus=control('Zoom in','plus',()=>zoom(scale*1.25)),fit=button('Fit',()=>fitImage(),'viewer-text-button'),actual=button('100%',()=>zoom(1),'viewer-text-button'),download=el('a','icon-button');download.append(icon('download'));download.setAttribute('aria-label','Save screenshot');download.title='Save screenshot';
 header.append(name,counter,close);footer.append(previous,minus,fit,actual,plus,next,download);canvas.append(image);pane.append(canvas);dialog.append(header,pane,footer);image.draggable=false;
 const fitImage=()=>{fitScale=Math.min(1,(pane.clientWidth-24)/image.naturalWidth,(pane.clientHeight-24)/image.naturalHeight);fitted=true;paint(fitScale);};
 function paint(value){scale=Math.max(.05,Math.min(4,value));image.style.width=`${image.naturalWidth*scale}px`;image.style.height=`${image.naturalHeight*scale}px`;actual.textContent=`${Math.round(scale*100)}%`;fit.setAttribute('aria-pressed',String(fitted));minus.disabled=scale<=.05;plus.disabled=scale>=4;}
 function zoom(value){fitted=false;paint(value);}
 async function load(to){if(to<0||to>=items.length)return;index=to;const token=++request;name.textContent=items[index].name;counter.textContent=items.length>1?`${index+1} / ${items.length}`:'';previous.disabled=index===0;next.disabled=index===items.length-1;dialog.setAttribute('aria-label',`Screenshot: ${items[index].name}`);image.alt=items[index].name;const url=await getURL(items[index]);if(token!==request||!dialog.open)return;image.src=url;download.href=url;download.download=items[index].name;await image.decode().catch(()=>{});if(token===request&&dialog.open&&image.naturalWidth)fitImage();}
 dialog.addEventListener('close',()=>{request++;dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();load(index-1);}if(event.key==='ArrowRight'){event.preventDefault();load(index+1);}if(event.key==='+'||event.key==='='){event.preventDefault();zoom(scale*1.25);}if(event.key==='-'){event.preventDefault();zoom(scale/1.25);}});
 image.addEventListener('dblclick',event=>{event.preventDefault();fitted?zoom(1):fitImage();});
 pane.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&event.isPrimary&&fitted&&items.length>1&&event.clientX>24&&event.clientX<innerWidth-24)swipe={x:event.clientX,y:event.clientY};});
 pane.addEventListener('pointerup',event=>{if(!swipe)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.7)load(index+(dx<0?1:-1));});
 pane.addEventListener('pointercancel',()=>swipe=null);
 const resize=new ResizeObserver(()=>{if(dialog.open&&fitted&&image.naturalWidth)fitImage();});resize.observe(pane);dialog.addEventListener('close',()=>resize.disconnect(),{once:true});
 document.body.append(dialog);dialog.showModal();close.focus();try{await load(index);}catch(error){dialog.close();throw error;}
}
