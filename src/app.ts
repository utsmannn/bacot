#!/usr/bin/env node
import fs from "fs"
import path from "path"

import yargs, { showHelp } from "yargs"
import { Api, ApiImpl } from "./api"
import { exec } from "child_process"
import { timeStamp } from "console"
import { artTitle } from "./utils"

const api: Api = new ApiImpl()
const description = 'Generate multi dpi'

console.clear()

yargs.command(['$0'], description, {
    // NEED IMPROVMENT WEBP FORMAT
    // webp: {
    //     describe: 'convert to webp',
    //     type: 'boolean',
    //     default: false
    // }
}, async (arg) => {
    const files = arg._ as string[]

    if (files.length == 0 || files === undefined) {
        showHelp(async string => {
            console.log(string.replace('android-dpi\n\n' + description, await artTitle() + "\n" + description + '\n\nSample:\nandroid-dpi image-sample.png'))
        })
    } else {
        if (files[0] == '.') {
            const all = await readDir()
            api.startConvert(all)
        } else {
            const newFileFiltered = files.filter(string => isImageFormat(string))
            if (newFileFiltered.length == 0) {
                console.error('Image invalid!')
            } else {
                api.startConvert(newFileFiltered)
            }
        }
    }
})
.argv

async function readDir(): Promise<string[]> {
    return new Promise(async resolver => {
        const data = fs.readdirSync('.').filter(string => isImageFormat(string))
        resolver(data)
    })
}

function isImageFormat(string: string): boolean {
    const images = ['.jpg', '.jpeg', '.png', '.webp']
    return images.includes(path.parse(string).ext)
}