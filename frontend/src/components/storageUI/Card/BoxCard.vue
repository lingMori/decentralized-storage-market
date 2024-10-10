<template>
    <ScrollArea class="whitespace-nowrap border rounded-md box">
        <Card class="box-item" v-for="file in files">
            <CardHeader class="p-5">
                <div>{{ file.name }}
                    <Badge class="box-badge">{{ file.type }}</Badge>
                </div>
                <CardDescription>
                    <div>
                        <span>asdasd</span>
                        <span>~</span>
                        <span>asdasd</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardFooter class="p-6">
                <Button class="btn">
                    管理文件
                </Button>
            </CardFooter>
        </Card>
    </ScrollArea>
</template>

<script setup lang="ts">
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardDescription from '@/components/ui/card/CardDescription.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import CardFooter from '@/components/ui/card/CardFooter.vue';
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue';
import { onMounted, ref } from 'vue';

const files = ref<File[]>([])

const InitFiles = () => {
    for (let index = 0; index < 10; index++) {
        files.value.push({
            name: `file_${index}`,
            size: '213',
            lastModified: 'asdasd',
            type: `${FileType[index%3]}`,
        } as unknown as File)
    }
}

const FileType:string[] = [
    "image",
    "mp4",
    "video_extranct"
]

onMounted(() => {
    InitFiles()
})

</script>

<style scoped lang="scss">
.box {
    width: 1000px;
    // padding: 17px;
    height: 420px;
    background-color: var(--storm-bg-middle);
    // overflow-y: scroll;
    // border-radius: 20px;
}

.box-item{
    // padding: 4px;
    background-color: var(--storm-bg-light);
    margin: 10px;
    flex-direction: row;
    display: flex;
    justify-content: space-between;
}

.box-badge{
    background-color: var(--icon-color);
    transition: all ease-in-out 0.1s;
}

.btn {
    background-color: var(--storm-bg-strong);
}

@media only screen and (max-width: 768px) {
    .box {
        width: 100%;
    }
}
</style>