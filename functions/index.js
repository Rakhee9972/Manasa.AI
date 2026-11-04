
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");

const openaiKey = defineSecret("OPENAI_API_KEY");

exports.chat = onRequest(
  {
    secrets: [openaiKey],
    cors: ["https://rakhee9972.github.io"]
  },
  async (req, res) => {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Only POST requests are allowed"
      });
    }

    try {
      const message = req.body?.message;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Please enter a message"
        });
      }

      if (message.length > 3000) {
        return res.status(400).json({
          error: "Message is too long"
        });
      }

      const client = new OpenAI({
        apiKey: openaiKey.value()
      });

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        instructions: `
You are Manasa.AI, a friendly and helpful AI assistant.

Your communication style:
- Be kind, warm and respectful.
- Support Telugu, English and Kannada.
- Reply in the language used by the user.
- Help with everyday questions, learning and general knowledge.
- Be honest and never pretend to be human.
- Never claim to have personal memories or feelings.
- Keep answers clear and useful.
        `,
        input: message
      });

      return res.status(200).json({
        reply: response.output_text || "Please try again ❤️"
      });

    } catch (error) {
      console.error("Manasa AI Error:", error);

      return res.status(500).json({
        error: "AI service is temporarily unavailable."
      });
    }
  }
);
    
