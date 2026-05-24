import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const {
        prompt, setPrompt,
        reply, setReply,
        currThreadId,
        setPrevChats, setNewChat
    } = useContext(MyContext);

    const { logout, getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getReply = async () => {
        if (!prompt.trim() || loading) return;

        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ message: prompt, threadId: currThreadId })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("API error:", data.error);
                setLoading(false);
                return;
            }

            setReply(data.reply);
        } catch (err) {
            console.error("Fetch error:", err);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => ([
                ...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            getReply();
        }
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbar-left">
                    <span className="model-label">
                        AgentGPT <i className="fa-solid fa-chevron-down"></i>
                    </span>
                </div>
                <div className="navbar-right" ref={dropdownRef}>
                    <div
                        className="userIconDiv"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        title="Account"
                    >
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    </div>
                    {isDropdownOpen && (
                        <div className="dropDown">
                            <div className="dropDownItem">
                                <i className="fa-solid fa-gear"></i> Settings
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan
                            </div>
                            <div className="dropDownDivider"></div>
                            <div className="dropDownItem danger" onClick={logout}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Chat />

            {loading && (
                <div className="loader-wrapper">
                    <ScaleLoader color="#339cff" height={18} width={3} radius={3} margin={2} loading={loading} />
                </div>
            )}

            <div className="chatInput">
                <div className="inputBox">
                    <textarea
                        placeholder="Message AgentGPT"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        id="submit"
                        onClick={getReply}
                        disabled={!prompt.trim() || loading}
                        title="Send"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <p className="info">
                    AgentGPT can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
