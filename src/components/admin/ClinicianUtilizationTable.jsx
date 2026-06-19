import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

function complianceColor(pct) {
  if (pct >= 70) return "text-green-600 bg-green-50";
  if (pct >= 40) return "text-amber-600 bg-amber-50";
  return "text-red-500 bg-red-50";
}

export default function ClinicianUtilizationTable({ clinicians }) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-bold text-gray-900">Clinician utilization</h3>
          <p className="text-xs text-gray-400 mt-0.5">Caseload, homework output, and client compliance per clinician</p>
        </div>

        {clinicians.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
            <p className="text-sm">No clinicians on the practice yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wide border-y border-gray-100">
                  <th className="text-left font-bold px-6 py-3">Clinician</th>
                  <th className="text-center font-bold px-3 py-3">Caseload</th>
                  <th className="text-center font-bold px-3 py-3">Active</th>
                  <th className="text-center font-bold px-3 py-3">Homework</th>
                  <th className="text-center font-bold px-6 py-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clinicians.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#A78BFA]/15 flex items-center justify-center text-[#7c5cd6] font-bold text-xs flex-shrink-0">
                          {(c.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[180px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3.5 font-bold text-gray-900">{c.caseloadSize}</td>
                    <td className="text-center px-3 py-3.5 text-gray-600">{c.activeCaseload}</td>
                    <td className="text-center px-3 py-3.5 text-gray-600">{c.homeworkPlans}</td>
                    <td className="text-center px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${complianceColor(c.complianceAvg)}`}>
                        {c.complianceAvg}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}