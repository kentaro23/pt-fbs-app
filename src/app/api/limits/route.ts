import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAthleteUsage } from "@/lib/subscription";

export const runtime = "nodejs";

export async function GET(){ 
  const user=await requireUser(); 
  const usage=await getAthleteUsage(user.id); 
  return NextResponse.json(usage); 
}
