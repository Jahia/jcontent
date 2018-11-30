import React from 'react';
import {withStyles, Input} from '@material-ui/core';
import {DxContext} from '../DxContext';
import ContentTypeSelect from '../ContentTypeSelect';
import {cmGoto} from '../redux/actions';
import {withNotifications} from '@jahia/react-material';
import {translate} from 'react-i18next';
import _ from 'lodash';
import {compose} from 'react-apollo';
import SearchBarLayout from './SearchBarLayout';
import ActionButton from './ActionButton';
import {connect} from 'react-redux';

const styles = () => ({
    searchSize: {
        height: '34px',
        maxHeight: '34px',
        minHeight: '34px',
        flexGrow: 10,
        boxShadow: 'none!important'
    },
    inputShadow: {
        boxShadow: 'none'
    },
    replaceButtonStyle: {
        minHeight: 32,
        maxHeight: 32,
        height: 32
    }
});

class CmSearchBarNormal extends React.Component {
    constructor(props) {
        super(props);
        this.search = React.createRef();
        let {params} = this.props;
        this.state = {
            contentType: (params.searchContentType !== undefined ? params.searchContentType : null)
        };
    }

    onContentTypeChange(path, params, contentType) {
        this.setState({
            contentType: contentType
        });
        this.onSearch(path, params, contentType);
    }

    onSearchInputChange(path, params) {
        // Perform search only when the user has paused changing search terms for a second.
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        var self = this;
        this.timeout = setTimeout(function () {
            self.onSearch(path, params, this.state.contentType);
        }.bind(this), 1000);
    }

    onSearchInputKeyDown(e, path, params) {
        if (e.key === 'Enter') {
            this.onSearch(path, params, this.state.contentType);
        }
    }

    onSearch(path, params, contentType) {
        let searchTerms = this.search.current ? this.search.current.value : params.searchTerms;
        if (!searchTerms) {
            return;
        }
        searchTerms = searchTerms.trim();
        if (searchTerms === '') {
            return;
        }

        params.searchTerms = searchTerms;
        if (contentType) {
            params.searchContentType = contentType;
        } else {
            _.unset(params, 'searchContentType');
        }

        this.props.search('search', path, params);
    }

    render() {
        let {onSql2Click, siteKey, path, params, classes, t} = this.props;

        return (
            <SearchBarLayout
                t={t}
                rightFooter={
                    <React.Fragment>
                        {!params.searchTerms ?
                            <ActionButton
                                label="label.contentManager.search.sql2"
                                cmRole="search-type-sql2search"
                                onClick={onSql2Click}
                            /> :
                            <div className={classes.replaceButtonStyle}/>
                        }
                    </React.Fragment>
                }
                onSearch={() => this.onSearch(path, params, this.state.contentType)}
                >
                <DxContext.Consumer className={classes.searchSize}>{dxContext => (
                    <ContentTypeSelect
                        siteKey={siteKey}
                        displayLanguage={dxContext.uilang}
                        contentType={this.state.contentType}
                        onSelectionChange={contentType => this.onContentTypeChange(path, params, contentType)}
                    />
                )}
                </DxContext.Consumer>
                <Input
                    inputProps={{maxLength: 2000, 'data-cm-role': 'search-input-term'}}
                    className={classes.searchSize}
                    defaultValue={params.searchTerms}
                    classes={{input: classes.inputShadow}}
                    placeholder={t('label.contentManager.search.normalPrompt')}
                    inputRef={this.search}
                    onChange={() => this.onSearchInputChange(path, params)}
                    onKeyDown={e => this.onSearchInputKeyDown(e, path, params)}
                />
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

export default compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchBarNormal);
