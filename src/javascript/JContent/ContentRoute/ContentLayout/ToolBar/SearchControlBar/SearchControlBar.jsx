import React from 'react';
import PropTypes from 'prop-types';
import {Trans, withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {cmGoto, cmSetPath} from '../../../../JContent.redux';
import {withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/design-system-kit';
import {Close, Search} from '@material-ui/icons';
import {compose} from 'react-apollo';
import * as _ from 'lodash';
import {VirtualsiteIcon} from '@jahia/icons';

const styles = theme => ({
    grow: {
        flex: 1
    },
    infoSearchPathValue: {
        color: theme.palette.text.primary
    }
});

export class SearchControlBar extends React.Component {
    render() {
        let {
            siteKey, path, setPath, t, classes, clearSearch, searchContentType, sql2SearchFrom, sql2SearchWhere, searchTerms, showActions
        } = this.props;
        let siteRootPath = '/sites/' + siteKey;
        const params = {
            searchContentType: searchContentType,
            searchTerms: searchTerms,
            sql2SearchFrom: sql2SearchFrom,
            sql2SearchWhere: sql2SearchWhere
        };

        return (
            <React.Fragment>
                <Search fontSize="small"/>
                <Trans i18nKey="label.contentManager.search.searchPath" values={{path: path}}>
                    <Typography key="searchPath" variant="zeta">Searching under: </Typography><Typography key="searchPath" variant="zeta">path</Typography>
                </Trans>
                <div className={classes.grow}/>
                {showActions && (path !== siteRootPath) &&
                    <Button
                        data-cm-role="search-all"
                        variant="ghost"
                        onClick={() => setPath(siteRootPath)}
                    >
                        <VirtualsiteIcon/>
                        {t('jcontent:label.contentManager.search.searchEverywhere', {site: siteKey})}
                    </Button>}
                {showActions &&
                    <Button
                        data-cm-role="search-clear"
                        variant="ghost"
                        onClick={() => clearSearch(params)}
                    >
                        <Close/>
                        {t('jcontent:label.contentManager.search.clear')}
                    </Button>}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        siteKey: state.site,
        path: state.jcontent.path,
        searchTerms: state.jcontent.params.searchTerms,
        searchContentType: state.jcontent.params.searchContentType,
        sql2SearchFrom: state.jcontent.params.sql2SearchFrom,
        sql2SearchWhere: state.jcontent.params.sql2SearchWhere
    };
};

const mapDispatchToProps = dispatch => ({
    setPath: path => dispatch(cmSetPath(path)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}));
    }
});

SearchControlBar.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    clearSearch: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    searchContentType: PropTypes.string,
    searchTerms: PropTypes.string,
    setPath: PropTypes.func.isRequired,
    showActions: PropTypes.bool.isRequired,
    siteKey: PropTypes.string.isRequired,
    sql2SearchFrom: PropTypes.string,
    sql2SearchWhere: PropTypes.string
};

export default compose(
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(SearchControlBar);
