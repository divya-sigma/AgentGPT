import "dotenv/config";

const getOpenAIAPIResponse = async (messages) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are AgentGPT, a helpful and intelligent AI assistant. Be clear, concise, and friendly."
                },
                ...messages
            ]
        })
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const data = await response.json();

        if (data.error) {
            console.error("OpenAI API Error:", data.error.message);
            throw new Error(data.error.message);
        }

        return data.choices[0].message.content;
    } catch (err) {
        console.error("OpenAI fetch error:", err.message);
        throw err;
    }
};

export default getOpenAIAPIResponse;
