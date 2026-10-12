import {useMemo, useState} from 'react';

const compareStrings = (left, right) => left.localeCompare(right, undefined, {sensitivity: 'base'});

const sortTags = (tags, sort) => {
    const multiplier = sort.order === 'DESC' ? -1 : 1;
    return [...tags].sort((left, right) => {
        if (sort.orderBy === 'occurrences') {
            if (left.occurrences === right.occurrences) {
                return compareStrings(left.name, right.name) * multiplier;
            }

            return (left.occurrences - right.occurrences) * multiplier;
        }

        return compareStrings(left.name, right.name) * multiplier;
    });
};

export const useTagFilter = tags => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState({order: 'ASC', orderBy: 'name'});

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredTags = useMemo(() => {
        if (!normalizedSearch) {
            return tags;
        }

        return tags.filter(tag => tag.name.toLowerCase().includes(normalizedSearch));
    }, [normalizedSearch, tags]);

    const sortedTags = useMemo(() => sortTags(filteredTags, sort), [filteredTags, sort]);

    return {searchTerm, setSearchTerm, normalizedSearch, sort, setSort, filteredTags, sortedTags};
};
