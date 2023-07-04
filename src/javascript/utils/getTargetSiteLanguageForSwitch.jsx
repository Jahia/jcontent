export const getTargetSiteLanguageForSwitch = (siteNode, currentLang) => {
    let newLang = null;
    let siteLanguages = siteNode.site.languages;
    for (let i in siteLanguages) {
        if (Object.prototype.hasOwnProperty.call(siteLanguages, i)) {
            let lang = siteLanguages[i];
            if (lang.activeInEdit && lang.language === currentLang) {
                newLang = currentLang;
                break;
            }
        }
    }

    return newLang ? newLang : siteNode.site.defaultLanguage;
};
