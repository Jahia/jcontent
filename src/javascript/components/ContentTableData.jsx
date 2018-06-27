import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery} from "./gqlQueries";
import * as _ from "lodash";
import {List} from '@material-ui/core';

class ContentTableData extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <Query fetchPolicy={'network-only'} query={allContentQuery}>
            { ({loading, error, data}) => {
                let rows = [];
                if (data.jcr && data.jcr.nodesByCriteria) {
                    rows = _.map(data.jcr.nodesByCriteria.nodes, contentNode => {
                        let contents = _.values(contentNode);

                        return {
                            path: contentNode.path,
                            uuid: contentNode.uuid,
                            displayName: contentNode.displayName,
                            contents: contents
                        }
                    })
                }

                return <List>
                    {rows.map((node, index) => {
                        return <h3 key={index}>{node.displayName}</h3>;
                    })}
                </List>;
            }}
        </Query>;
    }
}

export {ContentTableData};