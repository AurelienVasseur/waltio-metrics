# Waltio Analytics

Parse transactions exported from Waltio and generate analytics files.

0. Setup

```bash
pnpm install
```

1. Export transactions

Generate and download export file from Waltio (`Mon rapport fiscal > Exports > Exporter`).

2. Add the exported file in the `data` folder

💡The file must be named `export_waltio.xlsx`.

3. Run

```bash
pnpm start
```

Results files will be saved in the `output` folder.