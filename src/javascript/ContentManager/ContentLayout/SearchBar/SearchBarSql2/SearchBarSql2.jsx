import React from 'react';
import DxContext from '../../../DxContext/index';
import SearchBarLayout from '../SearchBarLayout/index';
import ActionButton from '../ActionButton/index';
import Sql2Input from './Sql2Input/index';
import {compose} from 'react-apollo';
import {Paper, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import {cmGoto} from '../../../ContentManager.redux-actions';

const styles = theme => ({
    input: {
        flexGrow: 4
    },
    sql2Form: {
        lineHeight: '19px',
        padding: 12,
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
    },
    link: {
        color: theme.palette.brand.beta
    },
    replaceButtonStyle: {}
});

export class SearchBarSql2 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    static getDerivedStateFromProps(props, state) {
        let {params} = props;
        if (state.ongoingSearch && (state.ongoingSearch.sql2SearchWhere !== params.sql2SearchWhere || state.ongoingSearch.sql2SearchFrom !== params.sql2SearchFrom)) {
            // Props have changed compared to previous search, override the current state
            return {
                sql2SearchWhere: params.sql2SearchWhere !== undefined ? params.sql2SearchWhere : '',
                sql2SearchFrom: params.sql2SearchFrom !== undefined ? params.sql2SearchFrom : '',
                ongoingSearch: params
            };
        }
        return {
            sql2SearchWhere: state.sql2SearchWhere !== undefined ? state.sql2SearchWhere : (params.sql2SearchWhere ? params.sql2SearchWhere : ''),
            sql2SearchFrom: state.sql2SearchFrom !== undefined ? state.sql2SearchFrom : (params.sql2SearchFrom ? params.sql2SearchFrom : ''),
            ongoingSearch: params
        };
    }

    onSearch(sql2SearchFrom, sql2SearchWhere) {
        let {path, search} = this.props;

        let params = {sql2SearchFrom, sql2SearchWhere};

        search('sql2Search', path, params);
    }

    render() {
        let {onNormalClick, path, classes, t} = this.props;
        let {sql2SearchFrom, sql2SearchWhere, ongoingSearch} = this.state;

        return (
            <SearchBarLayout
                             t={t}
                             leftFooter={
                                 <DxContext.Consumer>{dxContext => (
                                     <Typography align="right" color="invert">
                                         <Trans i18nKey="label.contentManager.search.sql2Prompt"
                                                components={[
                                                    <a key="sql2Prompt"
                                                       href={dxContext.config.sql2CheatSheetUrl}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className={classes.link}
                                                    >
                                                        univers
                                                    </a>
                                                ]}
                                         />
                                     </Typography>
                                 )}
                                 </DxContext.Consumer>}
                             rightFooter={
                                 <React.Fragment>
                                     {!ongoingSearch.sql2SearchFrom ?
                                         <ActionButton
                                             label="label.contentManager.search.normal"
                                             cmRole="search-type-normal"
                                             onClick={onNormalClick}
                                         /> :
                                         <div className={classes.replaceButtonStyle}/>
                                     }
                                 </React.Fragment>}
                             onSearch={() => this.onSearch(sql2SearchFrom, sql2SearchWhere)}
            >
                <Paper className={classes.input}>
                    <Typography variant="iota" color="alpha" className={classes.sql2Form}>
                        SELECT * FROM [
                        <Sql2Input
                            maxLength={100}
                            size={15}
                            value={sql2SearchFrom}
                            cmRole="sql2search-input-from"
                            onChange={event => {
                                this.setState({sql2SearchFrom: event.target.value});
                            }}
                            onSearch={() => this.onSearch(sql2SearchFrom, sql2SearchWhere)}
                        />
                        ] WHERE ISDESCENDANTNODE(&rsquo;{path}&rsquo;) AND (
                        <Sql2Input
                            maxLength={2000}
                            className={classes.inInput}
                            value={sql2SearchWhere}
                            cmRole="sql2search-input-where"
                            onChange={event => {
                                this.setState({sql2SearchWhere: event.target.value});
                            }}
                            onSearch={() => this.onSearch(sql2SearchFrom, sql2SearchWhere)}
                        />
                        )
                    </Typography>
                </Paper>
            </SearchBarLayout>
        );
    }
}

const mapStateToProps = state => ({
    path: state.path,
    params: state.params
});

const mapDispatchToProps = dispatch => {
    return {
        search: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
    };
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(SearchBarSql2);
