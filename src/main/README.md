# Main Process Source Code

All code relatived to `main` process will be store in this directory

## Notice

**Avoid import denpendency to renderer process**

Do NOT import any module or package which is from `renderer` directory. Keep `renderer` process code only run in `Browser(renderer)` environment.