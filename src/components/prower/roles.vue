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
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-row :class="['dbbottom', i1 === 0 ? 'dbtop' : '', 'veenter']" v-for="(item1, i1) in scope.row.children"
              :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeitemById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级、三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                  :class="[i2 == 0 ? '' : 'dbtop', 'veenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeitemById(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable
                      @close="removeitemById(scope.row, item3.id)">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 作用域插槽 -->

            <!-- 编辑 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <!-- 删除 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除
            </el-button>
            <!-- 分配权限 -->
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
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

      <!-- 编辑角色区域 -->
      <el-dialog title="编辑角色" :visible.sync="editDialogViesible" width="50%">
        <!-- 角色编辑主题区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogViesible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>

    <!-- 权限分配对话框 -->
    <el-dialog title="提示" :visible.sync="JurisdictionDialogViesible" width="50%" @close="setRightDialogVisible">
      <!-- 树形控件主体 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all
        :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="JurisdictionDialogViesible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
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
      },
      // 控制编辑角色对话框显示隐藏
      editDialogViesible: false,
      // 储存修改角色表单
      editForm: {},
      // 修改角色校验表单
      editFormRules: {
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
      },
      // 控制分配权限对话框显示隐藏
      JurisdictionDialogViesible: false,
      // 存储权限数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 权限分配的共享ID
      rolesID: ''
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
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      this.editDialogViesible = true
      // console.log(id)
      const {
        data: res
      } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息错误')
      }

      this.editForm = res.data
    },
    // 点击修改角色信息
    editRolesInfo () {
      this.$refs.editFormRef.validate(async valid => {
        const {
          data: res
        } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败！')
        }
        this.getRolesList()
        this.$message.success('修改角色信息成功！')
        this.editDialogViesible = false
      })
    },
    // 点击删除角色
    async removeUserById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {
        data: res
      } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getRolesList()
    },
    // 删除权限
    async removeitemById (roleid, rightid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {
        data: res
      } = await this.$http.delete(`roles/${roleid.id}/rights/${rightid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      roleid.children = res.data
    },
    // 展示权限对话框
    async showSetRightDialog (role) {
      this.rolesID = role
      const {
        data: res
      } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取到的数据存放到数组中
      this.rightslist = res.data
      // 递归获取的三级节点ID
      this.getLeafKeys(role, this.defKeys)
      // 关闭对话框
      this.JurisdictionDialogViesible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的ID，并保存到 defkeys 属性，则是节点
    // 默认选中的权限分配
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限的对话框关闭事件(关闭时清空数组)
    setRightDialogVisible () {
      this.defKeys = []
    },
    // 添加角色权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {
        data: res
      } = await this.$http.post(`roles/${this.rolesID.id}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$http.error('添加权限失败！')
      }
      this.$message.success('添加权限成功！')
      this.getRolesList()
      this.JurisdictionDialogViesible = false
    }
  }
}

</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .dbtop {
    border-top: 1px solid #eee;
  }

  .dbbottom {
    border-bottom: 1px solid #eee;
  }

  .veenter {
    display: flex;
    align-items: center;
  }

</style>
