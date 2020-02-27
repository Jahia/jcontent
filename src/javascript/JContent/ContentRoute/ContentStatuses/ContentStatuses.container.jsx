import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import ContentStatuses from './ContentStatuses';
import {GetContentStatuses} from './ContentStatuses.gql-queries';

const ContentStatusesContainer = ({path, isDisabled, language, uilang}) => {
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

ContentStatusesContainer.propTypes = {
    language: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    uilang: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool
};

ContentStatusesContainer.defaultProps = {
    isDisabled: false
};

const mapStateToProps = state => ({
    language: state.language,
    path: state.jcontent.path,
    isDisabled: state.jcontent.selection.length > 0,
    uilang: state.uilang
});

export default connect(mapStateToProps)(ContentStatusesContainer);
