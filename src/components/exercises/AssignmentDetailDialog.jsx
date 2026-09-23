import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import AssignmentTaskBody from "@/components/exercises/AssignmentTaskBody";

// Responsive task sheet: centered dialog on desktop, bottom drawer on mobile.
export default function AssignmentDetailDialog({ exercise, open, onOpenChange, onComplete, isCompleted, hasNext, onNext }) {
  const isMobile = useIsMobile();
  if (!exercise) return null;

  const title = <span className="font-display text-[20px] font-bold text-[#18181B]">{exercise.name}</span>;
  const body = (
    <AssignmentTaskBody
      key={exercise.key || exercise.name}
      exercise={exercise}
      isCompleted={isCompleted}
      onComplete={onComplete}
      hasNext={hasNext}
      onNext={onNext}
      onClose={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          <DrawerHeader className="text-left pb-2"><DrawerTitle>{title}</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">{body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader><DialogTitle className="text-left pr-6">{title}</DialogTitle></DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}