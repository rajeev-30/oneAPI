"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setMessages, setActiveConversationId, resetChat } from "@/store/slices/chatSlice";
import { useChatStream } from "@/lib/hooks/use-chat-stream";
import { getApiKeys } from "@/lib/api/keys";
import { getConversation, createConversation, updateConversation, getConversationTitles } from "@/lib/api/conversations";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ModelSelector } from "@/components/chat/model-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, Key, MessageSquare, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { store } from "@/store";
import { deleteConversation } from "@/lib/api/conversations";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const qc = useQueryClient();
    const dispatch = useAppDispatch();
    const convId = searchParams.get("conversation");
    const { send, abort, error, clearError } = useChatStream();
    const { messages, selectedModel, isStreaming, activeConversationId } = useAppSelector((s) => s.chat);
    const [apiKey, setApiKey] = useState<string | null>(null);

    const { data: keysData, isLoading: keysLoading } = useQuery({ queryKey: ["apiKeys"], queryFn: getApiKeys, retry: false });
    const { data: convTitles } = useQuery({ queryKey: ["conversations"], queryFn: () => getConversationTitles(1, "all"), staleTime: 30 * 1000 });
    const { data: conv, isLoading: convLoading } = useQuery({ queryKey: ["conversation", convId], queryFn: () => getConversation(convId!), enabled: !!convId });

    useEffect(() => { if (keysData?.length) setApiKey(keysData[0].key); }, [keysData]);
    useEffect(() => { if (conv) { dispatch(setMessages(conv.messages)); dispatch(setActiveConversationId(conv._id)); } }, [conv, dispatch]);
    useEffect(() => { if (!convId) dispatch(resetChat()); }, [convId, dispatch]);
    useEffect(() => { if (error) { toast.error(error); clearError(); } }, [error, clearError]);

    const handleNewChat = () => {
        dispatch(resetChat());
        router.push("/chat");
    };

    const handleSelectConv = (id: string) => router.push(`/chat?conversation=${id}`);

    const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteConversation(id);
        qc.invalidateQueries({ queryKey: ["conversations"] });
        if (convId === id) { dispatch(resetChat()); router.push("/chat"); }
    };

    const handleSend = useCallback(async (content: string) => {
        if (!apiKey) { toast.error("No API key"); return; }
        const all = [...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })), { role: "user" as const, content }];

        if (!activeConversationId && messages.length === 0) {
            try {
                const c = await createConversation({ title: content.slice(0, 50), messages: [{ role: "user", content }] });
                dispatch(setActiveConversationId(c._id));
                router.push(`/chat?conversation=${c._id}`);
                qc.invalidateQueries({ queryKey: ["conversations"] });
            } catch { /* continue */ }
        }

        await send(apiKey, { model: selectedModel, messages: all, stream: true });

        if (activeConversationId) {
            try {
                const latest = store.getState().chat.messages;
                const last = latest[latest.length - 1];
                if (last?.role === "assistant") await updateConversation(activeConversationId, { messages: [{ role: "user", content }, { role: "assistant", content: last.content }] });
            } catch { /* silent */ }
        }
    }, [apiKey, messages, selectedModel, activeConversationId, send, dispatch, router, qc]);

    if (!keysLoading && !apiKey) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={28} className="text-accent-amber mb-3" />
                <h2 className="text-lg font-semibold text-text-primary mb-2">API Key Required</h2>
                <p className="text-sm text-text-muted max-w-sm mb-4">Generate an API key to use the chat playground.</p>
                <Link href="/keys" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"><Key size={16} /> Generate Key</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-1 min-h-0">
            {/* Mini conversation sidebar */}
            <div className="w-52 border-r border-border-primary flex flex-col shrink-0 hidden md:flex">
                <div className="p-2 border-b border-border-secondary">
                    <button onClick={handleNewChat} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-medium text-text-primary bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors cursor-pointer"><Plus size={14} /> New Chat</button>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                    {convTitles?.data?.map((c) => (
                        <button key={c._id} onClick={() => handleSelectConv(c._id)} className={cn("group flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12px] transition-colors cursor-pointer", convId === c._id ? "bg-white/[0.08] text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]")}>
                            <MessageSquare size={12} className="shrink-0 opacity-50" />
                            <span className="flex-1 text-left truncate">{c.title}</span>
                            <button onClick={(e) => handleDeleteConv(e, c._id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-rose/10 hover:text-accent-rose transition-all cursor-pointer"><Trash2 size={10} /></button>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Model selector header */}
                <div className="h-10 border-b border-border-secondary flex items-center px-3">
                    <ModelSelector />
                </div>

                {convLoading ? (
                    <div className="flex-1 p-4 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="flex gap-3"><Skeleton className="w-7 h-7 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-full" /></div></div>)}</div>
                ) : (
                    <ChatMessages />
                )}
                <ChatInput onSend={handleSend} onStop={abort} disabled={!apiKey || keysLoading} />
            </div>
        </div>
    );
}
