import React from 'react';
import { TextLayerStyle } from './types';
import { mapPSDFontToWebFont, addFontImportToDocument } from './fontMapper';

/**
 * Converte os estilos de texto do PSD para estilos CSS do React
 * @param textStyle Estilo de texto extraído do PSD
 * @returns Objeto de estilo CSS para React
 */
export const convertTextStyleToCSS = (textStyle: TextLayerStyle): React.CSSProperties => {
    // Mapear a fonte do PSD para uma fonte web
    const webFontFamily = mapPSDFontToWebFont(textStyle.fontFamily);

    // Adicionar importação da fonte ao documento se necessário
    addFontImportToDocument(webFontFamily.split(',')[0].trim());

    return {
        fontFamily: webFontFamily,
        fontSize: `${textStyle.fontSize}px`,
        fontWeight: textStyle.fontWeight || 'normal',
        fontStyle: textStyle.fontStyle || 'normal',
        color: textStyle.color || '#000000',
        textAlign: (textStyle.alignment || 'left') as 'left' | 'center' | 'right' | 'justify',
        letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}em` : 'normal',
        lineHeight: textStyle.lineHeight ? textStyle.lineHeight.toString() : 'normal',
        whiteSpace: 'pre-wrap', // Preservar quebras de linha
        margin: 0, // Remover margens padrão
        padding: 0, // Remover padding padrão
    };
};

/**
 * Componente React para renderizar texto com os estilos extraídos do PSD
 */
interface PSDTextProps {
    textStyle: TextLayerStyle;
    className?: string;
    onClick?: () => void;
}

export const PSDText: React.FC<PSDTextProps> = (props) => {
    const { textStyle, className, onClick } = props;
    const cssStyle = convertTextStyleToCSS(textStyle);

    return React.createElement(
        'div',
        {
            className,
            style: cssStyle,
            onClick
        },
        textStyle.text || ''
    );
};

/**
 * Componente React para renderizar texto com os estilos extraídos do PSD
 * com a capacidade de editar o texto
 */
interface EditablePSDTextProps extends PSDTextProps {
    onTextChange: (newText: string) => void;
    editable?: boolean;
}

export const EditablePSDText: React.FC<EditablePSDTextProps> = (props) => {
    const { textStyle, className, onClick, onTextChange, editable = true } = props;
    const cssStyle = convertTextStyleToCSS(textStyle);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newText = e.currentTarget.innerText;
        onTextChange(newText);
    };

    return React.createElement(
        'div',
        {
            className,
            style: {
                ...cssStyle,
                outline: editable ? 'none' : undefined,
                userSelect: editable ? 'text' : undefined,
                cursor: editable ? 'text' : undefined
            },
            contentEditable: editable,
            suppressContentEditableWarning: true,
            onInput: handleInput,
            onClick
        },
        textStyle.text || ''
    );
};

/**
 * Aplica os estilos de texto a um elemento DOM existente
 * @param element Elemento DOM a receber os estilos
 * @param textStyle Estilo de texto extraído do PSD
 */
export const applyTextStyleToElement = (element: HTMLElement, textStyle: TextLayerStyle): void => {
    const cssStyle = convertTextStyleToCSS(textStyle);

    // Aplicar os estilos ao elemento
    Object.entries(cssStyle).forEach(([property, value]) => {
        element.style[property as any] = value;
    });

    // Definir o texto, se fornecido
    if (textStyle.text) {
        element.innerText = textStyle.text;
    }
};
