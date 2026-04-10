import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Sparkles, X, Zap, MessageSquare, Plus, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

// ═══════════════════════════════════════════════════════════════
// AI CHAT PANEL — Enhanced, Capable, Less Restrictive
// Functions like a true creative AI assistant (Manus-style)
// ═══════════════════════════════════════════════════════════════

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
}

interface ChatAction {
  type: "apply-color" | "apply-font" | "add-text" | "generate-image" | "copy";
  label: string;
  data: string;
}

interface AIChatPanelProps {
  onClose: () => void;
  projectId?: number;
  projectName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  brandKit?: any;
  onApplyColor?: (hex: string) => void;
  onApplyFont?: (family: string) => void;
  onAddText?: (text: string) => void;
  onAddImage?: (url: string) => void;
  onSetBackground?: (color: string) => void;
}

export default function AIChatPanel({
  onClose, projectId, projectName, canvasWidth, canvasHeight, brandKit,
  onApplyColor, onApplyFont, onAddText, onAddImage, onSetBackground,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey! I'm **ManuScript AI** — your creative design partner. I'm here to help you build something amazing, not just answer questions.

**What I can do:**
- Generate complete layouts from a description
- Create color palettes and suggest font pairings
- Write compelling copy, headlines, and captions
- Generate backgrounds and design elements
- Critique your design and suggest improvements
- Help with brand strategy and social media content

Just tell me what you need. No restrictions, no unnecessary disclaimers — just results. 🎨`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSessions, setShowSessions] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.ai.chat.useMutation();

  // Chat sessions
  const sessionsQuery = trpc.ai.chatSessions.list.useQuery();
  const createSessionMutation = trpc.ai.chatSessions.create.useMutation({
    onSuccess: (data: any) => {
      setActiveSessionId(data.id);
      sessionsQuery.refetch();
    },
  });

  const sessions = sessionsQuery.data || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseActionsFromResponse = useCallback((content: string): ChatAction[] => {
    const actions: ChatAction[] = [];

    // Detect hex colors
    const hexMatches = content.match(/#[0-9A-Fa-f]{6}/g);
    if (hexMatches) {
      const unique = [...new Set(hexMatches)].slice(0, 5);
      unique.forEach((hex) => {
        actions.push({ type: "apply-color", label: `Apply ${hex}`, data: hex });
      });
    }

    // Detect quoted text that could be copy
    if (content.includes('"')) {
      const quotes = content.match(/"([^"]{5,100})"/g);
      if (quotes) {
        quotes.slice(0, 3).forEach((q) => {
          const text = q.replace(/"/g, "");
          actions.push({ type: "add-text", label: `Add: "${text.slice(0, 25)}..."`, data: text });
        });
      }
    }

    return actions;
  }, []);

  const executeAction = useCallback((action: ChatAction) => {
    switch (action.type) {
      case "apply-color":
        onApplyColor?.(action.data);
        break;
      case "apply-font":
        onApplyFont?.(action.data);
        break;
      case "add-text":
        onAddText?.(action.data);
        break;
      case "copy":
        navigator.clipboard.writeText(action.data);
        break;
    }
  }, [onApplyColor, onApplyFont, onAddText]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        history: messages
          .filter((m) => m.role !== "assistant" || messages.indexOf(m) !== 0)
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content })),
        sessionId: activeSessionId || undefined,
        context: {
          canvasWidth,
          canvasHeight,
          projectName,
          brandKit,
        },
      });

      const actions = parseActionsFromResponse(result.response);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response, actions },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong, but I'm not giving up. Try rephrasing your request or let me try a different approach.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const quickActions = [
    { label: "🎨 Generate layout", prompt: "Generate a professional layout for my current canvas. Make it visually striking with good hierarchy." },
    { label: "🎯 Suggest colors", prompt: "Suggest a beautiful color palette for my design. Give me specific hex codes." },
    { label: "✍️ Write headlines", prompt: "Write 5 compelling headline options for my design. Be creative and bold." },
    { label: "🔤 Font pairing", prompt: "Suggest the perfect font pairing for my design. Include specific Google Fonts with weights." },
    { label: "🔍 Critique design", prompt: "Critique my current design. Be honest and specific about what works and what could improve." },
    { label: "📱 Social caption", prompt: "Write an engaging social media caption for this design. Include hashtags." },
    { label: "🖼️ Background ideas", prompt: "Suggest 3 creative background ideas for my canvas. Be specific about colors, gradients, or patterns." },
    { label: "💡 Brand strategy", prompt: "Help me develop a brand identity strategy. What colors, fonts, and tone should I use?" },
  ];

  const startNewChat = () => {
    setMessages([messages[0]]);
    setShowQuickActions(true);
    setActiveSessionId(null);
    createSessionMutation.mutate({ projectId: projectId || undefined });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">ManuScript AI</h3>
            <p className="text-[10px] text-muted-foreground">Creative Assistant — No limits</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setShowSessions(!showSessions)}
            title="Chat Sessions"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={startNewChat}
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sessions Panel */}
      {showSessions && (
        <div className="p-2 border-b border-border max-h-40 overflow-y-auto bg-secondary/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 px-1">Chat History</p>
          {sessions.map((session: any) => (
            <button
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                const sessionMessages = (session.messages as any[]) || [];
                setMessages([
                  messages[0],
                  ...sessionMessages.map((m: any) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                  })),
                ]);
                setShowSessions(false);
                setShowQuickActions(false);
              }}
              className={`w-full text-left p-2 rounded-lg text-xs mb-1 transition-all ${
                activeSessionId === session.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary"
              }`}
            >
              <p className="font-medium truncate text-card-foreground">{session.title}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(session.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">No saved sessions</p>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-card-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {msg.actions.map((action, j) => (
                      <button
                        key={j}
                        onClick={() => executeAction(action)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-[10px] font-medium transition-colors border border-primary/20"
                      >
                        {action.type === "apply-color" && (
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: action.data }} />
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary rounded-xl px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {showQuickActions && messages.length <= 2 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.prompt)}
                className="px-2.5 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded-full text-[10px] text-muted-foreground hover:text-card-foreground transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your design..."
            className="h-8 text-xs bg-secondary"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="w-8 h-8 shrink-0"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1 text-center">
          ManuScript AI — No restrictions. Just results.
        </p>
      </div>
    </div>
  );
}
