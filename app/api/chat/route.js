import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "hello"// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req){
    const openai = new OpenAI({
        baseURL:"https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    })
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt }, ...data
        ],
        model: "openai/gpt-3.5-turbo",
        });
    
    return NextResponse.json({message: completion.choices[0].message.content}, {status:200})
}