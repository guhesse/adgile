
import { EditorElement, BannerSize } from "../types";

export const exportEmailHTML = (
  elements: EditorElement[],
  selectedSize: BannerSize,
): string => {
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
        ${elements
          .map(
            (el) => `
          #${el.id} {
            ${el.style.color ? `color: ${el.style.color};` : ""}
            ${el.style.fontSize ? `font-size: ${el.style.fontSize}px;` : ""}
            ${el.style.fontFamily ? `font-family: ${el.style.fontFamily}, Arial, sans-serif;` : ""}
            ${el.style.lineHeight ? `line-height: ${el.style.lineHeight};` : ""}
            ${el.style.textAlign ? `text-align: ${el.style.textAlign};` : ""}
            ${el.style.backgroundColor ? `background-color: ${el.style.backgroundColor};` : ""}
            ${el.style.padding ? `padding: ${el.style.padding};` : ""}
          }
        `
          )
          .join("\n")}
      </style>
    </head>
    <body>
      <table width="${selectedSize.width}" border="0" cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              ${elements
                .map((el) => {
                  if (el.type === "text") {
                    return `
                      <tr>
                        <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                          <div id="${el.id}">${el.content}</div>
                        </td>
                      </tr>
                    `;
                  }
                  if (el.type === "button") {
                    return `
                      <tr>
                        <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="border-radius: 4px;" bgcolor="${el.style.backgroundColor}">
                                <a href="#" target="_blank" id="${el.id}" style="display: inline-block; padding: ${el.style.padding}; font-family: ${el.style.fontFamily || 'Arial'}, sans-serif; font-size: ${el.style.fontSize}px; color: ${el.style.color}; text-decoration: none;">${el.content}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    `;
                  }
                  if (el.type === "image") {
                    return `
                      <tr>
                        <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                          <img src="${el.content}" width="${el.style.width}" height="${el.style.height}" alt="Image" style="display: block; border: 0;" />
                        </td>
                      </tr>
                    `;
                  }
                  return "";
                })
                .join("\n")}
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
