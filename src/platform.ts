// SDK capabilities are deliberately injected, never guessed from undocumented globals.
export interface ToyAdapter {getViewport?:()=>Promise<{width:number;height:number;safeTop?:number;safeBottom?:number}>;loadSave?:()=>Promise<string|null>;writeSave?:(data:string)=>Promise<void>}
export class Platform {
 adapter:ToyAdapter|null=null;
 connect(adapter:ToyAdapter){this.adapter=adapter;void this.viewport();}
 async viewport(){try{const v=await this.adapter?.getViewport?.();if(v){document.documentElement.style.setProperty('--toy-safe-top',`${v.safeTop||0}px`);document.documentElement.style.setProperty('--toy-safe-bottom',`${v.safeBottom||0}px`);}}catch{/* Browser layout remains available. */}}
 async backup(data:string){try{await this.adapter?.writeSave?.(data);}catch{/* Local save is authoritative offline. */}}
}
export const platform=new Platform();
