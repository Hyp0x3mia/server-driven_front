import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle } from 'lucide-react';

const MythBuster = ({ misconceptions, className }) => {
  if (!misconceptions || misconceptions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-400 font-semibold text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className='text-slate-100'>常见误解</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 px-3 text-slate-300">
            <ul className="space-y-2 list-disc list-inside">
              {misconceptions.map((myth, index) => (
                <li key={index}>{myth}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default MythBuster;
