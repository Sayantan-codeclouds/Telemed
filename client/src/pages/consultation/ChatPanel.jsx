import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import socket from "../../socket/socket";
import api from "../../api/axios";
import doctorApi from "../../api/doctorApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatPanel({ user, doctor }) {
  const { appointmentId } = useParams();
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const isDoctor = user?.type === "Doctor";
  const apiClient = isDoctor ? doctorApi : api;

  const chatQueryKey = ["chat-messages", appointmentId, isDoctor];

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: chatQueryKey,
    queryFn: async () => {
      const res = await apiClient.get(`/chat/${appointmentId}`);
      return res.data?.data || [];
    },
    enabled: !!appointmentId,
    meta: { onError: (err) => console.error("Failed to load chat history:", err) },
  });

  const setMessages = (updater) => {
    queryClient.setQueryData(chatQueryKey, (prev) =>
      typeof updater === "function" ? updater(prev || []) : updater
    );
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (!data) return;
      setMessages((prev) => {
        // If already exists with matching _id, ignore
        if (data._id && prev.some((m) => m._id === data._id)) {
          return prev;
        }
        // If matches a temporary message by sender + text, replace temp
        const tempIdx = prev.findIndex(
          (m) =>
            m.isTemp &&
            m.message === data.message &&
            m.senderType === data.senderType
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = data;
          return updated;
        }
        return [...prev, data];
      });
    };

    const handleTyping = (data) => setTypingUser(data.senderName);
    const handleStopTyping = () => setTypingUser("");

    socket.on("receive-message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [appointmentId, apiClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTypingChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", {
      roomId: appointmentId,
      senderName: user.name,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", {
        roomId: appointmentId,
      });
    }, 1200);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const textToSend = message.trim();
    if (!textToSend) return;

    // Optimistic UI update so the sender sees their message immediately
    const tempId = "temp-" + Date.now();
    const optimisticMsg = {
      _id: tempId,
      isTemp: true,
      appointment: appointmentId,
      senderType: user.type,
      senderId: {
        _id: user.id,
        firstName: user.name?.split(" ")?.[0] || user.type,
        lastName: user.name?.split(" ")?.slice(1)?.join(" ") || "",
        profileImage: user.profileImage,
      },
      message: textToSend,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");

    socket.emit("send-message", {
      appointmentId,
      roomId: appointmentId,
      senderType: user.type,
      senderName: user.name,
      senderId: user.id,
      message: textToSend,
      messageType: "TEXT",
    });

    socket.emit("stop-typing", {
      roomId: appointmentId,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 overflow-hidden select-none">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-xs">Loading chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4 space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-1">
              💬
            </div>
            <p className="text-xs font-bold text-slate-300">Session Chat Started</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              Exchange symptoms, clinical reports, or notes with {doctor ? `Dr. ${doctor.firstName}` : "the doctor"}.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderType === user.type;

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                  {isMe ? "You" : msg.senderName || msg.senderType}
                </span>

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed break-words shadow-xs ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs"
                  }`}
                >
                  {msg.message}
                </div>

                <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
            );
          })
        )}

        {typingUser && (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 italic bg-slate-800/80 px-3 py-1.5 rounded-xl w-fit border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
            <span className="ml-1">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0"
      >
        <Input
          value={message}
          onChange={handleTypingChange}
          placeholder="Type a clinical message..."
          className="h-10 bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-slate-500"
        />

        <Button
          type="submit"
          disabled={!message.trim()}
          className={`h-10 w-10 p-0 rounded-xl shrink-0 transition ${
            message.trim()
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}