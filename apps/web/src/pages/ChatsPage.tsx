import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, mediaUrl } from '@/lib/api';
import { MessageCircle, ChevronLeft, FileText } from 'lucide-react';

export function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.chats.list(),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chats', selectedChatId, 'messages'],
    queryFn: () => api.chats.messages(selectedChatId!, { limit: 100 }),
    enabled: !!selectedChatId,
  });

  const selectedChat = chats?.find((c) => c.id === selectedChatId);

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">טוען שיחות...</p>
      </div>
    );
  }

  if (selectedChatId && selectedChat) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <header className="flex items-center gap-3 pb-4 border-b border-border">
          <button
            type="button"
            onClick={() => setSelectedChatId(null)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
            aria-label="חזרה"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{selectedChat.name || selectedChat.remoteId}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedChat._count.messages} הודעות בתיעוד
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messagesLoading ? (
            <p className="text-muted-foreground text-center">טוען הודעות...</p>
          ) : (
            messagesData?.items.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.fromMe ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.fromMe
                      ? 'bg-primary text-primary-foreground rounded-bl-md'
                      : 'bg-muted rounded-br-md'
                  }`}
                >
                  {msg.mediaPath && (
                    <div className="mb-1">
                      {msg.mediaType?.startsWith('image/') ? (
                        <img
                          src={mediaUrl(msg.mediaPath)}
                          alt=""
                          className="rounded-lg max-w-full max-h-64 object-cover"
                        />
                      ) : msg.mediaType?.startsWith('video/') ? (
                        <video
                          src={mediaUrl(msg.mediaPath)}
                          controls
                          className="rounded-lg max-w-full max-h-64"
                        />
                      ) : (
                        <a
                          href={mediaUrl(msg.mediaPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm underline"
                        >
                          <FileText className="w-4 h-4" />
                          קובץ מצורף
                        </a>
                      )}
                    </div>
                  )}
                  {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
                  <p className="text-xs opacity-80 mt-1">
                    {new Date(msg.timestamp).toLocaleString('he-IL')}
                  </p>
                </div>
              </div>
            ))
          )}
          {messagesData?.items.length === 0 && !messagesLoading && (
            <p className="text-muted-foreground text-center py-8">
              אין הודעות מתועדות עדיין. הודעות נכנסות יישמרו אוטומטית.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">היסטוריית שיחות</h1>
      <p className="text-muted-foreground text-sm mb-6">
        תיעוד הודעות נכנסות, תמונות וסרטונים. בחר שיחה לצפייה.
      </p>
      {!chats?.length ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>אין שיחות מתועדות עדיין.</p>
          <p className="text-sm mt-1">הודעות נכנסות יישמרו אוטומטית לאחר התחברות ל-WhatsApp.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => setSelectedChatId(chat.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-right"
              >
                <span className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{chat.name || chat.remoteId}</div>
                  <div className="text-sm text-muted-foreground">
                    {chat._count.messages} הודעות
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
