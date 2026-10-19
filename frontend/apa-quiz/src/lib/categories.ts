import type { Category } from "@/types"

export const CATEGORIES: Category[] = [
  "Foundations",
  "Perceptron",
  "MLP",
  "Training",
  "CNN",
  "Architectures",
  "RNN",
  "Attention",
  "NLP",
  "Prompting",
]

export const CATEGORY_LABELS: Record<Category, string> = {
  Foundations: "Foundations",
  Perceptron: "Perceptron",
  MLP: "MLP & Backprop",
  Training: "Training",
  CNN: "CNNs",
  Architectures: "CNN Architectures",
  RNN: "RNN / LSTM",
  Attention: "Attention",
  NLP: "NLP / Embeddings",
  Prompting: "Prompting / LLMs",
}
