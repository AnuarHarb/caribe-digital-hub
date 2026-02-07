import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("membresia.faq.q1.question"),
      answer: t("membresia.faq.q1.answer"),
    },
    {
      question: t("membresia.faq.q2.question"),
      answer: t("membresia.faq.q2.answer"),
    },
    {
      question: t("membresia.faq.q3.question"),
      answer: t("membresia.faq.q3.answer"),
    },
    {
      question: t("membresia.faq.q4.question"),
      answer: t("membresia.faq.q4.answer"),
    },
    {
      question: t("membresia.faq.q5.question"),
      answer: t("membresia.faq.q5.answer"),
    },
  ];
  
  return (
    <section id="faq" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              {t("membresia.faq.title")}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
