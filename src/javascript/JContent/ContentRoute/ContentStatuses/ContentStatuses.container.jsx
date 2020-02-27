import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import ContentStatuses from './ContentStatuses';
import {GetContentStatuses} from './ContentStatuses.gql-queries';

const ContentStatusesContainer = () => {
    const {path, isDisabled, language, uilang} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        isDisabled: state.jcontent.selection.length > 0,
        uilang: state.uilang
    }));

    const {data, error} = useQuery(GetContentStatuses, {
        variables: {
            path: path,
            language: uilang
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

export default ContentStatusesContainer;
