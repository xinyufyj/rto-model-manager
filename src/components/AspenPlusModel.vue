<template>
  <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="模型名称" name="name">
        <a-input v-model:value="formState.name"></a-input>
      </a-form-item>
      <a-form-item label="模型描述" name="desc">
        <a-input v-model:value="formState.desc"></a-input>
      </a-form-item>
      <a-form-item label="driver" name="driver">
        <a-input v-model:value="formState.driver"></a-input>
      </a-form-item>
      <a-form-item label="模型路径" name="main">
        <div class="model-path-wrap">
          <a-input v-model:value="formState.main">
            <template v-slot:addonAfter>
              <a-button type="primary" @click="mainFileHanlder">选择文件路径</a-button>
            </template>
          </a-input>
        </div>
      </a-form-item>
      <template v-if="formState.config.input.length === 0">
        <a-form-item label="输入变量">
          <a-button type="dashed" style="width: 60%" @click="addInput">
            <PlusOutlined />
            添加输入变量
          </a-button>
        </a-form-item>
      </template>
      <template v-else>
        <a-row 
          v-for="(input, index) in formState.config.input"
          :key="input.id"
        >
          <template v-if="index === 0">
            <a-col style="text-align:right" :span="4">
              <span>输入变量：</span>
            </a-col>
          </template>
          <a-col :offset="index === 0 ? 0 : 4" :span="18">
            <a-row :gutter="5" class="model-input-row">
              <a-col :span="8">
                <a-form-item label="描述">
                  <a-input v-model:value="input.Desc"></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item 
                  label="Node"
                  :name="['config', 'input', index, 'Node']"
                  :rules="{ required: true, message: '请填写', trigger: 'change' }">
                  <a-input v-model:value="input.Node"></a-input>
                </a-form-item>
              </a-col>
              <MinusCircleOutlined
                class="dynamic-delete-button"
                @click="removeInput(input.id)"
              />
            </a-row>
          </a-col>
        </a-row>
        <a-row style="margin-bottom: 10px">
          <a-col :offset="4" :span="18">
            <a-button type="dashed" style="width: 60%" @click="addInput">
              <PlusOutlined />
              添加输入变量
            </a-button>
          </a-col>
        </a-row>
      </template>
      <template v-if="formState.config.output.length === 0">
        <a-form-item label="输出变量">
          <a-button type="dashed" style="width: 60%" @click="addOutput">
            <PlusOutlined />
            添加输出变量
          </a-button>
        </a-form-item>
      </template>
      <template v-else>
        <a-row 
          v-for="(output, index) in formState.config.output"
          :key="output.id"
        >
          <template v-if="index === 0">
            <a-col style="text-align:right" :span="4">
              <span>输出变量：</span>
            </a-col>
          </template>
          <a-col :offset="index === 0 ? 0 : 4" :span="18">
            <a-row :gutter="5" class="model-input-row">
              <a-col :span="8">
                <a-form-item label="描述">
                  <a-input v-model:value="output.Desc"></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item 
                  label="Node"
                  :name="['config', 'output', index, 'Node']"
                  :rules="{ required: true, message: '请填写', trigger: 'change' }">
                  <a-input v-model:value="output.Node"></a-input>
                </a-form-item>
              </a-col>
              <MinusCircleOutlined
                class="dynamic-delete-button"
                @click="removeOutput(output.id)"
              />
            </a-row>
          </a-col>
        </a-row>
        <a-row style="margin-bottom: 10px">
          <a-col :offset="4" :span="18">
            <a-button type="dashed" style="width: 60%" @click="addOutput">
              <PlusOutlined />
              添加输出变量
            </a-button>
          </a-col>
        </a-row>
      </template>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click.prevent="save">保存</a-button>
    </a-form-item>
    <input ref="file" type="file" style="display:none" @change="fileHandler" />
  </a-form>
</template>

<script>
import { getUUID, CategoryDriverMap, deepCopy } from '../utils'
import { message } from 'ant-design-vue'

export default {
  name: 'AspenHysysModel',
  props: {
    modelType: {
      type: String,
      required: true
    },
    modelInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['save'],
  data() {
    return {
      formState: {
        name: '',
        desc: '',
        driver: CategoryDriverMap[this.modelType],
        main: '',
        config: {
          input: [],
          output: []
        }
      },
      rules: {
        name: [
          { required: true, message: '请填写', trigger: 'change' }
        ],
        driver: [
          { required: true, message: '请填写', trigger: 'change' }
        ],
        main: [
          { required: true, message: '请填写', trigger: 'change' }
        ]
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formItemLayout: {
        labelCol: {
          span: 4 
        },
        wrapperCol: {
          span: 18
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          offset: 4,
          span: 18, 
        },
      }
    }
  },
  watch: {
    modelInfo: {
      immediate: true,
      handler() {
        this.setFormState()
      }
    }
  },
  methods: {
    setFormState() {
      if(this.modelInfo) {
        this.formState.name = this.modelInfo.name
        this.formState.desc = this.modelInfo.desc
        this.formState.main = this.modelInfo.main
        if(this.modelInfo.driver) {
          this.formState.driver = this.modelInfo.driver
        }
        this.formState.config.input = this.modelInfo.config.input.map( item => {
        let res = deepCopy(item)
        res.id = getUUID()
          return res
        })
        this.formState.config.output = this.modelInfo.config.output.map( item => {
          let res = deepCopy(item)
          res.id = getUUID()
          return res
        })
      }
    },
    addInput() {
      this.formState.config.input.push({
        id: getUUID(),
        Desc: '',
        Node: '',
      })
    },
    removeInput(id) {
      let idx = this.formState.config.input.findIndex(input => input.id === id)
      if(idx > -1) {
        this.formState.config.input.splice(idx, 1)
      }
    },
    addOutput() {
      this.formState.config.output.push({
        id: getUUID(),
        Desc: '',
        Node: '',
      })
    },
    removeOutput(id) {
      let idx = this.formState.config.output.findIndex(output => output.id === id)
      if(idx > -1) {
        this.formState.config.output.splice(idx, 1)
      }
    },
    save() {
      this.$refs.formRef.validate().then(() => {
        if(this.formState.config.input.length < 1) {
          message.error('至少添加一个输入变量')
          return;
        }
        let params = deepCopy(this.formState)
        params.config.input = params.config.input.map(item => {
          delete item.id
          return {
            ...item
          }
        })
        params.config.output = params.config.output.map(item => {
          delete item.id
          return {
            ...item
          }
        })
        this.$emit('save', params)
      }).catch(() => {})
    },
    mainFileHanlder() {
      this.$refs.file.click()
    },
    fileHandler(e) {
      if(e.target && e.target.files && (e.target.files.length < 1)) {
        return;
      }
      let file = e.target.files[0]
      e.target.value = null
      this.formState.main = file.path
      this.$refs.formRef.validate().catch(() => {})
    }
  }
}
</script>

<style>

</style>