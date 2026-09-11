import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

export default function ChatMessages({
  messages,
  currentUserType,
  typingUser,
  loading,
}) {

  const bottomRef = useRef(null);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [messages, typingUser]);

if (loading) {

  return (

    <div className="flex-1 flex items-center justify-center">

      <div className="animate-pulse text-gray-400">

        Loading conversation...

      </div>

    </div>

  );

}


  return (

    <div className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50">

      {/* Today */}

      <div className="flex justify-center mb-8">

        <span className="bg-white border rounded-full px-4 py-2 text-xs text-gray-500 shadow-sm">

          Today

        </span>

      </div>

      {messages.map((message) => (

        <ChatMessage

          key={message.id}

          message={message}

          currentUserType={currentUserType}

        />

      ))}

      {typingUser && (

        <div className="flex mb-6">

          <div className="bg-white border rounded-3xl rounded-tl-md px-5 py-4 shadow-sm">

            <div className="text-sm font-semibold mb-2">

              {typingUser}

            </div>

            <div className="flex gap-1">

              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>

              <span
                className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{
                  animationDelay: ".15s",
                }}
              ></span>

              <span
                className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{
                  animationDelay: ".3s",
                }}
              ></span>

            </div>

          </div>

        </div>

      )}

      <div ref={bottomRef} />

    </div>

  );

}