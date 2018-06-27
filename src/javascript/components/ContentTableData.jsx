import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery, TableQueryVariables} from "./gqlQueries";
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

    handleChangeRowsPerPage = value => {
        this.setState({rowsPerPage: value});
    };


    render() {
        let { t, classes, filterText, totalCount, pageSize, poll} = this.props;
        return <Query fetchPolicy={'network-only'} query={allContentQuery} variables={TableQueryVariables(this.state)}>
            { ({loading, error, data}) => {
                let rows = [];
                let totalCount = 0;
                if (data.jcr && data.jcr.nodesByCriteria) {
                    totalCount = data.jcr.nodesByCriteria.pageInfo.totalCount;
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
                return <ContentListTable totalCount={totalCount} rows={rows}  pageSize={this.state.rowsPerPage} onChangeRowsPerPage={this.handleChangeRowsPerPage} onChangePage={this.handleChangePage} page={this.state.page}/>;
            }}
        </Query>;
    }
}

export {ContentTableData};