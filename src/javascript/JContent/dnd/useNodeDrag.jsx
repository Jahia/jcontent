import {useDrag, useDragLayer} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from '~/JContent/actions/actions.constants';

export function useNodeDrag({dragSource}) {
    const {selection, language, displayLanguage} = useSelector(state => ({
        selection: state.jcontent.selection,
        language: state.language,
        displayLanguage: state.uilang
    }), shallowEqual);
    const isAnythingDragging = useDragLayer(monitor => monitor.isDragging());

    const res = useNodeChecks(
        {...(selection.length > 0 ? {paths: selection} : {path: dragSource?.path}), language, displayLanguage},
        {
            getPrimaryNodeType: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
        }
    );

    const [props, drag, dragPreview] = useDrag(() => selection.length === 0 ? ({
        type: 'node',
        item: dragSource,
        canDrag: () => Boolean(res.checksResult),
        collect: monitor => ({
            dragging: monitor.isDragging()
        })
    }) : ({
        type: 'nodes',
        item: res.nodes,
        canDrag: () => res.checksResult && selection.indexOf(dragSource.path) > -1,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [dragSource, selection, res]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    const enhancedProps = (isAnythingDragging && selection.indexOf(dragSource.path) > -1 && props.dragClasses.length === 0) ? {
        ...props,
        dragClasses: styles.drag
    } : props;

    return [enhancedProps, drag];
}
