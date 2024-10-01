import { OpenAI } from "openai";
import { writeFileSync } from "fs";

const openai = new OpenAI();

async function generateAudio() {
  const response = await openai.audio.speech.create({
    input: "Hello world! This is a streaming test",
    model:"tts-1",
    voice:"alloy",
    response_format: "mp3",
  });

  console.log(response);
  response.stream_to_file("output.mp3")
}

generateAudio();
