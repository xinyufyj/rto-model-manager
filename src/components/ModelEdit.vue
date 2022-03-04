<template>
  <a-modal
    v-model:visible="modalVisible"
    title="编辑模型"
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
      <a-form-item label="模型对象">
        <a-input v-model:value="category" readonly></a-input>
      </a-form-item>
    </a-form>
    <component :is="modelComponent" :modelType="category" :modelInfo="modelInfo.content"  @save="saveModel"></component>
  </a-modal>
</template>

<script>
import AspenHysysModel from './AspenHysysModel.vue'
import AspenPlusModel from './AspenPlusModel.vue'
import DllModel from './DllModel.vue'
import { CategoryComponentMap } from '../utils'
import { message } from 'ant-design-vue'

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
    },
    modelInfo: {
      type: Object,
      required: true
    }
  },
  emits: ['update:visible', 'success'],
  data() {
    return {
      modalVisible: this.visible,
      category: this.modelInfo.content.category,
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
      categoryComponentMap: CategoryComponentMap
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
      window.electron.saveModel(this.modelInfo.path, JSON.stringify(params, null, 2)).then(res => {
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