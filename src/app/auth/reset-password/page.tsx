"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Reset(){
  const sp=useSearchParams();
  const token=sp.get("token")||"";
  const [pw,setPw]=useState("");
  const [pending,setPending]=useState(false);
  const [done,setDone]=useState(false);

  if(!token) return <div className="p-8">不正なリンクです。</div>;

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">新しいパスワード</h1>
      {done ? <p>更新しました。ログインしてください。</p> : (
        <form onSubmit={async e=>{
          e.preventDefault();
          if(pending) return;
          setPending(true);
          try{
            const r=await fetch("/api/auth/reset",{method:"POST",headers:{ "Content-Type":"application/json" },body:JSON.stringify({token,password:pw})});
            if(r.ok) setDone(true);
          } finally {
            setPending(false);
          }
        }}>
          <input type="password" className="border p-2 w-full" value={pw} onChange={e=>setPw(e.target.value)} placeholder="8文字以上推奨"/>
          <button className="mt-3 px-4 py-2 rounded bg-black text-white" disabled={pending}>{pending?"更新中...":"更新"}</button>
        </form>
      )}
    </div>
  );
}
