const initialState = {
    path: null,  //folder that will get files
    panelState: "INVISIBLE", //or "VISIBLE", "PARTIALLY_VISIBLE"
    status: "NOT_STARTED", //or "UPLOADING", "UPLOADED", "HAS_ERRORS"
    uploads: []
};

const upload = {
    id: "",
    status: "QUEUED", //or "UPLOADING", "UPLOADED", "HAS_ERROR"
    error: null
};

export const fileUpload = (state = initialState, action) => {
    switch(action.type) {
        default : return state;
    }
};

