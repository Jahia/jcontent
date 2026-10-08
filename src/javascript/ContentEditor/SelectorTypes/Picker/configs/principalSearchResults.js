// Principal search results are not JCR nodes: give each row the fields the picker table reads from a node row.
export const toPrincipalRows = result => result && {
    ...result,
    nodes: result.nodes.map(principal => ({
        ...principal,
        firstName: principal.firstName ? {value: principal.firstName} : null,
        lastName: principal.lastName ? {value: principal.lastName} : null,
        primaryNodeType: {name: principal.nodeTypeName},
        isSelectable: true
    }))
};
