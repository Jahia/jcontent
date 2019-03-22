let modificationFunction = null;

const setModificationHook = modificationFcn => {
    modificationFunction = modificationFcn;
};

const invokeModificationHook = args => {
    if (modificationFunction !== null) {
        modificationFunction(args);
    }
};

export {invokeModificationHook, setModificationHook};
