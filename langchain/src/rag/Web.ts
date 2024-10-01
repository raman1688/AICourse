import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.5,

});

// Function to initialize the in-memory vector store with the PDF text
async function initializeVectorStore(myDocs: Document[]): Promise<MemoryVectorStore> {
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    await vectorStore.addDocuments(myDocs);
    return vectorStore;
}

// Function to query the vector store and get answers
async function queryVectorStore(vectorStore: MemoryVectorStore, query: string): Promise<string[]> {
    const retriever = vectorStore.asRetriever({
        k: 2
    });
    // const langChain = new LangChain(vectorStore);
    const response = await retriever.getRelevantDocuments(query);
    const resultDocs = response.map(result => result.pageContent);
    return resultDocs;
}

// Function to format the output in JSON
async function formatOutput(question: string, responses: string[]): Promise<AIMessage> {
    const template = ChatPromptTemplate.fromMessages([
        ['system', 'Answer the users question based on the following context: {context}'],
        ['user', '{input}']
    ]);

    const chain = template.pipe(model);
    const result = await chain.invoke({
        input: question,
        context: responses
    });

    return result;
}

// Main function to run the RAG application
async function main() {

    const loader = new CheerioWebBaseLoader(
        "https://www.skysports.com/football",
        {
          // optional params: ...
        }
      );
    
    const question = "Who salvaged draw for Man City against arsenal?";
    const docs = await loader.load();
    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20,
    });

    const splittedDocs = await splitter.splitDocuments(docs);


    // Initialize the vector store
    const vectorStore = await initializeVectorStore(splittedDocs);

    // Query the vector store
    const response = await queryVectorStore(vectorStore, question);

    // Format and print the output
    const output = await formatOutput(question, response);
    console.log("result is: ", output.content);
}

// Run the main function
main().catch(console.error);