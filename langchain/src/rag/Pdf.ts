import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  verbose: false,
});

// Function to initialize the in-memory vector store with the PDF text
async function initializeVectorStore(
  myDocs: Document[]
): Promise<MemoryVectorStore> {
  const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  await vectorStore.addDocuments(myDocs);
  return vectorStore;
}

// Function to query the vector store and get answers
async function queryVectorStore(
  vectorStore: MemoryVectorStore,
  query: string
): Promise<string[]> {
  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  // const langChain = new LangChain(vectorStore);
  const response = await retriever.getRelevantDocuments(query);
  const resultDocs = response.map((result) => result.pageContent);
  return resultDocs;
}

// Function to format the output in JSON
async function formatOutput(
  question: string,
  responses: string[]
): Promise<any> {
  // const template = ChatPromptTemplate.fromMessages([
  //   [
  //     "system",
  //     `You are an expert PDF data extractor tasked with reading and extracting all relevant information from a provided PDF report. Your goal is to extract and organize the content in a structured JSON format that can be efficiently visualized as charts or graphs in a dashboard. 
  //     the extracted data should be in the following format: {formatted_instructions}`
  //   ],
  //   ['system', 'Extract the information from the following context: {context}'],
  //   [
  //     "user",
  //     "{input}"
  //   ]
  // ]);

  const template = PromptTemplate.fromTemplate(`You are an expert PDF data extractor tasked with reading and extracting all relevant information from a provided PDF report.
    Extract the information from the following context: {context}.
    The extracted data should be in the following format: {formatted_instructions}
    The question is: {question}`);

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
      title: "The title of the chart or graph",
      type: "Type of chart (e.g., bar, line, pie, etc.)",
      // data: "A collection of key-value pairs where keys represent categories, metrics, or dimensions, and values are the corresponding numerical data.",
      labels: "Labels for the data (e.g., x-axis and y-axis labels).",
      description: "A brief description of what the chart represents."
  });

  const chain = RunnableSequence.from([
    template,
    model,
    outputParser,
  ]);

  const result = await chain.invoke({
    context: responses[0],
    question,
    formatted_instructions: outputParser.getFormatInstructions()
  });

  return result;
}

// Main function to run the RAG application
async function main() {
  const loader = new PDFLoader("AnnualReport.pdf", {
    splitPages: false,
  });

  const question = `what was total wind power generation in 2022-23`;
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    separators: [". \n"],
  });

  const splittedDocs = await splitter.splitDocuments(docs);

  // Initialize the vector store
  const vectorStore = await initializeVectorStore(splittedDocs);

  // Query the vector store
  const response = await queryVectorStore(vectorStore, question);

  // Format and print the output
  const output = await formatOutput(question, response);
  console.log("result is: ", output);
}

// Run the main function
main();
