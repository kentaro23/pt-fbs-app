"use client";

import { useState } from "react";
import { AssessmentForm, type AssessmentFormValues } from "@/components/forms/AssessmentForm";
import { createAssessmentAction } from "@/lib/actions";

export default function AssessmentClient({ athleteId, athleteName }: { athleteId?: string; athleteName?: string }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: AssessmentFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await createAssessmentAction(values, athleteId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {athleteId && (
        <div className="mb-3 text-sm text-slate-700">
          対象選手: <span className="font-semibold">{athleteName ?? `ID: ${athleteId}`}</span>
        </div>
      )}
      <AssessmentForm defaultValues={{}} onSubmit={handleSubmit} />
    </div>
  );
}
