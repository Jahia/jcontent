import React from 'react';
import {withStyles, Input} from '@material-ui/core';

const styles = () => ({
    sql2Input: {
        margin: 0,
        padding: 0,
        width: 100,
        fontFamily: 'monospace'
    }
});

class Sql2Input extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onKeyDown(e) {
        if (e.key === 'Enter') {
            this.props.onSearch();
        }
    }

    render() {
        let {maxLength, size, defaultValue, inputRef, classes, style, cmRole} = this.props;

        return (
            <Input
                inputProps={{maxLength: maxLength, size: size, 'data-cm-role': cmRole}}
                defaultValue={defaultValue}
                inputRef={inputRef}
                classes={{root: classes.sql2Input, input: classes.sql2Input}}
                style={style}
                onKeyDown={e => this.onKeyDown(e)}
            />
        );
    }
}

export default withStyles(styles)(Sql2Input);
