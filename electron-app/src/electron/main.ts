import { isDev } from "./util";
import { execFile } from "child_process";
import { app, BrowserWindow } from 'electron';
import * as path from "path";
import treeKill from 'tree-kill';

let backendprocess : ReturnType<typeof execFile> | null = null;

function WindowSettings() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        frame: true, // Enable the frame
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#20203a', // Match your title bar background
            symbolColor: '#ffffff', // Color for the symbols (minimize, maximize, close)
            height: 32, // Set the height of the title bar
            
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // No longer need custom handlers, but we keep state tracking
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-unmaximized');
    });

    mainWindow.maximize();
    mainWindow.show();

      
        if (isDev()) {
            mainWindow.loadURL('http://localhost:5123');
        } else {
            mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
        }
        
}

app.on('ready', () => 
{
    // Get the correct path in both dev and production
    const batPath = isDev() 
        ? path.join(process.cwd(), 'src', 'Binaries', 'backend.bat')
        : path.join(path.dirname(app.getPath('exe')), 'resources', 'Binaries', 'backend.bat');

    backendprocess = execFile(batPath, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing batch file:', error);
            return;
        }
        console.log('Batch output:', stdout);
        if (stderr) console.error("Batch stderr:", stderr);
    });

        WindowSettings();
});

app.on('before-quit', async (event) => {
    if(backendprocess && backendprocess.pid) {
        event.preventDefault(); // Prevent quit until cleanup is done
        
        console.log('Killing Tree...');
        treeKill(backendprocess.pid);
        
        // Get the correct path in both dev and production
        const batPath = isDev()
            ? path.join(process.cwd(), 'src', 'Binaries', 'KillBackground.bat')
            : path.join(path.dirname(app.getPath('exe')), 'resources', 'Binaries', 'KillBackground.bat');
        
        try {
            await new Promise<void>((resolve, reject) => {
                // Set a timeout to prevent hanging (3 seconds for seamless experience)
                const timeout = setTimeout(() => {
                    reject(new Error('Batch file execution timeout'));
                }, 3000);
                
                execFile(batPath, (error, stdout, stderr) => {
                    clearTimeout(timeout);
                    
                    if (error) {
                        console.error('Error executing batch file:', error);
                        reject(error);
                    } else {
                        console.log('Batch output:', stdout);
                        if (stderr) console.error("Batch stderr:", stderr);
                        resolve();
                    }
                });
            });
            
            console.log('Cleanup completed successfully');
        } catch (error) {
            console.error('Cleanup failed:', error);
            // Continue with quit even if cleanup fails for seamless experience
        } finally {
            // Always quit after cleanup attempt - seamless experience
            app.exit(0);
        }
    }
});