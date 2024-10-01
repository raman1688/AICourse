import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    temperature: 0.7,
    verbose: false,
});

async function fromMessage() {
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Write a short description about the product provided to you by the customer.'],
        ['human', '{product_name}'],
    ]);
    
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
        product_name: "iPhone 15"
    });

    console.log(response);
}

async function fromOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`write an ingredient list separated by commas to make following dish: {dish_name}`);

    const chain = prompt.pipe(model).pipe(new CommaSeparatedListOutputParser);

    const response = await chain.invoke({
        dish_name: "tandoori chicken"
    });

    console.log(response);
}

async function fromStructuredOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`Extract information from the following phrase: 
        Formatted instructions: {formatted_instructions}
        Phrase: {phrase}`);

    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        formatted_instructions: "Name of the person",
        likes: "What the person likes",
    });

    const chain = prompt.pipe(model).pipe(outputParser);
    const response = await chain.invoke({
        formatted_instructions: outputParser.getFormatInstructions(),
        phrase: "John likes to play football",
    });

    // console.log(response);
}

fromStructuredOutputParser();