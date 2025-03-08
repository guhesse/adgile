
import React from "react";

type ButtonProps = {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

type ButtonGroupProps = {
  buttons: ButtonProps[];
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => {
  return (
    <div className="flex gap-1 ml-3">
      {buttons.map((button, index) => (
        <button
          key={index}
          className={`p-2 rounded ${
            button.active
              ? "bg-purple-100 text-purple-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={button.onClick}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};
