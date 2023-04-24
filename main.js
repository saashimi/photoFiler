const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

async function handleDirOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        { properties: ['openDirectory']})
    if (canceled) {
        return
    } else {
        return filePaths[0]
    }
}

async function handleCopyFiles (event, copyFrom, copyTo) {
    // Our starting point
    try {
        // Get the files as an array
        const files = await fs.promises.readdir( copyFrom );

        // Loop them all with the new for...of
        for( const file of files ) {            
            // Get the full paths
            const fromPath = path.join( copyFrom, file );

            // Stat the file to see if we have a file or dir
            const stat = await fs.promises.stat( fromPath );

            if( stat.isFile() )
                console.log( "'%s' is a file.", fromPath );
            else if( stat.isDirectory() )
                console.log( "'%s' is a directory.", fromPath );

            // Now copy async
            if ( stat.isFile() ) {
                const birthTime = stat.birthtime
                //console.log( "File '%s' was created on %s", stat, birthTime);
                let dateTimeString = birthTime.toString().split(" ");
                //console.log(dateTimeString);
                
                const months = {Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                                Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',}
                
                //TODO: why can't this be destructured?
                let year = dateTimeString[3]
                let month = months[dateTimeString[1]]
                let day = dateTimeString[2]
                const folder = `${year}\-${month}\-${day}`
                const toPath = path.join( copyTo, folder, file );
                //TODO first check if folder exists, if not, create file
                if (!fs.existsSync(path.join(copyTo, folder))){
                    fs.mkdirSync(path.join(copyTo, folder))
                    await fs.promises.copyFile( fromPath, toPath );

                } else {
                    await fs.promises.copyFile( fromPath, toPath );
                }
                console.log( "Copied '%s'->'%s'", fromPath, toPath );

            } 

            // Log because we're crazy
        } // End for...of
    }
    catch( e ) {
        // Catch anything bad that happens
        console.error( "We've thrown! Whoops!", e );
    }
}

function createWindow () {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openDirectory', handleDirOpen)
    ipcMain.on('dialog:copyFiles', handleCopyFiles)
    createWindow()
    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})