
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "../../utils/gridUtils";

// Function to add a new element to the canvas
export const createNewElement = (
  type: EditorElement["type"],
  selectedSize: BannerSize
): EditorElement => {
  const newElement: EditorElement = {
    id: Date.now().toString(),
    type,
    content: type === "text" || type === "paragraph" ? "Text Element" :
      type === "button" ? "Button Element" :
        type === "divider" ? "" :
          type === "spacer" ? "" :
            type === "logo" ? "" :
              type === "video" ? "" : "",
    inContainer: false,
    style: {
      x: snapToGrid(100),
      y: snapToGrid(100),
      width: snapToGrid(
        type === "text" || type === "paragraph" ? 200 :
          type === "image" || type === "logo" ? 150 :
            type === "video" ? 320 :
              type === "divider" ? 300 :
                type === "spacer" ? 100 : 200
      ),
      height: snapToGrid(
        type === "text" ? 40 :
          type === "paragraph" ? 100 :
            type === "image" || type === "logo" ? 150 :
              type === "video" ? 180 :
                type === "divider" ? 2 :
                  type === "spacer" ? 50 : 50
      ),
      fontSize: type === "text" || type === "paragraph" ? 16 : undefined,
      color: type === "text" || type === "paragraph" ? "#000000" : undefined,
      fontFamily: type === "text" || type === "paragraph" ? "Inter" : undefined,
      lineHeight: type === "text" || type === "paragraph" ? 1.5 : undefined,
      textAlign: type === "text" || type === "paragraph" ? "left" : undefined,
      backgroundColor: type === "button" ? "#1a1f2c" :
        type === "divider" ? "#d1d5db" :
          type === "spacer" ? undefined : undefined,
      padding: type === "button" ? "8px 16px" : undefined,
    },
    sizeId: selectedSize.name,
  };

  // Calculate percentage values for the element
  const xPercent = (newElement.style.x / selectedSize.width) * 100;
  const yPercent = (newElement.style.y / selectedSize.height) * 100;
  const widthPercent = (newElement.style.width / selectedSize.width) * 100;
  const heightPercent = (newElement.style.height / selectedSize.height) * 100;

  // Add percentage values
  newElement.style.xPercent = xPercent;
  newElement.style.yPercent = yPercent;
  newElement.style.widthPercent = widthPercent;
  newElement.style.heightPercent = heightPercent;

  return newElement;
};

// Function to create a layout element
export const createLayoutElement = (
  template: any,
  selectedSize: BannerSize,
  elements: EditorElement[]
): EditorElement => {
  const lastY = elements.length > 0
    ? Math.max(...elements.map(el => el.style.y + el.style.height)) + 20
    : 20;

  const layoutWidth = selectedSize.width - 40;
  const layoutElement: EditorElement = {
    id: Date.now().toString(),
    type: "layout",
    content: template.name,
    inContainer: false,
    style: {
      x: 20,
      y: snapToGrid(lastY),
      width: layoutWidth,
      height: 150,
      backgroundColor: "#ffffff",
      padding: "10px",
    },
    columns: template.columns,
    childElements: [],
    sizeId: selectedSize.name,
  };

  // Calculate percentage values
  layoutElement.style.xPercent = (layoutElement.style.x / selectedSize.width) * 100;
  layoutElement.style.yPercent = (layoutElement.style.y / selectedSize.height) * 100;
  layoutElement.style.widthPercent = (layoutElement.style.width / selectedSize.width) * 100;
  layoutElement.style.heightPercent = (layoutElement.style.height / selectedSize.height) * 100;

  // Add preset content if needed
  if (template.type === "preset") {
    if (template.id === "preset-image-text") {
      layoutElement.childElements = [
        {
          id: Date.now().toString() + "-1",
          type: "image",
          content: "",
          inContainer: true,
          parentId: layoutElement.id,
          style: {
            x: 0,
            y: 0,
            width: layoutWidth / 2 - 5,
            height: 130,
            xPercent: 0,
            yPercent: 0,
            widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
            heightPercent: (130 / 150) * 100
          },
          sizeId: selectedSize.name
        },
        {
          id: Date.now().toString() + "-2",
          type: "text",
          content: "Add your text here",
          inContainer: true,
          parentId: layoutElement.id,
          style: {
            x: layoutWidth / 2 + 5,
            y: 0,
            width: layoutWidth / 2 - 5,
            height: 130,
            fontSize: 16,
            color: "#000000",
            fontFamily: "Inter",
            lineHeight: 1.5,
            textAlign: "left",
            xPercent: ((layoutWidth / 2 + 5) / layoutWidth) * 100,
            yPercent: 0,
            widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
            heightPercent: (130 / 150) * 100
          },
          sizeId: selectedSize.name
        }
      ];
    } else if (template.id === "preset-text-text") {
      layoutElement.childElements = [
        {
          id: Date.now().toString() + "-1",
          type: "text",
          content: "First column text",
          inContainer: true,
          parentId: layoutElement.id,
          style: {
            x: 0,
            y: 0,
            width: layoutWidth / 2 - 5,
            height: 130,
            fontSize: 16,
            color: "#000000",
            fontFamily: "Inter",
            lineHeight: 1.5,
            textAlign: "left",
            xPercent: 0,
            yPercent: 0,
            widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
            heightPercent: (130 / 150) * 100
          },
          sizeId: selectedSize.name
        },
        {
          id: Date.now().toString() + "-2",
          type: "text",
          content: "Second column text",
          inContainer: true,
          parentId: layoutElement.id,
          style: {
            x: layoutWidth / 2 + 5,
            y: 0,
            width: layoutWidth / 2 - 5,
            height: 130,
            fontSize: 16,
            color: "#000000",
            fontFamily: "Inter",
            lineHeight: 1.5,
            textAlign: "left",
            xPercent: ((layoutWidth / 2 + 5) / layoutWidth) * 100,
            yPercent: 0,
            widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
            heightPercent: (130 / 150) * 100
          },
          sizeId: selectedSize.name
        }
      ];
    }
  }

  return layoutElement;
};
