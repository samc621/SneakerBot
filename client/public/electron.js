const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require("electron-is-dev")
const path = require('path')
const ipc = ipcMain



const createWindow = () => {
  const win = new BrowserWindow({
    width: 1500,
    height: 1000,
    minHeight:1000,
    minWidth:1000,
    maxWidth:1500,
    autoHideMenuBar:true,
    frame:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools:true,
    preload: path.join(__dirname, 'preload.js')
  }
  });

  win.loadURL(
    isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`
    );
    //CLOSE WINDOW
  ipc.on('closeApp', ()=> {
    win.close()
  })
  ipc.on('maximizeApp', ()=> {
    if(win.isMaximized()){
      win.restore()
    }else{
      win.maximize()
    }
  })
  ipc.on('minimizeApp', ()=> {
    win.minimize()
  })
  ipc.on('menu', ()=> {
    console.log('Clicked on menu Button')
  })

  win.on('maximize', ()=>{
    win.webContents.send('isMaximized')
  })
  win.on('unmaximize', ()=>{
    win.webContents.send("isRestored")
  })

 

};
  

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});