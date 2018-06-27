import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";

class ContentTableData extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            rowsPerPage: 5
        };
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    }


    handleChangePage = (event, page) => {
        this.setState({page});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };


    render() {
        return <Query fetchPolicy={'network-only'} query={allContentQuery}>
            { ({loading, error, data}) => {
                let rows = [];
                if (data.jcr && data.jcr.nodesByCriteria) {
                    rows = _.map(data.jcr.nodesByCriteria.nodes, contentNode => {

                        return {
                            uuid: contentNode.uuid,
                            name: contentNode.displayName,
                            type: contentNode.primaryNodeType.name,
                            created: contentNode.created.value,
                            createdBy: contentNode.createdBy.value
                        }
                    })
                }

                return <ContentListTable rows={rows}  pageSize={this.state.rowsPerPage} onChangeRowsPerPage={this.handleChangeRowsPerPage} onChangePage={this.handleChangePage} page={this.state.page}/>;
            }}
        </Query>;
    }
}

export {ContentTableData};