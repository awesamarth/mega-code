import { AssistantResponse } from 'ai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(req: Request) {

  console.log("reached here")
  // Parse the request body
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
 console.log('threadId', threadId);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.megaEth_ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set');
          })(),
      });
      console.log(runStream)
 
      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

    },
  );
}