<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加用户按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色区域 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @closed="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRoles" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 存储角色列表
      rolesList: [],
      // 控制添加角色对话框显示隐藏
      addDialogVisible: false,
      // 角色列表数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色列表校验规则
      addFormRoles: {
        roleName: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'blur'
        }],
        roleDesc: [{
          required: true,
          message: '请输入角色描述',
          trigger: 'blur'
        }]
      }
    }
  },
  // 生命周期函数，提前渲染列表
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 监听关闭添加角色对话框关闭时清空添加列表
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击添加角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        const {
          data: res
        } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.getRolesList()
        this.$message.success('添加角色成功！')
        this.addDialogVisible = false
      })
    }
  }
}

</script>

<style lang="less" scoped>
</style>
