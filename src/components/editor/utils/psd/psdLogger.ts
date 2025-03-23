export function logBasicPSDInfo(psd: any) {
    console.log("=== INFORMAÇÕES BÁSICAS DO PSD ===");
    console.log("Width:", psd.header.width);
    console.log("Height:", psd.header.height);
    console.log("Channels:", psd.header.channels);
    console.log("Bit Depth:", psd.header.depth);
    console.log("Color Mode:", psd.header.mode);
}

export function logTreeStructure(tree: any) {
    console.log("=== ÁRVORE BRUTA DO PHOTOSHOP ===");
    console.log("Tree properties:", {
        width: tree.width,
        height: tree.height,
        hasChildren: !!tree.children,
        childrenCount: tree.children ? (Array.isArray(tree.children) ? tree.children.length : 'não é array') : 0,
        hasDocument: !!tree.document
    });
}
