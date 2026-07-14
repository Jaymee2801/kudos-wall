export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { tweet, why, recipient } = req.body;

    if (!tweet && !why) {
        return res.status(400).json({ error: "Please provide tweet content or reason." });
    }

    const prompt = `You are a warm, genuine appreciation writer for KudosWall — an onchain kudos platform built on Arc blockchain.

Someone wants to send kudos and USDC to appreciate another person. Based on the information below, write a SHORT, warm, genuine kudos message (2-3 sentences max).

Make it:
- Personal and specific to what they did
- Warm but not over the top
- Feel human, not like a bot wrote it
- End with something that acknowledges the permanent onchain nature of the appreciation

Tweet content or context: ${tweet || "Not provided"}
Why they deserve kudos: ${why || "Not provided"}
Recipient wallet: ${recipient ? recipient.slice(0,6) + "..." + recipient.slice(-4) : "unknown"}

Write ONLY the kudos message. No intro, no explanation, just the message itself.`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 200,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const message = data.content[0].text.trim();
        return res.status(200).json({ message });

    } catch (err) {
        return res.status(500).json({ error: "Failed to generate message: " + err.message });
    }
}
