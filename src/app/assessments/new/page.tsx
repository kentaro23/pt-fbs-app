"use client";

import { AssessmentForm, type AssessmentFormValues } from "@/components/forms/AssessmentForm";
import { createAssessmentAction } from "@/lib/actions";
import { useState, useEffect } from "react";

export default function NewAssessmentPage({ searchParams }: { searchParams: Promise<{ athleteId?: string }> }) {
  const [athleteId, setAthleteId] = useState<string | undefined>();

  useEffect(() => {
    const getSearchParams = async () => {
      const params = await searchParams;
      setAthleteId(params.athleteId);
    };
    getSearchParams();
  }, [searchParams]);

  const handleSubmit = async (values: AssessmentFormValues) => {
    try {
      await createAssessmentAction(values, athleteId);
    } catch (error) {
      console.error('Error creating assessment:', error);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">測定データ入力</h1>
      <AssessmentForm
        defaultValues={{}}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
