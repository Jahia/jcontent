import React from 'react';
import PropTypes from 'prop-types';
import {Input, withStyles} from '@material-ui/core';
import ContentTypeSelect from './ContentTypeSelect';
import {cmGoto} from '../../../../JContent.redux-actions';
import {withNotifications, DxContext} from '@jahia/react-material';
import {withTranslation} from 'react-i18next';
import {compose} from 'react-apollo';
import SearchBarLayout from '../SearchBarLayout';
import ActionButton from '../ActionButton';
import {connect} from 'react-redux';
import JContentConstants from '../../../../JContent.constants';

const styles = () => ({
    searchSize: {
        height: 44,
        flex: '4 0 auto'
    },
    input: {
        height: 44,
        boxSizing: 'border-box'
    }
});

export class SearchBarNormal extends React.Component {
    constructor(props) {
        super(props);

        this.onSearchInputChange = this.onSearchInputChange.bind(this);
        this.onSearchInputKeyDown = this.onSearchInputKeyDown.bind(this);
        this.onContentTypeChange = this.onContentTypeChange.bind(this);

        this.state = {
        };
    }

    static getDerivedStateFromProps(props, state) {
        let {params} = props;
        if (state.ongoingSearch && (state.ongoingSearch.searchTerms !== params.searchTerms || state.ongoingSearch.searchContentType !== params.searchContentType)) {
            // Props have changed compared to previous search, override the current state
            return {
                searchContentType: params.searchContentType !== undefined ? params.searchContentType : '',
                searchTerms: params.searchTerms !== undefined ? params.searchTerms : '',
                ongoingSearch: params
            };
        }

        return {
            searchContentType: state.searchContentType !== undefined ? state.searchContentType : (params.searchContentType ? params.searchContentType : ''),
            searchTerms: state.searchTerms !== undefined ? state.searchTerms : (params.searchTerms ? params.searchTerms : ''),
            ongoingSearch: params
        };
    }

    onContentTypeChange(contentType) {
        this.setState({
            searchContentType: contentType
        });
        this.onSearch(this.state.searchTerms, contentType);
    }

    onSearchInputChange(event) {
        let value = event.target.value;
        this.setState({
            searchTerms: value
        });
        // Perform search only when the user has paused changing search terms for a second.
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        var self = this;
        this.timeout = setTimeout(function () {
            self.onSearch(value, self.state.searchContentType);
        }, 1000);
    }

    onSearchInputKeyDown(e) {
        if (e.key === 'Enter') {
            this.onSearch(e.target.value, this.state.searchContentType);
        }

        return true;
    }

    onSearch(searchTerms, searchContentType) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        let {path, search} = this.props;
        if (!searchTerms) {
            return;
        }

        searchTerms = searchTerms.trim();
        if (searchTerms === '') {
            return;
        }

        let params = {searchTerms};
        if (searchContentType) {
            params.searchContentType = searchContentType;
        }

        search(JContentConstants.mode.SEARCH, path, params);
    }

    render() {
        let {onSql2Click, siteKey, classes, t} = this.props;
        let {searchTerms, searchContentType, ongoingSearch} = this.state;

        return (
            <SearchBarLayout
                t={t}
                rightFooter={
                    <React.Fragment>
                        {!ongoingSearch.searchTerms ?
                            <ActionButton
                                label="jcontent:label.contentManager.search.sql2"
                                cmRole="search-type-sql2search"
                                onClick={onSql2Click}
                            /> :
                            <div/>}
                    </React.Fragment>
                }
                onSearch={() => this.onSearch(searchTerms, searchContentType)}
            >
                <React.Fragment>
                    <DxContext.Consumer className={classes.searchSize}>{dxContext => (
                        <ContentTypeSelect
                            siteKey={siteKey}
                            displayLanguage={dxContext.uilang}
                            contentType={searchContentType}
                            onSelectionChange={this.onContentTypeChange}
                        />
                    )}
                    </DxContext.Consumer>
                    <Input
                        inputProps={{maxLength: 2000, 'data-cm-role': 'search-input-term'}}
                        className={classes.searchSize}
                        value={searchTerms}
                        classes={{input: classes.input}}
                        placeholder={t('jcontent:label.contentManager.search.normalPrompt')}
                        onChange={this.onSearchInputChange}
                        onKeyDown={this.onSearchInputKeyDown}
                    />
                </React.Fragment>
            </SearchBarLayout>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    params: state.params
});

const mapDispatchToProps = dispatch => {
    return {
        search: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
    };
};

SearchBarNormal.propTypes = {
    classes: PropTypes.object.isRequired,
    onSql2Click: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired
};

export default compose(
    withNotifications(),
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(SearchBarNormal);
