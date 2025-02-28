
import { EditorElement, BannerSize } from "../types";

export const exportEmailHTML = (
  elements: EditorElement[],
  selectedSize: BannerSize,
): string => {
  const generateElementHTML = (element: EditorElement, isChild = false): string => {
    if (element.type === "text") {
      return `
        <div id="${element.id}" style="
          ${element.style.color ? `color: ${element.style.color};` : ""}
          ${element.style.fontSize ? `font-size: ${element.style.fontSize}px;` : ""}
          ${element.style.fontFamily ? `font-family: ${element.style.fontFamily}, Arial, sans-serif;` : ""}
          ${element.style.lineHeight ? `line-height: ${element.style.lineHeight};` : ""}
          ${element.style.textAlign ? `text-align: ${element.style.textAlign};` : ""}
          ${element.style.fontWeight ? `font-weight: ${element.style.fontWeight};` : ""}
          ${element.style.fontStyle ? `font-style: ${element.style.fontStyle};` : ""}
          ${element.style.textDecoration ? `text-decoration: ${element.style.textDecoration};` : ""}
          ${!isChild ? `position: absolute; left: ${element.style.x}px; top: ${element.style.y}px; width: ${element.style.width}px;` : ""}
        ">${element.content}</div>
      `;
    }
    
    if (element.type === "button") {
      return `
        <table border="0" cellspacing="0" cellpadding="0" style="${!isChild ? `position: absolute; left: ${element.style.x}px; top: ${element.style.y}px;` : ""}">
          <tr>
            <td align="center" style="border-radius: 4px;" bgcolor="${element.style.backgroundColor}">
              <a href="#" target="_blank" id="${element.id}" style="
                display: inline-block; 
                padding: ${element.style.padding || '8px 16px'}; 
                font-family: ${element.style.fontFamily || 'Arial'}, sans-serif; 
                font-size: ${element.style.fontSize || 16}px; 
                color: ${element.style.color || '#ffffff'}; 
                text-decoration: none;
                width: ${element.style.width}px;
              ">${element.content}</a>
            </td>
          </tr>
        </table>
      `;
    }
    
    if (element.type === "image") {
      return `
        <img 
          src="${element.content || '/placeholder.svg'}" 
          width="${element.style.width}" 
          height="${element.style.height}" 
          alt="Image" 
          style="
            display: block; 
            border: 0;
            ${!isChild ? `position: absolute; left: ${element.style.x}px; top: ${element.style.y}px;` : ""}
          " 
        />
      `;
    }
    
    if (element.type === "layout") {
      // Create a table for the layout
      let columnWidth = 100 / (element.columns || 1);
      
      // Generate content for each column
      let columnContent = '';
      
      if (element.childElements && element.childElements.length > 0) {
        // Group child elements by column
        const columns = Array.from({ length: element.columns || 1 }, () => []);
        
        element.childElements.forEach((child, index) => {
          const columnIndex = index % (element.columns || 1);
          columns[columnIndex].push(child);
        });
        
        // Generate content for each column
        columnContent = columns.map((columnElements, colIndex) => {
          return `
            <td class="column" width="${columnWidth}%" style="padding: 5px; vertical-align: top;">
              ${columnElements.map(child => generateElementHTML(child, true)).join('')}
            </td>
          `;
        }).join('');
      } else {
        // Empty columns
        columnContent = Array.from({ length: element.columns || 1 }, () => {
          return `<td class="column" width="${columnWidth}%" style="padding: 5px; vertical-align: top;"></td>`;
        }).join('');
      }
      
      return `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="
          position: absolute; 
          left: ${element.style.x}px; 
          top: ${element.style.y}px; 
          width: ${element.style.width}px;
          ${element.style.backgroundColor ? `background-color: ${element.style.backgroundColor};` : ""}
        ">
          <tr>
            ${columnContent}
          </tr>
        </table>
      `;
    }
    
    return "";
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
      <style>
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        table, td {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
      </style>
    </head>
    <body>
      <table width="${selectedSize.width}" border="0" cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="position: relative; height: ${selectedSize.height}px;">
                  ${elements.map(el => generateElementHTML(el)).join("\n")}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return html;
};

export const downloadEmailTemplate = (html: string) => {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "email-template.html";
  a.click();
  URL.revokeObjectURL(url);
};
