import { OpenAI } from 'openai';
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();

async function main() {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You respond like a standup comedian' },
            { role: 'user', content: 'say something funny' }
        ]
    });
    console.log(response.choices[0].message.content);
}

function encodePrompt() {
    const prompt = "What is the fastest car in the world?";
    const encoder = encoding_for_model('gpt-3.5-turbo');
    const words = encoder.encode(prompt);
    console.log(words);
}

encodePrompt();
main();
