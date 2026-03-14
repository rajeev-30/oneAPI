import { useState } from "react";
import { useChat } from "../hooks/useChat";

export const Chat = () => {
    const [input,    setInput]    = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const { response, loading, error, sendMessage } = useChat();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [
            ...messages,
            { role: "user", content: input }
        ];

        setMessages(newMessages);
        setInput("");

        await sendMessage(newMessages);
    };

    return (
        <div className="flex flex-col h-screen p-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-lg ${
                        msg.role === "user" 
                            ? "bg-blue-100 ml-auto" 
                            : "bg-gray-100"
                    }`}>
                        {msg.content}
                    </div>
                ))}

                {/* ✅ Show streaming response in real time */}
                {loading && response && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                        {response}
                        <span className="animate-pulse">▌</span> {/* cursor */}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={loading}
                    className="flex-1 border rounded-lg p-2"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {loading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
};