import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    temperature: 0.7,
    verbose: false,
});

async function fromTemplate() {
    const prompt = ChatPromptTemplate.fromTemplate(`write a short description of following product: {product_name}`);
    
    const wholePrompt = await prompt.format({
        product_name: "iPhone 15"
    });

    const chain = prompt.pipe(model);

    const response = await chain.invoke({
        product_name: "iPhone 15"
    });

    console.log(response.content);
}

async function fromMessage() {
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Write a short description about the product provided to you by the customer.'],
        ['human', '{product_name}'],
    ]);
    
    const chain = prompt.pipe(model);

    const response = await chain.invoke({
        product_name: "iPhone 15"
    });

    console.log(response.content);
}

fromMessage();