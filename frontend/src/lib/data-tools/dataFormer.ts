export const formatFileSize = (bytes: string): string => {
    const byteValue = Number(bytes)
    if (isNaN(byteValue) || byteValue === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(byteValue) / Math.log(k))
    
    return `${parseFloat((byteValue / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const formatStorage = (bytes: number): string => {
    // If the input is 0 or negative, return 0 GB
    if (bytes <= 0) return '0 GB'
  
    // Define size units
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    // Find the appropriate unit
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
    
    // Calculate the size in the appropriate unit
    const size = bytes / Math.pow(1024, unitIndex)
    
    // Round to 2 decimal places
    const roundedSize = Math.round(size * 100) / 100
    
    return `${roundedSize} ${units[unitIndex]}`
  }
  
  // Optional: If you specifically want to convert to GB with flexibility
 export const convertToGB = (bytes: number): number => {
    return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100
  }

export const formatDate = (timestamp: string | number) => {
  // 如果时间戳是秒级的，转换为毫秒
  const date = new Date(Number(timestamp) * 1000); // 将时间戳转换为毫秒
  // console.log(date); // 输出格式化后的日期

  // 返回您需要的日期格式
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

