import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const AccordionContext = createContext<{
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  expanded: false,
  setExpanded: () => {},
});

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  children,
  className,
  defaultExpanded = false,
}: AccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <AccordionContext.Provider value={{ expanded, setExpanded }}>
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: AccordionTriggerProps) {
  const { expanded, setExpanded } = useContext(AccordionContext);

  return (
    <button
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 font-medium transition-all hover:bg-gray-50",
        expanded ? "border-b" : "",
        className
      )}
      onClick={() => setExpanded(prev => !prev)}
    >
      <div>{children}</div>
      <ChevronDown
        className={cn(
          "h-5 w-5 text-gray-500 transition-transform duration-300",
          expanded ? "rotate-180 transform" : ""
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  className,
}: AccordionContentProps) {
  const { expanded } = useContext(AccordionContext);

  return expanded ? (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300",
        expanded ? "animate-accordion-down" : "animate-accordion-up",
        className
      )}
    >
      <div className="px-4 py-3">{children}</div>
    </div>
  ) : null;
}
