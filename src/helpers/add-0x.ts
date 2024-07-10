export function add0x(data: string): string {
    if (data.startsWith('0x')) {
        return data
    }

    return '0x' + data
}
