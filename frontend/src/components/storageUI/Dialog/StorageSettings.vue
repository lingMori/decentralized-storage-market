
<template>
  <Dialog :open="isSettingsOpen" @update:open="toggleSettings">
    <DialogContent class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>存储设置</DialogTitle>
        <DialogDescription>
          管理您的存储空间和偏好设置
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">存储限额</Label>
          <Select v-model="selectedStorageLimit">
            <SelectTrigger class="col-span-3">
              <SelectValue placeholder="选择存储空间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 GB</SelectItem>
              <SelectItem value="500">500 GB</SelectItem>
              <SelectItem value="1000">1 TB</SelectItem>
              <SelectItem value="5000">5 TB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">文件保留策略</Label>
          <Select v-model="fileRetentionPolicy">
            <SelectTrigger class="col-span-3">
              <SelectValue placeholder="选择文件保留策略" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">保留30天未使用文件</SelectItem>
              <SelectItem value="90">保留90天未使用文件</SelectItem>
              <SelectItem value="180">保留180天未使用文件</SelectItem>
              <SelectItem value="never">永久保留所有文件</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">自动归档</Label>
          <Switch 
            :checked="autoArchiveEnabled" 
            @update:checked="toggleAutoArchive"
            class="col-span-3"
          />
          <div v-if="autoArchiveEnabled" class="col-span-4 ">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">归档阈值</Label>
            <Select v-model="archiveThreshold">
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="选择归档阈值" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50% 存储空间</SelectItem>
                <SelectItem value="75">75% 存储空间</SelectItem>
                <SelectItem value="90">90% 存储空间</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </div>
        
        <Separator />
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">安全设置</Label>
          <div class="col-span-3 space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="encryption" 
                :checked="encryptionEnabled"
                @update:checked="toggleEncryption"
              />
              <Label 
                for="encryption"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                启用文件加密
              </Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="two-factor" 
                :checked="twoFactorEnabled"
                @update:checked="toggleTwoFactor"
              />
              <Label 
                for="two-factor"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                启用双重认证
              </Label>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="submit" 
          @click="saveSettings"
          :disabled="!hasChanges"
        >
          保存设置
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

// 模拟设置状态
const selectedStorageLimit = ref('100')
const fileRetentionPolicy = ref('30')
const autoArchiveEnabled = ref(false)
const archiveThreshold = ref('75')
const encryptionEnabled = ref(false)
const twoFactorEnabled = ref(false)

// 控制设置弹窗
const isSettingsOpen = ref(false)

// 切换设置弹窗
const toggleSettings = (open: boolean) => {
  isSettingsOpen.value = open
}

// 切换自动归档
const toggleAutoArchive = (checked: boolean) => {
  autoArchiveEnabled.value = checked
}

// 切换加密
const toggleEncryption = (checked: boolean) => {
  encryptionEnabled.value = checked
}

// 切换双重认证
const toggleTwoFactor = (checked: boolean) => {
  twoFactorEnabled.value = checked
}

// 检查是否有未保存的更改
const hasChanges = computed(() => {
  // 这里可以添加更复杂的更改检测逻辑
  return true
})

// 保存设置
const saveSettings = () => {
  // 这里可以添加实际的设置保存逻辑
  console.log('保存设置', {
    storageLimit: selectedStorageLimit.value,
    retentionPolicy: fileRetentionPolicy.value,
    autoArchive: autoArchiveEnabled.value,
    archiveThreshold: archiveThreshold.value,
    encryption: encryptionEnabled.value,
    twoFactor: twoFactorEnabled.value
  })
  isSettingsOpen.value = false
}

// 对外提供打开设置的方法
defineExpose({
  openSettings: () => {
    isSettingsOpen.value = true
  }
})
</script>
