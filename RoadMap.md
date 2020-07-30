# Step 1
- Simple HTML.  
- Allows to login and save encrypted text in separate database.  
- Encryption is derived from user password.  
- All new user are accepted by default to not have to handled that for now.

=> *Revised* mono-user / is it possible to not need the login?

Tech used
---
- https://www.litedb.org/docs/getting-started/
- https://blog.cozy.io/fr/gestionnaire-de-mots-de-passe-introduction-cryptographique/ - PBKDF2 

![](https://blog.cozy.io/fr/content/images/2020/02/Capture-d-e-cran-2020-02-24-a--15.53.31.png)

- https://www.perimeterx.com/tech-blog/2019/fun-times-with-webcrypto-part2/

- https://github.com/ttaubert/secret-notes
- https://github.com/diafygi/webcrypto-examples


- https://quilljs.com/
    - https://github.com/quilljs/awesome-quill
- https://prosemirror.net/
- https://docs.slatejs.org/
    - https://www.slatejs.org/examples/markdown-shortcuts
    - https://www.slatejs.org/examples/markdown-preview 
- https://github.com/Ionaru/easy-markdown-editor => markdown natif et auto-save
- https://crypt.ee/press-kit
- https://crypt.ee/acknowledgements

- style de l'éditeur : https://litewrite.net/
  -  la façon de se fondre dans la page
  -  la recherche

- check if it works on selfhosted resources: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity

- Search
    - https://lunrjs.com/
    - https://github.com/bleroy/lunr-core

**Client side**

- use crypt.subtle.generateKey with PBKDF2 will prompt the user and avoid to handle the password in js => not supported yet

- Password => PBKDF => master key => used to crypt / decrypt data

- user login as salt to avoid storing encryption/user data? Hashed to got a long enough salt?

- user login hashed (SHA256?) send to server as DB id (filename)

- use HMAC to check messages integrity? => AES-GCM should be enough.

- store login hash and derived key / IV in SessionStorage (if that doesn't work, use IndexedBD or LocalStorage). If not present => redirect to login. => est-il réellement nécessaire de les stocker localement ?
  Possibilité d'utiliser `additionalData` du [`AesGcmParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams) afin de garantir leur intégrité sans les chiffrer.

**Server side**

- Each user will have his own file database

Encrypt user database with user derived password?
If yes => derive a large key (512bits?) and split it in two, one for encryption of messages and the other to encrypt the database.
Or use HKDF on key derived from PBKDF2.

**Constraints:**
- server do not have any info on user/data
- therefor authentication is no an issue

**Questions:**
- is it coherent?
- is there a better way to temporarily store the decryption key on client-side?
- is it useful to encrypt the users databases on server side, considering that all data are already encrypted?


# Step 2
- Allows to save files.
- Settings to choose between mono and multi-users.=> discarded
- auto-lock after 10 minutes without input?

# Step 3
- Add notes organization.
    - expandable tree structure
    - link and search inter folders/notes
- PWA?

# Step 4
- Style.
- Installation page after deployment.
- Allow to export / import all notes
