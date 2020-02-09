import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose, Query, withApollo} from 'react-apollo';
import {breadcrumbQuery} from './Breadcrumb.gql-queries';
import {withTranslation} from 'react-i18next';
import {cmGoto} from '../../../../../JContent.redux';
import Breadcrumb from './Breadcrumb';
import {buildBreadcrumbItems} from './Breadcrumb.utils';

export const BreadcrumbContainer = ({path, language, selectItem, mode, t, site}) => {
    let queryParams = {path: path, language: language};
    let key = JSON.stringify(queryParams);
    return (
        <Query key={key} query={breadcrumbQuery} variables={queryParams}>
            {({loading, error, data}) => {
                if (error) {
                    let message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                    console.error(message);
                }

                if (loading || !data || !data.jcr || !data.jcr.nodeByPath) {
                    return null;
                }

                let breadcrumbs = buildBreadcrumbItems(path, data, mode, t, site);
                return (
                    <Breadcrumb breadcrumbs={breadcrumbs}
                                mode={mode}
                                selectItem={selectItem}/>
                );
            }}
        </Query>
    );
};

const mapStateToProps = state => ({
    path: state.path,
    site: state.site,
    language: state.language,
    mode: state.mode
});

const mapDispatchToProps = dispatch => ({
    selectItem: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
});

BreadcrumbContainer.propTypes = {
    path: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    selectItem: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    site: PropTypes.string.isRequired
};

export default compose(
    withTranslation(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(BreadcrumbContainer);
