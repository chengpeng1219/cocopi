# 版本与恢复

项目每次发布修改时使用 `package.json` 中的版本号，并在 `.versions/` 下保存完整源码快照。

## 创建快照

```powershell
$env:VERSION_DESCRIPTION="本次修改说明"
npm run version:snapshot
```

快照目录格式：

```text
.versions/v1.0.14-20261123T092429Z/
```

目录中包含 `src`、`tests`、`server`、`scripts`、`public`、构建配置、包文件、说明文档和 `manifest.json`。

## 恢复指定版本

先确认目标快照目录，再将其中的源码文件覆盖回项目根目录：

```powershell
$snapshot = ".versions/v1.0.14-20261123T092429Z"
Copy-Item "$snapshot/*" "." -Recurse -Force
```

恢复前建议先为当前代码创建新快照。
