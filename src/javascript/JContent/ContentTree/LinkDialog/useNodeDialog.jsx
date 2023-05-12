import {useState} from 'react';

export const useNodeDialog = () => {
    const [isOpen, setOpen] = useState(false);
    const [node, setNode] = useState();

    const openDialog = node => {
        setOpen(true);
        setNode(node);
    };

    const onClose = () => {
        setOpen(false);
        setNode();
    };

    return {
        openDialog,
        node,
        isOpen,
        onClose
    };
};
