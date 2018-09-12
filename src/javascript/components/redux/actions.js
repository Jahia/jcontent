const SET_LANGUAGE = 'SET_LANGUAGE';

function setLanguage(language) {
    return {
        type: SET_LANGUAGE,
        language
    }
}

const SET_SITE = 'SET_SITE';

function setSite(site) {
    return {
        type: SET_SITE,
        site
    }
}


export {SET_LANGUAGE, setLanguage, SET_SITE, setSite}