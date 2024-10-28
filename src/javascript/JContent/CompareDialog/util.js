import rison from 'rison-node';

export const decodeHashString = hash => {
    let values = {};
    try {
        values = hash ? rison.decode_uri(hash.substring(1)) : {};
    } catch (e) {
        console.error(e);
    }

    return values;
};

export const createEncodedHashString = path => {
    return rison.encode_uri({
        jcontent: {
            compareDialog: {
                open: true,
                path: path
            }
        }
    });
};
