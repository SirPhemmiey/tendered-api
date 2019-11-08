/* eslint-disable indent */
/* eslint-disable no-console */
const util = require('util');
const { spawn } = require('child_process')

const config = {
    install: true,
    verbose: true,
}

async function main() {
    try {
        require('check-dependencies')
    } catch (e) {
        console.error('check-dependencies not found')
        console.log('Running npm install check-dependencies')
        try {
            const child = spawn('npm', ['install', 'check-dependencies@1.1.0']);
            child.on('exit', code => {
                console.log(`Exit code is: ${code}`);
            });
            for await (const data of child.stdout) {
                console.log(`Installing check dependencies: ${data}`);
            };
        } catch (e) {
            console.error('Error fixing node_modules installation')
            process.exit(2)
        }

    }

    const child = spawn('rm', ['package-lock.json']);
    child.on('exit', code => {
        console.log(`Exit code is: ${code}`);
    });
    for await (const data of child.stdout) {
        console.log(`Removing package-lock: ${data}`);
    };

    require('check-dependencies').sync(config);
}


main()