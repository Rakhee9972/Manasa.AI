
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OpenAI API key is missing"
      });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: "You are Manasa.AI, a friendly and helpful assistant. Support Telugu, English and Kannada. Reply in the language used by the user. Be kind, respectful, honest and helpful.",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(502).json({
        error: "OpenAI API request failed",
        details: data.error?.message || "Unknown API error"
      });
    }

    const reply = data.output
      ?.flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("") || "Please try again ❤️";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
