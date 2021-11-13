
import figlet from "figlet"
import chalk from "chalk"


export function percetage(from: number, total: number): number {
    return Math.round((total / 100) * from)
}

export function delay(millis: number): Promise<void> {
    return new Promise(resolver => setTimeout(resolver, millis))
}

export async function artTitle(): Promise<string> {
    return new Promise(resolver => {
        const text = figlet.textSync('BACOT', {
            font: 'Banner4',
            width: 50
        })
        resolver(chalk.redBright(text))
    })
}