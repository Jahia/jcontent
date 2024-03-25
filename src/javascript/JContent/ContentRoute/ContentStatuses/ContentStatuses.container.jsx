import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';

import ContentStatuses from './ContentStatuses';
import PropTypes from 'prop-types';

const ContentStatusesContainer = ({node}) => {
    const {isDisabled, language, uilang} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        isDisabled: state.jcontent.selection.length > 0,
        uilang: state.uilang
    }), shallowEqual);

    if (!node) {
        return null;
    }

    return (
        <ContentStatuses node={node} isDisabled={isDisabled} language={language} uilang={uilang}/>
    );
};

ContentStatusesContainer.propTypes = {
    node: PropTypes.shape({
        aggregatedPublicationInfo: PropTypes.shape({
            publicationStatus: PropTypes.string,
            existsInLive: PropTypes.bool
        }),
        deleted: PropTypes.shape({
            value: PropTypes.string
        }),
        deletedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lastModified: PropTypes.shape({
            value: PropTypes.string
        }),
        lastModifiedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lastPublished: PropTypes.shape({
            value: PropTypes.string
        }),
        lastPublishedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lockOwner: PropTypes.shape({
            value: PropTypes.string
        }),
        mixinTypes: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string
        })),
        wipStatus: PropTypes.shape({
            value: PropTypes.string
        }),
        wipLangs: PropTypes.shape({
            values: PropTypes.arrayOf(PropTypes.string)
        }),
        ancestors: PropTypes.arrayOf(PropTypes.shape({
            deleted: PropTypes.shape({
                value: PropTypes.string
            }),
            deletedBy: PropTypes.shape({
                value: PropTypes.string
            })
        }))
    }).isRequired
};

export default ContentStatusesContainer;
