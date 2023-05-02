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

const getFiles = function(dirPath, fileArray) {
    // recursively loop through folders and get file paths
    files = fs.readdirSync(dirPath);
    fileArray = fileArray || [];
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        fileArray =  getFiles(dirPath + "/" + file, fileArray);
      } else {
        fileArray.push(path.join(dirPath, "/", file));
      };
    });
    return fileArray;
};

async function handleCopyFiles (event, copyFrom, copyTo) {
    const win = BrowserWindow.getFocusedWindow();
    
    try {
        // Get the files as an array
        let files = await getFiles( copyFrom );
        let copied = 0;

        for( const file of files ) {            
            
            let fileExt = path.parse(file).base.split(".");
            fileExt = fileExt.slice(-1)[0].toLowerCase();

            if (IMG_FORMATS.includes(`.${fileExt}`)) {

                let stat = await fs.promises.stat( file );
                let birthTime = stat.birthtime;
                let dateTimeString = birthTime.toString().split(" ");
                
                let months = {Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                                Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'};
                
                let [year, month, day] =  [dateTimeString[3], months[dateTimeString[1]], dateTimeString[2]];
                let folder = `${year}\-${month}\-${day}`;
                let filename = path.parse(file).base;
                let toPath = path.join( copyTo, year, folder, filename);
                
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
                };
            } else {
                // Skip if not an image file
                continue;
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
        width: 800, 
        height: 235,
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