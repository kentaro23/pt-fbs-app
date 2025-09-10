"use client";
import { useEffect, useState } from "react";

type Usage={remaining:number;limit:number;plan:string};
export type LimitGateModalProps={open:boolean;onClose():void;fallback?:Usage};

const PLANS=[
  {key:"FREE",label:"Free",features:["個人/上限小"]},
  {key:"SOLO",label:"Solo",features:["〜15名"]},
  {key:"CLINIC",label:"Clinic",features:["〜100名"]},
  {key:"TEAM",label:"Team",features:["〜500名"]}
];

export function LimitGateModal({open,onClose,fallback}:LimitGateModalProps){
  const [usage,setUsage]=useState<Usage|null>(fallback??null);
  useEffect(()=>{ if(!open) return; (async()=>{
    try{const r=await fetch("/api/limits"); if(r.ok) setUsage(await r.json());}catch{}
  })(); },[open]);
  if(!open) return null;
  const remaining=usage?.remaining??0; const limit=usage?.limit??0; const plan=usage?.plan??"FREE";
  return(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl">
        <h2 className="text-xl font-bold mb-2">上限に達しました</h2>
        <p className="mb-4">現在のプラン：<b>{plan}</b> / 残り：<b>{remaining}</b>（上限 {limit}）</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {PLANS.map(p=>(
            <div key={p.key} className={`rounded-xl border p-3 ${p.key===plan?"border-black":"border-gray-200"}`}>
              <div className="font-semibold">{p.label}</div>
              <ul className="mt-2 text-sm text-gray-600 list-disc pl-4">{p.features.map(f=><li key={f}>{f}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <a href="/billing" className="px-4 py-2 rounded bg-black text-white">アップグレードへ</a>
          <button onClick={onClose} className="px-4 py-2 rounded border">閉じる</button>
        </div>
      </div>
    </div>
  );
}
