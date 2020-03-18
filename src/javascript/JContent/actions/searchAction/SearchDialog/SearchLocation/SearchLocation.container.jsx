import React from 'react';
import {useNodeInfo, useSiteInfo} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import SearchLocation from './SearchLocation';

const SearchLocationContainer = ({searchPath, handleSearchChanges}) => {
    const {path, siteKey, language} = useSelector(state => ({
        path: state.jcontent.path,
        siteKey: state.site,
        language: state.language
    }));

    const {node, loading: nodeLoading} = useNodeInfo({path: path, language: language}, {getDisplayName: true});
    const {siteInfo, loading} = useSiteInfo({siteKey, displayLanguage: language});

    if (!nodeLoading && !loading && siteInfo && node) {
        return (
            <SearchLocation searchPath={searchPath}
                            nodePath={path}
                            nodeDisplayName={node.displayName}
                            siteInfo={siteInfo}
                            handleSearchChanges={handleSearchChanges}/>
        );
    }

    return null;
};

SearchLocationContainer.propTypes = {
    searchPath: PropTypes.string.isRequired,
    handleSearchChanges: PropTypes.func.isRequired
};

export default SearchLocationContainer;
