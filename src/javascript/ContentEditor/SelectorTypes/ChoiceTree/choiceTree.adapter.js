export const choiceTreeAdapter = ({nodes, parent, selectedValues, locale}) => {
    // LocaleCompare in JS expect a locale like en-US NOT en_US which Jahia uses.
    if (locale && locale.indexOf('_') !== -1) {
        locale = locale.replace('_', '-');
    }

    return nodes
        .filter(entry => entry.parent.uuid === parent.uuid)
        .map(entry => {
            return {
                id: entry.value,
                value: entry.value,
                label: entry.label,
                expanded: nodes.filter(cat => cat.parent.uuid === entry.uuid).filter(cat => selectedValues && selectedValues.includes(cat.uuid)).length > 0,
                checked: selectedValues ? selectedValues.includes(entry.uuid) : undefined,
                children: choiceTreeAdapter({
                    nodes,
                    locale,
                    parent: entry,
                    selectedValues
                }).sort((c1, c2) => c1.label.localeCompare(c2.label, locale))
            };
        });
};
