import React from "react";
import {withStyles, Input, Paper, Button, Collapse} from "@material-ui/core";
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";

const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit,
    },
    sql2Form: {
        padding: theme.spacing.unit,
        color: theme.palette.text.secondary,
        fontFamily: 'monospace'
    },
    sql2Input : {
        margin: 0,
        padding: 0,
        fontFamily: 'monospace'
    },
    actions: {
        textAlign: 'right'
    }
});

class Sql2SearchInputForm extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            open: props.open
        }

        this.from = React.createRef();
        this.where = React.createRef();
    }

    onExpandCollapseClick = () => {
        this.setState({
            open: !this.state.open
        });
    }

    onSearchClick = (goto) => {
        goto('/sql2Search', (this.where.current.value !== "") ? {
            sql2SearchExpanded: true,
            sql2SearchFrom: this.from.current.value,
            sql2SearchWhere: this.where.current.value
        } : {
            sql2SearchExpanded: true,
            sql2SearchFrom: this.from.current.value
        });
    }

    onQuitClick = (goto) => {
        goto('/browse');
    }

    render() {

        let {siteKey, from, where, classes, t} = this.props;

        return (
            <div className={classes.root}>
                <Button onClick={this.onExpandCollapseClick}>
                    {t('label.contentManager.sql2Search')}
                    {this.state.open ? <ExpandLess/> : <ExpandMore/>}
                </Button>
                <Collapse in={this.state.open}>
                    <CmRouter render={({goto}) => (
                        <Paper classes={{root: classes.sql2Form}}>
                            <div>
                                <div>
                                    SELECT * FROM [<Sql2Input maxLength={50} size={20} defaultValue={from} inputRef={this.from}/>] WHERE ISDESCENDANTNODE('/sites/{siteKey}')
                                </div>
                                <div>
                                    AND (<Sql2Input maxLength={500} size={80} defaultValue={where} inputRef={this.where}/>)
                                </div>
                            </div>
                            <div className={classes.actions}>
                                <div>
                                    <Button size={'small'} onClick={() => this.onSearchClick(goto)}>{t('label.contentManager.search')}</Button>
                                    {
                                        from && // TODO: When routing implementation allows it, rework to rely on current mode (browse/search) rather than on specific search parameter.
                                        <Button size={'small'} onClick={() => this.onQuitClick(goto)}>{t('label.contentManager.quitSearch')}</Button>
                                    }
                                </div>
                            </div>
                        </Paper>
                    )}/>
                </Collapse>
            </div>
        );
    }
}

class Sql2Input extends React.Component {

    onKeyUp = (e) => {
        if (e.key === 'Enter') {
            this.props.onEnterPressed();
        }
    }

    render() {

        let {maxLength, size, defaultValue, inputRef, classes, onEnterPressed} = this.props;

        return (
            <Input inputProps={{maxLength: maxLength, size: size}} defaultValue={defaultValue} inputRef={inputRef} classes={{root: classes.sql2Input, input: classes.sql2Input}}
            onKeyUp={(e)=>this.onKeyUp(e)}/>
        );
    }
}

Sql2Input = withStyles(styles)(Sql2Input);

Sql2SearchInputForm = compose(
    translate(),
    withStyles(styles)
)(Sql2SearchInputForm);

export default Sql2SearchInputForm;