import React, {useEffect, useState} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';
import {useSelector} from 'react-redux';
import {getCoords} from '~/JContent/PageComposerRoute/EditFrame/EditFrame.utils';

const ButtonRenderer = getButtonRenderer({defaultButtonProps: {color: 'default'}});

function getBoundingBox(element) {
    const rect = getCoords(element);
    return {
        ...rect,
        maxWidth: rect.width,
        height: 25
    };
}

const reposition = function (element, currentOffset, setCurrentOffset) {
    const box = getBoundingBox(element);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
};

export const Create = React.memo(({element, node, addIntervalCallback, onMouseOver, onMouseOut, onSaved}) => {
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));
    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);

    useEffect(() => {
        element.style.height = '28px';
    });

    const parentPath = parent.getAttribute('path');

    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved});

    const {anyDragging} = useDragLayer(monitor => ({
        anyDragging: monitor.isDragging()
    }));

    const copyPaste = useSelector(state => state.jcontent.copyPaste);

    const sizers = [];
    Array(10).fill(0).forEach((_, i) => {
        if (currentOffset.width < (i * 150)) {
            sizers.push('sizer' + i);
        }
    });

    const nodePath = element.getAttribute('path') === '*' ? null : element.getAttribute('path');
    const nodetypes = element.getAttribute('nodetypes') ? element.getAttribute('nodetypes').split(' ') : null;
    const {nodes} = copyPaste;

    useEffect(() => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)), [addIntervalCallback, currentOffset, element, setCurrentOffset]);
    reposition(element, currentOffset, setCurrentOffset);

    useEffect(() => {
        if (isCanDrop) {
            element.classList.add(styles.dropTarget);
        }

        return () => {
            element.classList.remove(styles.dropTarget);
        };
    }, [isCanDrop, element]);

    return !anyDragging && (
        <div ref={drop}
             jahiatype="createbuttons" // eslint-disable-line react/no-unknown-property
             data-jahia-id={element.getAttribute('id')}
             className={clsx(styles.root, editStyles.enablePointerEvents, sizers)}
             style={currentOffset}
             data-jahia-parent={parent.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
        >
            {nodes.length === 0 && (<DisplayAction actionKey="createContent" path={parentPath} name={nodePath} nodeTypes={nodetypes} loading={() => false} render={ButtonRenderer}/>)}
            <DisplayAction actionKey="paste" path={parentPath} loading={() => false} render={ButtonRenderer}/>
            <DisplayAction actionKey="pasteReference" path={parentPath} loading={() => false} render={ButtonRenderer}/>
        </div>
    );
});

Create.propTypes = {
    element: PropTypes.any,
    node: PropTypes.any,
    addIntervalCallback: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onSaved: PropTypes.func
};