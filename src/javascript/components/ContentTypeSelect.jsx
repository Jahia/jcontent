import React from "react";
import PropTypes from 'prop-types';
import {withStyles, Input, MenuItem, Select} from "@material-ui/core";
import {withNotifications} from '@jahia/react-material';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import * as _ from 'lodash';
import {Query} from 'react-apollo';
import {ContentTypesQuery} from "./gqlQueries";

const styles = theme => ({
  root: {
      display: 'inline-block',
      minWidth: 120
  },
  selectMenu: {
      color: theme.palette.text.secondary
  },
  nodeTypeIcon: {
      marginRight: 5
  }
});

class ContentTypeSelect extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        let contentType = e.target.value;
        this.props.onSelectionChange(contentType == '' ? null : contentType);
    };

    render() {

        let { contentType, classes, siteKey, displayLanguage, notificationContext, t } = this.props;

        return (
            <Query fetchPolicy={"network-only"} query={ContentTypesQuery} variables={{siteKey: siteKey, displayLanguage: displayLanguage}}>
                {({ loading, error, data }) => {
                let contentTypes = [];
                if (error) {
                    let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                } else if (data && data.jcr && data.jcr.nodeTypes && data.jcr.nodeTypes.nodes) {
                    contentTypes = _.sortBy(data.jcr.nodeTypes.nodes, [nt => nt.displayName.toLowerCase()], 'displayName');
                }
                return (<Select
                    value={contentType ? contentType : ''}
                    onChange={this.handleChange}
                    displayEmpty
                    classes={{
                        root: classes.root,
                        selectMenu: classes.selectMenu
                    }}
                    >
                    <MenuItem value="">
                        <em>{t('label.contentManager.contentTypes.any')}</em>
                    </MenuItem>
                    {contentTypes.map((nt) => (
                        <MenuItem key={nt.name} value={nt.name} title={nt.displayName + ' (' + nt.name + ')'}><img src={nt.icon + '.png'} className={classes.nodeTypeIcon}/>{nt.displayName}</MenuItem>
                    ))}
                </Select>)
            }}
            </Query>
        );
    }
}

ContentTypeSelect = compose(
    withNotifications(),
    translate(),
    withStyles(styles)
)(ContentTypeSelect);

export default ContentTypeSelect;