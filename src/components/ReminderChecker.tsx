import { useEffect, useRef } from "react";
import { getPieces } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ReminderChecker = () => {
  const notified = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const now = new Date();
      getPieces().forEach((p) => {
        if (!p.next_reminder_at) return;
        const due = new Date(p.next_reminder_at);
        if (due <= now && !notified.current.has(p.id)) {
          notified.current.add(p.id);
          toast(`Reminder: ${p.title}`, {
            description: p.next_step ?? "Next step",
            action: {
              label: "Open",
              onClick: () => navigate(`/piece/${p.id}`),
            },
          });
        }
      });
    };
    const id = setInterval(check, 60 * 1000);
    check();
    return () => clearInterval(id);
  }, [navigate]);

  return null;
};
