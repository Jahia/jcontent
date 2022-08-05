import React from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';
import SiteContentTypesQuery from './BasicSearch.gql-queries';
import {extractAndFormatContentTypeData} from './BasicSearch.utils';
import BasicSearch from './BasicSearch';

export const BasicSearchContainer = props => {
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }), shallowEqual);

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
            <BasicSearch {...props} contentTypeData={contentTypeData}/>
        );
    }

    return null;
};

BasicSearchContainer.propTypes = {
    searchForm: PropTypes.object.isRequired,
    searchFormSetters: PropTypes.object.isRequired,
    performSearch: PropTypes.func.isRequired
};

export default BasicSearchContainer;
