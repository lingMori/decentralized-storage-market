class Storage {
    key: string;
    data: any;
    constructor(key:string) {
        this.key = key;
        this.data = null;
    }

    read() {
        const value = localStorage.getItem(this.key);
        if (value === null) {
            return null;
        }
        this.data = JSON.parse(value);
    }

    write():void {
        if (this.data !== null) {
            localStorage.setItem(this.key, JSON.stringify(this.data));
        }
    }
}

export default Storage;