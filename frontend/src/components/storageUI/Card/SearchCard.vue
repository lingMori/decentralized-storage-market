<template>
    <section id="panel-result">
        <div class="panel-result--content">
          <SearchInput :search="search" :count="files.length" @on-changed="onSearchChanged"/>

          <div class="content-file--items">
        <div class="content-file--item empty" v-if="files.length === 0">
          <span v-if="search !== ''">No results. Try other file name.</span>
          <span v-else>List of files that you upload will appear here.</span>
        </div>

        <div class="content-file--item" v-for="(item, index) in files" :key="index">
          <div class="item-content">
            <div class="item-icon">
              <i-ri-file-list-3-line class="icon-color" />
            </div>
            <div class="item-detail">
              <span class="item-detail--title" :title="item.Name">{{ item.Name }}</span>
              <span class="item-detail--subtitle">{{ item.Size }} • txt</span>
            </div>
            <div class="item-action">
              <a v-if="!!item.Hash" title="Open Shorten Link" target="_blank" :href="`http://123.157.213.102:39760/ipfs/${item.Hash}`" rel="noopener">
                <i-ri-link-unlink-m class="icon-color" />
              </a>
              <!-- <a v-else title="Generate Shorten Link" @click="shortenLink(item)">
                <i-ri-link-m class="icon-color" />
              </a> -->

              <a title="Open Link" :href="`http://123.157.213.102:39760/ipfs/${item.Hash}`">
                <i-ri-external-link-fill class="icon-color" />
              </a>
            </div>
          </div>
          <div class="item-cid">
            <!-- <label>
              <input class="input-cid" type="text" readonly @focus="$event.target.select()" :value="generateLink(item)" />
            </label> -->

            <a title="Copy to clipboard" @click="copyFileLink(item)">
              <i-ri-clipboard-line class="icon-color" />
            </a>
          </div>
        </div>
      </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import SearchInput from '../Input/SearchInput.vue';

import { ref, computed } from 'vue';
import useLocalStorage from '@/store/localStorageDB';
import type { IpfsResponseDataObject } from '@/lib/ipfs-client/ipfsClient.type';

const localStore = useLocalStorage();
const search = ref<string>('');

const onSearchChanged = (event:Event) => {
  search.value = (event.target as HTMLInputElement).value;
}

const files = computed(() => localStore
  .results.slice()
  .reverse()
  .filter(file => !!file.Hash)
  .filter(file => {
    if (search.value === '')  return true;
    return file.Name.indexOf(search.value) >= 0;
  })
)


const copyFileLink = (item: IpfsResponseDataObject) => {
  console.log(item.Hash)
}




</script>

<style lang="scss">
section#panel-result {
  background-color: #ffffff;
  border-top-right-radius: 1rem;
  border-bottom-right-radius: 1rem;
  border-left: 1px solid rgba(0, 0, 0, .05);

  .panel-result--content {
    padding: 0.8rem;
    height: calc(100% - 1.6rem);

    .content-file--items {
      display: flex;
      flex-direction: column;

      overflow-y: scroll;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, .4) rgba(36, 18, 18, 0.2);

      height: calc(100% - 2.95rem);

      &::-webkit-scrollbar {
        width: 0.3rem;
      }
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 1rem;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 1rem;
      }

      .content-file--item {
        width: calc(100% - 1.6rem);
        padding: 0.8rem;
        margin-bottom: 0.8rem;
        display: flex;
        flex-direction: column;

        border-radius: 1rem;
        background-color: rgba(0, 0, 0, .05);

        &.empty {
          font-size: 0.7rem;
          text-align: center;
          border-radius: 0.8rem;
        }

        a svg {
          cursor: pointer;
        }

        .item-content {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;

          .item-icon {
            padding: 0.5rem 0.5rem 0.5rem 0;
          }
          .item-detail {
            display: flex;
            flex-direction: column;
            flex: 1;

            .item-detail--title {
              font-size: 0.7rem;
              width: 220px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              margin-bottom: 0.4rem;
            }
            .item-detail--subtitle {
              font-size: 0.7rem;
            }
          }
          .item-action {
            display: flex;
            align-items: center;
            padding: 0.5rem 0 0.5rem 0.5rem;

            a {
              &:not(:last-child) {
                margin-right: 0.5rem;
              }
            }
          }
        }

        .item-cid {
          display: flex;
          align-items: center;
          margin-top: 0.7rem;
          width: 100%;

          label {
            display: flex;
            flex: 1;

            .input-cid {
              flex: 1;
              background-color: rgba(0, 0, 0, 0.1);
              outline: none;
              border: none;
              color: var(--contrast-color);
              padding: 8px;
              border-radius: 0.5rem;
              font-size: 0.7rem;
            }
          }
          a {
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
}

body.dark-theme {
  section#panel-result {
    background-color: var(--gradient-900);

    .content-file--items .content-file--item {
      background-color: rgba(255, 255, 255, .05);

      .item-detail--subtitle {
        color: rgba(255, 255, 255, 0.5);
      }
      .item-cid .input-cid {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
</style>