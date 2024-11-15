# Changelog


## v0.1.1

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- 弃用ElectronMSTMain全局变量，改为StoreManager的私有属性，增加安全性，优化逻辑 ([1666a6b](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/1666a6b))

### 📖 Documentation

- 更新 readme ([92a078c](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/92a078c))
- 更新readme ([fc46f00](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/fc46f00))

### 🏡 Chore

- **release:** V0.1.0 ([527c5d2](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/527c5d2))
- 更新package.json ([ca24207](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/ca24207))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.1.0

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.0.2...v0.1.0)

### 🚀 Enhancements

- 完善demo ([99d44ea](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/99d44ea))

### 📖 Documentation

- 更新文档 ([8ac89d8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/8ac89d8))
- 更新 readme ([92a078c](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/92a078c))

### 🏡 Chore

- **release:** V0.0.2-20241107-213530-5085b43 ([062f6e7](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/062f6e7))
- 解决发包后的类型提示问题 ([fac8f95](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/fac8f95))
- **release:** V0.0.2 ([2d9c4a8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/2d9c4a8))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.0.4

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.0.2...v0.0.4)

### 🚀 Enhancements

- 完善demo ([99d44ea](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/99d44ea))

### 📖 Documentation

- 更新文档 ([8ac89d8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/8ac89d8))

### 🏡 Chore

- **release:** V0.0.2-20241107-213530-5085b43 ([062f6e7](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/062f6e7))
- 解决发包后的类型提示问题 ([fac8f95](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/fac8f95))
- **release:** V0.0.2 ([2d9c4a8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/2d9c4a8))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.0.2

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.0.2-20241107-213530-5085b43...v0.0.2)

### 🚀 Enhancements

- 完善demo ([99d44ea](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/99d44ea))

### 📖 Documentation

- 更新文档 ([8ac89d8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/8ac89d8))

### 🏡 Chore

- 解决发包后的类型提示问题 ([fac8f95](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/fac8f95))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.0.2-20241107-214730-fac8f95

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.0.2-20241107-213530-5085b43...v0.0.2-20241107-214730-fac8f95)

### 🏡 Chore

- 解决发包后的类型提示问题 ([fac8f95](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/fac8f95))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.0.2-20241107-213530-5085b43

[compare changes](https://github.com/BanShan-Alec/electron-mobx-state-tree/compare/v0.0.2-20241106-150845-59f49c2...v0.0.2-20241107-213530-5085b43)

### 🚀 Enhancements

- 新增onPatchChange ([d7b7fe4](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/d7b7fe4))
- 新增destroyStore ([2c7ae12](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/2c7ae12))
- 优化主进程initMST的逻辑；简化sdk调用的复杂度 ([3dbbb3f](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/3dbbb3f))
- 向外暴露createStore ([20ce5ce](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/20ce5ce))
- 补充多Store demo ([652cdd4](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/652cdd4))
- 完成打包Lib逻辑 ([5085b43](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/5085b43))

### 🩹 Fixes

- 修复store嵌套，action不同步的问题；修复proxy后JSON序列化失效 ([c2e69e8](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/c2e69e8))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

## v0.0.2-20241106-150845-59f49c2


### 🚀 Enhancements

- 去除冗余依赖 ([38b3ca0](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/38b3ca0))
- 引入electronAPI相关preload逻辑 ([d382f12](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/d382f12))
- 引入Mobx相关依赖 ([46318d7](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/46318d7))
- 完成初版mst逻辑 ([d476247](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/d476247))

### 🏡 Chore

- 更新description ([59f49c2](https://github.com/BanShan-Alec/electron-mobx-state-tree/commit/59f49c2))

### ❤️ Contributors

- 半山Alec <627649674@qq.com>

