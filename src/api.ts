
import { existsSync, fsyncSync, mkdirSync } from "fs"
import path from "path"
import sharp, { Sharp } from "sharp"
import { percetage } from "./utils"

export interface Api {
    anuan(): string
    simpleDpi(name: string): void
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

function dpiFolder(dpiPercent: DpiPercentage): string {
    const name = "output/drawable"
    switch (dpiPercent) {
        case DpiPercentage.LDPI: return name + "-ldpi"
        case DpiPercentage.MDPI: return name + "-mdpi"
        case DpiPercentage.HDPI: return name + "-hdpi"
        case DpiPercentage.XDPI: return name + "-xdpi"
        case DpiPercentage.XXDPI: return name + "-xxdpi"
        case DpiPercentage.XXXDPI: return name + "-xxxdpi"
    }
}

function dpiPath(dpiPercent: DpiPercentage, fileName: string): string {
    const name = "output/drawable"
    switch (dpiPercent) {
        case DpiPercentage.LDPI: return name + "-ldpi/" + fileName
        case DpiPercentage.MDPI: return name + "-mdpi/" + fileName
        case DpiPercentage.HDPI: return name + "-hdpi/" + fileName
        case DpiPercentage.XDPI: return name + "-xdpi/" + fileName
        case DpiPercentage.XXDPI: return name + "-xxdpi/" + fileName
        case DpiPercentage.XXXDPI: return name + "-xxxdpi/" + fileName
    }
}

async function createFolder(dpiPercent: DpiPercentage) {
    const dir = dpiFolder(dpiPercent)
    const isExist = existsSync(dir)
    if (!isExist) {
        mkdirSync(dir, { recursive: true })
    }
}

function processToConvert(sharp: Sharp, convert: Convert, name: string): [Sharp, string] {
    switch (convert) {
        case Convert.NONE: {
            return [sharp, name]
        }
        case Convert.PNG: {
            sharp.png({
                quality: 20
            })

            const onlyName = path.parse(name).name
            const newName = onlyName + ".png"
            return [sharp, newName]
        }
        case Convert.WEBP: {
            sharp.webp({
                quality: 20,
                lossless: true
            })

            const onlyName = path.parse(name).name
            const newName = onlyName + ".webp"
            return [sharp, newName]
        }
    }
}

export class ApiImpl implements Api {
    convert: Convert = Convert.NONE
    constructor(convert: Convert = Convert.NONE) {
        this.convert = convert
    }

    anuan(): string {
        return "haha"
    }

    async simpleDpi(name: string) {
        const meta = await sharp(name).metadata()
        this.resize(name, DpiPercentage.LDPI, meta.width)
        this.resize(name, DpiPercentage.MDPI, meta.width)
        this.resize(name, DpiPercentage.HDPI, meta.width)
        this.resize(name, DpiPercentage.XDPI, meta.width)
        this.resize(name, DpiPercentage.XXDPI, meta.width)
        this.resize(name, DpiPercentage.XXXDPI, meta.width)
    }

    private async resize(name: string, dpiPercent: DpiPercentage, width: number) {
        await createFolder(dpiPercent)
        const dpiWidth = percetage(dpiPercent, width)
        const process = sharp(name)
            .resize({ width: dpiWidth })
            .withMetadata({
                density: dpi(dpiPercent)
            })

        const [ newSharp, newName ] = processToConvert(process, this.convert, name)
        newSharp.toFile(dpiPath(dpiPercent, newName))
    }
}