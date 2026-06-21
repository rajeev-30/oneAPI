"use client";

import { useCallback, useState, useEffect, use, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setMessages, setActiveConversationId, resetChat } from "@/store/slices/chatSlice";
import { useChatStream } from "@/lib/hooks/use-chat-stream";
import { getApiKeys } from "@/lib/api/keys";
import { getConversation, createConversation, updateConversation, getConversationTitles } from "@/lib/api/conversations";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, Key, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { store } from "@/store";
import { deleteConversation } from "@/lib/api/conversations";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toggleSidebar } from "@/store/slices/uiSlice";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const qc = useQueryClient();
    const dispatch = useAppDispatch();
    const convId = searchParams.get("conversation");
    const { send, abort, error, clearError } = useChatStream();
    const { messages, selectedModel, isStreaming, activeConversationId } = useAppSelector((s) => s.chat);
    const { sidebarCollapsed, isMobile } = useAppSelector((s) => s.ui);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [searchChat, setSearchChat] = useState<string>("");

    const { data: keysData, isLoading: keysLoading } = useQuery({ queryKey: ["apiKeys"], queryFn: getApiKeys, retry: false });
    const { data: convTitles } = useQuery({ queryKey: ["conversations"], queryFn: () => getConversationTitles(1, "all"), staleTime: 30 * 1000 });
    const { data: conv, isLoading: convLoading } = useQuery({ queryKey: ["conversation", convId], queryFn: () => getConversation(convId!), enabled: !!convId });

    useEffect(() => { if (keysData?.length) setApiKey(keysData[0].key); }, [keysData]);
    useEffect(() => { if (conv) { dispatch(setMessages(conv.messages)); dispatch(setActiveConversationId(conv._id)); } }, [conv, dispatch]);
    useEffect(() => { if (!convId) dispatch(resetChat()); }, [convId, dispatch]);
    useEffect(() => { if (error) { toast.error(error); clearError(); } }, [error, clearError]);

    // 1. Debounce the search term
    const debouncedSearchChat = useDebounce(searchChat, 300);

    // 2. Filter based on the DEBOUNCED value
    const filteredTitles = useMemo(() => {
        const data = convTitles?.data || [];

        // If the debounced search is empty, show everything
        if (!debouncedSearchChat) return data;

        return data.filter((item) =>
            item.title.toLowerCase().includes(debouncedSearchChat.toLowerCase())
        );
    }, [debouncedSearchChat, convTitles]);


    const handleNewChat = () => {
        dispatch(resetChat());
        router.push("/playground");
    };

    const handleSelectConv = (id: string) => {
        router.push(`/playground?conversation=${id}`)
        if (isMobile && !sidebarCollapsed) dispatch(toggleSidebar());
    };

    const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteConversation(id);
        qc.invalidateQueries({ queryKey: ["conversations"] });
        if (convId === id) { dispatch(resetChat()); router.push("/playground"); }
    };

    const handleSend = useCallback(async (content: string) => {
        if (!apiKey) { toast.error("No API key"); return; }
        const all = [...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })), { role: "user" as const, content }];

        let currentConvId = activeConversationId;
        let isNewConversation = false;

        if (!currentConvId && messages.length === 0) {
            try {
                const c = await createConversation({ title: content.slice(0, 50), messages: [{ role: "user", content }] });
                currentConvId = c._id;
                isNewConversation = true;
                dispatch(setActiveConversationId(c._id));
                router.push(`/playground?conversation=${c._id}`);
                qc.invalidateQueries({ queryKey: ["conversations"] });
            } catch { /* continue */ }
        }

        await send(apiKey, { model: selectedModel, messages: all, stream: true });

        if (currentConvId) {
            try {
                const latest = store.getState().chat.messages;
                const last = latest[latest.length - 1];
                if (last?.role === "assistant") {
                    const messagesToSave = isNewConversation
                        ? [{ role: "assistant", content: last.content }]
                        : [{ role: "user", content }, { role: "assistant", content: last.content }];

                    await updateConversation(currentConvId, { messages: messagesToSave });
                }
            } catch { /* silent */ }
        }
    }, [apiKey, messages, selectedModel, activeConversationId, send, dispatch, router, qc]);

    if (keysLoading && !apiKey) return (
        <div className="flex-1 h-full pt-6 flex flex-col items-center justify-center text-center px-6">
            <div className="w-full max-w-sm space-y-4">
                <div className="flex justify-center">
                    <Skeleton className="w-12 h-12 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40 mx-auto" />
                    {/* <Skeleton className="h-4 w-64 mx-auto" /> */}
                    <Skeleton className="h-4 w-75 mx-auto" />
                </div>
                <div className="flex justify-center pt-2">
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>
                <div className="flex justify-center gap-2 pt-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                </div>
            </div>
        </div>
    );

    if (!keysLoading && !apiKey) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-center">
                <AlertCircle size={35} className="text-accent-amber mb-3" />
                <h2 className="text-lg font-semibold text-text-primary mb-2">API Key Required</h2>
                <p className="text-sm text-text-muted max-w-sm mb-4">Generate an API key to use the chat playground.</p>
                <Link href="/keys" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"><Key size={16} /> Generate Key</Link>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 overflow-hidden">
            {/* Mini conversation sidebar */}
            <div
                className={cn(
                    "w-70 flex flex-col border-r border-border-primary bg-surface-secondary transition-all duration-200 z-40",
                    isMobile ? "fixed left-0 top-14 bottom-0" : "relative shrink-0",
                    sidebarCollapsed 
                        ? (isMobile ? "-translate-x-full w-70 opacity-0 border-r-0" : "w-0 opacity-0 border-r-0")
                        : "w-70 translate-x-0 opacity-100 border-r border-border-primary"
                )}>
                <div className="p-2 border-b border-border-secondary">
                    <button onClick={handleNewChat} className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-xs font-medium text-text-primary bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors cursor-pointer"><Plus size={14} /> New Chat</button>
                </div>
                <div className="w-full px-2 py-2">
                    <Input placeholder="Search rooms..." value={searchChat} onChange={(e) => setSearchChat(e.target.value)} icon={<Search size={14} />} className="h-8.5 text-xs" />
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                    {filteredTitles.length > 0 ? filteredTitles.map((c) => (
                        <div
                            key={c._id}
                            className={cn(
                                "group flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[14px] transition-colors cursor-pointer",
                                convId === c._id
                                    ? "bg-white/[0.08] text-text-primary"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.08]"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => handleSelectConv(c._id)}
                                className="flex flex-1 min-w-0 items-center gap-1.5 text-left cursor-pointer"
                            >
                                <MessageSquare size={12} className="shrink-0 opacity-50" />
                                <span className="flex-1 truncate">{c.title}</span>
                            </button>

                            <button
                                type="button"
                                onClick={(e) => handleDeleteConv(e, c._id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-rose/10 hover:text-accent-rose transition-all cursor-pointer"
                                aria-label="Delete conversation"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )) :
                        <div className="text-sm text-text-secondary h-full flex justify-center items-center my-auto">No conversations found.</div>}
                </div>
            </div>

            {/* Chat area */}
            <div className="max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
                {convLoading ? (
                    <div className="flex-1 p-4 space-y-4">
                        {[...Array(5)].map((_, i) =>
                            <div key={i} className="flex gap-5">
                                <Skeleton className="w-7 h-7 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <ChatMessages />
                )}
                <ChatInput onSend={handleSend} onStop={abort} disabled={!apiKey || keysLoading} />
            </div>
        </div>
    );
}
