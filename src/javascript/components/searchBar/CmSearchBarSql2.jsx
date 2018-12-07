import React from 'react';
import {DxContext} from '../DxContext';
import SearchBarLayout from './SearchBarLayout';
import ActionButton from './ActionButton';
import Sql2Input from './Sql2Input';
import _ from 'lodash';
import {compose} from 'react-apollo';
import {Grid, withStyles} from '@material-ui/core';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import {cmGoto} from '../redux/actions';

const styles = theme => ({
    sql2Form: {
        height: 48,
        padding: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 2,
        color: theme.palette.text.secondary,
        fontFamily: 'monospace',
        backgroundColor: theme.palette.background.default
    },
    link: {
        color: 'inherit'
    },
    replaceButtonStyle: {
        minHeight: 32,
        maxHeight: 32,
        height: 32
    }
});

class CmSearchBarSql2 extends React.Component {
    constructor(props) {
        super(props);
        this.from = React.createRef();
        this.where = React.createRef();
    }

    onSearch(path, params) {
        params.sql2SearchFrom = this.from.current.value;
        if (this.where.current.value === '') {
            _.unset(params, 'sql2SearchWhere');
        } else {
            params.sql2SearchWhere = this.where.current.value;
        }

        this.props.search('sql2Search', path, params);
    }

    render() {
        let {onNormalClick, path, params, classes, t} = this.props;

        return (
            <SearchBarLayout t={t}
                             leftFooter={
                                 <DxContext.Consumer>{dxContext => (
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
                                 )}
                                 </DxContext.Consumer>}
                             rightFooter={
                                 <React.Fragment>
                                     {!params.sql2SearchFrom ?
                                         <ActionButton
                                             label="label.contentManager.search.normal"
                                             cmRole="search-type-normal"
                                             onClick={onNormalClick}
                                         /> :
                                         <div className={classes.replaceButtonStyle}/>
                                     }
                                 </React.Fragment>}
                             onSearch={() => this.onSearch(path, params)}
            >
                <Grid container alignItems="center" classes={{container: classes.sql2Form}}>
                    SELECT * FROM [
                    <Sql2Input
                        maxLength={100}
                        size={15}
                        defaultValue={params.sql2SearchFrom}
                        inputRef={this.from}
                        cmRole="sql2search-input-from"
                        onSearch={() => this.onSearch(path, params)}
                    />
                    ] WHERE ISDESCENDANTNODE(&rsquo;{path}&rsquo;) AND (
                    <Sql2Input
                        maxLength={2000}
                        className={classes.inInput}
                        defaultValue={params.sql2SearchWhere}
                        inputRef={this.where}
                        cmRole="sql2search-input-where"
                        onSearch={() => this.onSearch(path, params)}
                    />
                    )
                </Grid>
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
)(CmSearchBarSql2);
