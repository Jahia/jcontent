import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import ContentStatuses from './ContentStatuses';
import {GetContentStatuses} from './ContentStatuses.gql-queries';
import PropTypes from 'prop-types';

const ContentStatusesContainer = ({nodePath}) => {
    const {path, isDisabled, language, uilang} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        isDisabled: state.jcontent.selection.length > 0,
        uilang: state.uilang
    }), shallowEqual);

    const {data, error} = useQuery(GetContentStatuses, {
        variables: {
            path: nodePath || path,
            language: language
        }
    });

    if (error) {
        console.log(error);
    }

    const node = (data && data.jcr && data.jcr.result) || {};
    return (
        <ContentStatuses node={node} isDisabled={isDisabled} language={language} uilang={uilang}/>
    );
};

ContentStatusesContainer.propTypes = {
    nodePath: PropTypes.string
};

export default ContentStatusesContainer;
