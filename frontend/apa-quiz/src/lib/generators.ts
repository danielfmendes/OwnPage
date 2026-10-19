import type { Category, NumericQuestion, Question } from "@/types"

/* ------------------------------------------------------------------ *
 * Parameterized calculation questions.
 *
 * Each generator produces a fresh, concrete question with random numbers
 * every time it is called, so re-taking the quiz never shows the same
 * instance twice. Callers generate ONE instance per generator per run, so a
 * template appears at most once within a single exam / practice / drills pass.
 * ------------------------------------------------------------------ */

function randint(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

function choice<T>(arr: readonly T[]): T {
  return arr[randint(0, arr.length - 1)]
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function round(n: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

const uid = (templateId: string) => `${templateId}-${randint(0, 1_000_000_000)}`

const money = (n: number) => `$${n}$`

interface BuildMcArgs {
  templateId: string
  category: Category
  question: string
  correct: number
  distractors: number[]
  explanation: string
  fmt?: (n: number) => string
}

/** Build a 4-option numeric MC, ensuring four distinct options and a shuffled order. */
function buildMc(a: BuildMcArgs): Question {
  const fmt = a.fmt ?? money
  const values = new Set<number>([a.correct])
  for (const d of a.distractors) {
    if (values.size >= 4) break
    if (Number.isFinite(d)) values.add(d)
  }
  let guard = 0
  while (values.size < 4 && guard++ < 200) {
    const span = Math.max(2, Math.round(Math.abs(a.correct) * 0.25) + 1)
    const cand = a.correct + (Math.random() < 0.5 ? -1 : 1) * randint(1, span)
    values.add(cand)
  }
  const ordered = shuffle([...values].slice(0, 4))
  return {
    id: uid(a.templateId),
    type: "mc",
    category: a.category,
    calculation: true,
    generated: true,
    question: a.question,
    options: ordered.map(fmt),
    correctIndex: ordered.indexOf(a.correct),
    explanation: a.explanation,
  }
}

interface BuildMcStrArgs {
  templateId: string
  category: Category
  question: string
  correct: string
  distractors: string[]
  explanation: string
}

/** Build a 4-option MC from string options (for shape/answer-as-text questions). */
function buildMcStr(a: BuildMcStrArgs): Question {
  const values = new Set<string>([a.correct])
  for (const d of a.distractors) {
    if (values.size >= 4) break
    values.add(d)
  }
  const ordered = shuffle([...values].slice(0, 4))
  return {
    id: uid(a.templateId),
    type: "mc",
    category: a.category,
    calculation: true,
    generated: true,
    question: a.question,
    options: ordered,
    correctIndex: ordered.indexOf(a.correct),
    explanation: a.explanation,
  }
}

interface BuildNumArgs {
  templateId: string
  category: Category
  question: string
  answer: number
  tolerance: number
  answerHint?: string
  explanation: string
}

function buildNum(a: BuildNumArgs): NumericQuestion {
  return {
    id: uid(a.templateId),
    type: "numeric",
    category: a.category,
    calculation: true,
    question: a.question,
    answer: a.answer,
    tolerance: a.tolerance,
    answerHint: a.answerHint,
    explanation: a.explanation,
  }
}

/* ---- shared parameter pools ---- */
const KERNELS = [3, 5, 7] as const
const CHANNELS = [1, 3, 8, 16, 32, 64] as const
const FILTERS = [8, 16, 32, 64, 128] as const
const WIDTHS = [28, 32, 64, 128, 224] as const
const NTRAIN = [1000, 5000, 25000, 48000, 50000, 60000] as const
const BATCHES = [16, 32, 64, 100, 128, 256] as const

/* ================================================================== *
 * Multiple-choice generators (mock exam + practice)
 * ================================================================== */

export interface McGenerator {
  templateId: string
  category: Category
  generate: () => Question
}

export const MC_GENERATORS: McGenerator[] = [
  {
    templateId: "gen-conv-params",
    category: "CNN",
    generate() {
      const k = choice(KERNELS)
      const cin = choice(CHANNELS)
      const cout = choice(FILTERS)
      const correct = k * k * cin * cout + cout
      return buildMc({
        templateId: "gen-conv-params",
        category: "CNN",
        question: `A Conv2D layer uses ${k}x${k} kernels, ${cin} input channel${cin === 1 ? "" : "s"}, ${cout} output filters, with biases. How many parameters?`,
        correct,
        distractors: [k * k * cin * cout, k * k * cout + cout, cin * cout + cout],
        explanation: `$K_h K_w C_{in} C_{out} + C_{out} = ${k}\\cdot${k}\\cdot${cin}\\cdot${cout} + ${cout} = ${k * k * cin * cout} + ${cout} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-conv-output",
    category: "CNN",
    generate() {
      const w = choice(WIDTHS)
      const f = choice(KERNELS)
      const s = choice([1, 2] as const)
      const p = choice([0, 1] as const)
      const correct = Math.floor((w - f + 2 * p) / s) + 1
      return buildMc({
        templateId: "gen-conv-output",
        category: "CNN",
        question: `A conv layer has input width ${w}, filter size ${f}, stride ${s}, padding ${p}. What is the output width? (Use $\\lfloor (W-F+2P)/S\\rfloor + 1$.)`,
        correct,
        distractors: [
          Math.floor((w - f) / s) + 1,
          Math.floor((w - f + 2 * p) / s),
          Math.floor((w - f + 2 * p) / s) + 2,
        ],
        explanation: `$\\lfloor (${w} - ${f} + 2\\cdot${p})/${s}\\rfloor + 1 = \\lfloor ${(w - f + 2 * p) / s}\\rfloor + 1 = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-conv-pool",
    category: "CNN",
    generate() {
      const w = choice([28, 32, 48, 64] as const)
      const conv = w - 3 + 1 // 3x3 valid
      const correct = Math.floor(conv / 2)
      return buildMc({
        templateId: "gen-conv-pool",
        category: "CNN",
        question: `A ${w}×${w} feature map goes through a 3×3 'valid' conv (stride 1) then 2×2 max-pool (stride 2). What is the final width?`,
        correct,
        distractors: [Math.floor(w / 2), conv, Math.floor((w - 3) / 2) + 1],
        explanation: `Valid conv: $${w}-3+1 = ${conv}$. Max-pool by 2: $\\lfloor ${conv}/2\\rfloor = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-receptive-field",
    category: "CNN",
    generate() {
      const n = choice([2, 3, 4, 5] as const)
      const correct = 2 * n + 1
      return buildMc({
        templateId: "gen-receptive-field",
        category: "CNN",
        question: `${n} stacked 3×3 convolutions (stride 1) have an effective receptive field of side length:`,
        correct,
        distractors: [3, 2 * n, 3 * n, n + 1],
        explanation: `Each extra 3×3 adds 2 to the field: $3 + 2\\cdot${n - 1} = ${correct}$ (so $${correct}\\times ${correct}$).`,
      })
    },
  },
  {
    templateId: "gen-flatten",
    category: "CNN",
    generate() {
      const s = choice([4, 7, 8, 14] as const)
      const ch = choice([16, 32, 64, 128] as const)
      const correct = s * s * ch
      return buildMc({
        templateId: "gen-flatten",
        category: "CNN",
        question: `A feature map of shape ${s}×${s}×${ch} is flattened. How many values does the flattened vector contain?`,
        correct,
        distractors: [s * ch, s * s, 2 * s * ch],
        explanation: `$${s}\\times ${s}\\times ${ch} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-dense-params",
    category: "Foundations",
    generate() {
      const inp = choice([10, 16, 32, 64, 128, 256] as const)
      const out = choice([5, 10, 16, 32, 64] as const)
      const bias = Math.random() < 0.5
      const correct = inp * out + (bias ? out : 0)
      return buildMc({
        templateId: "gen-dense-params",
        category: "Foundations",
        question: `A dense layer maps ${inp} inputs to ${out} units ${bias ? "with" : "without"} a bias. How many trainable parameters?`,
        correct,
        distractors: [inp * out + (bias ? 0 : out), inp + out, (inp + 1) * out + out],
        explanation: `Weights $${inp}\\times ${out} = ${inp * out}$${bias ? `, plus ${out} biases` : ` (no bias)`} $= ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-mlp-params",
    category: "MLP",
    generate() {
      const a = choice([64, 128, 256, 784] as const)
      const b = choice([16, 32, 64, 128] as const)
      const c = choice([10, 16, 32] as const)
      const correct = a * b + b + (b * c + c)
      return buildMc({
        templateId: "gen-mlp-params",
        category: "MLP",
        question: `An MLP is ${a} → ${b} → ${c} with biases on every layer. How many trainable parameters in total?`,
        correct,
        distractors: [a * b + b * c, a * b + b + b * c, a * b * c],
        explanation: `$(${a}\\cdot${b}+${b}) + (${b}\\cdot${c}+${c}) = ${a * b + b} + ${b * c + c} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-steps-epoch",
    category: "Training",
    generate() {
      const n = choice(NTRAIN)
      const bsz = choice(BATCHES)
      const correct = Math.ceil(n / bsz)
      return buildMc({
        templateId: "gen-steps-epoch",
        category: "Training",
        question: `With ${n.toLocaleString("en-US")} training examples and batch size ${bsz}, how many gradient steps per epoch? (Use $\\lceil N/B\\rceil$.)`,
        correct,
        distractors: [Math.floor(n / bsz), correct + 1, Math.round(n / bsz) + 2],
        explanation: `$\\lceil ${n}/${bsz}\\rceil = ${correct}$ (round up — the last batch may be partial).`,
      })
    },
  },
  {
    templateId: "gen-total-updates",
    category: "Training",
    generate() {
      const n = choice(NTRAIN)
      const bsz = choice(BATCHES)
      const e = choice([5, 10, 20] as const)
      const steps = Math.ceil(n / bsz)
      const correct = steps * e
      return buildMc({
        templateId: "gen-total-updates",
        category: "Training",
        question: `Training on ${n.toLocaleString("en-US")} examples with batch size ${bsz} for ${e} epochs gives how many total parameter updates?`,
        correct,
        distractors: [steps, steps * (e - 1), Math.floor(n / bsz) * e + e],
        explanation: `Steps/epoch $= \\lceil ${n}/${bsz}\\rceil = ${steps}$, times ${e} epochs $= ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-matrix-shape",
    category: "Foundations",
    generate() {
      // mutually distinct dims so the four shape options never collide
      const [m, k, p] = shuffle([2, 3, 4, 5, 6, 7]).slice(0, 3)
      return buildMcStr({
        templateId: "gen-matrix-shape",
        category: "Foundations",
        question: `$A$ has shape $${m}\\times ${k}$ and $B$ has shape $${k}\\times ${p}$. What is the shape of $AB$?`,
        correct: `$${m}\\times ${p}$`,
        distractors: [
          `$${k}\\times ${k}$`,
          `$${p}\\times ${m}$`,
          `$${m}\\times ${k}$`,
          `$${k}\\times ${p}$`,
          `$${p}\\times ${p}$`,
        ],
        explanation: `Inner dims match ($${k}=${k}$); the product takes the outer dims $${m}\\times ${p}$.`,
      })
    },
  },
  {
    templateId: "gen-ce-loss",
    category: "MLP",
    generate() {
      const p = choice([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8] as const)
      const correct = round(-Math.log(p), 3)
      return buildMc({
        templateId: "gen-ce-loss",
        category: "MLP",
        question: `Cross-entropy for one example is $-\\ln(p_{\\text{true}})$. If the model gives the correct class probability ${p}, the loss is about:`,
        correct,
        distractors: [round(-Math.log10(p), 3), round(p, 3), round(1 - p, 3)],
        explanation: `$-\\ln(${p}) \\approx ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-gd-step",
    category: "MLP",
    generate() {
      const w = choice([0.5, 1, 1.5, 2, -1] as const)
      const lr = choice([0.01, 0.1, 0.5] as const)
      const g = choice([-2, -1, 0.5, 1, 2, 4] as const)
      const correct = round(w - lr * g, 4)
      return buildMc({
        templateId: "gen-gd-step",
        category: "MLP",
        question: `Gradient-descent step $w \\leftarrow w - \\eta\\,g$ with $w=${w}$, learning rate $\\eta=${lr}$, gradient $g=${g}$. The new weight is:`,
        correct,
        distractors: [round(w + lr * g, 4), round(w - g, 4), round(w - lr, 4)],
        explanation: `$${w} - ${lr}\\cdot${g} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-simplernn-params",
    category: "RNN",
    generate() {
      const i = choice([5, 10, 16, 32] as const)
      const h = choice([8, 16, 20, 32] as const)
      const correct = i * h + h * h + h
      return buildMc({
        templateId: "gen-simplernn-params",
        category: "RNN",
        question: `A SimpleRNN has input dimension ${i} and ${h} hidden units. Counting $W_x$, $W_h$ and the bias, how many parameters?`,
        correct,
        distractors: [i * h + h * h, i * h + h, h * h + h],
        explanation: `$W_x: ${i}\\cdot${h}=${i * h}$, $W_h: ${h}\\cdot${h}=${h * h}$, bias $${h}$. Total $${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-lstm-params",
    category: "RNN",
    generate() {
      const i = choice([4, 8, 10, 16] as const)
      const h = choice([8, 16, 20, 32] as const)
      const correct = 4 * ((i + h) * h + h)
      return buildMc({
        templateId: "gen-lstm-params",
        category: "RNN",
        question: `An LSTM has input dimension ${i} and ${h} hidden units. Using $4\\big((\\text{in}+\\text{hid})\\,\\text{hid} + \\text{hid}\\big)$, how many parameters?`,
        correct,
        distractors: [(i + h) * h + h, 4 * (i + h) * h, 3 * ((i + h) * h + h)],
        explanation: `$4\\big((${i}+${h})\\cdot${h} + ${h}\\big) = 4\\cdot${(i + h) * h + h} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-gru-params",
    category: "RNN",
    generate() {
      const i = choice([3, 4, 8, 16] as const)
      const h = choice([4, 8, 16, 32] as const)
      const correct = 3 * ((i + h) * h + h)
      return buildMc({
        templateId: "gen-gru-params",
        category: "RNN",
        question: `A GRU has input dimension ${i} and ${h} hidden units. With 3 gate weight-sets, $3\\big((\\text{in}+\\text{hid})\\,\\text{hid}+\\text{hid}\\big)$ parameters is:`,
        correct,
        distractors: [4 * ((i + h) * h + h), 2 * ((i + h) * h + h), (i + h) * h + h],
        explanation: `$3\\big((${i}+${h})\\cdot${h} + ${h}\\big) = 3\\cdot${(i + h) * h + h} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-lstm-cell",
    category: "RNN",
    generate() {
      const f = choice([0.1, 0.3, 0.5, 0.7, 0.9] as const)
      const c = choice([1, 2, 3, -1, 0.5] as const)
      const i = choice([0.2, 0.4, 0.5, 0.8] as const)
      const g = choice([-1, 0.5, 1, 2] as const)
      const correct = round(f * c + i * g, 3)
      return buildMc({
        templateId: "gen-lstm-cell",
        category: "RNN",
        question: `LSTM cell update $c_t = f\\odot c_{t-1} + i\\odot g$. With $f=${f}$, $c_{t-1}=${c}$, $i=${i}$, $g=${g}$, what is $c_t$?`,
        correct,
        distractors: [round(f * c, 3), round(c + g, 3), round(f * c - i * g, 3)],
        explanation: `$${f}\\cdot${c} + ${i}\\cdot${g} = ${round(f * c, 3)} + ${round(i * g, 3)} = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-dk-heads",
    category: "Attention",
    generate() {
      const h = choice([2, 4, 8, 16] as const)
      const dk = choice([16, 32, 64, 96] as const)
      const d = dk * h
      return buildMc({
        templateId: "gen-dk-heads",
        category: "Attention",
        question: `A Transformer uses model dimension $d_{model}=${d}$ split across ${h} heads. What is the per-head dimension $d_k = d_{model}/h$?`,
        correct: dk,
        distractors: [d * h, d - h, h],
        explanation: `$d_k = ${d}/${h} = ${dk}$.`,
      })
    },
  },
  {
    templateId: "gen-cnn-budget",
    category: "CNN",
    generate() {
      const w = choice([28, 32, 48, 64] as const)
      const s1 = w - 2 // 3x3 valid conv
      const s2 = Math.floor(s1 / 2) // 2x2 maxpool stride 2
      const correct = s2 - 2 // 3x3 valid conv
      return buildMc({
        templateId: "gen-cnn-budget",
        category: "CNN",
        question: `Input ${w}×${w} → Conv 3×3 (stride 1, no pad) → MaxPool 2×2 (stride 2) → Conv 3×3 (stride 1, no pad). What is the final width?`,
        correct,
        distractors: [s2, s1, s2 - 1, Math.floor(w / 2)],
        explanation: `Conv: $${w}-2=${s1}$. Pool: $\\lfloor ${s1}/2\\rfloor=${s2}$. Conv: $${s2}-2=${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-attn-weight",
    category: "Attention",
    generate() {
      const dk = choice([4, 9, 16] as const)
      const sq = Math.sqrt(dk)
      const s1 = choice([4, 6, 8] as const)
      const s2 = choice([0, 2, 3] as const)
      const sm = (a: number, b: number) => Math.exp(a) / (Math.exp(a) + Math.exp(b))
      const correct = round(sm(s1 / sq, s2 / sq), 3)
      return buildMc({
        templateId: "gen-attn-weight",
        category: "Attention",
        question: `Two attention scores $q\\cdot k = [${s1}, ${s2}]$ with $d_k=${dk}$. After scaling by $\\sqrt{d_k}$ and applying softmax, what weight does the FIRST key get?`,
        correct,
        distractors: [round(sm(s1, s2), 3), round(sm(s2 / sq, s1 / sq), 3), 0.5],
        explanation: `Scale: $[${round(s1 / sq, 2)}, ${round(s2 / sq, 2)}]$. Softmax of the first $= ${correct}$. (Forgetting $\\sqrt{d_k}$ would give $${round(sm(s1, s2), 3)}$.)`,
      })
    },
  },
  {
    templateId: "gen-perceptron-preact",
    category: "Perceptron",
    generate() {
      const w1 = choice([-2, -1, 1, 2] as const)
      const w2 = choice([-2, -1, 1, 2] as const)
      const b = choice([-1, -0.5, 0.5, 1] as const)
      const x1 = choice([0, 1, 2] as const)
      const x2 = choice([0, 1, 2] as const)
      const correct = round(w1 * x1 + w2 * x2 + b, 3)
      return buildMc({
        templateId: "gen-perceptron-preact",
        category: "Perceptron",
        question: `With weights $\\mathbf{w}=[${w1},${w2}]$, bias $b=${b}$, and input $\\mathbf{x}=[${x1},${x2}]$, the pre-activation $\\mathbf{w}\\cdot\\mathbf{x}+b$ equals:`,
        correct,
        distractors: [round(w1 * x1 + w2 * x2, 3), round(w1 + w2 + b, 3), round(w1 * x1 + w2 * x2 - b, 3)],
        explanation: `$${w1}\\cdot${x1} + ${w2}\\cdot${x2} + (${b}) = ${correct}$.`,
      })
    },
  },
  {
    templateId: "gen-rnn-forward",
    category: "RNN",
    generate() {
      const whh = choice([0.5, 1, 1.5] as const)
      const hprev = choice([0, 0.5, 1] as const)
      const wxh = choice([0.5, 1, 1.5, 2] as const)
      const x = choice([0, 1, 2] as const)
      const b = choice([-1, 0, 0.5, 1] as const)
      const z = whh * hprev + wxh * x + b
      const correct = round(Math.tanh(z), 3)
      return buildMc({
        templateId: "gen-rnn-forward",
        category: "RNN",
        question: `A vanilla RNN computes $h_t=\\tanh(w_{hh}\\,h_{t-1}+w_{xh}\\,x_t+b)$. With $w_{hh}=${whh}$, $h_{t-1}=${hprev}$, $w_{xh}=${wxh}$, $x_t=${x}$, $b=${b}$, what is $h_t$ (to 3 dp)?`,
        correct,
        distractors: [round(z, 3), round(Math.tanh(whh * hprev + wxh * x), 3), round(Math.tanh(wxh * x + b), 3)],
        explanation: `$z=${whh}\\cdot${hprev}+${wxh}\\cdot${x}+(${b})=${round(z, 3)}$, so $\\tanh(${round(z, 3)})=${correct}$. (Forgetting $\\tanh$ gives $${round(z, 3)}$.)`,
        fmt: (n) => `$${n}$`,
      })
    },
  },
  {
    templateId: "gen-rnn-grad",
    category: "RNN",
    generate() {
      const w = choice([0.5, 0.8, 1.2, 1.5, 2] as const)
      const t = choice([3, 4, 5, 6] as const)
      const correct = round(w ** t, 4)
      return buildMc({
        templateId: "gen-rnn-grad",
        category: "RNN",
        question: `In backprop-through-time the gradient is scaled by $w_{hh}^{T}$ across $T$ timesteps. With recurrent weight $w_{hh}=${w}$ and $T=${t}$ steps, this factor is about (to 4 dp):`,
        correct,
        distractors: [round(w * t, 4), round(w ** (t - 1), 4), round(w ** (t + 1), 4)],
        explanation: `$${w}^{${t}}=${correct}$ — ${w < 1 ? "shrinks toward 0 (vanishing)" : "grows without bound (exploding)"}. Multiplying ($${w}\\times${t}$) instead would give $${round(w * t, 4)}$.`,
      })
    },
  },
  {
    templateId: "gen-attn-score",
    category: "Attention",
    generate() {
      const L = choice([2, 3, 4] as const)
      const pick = () => Array.from({ length: L }, () => choice([-2, -1, 1, 2, 3] as const))
      const q = pick()
      const k = pick()
      const dot = q.reduce((s, qi, idx) => s + qi * k[idx], 0)
      const sq = Math.sqrt(L)
      const correct = round(dot / sq, 3)
      return buildMc({
        templateId: "gen-attn-score",
        category: "Attention",
        question: `Scaled dot-product score $q\\cdot k/\\sqrt{d_k}$. With $q=[${q.join(", ")}]$, $k=[${k.join(", ")}]$, and $d_k=${L}$, the score is (to 3 dp):`,
        correct,
        distractors: [round(dot, 3), round(dot / L, 3), round(dot * sq, 3)],
        explanation: `$q\\cdot k=${dot}$, scaled by $\\sqrt{${L}}\\approx${round(sq, 3)}$: $${dot}/${round(sq, 3)}=${correct}$. (Forgetting the scale gives $${dot}$; dividing by $d_k$ gives $${round(dot / L, 3)}$.)`,
        fmt: (n) => `$${n}$`,
      })
    },
  },
  {
    templateId: "gen-bce-loss",
    category: "MLP",
    generate() {
      const y = choice([0, 1] as const)
      const p = choice([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9] as const)
      const pt = y === 1 ? p : 1 - p
      const correct = round(-Math.log(pt), 3)
      return buildMc({
        templateId: "gen-bce-loss",
        category: "MLP",
        question: `Binary cross-entropy for one example is $-[y\\ln p+(1-y)\\ln(1-p)]$. With true label $y=${y}$ and predicted probability $p=${p}$, the loss is about (to 3 dp):`,
        correct,
        distractors: [round(-Math.log10(pt), 3), round((y - p) ** 2, 3), round(-Math.log(1 - pt), 3)],
        explanation: `$y=${y}$ uses $${y === 1 ? "p" : "1-p"}=${pt}$, so loss $=-\\ln(${pt})=${correct}$.`,
        fmt: (n) => `$${n}$`,
      })
    },
  },
]

/* ================================================================== *
 * Numeric generators (Calculation Drills)
 * ================================================================== */

export interface NumericGenerator {
  templateId: string
  category: Category
  generate: () => NumericQuestion
}

export const NUMERIC_GENERATORS: NumericGenerator[] = [
  {
    templateId: "gen-num-conv-params",
    category: "CNN",
    generate() {
      const k = choice(KERNELS)
      const cin = choice(CHANNELS)
      const cout = choice(FILTERS)
      const answer = k * k * cin * cout + cout
      return buildNum({
        templateId: "gen-num-conv-params",
        category: "CNN",
        question: `A Conv2D layer uses ${k}x${k} kernels, ${cin} input channel${cin === 1 ? "" : "s"}, ${cout} filters, with biases. How many parameters?`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$${k}\\cdot${k}\\cdot${cin}\\cdot${cout} + ${cout} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-conv-output",
    category: "CNN",
    generate() {
      const w = choice(WIDTHS)
      const f = choice(KERNELS)
      const s = choice([1, 2] as const)
      const p = choice([0, 1] as const)
      const answer = Math.floor((w - f + 2 * p) / s) + 1
      return buildNum({
        templateId: "gen-num-conv-output",
        category: "CNN",
        question: `Conv output width for input ${w}, filter ${f}, stride ${s}, padding ${p}. Use $\\lfloor (W-F+2P)/S\\rfloor + 1$.`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$\\lfloor (${w}-${f}+2\\cdot${p})/${s}\\rfloor + 1 = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-flatten",
    category: "CNN",
    generate() {
      const s = choice([4, 7, 8, 14] as const)
      const ch = choice([16, 32, 64, 128] as const)
      const answer = s * s * ch
      return buildNum({
        templateId: "gen-num-flatten",
        category: "CNN",
        question: `A feature map of shape ${s}×${s}×${ch} is flattened. How many values result?`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$${s}\\times ${s}\\times ${ch} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-dense-params",
    category: "Foundations",
    generate() {
      const inp = choice([10, 16, 32, 64, 128, 256] as const)
      const out = choice([5, 10, 16, 32, 64] as const)
      const answer = inp * out + out
      return buildNum({
        templateId: "gen-num-dense-params",
        category: "Foundations",
        question: `A dense layer maps ${inp} inputs to ${out} units with a bias. How many trainable parameters?`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$${inp}\\times ${out} + ${out} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-mlp-params",
    category: "MLP",
    generate() {
      const a = choice([64, 128, 256, 784] as const)
      const b = choice([16, 32, 64, 128] as const)
      const c = choice([10, 16, 32] as const)
      const answer = a * b + b + (b * c + c)
      return buildNum({
        templateId: "gen-num-mlp-params",
        category: "MLP",
        question: `An MLP is ${a} → ${b} → ${c} with biases. How many trainable parameters in total?`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$(${a}\\cdot${b}+${b}) + (${b}\\cdot${c}+${c}) = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-steps-epoch",
    category: "Training",
    generate() {
      const n = choice(NTRAIN)
      const bsz = choice(BATCHES)
      const answer = Math.ceil(n / bsz)
      return buildNum({
        templateId: "gen-num-steps-epoch",
        category: "Training",
        question: `With ${n.toLocaleString("en-US")} training examples and batch size ${bsz}, how many steps per epoch? (Round up.)`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$\\lceil ${n}/${bsz}\\rceil = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-forward-relu",
    category: "MLP",
    generate() {
      const w = choice([-2, -1, 0.5, 1, 2, 3] as const)
      const x = choice([1, 2, 3, 4] as const)
      const b = choice([-2, -1, 0, 1, 2] as const)
      const z = w * x + b
      const answer = Math.max(0, z)
      return buildNum({
        templateId: "gen-num-forward-relu",
        category: "MLP",
        question: `A neuron computes $z = Wx + b$ then applies ReLU. With $W=${w}$, $x=${x}$, $b=${b}$, what is the activation?`,
        answer,
        tolerance: 0.01,
        answerHint: "use a decimal point if needed",
        explanation: `$z = ${w}\\cdot${x} + ${b} = ${z}$, and $\\text{ReLU}(${z}) = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-mse",
    category: "MLP",
    generate() {
      const y = choice([0, 1, 2] as const)
      const yhat = choice([0.2, 0.5, 0.8, 1.4, 2.5] as const)
      const answer = round(0.5 * (yhat - y) ** 2, 4)
      return buildNum({
        templateId: "gen-num-mse",
        category: "MLP",
        question: `With prediction $\\hat{y}=${yhat}$ and target $y=${y}$, compute the loss $L=\\tfrac{1}{2}(\\hat{y}-y)^2$.`,
        answer,
        tolerance: 0.005,
        answerHint: "round to ~3 decimals",
        explanation: `$\\tfrac{1}{2}(${yhat}-${y})^2 = \\tfrac{1}{2}(${round((yhat - y) ** 2, 4)}) = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-gd-step",
    category: "MLP",
    generate() {
      const w = choice([0.5, 1, 1.5, 2, -1] as const)
      const lr = choice([0.01, 0.1, 0.5] as const)
      const g = choice([-2, -1, 0.5, 1, 2, 4] as const)
      const answer = round(w - lr * g, 4)
      return buildNum({
        templateId: "gen-num-gd-step",
        category: "MLP",
        question: `Gradient-descent step $w \\leftarrow w - \\eta\\,g$ with $w=${w}$, $\\eta=${lr}$, gradient $g=${g}$. The new weight is:`,
        answer,
        tolerance: 0.005,
        answerHint: "use a decimal point",
        explanation: `$${w} - ${lr}\\cdot${g} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-lstm-cell",
    category: "RNN",
    generate() {
      const f = choice([0.1, 0.3, 0.5, 0.7, 0.9] as const)
      const c = choice([1, 2, 3, -1, 0.5] as const)
      const i = choice([0.2, 0.4, 0.5, 0.8] as const)
      const g = choice([-1, 0.5, 1, 2] as const)
      const answer = round(f * c + i * g, 3)
      return buildNum({
        templateId: "gen-num-lstm-cell",
        category: "RNN",
        question: `LSTM cell update $c_t = f\\odot c_{t-1} + i\\odot g$. With $f=${f}$, $c_{t-1}=${c}$, $i=${i}$, $g=${g}$, what is $c_t$?`,
        answer,
        tolerance: 0.005,
        answerHint: "round to ~3 decimals",
        explanation: `$${f}\\cdot${c} + ${i}\\cdot${g} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-simplernn-params",
    category: "RNN",
    generate() {
      const i = choice([5, 10, 16, 32] as const)
      const h = choice([8, 16, 20, 32] as const)
      const answer = i * h + h * h + h
      return buildNum({
        templateId: "gen-num-simplernn-params",
        category: "RNN",
        question: `A SimpleRNN has input dim ${i} and ${h} hidden units. Counting $W_x$, $W_h$ and the bias, how many parameters?`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$${i}\\cdot${h} + ${h}\\cdot${h} + ${h} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-lstm-params",
    category: "RNN",
    generate() {
      const i = choice([4, 8, 10, 16] as const)
      const h = choice([8, 16, 20, 32] as const)
      const answer = 4 * ((i + h) * h + h)
      return buildNum({
        templateId: "gen-num-lstm-params",
        category: "RNN",
        question: `An LSTM has input dim ${i} and ${h} hidden units. Use $4\\big((\\text{in}+\\text{hid})\\,\\text{hid}+\\text{hid}\\big)$.`,
        answer,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$4\\big((${i}+${h})\\cdot${h} + ${h}\\big) = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-dk-heads",
    category: "Attention",
    generate() {
      const h = choice([2, 4, 8, 16] as const)
      const dk = choice([16, 32, 64, 96] as const)
      const d = dk * h
      return buildNum({
        templateId: "gen-num-dk-heads",
        category: "Attention",
        question: `A Transformer uses $d_{model}=${d}$ across ${h} heads. What is $d_k = d_{model}/h$?`,
        answer: dk,
        tolerance: 0.5,
        answerHint: "whole number",
        explanation: `$${d}/${h} = ${dk}$.`,
      })
    },
  },
  {
    templateId: "gen-num-sigmoid",
    category: "Foundations",
    generate() {
      const z = choice([-2, -1, -0.5, 0.5, 1, 2] as const)
      const answer = round(1 / (1 + Math.exp(-z)), 4)
      return buildNum({
        templateId: "gen-num-sigmoid",
        category: "Foundations",
        question: `Compute the logistic sigmoid $\\sigma(z)=\\dfrac{1}{1+e^{-z}}$ at $z=${z}$.`,
        answer,
        tolerance: 0.005,
        answerHint: "round to 4 decimals",
        explanation: `$\\sigma(${z}) = \\dfrac{1}{1+e^{-(${z})}} = ${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-rnn-forward",
    category: "RNN",
    generate() {
      const whh = choice([0.5, 1, 1.5] as const)
      const hprev = choice([0, 0.5, 1] as const)
      const wxh = choice([0.5, 1, 1.5, 2] as const)
      const x = choice([0, 1, 2] as const)
      const b = choice([-1, 0, 0.5, 1] as const)
      const z = whh * hprev + wxh * x + b
      const answer = round(Math.tanh(z), 3)
      return buildNum({
        templateId: "gen-num-rnn-forward",
        category: "RNN",
        question: `A vanilla RNN computes $h_t=\\tanh(w_{hh}\\,h_{t-1}+w_{xh}\\,x_t+b)$. With $w_{hh}=${whh}$, $h_{t-1}=${hprev}$, $w_{xh}=${wxh}$, $x_t=${x}$, $b=${b}$, what is $h_t$?`,
        answer,
        tolerance: 0.01,
        answerHint: "round to ~3 decimals",
        explanation: `$z=${whh}\\cdot${hprev}+${wxh}\\cdot${x}+(${b})=${round(z, 3)}$, so $\\tanh(${round(z, 3)})=${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-attn-score",
    category: "Attention",
    generate() {
      const L = choice([2, 3, 4] as const)
      const pick = () => Array.from({ length: L }, () => choice([-2, -1, 1, 2, 3] as const))
      const q = pick()
      const k = pick()
      const dot = q.reduce((s, qi, idx) => s + qi * k[idx], 0)
      const answer = round(dot / Math.sqrt(L), 3)
      return buildNum({
        templateId: "gen-num-attn-score",
        category: "Attention",
        question: `Compute the scaled dot-product score $q\\cdot k/\\sqrt{d_k}$ with $q=[${q.join(", ")}]$, $k=[${k.join(", ")}]$, and $d_k=${L}$.`,
        answer,
        tolerance: 0.01,
        answerHint: "round to ~3 decimals",
        explanation: `$q\\cdot k=${dot}$, scaled by $\\sqrt{${L}}$: $${dot}/${round(Math.sqrt(L), 3)}=${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-bce",
    category: "MLP",
    generate() {
      const y = choice([0, 1] as const)
      const p = choice([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9] as const)
      const pt = y === 1 ? p : 1 - p
      const answer = round(-Math.log(pt), 3)
      return buildNum({
        templateId: "gen-num-bce",
        category: "MLP",
        question: `Binary cross-entropy $-[y\\ln p+(1-y)\\ln(1-p)]$ with true label $y=${y}$ and predicted probability $p=${p}$. Compute the loss.`,
        answer,
        tolerance: 0.005,
        answerHint: "round to ~3 decimals",
        explanation: `$y=${y}$ uses $${y === 1 ? "p" : "1-p"}=${pt}$, so $-\\ln(${pt})=${answer}$.`,
      })
    },
  },
  {
    templateId: "gen-num-layernorm",
    category: "Attention",
    generate() {
      const x: number[] = Array.from({ length: 4 }, () => choice([0, 1, 2, 3, 4, 5, 6]))
      const mean = x.reduce((s, v) => s + v, 0) / x.length
      const variance = x.reduce((s, v) => s + (v - mean) ** 2, 0) / x.length
      const answer = round(variance, 4)
      return buildNum({
        templateId: "gen-num-layernorm",
        category: "Attention",
        question: `LayerNorm normalizes a token's features by their variance. For $x=[${x.join(", ")}]$, compute the population variance $\\tfrac{1}{n}\\sum_i (x_i-\\bar{x})^2$.`,
        answer,
        tolerance: 0.01,
        answerHint: "round to ~3 decimals",
        explanation: `$\\bar{x}=${round(mean, 3)}$; variance $=${answer}$.`,
      })
    },
  },
]
