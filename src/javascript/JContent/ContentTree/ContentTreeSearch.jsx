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
import styles from './ContentTreeSearch.scss';

const SEARCH_RESULTS_LIMIT = 50;

export const ContentTreeSearch = ({rootPath, language, searchNodeType, onMatchedPaths}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    const [showNoResults, setShowNoResults] = useState(false);
    const [search, {loading}] = useLazyQuery(SearchTreeNodesQuery, {fetchPolicy: 'network-only'});

    const triggerSearch = useCallback(() => {
        const term = inputValue.trim();
        if (!term) {
            setShowNoResults(false);
            onMatchedPaths([], '');
            return;
        }

        search({
            variables: {
                rootPath,
                nodeType: searchNodeType,
                searchTerm: `%${term.toLowerCase()}%`,
                language,
                limit: SEARCH_RESULTS_LIMIT
            }
        }).then(result => {
            const matches = result?.data?.jcr?.nodesByCriteria?.nodes || [];
            const ancestorPaths = new Set();
            matches.forEach(node => {
                getAncestorPaths(node.path, rootPath).forEach(ancestorPath => ancestorPaths.add(ancestorPath));
            });

            if (ancestorPaths.size > 0) {
                dispatch(cmOpenPaths([...ancestorPaths]));
            }

            onMatchedPaths(matches.map(node => node.path), term);
            setShowNoResults(matches.length === 0);
        });
    }, [inputValue, rootPath, searchNodeType, language, search, dispatch, onMatchedPaths]);

    const clearSearch = useCallback(() => {
        setInputValue('');
        setShowNoResults(false);
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
            {showNoResults && (
                <Typography
                    className={styles.noResults}
                    variant="caption"
                    data-sel-role="content-tree-search-no-results"
                >
                    {t('jcontent:label.contentManager.tree.search.noResults')}
                </Typography>
            )}
        </div>
    );
};

ContentTreeSearch.propTypes = {
    rootPath: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    onMatchedPaths: PropTypes.func.isRequired,
    searchNodeType: PropTypes.string
};

ContentTreeSearch.defaultProps = {
    searchNodeType: 'jnt:page'
};

export default ContentTreeSearch;
