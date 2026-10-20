import { describe, it, expect } from "vitest"
import { CATEGORIES } from "@/features/mock-exams/lib/categories"
import { MC_GENERATORS, NUMERIC_GENERATORS } from "@/features/mock-exams/lib/generators"

const num = (s: string) => Number(s.replace(/\$/g, "").trim())

describe("MC generators", () => {
  it("each produces a valid 4-option MC with distinct options", () => {
    for (const g of MC_GENERATORS) {
      for (let i = 0; i < 40; i++) {
        const q = g.generate()
        expect(q.type).toBe("mc")
        expect(q.calculation).toBe(true)
        expect(q.generated).toBe(true)
        expect(CATEGORIES).toContain(q.category)
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(4)
        expect(q.question.trim().length).toBeGreaterThan(0)
        expect(q.explanation.trim().length).toBeGreaterThan(0)
        expect(q.id.startsWith(g.templateId)).toBe(true)
      }
    }
  })

  it("Conv2D-params: the marked answer equals an independent recomputation", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-conv-params")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/uses (\d+)x\d+ kernels, (\d+) input channel.*?, (\d+) output filters/)!
      const [k, cin, cout] = [Number(m[1]), Number(m[2]), Number(m[3])]
      expect(num(q.options[q.correctIndex])).toBe(k * k * cin * cout + cout)
    }
  })

  it("steps-per-epoch: the marked answer equals ceil(N/B)", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-steps-epoch")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/With ([\d,]+) training examples and batch size (\d+)/)!
      const n = Number(m[1].replace(/,/g, ""))
      const b = Number(m[2])
      expect(num(q.options[q.correctIndex])).toBe(Math.ceil(n / b))
    }
  })

  it("dense-params: marked answer matches in*out (+out with bias)", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-dense-params")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/maps (\d+) inputs to (\d+) units (with|without) a bias/)!
      const inp = Number(m[1]), out = Number(m[2]), bias = m[3] === "with"
      expect(num(q.options[q.correctIndex])).toBe(inp * out + (bias ? out : 0))
    }
  })

  it("cnn-budget: marked answer matches the 3-stage spatial computation", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-cnn-budget")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const w = Number(q.question.match(/Input (\d+)×/)![1])
      const expected = Math.floor((w - 2) / 2) - 2
      expect(num(q.options[q.correctIndex])).toBe(expected)
    }
  })

  it("attn-weight: marked answer matches the scaled softmax weight", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-attn-weight")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/\[(\d+), (\d+)\]\$ with \$d_k=(\d+)\$/)!
      const s1 = Number(m[1]), s2 = Number(m[2]), dk = Number(m[3])
      const sq = Math.sqrt(dk)
      const expected = Math.round((Math.exp(s1 / sq) / (Math.exp(s1 / sq) + Math.exp(s2 / sq))) * 1000) / 1000
      expect(num(q.options[q.correctIndex])).toBeCloseTo(expected, 3)
    }
  })

  // The generators round their answer to a fixed number of decimals; recompute
  // with the SAME rounding so the comparison never lands on a tolerance edge.
  const r = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp

  it("rnn-forward: marked answer matches tanh(w_hh*h + w_xh*x + b)", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-rnn-forward")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(
        /w_\{hh\}=(-?[\d.]+)\$, \$h_\{t-1\}=(-?[\d.]+)\$, \$w_\{xh\}=(-?[\d.]+)\$, \$x_t=(-?[\d.]+)\$, \$b=(-?[\d.]+)\$/
      )!
      const [whh, hprev, wxh, x, b] = m.slice(1, 6).map(Number)
      expect(num(q.options[q.correctIndex])).toBeCloseTo(r(Math.tanh(whh * hprev + wxh * x + b), 3), 6)
    }
  })

  it("rnn-grad: marked answer matches w_hh^T", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-rnn-grad")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/w_\{hh\}=(-?[\d.]+)\$ and \$T=(\d+)\$/)!
      const w = Number(m[1]), t = Number(m[2])
      expect(num(q.options[q.correctIndex])).toBeCloseTo(r(w ** t, 4), 6)
    }
  })

  it("attn-score: marked answer matches (q·k)/sqrt(d_k)", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-attn-score")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/q=\[([-\d, ]+)\]\$, \$k=\[([-\d, ]+)\]\$, and \$d_k=(\d+)\$/)!
      const qv = m[1].split(",").map((s) => Number(s.trim()))
      const kv = m[2].split(",").map((s) => Number(s.trim()))
      const dk = Number(m[3])
      const dot = qv.reduce((s, qi, idx) => s + qi * kv[idx], 0)
      expect(num(q.options[q.correctIndex])).toBeCloseTo(r(dot / Math.sqrt(dk), 3), 6)
    }
  })

  it("bce-loss: marked answer matches -ln(p_true)", () => {
    const g = MC_GENERATORS.find((x) => x.templateId === "gen-bce-loss")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/y=(\d)\$ and predicted probability \$p=([\d.]+)\$/)!
      const y = Number(m[1]), p = Number(m[2])
      const pt = y === 1 ? p : 1 - p
      expect(num(q.options[q.correctIndex])).toBeCloseTo(r(-Math.log(pt), 3), 6)
    }
  })
})

describe("Numeric generators", () => {
  it("each produces a valid numeric question", () => {
    for (const g of NUMERIC_GENERATORS) {
      for (let i = 0; i < 40; i++) {
        const q = g.generate()
        expect(q.type).toBe("numeric")
        expect(q.calculation).toBe(true)
        expect(CATEGORIES).toContain(q.category)
        expect(Number.isFinite(q.answer)).toBe(true)
        expect(q.tolerance).toBeGreaterThan(0)
        expect(q.question.trim().length).toBeGreaterThan(0)
        expect(q.explanation.trim().length).toBeGreaterThan(0)
        expect(q.id.startsWith(g.templateId)).toBe(true)
      }
    }
  })

  it("numeric Conv2D-params answer equals an independent recomputation", () => {
    const g = NUMERIC_GENERATORS.find((x) => x.templateId === "gen-num-conv-params")!
    for (let i = 0; i < 60; i++) {
      const q = g.generate()
      const m = q.question.match(/uses (\d+)x\d+ kernels, (\d+) input channel.*?, (\d+) filters/)!
      const [k, cin, cout] = [Number(m[1]), Number(m[2]), Number(m[3])]
      expect(q.answer).toBe(k * k * cin * cout + cout)
    }
  })
})
