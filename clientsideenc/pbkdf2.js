(() => {

    let ciphertext; // TODO next step: store encrypted text and all necessary data (iv?) in the simulated storage

    function buf2hex(buf) {
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    // ou base64 ?
    /**
        const keyArray = Array.from(new Uint8Array(keyBuffer));                                      // key as byte array

        const saltArray = Array.from(new Uint8Array(saltUint8));                                     // salt as byte array

        const compositeArray = [].concat(saltArray, keyArray);                                       // combined array
        const compositeStr = compositeArray.map(byte => String.fromCharCode(byte)).join('');         // combined as string
        const compositeBase64 = btoa('01' + compositeStr);                                            // encode as base64
     *
     *
     * decode
     *   let compositeStr = null; // composite key is salt, iteration count, and derived key
        try { compositeStr = atob(key); } catch (e) { throw new Error ('Invalid key'); }             // decode from base64

        const version = compositeStr.slice(0, 2);   //  2 bytes
        const saltStr = compositeStr.slice(2, 18);  // 16 bytes (128 bits)
        const keyStr  = compositeStr.slice(18, 50); // 32 bytes (256 bits)

        if (version != '01') throw new Error('Invalid key');

        // -- recover salt from stored (composite) key
        const saltUint8 = new Uint8Array(saltStr.match(/./g).map(ch => ch.charCodeAt(0)));           // salt as Uint8Array
        // note: cannot use TextEncoder().encode(saltStr) as it generates UTF-8
     */

    /*
    Fetch the contents of the "message" textbox, and encode it
    in a form we can use for the encrypt operation.
    */
    function getMessageEncoding() {
        let message = document.querySelector("#pbkdf2-message").value;
        let enc = new TextEncoder();
        return enc.encode(message);
    }

    /*
    Get some key material to use as input to the deriveKey method.
    The key material is a password supplied by the user.
    */
    function getKeyMaterial() {
        let password = window.prompt("Enter your password");
        let enc = new TextEncoder();
        return window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
    }

    /*
    Given some key material and some random salt
    derive an AES-GCM key using PBKDF2.
    */
    function getKey(keyMaterial, salt) {
        return window.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                salt: salt,
                "iterations": 100000,
                "hash": "SHA-512"
            },
            keyMaterial,
            { "name": "AES-GCM", "length": 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    /*
    Derive a key from a password supplied by the user, and use the key
    to encrypt the message.
    Update the "ciphertextValue" box with a representation of part of
    the ciphertext.
    */
    async function encrypt() {
        const ciphertextValue = document.querySelector(".pbkdf2 .ciphertext-value");
        ciphertextValue.textContent = "";
        const decryptedValue = document.querySelector(".pbkdf2 .decrypted-value");
        decryptedValue.textContent = "";

        let keyMaterial = await getKeyMaterial();
        let salt = window.crypto.getRandomValues(new Uint8Array(16));
        // store keyphrase salt
        storeArray("salt", salt);
        let key = await getKey(keyMaterial, salt);
        let iv = window.crypto.getRandomValues(new Uint8Array(12));
        // store iv
        storeArray("iv", iv);
        let encoded = getMessageEncoding();

        ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encoded
        );

        // let buffer = new Uint8Array(ciphertext, 0, 5);
        ciphertextValue.textContent = btoa(ciphertext);// `${buffer}...[${ciphertext.byteLength} bytes total]`;
    }

    /*
    Derive a key from a password supplied by the user, and use the key
    to decrypt the ciphertext.
    If the ciphertext was decrypted successfully,
    update the "decryptedValue" box with the decrypted value.
    If there was an error decrypting,
    update the "decryptedValue" box with an error message.
    */
    async function decrypt() {
        const decryptedValue = document.querySelector(".pbkdf2 .decrypted-value");
        decryptedValue.textContent = "";
        decryptedValue.classList.remove("error");

        let keyMaterial = await getKeyMaterial();
        let key = await getKey(keyMaterial, retrieveFromStorage("salt"));

        try {
            let decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: retrieveFromStorage("iv")
                },
                key,
                ciphertext
            );

            let dec = new TextDecoder();
            decryptedValue.textContent = dec.decode(decrypted);
        } catch (e) {
            decryptedValue.classList.add("error");
            decryptedValue.textContent = "*** Decryption error ***";
            console.error("*** Decryption error ***", e);
        }
    }

    const encryptButton = document.querySelector(".pbkdf2 .encrypt-button");
    encryptButton.addEventListener("click", encrypt);

    const decryptButton = document.querySelector(".pbkdf2 .decrypt-button");
    decryptButton.addEventListener("click", decrypt);
})();

function storeArray(key, array) {
    sessionStorage.setItem(key, btoa(array));
}

function retrieveFromStorage(key) {
    return Uint8Array.from(atob(sessionStorage.getItem(key)).split(",").map(ch => Number(ch)));
}


