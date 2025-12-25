import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = "default" // "default" | "success" | "info"
}) {
  const bgColors = {
    default: "bg-gray-50",
    success: "bg-green-50",
    info: "bg-blue-50",
  };

  const iconColors = {
    default: "text-gray-400",
    success: "text-green-500",
    info: "text-blue-500",
  };

  return (
    <Card className="bg-gray-50 border-0 shadow-none rounded-3xl">
      <CardContent className="p-12 text-center">
        {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}