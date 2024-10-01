import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    temperature: 0.8,
    verbose: false,
});

async function main() {
    const response1 = await model.invoke("Hello, how are you?");
    console.log(response1.content);
    // const response2 = await model.batch(["Hello, how are you?", "give me 4 ways to invest money"]);
    // console.log(response2);
    // const response3 = await model.stream("Give me 4 good documentaries to watch on sunday?");
    // for await (const message of response3) {
    //     console.log(message.content);
    // }
}

main();