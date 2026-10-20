import { lazy } from "react";

// Feature apps are code-split and mounted under their existing public URLs.
export const MockExams = lazy(() => import("@/features/mock-exams"));
export const CausalitySurvey = lazy(() => import("@/features/causality-survey"));
export const HousePrices = lazy(() => import("@/features/house-prices"));
export const FeedbackPulse = lazy(() => import("@/features/feedback-pulse"));
