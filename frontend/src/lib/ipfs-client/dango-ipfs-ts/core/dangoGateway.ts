import axios, { type AxiosInstance } from 'axios';
import type { dangoConfig } from "../types/dango.type";

// 定义一个函数，使用 axios 请求 IPFS 网关
const createDangoGatewayClient = async (dangoConfig: dangoConfig):Promise<AxiosInstance> => {
  try {
    let baseURL = '';

    if (dangoConfig.url) {
      baseURL = dangoConfig.url;
    } else {
      baseURL = `${dangoConfig.protocol}://${dangoConfig.host}:${dangoConfig.port}`;
    }

    // 创建 axios 实例，配置基础URL
    const axiosInstance = axios.create({
      baseURL, // 设置请求的基础URL
      timeout: 5000, // 超时时间
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 测试访问 IPFS 网关的版本信息
    // const response = await axiosInstance.get('/api/v0/version');
    // console.log('Connected to Dango gateway. Version:', response.data.Version);

    return axiosInstance;
  } catch (error) {
    console.error('Failed to connect to Dango gateway:', error);
    throw new Error('Failed to create Dango gateway client');
  }
}

export default createDangoGatewayClient;
