import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import InputBase from '@material-ui/core/InputBase';
import {Button, Close, Search, Typography} from '@jahia/moonstone';
import {useDispatch} from 'react-redux';
import {useLazyQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {cmOpenPaths} from '~/JContent/redux/JContent.redux';
import {getAncestorPaths} from './ContentTree.utils';
import {SearchTreeNodesQuery} from './ContentTreeSearch.gql-queries';
import {buildTitleSearchConstraint} from './ContentTreeSearch.utils';
import styles from './ContentTreeSearch.scss';

const SEARCH_RESULTS_LIMIT = 50;

export const ContentTreeSearch = ({rootPath, language, onMatchedPaths}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    // Null before any search has run (nothing to announce yet); a number once one has, so the
    // aria-live region below always has something meaningful to read out, including zero.
    const [resultCount, setResultCount] = useState(null);
    const [search, {loading}] = useLazyQuery(SearchTreeNodesQuery, {fetchPolicy: 'network-only'});

    const triggerSearch = useCallback(() => {
        const term = inputValue.trim();
        if (!term) {
            setResultCount(null);
            onMatchedPaths([], '');
            return;
        }

        search({
            variables: {
                rootPath,
                nodeConstraint: buildTitleSearchConstraint(term),
                language,
                limit: SEARCH_RESULTS_LIMIT
            }
        }).then(result => {
            const criteriaResults = result?.data?.jcr || {};
            const matches = [
                ...(criteriaResults.pages?.nodes || []),
                ...(criteriaResults.menuTitles?.nodes || []),
                ...(criteriaResults.internalLinks?.nodes || []),
                ...(criteriaResults.externalLinks?.nodes || [])
            ];
            const ancestorPaths = new Set();
            matches.forEach(node => {
                getAncestorPaths(node.path, rootPath).forEach(ancestorPath => ancestorPaths.add(ancestorPath));
            });

            if (ancestorPaths.size > 0) {
                dispatch(cmOpenPaths([...ancestorPaths]));
            }

            onMatchedPaths(matches.map(node => node.path), term);
            setResultCount(matches.length);
        });
    }, [inputValue, rootPath, language, search, dispatch, onMatchedPaths]);

    const clearSearch = useCallback(() => {
        setInputValue('');
        setResultCount(null);
        onMatchedPaths([], '');
    }, [onMatchedPaths]);

    return (
        <div className={styles.contentTreeSearch}>
            <div className={styles.searchInput}>
                <InputBase
                    className={styles.input}
                    placeholder={t('jcontent:label.contentManager.tree.search.placeholder')}
                    value={inputValue}
                    disabled={loading}
                    inputProps={{'aria-label': t('jcontent:label.contentManager.tree.search.ariaLabel')}}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            triggerSearch();
                        }
                    }}
                />
                {inputValue && (
                    <Button
                        variant="ghost"
                        className={styles.iconButton}
                        icon={<Close/>}
                        aria-label={t('jcontent:label.contentManager.tree.search.clear')}
                        data-sel-role="content-tree-search-clear"
                        onClick={clearSearch}
                    />
                )}
                <Button
                    variant="ghost"
                    className={styles.iconButton}
                    icon={<Search/>}
                    isLoading={loading}
                    aria-label={t('jcontent:label.contentManager.tree.search.placeholder')}
                    data-sel-role="content-tree-search-button"
                    onClick={triggerSearch}
                />
            </div>
            {/* Always mounted (even with empty text) so screen readers reliably announce updates -
                aria-live regions are meant to persist in the DOM, not be added/removed per search. */}
            <Typography
                className={styles.searchStatusMessage}
                variant="caption"
                aria-live="polite"
                data-sel-role="content-tree-search-result-count"
            >
                {resultCount === null ?
                    '' :
                    (resultCount === 0 ?
                        t('jcontent:label.contentManager.tree.search.noResults') :
                        t('jcontent:label.contentManager.tree.search.resultsFound', {count: resultCount}))}
            </Typography>
        </div>
    );
};

ContentTreeSearch.propTypes = {
    rootPath: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    onMatchedPaths: PropTypes.func.isRequired
};

export default ContentTreeSearch;
