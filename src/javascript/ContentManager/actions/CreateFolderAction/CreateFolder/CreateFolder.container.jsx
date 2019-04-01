import {Mutation, Query} from 'react-apollo';
import React from 'react';
import {CreateFolderQuery} from './CreateFolder.gql-queries';
import {CreateFolderMutation} from './CreateFolder.gql-mutations';
import CreateFolder from './CreateFolder';
import PropTypes from 'prop-types';

const CreateFolderContainer = ({variables, node, contentType, onExit}) => {
    return (
        <Query query={CreateFolderQuery} variables={variables} fetchPolicy="cache-first">
            {({loading, data}) => {
                let childNodes = [];
                if (data && data.jcr && data.jcr.nodeByPath) {
                    childNodes = data.jcr.nodeByPath.children.nodes;
                }
                return (
                    <Mutation mutation={CreateFolderMutation} refetchQueries={() => ['PickerQuery', 'getNodeSubTree']}>
                        {mutation => (
                            <CreateFolder childNodes={childNodes}
                                          contentType={contentType}
                                          loading={loading}
                                          mutation={mutation}
                                          node={node}
                                          onExit={onExit}/>
                        )}
                    </Mutation>
                );
            }}
        </Query>
    );
};

CreateFolderContainer.propTypes = {
    node: PropTypes.object.isRequired,
    variables: PropTypes.object.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

export default CreateFolderContainer;
