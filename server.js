const express = require("express");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.API_KEY;

async function runChat(conversationHistory) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    language: "id",
  });

  const generationConfig = {
    temperature: 1,
    topK: 1,
    topP: 1,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ];

  // Ensure the history format is correct
  const chatHistory = conversationHistory.map((entry) => ({
    role: entry.role === "bot" ? "model" : "user",
    parts: [{ text: entry.text }],
  }));

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });

  const result = await chat.sendMessage(chatHistory[chatHistory.length - 1].parts[0].text);
  return result.response.text();
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
app.get("/loader.gif", (req, res) => {
  res.sendFile(__dirname + "/loader.gif");
});
app.get("/Pose1.png", (req, res) => {
  res.sendFile(__dirname + "/Pose1.png");
});
app.get("/Pose2.png", (req, res) => {
  res.sendFile(__dirname + "/Pose2.png");
});
app.post("/chat", async (req, res) => {
  try {
    const conversationHistory = req.body.conversationHistory;
    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const response = await runChat(conversationHistory);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
