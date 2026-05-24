function toggleMongoDBConnectionInfo() {
    if (document.getElementById('ConnectionInfo').checked == true) {
        document.getElementById('DatabaseConnectionString').style.display = "flex";
        document.getElementById('DBSampleData').style.display = "none";
        var child = document.getElementById('collation');
        document.getElementById('DatabaseConnectionString').appendChild(child);
        let dataProvider = document.getElementById('DataProvider');
        if (dataProvider.value == 3) {
            document.getElementById('DatabaseConnectionString').style.display = "none";
        }
    } else {
        document.getElementById('DatabaseConnectionString').style.display = "none";
        document.getElementById('DBSampleData').style.display = "block";
        var child = document.getElementById('collation');
        document.querySelector('.mongoDBDatabaseName').appendChild(child);

        let dataProvider = document.getElementById('DataProvider');
        if (dataProvider.value != "0") {
            dataProvider.value = 0;
        } 
    }
}
function DataProviderChange(provider) {
    if (provider != 0) {
        var elm = document.getElementById('ConnectionInfo');
        if (!elm.checked) {
            elm.click();
        }
        if (provider == 3) {
            document.getElementById('DatabaseConnectionString').style.display = "none";
        }
        else {
            document.getElementById('DatabaseConnectionString').style.display = "flex";
        }
    }
    else {
        var elm = document.getElementById('ConnectionInfo');
        if (elm.checked) {
            elm.click();
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('installation')) {
        document.getElementById('installation').addEventListener("click", function () {
            document.querySelector(".throbber").style.display = "block";
            window.setTimeout(function () {
                document.getElementById('installation-form').submit();
                document.getElementById('installation-form').setAttribute('disabled', 'disabled');
            }, 10);
        });
    }
    if (document.getElementById('ConnectionInfo')) {
        toggleMongoDBConnectionInfo();
    }
});

// Welcome popup — shown once per browser session
(function () {
    var SESSION_KEY = 'installPopupDismissed';

    function showPopup() {
        var overlay = document.getElementById('install-overlay');
        var popup = document.getElementById('install-popup');
        if (!overlay || !popup) return;

        overlay.style.display = 'flex';
        popup.classList.add('install-popup--entering');

        popup.addEventListener('animationend', function onEnter() {
            popup.classList.remove('install-popup--entering');
            popup.removeEventListener('animationend', onEnter);
        });
    }

    function hidePopup() {
        var overlay = document.getElementById('install-overlay');
        var popup = document.getElementById('install-popup');
        if (!overlay || !popup) return;

        popup.classList.remove('install-popup--entering');
        popup.classList.add('install-popup--leaving');

        var animDuration = (parseFloat(getComputedStyle(popup).animationDuration) || 0) * 1000;
        var fallback = setTimeout(function () {
            overlay.style.display = 'none';
            popup.classList.remove('install-popup--leaving');
            try {
                sessionStorage.setItem(SESSION_KEY, '1');
            } catch (e) { /* sessionStorage unavailable — silent fail */ }
        }, animDuration + 50);

        popup.addEventListener('animationend', function onLeave() {
            clearTimeout(fallback);
            overlay.style.display = 'none';
            popup.classList.remove('install-popup--leaving');
            popup.removeEventListener('animationend', onLeave);
            try {
                sessionStorage.setItem(SESSION_KEY, '1');
            } catch (e) { /* sessionStorage unavailable — silent fail */ }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var closeBtn = document.getElementById('install-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hidePopup);
        }

        var shouldShow = false;
        try {
            shouldShow = !sessionStorage.getItem(SESSION_KEY);
        } catch (e) {
            shouldShow = true; // sessionStorage unavailable: show popup anyway
        }

        if (shouldShow) {
            showPopup();
        }
    });
}());
