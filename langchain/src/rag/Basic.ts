import { readFileSync } from 'fs';
// import { PDFDocument } from 'pdf-lib';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';


const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.5,

})

// Function to read and extract text from a PDF file
// async function readPdf(filePath: string): Promise<string> {
//     const pdfBuffer = readFileSync(filePath);
//     const pdfDoc = await PDFDocument.load(pdfBuffer);
//     const pages = pdfDoc.getPages();
//     let text = '';

//     for (const page of pages) {
//         text += page.getTextContent().items.map(item => item.str).join(' ');
//     }

//     return text;
// }

// Function to initialize the in-memory vector store with the PDF text
async function initializeVectorStore(myData: string[]): Promise<MemoryVectorStore> {
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    await vectorStore.addDocuments(myData.map(
        content => new Document({ pageContent: content })
    ));
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
    // const pdfPath = '/path/to/your/pdf/file.pdf';
    // const query = 'Your query here';

    // Read and process the PDF
    // const pdfText = await readPdf(pdfPath);

    const myData = [
        "My name is John",
        "I live in New York",
        "I work as a software engineer",
        "I like to play soccer",
        "I enjoy reading books",
        "I am learning Spanish",
        "I have a pet dog",
        "I love to travel",
    ];
    
    const question = "What are some things I enjoy doing?";

    // Initialize the vector store
    const vectorStore = await initializeVectorStore(myData);

    // Query the vector store
    const response = await queryVectorStore(vectorStore, question);

    // Format and print the output
    const output = await formatOutput(question, response);
    console.log("result is: ", output.content);
}

// Run the main function
main().catch(console.error);