const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Manually read .env.local
const envPath = path.resolve(__dirname, '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Match GEMINI_API_KEY=... possibly with quotes
    const match = envContent.match(/GEMINI_API_KEY=['"]?([^'"\n\r]+)['"]?/);
    apiKey = match ? match[1].trim() : '';
} catch (e) {
    console.error("Could not read .env.local:", e.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

async function run() {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-3-flash-preview";

    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (e) {
        console.error("Error generating content:", e.message);
        if (e.message.includes("404") || e.message.includes("not found")) {
            console.log("\nTry testing with 'gemini-1.5-flash'...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            try {
                const result = await fallbackModel.generateContent("Hello?");
                console.log("Success with gemini-1.5-flash! Response:", result.response.text());
                console.log("Recommendation: Update model name to 'gemini-1.5-flash'");
            } catch (e2) {
                console.error("Error with fallback model:", e2.message);
            }
        }
    }
}

run();
