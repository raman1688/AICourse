import { OpenAI } from 'openai';
import { writeFileSync, createReadStream } from 'fs';

const openai = new OpenAI();

async function generateImages() {
    const response = await openai.images.generate({
        prompt: 'A painting of a forest',
        model: 'dall-e-3',
        style: 'vivid',
        size: '1024x1024',
        quality: 'standard',
        n: 1,
        response_format: 'b64_json'
    });

    const raw_image = response.data[0].b64_json;

    if(raw_image) {
        writeFileSync('forest.jpg', Buffer.from(raw_image, 'base64'));
    }
    console.log(response.data);
}

async function generateImageVariation() {
    const response = await openai.images.createVariation({
        image: createReadStream('forest.jpg'),
        response_format: 'b64_json',
        n: 1
    })

    const raw_image = response.data[0].b64_json;
    if (raw_image) {
        writeFileSync('forest_variation.jpg', Buffer.from(raw_image, 'base64'));
    }
}

async function editImage() {
    const response = await openai.images.edit({
        image: createReadStream('forest.jpg'),
        mask: createReadStream('mask.png'),
        prompt: 'Add a tiger hidden behind the trees',
        response_format: 'b64_json'
    });

    const raw_image = response.data[0].b64_json;
    if (raw_image) {
        writeFileSync('edited_forest.jpg', Buffer.from(raw_image, 'base64'));
    }
}


editImage();