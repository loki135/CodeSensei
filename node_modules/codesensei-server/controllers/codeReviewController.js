const cohere = require("../config/cohere");

const reviewCode = async (req, res) => {
  const { code, reviewType } = req.body;

  const prompt = `Review the following code for ${reviewType}. Suggest improvements, point out any bugs or performance issues:\n\n${code}`;

  try {
    const response = await cohere.generate({
      model: "command-r",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.6,
    });

    const suggestions = response.body.generations[0].text.trim();

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Cohere API Error:", error.message);
    return res.status(500).json({ error: "Failed to review code" });
  }
};

module.exports = { reviewCode };
