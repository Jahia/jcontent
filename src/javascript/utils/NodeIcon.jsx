import PropTypes from 'prop-types';
import {getIconFromNode} from './getIcon';

export const NodeIcon = ({node, ...props}) => {
    return getIconFromNode(node, props);
};

NodeIcon.propTypes = {
    node: PropTypes.shape({
        path: PropTypes.string,
        primaryNodeType: PropTypes.object,
        content: PropTypes.object,
        resourceChildren: PropTypes.object,
        mixinTypes: PropTypes.array
    }).isRequired
};

export default NodeIcon;
