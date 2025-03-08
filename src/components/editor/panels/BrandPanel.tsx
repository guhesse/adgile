
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box, Layout2, Image } from "lucide-react";

export const BrandPanel = () => {
  return (
    <div className="h-full w-full overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 p-2 relative rounded-md overflow-hidden">
          <div className="inline-flex p-2 flex-[0_0_auto] bg-[#414651] rounded-lg items-center relative">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.53328 6.66666C5.44734 6.67135 5.36177 6.65218 5.28605 6.61128C5.21032 6.57037 5.14738 6.50932 5.10419 6.43487C5.061 6.36043 5.03924 6.27548 5.04131 6.18944C5.04339 6.1034 5.06922 6.0196 5.11594 5.94733L7.59994 1.99999C7.63898 1.92971 7.69551 1.87069 7.76405 1.82868C7.8326 1.78666 7.91084 1.76307 7.99118 1.76019C8.07153 1.7573 8.15126 1.77523 8.22264 1.81222C8.29402 1.84921 8.35464 1.90402 8.39861 1.97133L10.8666 5.93333C10.9153 6.00319 10.9439 6.08502 10.9493 6.16998C10.9548 6.25493 10.937 6.33976 10.8977 6.41529C10.8584 6.49082 10.7992 6.55417 10.7265 6.59848C10.6538 6.64278 10.5704 6.66636 10.4853 6.66666H5.53328Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M6 9.33329H2.66667C2.29848 9.33329 2 9.63177 2 9.99996V13.3333C2 13.7015 2.29848 14 2.66667 14H6C6.36819 14 6.66667 13.7015 6.66667 13.3333V9.99996C6.66667 9.63177 6.36819 9.33329 6 9.33329Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M11.6667 14C12.9553 14 14 12.9553 14 11.6666C14 10.378 12.9553 9.33329 11.6667 9.33329C10.378 9.33329 9.33333 10.378 9.33333 11.6666C9.33333 12.9553 10.378 14 11.6667 14Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>

          <div className="flex flex-col items-start gap-0.5 relative flex-1 grow">
            <div className="relative self-stretch mt-[-1px] text-[#414651] text-sm font-semibold leading-none overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Nome do cliente
            </div>
            <div className="relative self-stretch text-[#414651] text-xs font-normal leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Nome da campanha
            </div>
          </div>
        </div>
      </div>

      <Separator className="w-full" />

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="p-4 space-y-4">
          {/* Colors Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="colors" className="border-0">
              <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span className="text-sm">Colors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="ml-4 border-l pl-2">
                  <AccordionItem value="primary" className="border-0">
                    <AccordionTrigger className="py-1 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                      <div className="flex items-center gap-2">
                        <Layout2 className="h-4 w-4" />
                        <span className="text-sm">Primary</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 p-2">
                        <div className="h-12 rounded-md bg-[#2C1C5F]"></div>
                        <div className="h-12 rounded-md bg-[#42307D]"></div>
                        <div className="h-12 rounded-md bg-[#53389E]"></div>
                        <div className="h-12 rounded-md bg-[#7F56D9]"></div>
                        <div className="h-12 rounded-md bg-[#B692F6]"></div>
                        <div className="h-12 rounded-md bg-[#E9D7FE]"></div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="secondary" className="border-0">
                    <AccordionTrigger className="py-1 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                      <div className="flex items-center gap-2">
                        <Layout2 className="h-4 w-4" />
                        <span className="text-sm">Secondary</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 p-2">
                        <div className="h-12 rounded-md bg-[#B54708]"></div>
                        <div className="h-12 rounded-md bg-[#FDB022]"></div>
                        <div className="h-12 rounded-md bg-[#252B37]"></div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Logos Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="logos" className="border-0">
              <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span className="text-sm">Logos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="ml-4 border-l pl-2">
                  <AccordionItem value="primary-logos" className="border-0">
                    <AccordionTrigger className="py-1 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                      <div className="flex items-center gap-2">
                        <Layout2 className="h-4 w-4" />
                        <span className="text-sm">Primary</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};
