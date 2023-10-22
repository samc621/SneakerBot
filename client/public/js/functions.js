const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
var isLeftMenuActive = true



//Button Functions for Menu Bar
closeBtn.addEventListener('click', ()=>{
    ipc.send('closeApp')
    console.log("close button presssed")
})


function changeMaxButton(isMaximized){
    if(isMaximized){
        maximizeBtn.title='Restore'
    }else{
        maximizeBtn.title='Maximize'
    }
}

ipc.on('isMaximized', ()=>{
    changeMaxButton(true)
})
ipc.on('isRestored', ()=>{
    changeMaxButton(false)
})
maximizeBtn.addEventListener('click', ()=>{
    ipc.send('maximizeApp')
})

minimizeBtn.addEventListener('click', ()=>{
    ipc.send('minimizeApp')
})



//SIDE BAR
showHideMenus.addEventListener('click', ()=>{
    const mysidebar = document.getElementById('mySidebar')
    if(isLeftMenuActive){
        mysidebar.style.width='0px';
        isLeftMenuActive=false;
    }else{
        mysidebar.style.width='280px';
        isLeftMenuActive=true;
    }
    
    
})
