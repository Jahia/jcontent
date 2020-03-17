import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';
import SiteContentTypesQuery from './BasicSearch.gql-queries';
import {extractAndFormatContentTypeData} from './BasicSearch.utils';
import BasicSearch from './BasicSearch';

export const BasicSearchContainer = ({searchPath, searchTerms, searchContentType, handleSearchChanges, performSearch}) => {
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }));

    const {data, error, loading} = useQuery(SiteContentTypesQuery, {
        variables: {
            siteKey: siteKey,
            language: language
        }
    });

    if (error) {
        console.log(error);
    }

    if (!loading && data?.jcr?.nodeTypes?.nodes) {
        const contentTypeData = extractAndFormatContentTypeData(data);

        return (
            <BasicSearch searchPath={searchPath}
                         searchTerms={searchTerms}
                         searchContentType={searchContentType}
                         contentTypeData={contentTypeData}
                         handleSearchChanges={handleSearchChanges}
                         performSearch={performSearch}/>
        );
    }

    return null;
};

BasicSearchContainer.propTypes = {
    searchPath: PropTypes.string.isRequired,
    searchTerms: PropTypes.string.isRequired,
    searchContentType: PropTypes.string.isRequired,
    handleSearchChanges: PropTypes.func.isRequired,
    performSearch: PropTypes.func.isRequired
};

export default BasicSearchContainer;
