import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import {cmGoto} from '~/JContent/JContent.redux';
import {GetContentPath} from './ContentPath.gql-queries';
import ContentPath from './ContentPath';

const ContentPathContainer = () => {
    const dispatch = useDispatch();

    const {mode, language, path} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path,
        language: state.language
    }));

    const {data, error} = useQuery(GetContentPath, {
        variables: {path, language}
    });

    const handleNavigation = path => {
        dispatch(cmGoto({mode, path}));
    };

    if (error) {
        console.log(error);
    }

    const ancestors = data?.jcr?.node?.ancestors || {};
    return <ContentPath items={ancestors} onItemClick={handleNavigation}/>;
};

export default ContentPathContainer;
