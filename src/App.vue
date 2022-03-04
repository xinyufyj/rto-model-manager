<template>
  <div class="model-list-wrap">
    <a-page-header title="模型管理">
      <template v-slot:extra>
        <a-button type="primary" @click="createModel"> 新建模型 </a-button>
        <a-button @click="openWorkDialog"> 设置模型目录 </a-button>
      </template>
    </a-page-header>
    <a-table :loading="loading" :dataSource="dataSource" :columns="columns" :pagination="false">
      <template #action="{ record }">
          <a-button type="text" style="color:#1890ff" @click="editModel(record)">
            编辑
          </a-button>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除该模型吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="deleteModel(record)"
          >
            <a-button type="text" danger>
              删除
            </a-button>
          </a-popconfirm>
          <!-- <a-divider type="vertical" />
          <a-button type="text" style="color:#1890ff" @click="openModelPath(record)">
            打开文件夹
          </a-button> -->
        </template>
    </a-table>
    <ModelCreate v-if="modelCreateVisible" v-model:visible="modelCreateVisible" @success="modelCreateSuccess"></ModelCreate>
    <ModelEdit v-if="modelEditVisible" v-model:visible="modelEditVisible" :modelInfo="modelEditInfo" @success="modelEditSuccess"></ModelEdit>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import ModelCreate from './components/ModelCreate.vue'
import ModelEdit from './components/ModelEdit.vue'

export default {
  name: 'App',
  components: {
    ModelCreate,
    ModelEdit
  },
  data() {
    return {
      workDir: null,
      dataSource: [],
      loading: false,
      columns: [
          {
            title: '模型名称',
            dataIndex: 'content.name',
            key: 'name',
          },
          {
            title: '模型描述',
            dataIndex: 'content.desc',
            key: 'desc',
          },
          {
            title: '模型对象',
            dataIndex: 'content.category',
            key: 'category',
          },
          {
            title: "操作",
            key: "action",
            slots: { customRender: "action" },
          },
        ],
      modelCreateVisible: false,
      modelEditVisible: false,
      modelEditInfo: null
    };
  },
  mounted() {
    this.getWorkDir()
  },
  methods: {
    getWorkDir() {
      window.electron.getWorkDir().then(res => {
        this.workDir = res
        this.getModelList()
      })
    },
    getModelList() {
      if(!this.workDir) {
        this.openWorkDialog()
        return
      }
      this.loading = true
      window.electron.getModelList(this.workDir).then(res => {
        if(res.success) {
          this.dataSource = res.data
        }else {
          message.error(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    openWorkDialog() {
      window.electron.showOpenDialog('请选择工作目录').then(({canceled, filePaths}) => {
        if(!canceled && (filePaths.length > 0)) {
          this.workDir = filePaths[0]
          this.getModelList()
        }
      })
    },
    createModel() {
      this.modelCreateVisible = true
    },
    editModel(model) {
      this.modelEditVisible = true
      this.modelEditInfo = model
    },
    deleteModel(model) {
      let idx = this.dataSource.findIndex(item => item.path === model.path)
      if(idx > -1) {
        window.electron.deleteModelFile(this.dataSource[idx].path).then(res => {
          if(res.success) {
            this.dataSource.splice(idx, 1)
            message.success('删除成功')
          }else {
            message.error('删除失败')
          }
        })
      }
    },
    modelCreateSuccess() {
      this.getModelList()
    },
    modelEditSuccess() {
      this.getModelList()
    },
    openModelPath(model) {
      window.electron.showItemInFolder(model.path)
    }
  }
}
</script>

<style lang="less">
.model-list-wrap {
  padding: 0 16px;
}
</style>
