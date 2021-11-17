
import chalk from "chalk"
import { exec } from "child_process"
import { existsSync, fsyncSync, mkdirSync } from "fs"
import path from "path"
import sharp, { Sharp } from "sharp"
import { artTitle, delay, percetage } from "./utils"

export interface Api {
    anuan(): string
    simpleDpi(dirOutput: string, name: string): void
    startConvert(names: string[]): void
}

enum DpiPercentage {
    LDPI = 20,
    MDPI = 25,
    HDPI = 30,
    XDPI = 50,
    XXDPI = 80,
    XXXDPI = 100
}

export enum Convert {
    NONE = "",
    PNG = "png",
    WEBP = "webp"
}

function dpi(dpiPercent: DpiPercentage): number {
    switch (dpiPercent) {
        case DpiPercentage.LDPI: return 120
        case DpiPercentage.MDPI: return 160
        case DpiPercentage.HDPI: return 240
        case DpiPercentage.XDPI: return 320
        case DpiPercentage.XXDPI: return 480
        case DpiPercentage.XXXDPI: return 640
    }
}

function dpiFolder(dpiPercent: DpiPercentage, dirChild: string): string {
    const name = "output-" + dirChild +  "/drawable"
    switch (dpiPercent) {
        case DpiPercentage.LDPI: return name + "-ldpi"
        case DpiPercentage.MDPI: return name + "-mdpi"
        case DpiPercentage.HDPI: return name + "-hdpi"
        case DpiPercentage.XDPI: return name + "-xhdpi"
        case DpiPercentage.XXDPI: return name + "-xxhdpi"
        case DpiPercentage.XXXDPI: return name + "-xxxhdpi"
    }
}

function dpiPath(dpiPercent: DpiPercentage, fileName: string, dirChild: string): string {
    const name = "output-" + dirChild +  "/drawable"
    switch (dpiPercent) {
        case DpiPercentage.LDPI: return name + "-ldpi/" + fileName
        case DpiPercentage.MDPI: return name + "-mdpi/" + fileName
        case DpiPercentage.HDPI: return name + "-hdpi/" + fileName
        case DpiPercentage.XDPI: return name + "-xhdpi/" + fileName
        case DpiPercentage.XXDPI: return name + "-xxhdpi/" + fileName
        case DpiPercentage.XXXDPI: return name + "-xxxhdpi/" + fileName
    }
}

async function createFolder(dpiPercent: DpiPercentage, dirChild: string) {
    const dir = dpiFolder(dpiPercent, dirChild)
    const isExist = existsSync(dir)
    if (!isExist) {
        mkdirSync(dir, { recursive: true })
    }
}

function rename(name: string): string {
    return name.split('.').join('_').replace(/[\W_]/g, '_').replace("-", "_").toLocaleLowerCase()
}

function processToConvert(sharp: Sharp, convert: Convert, name: string): [Sharp, string] {
    switch (convert) {
        case Convert.NONE: {
            return [sharp, rename(path.parse(name).name) + path.parse(name).ext]
        }
        case Convert.PNG: {
            sharp.png({
                quality: 90
            })

            const onlyName = rename(path.parse(name).name)
            const newName = onlyName + ".png"
            return [sharp, newName]
        }
        case Convert.WEBP: {
            sharp.webp({
                quality: 90,
                lossless: true
            })

            const onlyName = rename(path.parse(name).name)
            const newName = onlyName + ".webp"
            return [sharp, newName]
        }
    }
}

function openFolder(dir: string) {
    exec('open ' + dir)
}

export class ApiImpl implements Api {
    convert: Convert = Convert.NONE
    constructor(convert: Convert = Convert.NONE) {
        this.convert = convert
    }

    anuan(): string {
        return "haha"
    }

    async simpleDpi(dirOutput: string, name: string) {
        const meta = await sharp(name).metadata()
        const dpis = [DpiPercentage.LDPI, DpiPercentage.MDPI, DpiPercentage.HDPI, DpiPercentage.XDPI, DpiPercentage.XXDPI, DpiPercentage.XXXDPI]

        dpis.forEach(dpi => {
            this.resize(dirOutput, name, dpi, meta.width)
        }) 
    }

    async startConvert(name: string[]) {
        const art = await artTitle()
        const dirOutput = new Date().getMilliseconds().toString()
        console.log(art)

        await delay(1000)
        name.forEach(async n => {
            console.log(chalk.greenBright('> process on: ' + n))
            await this.simpleDpi(dirOutput, n)
            await delay(2000)
        })

        
        openFolder('output-' + dirOutput)
    }

    private async resize(dir: string, name: string, dpiPercent: DpiPercentage, width: number) {
        await createFolder(dpiPercent, dir)
        const dpiWidth = percetage(dpiPercent, width)
        const process = sharp(name)
            .resize({ width: dpiWidth })
            .withMetadata({
                density: dpi(dpiPercent)
            })

        const [ newSharp, newName ] = processToConvert(process, this.convert, name)
        newSharp.toFile(dpiPath(dpiPercent, newName, dir))
    }
}