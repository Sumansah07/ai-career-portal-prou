const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('Testing Gemini API...');
  console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Test different model names
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Hello, please respond with "Test successful"');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} works! Response:`, text);
      break; // Stop at first working model
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
    }
  }
}

testGemini().catch(console.error);
