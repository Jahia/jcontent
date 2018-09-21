import React from "react";
import PropTypes from 'prop-types';
import {withNotifications} from '@jahia/react-material';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import * as _ from 'lodash';
import {Query} from 'react-apollo';
import {SiteContentTypesQuery} from "./gqlQueries";
import FilterSelect from './FilterSelect';

class ContentTypeSelect extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(newValue) {
        if (this.props.onSelectionChange !== undefined) {
            this.props.onSelectionChange(newValue ? newValue.value : "");
        }
    };

    render() {

        let { contentType, classes, siteKey, displayLanguage, notificationContext, t } = this.props;
        contentType = contentType || "";
        return (
            <Query query={SiteContentTypesQuery} variables={{siteKey: siteKey, displayLanguage: displayLanguage}}>
                {({ loading, error, data }) => {
                let contentTypes = [];
                if (error) {
                    let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                } else if (data && data.jcr && data.jcr.nodeTypes && data.jcr.nodeTypes.nodes) {
                    contentTypes = _.sortBy(data.jcr.nodeTypes.nodes, [nt => nt.displayName.toLowerCase()], 'displayName');
                    contentTypes = contentTypes.map((nodeType) => {
                        return {
                            value: nodeType.name,
                            title: nodeType.displayName + ' (' + nodeType.name + ')',
                            label: nodeType.displayName,
                            icon: nodeType.icon
                        }
                    });
                    contentTypes.unshift({
                        value: "",
                        title: t('label.contentManager.contentTypes.any'),
                        label: t('label.contentManager.contentTypes.any'),
                        icon: null
                    });
                }
                return (<FilterSelect
                    selectedOption={contentType}
                    options={contentTypes}
                    handleChange={this.handleChange}
                />);
            }}
            </Query>
        );
    }
}

ContentTypeSelect.propTypes = {
    contentType : PropTypes.string,
    onSelectionChange : PropTypes.func
};

ContentTypeSelect = compose(
    withNotifications(),
    translate(),
)(ContentTypeSelect);

export default ContentTypeSelect;