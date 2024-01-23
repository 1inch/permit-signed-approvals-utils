export function trim0x(data: string): string {
    if (data.startsWith('0x')) {
        return data.substring(2)
    }

    return data
}
