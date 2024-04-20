async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}


async function wrapper(JSON_KEY_DATA, PASSWD) {
    const hashFull = await hashData(PASSWD);
    const hash = hashFull.slice(0,24);
    // console.log(hash);
    return cryptoContainers.encryptContainer(JSON_KEY_DATA, hash);
}

async function unwrapper(ENCONTAINER, PASSWD) {
    // console.log(md5(PASSWD).slice(0,24));
    const hashFull = await hashData(PASSWD);
    const hash = hashFull.slice(0,24);
    // console.log(hash);
    try {
        return cryptoContainers.decryptContainer(ENCONTAINER, hash);
    } catch (e) {
        alert("Неверный пароль");
    }
}

async function test1() {
    let test = await wrapper("Hello", "kali");
    console.log(test);
// console.log(test.then(function (result)));
    console.log(await unwrapper(test, "kali"));
}

// test1()
