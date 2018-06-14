import React from "react";
import {Grid} from '@material-ui/core';

class ManagerLayout extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {header, leftSide, children} = this.props;
        return (
            <Grid container>
                <Grid item xs={12}>
                    {header}
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={3}>
                            {leftSide}
                        </Grid>
                        <Grid item xs={9}>
                            {children}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}

export default ManagerLayout