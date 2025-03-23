export function getAllLayers(node: any): any[] {
    if (!node) return [];

    const result: any[] = [];

    if (node.type) {
        result.push(node);
    }

    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            const childLayers = getAllLayers(child);
            result.push(...childLayers);
        }
    }

    return result;
}
