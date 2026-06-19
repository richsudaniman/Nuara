import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsSection({ icon: Icon, title, description, color = "#A78BFA", children }) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}1A` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {description && <p className="text-xs text-gray-400">{description}</p>}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}