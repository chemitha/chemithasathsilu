"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselPaginationProps {
  totalSteps?: number;
  initialStep?: number;
  onStepChange?: (index: number) => void;
}

export const CarouselPagination: React.FC<CarouselPaginationProps> = ({
  totalSteps = 5,
  initialStep = 2,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Sync internal state if initialStep changes from parent
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const handlePrev = () => {
    const next = currentStep > 0 ? currentStep - 1 : totalSteps - 1;
    setCurrentStep(next);
    onStepChange?.(next);
  };

  const handleNext = () => {
    const next = currentStep < totalSteps - 1 ? currentStep + 1 : 0;
    setCurrentStep(next);
    onStepChange?.(next);
  };

  const handleSelect = (index: number) => {
    setCurrentStep(index);
    onStepChange?.(index);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20] text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Indicator Track */}
      <div className="flex items-center gap-1.5 rounded-full bg-[#18181a] px-2 py-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === currentStep;
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="relative flex h-2.5 items-center justify-center focus:outline-none"
            >
              <motion.div
                initial={false}
                animate={{
                  width: isActive ? 24 : 10,
                  backgroundColor: isActive ? "#ffffff" : "#343438",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="h-2.5 rounded-full"
              />
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20] text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};