import {useRef} from 'react';

const isRef = obj => (
    obj !== null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, 'current')
);

export const useConnector = () => {
    const current = {
        node: null,
        ref: useRef()
    };

    const getCurrent = () => current.node || (current.ref && current.ref.current);
    const setCurrent = elem => {
        if (isRef(elem)) {
            current.ref = elem;
        } else {
            current.node = elem;
        }
    };

    return {
        getCurrent, setCurrent
    };
};
