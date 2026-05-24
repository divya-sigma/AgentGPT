import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setCurrThreadId,
        setNewChat, setPrompt, setReply, setPrevChats
    } = useContext(MyContext);

    const { user, logout, getToken } = useAuth();

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/thread", {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            const data = await response.json();
            const filtered = data.map(t => ({ threadId: t.threadId, title: t.title }));
            setAllThreads(filtered);
        } catch (err) {
            console.error("Failed to fetch threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            const data = await response.json();
            setPrevChats(data);
            setNewChat(false);
            setReply(null);
            setPrompt("");
        } catch (err) {
            console.error("Failed to load thread:", err);
        }
    };

    const deleteThread = async (e, threadId) => {
        e.stopPropagation();
        try {
            await fetch(`http://localhost:8080/api/thread/${threadId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            console.error("Failed to delete thread:", err);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <button className="new-chat-btn" onClick={createNewChat} title="New Chat">
                    <span className="app-name">AgentGPT</span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            </div>

            <div className="sidebar-history">
                <p className="history-label">Recent</p>
                <ul className="history">
                    {allThreads?.map((thread, idx) => (
                        <li
                            key={idx}
                            onClick={() => changeThread(thread.threadId)}
                            className={`history-item ${thread.threadId === currThreadId ? "active" : ""}`}
                            title={thread.title}
                        >
                            <i className="fa-regular fa-message thread-icon"></i>
                            <span className="thread-title">{thread.title}</span>
                            <button
                                className="delete-btn"
                                onClick={(e) => deleteThread(e, thread.threadId)}
                                title="Delete"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sidebar-footer">
                <div className="user-info" onClick={logout} title="Click to logout">
                    <div className="user-avatar">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <i className="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
