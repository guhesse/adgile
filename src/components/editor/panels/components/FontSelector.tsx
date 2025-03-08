
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FontSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const fonts = [
  "Inter",
  "Geist",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
];

export const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma fonte" />
      </SelectTrigger>
      <SelectContent>
        {fonts.map((font) => (
          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
