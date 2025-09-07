"use client";

import { motion } from "framer-motion";
import { BookOpen, Activity, FileChartColumn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Left: Hero */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-black/70 shadow-sm backdrop-blur">
            FBS App · 理学療法士のための評価 UI
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            直感的で美しいデザインで、<br className="hidden sm:block" />
            測定から <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">FBS</span> まで一気に。
          </h1>
          <p className="mt-4 max-w-prose text-base leading-7 text-black/70">
            選手の基本情報・可動域測定を入力して、個別のフィードバックシート（FBS）へ。モバイル最適化＆PDF出力にも対応。
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/auth/login"><Button size="lg" className="rounded-2xl px-6 text-black bg-black/0 border border-black hover:bg-black hover:text-white">ログイン</Button></Link>
            <Link href="/auth/register"><Button size="lg" variant="outline" className="rounded-2xl px-6">新規登録</Button></Link>
            <Link href="/athletes" className="group inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm text-black/70 hover:text-black">
              またはゲスト閲覧 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Right: Glass card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
          <Card className="border-black/10 bg-white/60 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">使い方</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-black/70">
              <p>1) 選手を作成 → 2) 測定データを入力 → 3) FBSを自動生成</p>
              <p className="text-xs">選手詳細ページから各アセスメントのFBSへ移動できます。</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feature grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/athletes">
          <Card className="group h-full border-black/10 bg-white/70 transition hover:shadow-lg backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><BookOpen /></div>
              <CardTitle>選手管理</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">選手一覧の確認と新規登録。</CardContent>
          </Card>
        </Link>

        <Link href="/assessments/new">
          <Card className="group h-full border-black/10 bg-white/70 transition hover:shadow-lg backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><Activity /></div>
              <CardTitle>測定入力</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">可動域を左右別で入力。体組成・除脂肪指数も。</CardContent>
          </Card>
        </Link>

        <Link href="/athletes">
          <Card className="group h-full border-black/10 bg-white/70 transition hover:shadow-lg backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600"><FileChartColumn /></div>
              <CardTitle>FBSレポート</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">選手詳細から各アセスメントのFBSへ。</CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}


