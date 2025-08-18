import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, X } from "lucide-react";
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
      <SheetContent 
        side="bottom" 
        className="max-h-[80vh] max-w-[540px] mx-auto px-0 pb-0 overflow-hidden"
        aria-label="Upgrade to Maker Pro"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl text-left">Upgrade to Maker Pro</SheetTitle>
                <SheetDescription className="text-sm text-left">
                  Unlock unlimited pieces & premium features
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-11 h-11 p-0 hover:bg-muted"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-6 space-y-6">
          {/* Features List */}
          <div className="grid gap-1.5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Subscription Plans */}
          <div className="space-y-2.5">
            {/* Yearly Plan - Recommended */}
            <div className="relative">
              <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground text-xs px-2 py-0.5">
                Best Value
              </Badge>
              <Button
                className="w-full h-auto p-3 flex-col items-start bg-primary/5 border-primary hover:bg-primary/10"
                variant="outline"
                onClick={() => handlePurchase(PRODUCT_IDS.PRO_YEARLY, "Yearly")}
                disabled={loading === PRODUCT_IDS.PRO_YEARLY}
              >
                <div className="w-full flex justify-between items-center">
                  <div className="text-left">
                    <div className="font-semibold text-base">Maker Pro — Yearly</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
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
              className="w-full h-auto p-3 flex-col items-start"
              variant="outline"
              onClick={() => handlePurchase(PRODUCT_IDS.PRO_MONTHLY, "Monthly")}
              disabled={loading === PRODUCT_IDS.PRO_MONTHLY}
            >
              <div className="w-full flex justify-between items-center">
                <div className="text-left">
                  <div className="font-semibold text-base">Maker Pro — Monthly</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
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

          {/* Footer Text */}
          <div className="text-center pb-4">
            <p className="text-xs text-muted-foreground">
              Subscriptions auto-renew until cancelled. Cancel anytime in your iOS Settings.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}