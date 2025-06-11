<template>
  <div class="h-full bg-white p-2.5 flex flex-col">
    <el-table :data="list" :border="true" :set-table="[]" title="part columns default hidden">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="Name" width="180" :active="false"></el-table-column>
      <el-table-column prop="age" label="Age" width="100"></el-table-column>
      <el-table-column prop="address" label="Address"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="{ row }">
          <el-button type="primary" link size="small">Edit</el-button>
          <el-button type="danger" link size="small">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { Plus } from '@element-plus/icons-vue';
  export default {
    name: 'Index',
    components: {
      Plus
    },
    data() {
      return {
        list: [
          {
            id: 1,
            name: 'John Doe',
            age: 30,
            address: '123 Main St'
          },
          {
            id: 2,
            name: 'Jane Smith',
            age: 25,
            address: '456 Elm St'
          },
          {
            id: 3,
            name: 'Alice Johnson',
            age: 28,
            address: '789 Maple Ave'
          }
        ]
      };
    }
  };
</script>
