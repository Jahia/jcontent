(function () {
    if (window.location.href.indexOf('/cms/contentmanager') === -1) {
        return;
    }

    function waitForFunction() {
        if (window.displayDXLoadingScreen) {
            window.displayDXLoadingScreen({
                en: 'Loading Content and Media Manager...',
                fr: 'Chargement du gestionnaire de contenu et média...',
                de: 'Content- und Medien-Manager wird geladen...'
            });
        } else {
            console.log('Waiting for 100ms for function window.displayDXLoadingScreen to become available');
            setTimeout(waitForFunction, 100);
        }
    }

    waitForFunction();
})();
