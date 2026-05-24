import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// Get all threads for logged-in user
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        return res.json(threads);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get single thread messages
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId, userId: req.user.id });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        return res.json(thread.messages);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch thread" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deleted = await Thread.findOneAndDelete({ threadId, userId: req.user.id });
        if (!deleted) {
            return res.status(404).json({ error: "Thread not found" });
        }
        return res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Send a chat message
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields: threadId and message" });
    }

    try {
        let thread = await Thread.findOne({ threadId, userId: req.user.id });

        if (!thread) {
            thread = new Thread({
                threadId,
                userId: req.user.id,
                title: message.slice(0, 60),
                messages: []
            });
        }

        thread.messages.push({ role: "user", content: message });

        const historyForAI = thread.messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const assistantReply = await getOpenAIAPIResponse(historyForAI);

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        return res.json({ reply: assistantReply });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong: " + err.message });
    }
});

export default router;
