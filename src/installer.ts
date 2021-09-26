import { dialog, ipcMain, BrowserWindow, ipcRenderer } from "electron";
import * as path from 'path'
import * as fs from 'fs'
import AdmZip from "adm-zip";
import * as http from "https"
import * as util from "util"
import * as p from "child_process"

export default function(win: BrowserWindow) {
  ipcMain.on('locationSelect', async (e, installLocation: string) => {
    console.log(installLocation)
    const loc = await dialog.showOpenDialog({
      message: 'Select install folder',
      properties: ['openDirectory','createDirectory'],
      buttonLabel: 'Select',
      defaultPath: installLocation || undefined,
    })
    if (!loc.canceled){
      e.sender.send('locationSelect', loc.filePaths[0])
    }
  })
  ipcMain.on('isInstalled', (e, gameName: string) => {
    win.webContents.executeJavaScript('localStorage.getItem("installLocation");', true)
    .then(result => {
      let installed = false;
      if (result) installed = fs.existsSync(path.join(result, gameName || ''))
      e.sender.send('isInstalled', installed)
    });
  })

  ipcMain.on('install', async (e, name: string, url: string)=> {
    const location = await win.webContents.executeJavaScript('localStorage.getItem("installLocation");', true)
    const res = http.get(await getDownloadUrl(url), function(response) {
        var len = parseInt(response.headers['content-length'] || '0', 10);
        // console.log(response.headers);
        
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in  1Megabyte

        response.on("data", function(chunk) {
            cur += chunk.length;
            e.sender.send('downloadProgress', cur, len)
            console.log(`Progress: ${cur}/${len}`);
        });

        res.on("error", function(e){
            console.log("Error: " + e.message);
        });
        const zipPath = path.join(location, 'temp.zip')
        const stream = fs.createWriteStream(zipPath);
        response.pipe(stream)
        stream.on('finish', () => {
            const zip = new AdmZip(zipPath)
            zip.extractAllTo(path.join(location, name), true)
            e.sender.send('installFinished')
            fs.rmSync(zipPath)
        })
    });
    console.log(util.inspect(res.getHeaders(), false, null, true /* enable colors */))
    
  })

  ipcMain.on('uninstall', async (e, name: string) => {
    const loc = await win.webContents.executeJavaScript('localStorage.getItem("installLocation");', true)
    fs.rmSync(path.join(loc, name), {recursive: true, force: true})
    e.sender.send('gameRemoved')
  })

  ipcMain.on('play', async (e, name: string) => {
    const loc = await win.webContents.executeJavaScript('localStorage.getItem("installLocation");', true)
    console.log('play');
    const executables = recFindByExt(path.join(loc, name), process.platform === 'linux' ? 'x86_64' : 'exe')
    win.minimize()
    if(process.platform === 'linux'){
      p.exec(executables[0]).on('exit', () => {
        win.maximize()
      })
    }
  })
}

async function getDownloadUrl (url: string):Promise<string> {
    return new Promise((resolve, reject) => { 
        http.get(url, (res)=>{
            resolve(res.headers['location'] || '')
        })
    })
}

function recFindByExt(base: string, ext: string, files?: string[], result?: string[]) 
{
    files = files || fs.readdirSync(base) 
    result = result || [] 

    files.forEach( 
        function (file) {
            var newbase = path.join(base,file)
            if ( fs.statSync(newbase).isDirectory() )
            {
                result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result)
            }
            else
            {
                if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                {
                    // @ts-ignore
                    result.push(newbase)
                } 
            }
        }
    )
    return result
}