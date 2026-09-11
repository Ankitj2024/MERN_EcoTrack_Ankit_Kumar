import React from "react";
import { Check, X } from "lucide-react";
import { evaluatePassword } from "../../utils/passwordValidator";

interface Props {
  password: string;
  showChecklist?: boolean;
}

export const PasswordStrengthMeter: React.FC<Props> = ({ password, showChecklist = true }) => {
  const strength = evaluatePassword(password);

  if (!password) return null;

  const getSegmentColor = (index: number) => {
    if (index > strength.score) return "bg-gray-200 dark:bg-zinc-800";
    if (strength.score === 1) return "bg-red-500";
    if (strength.score === 2) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const checklistItems = [
    { label: "8+ characters", met: strength.criteria.minLength },
    { label: "Uppercase letter (A-Z)", met: strength.criteria.hasUpper },
    { label: "Lowercase letter (a-z)", met: strength.criteria.hasLower },
    { label: "Number (0-9)", met: strength.criteria.hasNumber },
    { label: "Special symbol (!@#$)", met: strength.criteria.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2.5">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-zinc-500 font-medium">Password Strength:</span>
          <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          <div className={`h-full rounded-full transition-colors duration-300 ${getSegmentColor(1)}`} />
          <div className={`h-full rounded-full transition-colors duration-300 ${getSegmentColor(2)}`} />
          <div className={`h-full rounded-full transition-colors duration-300 ${getSegmentColor(3)}`} />
          <div className={`h-full rounded-full transition-colors duration-300 ${getSegmentColor(4)}`} />
        </div>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
              {item.met ? (
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 stroke-[2]" />
                </div>
              )}
              <span className={item.met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500 dark:text-zinc-500"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
