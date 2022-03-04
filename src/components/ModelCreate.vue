<template>
  <a-modal
    v-model:visible="modalVisible"
    title="新建模型"
    :maskClosable="false"
    :footer="null"
    :afterClose="afterCloseHandler"
    width="90%"
    >
    <a-form
      class="model-category-wrap"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-row style="margin-bottom:10px">
        <a-col style="text-align:right" :span="4">
          <a-button type="primary" @click="importCsv">导入CSV文件</a-button>
        </a-col>
      </a-row>
      <a-form-item label="模型对象">
        <a-select
          v-model:value="category"
        >
          <a-select-option 
            v-for="cat in categoryOptions" 
            :value="cat"
            :key="cat"
          >
            {{ cat }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
    <component :is="modelComponent" :modelType="category" :modelInfo="modelInfo" @save="saveModel"></component>
    <input ref="import" type="file" accept=".csv" style="display:none" @change="fileHandler" />
  </a-modal>
</template>

<script>
import AspenHysysModel from './AspenHysysModel.vue'
import AspenPlusModel from './AspenPlusModel.vue'
import DllModel from './DllModel.vue'
import { CategoryOptions, CategoryComponentMap, getUUID } from '../utils'
import { message } from 'ant-design-vue'

import jschardet from 'jschardet'
import CSV from 'csv-js'

export default {
  name: 'ModelCreate',
  components: {
    AspenHysysModel,
    AspenPlusModel,
    DllModel
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'success'],
  data() {
    return {
      modalVisible: this.visible,
      category: CategoryOptions[0],
      categoryOptions: CategoryOptions,
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
      categoryComponentMap: CategoryComponentMap,
      modelInfo: null
    }
  },
  computed: {
    modelComponent() {
      return this.categoryComponentMap[this.category]
    }
  },
  watch: {
    visible() {
      this.modalVisible = this.visible
    }
  },
  methods: {
    afterCloseHandler() {
      this.$emit('update:visible', false)
    },
    saveModel(params) {
      params.category = this.category
      window.electron.showOpenDialog('请选择保存模型路径').then(({canceled, filePaths}) => {
        if(!canceled && (filePaths.length > 0)) {
          window.electron.saveModel(filePaths[0], JSON.stringify(params, null, 2)).then(res => {
            if(res.success) {
              message.success('保存成功')
              setTimeout(() => {
                this.$emit('success', res.data, params)
                this.$emit('update:visible', false)
              }, 1000);
            }else {
              message.error('保存失败')
            }
          })
        }
      })
    },
    importCsv() {
      this.$refs.import.click()
    },
    fileHandler(e) {
      if(e.target && e.target.files && (e.target.files.length < 1)) {
        return;
      }
      let uploadFile = e.target.files[0]
      e.target.value = null
      
      let reader = new FileReader();
        reader.onload = () => {
            const array = new Uint8Array(reader.result);
            let string = "";
            for (let i = 0; i < array.length; ++i) {
                string += String.fromCharCode(array[i]);
            }
            let detectRes = jschardet.detect(string)
            let fileStr = ''
            if(detectRes.encoding === 'GB2312') {
              fileStr = new TextDecoder('gb2312').decode(array)
            }else if(detectRes.encoding === 'UTF-8') {
              fileStr = new TextDecoder('utf-8').decode(array)
            }else {
              message.error('CSV 文件的编码未知，目前只支持 GB2312 和 UTF-8')
              return
            }

            let res = CSV.parse(fileStr)
            if(!Array.isArray(res) || !Array.isArray(res[2]) || (res[2][0] !== 'category') || (this.categoryOptions.indexOf(res[2][1]) === -1)) {
              message.error('CSV 文件不符合约定的规范，无法解析')
              return
            }
            this.parseCsvContent(res)
        };
        reader.readAsArrayBuffer(uploadFile);
    },
    parseCsvContent(csvRes) {
      this.category = csvRes[2][1]
      if(this.category === CategoryOptions[0]) {
        this.parseAspenHysys(csvRes)
      }else if(this.category === CategoryOptions[1]) {
        this.parseAspenPlus(csvRes)
      }else if(this.category === CategoryOptions[2]) {
        this.parseDll(csvRes)
      }
    },
    parseAspenHysys(csvRes) {
      let modelInfo = {
          name: csvRes[0][1],
          desc: csvRes[1][1],
          main: csvRes[3][1],
          config: {
            input: [],
            output: []
          }
        }
        let inOutPuts = csvRes.slice(5)
        for(let row = 0; row < inOutPuts.length; row++) {
          let items = inOutPuts[row]
          let inData = items[0] && items[0].trim()
          let inDesc = items[1] && items[1].trim()
          let outData = items[2] && items[2].trim()
          let outDesc = items[3] && items[3].trim()
          if(inData) {
            let inArr = inData.split('\\')
            modelInfo.config.input.push({
              id: getUUID(),
              Desc: inDesc,
              Table: inArr[0],
              Tag: inArr[1]
            })
          }
          if(outData) {
            let outArr = outData.split('\\')
            modelInfo.config.output.push({
              id: getUUID(),
              Desc: outDesc,
              Table: outArr[0],
              Tag: outArr[1]
            })
          }
        }
        this.modelInfo = modelInfo
    },
    parseAspenPlus(csvRes) {
      let modelInfo = {
          name: csvRes[0][1],
          desc: csvRes[1][1],
          main: csvRes[3][1],
          config: {
            input: [],
            output: []
          }
        }
        let inOutPuts = csvRes.slice(5)
        for(let row = 0; row < inOutPuts.length; row++) {
          let items = inOutPuts[row]
          let inData = items[0] && items[0].trim()
          let inDesc = items[1] && items[1].trim()
          let outData = items[2] && items[2].trim()
          let outDesc = items[3] && items[3].trim()
          if(inData) {
            let inArr = inData.split('\\')
            modelInfo.config.input.push({
              id: getUUID(),
              Desc: inDesc,
              Node: inData
            })
          }
          if(outData) {
            let outArr = outData.split('\\')
            modelInfo.config.output.push({
              id: getUUID(),
              Desc: outDesc,
              Node: outData
            })
          }
        }
        this.modelInfo = modelInfo
    },
    parseDll(csvRes) {
      let modelInfo = {
        name: csvRes[0][1],
        desc: csvRes[1][1],
        driver: csvRes[3][1],
        main: csvRes[4][1],
        namespace: csvRes[5][1],
        classname: csvRes[6][1],
        classargs: csvRes[7][1],
        methodname: csvRes[8][1],
        dependency: csvRes[9][1],
        config: {
          input: [],
          output: []
        }
      }
      let inOutPuts = csvRes.slice(11)
      for(let row = 0; row < inOutPuts.length; row++) {
        let items = inOutPuts[row]
        let inData = items[1] && items[1].trim()
        let outData = items[3] && items[3].trim()
        if(inData) {
          let idx = inData.indexOf('/')
          let Node = '', Unit = ''
          if(idx > -1) {
            Node = inData.slice(0, idx)
            Unit = inData.slice(idx+1)
          }
          modelInfo.config.input.push({
            id: getUUID(),
            Node: Node,
            Unit: Unit
          })
        }
        if(outData) {
          let idx = outData.indexOf('/')
          let Node = '', Unit = ''
          if(idx > -1) {
            Node = outData.slice(0, idx)
            Unit = outData.slice(idx+1)
          }
          modelInfo.config.output.push({
            id: getUUID(),
            Node: Node,
            Unit: Unit
          })
        }
      }
      this.modelInfo = modelInfo
    }
  }
}
</script>

<style lang="less">
.model-category-wrap {
  margin-bottom: 32px !important;
}
.model-path-wrap {
  .ant-input-group-addon {
    padding: 0;
  }
  .ant-btn {
    height: 29px;
    padding: 2px 15px;
  }
}
.model-input-row {
  position: relative;
  .dynamic-delete-button {
    position: absolute;
    right: 0;
    top: 5px;
    cursor: pointer;
    font-size: 24px;
    color: #ff7875;
  }
}
</style>