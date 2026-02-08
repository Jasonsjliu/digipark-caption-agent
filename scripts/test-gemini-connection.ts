import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple env loader
import fs from 'fs';
import path from 'path';

console.log('Starting Gemini API Test...');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {} as Record<string, string>);
    apiKey = envVars.GEMINI_API_KEY;
}

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment or .env.local');
    process.exit(1);
}

console.log('API Key found (starts with):', apiKey.substring(0, 8) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await model.generateContent('Hello, just testing connectivity. Reply with "OK".');
        const response = result.response;
        const text = response.text();
        console.log('✅ Success! Response:', text);
        return true;
    } catch (error: any) {
        console.error('❌ Failed!');
        console.error('Error details:', error.message || error);
        return false;
    }
}

async function run() {
    // Test 1: gemini-3-flash-preview (Current configuration)
    await testModel('gemini-3-flash-preview');

    // Test 2: gemini-1.5-flash (Known stable)
    await testModel('gemini-1.5-flash');

    // Test 3: gemini-2.0-flash (Alternative)
    await testModel('gemini-2.0-flash');
}

run();
