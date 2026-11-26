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

/**
 * The message the aria-live region announces for the current search state.
 * @param {?object} status null before any search has run, otherwise a result count or a failure
 * @param {function} t the translation function
 * @returns {string} the message to announce, empty when there is nothing to say yet
 */
const getStatusMessage = (status, t) => {
    if (!status) {
        return '';
    }

    if (status.failed) {
        return t('jcontent:label.contentManager.tree.search.error');
    }

    if (status.count === 0) {
        return t('jcontent:label.contentManager.tree.search.noResults');
    }

    return t('jcontent:label.contentManager.tree.search.resultsFound', {count: status.count});
};

/**
 * The matched nodes of every aliased criteria in the search result, in one flat list.
 * @param {?object} jcr the `jcr` field of the query result, absent when the query returned nothing
 * @returns {object[]} the matched nodes across pages, menu titles, internal and external links
 */
const collectMatches = jcr => [
    ...(jcr?.pages?.nodes || []),
    ...(jcr?.menuTitles?.nodes || []),
    ...(jcr?.internalLinks?.nodes || []),
    ...(jcr?.externalLinks?.nodes || [])
];

/**
 * Every ancestor path of every match, de-duplicated, so the tree can open the branches leading to
 * the results in a single dispatch.
 * @param {object[]} matches the matched nodes
 * @param {string} rootPath the tree's root path, walking stops once reached
 * @returns {string[]} the ancestor paths to open
 */
const collectAncestorPaths = (matches, rootPath) => {
    const ancestorPaths = new Set();
    matches.forEach(node => getAncestorPaths(node.path, rootPath).forEach(path => ancestorPaths.add(path)));
    return [...ancestorPaths];
};

export const ContentTreeSearch = ({rootPath, language, onMatchedPaths}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    // Null before any search has run (nothing to announce yet); a {count} or {failed} object once
    // one has, so the aria-live region below always has something meaningful to read out.
    const [status, setStatus] = useState(null);
    const [search, {loading}] = useLazyQuery(SearchTreeNodesQuery, {fetchPolicy: 'network-only'});

    const triggerSearch = useCallback(() => {
        const term = inputValue.trim();
        if (!term) {
            setStatus(null);
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
            const matches = collectMatches(result?.data?.jcr);
            const ancestorPaths = collectAncestorPaths(matches, rootPath);

            if (ancestorPaths.length > 0) {
                dispatch(cmOpenPaths(ancestorPaths));
            }

            onMatchedPaths(matches.map(node => node.path), term);
            setStatus({count: matches.length});
        }).catch(error => {
            // A failed search must not leave the tree showing stale matches, and announcing "no
            // results" would be a lie - report the failure instead.
            console.error('Error while searching the content tree', error);
            onMatchedPaths([], '');
            setStatus({failed: true});
        });
    }, [inputValue, rootPath, language, search, dispatch, onMatchedPaths]);

    const clearSearch = useCallback(() => {
        setInputValue('');
        setStatus(null);
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
                {getStatusMessage(status, t)}
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
