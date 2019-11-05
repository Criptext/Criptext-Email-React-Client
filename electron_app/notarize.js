require('dotenv').config();
const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');
const { build } = require('./package.json');

module.exports = async function (params) {
    // Only notarize the app on Mac OS only.
    if (process.platform !== 'darwin') return;
    console.log('afterSign hook triggered', params);

    // Same appId in electron-builder.
    let appId = build.appId

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);
    const password = `@keychain:AC_PASSWORD`;
    try {
        await electron_notarize.notarize({
            appBundleId: appId,
            appPath: appPath,
            appleId: process.env.APPLEID,
            appleIdPassword: password,
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`Done notarizing ${appId}`);
};