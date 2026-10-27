import {useApolloClient} from '@apollo/client';
import {useEffect, useMemo, useState} from 'react';
import {SUGGEST_TAGS} from './TagManager.gql-queries';

export const useTagSuggestions = ({siteKey, isOpen, value}) => {
    const client = useApolloClient();
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setSuggestions([]);
            return undefined;
        }

        const prefix = value.trim();
        if (prefix.length === 0) {
            setSuggestions([]);
            return undefined;
        }

        let cancelled = false;
        const timeout = setTimeout(() => {
            client.query({
                query: SUGGEST_TAGS,
                variables: {
                    prefix,
                    startPath: `/sites/${siteKey}`,
                    limit: 10,
                    minCount: 1,
                    offset: 0,
                    sortByCount: true
                },
                fetchPolicy: 'network-only'
            }).then(({data}) => {
                if (!cancelled) {
                    setSuggestions(data?.tag?.suggest || []);
                }
            }).catch(() => {
                if (!cancelled) {
                    setSuggestions([]);
                }
            });
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [client, isOpen, siteKey, value]);

    const normalizedValue = value.trim();
    return useMemo(() => {
        return suggestions.filter(suggestion => suggestion.name !== normalizedValue);
    }, [normalizedValue, suggestions]);
};
