const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const IMG_FORMATS = [
    // Raw formats
    ".3fr", ".ari", ".arw", ".bay", ".braw", ".crw", ".cr2", ".cr3", ".cap", ".data", ".dcs", ".dcr", ".dng",
    ".drf", ".eip", ".erf", ".fff", ".gpr", ".iiq", ".k25", ".kdc", ".mdc", ".mef", ".mos", ".mrw", ".nef", 
    ".nrw", ".obm", ".orf", ".pef", ".ptx", ".pxn", ".r3d", ".raf", ".raw", ".rwl", ".rw2", ".rwz", ".sr2", 
    ".srf", ".srw", ".tif", ".x3f",
    // Image formats
    ".jpg", ".jpeg", ".jpe", ".jif", ".jfif", ".jfi", ".png", ".gif", ".tiff", ".tif", ".psdbmp", ".dib", 
    ".heif", ".heic", ".jp2", ".j2k", ".jpf", ".jpx", ".jpm", ".mj2", ".svg", ".svgz"
];

async function handleDirOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        { properties: ['openDirectory']});
    if (canceled) {
        return "Directory is not selected";
    } else {
        return filePaths[0];
    };
};

const getFiles = async function(dirPath, fileArray) {
    // recursively loop through folders and get file paths
    files = fs.readdirSync(dirPath);
    fileArray = fileArray || [];
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        fileArray = getFiles(dirPath + "/" + file, fileArray);
      } else {
        fileArray.push(path.join(dirPath, "/", file));
      };
    });
    return fileArray;
};

async function handleCopyFiles (event, copyFrom, copyTo) {
    const win = BrowserWindow.getFocusedWindow();
    win.setProgressBar(0);
    
    try {
        // Get the files as an array
        const files = await getFiles( copyFrom );
        let incr = files.length / 100;
        let copied = 0;

        for( const file of files ) {            
            
            let fileExt = path.parse(file).base.split(".");
            fileExt = fileExt.slice(-1)[0].toLowerCase();

            if (IMG_FORMATS.includes(`.${fileExt}`)) {

                const stat = await fs.promises.stat( file );
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
                let filename = path.parse(file).base;
                const toPath = path.join( copyTo, year, folder, filename);
                
                // If file does not already exist in dest
                if (!fs.existsSync( toPath )) {

                    // Create year folder
                    if (!fs.existsSync(path.join( copyTo, year ))) {
                        fs.mkdirSync(path.join( copyTo, year ));
                    };
                    // Create date folder if does not exist
                    if (!fs.existsSync(path.join( copyTo, year, folder ))){
                        fs.mkdirSync(path.join( copyTo, year, folder ));
                    };
                    await fs.promises.copyFile( file, toPath );
                    console.log( "Copied '%s'->'%s'", file, toPath );
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
            } else {
            // Skip if not an image file
                incr += incr;
                win.setProgressBar(incr);
                continue;
            };
        }; // End for...of
        return copied;
    }
    catch( e ) {
        // Catch anything bad that happens
        win.setProgressBar(-1);
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