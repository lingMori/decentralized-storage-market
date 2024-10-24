export const formatFileSize = (bytes: string): string => {
    const byteValue = Number(bytes)
    if (isNaN(byteValue) || byteValue === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(byteValue) / Math.log(k))
    
    return `${parseFloat((byteValue / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}