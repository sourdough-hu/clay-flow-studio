import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { subscriptionService, PRODUCT_IDS } from "@/services/subscriptionService";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionChange?: () => void;
}

export default function SubscriptionBottomSheet({
  open,
  onOpenChange,
  onSubscriptionChange,
}: SubscriptionBottomSheetProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (productId: string, planName: string) => {
    if (!subscriptionService.isIOS()) {
      toast({
        title: "Purchases Available on iOS App",
        description: "In-app purchases are only available in the iOS version of this app.",
      });
      return;
    }

    setLoading(productId);
    
    try {
      const success = await subscriptionService.purchaseProduct(productId);
      
      if (success) {
        toast({
          title: "Welcome to Maker Pro! 🎉",
          description: "You now have access to unlimited pieces, photos, and premium features.",
        });
        onSubscriptionChange?.();
        onOpenChange(false);
      } else {
        toast({
          title: "Purchase cancelled",
          description: "No worries, you can upgrade anytime!",
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const features = [
    "Unlimited pieces & projects",
    "Unlimited photos per piece",
    "Cloud sync across devices",
    "Smart reminders & notifications",
    "Advanced stage tracking",
    "Priority customer support",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-6 pb-8">
        <SheetHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <SheetTitle className="text-2xl">Upgrade to Maker Pro</SheetTitle>
          <SheetDescription className="text-lg">
            Unlock unlimited pieces & photos, cloud sync, smart reminders, and more.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          <div className="grid gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {/* Yearly Plan - Recommended */}
          <div className="relative">
            <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
              Best Value
            </Badge>
            <Button
              className="w-full h-auto p-4 flex-col items-start bg-primary/5 border-primary hover:bg-primary/10"
              variant="outline"
              onClick={() => handlePurchase(PRODUCT_IDS.PRO_YEARLY, "Yearly")}
              disabled={loading === PRODUCT_IDS.PRO_YEARLY}
            >
              <div className="w-full flex justify-between items-center">
                <div className="text-left">
                  <div className="font-semibold text-base">Maker Pro — Yearly</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Save 40% • Best for serious makers
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">$29.99</div>
                  <div className="text-xs text-muted-foreground line-through">$59.88</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Monthly Plan */}
          <Button
            className="w-full h-auto p-4 flex-col items-start"
            variant="outline"
            onClick={() => handlePurchase(PRODUCT_IDS.PRO_MONTHLY, "Monthly")}
            disabled={loading === PRODUCT_IDS.PRO_MONTHLY}
          >
            <div className="w-full flex justify-between items-center">
              <div className="text-left">
                <div className="font-semibold text-base">Maker Pro — Monthly</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Try it out • Cancel anytime
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">$4.99</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Subscriptions auto-renew until cancelled. Cancel anytime in your iOS Settings.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}