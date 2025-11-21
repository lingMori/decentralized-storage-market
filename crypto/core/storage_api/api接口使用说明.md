api接口依赖：

- IPFS及其守护进程
- sshpass



### IPFS下载以及安装

```sh
wget https://dist.ipfs.io/go-ipfs/v0.8.0/go-ipfs_v0.8.0_darwin-amd64.tar.gz
tar -xvzf go-ipfs_v0.8.0_darwin-amd64.tar.gz
cd go-ipfs
./install.sh
ipfs --version
```

注意在每次使用前需要打开守护进程：

     ipfs daemon



### sshpass下载以及安装

Ubuntu：

```
apt-get  install sshpasscentos:
```

centos:

```
# 源码包安装
 wget http://sourceforge.net/projects/sshpass/files/sshpass/1.05/sshpass-1.05.tar.gz 
 tar xvzf sshpass-1.05.tar.gz 
 cd sshpass-1.05.tar.gz 
 ./configure 
 make 
 make install 
 
# yum安装
yum  -y install sshpass
```



