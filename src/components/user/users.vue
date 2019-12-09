<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditdialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
            </el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页页码区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogViesible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input disabled v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogViesible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectdRoleId" placeholder="请选择">
            <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义邮箱校验规则
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮箱'))
    }
    // 自定义手机号校验规则
    let checkMobile = (rule, value, cb) => {
      const regEmail = /^1\d{10}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 存储用户表单数据
      userlist: [],
      total: 0,
      // 控制添加用户对话框显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3~10 个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在 6~15 个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 存储修改用户表单
      editForm: {},
      // 控制修改用户对话框显示与隐藏
      editDialogViesible: false,
      // 修改表单校验规则
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolelist: [],
      // 已获取到的角色列表
      selectdRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 pagenum 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关的变化
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state // 如果更新失败，取反保证按钮不会更改
        return this.$message.error('更新状态失败！')
      }
      this.$message.success('更新状态成功！')
    },
    // 监听添加用户对话框关闭事件（关闭时清空表单）
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.getUserList()
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false
      })
    },
    // 点击弹出用户修改对话框
    async showEditdialog (id) {
      this.editDialogViesible = true
      const { data: res } = await this.$http.put('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败！')
      }
      this.editForm = res.data
      this.editDialogViesible = true
    },
    // 监听修改用户表单对话框关闭事件（关闭时清空表单）
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改用户信息
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败！')
        }
        this.editDialogViesible = false
        this.getUserList()
        this.$message.success('修改用户信息成功！')
      })
    },
    // 根据ID删除对应的用户
    async removeUserById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 点击展开分配角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色失败！')
      }
      this.rolelist = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      if (!this.selectdRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectdRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败！')
      }
      this.$message.success('分配角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听关闭对话框时清空列表
    setRoleDialogClosed () {
      this.selectdRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped></style>
