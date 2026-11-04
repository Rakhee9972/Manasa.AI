
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is missing"
      });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        error: "Gemini API request failed",
        details: data.error?.message || "Unknown Gemini error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "I couldn't generate a response.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

