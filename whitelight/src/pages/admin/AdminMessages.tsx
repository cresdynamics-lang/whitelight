import { useEffect, useState } from "react";
import { contactService, type ContactSubmission } from "@/services/contactService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await contactService.getAll();
      setMessages(data);
    } catch {
      toast.error("Failed to load contact messages");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSelect = async (msg: ContactSubmission) => {
    setSelected(msg);
    if (!msg.isRead) {
      await contactService.markAsRead(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await contactService.delete(id);
    if (ok) {
      toast.success("Message deleted");
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground mt-1">
          Enquiries from the contact page (not checkout orders — see Orders)
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-muted-foreground">Contact form submissions appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selected?.id === msg.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelect(msg)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{msg.name}</span>
                        {!msg.isRead && (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:sticky lg:top-6 h-fit">
            {selected ? (
              <>
                <CardHeader className="border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{selected.subject}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(selected.id)}
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="font-medium">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {selected.email}
                  </a>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selected.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a message to read</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
