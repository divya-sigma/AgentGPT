import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }
        if (!prevChats?.length) return;

        const words = reply.split(" ");
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 35);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply]);

    return (
        <div className="chat-container">
            {newChat && (
                <div className="welcome">
                    <div className="welcome-icon">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <h1>How can I help you today?</h1>
                    <p>AgentGPT is ready to assist you with anything.</p>
                </div>
            )}

            <div className="chats">
                {prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div className="gpt-message">
                                <div className="gpt-avatar"><i className="fa-solid fa-robot"></i></div>
                                <div className="gpt-content">
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && (
                    <div className="gptDiv">
                        <div className="gpt-message">
                            <div className="gpt-avatar"><i className="fa-solid fa-robot"></i></div>
                            <div className="gpt-content">
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                    {latestReply === null
                                        ? prevChats[prevChats.length - 1]?.content
                                        : latestReply}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

export default Chat;
