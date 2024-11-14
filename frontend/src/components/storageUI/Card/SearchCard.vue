<template>
  <section class="h-full w-full overflow-hidden bg-background">
    <Card class="h-full w-full border-none">
      <CardContent class="h-full w-full flex flex-col p-4">
        <!-- Search Input -->
        <div class="flex-none w-full">
          <SearchInput 
            :search="search" 
            :count="files.length" 
            @on-changed="onSearchChanged"
          />
        </div>

        <!-- File List -->
        <ScrollArea class="flex-1 w-full mt-4">
          <!-- Empty State -->
          <div v-if="files.length === 0" class="flex flex-col items-center justify-center p-8">
            <FileIcon class="h-12 w-12 text-muted-foreground" />
            <h3 class="mt-4 text-lg font-semibold">No files found</h3>
            <p class="text-sm text-muted-foreground">
              {{ search ? 'Try a different search term' : 'Upload files to get started' }}
            </p>
          </div>

          <!-- File Items -->
          <div v-else class="space-y-2 w-full pr-3">
            <Card v-for="(item, index) in files" 
                  :key="item.cid || index"
                  class="w-full hover:bg-accent transition-colors">
                  <CardContent class="p-4">
                <!-- File Info Container -->
                <div class="w-full flex flex-col">
                  <!-- Top Row with Icon, Name, and Actions -->
                  <div class="flex items-center gap-4 w-full">
                    <!-- File Icon -->
                    <div class="flex-none flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText class="h-5 w-5 text-primary" />
                    </div>

                    <!-- File Details -->
                    <div class="flex-1 min-w-0 max-w-[200px] overflow-hidden">
                      <TooltipProvider>
                        <Tooltip :delay-duration="300">
                          <TooltipTrigger asChild>
                            <h4 class="font-medium truncate cursor-default">
                              {{ item.name || 'Unnamed File' }}
                            </h4>
                          </TooltipTrigger>
                          <TooltipContent>
                            {{ item.name || 'Unnamed File' }}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p class="text-sm text-muted-foreground truncate">
                        {{ formatFileSize(item.size) }}
                      </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex-none flex gap-2">
                      <Button v-if="item.cid" 
                              variant="ghost" 
                              size="icon"
                              @click.prevent="openLink(getIpfsUrl(item.cid))"
                              title="Open in new tab"
                              class="h-8 w-8">
                        <ExternalLink class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" 
                              size="icon"
                              @click.prevent="copyFileLink(item)"
                              title="Copy link"
                              class="h-8 w-8">
                        <Clipboard class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <!-- CID Display -->
                  <div v-if="item.cid" class="mt-3 w-full">
                    <div class="w-full relative">
                      <Input 
                        :model-value="getIpfsUrl(item.cid)"
                        readonly
                        class="text-sm font-mono bg-muted w-full overflow-hidden text-ellipsis"
                        @focus="$event.target.select()"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import useLocalStorage from '@/store/localStorageDB'
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type'
import { Card, CardContent} from '@/components/ui/card'
import Input from '@/components/ui/input/Input.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import Button from '@/components/ui/button/Button.vue'
import SearchInput from '../Input/SearchInput.vue'
import { 
  FileIcon,
  FileText,
  ExternalLink,
  Clipboard
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import { formatFileSize } from '@/lib/data-tools/dataFormer'
import { IPFS_GATEWAY } from '@/configs/IPFS_GATEWAY'

const { toast } = useToast()
const localStore = useLocalStorage()
const search = ref('')

const onSearchChanged = (event: Event): void => {
  if (event.target instanceof HTMLInputElement) {
    search.value = event.target.value.trim()
  }
}

const files = computed<FileItem[]>(() => localStore
  .results
  .slice()
  .reverse()
  .filter((file): file is FileItem & { cid: string } => !!file.cid)
  .filter(file => {
    if (!search.value) return true
    return file.name.toLowerCase().includes(search.value.toLowerCase())
  })
)

const getIpfsUrl = (cid: string): string => {
  return `${IPFS_GATEWAY}/${cid}`
}

const copyFileLink = async (item: FileItem): Promise<void> => {
  if (!item.cid) return
  
  try {
    await navigator.clipboard.writeText(getIpfsUrl(item.cid))
    toast({
      title: "Link copied",
      description: "File link has been copied to clipboard",
      duration: 2000
    })
  } catch (error) {
    console.error('Failed to copy:', error)
    toast({
      title: "Copy failed",
      description: "Failed to copy link to clipboard",
      variant: "destructive"
    })
  }
}

const openLink = (url: string): void => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('Failed to open link:', error)
    toast({
      title: "Error",
      description: "Failed to open link in new tab",
      variant: "destructive"
    })
  }
}
</script>
