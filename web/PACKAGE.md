# Frontend package

Frontend module Customer diekspos sebagai package `@wasnaker/module-customer`
dari repository Git ini. Package dipasang langsung dari GitHub pada ref yang
dikunci; publikasi ke npm registry tidak diperlukan.

## Release / versioning

1. Implementasi dan uji perubahan di repository ini.
2. Buat commit lalu tag release (atau gunakan commit SHA immutable).
3. Di host, jalankan:

   ```bash
   npm run module:add -- customer --ref <tag-atau-commit-sha>
   ```

4. Commit perubahan `package.json` dan `package-lock.json` di host.

## Package exports

- `@wasnaker/module-customer`: public page/component API
- `@wasnaker/module-customer/manifest`: module manifest
- `@wasnaker/module-customer/locales/<language>`: locale resource JSON

Host mentranspilasi package TypeScript dan menyediakan runtime peer dependencies
serta alias `@/*`. Source module tidak disalin ke repository host.
