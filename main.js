const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

async function handleDirOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        { properties: ['openDirectory']});
    if (canceled) {
        return "Directory is not selected";
    } else {
        return filePaths[0]
    }
}

async function handleCopyFiles (event, copyFrom, copyTo) {
    const win = BrowserWindow.getFocusedWindow();
    win.setProgressBar(0);
    
    try {
        // Get the files as an array
        const files = await fs.promises.readdir( copyFrom );
        let incr = files.length / 100;
        let copied = 0;

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
                const birthTime = stat.birthtime;
                
                // TODO: instead of relying on birthtime, extract the EXIF data
                let dateTimeString = birthTime.toString().split(" ");
                
                const months = {Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                                Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'};
                
                //TODO: why can't this be destructured?
                let year = dateTimeString[3];
                let month = months[dateTimeString[1]];
                let day = dateTimeString[2];
                const folder = `${year}\-${month}\-${day}`;
                const toPath = path.join( copyTo, year, folder, file );
                
                // Create year folder
                if (!fs.existsSync(path.join( copyTo, year ))) {
                    fs.mkdirSync(path.join( copyTo, year ));
                };
                // Create date folder if does not exist and copy files
                if (!fs.existsSync(path.join( copyTo, year, folder ))){
                    fs.mkdirSync(path.join( copyTo, year, folder ));
                    await fs.promises.copyFile( fromPath, toPath );

                } else {
                    // Copy files if destination folders exist
                    await fs.promises.copyFile( fromPath, toPath );
                };
                console.log( "Copied '%s'->'%s'", fromPath, toPath );
                copied += 1;
                incr += incr;
                if (incr <= .99) {
                    win.setProgressBar(incr);
                } else {
                    // Set a delay so completion is more visible
                    win.setProgressBar(incr += 1000);
                    win.setProgressBar(-1);
                };

            };
        }; // End for...of
        return copied;
    }
    catch( e ) {
        // Catch anything bad that happens
        return e;
    };
};

function createWindow () {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile('index.html');
};

app.whenReady().then(() => {
    ipcMain.handle('dialog:openDirectory', handleDirOpen);
    ipcMain.handle('dialog:copyFiles', handleCopyFiles);
    createWindow();
    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});