"use client";
import { useState } from "react";

export default function Forgot(){
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [pending,setPending]=useState(false);
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">パスワード再設定</h1>
      {sent ? <p>メールを送信しました。</p> : (
        <form onSubmit={async e=>{
          e.preventDefault();
          if(pending) return;
          setPending(true);
          try{
            await fetch("/api/auth/forgot",{method:"POST",headers:{ "Content-Type":"application/json" },body:JSON.stringify({email})});
            setSent(true);
          } finally {
            setPending(false);
          }
        }}>
          <input className="border p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          <button className="mt-3 px-4 py-2 rounded bg-black text-white" disabled={pending}>{pending?"送信中...":"送信"}</button>
        </form>
      )}
    </div>
  );
}
