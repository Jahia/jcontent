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
            open: false
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
            from: this.from.current.value,
            where: this.where.current.value
        } : {
            from: this.from.current.value
        });
    }

    onQuitClick = (goto) => {
        goto('/browse');
    }

    render() {

        let {siteKey, classes, t} = this.props;

        return (
            <div className={classes.root}>
                <Button onClick={this.onExpandCollapseClick}>
                    {t('label.contentManager.sql2Search')}
                    {this.state.open ? <ExpandLess/> : <ExpandMore/>}
                </Button>
                <Collapse in={this.state.open}>
                    <Paper classes={{root: classes.sql2Form}}>
                    <CmRouter render={({params, goto}) => (
                        <div>
                            <div>
                                <div>
                                    SELECT * FROM [<Sql2Input maxLength={100} size={20} inputRef={this.from} onEnterPressed={() => this.onSearchClick(goto)}/>] WHERE ISDESCENDANTNODE('/sites/{siteKey}')
                                </div>
                                <div>
                                    AND (<Sql2Input maxLength={2000} size={80} inputRef={this.where} onEnterPressed={() => this.onSearchClick(goto)}/>)
                                </div>
                            </div>
                            <div className={classes.actions}>
                                <div>
                                    <Button size={'small'} onClick={() => this.onSearchClick(goto)}>{t('label.contentManager.search')}</Button>
                                    {
                                        params.from && // TODO: When routing implementation allows it, rework to rely on current mode (browse/search) rather than on specific search parameter.
                                        <Button size={'small'} onClick={() => this.onQuitClick(goto)}>{t('label.contentManager.quitSearch')}</Button>
                                    }
                                </div>
                            </div>
                        </div>
                    )}/>
                    </Paper>
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