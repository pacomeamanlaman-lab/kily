import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description?: string }[];
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-500 transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted
                    ? "bg-violet-600"
                    : isCurrent
                    ? "bg-violet-600 ring-4 ring-violet-600/30"
                    : "bg-white/10"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-gray-400"}`}>
                    {stepNumber}
                  </span>
                )}
              </div>

              {/* Step label */}
              <div className="text-center">
                <p className={`text-xs font-medium ${isCurrent ? "text-white" : "text-gray-400"}`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[10px] text-gray-500 hidden sm:block">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
