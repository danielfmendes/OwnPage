import {WorkflowEntrypoint, WorkflowStep, WorkflowEvent} from 'cloudflare:workers';
import {Ai} from '@cloudflare/ai';
import {Env} from './types';

type FeedbackPayload = {
    id: string;
    content: string;
    source: string;
    author: string;
    timestamp: string;
};

export class IngestionWorkflow extends WorkflowEntrypoint<Env, FeedbackPayload> {
    async run(event: WorkflowEvent<FeedbackPayload>, step: WorkflowStep) {
        const env = this.env;
        const body = event.payload;
        const ai = new Ai(env.AI);

        // Step 1: AI Analysis (Sentiment, Urgency, etc.)
        const analysis = await step.do('analyze-feedback', async () => {
            const response: any = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
                messages: [{
                    role: 'system',
                    content: `Analyze feedback. Return JSON ONLY.
                    Fields:
                    - sentiment: "positive" | "negative" | "neutral"
                    - urgency: 1-5 (5 is critical)
                    - summary: 1 sentence summary
                    - root_cause: Technical explanation
                    - suggested_fix: Git command or code fix`
                }, {
                    role: 'user',
                    content: `Feedback: "${body.content}"`
                }]
            });

            try {
                // Cleanup JSON formatting if AI adds markdown code blocks
                const raw = response.response.replace(/```json|```/g, '').trim();
                return JSON.parse(raw);
            } catch {
                return {
                    sentiment: "neutral",
                    urgency: 1,
                    summary: "Processing error",
                    root_cause: "N/A",
                    suggested_fix: "N/A"
                };
            }
        });

        // Step 2: Vector Embedding
        const vectors = await step.do('generate-embedding', async () => {
            const embedding = await ai.run('@cf/baai/bge-base-en-v1.5', {text: [body.content]});
            return embedding.data[0];
        });

        // Step 3: Save to D1 Database
        await step.do('save-to-d1', async () => {
            await env.FEEDBACK_DB.prepare(
                `INSERT INTO feedback (id, content, source, author, original_timestamp, sentiment_score, urgency_score,
                                       summary, root_cause, suggested_fix)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                body.id, body.content, body.source, body.author,
                body.timestamp, analysis.sentiment, analysis.urgency, analysis.summary,
                analysis.root_cause, analysis.suggested_fix
            ).run();
        });

        // Step 4: Save to Vector Index
        await step.do('save-to-vectorize', async () => {
            await env.VECTOR_INDEX.insert([{
                id: body.id,
                values: vectors,
                metadata: {urgency: analysis.urgency}
            }]);
        });

        return {success: true, id: body.id};
    }
}