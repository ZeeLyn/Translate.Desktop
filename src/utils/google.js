const { ipcRenderer } = require("electron");

export function GoogleTranslate(store, query, from, to, callback, _err, _finally) {
    return ipcRenderer.invoke("$GoogleTranslate", store.google.domain, query, from, to)
        .then(res => { if (res) callback(res); })
        .catch(err => { if (_err) _err(err); })
        .finally(() => { if (_finally) _finally(); });
}
